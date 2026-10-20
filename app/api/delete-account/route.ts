import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Permanently deletes the signed-in barber's own account (GDPR "right to erasure").
// The caller proves who they are with their session token; we never take a user id
// from the request. Deleting the auth user cascades to their barber profile,
// services and appointments (on delete cascade in supabase/schema.sql).
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export async function POST(req: NextRequest) {
  if (!supabaseServiceKey) return NextResponse.json({ error: 'Server is not configured.' }, { status: 500 })

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '')
  if (!token) return NextResponse.json({ error: 'Not signed in.' }, { status: 401 })

  const supabase = createClient(supabaseUrl, supabaseServiceKey)
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) return NextResponse.json({ error: 'Your session has expired. Please log in again.' }, { status: 401 })

  const { error: delErr } = await supabase.auth.admin.deleteUser(user.id)
  if (delErr) {
    console.error('delete-account:', delErr.message)
    return NextResponse.json({ error: 'Could not delete the account. Please try again or contact support.' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
