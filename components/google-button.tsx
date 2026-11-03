'use client'

// "Continue with Google" for the login and sign-up screens (Supabase Auth, OAuth + PKCE).
// Hidden until Google is switched on in Supabase. New Google accounts still give their
// date of birth and accept the Terms on /complete-signup before using Snippr.

import { useEffect, useState } from 'react'
import { supabase, googleLoginEnabled } from '@/lib/supabase'
import { SITE_URL } from '@/lib/site-url'

export default function GoogleButton({ label, or }: { label: string; or: string }) {
  const [on, setOn] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => { let alive = true; googleLoginEnabled().then(v => { if (alive) setOn(v) }); return () => { alive = false } }, [])
  if (!on) return null

  const go = async () => {
    setBusy(true)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${SITE_URL}/auth/callback`, queryParams: { prompt: 'select_account' } },
    })
    if (error) setBusy(false)
  }

  return (
    <div className="mb-6 2xl:mb-7">
      <button type="button" onClick={go} disabled={busy}
        className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#d1d1d6] bg-white text-[15px] font-semibold text-[#1c1c1e] transition hover:bg-[#f5f5f7] disabled:opacity-60 2xl:h-14 2xl:text-[17px]">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        {busy ? '…' : label}
      </button>
      <div className="mt-6 flex items-center gap-3 text-[12px] text-[#8e8e93] 2xl:mt-7">
        <span className="h-px flex-1 bg-[#e5e5ea]" />{or}<span className="h-px flex-1 bg-[#e5e5ea]" />
      </div>
    </div>
  )
}
