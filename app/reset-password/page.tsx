'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MdLock, MdArrowForward } from 'react-icons/md'
import { supabase } from '@/lib/supabase'
import { isPwnedPassword, PWNED_MESSAGE } from '@/lib/pwned'
import { useClientValue } from '@/lib/use-stored'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthShell, authInputClass, authButtonClass } from '@/components/auth-shell'
import { useSiteLng } from '@/lib/use-site-lng'
import type { SiteLng } from '@/lib/site-lang'

// Opened from the link in the reset email. Supabase signs the user in from the link
// (PASSWORD_RECOVERY), then they choose a new password here.

const COPY: Record<SiteLng, { short: string; mismatch: string; badTitle: string; badSub: string; newLink: string; title: string; checking: string; choose: string; pw: string; pw2: string; saving: string; save: string }> = {
  en: { short: 'Password must be at least 6 characters.', mismatch: "The two passwords don't match.", badTitle: "This link doesn't work", badSub: 'The reset link is invalid or has expired. Links work once and only for a limited time.', newLink: 'Send a new link', title: 'Set a new password', checking: 'Checking your link…', choose: 'Choose a new password for your Snippr account.', pw: 'New password', pw2: 'Repeat new password', saving: 'Saving…', save: 'Save new password' },
  nl: { short: 'Het wachtwoord moet minstens 6 tekens hebben.', mismatch: 'De twee wachtwoorden zijn niet hetzelfde.', badTitle: 'Deze link werkt niet', badSub: 'De resetlink is ongeldig of verlopen. Links werken één keer en maar een beperkte tijd.', newLink: 'Nieuwe link sturen', title: 'Nieuw wachtwoord instellen', checking: 'Je link wordt gecontroleerd…', choose: 'Kies een nieuw wachtwoord voor je Snippr-account.', pw: 'Nieuw wachtwoord', pw2: 'Herhaal nieuw wachtwoord', saving: 'Opslaan…', save: 'Nieuw wachtwoord opslaan' },
  de: { short: 'Das Passwort muss mindestens 6 Zeichen haben.', mismatch: 'Die beiden Passwörter stimmen nicht überein.', badTitle: 'Dieser Link funktioniert nicht', badSub: 'Der Link ist ungültig oder abgelaufen. Links funktionieren einmal und nur für begrenzte Zeit.', newLink: 'Neuen Link senden', title: 'Neues Passwort festlegen', checking: 'Dein Link wird geprüft…', choose: 'Wähle ein neues Passwort für dein Snippr-Konto.', pw: 'Neues Passwort', pw2: 'Neues Passwort wiederholen', saving: 'Wird gespeichert…', save: 'Neues Passwort speichern' },
  tr: { short: 'Şifre en az 6 karakter olmalı.', mismatch: 'İki şifre aynı değil.', badTitle: 'Bu link çalışmıyor', badSub: 'Sıfırlama linki geçersiz ya da süresi dolmuş. Linkler bir kez ve sınırlı bir süre çalışır.', newLink: 'Yeni link gönder', title: 'Yeni şifre belirle', checking: 'Linkin kontrol ediliyor…', choose: 'Snippr hesabın için yeni bir şifre seç.', pw: 'Yeni şifre', pw2: 'Yeni şifreyi tekrar yaz', saving: 'Kaydediliyor…', save: 'Yeni şifreyi kaydet' },
  ar: { short: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.', mismatch: 'كلمتا المرور غير متطابقتين.', badTitle: 'هذا الرابط لا يعمل', badSub: 'رابط إعادة التعيين غير صالح أو منتهي. تعمل الروابط مرة واحدة ولمدة محدودة.', newLink: 'أرسل رابطًا جديدًا', title: 'عيّن كلمة مرور جديدة', checking: 'جارٍ التحقق من الرابط…', choose: 'اختر كلمة مرور جديدة لحساب Snippr.', pw: 'كلمة المرور الجديدة', pw2: 'كرر كلمة المرور الجديدة', saving: 'جارٍ الحفظ…', save: 'احفظ كلمة المرور الجديدة' },
}

export default function ResetPasswordPage() {
  const lng = useSiteLng()
  const c = COPY[lng]
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
    if (password.length < 6) { setError(c.short); return }
    if (password !== confirm) { setError(c.mismatch); return }
    setLoading(true)
    if (await isPwnedPassword(password)) { setError(lng === 'tr' ? PWNED_MESSAGE.tr : PWNED_MESSAGE.en); setLoading(false); return }
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push('/dashboard')
  }

  if (linkError || status === 'invalid') return (
    <AuthShell heading={c.badTitle} subtext={linkError || c.badSub}>
      <Link href="/forgot-password" className="block">
        <Button className={authButtonClass}>{c.newLink} <MdArrowForward className="h-4 w-4" /></Button>
      </Link>
    </AuthShell>
  )

  return (
    <AuthShell heading={c.title} subtext={status === 'checking' ? c.checking : c.choose}>
      {status === 'ready' && (
        <form onSubmit={submit} className="space-y-5">
          {[
            { id: 'new-password', label: c.pw, value: password, set: setPassword },
            { id: 'confirm-password', label: c.pw2, value: confirm, set: setConfirm },
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
            {loading ? c.saving : c.save}
            <MdArrowForward className="h-4 w-4" />
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
