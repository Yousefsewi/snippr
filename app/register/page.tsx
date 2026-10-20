'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { detectTimezone, setSavedTimezone } from '@/lib/timezones'
import { detectCurrency, setSavedCurrency } from '@/lib/currency'
import { Auth5 } from '@/components/watermelon-ui/auth-5'
import { suggestEmail } from '@/lib/email-typo'

export default function RegisterPage() {
  const router = useRouter()
  // Captured silently from the browser; users adjust these later in Settings
  const [timezone] = useState(detectTimezone())
  const [currency] = useState(detectCurrency())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // email we already warned about; submitting it again means "yes, it's really my address"
  const [typoWarned, setTypoWarned] = useState('')

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget
    const first = (form.querySelector('#Auth5-firstname') as HTMLInputElement)?.value.trim() ?? ''
    const last = (form.querySelector('#Auth5-lastname') as HTMLInputElement)?.value.trim() ?? ''
    const email = (form.querySelector('#Auth5-email') as HTMLInputElement)?.value ?? ''
    const password = (form.querySelector('#Auth5-password') as HTMLInputElement)?.value ?? ''

    const emailPrefix = email.split('@')[0]
    const fullName = `${first} ${last}`.trim() || emailPrefix
    const slug =
      (fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) || emailPrefix.toLowerCase()

    // Catch "gamil.com"-style typos before creating an account nobody can reach
    const fixed = suggestEmail(email)
    if (fixed && typoWarned !== email.trim().toLowerCase()) {
      setTypoWarned(email.trim().toLowerCase())
      setError(`Did you mean ${fixed}? Fix the email, or press "Create account" again if it's really correct.`)
      return
    }

    setLoading(true)
    setError('')

    // Remember the chosen timezone and currency for this user
    setSavedTimezone(timezone)
    setSavedCurrency(currency)

    // The account is created server-side, already confirmed (app/api/register/route.ts);
    // the barber profile is created by a database trigger (supabase/schema.sql) from this metadata
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, slug }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(result.error || 'Registration failed. Please try again.')
        setLoading(false)
        return
      }
      // A confirmation email was sent: they log in after clicking its link
      if (result.confirmed === false) {
        setError(`Almost done! We sent a confirmation link to ${email.trim()}. Open it to activate your account (check your spam folder too).`)
        setLoading(false)
        return
      }
    } catch {
      setError('Could not reach the server. Please check your connection and try again.')
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
  }

  return (
    <Auth5
      brandName="Snippr"
      showName
      heading="Create your account"
      subtext="Create your barber profile in seconds."
      submitLabel={loading ? 'Creating account…' : 'Create account'}
      loading={loading}
      error={error}
      footerText="Already have an account?"
      footerLinkText="Login"
      signUpHref="/login"
      forgotPasswordHref="/forgot-password"
      onSubmit={handleRegister}
    />
  )
}
