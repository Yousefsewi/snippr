import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { mailerReady, sendMail, SITE_URL, rateLimited, isPlainEmail } from '@/lib/mailer'
import { isOn, messageHtml, STATUS_KINDS, type MsgKind, type MsgSettings } from '@/lib/messages'

// Sends one automatic email to a client after the barber changes an appointment
// (confirmed, cancelled, completed → thanks, tip). The caller proves who they are with
// their session token, and the appointment must belong to them. Each kind is sent at
// most once per appointment (messages_sent), and only if the barber switched it on.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const safeTimeZone = (tz: unknown) => {
  if (typeof tz !== 'string') return 'UTC'
  try { new Intl.DateTimeFormat('en-GB', { timeZone: tz }); return tz } catch { return 'UTC' }
}

type Row = {
  id: string; status: string; customer_name: string; customer_email: string | null; start_time: string
  tip_amount?: number | null; messages_sent?: string[] | null
  services: { name: string } | null
  barbers: { user_id: string; name: string; slug: string; message_settings: MsgSettings | null; google_review_url: string | null } | null
}

export async function POST(req: NextRequest) {
  if (!supabaseServiceKey) return NextResponse.json({ skipped: 'server not configured' })

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: 'not signed in' }, { status: 401 })

  const { appointmentId, kind, timeZone, lang } = await req.json().catch(() => ({}))
  if (typeof appointmentId !== 'string' || !UUID.test(appointmentId) || !STATUS_KINDS.includes(kind)) {
    return NextResponse.json({ error: 'invalid request' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'session expired' }, { status: 401 })
  if (rateLimited(`status:${user.id}`, 60, 60 * 60000)) return NextResponse.json({ error: 'too many emails' }, { status: 429 })

  const { data, error } = await supabase.from('appointments')
    .select('id, status, customer_name, customer_email, start_time, tip_amount, messages_sent, services(name), barbers(user_id, name, slug, message_settings, google_review_url)')
    .eq('id', appointmentId).maybeSingle()
  if (error) return NextResponse.json({ skipped: 'run supabase/messages.sql' }) // columns missing
  const a = data as unknown as Row | null
  if (!a || a.barbers?.user_id !== user.id) return NextResponse.json({ error: 'not found' }, { status: 404 })

  const k = kind as MsgKind
  // the appointment must really be in the state the email talks about
  const fits = k === 'confirmed' ? a.status === 'confirmed'
    : k === 'cancelled' ? a.status === 'cancelled'
    : k === 'thanks' ? a.status === 'completed'
    : k === 'tip' ? a.status === 'completed' && Number(a.tip_amount ?? 0) > 0
    : false
  if (!fits) return NextResponse.json({ skipped: 'status does not match' })
  if (!isOn(a.barbers.message_settings, k)) return NextResponse.json({ skipped: 'switched off' })
  if (!a.customer_email || !isPlainEmail(a.customer_email)) return NextResponse.json({ skipped: 'no valid client email' })
  if ((a.messages_sent ?? []).includes(k)) return NextResponse.json({ skipped: 'already sent' })
  if (new Date(a.start_time).getTime() < Date.now() - 14 * 86400000) return NextResponse.json({ skipped: 'too old' })

  // claim it first so two quick clicks never send twice
  const { data: claimed } = await supabase.from('appointments')
    .update({ messages_sent: [...(a.messages_sent ?? []), k] })
    .eq('id', a.id).not('messages_sent', 'cs', `{${k}}`)
    .select('id').maybeSingle()
  if (!claimed) return NextResponse.json({ skipped: 'already sent' })

  const tz = safeTimeZone(timeZone)
  const l = lang === 'tr' ? 'tr' : 'en'
  const locale = l === 'tr' ? 'tr-TR' : 'en-GB'
  const start = new Date(a.start_time)
  const msg = messageHtml(k, l, {
    client: a.customer_name, barber: a.barbers.name || 'Snippr', service: a.services?.name,
    date: start.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: tz }),
    time: start.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: tz }),
    bookUrl: `${SITE_URL}/b/${a.barbers.slug}`, reviewUrl: a.barbers.google_review_url,
    tip: a.tip_amount ? String(a.tip_amount) : null,
  })

  try {
    const apiKey = process.env.RESEND_API_KEY
    if (mailerReady) await sendMail(a.customer_email, msg.subject, msg.html)
    else if (apiKey) await new Resend(apiKey).emails.send({ from: process.env.EMAIL_FROM || 'Snippr <onboarding@resend.dev>', to: a.customer_email, subject: msg.subject, html: msg.html })
    else throw new Error('email not configured')
    return NextResponse.json({ sent: k })
  } catch (err) {
    // let it be retried later
    await supabase.from('appointments').update({ messages_sent: a.messages_sent ?? [] }).eq('id', a.id)
    console.error('notify-status:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'could not send' }, { status: 502 })
  }
}
