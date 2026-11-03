'use client'

// Back from "Continue with Google". The Supabase client swaps the ?code for a session
// (PKCE). Accounts that haven't given their date of birth and accepted the Terms yet go
// to /complete-signup first; everyone else goes to the dashboard.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AuthShell } from '@/components/auth-shell'

export default function AuthCallback() {
  const router = useRouter()
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let done = false
    const finish = (user: { user_metadata?: Record<string, unknown> } | null | undefined) => {
      if (done || !user) return
      done = true
      router.replace(user.user_metadata?.terms_accepted_at ? '/dashboard' : '/complete-signup')
    }
    supabase.auth.getSession().then(({ data }) => finish(data.session?.user))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => finish(session?.user))
    const t = setTimeout(() => { if (!done) setFailed(true) }, 8000)
    return () => { sub.subscription.unsubscribe(); clearTimeout(t) }
  }, [router])

  if (failed) return (
    <AuthShell heading="Sign-in didn’t finish" subtext="Please try again. If it keeps happening, log in with your email and password.">
      <Link href="/login" className="font-semibold underline">Back to login</Link>
    </AuthShell>
  )
  return <AuthShell heading="Signing you in…" subtext="One moment.">{null}</AuthShell>
}
