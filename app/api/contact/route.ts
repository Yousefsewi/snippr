import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { mailerReady, sendMail, esc, isPlainEmail, rateLimited, clientIp } from '@/lib/mailer'
import { SUPPORT_EMAIL } from '@/lib/site'

// Contact form (app/contact). Sends the message to Snippr's support inbox only —
// never to an address taken from the request — with the sender as reply-to.
const TOPICS = ['account', 'bookings', 'billing', 'idea', 'other'] as const

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { name, email, topic, message, lang, website } = body as Record<string, unknown>

  // hidden field only bots fill in: pretend it worked
  if (typeof website === 'string' && website.trim()) return NextResponse.json({ ok: true })

  const n = typeof name === 'string' ? name.trim() : ''
  const e = typeof email === 'string' ? email.trim().toLowerCase() : ''
  const m = typeof message === 'string' ? message.trim() : ''
  const tp = TOPICS.includes(topic as (typeof TOPICS)[number]) ? (topic as string) : 'other'
  if (!n || n.length > 100) return NextResponse.json({ error: 'name' }, { status: 400 })
  if (!isPlainEmail(e)) return NextResponse.json({ error: 'email' }, { status: 400 })
  if (m.length < 10 || m.length > 3000) return NextResponse.json({ error: 'message' }, { status: 400 })

  if (rateLimited(`contact:${clientIp(req.headers)}`, 5, 60 * 60000)) return NextResponse.json({ error: 'rate' }, { status: 429 })

  const subject = `Snippr contact · ${tp} · ${n}`.slice(0, 150)
  const html = `
    <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 560px; color: #1d1d1f;">
      <h2 style="margin: 0 0 12px;">New message from the contact form</h2>
      <table style="border-collapse: collapse; font-size: 14px;">
        <tr><td style="padding: 4px 12px 4px 0; color: #888;">Name</td><td style="padding: 4px 0; font-weight: 600;">${esc(n)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #888;">Email</td><td style="padding: 4px 0; font-weight: 600;">${esc(e)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #888;">Topic</td><td style="padding: 4px 0;">${esc(tp)}</td></tr>
        <tr><td style="padding: 4px 12px 4px 0; color: #888;">Language</td><td style="padding: 4px 0;">${esc(typeof lang === 'string' ? lang.slice(0, 5) : '-')}</td></tr>
      </table>
      <p style="white-space: pre-wrap; line-height: 1.55; background: #f5f5f7; padding: 14px 16px; border-radius: 12px; margin-top: 16px;">${esc(m)}</p>
      <p style="color: #999; font-size: 12px;">Reply to this email to answer ${esc(n)} directly.</p>
    </div>`

  try {
    const apiKey = process.env.RESEND_API_KEY
    if (mailerReady) await sendMail(SUPPORT_EMAIL, subject, html, { replyTo: e })
    else if (apiKey) await new Resend(apiKey).emails.send({ from: process.env.EMAIL_FROM || 'Snippr <onboarding@resend.dev>', to: SUPPORT_EMAIL, replyTo: e, subject, html })
    else return NextResponse.json({ error: 'server' }, { status: 500 })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('contact:', err instanceof Error ? err.message : err)
    return NextResponse.json({ error: 'server' }, { status: 502 })
  }
}
