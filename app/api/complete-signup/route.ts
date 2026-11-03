import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { ageFrom, AGE_ERRORS, MIN_AGE } from '@/lib/age'
import { TERMS_ERROR, TERMS_VERSION, PRIVACY_VERSION } from '@/lib/legal'

// Finish an account that didn't come through the sign-up form (e.g. "Continue with Google")
// or was made before the Terms box existed: date of birth (18+) and Terms/DPA acceptance,
// saved on the account like at sign-up. Under 18: the account is deleted again.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(req: NextRequest) {
  if (!supabaseServiceKey) return NextResponse.json({ error: 'server not configured' }, { status: 500 })
  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: 'not signed in' }, { status: 401 })

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ error: 'session expired' }, { status: 401 })

  const { birthDate, acceptedTerms } = await req.json().catch(() => ({}))
  if (acceptedTerms !== true) return NextResponse.json({ code: 'terms', error: TERMS_ERROR }, { status: 400 })
  const age = ageFrom(String(birthDate ?? ''))
  if (age === null) return NextResponse.json({ code: 'dob_invalid', error: AGE_ERRORS.invalid }, { status: 400 })
  if (age < MIN_AGE) {
    await supabase.auth.admin.deleteUser(user.id)
    return NextResponse.json({ code: 'too_young', error: AGE_ERRORS.tooYoung }, { status: 400 })
  }

  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    user_metadata: {
      ...user.user_metadata,
      birth_date: String(birthDate),
      terms_accepted_at: new Date().toISOString(), terms_version: TERMS_VERSION, privacy_version: PRIVACY_VERSION,
    },
  })
  if (error) { console.error('complete-signup:', error.message); return NextResponse.json({ error: 'could not save' }, { status: 500 }) }
  return NextResponse.json({ ok: true })
}
