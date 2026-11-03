'use client'

import { createClient } from '@supabase/supabase-js'

// Set these in .env.local (Supabase Dashboard → Project Settings → API)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// PKCE: the "Sign in with Google" return link only works in the browser that started it
export const supabase = createClient(supabaseUrl, supabaseAnonKey, { auth: { flowType: 'pkce' } })

/** Is "Sign in with Google" switched on in Supabase (Authentication → Providers)? */
export async function googleLoginEnabled() {
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: supabaseAnonKey } })
    const j = await res.json()
    return !!j?.external?.google
  } catch { return false }
}
