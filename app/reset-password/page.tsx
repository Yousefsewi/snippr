'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MdLock, MdArrowForward } from 'react-icons/md'
import { supabase } from '@/lib/supabase'
import { useClientValue } from '@/lib/use-stored'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthShell, authInputClass, authButtonClass } from '@/components/auth-shell'

// Opened from the link in the reset email. Supabase signs the user in from the link
// (PASSWORD_RECOVERY), then they choose a new password here.
export default function ResetPasswordPage() {
  const router = useRouter()
  const [status, setStatus] = useState<'checking' | 'ready' | 'invalid'>('checking')
  // Expired / already used links come back with the reason in the URL hash
  // (URLSearchParams already turns the "+" in the message back into spaces)
  const linkError = useClientValue(() => new URLSearchParams(window.location.hash.slice(1)).get('error_description') ?? '', '')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Link from our own Gmail reset email: /reset-password?token_hash=…&type=recovery
    const tokenHash = new URLSearchParams(window.location.search).get('token_hash')
    if (tokenHash) {
      supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' }).then(({ error }) => {
        setStatus(error ? 'invalid' : 'ready')
        // keep the one-time token out of the address bar / history
        window.history.replaceState(null, '', '/reset-password')
      })
      return
    }

    // Link from Supabase's built-in mailer: it signs the user in from the URL hash
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (session && event === 'SIGNED_IN')) setStatus('ready')
    })
    supabase.auth.getSession().then(({ data: { session } }) => { if (session) setStatus('ready') })
    // No session from the link after a few seconds → the link is invalid
    const timer = setTimeout(() => setStatus(s => (s === 'checking' ? 'invalid' : s)), 4000)
    return () => { sub.subscription.unsubscribe(); clearTimeout(timer) }
  }, [])

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    if (password !== confirm) { setError("The two passwords don't match."); return }
    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/dashboard')
  }

  if (linkError || status === 'invalid') return (
    <AuthShell heading="This link doesn't work" subtext={linkError || 'The reset link is invalid or has expired. Links work once and only for a limited time.'}>
      <Link href="/forgot-password" className="block">
        <Button className={authButtonClass}>Send a new link <MdArrowForward className="h-4 w-4" /></Button>
      </Link>
    </AuthShell>
  )

  return (
    <AuthShell heading="Set a new password" subtext={status === 'checking' ? 'Checking your link…' : 'Choose a new password for your Snippr account.'}>
      {status === 'ready' && (
        <form onSubmit={submit} className="space-y-5">
          {[
            { id: 'new-password', label: 'New password', value: password, set: setPassword },
            { id: 'confirm-password', label: 'Repeat new password', value: confirm, set: setConfirm },
          ].map(f => (
            <div key={f.id} className="space-y-1.5">
              <Label htmlFor={f.id} className="text-sm font-medium">{f.label}</Label>
              <div className="relative">
                <MdLock className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
                <Input id={f.id} type="password" placeholder="••••••••••" required autoComplete="new-password"
                  value={f.value} onChange={e => f.set(e.target.value)} className={authInputClass} />
              </div>
            </div>
          ))}
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          <Button type="submit" disabled={loading} className={authButtonClass}>
            {loading ? 'Saving…' : 'Save new password'}
            <MdArrowForward className="h-4 w-4" />
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
