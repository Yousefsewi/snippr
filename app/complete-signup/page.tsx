'use client'

// "Finish your account": for people who signed in with Google (or signed up before the
// Terms box existed). Asks the date of birth (18+) and the Terms/DPA acceptance with the
// privacy notice, then continues to the dashboard.

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AUTH_COPY, errorText, useAuthLng } from '@/lib/auth-copy'
import { ageFrom, MIN_AGE } from '@/lib/age'
import { AuthShell } from '@/components/auth-shell'
import SignupPrivacyNotice from '@/components/signup-privacy-notice'

export default function CompleteSignup() {
  const router = useRouter()
  const c = AUTH_COPY[useAuthLng()]
  const [ready, setReady] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/login'); return }
      if (user.user_metadata?.terms_accepted_at) { router.replace('/dashboard'); return }
      setReady(true)
    })
  }, [router])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const birthDate = (form.querySelector('#Auth5-birthdate') as HTMLInputElement)?.value ?? ''
    const acceptedTerms = !!(form.querySelector('#Auth5-terms') as HTMLInputElement)?.checked
    if (!acceptedTerms) return setError(c.err.terms)
    const age = ageFrom(birthDate)
    if (age === null) return setError(c.err.dob_invalid)
    if (age < MIN_AGE) { setError(c.err.too_young) } // the server removes the account

    setSaving(true); setError('')
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) { router.replace('/login'); return }
    try {
      const res = await fetch('/api/complete-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ birthDate, acceptedTerms }),
      })
      const result = await res.json()
      if (!res.ok) {
        setError(errorText(c, result)); setSaving(false)
        if (result.code === 'too_young') await supabase.auth.signOut()
        return
      }
      await supabase.auth.refreshSession() // pick up the saved acceptance
      router.replace('/dashboard')
    } catch { setError(c.err.network); setSaving(false) }
  }

  if (!ready) return <AuthShell heading={c.completeHeading} subtext="…">{null}</AuthShell>

  return (
    <AuthShell heading={c.completeHeading} subtext={c.completeSub}>
      <form onSubmit={submit} className="space-y-6 text-left">
        <div>
          <label htmlFor="Auth5-birthdate" className="mb-1 block text-[12px] font-medium text-[#8e8e93]">{c.birthDate}</label>
          <div className="border-b border-[#d1d1d6] focus-within:border-[#111]">
            <input id="Auth5-birthdate" type="date" autoComplete="bday" min="1900-01-01" required
              className="h-10 w-full bg-transparent text-[15px] text-[#111] outline-none" />
          </div>
        </div>
        <SignupPrivacyNotice />
        {error && <p role="alert" className="rounded-2xl bg-[#fff1f0] px-4 py-3 text-[13px] leading-snug text-[#d70015]">{error}</p>}
        <button type="submit" disabled={saving}
          className="h-12 w-full rounded-full bg-[#1c1c1e] text-[15px] font-semibold text-white transition hover:bg-black disabled:opacity-60">
          {saving ? c.saving : c.completeBtn}
        </button>
        <button type="button" onClick={async () => { await supabase.auth.signOut(); router.replace('/login') }}
          className="block w-full text-center text-[13px] text-[#8e8e93] hover:text-[#111]">{c.signOut}</button>
      </form>
    </AuthShell>
  )
}
