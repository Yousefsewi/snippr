import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { mailerReady, sendMail, esc, isPlainEmail } from '@/lib/mailer'
import { bookingReceivedHtml, normLang, LOCALE } from '@/lib/messages'
import { SUPPORT_EMAIL } from '@/lib/site'
import { FIRST_VISIT_DISCOUNT } from '@/lib/features'
import webpush from 'web-push'

// Called by the public booking page right after a booking is made.
// It only takes the appointment id: recipient, names and times are read from the
// database (service role), so this route can't be used to send arbitrary emails or
// pushes. Each appointment is notified at most once, and only within 10 minutes of
// being created (notified_at is claimed atomically below).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// The customer's own timezone, only used to format the date/time in their email
const safeTimeZone = (tz: unknown) => {
  if (typeof tz !== 'string') return 'UTC'
  try { new Intl.DateTimeFormat('en-GB', { timeZone: tz }); return tz } catch { return 'UTC' }
}

type Claimed = {
  customer_name: string
  customer_email: string | null
  start_time: string
  discount_percent?: number // first-visit discount (absent until first-visit-discount.sql is run)
  services: { name: string; price: number } | null
  barbers: { name: string; push_subscription: webpush.PushSubscription | null; push_token: string | null } | null
}

export async function POST(req: NextRequest) {
  if (!supabaseServiceKey) return NextResponse.json({ skipped: true, reason: 'SUPABASE_SERVICE_ROLE_KEY not set' })

  const { appointmentId, timeZone, lang } = await req.json().catch(() => ({}))
  const cl = normLang(lang) // the client's language on the booking page
  if (typeof appointmentId !== 'string' || !UUID.test(appointmentId)) {
    return NextResponse.json({ error: 'invalid appointment' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const tenMinutesAgo = new Date(Date.now() - 10 * 60000).toISOString()
  const { data, error } = await supabase
    .from('appointments')
    .update({ notified_at: new Date().toISOString() })
    .eq('id', appointmentId)
    .is('notified_at', null)
    .gt('created_at', tenMinutesAgo)
    .select('*, services(name, price), barbers(name, push_subscription, push_token)')
    .maybeSingle()

  if (error) {
    console.error('notify-booking:', error.message) // e.g. security-fixes.sql not run yet (no notified_at column)
    return NextResponse.json({ error: 'could not load appointment' }, { status: 500 })
  }
  if (!data) return NextResponse.json({ skipped: true, reason: 'unknown, old or already notified appointment' }, { status: 404 })

  const appt = data as unknown as Claimed
  const tz = safeTimeZone(timeZone)
  const start = new Date(appt.start_time)
  const niceDate = start.toLocaleDateString(LOCALE[cl], { weekday: 'long', day: 'numeric', month: 'long', timeZone: tz })
  const niceTime = start.toLocaleTimeString(LOCALE[cl], { hour: '2-digit', minute: '2-digit', timeZone: tz })
  const barberName = appt.barbers?.name || 'Snippr'
  const discount = FIRST_VISIT_DISCOUNT ? (appt.discount_percent ?? 0) : 0
  const price = appt.services?.price ?? 0
  const money = (v: number) => (Math.round(v * 100) / 100).toFixed(2)
  const result: { email?: string; web?: string; mobile?: string } = {}

  // 1) Confirmation email to the customer: Gmail (lib/mailer.ts) if set up, else Resend
  const apiKey = process.env.RESEND_API_KEY
  if (!appt.customer_email) result.email = 'no email'
  else if (!isPlainEmail(appt.customer_email)) result.email = 'invalid email'
  else if (!mailerReady && !apiKey) result.email = 'email not configured'
  else {
    try {
      const extraRow = discount
        ? `<tr><td style="padding: 6px 0; color: #888;">🎁</td><td style="padding: 6px 0; font-weight: 600; color: #be185d;">-${discount}%${price ? ` (${esc(money(price * (100 - discount) / 100))})` : ''}</td></tr>`
        : ''
      const { subject, html } = bookingReceivedHtml(cl, { client: appt.customer_name, barber: barberName, service: appt.services?.name, date: niceDate, time: niceTime, extraRow })
      if (mailerReady) await sendMail(appt.customer_email, subject, html)
      else await new Resend(apiKey).emails.send({ from: process.env.EMAIL_FROM || 'Snippr <onboarding@resend.dev>', to: appt.customer_email, subject, html })
      result.email = 'sent'
    } catch (err) {
      result.email = err instanceof Error ? err.message : 'failed'
    }
  }

  // 2) Push to the barber: browser (web dashboard) and mobile app (Expo)
  const title = 'Yeni randevu 🎉'
  const body = `${appt.customer_name} — ${niceDate} ${niceTime} için randevu aldı.`

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  const privateKey = process.env.VAPID_PRIVATE_KEY
  if (!appt.barbers?.push_subscription) result.web = 'not enabled'
  else if (!publicKey || !privateKey) result.web = 'VAPID keys not set'
  else {
    try {
      webpush.setVapidDetails(`mailto:${SUPPORT_EMAIL}`, publicKey, privateKey)
      await webpush.sendNotification(appt.barbers.push_subscription, JSON.stringify({ title, body, url: '/dashboard/calendar' }))
      result.web = 'sent'
    } catch (err) {
      result.web = err instanceof Error ? err.message : 'failed'
    }
  }

  if (!appt.barbers?.push_token) result.mobile = 'not enabled'
  else {
    try {
      const res = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ to: appt.barbers.push_token, title, body, sound: 'default' }),
      })
      result.mobile = res.ok ? 'sent' : `expo ${res.status}`
    } catch (err) {
      result.mobile = err instanceof Error ? err.message : 'failed'
    }
  }

  return NextResponse.json(result)
}
