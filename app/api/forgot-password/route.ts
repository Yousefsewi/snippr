import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { mailerReady, sendMail, buttonEmail, SITE_URL, rateLimited, clientIp } from '@/lib/mailer'

// Sends the password reset email through Gmail (lib/mailer.ts).
// Always answers "ok" for a valid request, so it never reveals which emails have an account.
// Returns 503 when Gmail isn't configured; the page then falls back to Supabase's own mailer.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(req: NextRequest) {
  if (!mailerReady || !supabaseServiceKey) return NextResponse.json({ error: 'email not configured' }, { status: 503 })

  const { email } = await req.json().catch(() => ({}))
  const cleanEmail = String(email ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })

  // 5 requests per network per hour, 3 per email address per hour
  if (rateLimited(`forgot-ip:${clientIp(req.headers)}`, 5, 60 * 60 * 1000) || rateLimited(`forgot-email:${cleanEmail}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many reset requests. Please try again in an hour.' }, { status: 429 })
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data, error } = await supabase.auth.admin.generateLink({ type: 'recovery', email: cleanEmail })
  // No such account → same answer as success
  if (error || !data.properties?.hashed_token) return NextResponse.json({ ok: true })

  const link = `${SITE_URL}/reset-password?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=recovery`
  try {
    await sendMail(
      cleanEmail,
      'Reset your Snippr password',
      buttonEmail(
        'Set a new password',
        'Someone (hopefully you) asked to reset the password of your Snippr account. Click the button below to choose a new one. The link works once and expires after an hour.',
        'Choose a new password',
        link,
        "If you didn't ask for this, you can ignore this email — your password stays the same.",
      ),
    )
  } catch (err) {
    console.error('forgot-password: email failed:', err)
    return NextResponse.json({ error: 'We could not send the email. Please try again in a moment.' }, { status: 502 })
  }
  return NextResponse.json({ ok: true })
}
