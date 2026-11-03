import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { mailerReady, sendMail, buttonEmail, SITE_URL, rateLimited, clientIp } from '@/lib/mailer'

// "Send the confirmation email again" (sign-up and login pages).
// Only accounts that are not confirmed yet get an email; the answer is always "ok", so it
// never reveals which addresses have an account. The link opens /auth/confirm (type=magiclink),
// which confirms the email and signs the person in.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(req: NextRequest) {
  if (!mailerReady || !supabaseServiceKey) return NextResponse.json({ error: 'email not configured' }, { status: 503 })

  const { email } = await req.json().catch(() => ({}))
  const cleanEmail = String(email ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return NextResponse.json({ code: 'invalid_email', error: 'Please enter a valid email address.' }, { status: 400 })

  // 5 per network and 3 per address per hour
  if (rateLimited(`resend-ip:${clientIp(req.headers)}`, 5, 60 * 60 * 1000) || rateLimited(`resend-email:${cleanEmail}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ code: 'too_many', error: 'Too many requests. Please try again in an hour.' }, { status: 429 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data, error } = await supabase.auth.admin.generateLink({ type: 'magiclink', email: cleanEmail })
  // no such account, or already confirmed → same answer, nothing sent
  if (error || !data.properties?.hashed_token || data.user?.email_confirmed_at) return NextResponse.json({ ok: true })

  const name = String(data.user?.user_metadata?.full_name ?? '').trim()
  const link = `${SITE_URL}/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=magiclink`
  try {
    await sendMail(
      cleanEmail,
      'Confirm your Snippr account',
      buttonEmail(
        'Confirm your email',
        `Hi ${name || 'there'}, here is a new link to confirm your email address and open your Snippr dashboard. It works once and expires after an hour.`,
        'Confirm my email',
        link,
        "If you didn't create a Snippr account, you can ignore this email.",
      ),
    )
  } catch (err) {
    console.error('resend-confirmation: email failed:', err)
    return NextResponse.json({ code: 'mail_failed', error: 'We could not send the email. Please try again in a moment.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
