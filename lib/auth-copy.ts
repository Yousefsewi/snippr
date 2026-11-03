'use client'

// Texts for the login and sign-up screens in English, Turkish and Dutch.
// Language: the one picked on the site (snippr-lang), otherwise the browser language.
// Server errors from /api/register come with a `code`; errorText() turns it into this language.

import { useSyncExternalStore } from 'react'

export type AuthLng = 'en' | 'tr' | 'nl'

export function useAuthLng(): AuthLng {
  return useSyncExternalStore(() => () => {}, () => {
    let saved: string | null = null
    try { saved = localStorage.getItem('snippr-lang') } catch { /* blocked */ }
    const pick = (saved || navigator.language || '').toLowerCase()
    return pick.startsWith('tr') ? 'tr' : pick.startsWith('nl') ? 'nl' : 'en'
  }, () => 'en') as AuthLng
}

export const AUTH_COPY = {
  en: {
    google: 'Continue with Google', or: 'or', completeHeading: 'Finish your account', completeSub: 'One last step before you start: we need your date of birth and your OK on our terms.', completeBtn: 'Continue', saving: 'Saving…', signOut: 'Sign out',
    firstName: 'First name', lastName: 'Last name', birthDate: 'Date of birth', email: 'Email', password: 'Password',
    showPw: 'Show password', hidePw: 'Hide password', remember: 'Remember me', forgot: 'Forgot password?',
    regHeading: 'Create your account', regSub: 'Create your barber profile in seconds.', create: 'Create account', creating: 'Creating account…',
    haveAccount: 'Already have an account?', logIn: 'Log in',
    loginHeading: 'Welcome back!', loginSub: 'Enter your details below', loggingIn: 'Logging in…', noAccount: 'Don’t have an account?', signUp: 'Sign up',
    resend: 'Send the confirmation email again', resent: 'Sent! Check your inbox and spam folder.',
    err: {
      typo: (f: string) => `Did you mean ${f}? Fix the email, or press "Create account" again if it's really correct.`,
      confirmSent: (e: string) => `Almost done! We sent a confirmation link to ${e}. Open it to activate your account (check your spam folder too).`,
      network: 'Could not reach the server. Please check your connection and try again.',
      failed: 'Registration failed. Please try again.',
      invalid_email: 'Please enter a valid email address.',
      terms: 'Please accept the Terms of Service and the Data Processing Agreement to create an account.',
      dob_invalid: 'Please enter a valid date of birth.',
      too_young: 'You must be at least 18 years old to create a Snippr account.',
      pw_short: 'Password must be at least 6 characters.',
      pw_leaked: 'This password has appeared in a data leak, so it isn’t safe. Please choose a different one.',
      too_many: 'Too many sign-ups from this network. Please try again in an hour.',
      exists: 'An account with this email already exists. Log in, or use "Forgot password?" if you never got the confirmation email.',
      mail_failed: 'We could not send the confirmation email. Please try again in a moment.',
      wrongPw: (e: string) => `Wrong email or password for "${e}". Check the spelling, or use "Forgot password?". No account yet? Sign up first.`,
      wrongPwFixed: (f: string, e: string) => `Wrong password for "${f}" (we also corrected "${e}"). Try again, or use "Forgot password?".`,
      notConfirmed: 'This email is not confirmed yet. Open the link in the email we sent you (check spam too), or send it again below.',
    },
  },
  tr: {
    google: 'Google ile devam et', or: 'veya', completeHeading: 'Hesabını tamamla', completeSub: 'Başlamadan önce son bir adım: doğum tarihin ve şartlarımızı onaylaman gerekiyor.', completeBtn: 'Devam et', saving: 'Kaydediliyor…', signOut: 'Çıkış yap',
    firstName: 'Ad', lastName: 'Soyad', birthDate: 'Doğum tarihi', email: 'E-posta', password: 'Şifre',
    showPw: 'Şifreyi göster', hidePw: 'Şifreyi gizle', remember: 'Beni hatırla', forgot: 'Şifremi unuttum',
    regHeading: 'Hesabını oluştur', regSub: 'Berber profilini saniyeler içinde oluştur.', create: 'Hesap oluştur', creating: 'Hesap oluşturuluyor…',
    haveAccount: 'Zaten hesabın var mı?', logIn: 'Giriş yap',
    loginHeading: 'Tekrar hoş geldin!', loginSub: 'Bilgilerini gir', loggingIn: 'Giriş yapılıyor…', noAccount: 'Hesabın yok mu?', signUp: 'Kayıt ol',
    resend: 'Onay e-postasını tekrar gönder', resent: 'Gönderildi! Gelen kutunu ve spam klasörünü kontrol et.',
    err: {
      typo: (f: string) => `${f} mi demek istedin? E-postayı düzelt ya da doğruysa tekrar "Hesap oluştur"a bas.`,
      confirmSent: (e: string) => `Neredeyse bitti! ${e} adresine bir onay linki gönderdik. Hesabını açmak için linke tıkla (spam klasörüne de bak).`,
      network: 'Sunucuya ulaşılamadı. İnternet bağlantını kontrol edip tekrar dene.',
      failed: 'Kayıt olmadı. Lütfen tekrar dene.',
      invalid_email: 'Lütfen geçerli bir e-posta adresi yaz.',
      terms: 'Hesap açmak için Kullanım Şartları’nı ve Veri İşleme Sözleşmesi’ni kabul etmelisin.',
      dob_invalid: 'Lütfen geçerli bir doğum tarihi gir.',
      too_young: 'Snippr hesabı açmak için en az 18 yaşında olmalısın.',
      pw_short: 'Şifre en az 6 karakter olmalı.',
      pw_leaked: 'Bu şifre daha önce bir veri sızıntısında ortaya çıkmış, güvenli değil. Lütfen başka bir şifre seç.',
      too_many: 'Bu ağdan çok fazla kayıt yapıldı. Lütfen bir saat sonra tekrar dene.',
      exists: 'Bu e-postayla zaten bir hesap var. Giriş yap; onay e-postası hiç gelmediyse "Şifremi unuttum"u kullan.',
      mail_failed: 'Onay e-postasını gönderemedik. Lütfen biraz sonra tekrar dene.',
      wrongPw: (e: string) => `"${e}" için e-posta veya şifre yanlış. Yazımı kontrol et ya da "Şifremi unuttum"u kullan. Hesabın yoksa önce kayıt ol.`,
      wrongPwFixed: (f: string, e: string) => `"${f}" için şifre yanlış ("${e}" adresini de düzelttik). Tekrar dene ya da "Şifremi unuttum"u kullan.`,
      notConfirmed: 'Bu e-posta henüz onaylanmadı. Sana gönderdiğimiz e-postadaki linke tıkla (spam klasörüne de bak) ya da aşağıdan tekrar gönder.',
    },
  },
  nl: {
    google: 'Doorgaan met Google', or: 'of', completeHeading: 'Maak je account af', completeSub: 'Nog één stap: we hebben je geboortedatum en je akkoord met onze voorwaarden nodig.', completeBtn: 'Doorgaan', saving: 'Opslaan…', signOut: 'Uitloggen',
    firstName: 'Voornaam', lastName: 'Achternaam', birthDate: 'Geboortedatum', email: 'E-mail', password: 'Wachtwoord',
    showPw: 'Wachtwoord tonen', hidePw: 'Wachtwoord verbergen', remember: 'Onthoud mij', forgot: 'Wachtwoord vergeten?',
    regHeading: 'Maak je account aan', regSub: 'Maak in een paar seconden je kappersprofiel.', create: 'Account aanmaken', creating: 'Account wordt aangemaakt…',
    haveAccount: 'Heb je al een account?', logIn: 'Inloggen',
    loginHeading: 'Welkom terug!', loginSub: 'Vul je gegevens in', loggingIn: 'Bezig met inloggen…', noAccount: 'Nog geen account?', signUp: 'Registreren',
    resend: 'Bevestigingsmail opnieuw sturen', resent: 'Verstuurd! Kijk in je inbox en spammap.',
    err: {
      typo: (f: string) => `Bedoel je ${f}? Pas het e-mailadres aan, of klik nog eens op "Account aanmaken" als het klopt.`,
      confirmSent: (e: string) => `Bijna klaar! We hebben een bevestigingslink gestuurd naar ${e}. Open die om je account te activeren (kijk ook in je spammap).`,
      network: 'Kan de server niet bereiken. Controleer je verbinding en probeer het opnieuw.',
      failed: 'Registreren is mislukt. Probeer het opnieuw.',
      invalid_email: 'Vul een geldig e-mailadres in.',
      terms: 'Accepteer de Gebruiksvoorwaarden en de Verwerkersovereenkomst om een account aan te maken.',
      dob_invalid: 'Vul een geldige geboortedatum in.',
      too_young: 'Je moet minstens 18 jaar zijn om een Snippr-account aan te maken.',
      pw_short: 'Het wachtwoord moet minstens 6 tekens hebben.',
      pw_leaked: 'Dit wachtwoord is eerder uitgelekt en dus niet veilig. Kies een ander wachtwoord.',
      too_many: 'Te veel registraties vanaf dit netwerk. Probeer het over een uur opnieuw.',
      exists: 'Er bestaat al een account met dit e-mailadres. Log in, of gebruik "Wachtwoord vergeten?" als je de bevestigingsmail nooit kreeg.',
      mail_failed: 'We konden de bevestigingsmail niet versturen. Probeer het zo opnieuw.',
      wrongPw: (e: string) => `Verkeerd e-mailadres of wachtwoord voor "${e}". Controleer de spelling of gebruik "Wachtwoord vergeten?". Nog geen account? Registreer eerst.`,
      wrongPwFixed: (f: string, e: string) => `Verkeerd wachtwoord voor "${f}" (we hebben "${e}" ook verbeterd). Probeer het opnieuw of gebruik "Wachtwoord vergeten?".`,
      notConfirmed: 'Dit e-mailadres is nog niet bevestigd. Open de link in de e-mail die we stuurden (kijk ook in spam), of stuur hem hieronder opnieuw.',
    },
  },
}

export type AuthCopy = typeof AUTH_COPY.en
type ErrCode = 'invalid_email' | 'terms' | 'dob_invalid' | 'too_young' | 'pw_short' | 'pw_leaked' | 'too_many' | 'exists' | 'mail_failed'

/** Turn an /api/register error into the page language (falls back to the server's English text). */
export function errorText(c: AuthCopy, result: { code?: string; error?: string }) {
  const code = result.code as ErrCode | undefined
  return (code && typeof c.err[code] === 'string' ? (c.err[code] as string) : '') || result.error || c.err.failed
}
