'use client'

// Back from "Continue with Google". The Supabase client swaps the ?code for a session
// (PKCE). Accounts that haven't given their date of birth and accepted the Terms yet go
// to /complete-signup first; everyone else goes to the dashboard.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { AuthShell } from '@/components/auth-shell'
import { useSiteLng } from '@/lib/use-site-lng'
import type { SiteLng } from '@/lib/site-lang'

const COPY: Record<SiteLng, { failT: string; failS: string; back: string; busyT: string; busyS: string }> = {
  en: { failT: 'Sign-in didn’t finish', failS: 'Please try again. If it keeps happening, log in with your email and password.', back: 'Back to login', busyT: 'Signing you in…', busyS: 'One moment.' },
  nl: { failT: 'Inloggen is niet gelukt', failS: 'Probeer het opnieuw. Blijft het gebeuren, log dan in met je e-mail en wachtwoord.', back: 'Terug naar inloggen', busyT: 'Je wordt ingelogd…', busyS: 'Een moment.' },
  de: { failT: 'Anmeldung nicht abgeschlossen', failS: 'Bitte versuch es noch einmal. Passiert es wieder, melde dich mit E-Mail und Passwort an.', back: 'Zurück zur Anmeldung', busyT: 'Du wirst angemeldet…', busyS: 'Einen Moment.' },
  tr: { failT: 'Giriş tamamlanmadı', failS: 'Lütfen tekrar dene. Tekrar olursa e-posta ve şifrenle giriş yap.', back: 'Girişe dön', busyT: 'Giriş yapılıyor…', busyS: 'Bir saniye.' },
  ar: { failT: 'لم يكتمل تسجيل الدخول', failS: 'يرجى المحاولة مرة أخرى. إذا تكرر ذلك فسجّل الدخول ببريدك وكلمة المرور.', back: 'العودة لتسجيل الدخول', busyT: 'جارٍ تسجيل دخولك…', busyS: 'لحظة واحدة.' },
}

export default function AuthCallback() {
  const router = useRouter()
  const c = COPY[useSiteLng()]
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
    <AuthShell heading={c.failT} subtext={c.failS}>
      <Link href="/login" className="font-semibold underline">{c.back}</Link>
    </AuthShell>
  )
  return <AuthShell heading={c.busyT} subtext={c.busyS}>{null}</AuthShell>
}
