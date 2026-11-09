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
import { useSiteLng } from '@/lib/use-site-lng'
import type { SiteLng } from '@/lib/site-lang'


const COPY: Record<SiteLng, { checkTitle: string; title: string; sent: (e: string) => string; intro: string; label: string; sending: string; send: string; remembered: string; back: string; network: string; failed: string }> = {
  en: { checkTitle: 'Check your email', title: 'Forgot your password?', sent: e => `If an account exists for ${e}, we've sent a link to set a new password. It can take a minute to arrive — check your spam folder too.`, intro: "Enter your email and we'll send you a link to set a new password.", label: 'Email address', sending: 'Sending…', send: 'Send reset link', remembered: 'Remembered it?', back: 'Back to login', network: 'Could not reach the server. Please check your connection and try again.', failed: 'Something went wrong. Please try again.' },
  nl: { checkTitle: 'Check je e-mail', title: 'Wachtwoord vergeten?', sent: e => `Als er een account bestaat voor ${e}, hebben we een link gestuurd om een nieuw wachtwoord in te stellen. Het kan even duren; kijk ook in je spammap.`, intro: 'Vul je e-mailadres in, dan sturen we je een link om een nieuw wachtwoord in te stellen.', label: 'E-mailadres', sending: 'Versturen…', send: 'Resetlink sturen', remembered: 'Weet je het weer?', back: 'Terug naar inloggen', network: 'Kan de server niet bereiken. Controleer je verbinding en probeer het opnieuw.', failed: 'Er ging iets mis. Probeer het opnieuw.' },
  de: { checkTitle: 'Schau in dein Postfach', title: 'Passwort vergessen?', sent: e => `Wenn es ein Konto für ${e} gibt, haben wir einen Link zum Festlegen eines neuen Passworts geschickt. Das kann eine Minute dauern; schau auch im Spam-Ordner.`, intro: 'Gib deine E-Mail ein und wir schicken dir einen Link, um ein neues Passwort festzulegen.', label: 'E-Mail-Adresse', sending: 'Wird gesendet…', send: 'Link senden', remembered: 'Wieder eingefallen?', back: 'Zurück zur Anmeldung', network: 'Server nicht erreichbar. Prüfe deine Verbindung und versuch es noch einmal.', failed: 'Etwas ist schiefgelaufen. Bitte versuch es noch einmal.' },
  tr: { checkTitle: 'E-postanı kontrol et', title: 'Şifreni mi unuttun?', sent: e => `${e} için bir hesap varsa, yeni şifre belirlemen için bir link gönderdik. Gelmesi bir dakika sürebilir; spam klasörüne de bak.`, intro: 'E-postanı yaz, yeni şifre belirlemen için sana bir link gönderelim.', label: 'E-posta adresi', sending: 'Gönderiliyor…', send: 'Sıfırlama linki gönder', remembered: 'Hatırladın mı?', back: 'Girişe dön', network: 'Sunucuya ulaşılamadı. İnternet bağlantını kontrol edip tekrar dene.', failed: 'Bir sorun oldu. Lütfen tekrar dene.' },
  ar: { checkTitle: 'تحقق من بريدك', title: 'نسيت كلمة المرور؟', sent: e => `إذا كان هناك حساب لـ ${e} فقد أرسلنا رابطًا لتعيين كلمة مرور جديدة. قد يستغرق وصوله دقيقة، وتحقق من الرسائل غير المرغوب فيها أيضًا.`, intro: 'أدخل بريدك وسنرسل لك رابطًا لتعيين كلمة مرور جديدة.', label: 'البريد الإلكتروني', sending: 'جارٍ الإرسال…', send: 'أرسل رابط إعادة التعيين', remembered: 'تذكرتها؟', back: 'العودة لتسجيل الدخول', network: 'تعذر الوصول إلى الخادم. تحقق من اتصالك وحاول مرة أخرى.', failed: 'حدث خطأ. يرجى المحاولة مرة أخرى.' },
}

export default function ForgotPasswordPage() {
  const c = COPY[useSiteLng()]
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
    if (!res) { setError(c.network); return }
    // Rate limits etc. are worth showing; "no such user" is never reported,
    // so this screen doesn't reveal which emails have an account.
    if (!res.ok) { setError((await res.json().catch(() => ({}))).error || c.failed); return }
    setSent(true)
  }

  return (
    <AuthShell
      heading={sent ? c.checkTitle : c.title}
      subtext={sent
        ? c.sent(email)
        : c.intro}
    >
      {!sent && (
        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-1.5">
            <Label htmlFor="forgot-email" className="text-sm font-medium">{c.label}</Label>
            <div className="relative">
              <MdEmail className="text-muted-foreground absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2" />
              <Input id="forgot-email" type="email" placeholder="you@company.com" required
                value={email} onChange={e => setEmail(e.target.value)} className={authInputClass} />
            </div>
          </div>
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          <Button type="submit" disabled={loading} className={authButtonClass}>
            {loading ? c.sending : c.send}
            <MdArrowForward className="h-4 w-4" />
          </Button>
        </form>
      )}
      <p className="text-muted-foreground text-center text-sm">
        {c.remembered} <Link href="/login" className="text-primary font-medium hover:underline">{c.back}</Link>
      </p>
    </AuthShell>
  )
}
