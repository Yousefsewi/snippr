import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
import { mailerReady, sendMail, SITE_URL, isPlainEmail, rateLimited, clientIp } from '@/lib/mailer'
import { isOn, messageHtml, type MsgKind, type MsgSettings } from '@/lib/messages'

// Daily reminder job (vercel.json → crons). Emails clients whose appointment is
// tomorrow (remind1d) or in 3 days (remind3d), if the barber has that reminder on.
// Each reminder is sent at most once per appointment (messages_sent), so running this
// more often than planned can never send duplicates or anything that isn't due.
// If CRON_SECRET is set, Vercel's call must carry it.
// Vercel runs it at 08:00 and 09:00 UTC (vercel.json); only the run that falls at
// 10:00 in the Netherlands sends, so it's 10:00 there in both summer and winter time.
export const dynamic = 'force-dynamic'
export const maxDuration = 60

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const HOUR = 3600000

// which appointments each reminder covers, measured from the time the job runs
const WINDOWS: { kind: MsgKind; from: number; to: number }[] = [
  { kind: 'remind1d', from: 12 * HOUR, to: 36 * HOUR },
  { kind: 'remind3d', from: 60 * HOUR, to: 84 * HOUR },
]

type Row = {
  id: string; customer_name: string; customer_email: string | null; start_time: string; status: string
  messages_sent: string[] | null; client_lang?: string | null; client_tz?: string | null
  services: { name: string } | null
  barbers: { name: string; slug: string; message_settings: MsgSettings | null } | null
}

const safeTimeZone = (tz: unknown) => {
  if (typeof tz !== 'string' || !tz) return 'Europe/Amsterdam'
  try { new Intl.DateTimeFormat('en-GB', { timeZone: tz }); return tz } catch { return 'Europe/Amsterdam' }
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (secret && req.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }
  if (!secret && rateLimited(`cron:${clientIp(req.headers)}`, 6, HOUR)) return NextResponse.json({ error: 'too many requests' }, { status: 429 })
  if ((req.headers.get('user-agent') ?? '').startsWith('vercel-cron')) {
    const nlHour = Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hour: '2-digit', hourCycle: 'h23' }).format(new Date()))
    if (nlHour !== 10) return NextResponse.json({ skipped: `not 10:00 in the Netherlands (now ${nlHour}:00)` })
  }
  if (!supabaseServiceKey) return NextResponse.json({ skipped: 'server not configured' })
  const apiKey = process.env.RESEND_API_KEY
  if (!mailerReady && !apiKey) return NextResponse.json({ skipped: 'email not configured' })

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const now = Date.now()
  const report: Record<string, number> = {}

  for (const w of WINDOWS) {
    const { data, error } = await supabase.from('appointments')
      .select('id, customer_name, customer_email, start_time, status, messages_sent, client_lang, client_tz, services(name), barbers(name, slug, message_settings)')
      .in('status', ['pending', 'confirmed'])
      .not('customer_email', 'is', null)
      .not('messages_sent', 'cs', `{${w.kind}}`)
      .gte('start_time', new Date(now + w.from).toISOString())
      .lt('start_time', new Date(now + w.to).toISOString())
      .limit(300)
    if (error) { console.error('reminders:', error.message); return NextResponse.json({ error: 'run supabase/reminders.sql' }, { status: 500 }) }

    let sent = 0
    for (const a of (data ?? []) as unknown as Row[]) {
      if (!a.barbers || !isOn(a.barbers.message_settings, w.kind)) continue
      if (a.customer_name.startsWith('⛔') || !isPlainEmail(a.customer_email)) continue

      // claim first so a parallel run can't send it again
      const { data: claimed } = await supabase.from('appointments')
        .update({ messages_sent: [...(a.messages_sent ?? []), w.kind] })
        .eq('id', a.id).not('messages_sent', 'cs', `{${w.kind}}`)
        .select('id').maybeSingle()
      if (!claimed) continue

      const lang = a.client_lang === 'en' ? 'en' : 'tr'
      const tz = safeTimeZone(a.client_tz)
      const locale = lang === 'tr' ? 'tr-TR' : 'en-GB'
      const start = new Date(a.start_time)
      const msg = messageHtml(w.kind, lang, {
        client: a.customer_name, barber: a.barbers.name || 'Snippr', service: a.services?.name,
        date: start.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: tz }),
        time: start.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit', timeZone: tz }),
        bookUrl: `${SITE_URL}/b/${a.barbers.slug}`,
      })
      try {
        if (mailerReady) await sendMail(a.customer_email, msg.subject, msg.html)
        else await new Resend(apiKey).emails.send({ from: process.env.EMAIL_FROM || 'Snippr <onboarding@resend.dev>', to: a.customer_email, subject: msg.subject, html: msg.html })
        sent++
      } catch (err) {
        // give it back so the next run can try again
        await supabase.from('appointments').update({ messages_sent: a.messages_sent ?? [] }).eq('id', a.id)
        console.error('reminders send:', err instanceof Error ? err.message : err)
      }
    }
    report[w.kind] = sent
  }
  return NextResponse.json({ ok: true, sent: report })
}
