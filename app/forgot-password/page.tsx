'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MdEmail, MdArrowForward } from 'react-icons/md'
import { supabase } from '@/lib/supabase'
import { SITE_URL } from '@/lib/site-url'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthShell, authInputClass, authButtonClass } from '@/components/auth-shell'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const clean = email.trim().toLowerCase()
    // Our own route sends the email through Gmail (app/api/forgot-password/route.ts)
    let res: Response | null = null
    try {
      res = await fetch('/api/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: clean }),
      })
    } catch { /* network error → handled below */ }

    if (res?.status === 503) {
      // Gmail not set up yet → fall back to Supabase's built-in mailer
      const { error } = await supabase.auth.resetPasswordForEmail(clean, { redirectTo: `${SITE_URL}/reset-password` })
      setLoading(false)
      if (error) { setError(error.message); return }
      setSent(true)
      return
    }

    setLoading(false)
    if (!res) { setError('Could not reach the server. Please check your connection and try again.'); return }
    // Rate limits etc. are worth showing; "no such user" is never reported,
    // so this screen doesn't reveal which emails have an account.
    if (!res.ok) { setError((await res.json().catch(() => ({}))).error || 'Something went wrong. Please try again.'); return }
    setSent(true)
  }

  return (
    <AuthShell
      heading={sent ? 'Check your email' : 'Forgot your password?'}
      subtext={sent
        ? `If an account exists for ${email}, we've sent a link to set a new password. It can take a minute to arrive — check your spam folder too.`
        : "Enter your email and we'll send you a link to set a new password."}
    >
      {!sent && (
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email" className="text-sm font-medium">Email address</Label>
            <div className="relative">
              <MdEmail className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <Input id="forgot-email" type="email" placeholder="you@company.com" required
                value={email} onChange={e => setEmail(e.target.value)} className={authInputClass} />
            </div>
          </div>
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          <Button type="submit" disabled={loading} className={authButtonClass}>
            {loading ? 'Sending…' : 'Send reset link'}
            <MdArrowForward className="h-4 w-4" />
          </Button>
        </form>
      )}
      <p className="text-muted-foreground text-center text-sm">
        Remembered it? <Link href="/login" className="text-primary font-medium hover:underline">Back to login</Link>
      </p>
    </AuthShell>
  )
}
