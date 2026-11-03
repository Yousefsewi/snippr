'use client'

import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Auth5 } from '@/components/watermelon-ui/auth-5'
import { suggestEmail } from '@/lib/email-typo'
import { SESSION_ONLY_KEY, ALIVE_COOKIE } from '@/lib/remember-me'
import { AUTH_COPY, useAuthLng } from '@/lib/auth-copy'
import ResendConfirmation from '@/components/resend-confirmation'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const c = AUTH_COPY[useAuthLng()]
  // email that is not confirmed yet → show "send the confirmation email again"
  const [unconfirmed, setUnconfirmed] = useState('')
  const busy = useRef(false) // one sign-in request at a time (Enter + click used to send two)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    if (busy.current) return
    const form = e.currentTarget
    const email = ((form.querySelector('#Auth5-email') as HTMLInputElement)?.value ?? '').trim().toLowerCase()
    const password = (form.querySelector('#Auth5-password') as HTMLInputElement)?.value ?? ''

    busy.current = true
    setLoading(true)
    setError('')
    setUnconfirmed('')

    let { error } = await supabase.auth.signInWithPassword({ email, password })

    // Misspelled provider ("gamil.com", often put in by browser autofill)? Quietly retry
    // with the corrected address and put it in the field, so the browser saves the right one.
    const fixed = suggestEmail(email)
    if (error?.code === 'invalid_credentials' && fixed) {
      const retry = await supabase.auth.signInWithPassword({ email: fixed, password })
      error = retry.error
      if (!error) {
        const input = form.querySelector('#Auth5-email') as HTMLInputElement | null
        if (input) input.value = fixed
      }
    }

    if (error) {
      // Echo the email that was actually sent: browser autofill often puts in an old or
      // misspelled address without the user noticing.
      if (error.code === 'email_not_confirmed') setUnconfirmed(email)
      else setError(
        error.code === 'invalid_credentials' && fixed ? c.err.wrongPwFixed(fixed, email)
          : error.code === 'invalid_credentials' ? c.err.wrongPw(email)
          : error.message,
      )
      busy.current = false
      setLoading(false)
      return
    }

    // "Remember me" off: end the session when the browser closes. A cookie without an
    // expiry date disappears on close; the dashboard signs out if it's gone.
    const remember = (form.querySelector('#Auth5-remember') as HTMLInputElement | null)?.checked ?? true
    try {
      if (remember) localStorage.removeItem(SESSION_ONLY_KEY)
      else { localStorage.setItem(SESSION_ONLY_KEY, '1'); document.cookie = `${ALIVE_COOKIE}=1; path=/; SameSite=Lax` }
    } catch { /* storage blocked: keep the normal (remembered) session */ }

    router.push('/dashboard')
  }

  return (
    <Auth5
      brandName="Snippr"
      heading={c.loginHeading}
      subtext={c.loginSub}
      submitLabel={loading ? c.loggingIn : c.logIn}
      loading={loading}
      error={error}
      belowError={unconfirmed ? <ResendConfirmation email={unconfirmed} text={c.err.notConfirmed} c={c} tone="warn" /> : null}
      footerText={c.noAccount}
      footerLinkText={c.signUp}
      signUpHref="/register"
      forgotPasswordHref="/forgot-password"
      onSubmit={handleLogin}
    />
  )
}
