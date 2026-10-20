'use client'

import { useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Auth5 } from '@/components/watermelon-ui/auth-5'
import { suggestEmail } from '@/lib/email-typo'
import { SESSION_ONLY_KEY, ALIVE_COOKIE } from '@/lib/remember-me'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const busy = useRef(false) // one sign-in request at a time (Enter + click used to send two)

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    if (busy.current) return
    const form = e.currentTarget
    const email = ((form.querySelector('#Auth5-email') as HTMLInputElement)?.value ?? '').trim().toLowerCase()
    const password = (form.querySelector('#Auth5-password') as HTMLInputElement)?.value ?? ''

    busy.current = true
    setLoading(true)
    setError('')

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
      setError(
        error.code === 'invalid_credentials' && fixed
          ? `Wrong password for "${fixed}" (we also corrected "${email}"). Try again, or use "Forgot password?".`
          : error.code === 'invalid_credentials'
          ? `Wrong email or password for "${email}". Check the spelling, or use "Forgot password?". No account yet? Register first.`
          : error.code === 'email_not_confirmed'
            ? 'This email is not confirmed yet. Please check your inbox.'
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
      heading="Welcome Back!"
      subtext="Enter your details below"
      submitLabel={loading ? 'Logging in…' : 'Log in'}
      loading={loading}
      error={error}
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      signUpHref="/register"
      forgotPasswordHref="/forgot-password"
      onSubmit={handleLogin}
    />
  )
}
