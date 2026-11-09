'use client'

// Texts for the login and sign-up screens in English, Turkish, Dutch, German and Arabic.
// Language: the one picked on the site (snippr-lang), otherwise the browser language.
// Server errors from /api/register come with a `code`; errorText() turns it into this language.

import { useSyncExternalStore } from 'react'

export type AuthLng = 'en' | 'tr' | 'nl' | 'de' | 'ar'

export function useAuthLng(): AuthLng {
  return useSyncExternalStore(() => () => {}, () => {
    let saved: string | null = null
    try { saved = localStorage.getItem('snippr-lang') } catch { /* blocked */ }
    const pick = (saved || navigator.language || '').toLowerCase()
    return pick.startsWith('tr') ? 'tr' : pick.startsWith('nl') ? 'nl' : pick.startsWith('de') ? 'de' : pick.startsWith('ar') ? 'ar' : 'en'
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
  de: {
    google: 'Weiter mit Google', or: 'oder', completeHeading: 'Konto fertigstellen', completeSub: 'Ein letzter Schritt vor dem Start: Wir brauchen dein Geburtsdatum und dein Okay zu unseren Bedingungen.', completeBtn: 'Weiter', saving: 'Wird gespeichert…', signOut: 'Abmelden',
    firstName: 'Vorname', lastName: 'Nachname', birthDate: 'Geburtsdatum', email: 'E-Mail', password: 'Passwort',
    showPw: 'Passwort anzeigen', hidePw: 'Passwort verbergen', remember: 'Angemeldet bleiben', forgot: 'Passwort vergessen?',
    regHeading: 'Konto erstellen', regSub: 'Erstelle dein Barbier-Profil in Sekunden.', create: 'Konto erstellen', creating: 'Konto wird erstellt…',
    haveAccount: 'Schon ein Konto?', logIn: 'Anmelden',
    loginHeading: 'Willkommen zurück!', loginSub: 'Gib deine Daten ein', loggingIn: 'Anmeldung läuft…', noAccount: 'Noch kein Konto?', signUp: 'Registrieren',
    resend: 'Bestätigungsmail erneut senden', resent: 'Gesendet! Schau in deinen Posteingang und Spam-Ordner.',
    err: {
      typo: (f: string) => `Meintest du ${f}? Korrigiere die E-Mail oder klick noch einmal auf "Konto erstellen", wenn sie stimmt.`,
      confirmSent: (e: string) => `Fast geschafft! Wir haben einen Bestätigungslink an ${e} geschickt. Öffne ihn, um dein Konto zu aktivieren (schau auch im Spam-Ordner).`,
      network: 'Server nicht erreichbar. Prüfe deine Verbindung und versuch es noch einmal.',
      failed: 'Registrierung fehlgeschlagen. Bitte versuch es noch einmal.',
      invalid_email: 'Bitte gib eine gültige E-Mail-Adresse ein.',
      terms: 'Bitte akzeptiere die Nutzungsbedingungen und den Auftragsverarbeitungsvertrag, um ein Konto zu erstellen.',
      dob_invalid: 'Bitte gib ein gültiges Geburtsdatum ein.',
      too_young: 'Du musst mindestens 18 Jahre alt sein, um ein Snippr-Konto zu erstellen.',
      pw_short: 'Das Passwort muss mindestens 6 Zeichen haben.',
      pw_leaked: 'Dieses Passwort ist bei einem Datenleck aufgetaucht und daher nicht sicher. Bitte wähle ein anderes.',
      too_many: 'Zu viele Registrierungen aus diesem Netzwerk. Bitte versuch es in einer Stunde noch einmal.',
      exists: 'Mit dieser E-Mail gibt es schon ein Konto. Melde dich an oder nutze "Passwort vergessen?", wenn die Bestätigungsmail nie ankam.',
      mail_failed: 'Wir konnten die Bestätigungsmail nicht senden. Bitte versuch es gleich noch einmal.',
      wrongPw: (e: string) => `Falsche E-Mail oder falsches Passwort für "${e}". Prüfe die Schreibweise oder nutze "Passwort vergessen?". Noch kein Konto? Registriere dich zuerst.`,
      wrongPwFixed: (f: string, e: string) => `Falsches Passwort für "${f}" (wir haben auch "${e}" korrigiert). Versuch es noch einmal oder nutze "Passwort vergessen?".`,
      notConfirmed: 'Diese E-Mail ist noch nicht bestätigt. Öffne den Link in der E-Mail, die wir dir geschickt haben (schau auch im Spam), oder sende sie unten erneut.',
    },
  },
  ar: {
    google: 'المتابعة باستخدام Google', or: 'أو', completeHeading: 'أكمل حسابك', completeSub: 'خطوة أخيرة قبل البدء: نحتاج تاريخ ميلادك وموافقتك على شروطنا.', completeBtn: 'متابعة', saving: 'جارٍ الحفظ…', signOut: 'تسجيل الخروج',
    firstName: 'الاسم الأول', lastName: 'اسم العائلة', birthDate: 'تاريخ الميلاد', email: 'البريد الإلكتروني', password: 'كلمة المرور',
    showPw: 'إظهار كلمة المرور', hidePw: 'إخفاء كلمة المرور', remember: 'تذكرني', forgot: 'نسيت كلمة المرور؟',
    regHeading: 'أنشئ حسابك', regSub: 'أنشئ ملفك كحلاق في ثوانٍ.', create: 'إنشاء حساب', creating: 'جارٍ إنشاء الحساب…',
    haveAccount: 'لديك حساب بالفعل؟', logIn: 'تسجيل الدخول',
    loginHeading: 'مرحبًا بعودتك!', loginSub: 'أدخل بياناتك', loggingIn: 'جارٍ تسجيل الدخول…', noAccount: 'ليس لديك حساب؟', signUp: 'إنشاء حساب',
    resend: 'أرسل بريد التأكيد مرة أخرى', resent: 'تم الإرسال! تحقق من صندوق الوارد ومجلد الرسائل غير المرغوب فيها.',
    err: {
      typo: (f: string) => `هل تقصد ${f}؟ صحّح البريد، أو اضغط "إنشاء حساب" مرة أخرى إذا كان صحيحًا.`,
      confirmSent: (e: string) => `اقتربت! أرسلنا رابط تأكيد إلى ${e}. افتحه لتفعيل حسابك (تحقق من مجلد الرسائل غير المرغوب فيها أيضًا).`,
      network: 'تعذر الوصول إلى الخادم. تحقق من اتصالك وحاول مرة أخرى.',
      failed: 'فشل التسجيل. يرجى المحاولة مرة أخرى.',
      invalid_email: 'يرجى إدخال بريد إلكتروني صحيح.',
      terms: 'يرجى قبول شروط الخدمة واتفاقية معالجة البيانات لإنشاء حساب.',
      dob_invalid: 'يرجى إدخال تاريخ ميلاد صحيح.',
      too_young: 'يجب أن يكون عمرك 18 عامًا على الأقل لإنشاء حساب Snippr.',
      pw_short: 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.',
      pw_leaked: 'ظهرت كلمة المرور هذه في تسريب بيانات، لذا فهي غير آمنة. يرجى اختيار كلمة أخرى.',
      too_many: 'عدد كبير من التسجيلات من هذه الشبكة. يرجى المحاولة بعد ساعة.',
      exists: 'يوجد حساب بهذا البريد بالفعل. سجّل الدخول، أو استخدم "نسيت كلمة المرور؟" إذا لم يصلك بريد التأكيد.',
      mail_failed: 'تعذر إرسال بريد التأكيد. يرجى المحاولة بعد قليل.',
      wrongPw: (e: string) => `البريد أو كلمة المرور غير صحيحة لـ "${e}". تحقق من الكتابة أو استخدم "نسيت كلمة المرور؟". ليس لديك حساب؟ سجّل أولًا.`,
      wrongPwFixed: (f: string, e: string) => `كلمة المرور غير صحيحة لـ "${f}" (صحّحنا أيضًا "${e}"). حاول مرة أخرى أو استخدم "نسيت كلمة المرور؟".`,
      notConfirmed: 'لم يتم تأكيد هذا البريد بعد. افتح الرابط في الرسالة التي أرسلناها (تحقق من الرسائل غير المرغوب فيها أيضًا)، أو أعد إرسالها أدناه.',
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
