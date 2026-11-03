'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { detectTimezone, setSavedTimezone } from '@/lib/timezones'
import { detectCurrency, setSavedCurrency } from '@/lib/currency'
import { Auth5 } from '@/components/watermelon-ui/auth-5'
import { suggestEmail } from '@/lib/email-typo'
import { ageFrom, MIN_AGE } from '@/lib/age'
import { AUTH_COPY, errorText, useAuthLng } from '@/lib/auth-copy'
import ResendConfirmation from '@/components/resend-confirmation'

export default function RegisterPage() {
  const router = useRouter()
  const c = AUTH_COPY[useAuthLng()]
  // Captured silently from the browser; users adjust these later in Settings
  const [timezone] = useState(detectTimezone())
  const [currency] = useState(detectCurrency())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // after a successful sign-up: the address the confirmation email went to (shown in green)
  const [sentTo, setSentTo] = useState('')
  // email we already warned about; submitting it again means "yes, it's really my address"
  const [typoWarned, setTypoWarned] = useState('')

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget
    const first = (form.querySelector('#Auth5-firstname') as HTMLInputElement)?.value.trim() ?? ''
    const last = (form.querySelector('#Auth5-lastname') as HTMLInputElement)?.value.trim() ?? ''
    const email = (form.querySelector('#Auth5-email') as HTMLInputElement)?.value ?? ''
    const password = (form.querySelector('#Auth5-password') as HTMLInputElement)?.value ?? ''
    const birthDate = (form.querySelector('#Auth5-birthdate') as HTMLInputElement)?.value ?? ''
    setSentTo('')
    // Terms + DPA accepted, and the privacy notice shown (components/signup-privacy-notice.tsx)
    const acceptedTerms = !!(form.querySelector('#Auth5-terms') as HTMLInputElement)?.checked
    if (!acceptedTerms) { setError(c.err.terms); return }

    // Legal age check before anything is created (checked again on the server)
    const age = ageFrom(birthDate)
    if (age === null) { setError(c.err.dob_invalid); return }
    if (age < MIN_AGE) { setError(c.err.too_young); return }

    const emailPrefix = email.split('@')[0]
    const fullName = `${first} ${last}`.trim() || emailPrefix
    // a name picked on the homepage (?slug=) wins; otherwise one is made from the full name.
    // If it is taken, the database adds a number (supabase/schema.sql).
    const wanted = (new URLSearchParams(window.location.search).get('slug') ?? '').toLowerCase().replace(/[^a-z0-9-]+/g, '').replace(/^-+|-+$/g, '').slice(0, 40)
    const slug = wanted ||
      (fullName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')) || emailPrefix.toLowerCase()

    // Catch "gamil.com"-style typos before creating an account nobody can reach
    const fixed = suggestEmail(email)
    if (fixed && typoWarned !== email.trim().toLowerCase()) {
      setTypoWarned(email.trim().toLowerCase())
      setError(c.err.typo(fixed))
      return
    }

    setLoading(true)
    setError('')

    // Remember the chosen timezone and currency for this user
    setSavedTimezone(timezone)
    setSavedCurrency(currency)

    // The account is created server-side (app/api/register/route.ts);
    // the barber profile is created by a database trigger (supabase/schema.sql) from this metadata
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fullName, slug, birthDate, acceptedTerms }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(errorText(c, result))
        setLoading(false)
        return
      }
      // A confirmation email was sent: they log in after clicking its link (green box, not an error)
      if (result.confirmed === false) {
        setSentTo(email.trim())
        setLoading(false)
        return
      }
    } catch {
      setError(c.err.network)
      setLoading(false)
      return
    }

    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/onboarding')
  }

  return (
    <Auth5
      brandName="Snippr"
      showName
      heading={c.regHeading}
      subtext={c.regSub}
      submitLabel={loading ? c.creating : c.create}
      loading={loading}
      error={error}
      belowError={sentTo ? <ResendConfirmation email={sentTo} text={c.err.confirmSent(sentTo)} c={c} /> : null}
      footerText={c.haveAccount}
      footerLinkText={c.logIn}
      signUpHref="/login"
      forgotPasswordHref="/forgot-password"
      onSubmit={handleRegister}
    />
  )
}
