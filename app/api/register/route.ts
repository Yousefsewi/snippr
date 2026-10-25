import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { mailerReady, sendMail, buttonEmail, SITE_URL, rateLimited, clientIp } from '@/lib/mailer'
import { isPwnedPassword, PWNED_MESSAGE } from '@/lib/pwned'

// Server-side sign-up.
// - With Gmail configured (lib/mailer.ts): the account is created unconfirmed and we email
//   a confirmation link ourselves; the person can log in after clicking it.
// - Without it: the account is created already confirmed (old behaviour), so sign-up keeps
//   working until email is set up.
// The barber profile is created by the on_auth_user_created trigger (supabase/schema.sql).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(req: NextRequest) {
  if (!supabaseServiceKey) return NextResponse.json({ error: 'Server is not configured (SUPABASE_SERVICE_ROLE_KEY missing).' }, { status: 500 })

  // Brake against mass sign-ups: 5 accounts per network per hour
  if (rateLimited(`register:${clientIp(req.headers)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Too many sign-ups from this network. Please try again in an hour.' }, { status: 429 })
  }

  const { email, password, fullName, slug } = await req.json().catch(() => ({}))
  const cleanEmail = String(email ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  if (String(password ?? '').length < 6) return NextResponse.json({ error: 'Password must be at least 6 characters.' }, { status: 400 })
  // leaked-password check (free alternative to Supabase's paid-plan setting)
  if (await isPwnedPassword(String(password))) return NextResponse.json({ error: PWNED_MESSAGE.en }, { status: 400 })

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const metadata = { full_name: String(fullName ?? '').slice(0, 100), slug: String(slug ?? '').slice(0, 60) }
  const exists = (msg: string) => /already (been )?registered|already exists/i.test(msg)

  if (!mailerReady) {
    const { error } = await supabase.auth.admin.createUser({ email: cleanEmail, password, email_confirm: true, user_metadata: metadata })
    if (error) {
      return NextResponse.json(
        { error: exists(error.message) ? 'An account with this email already exists. Please log in.' : error.message },
        { status: exists(error.message) ? 409 : 400 },
      )
    }
    return NextResponse.json({ ok: true, confirmed: true })
  }

  // Creates the (unconfirmed) user and gives us a one-time token without sending anything
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'signup', email: cleanEmail, password, options: { data: metadata },
  })
  if (error || !data.properties?.hashed_token) {
    const msg = error?.message ?? 'Could not create the account.'
    return NextResponse.json(
      { error: exists(msg) ? 'An account with this email already exists. Log in, or use "Forgot password?" if you never got the confirmation email.' : msg },
      { status: exists(msg) ? 409 : 400 },
    )
  }

  const link = `${SITE_URL}/auth/confirm?token_hash=${encodeURIComponent(data.properties.hashed_token)}&type=signup`
  try {
    await sendMail(
      cleanEmail,
      'Confirm your Snippr account',
      buttonEmail(
        'Confirm your email',
        `Hi ${metadata.full_name || 'there'}, welcome to Snippr! Click the button below to confirm your email address and open your dashboard.`,
        'Confirm my email',
        link,
        "If you didn't create a Snippr account, you can ignore this email.",
      ),
    )
  } catch (err) {
    // Don't leave a half-made account behind: remove it so they can simply try again
    await supabase.auth.admin.deleteUser(data.user.id)
    console.error('register: confirmation email failed:', err)
    return NextResponse.json({ error: 'We could not send the confirmation email. Please try again in a moment.' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, confirmed: false })
}
