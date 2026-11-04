import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { mailerReady, sendMail, isPlainEmail, rateLimited, clientIp } from '@/lib/mailer'
import { SUPPORT_EMAIL } from '@/lib/site'
import { emailLayout } from '@/lib/email-layout'

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
  const html = emailLayout({
    preheader: m.slice(0, 120), heading: 'New message from the contact form',
    text: `${n} wrote to Snippr. Reply to this email to answer them directly.`,
    details: [
      { label: 'Name', value: n }, { label: 'Email', value: e },
      { label: 'Topic', value: tp, strong: false }, { label: 'Language', value: typeof lang === 'string' ? lang.slice(0, 5) : '-', strong: false },
    ],
    quote: m,
    footer: ['Sent from the contact form on snipprcalendar.com'],
  })

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
