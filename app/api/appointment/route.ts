import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'
import { mailerReady, sendMail, buttonEmail, rateLimited, isPlainEmail, SITE_URL } from '@/lib/mailer'
import { validManageToken } from '@/lib/manage-link'
import { SUPPORT_EMAIL } from '@/lib/site'

// The client's own appointment page (/appointment), opened from the link in their emails.
// GET shows the booking, POST cancels it. Both need the signed token from the email
// (lib/manage-link.ts), so nobody can look up or cancel someone else's appointment.
// Cancelling is possible until the appointment starts; the barber gets a push and an email.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

type Row = {
  id: string; status: string; customer_name: string; start_time: string; end_time: string
  services: { name: string } | null
  barbers: { user_id: string; name: string; slug: string | null; push_subscription: webpush.PushSubscription | null; push_token: string | null } | null
}

const ip = (req: NextRequest) => req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

async function load(id: unknown, token: unknown) {
  if (!supabaseServiceKey) return { error: 'server not configured', status: 503 } as const
  if (typeof id !== 'string' || !UUID.test(id) || !validManageToken(id, token)) return { error: 'invalid link', status: 400 } as const
  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data } = await supabase.from('appointments')
    .select('id, status, customer_name, start_time, end_time, services(name), barbers(user_id, name, slug, push_subscription, push_token)')
    .eq('id', id).maybeSingle()
  if (!data) return { error: 'not found', status: 404 } as const
  return { supabase, a: data as unknown as Row }
}

const cancellable = (a: Row) => (a.status === 'pending' || a.status === 'confirmed') && new Date(a.start_time).getTime() > Date.now()

export async function GET(req: NextRequest) {
  if (rateLimited(`appt-view:${ip(req)}`, 60, 10 * 60000)) return NextResponse.json({ error: 'too many requests' }, { status: 429 })
  const q = req.nextUrl.searchParams
  const r = await load(q.get('id'), q.get('t'))
  if ('error' in r) return NextResponse.json({ error: r.error }, { status: r.status })
  const { a } = r
  return NextResponse.json({
    client: a.customer_name, barber: a.barbers?.name ?? '', service: a.services?.name ?? null,
    start: a.start_time, end: a.end_time, status: a.status,
    bookUrl: a.barbers?.slug ? `/b/${a.barbers.slug}` : null,
    canCancel: cancellable(a),
    past: new Date(a.start_time).getTime() <= Date.now(),
  })
}

export async function POST(req: NextRequest) {
  if (rateLimited(`appt-cancel:${ip(req)}`, 10, 10 * 60000)) return NextResponse.json({ error: 'too many requests' }, { status: 429 })
  const { id, t } = await req.json().catch(() => ({}))
  const r = await load(id, t)
  if ('error' in r) return NextResponse.json({ error: r.error }, { status: r.status })
  const { supabase, a } = r
  if (a.status === 'cancelled') return NextResponse.json({ cancelled: true })
  if (!cancellable(a)) return NextResponse.json({ error: 'too late' }, { status: 409 })

  // only flip it if it is still open (two quick clicks cancel once)
  const { data: done, error } = await supabase.from('appointments')
    .update({ status: 'cancelled' })
    .eq('id', a.id).in('status', ['pending', 'confirmed'])
    .select('id').maybeSingle()
  if (error) { console.error('appointment cancel:', error.message); return NextResponse.json({ error: 'could not cancel' }, { status: 500 }) }
  if (!done) return NextResponse.json({ cancelled: true })

  // tell the barber (best effort: the cancellation itself already happened)
  const start = new Date(a.start_time)
  const when = `${start.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Amsterdam' })} ${start.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' })}`
  const title = 'Randevu iptal edildi'
  const body = `${a.customer_name} — ${when} randevusunu iptal etti. O saat tekrar boş.`
  const b = a.barbers

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY, privateKey = process.env.VAPID_PRIVATE_KEY
  if (b?.push_subscription && publicKey && privateKey) {
    try {
      webpush.setVapidDetails(`mailto:${SUPPORT_EMAIL}`, publicKey, privateKey)
      await webpush.sendNotification(b.push_subscription, JSON.stringify({ title, body, url: '/dashboard/calendar' }))
    } catch (err) { console.error('cancel push:', err instanceof Error ? err.message : err) }
  }
  if (b?.push_token) {
    try {
      await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ to: b.push_token, title, body, sound: 'default' }),
      })
    } catch (err) { console.error('cancel expo push:', err instanceof Error ? err.message : err) }
  }
  if (b?.user_id && mailerReady) {
    try {
      const { data: u } = await supabase.auth.admin.getUserById(b.user_id)
      const to = u.user?.email
      if (to && isPlainEmail(to)) {
        const svc = a.services?.name ? ` (${a.services.name})` : ''
        await sendMail(to, `${a.customer_name} randevusunu iptal etti`,
          buttonEmail(title, `${a.customer_name}, ${when}${svc} randevusunu iptal etti. O saat takviminde tekrar boş.`, 'Takvimi aç', `${SITE_URL}/dashboard/calendar`,
            'Müşteri, randevu e-postasındaki linkle kendisi iptal etti.'))
      }
    } catch (err) { console.error('cancel email:', err instanceof Error ? err.message : err) }
  }

  return NextResponse.json({ cancelled: true })
}
