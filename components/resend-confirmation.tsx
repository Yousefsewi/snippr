'use client'

// Green "check your email" box with a "send the confirmation email again" button
// (sign-up page after registering, login page when the email isn't confirmed yet).

import { useState } from 'react'
import type { AuthCopy } from '@/lib/auth-copy'

export default function ResendConfirmation({ email, text, c, tone = 'success' }: { email: string; text: string; c: AuthCopy; tone?: 'success' | 'warn' }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const resend = async () => {
    setState('sending')
    try {
      const res = await fetch('/api/resend-confirmation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
      setState(res.ok ? 'sent' : 'error')
    } catch { setState('error') }
  }
  const box = tone === 'success' ? 'bg-[#effaf1] text-[#1b6b33]' : 'bg-[#fff7e6] text-[#8a5a00]'
  return (
    <div role="status" className={`rounded-2xl px-4 py-3 text-[13px] leading-snug ${box}`}>
      <p className="m-0">{text}</p>
      <div className="mt-2.5">
        {state === 'sent'
          ? <span className="font-medium">✓ {c.resent}</span>
          : <button type="button" onClick={resend} disabled={state === 'sending'}
              className="font-semibold underline underline-offset-2 disabled:opacity-60">
              {state === 'sending' ? '…' : c.resend}
            </button>}
        {state === 'error' && <span className="ml-2 text-[#d70015]">{c.err.mail_failed}</span>}
      </div>
    </div>
  )
}
