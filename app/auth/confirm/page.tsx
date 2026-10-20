'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MdArrowForward } from 'react-icons/md'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { AuthShell, authButtonClass } from '@/components/auth-shell'

// Opened from the sign-up confirmation email (/auth/confirm?token_hash=…&type=signup).
// Verifies the one-time token, which also signs the barber in, then opens the dashboard.
export default function ConfirmPage() {
  const router = useRouter()
  const [failed, setFailed] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token_hash = params.get('token_hash') ?? ''
    ;(async () => {
      const { error } = await supabase.auth.verifyOtp({ token_hash, type: 'signup' })
      if (error) { setFailed(error.message); return }
      router.replace('/dashboard')
    })()
  }, [router])

  if (failed) return (
    <AuthShell heading="This link doesn't work" subtext="The confirmation link is invalid, expired or was already used. If you already confirmed, just log in. Otherwise use “Forgot password?” to get a fresh link.">
      <Link href="/login" className="block">
        <Button className={authButtonClass}>Go to login <MdArrowForward className="h-4 w-4" /></Button>
      </Link>
    </AuthShell>
  )

  return <AuthShell heading="Confirming your email…" subtext="One moment, we're activating your account." >{null}</AuthShell>
}
