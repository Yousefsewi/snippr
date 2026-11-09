'use client'

// Help & support: iOS-style grouped lists, a live search over all questions,
// quick links into the dashboard, and the support contact. In the 5 site languages.
import { useMemo, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Rocket, Link2, KeyRound, Mail, Search, ChevronDown, Copy, Check, ArrowLeft, type LucideIcon } from 'lucide-react'
import { SUPPORT_EMAIL } from '@/lib/site'
import { browserSiteLng, isSiteLng, SITE_LANGS, type SiteLng } from '@/lib/site-lang'
import { TRIAL_DAYS } from '@/lib/legal'

type Lng = SiteLng
type QA = [string, string]

const C: Record<Lng, {
  title: string; sub: string; search: string; none: string
  quick: [string, string, string, LucideIcon][]
  groups: [string, QA[]][]
  contactTitle: string; contactBody: string; write: string; copy: string; copied: string; faq: string; back: string
}> = {
  en: {
    title: 'Help & support', sub: 'How can we help?', search: 'Search help', none: 'No results. Try other words, or write to us below.',
    quick: [
      ['Get started', 'Add services and hours', '/dashboard/services', Rocket],
      ['Your booking link', 'Share it or print the QR', '/dashboard/link', Link2],
      ['Forgot password', 'Get a reset link by email', '/forgot-password', KeyRound],
      ['Contact us', 'We reply by email', '#contact', Mail],
    ],
    groups: [
      ['Getting started', [
        ['How do I set up my booking page?', 'Sign up, then in your dashboard add your services and prices (Services) and your working hours (Profile → Edit). Your booking page is ready right away.'],
        ['Where do I set my working hours?', 'Dashboard → Profile → Edit → Working hours. Turn off the days you are closed. Clients can only book when you are open.'],
        ['How do I add services and prices?', 'Dashboard → Services. Add a name, duration and price. Clients pick a service when they book.'],
        ['Is Snippr free?', `Every plan is free to try for ${TRIAL_DAYS} days, no credit card needed. Nothing is charged when the trial ends.`],
      ]],
      ['Bookings', [
        ['How do clients book?', 'They open your link, pick a service, a day and a time, and enter their name. No app or account needed.'],
        ['Where do I find my link and QR code?', 'Dashboard → Link. Copy the link for Instagram or WhatsApp, or download the QR code for your shop.'],
        ['Can two clients book the same time?', 'No. Once a time is taken it closes for everyone else automatically.'],
        ['Do clients get a confirmation?', 'Yes, if they leave their email they get a confirmation with the date, time and price.'],
        ['How do I get notified about new bookings?', 'Turn on notifications when the dashboard asks. New bookings also appear in your calendar instantly.'],
      ]],
      ['Account', [
        ['How do I change my password or email?', 'Dashboard → Profile → Edit. Forgot it? Use “Forgot password?” on the login page.'],
        ['How do I change currency, language or time zone?', 'Dashboard → Settings.'],
        ['How do I delete my account?', 'Dashboard → Settings → Delete account. This removes your account and its appointments.'],
      ]],
      ['Payments', [
        ['Does Snippr take payments?', 'No. Clients pay you directly in your shop. Snippr never takes a cut.'],
      ]],
    ],
    contactTitle: 'Still need help?', contactBody: 'Write to us and we will get back to you by email.',
    write: 'Write an email', copy: 'Copy address', copied: 'Copied', faq: 'All questions', back: 'Home',
  },
  tr: {
    title: 'Yardım ve destek', sub: 'Nasıl yardımcı olabiliriz?', search: 'Yardımda ara', none: 'Sonuç yok. Başka kelimeler dene ya da aşağıdan bize yaz.',
    quick: [
      ['Başlarken', 'Hizmet ve saat ekle', '/dashboard/services', Rocket],
      ['Randevu linkin', 'Paylaş ya da QR yazdır', '/dashboard/link', Link2],
      ['Şifremi unuttum', 'E-postayla sıfırlama linki', '/forgot-password', KeyRound],
      ['Bize ulaş', 'E-postayla dönüyoruz', '#contact', Mail],
    ],
    groups: [
      ['Başlarken', [
        ['Randevu sayfamı nasıl kurarım?', 'Kayıt ol, sonra panelde hizmetlerini ve fiyatlarını (Hizmetler) ve çalışma saatlerini (Profil → Düzenle) ekle. Randevu sayfan hemen hazır olur.'],
        ['Çalışma saatlerimi nereden ayarlarım?', 'Panel → Profil → Düzenle → Çalışma saatleri. Kapalı olduğun günleri kapat. Müşteriler sadece açık olduğun saatlerde randevu alabilir.'],
        ['Hizmet ve fiyat nasıl eklerim?', 'Panel → Hizmetler. Ad, süre ve fiyat gir. Müşteriler randevu alırken hizmet seçer.'],
        ['Snippr ücretsiz mi?', `Bütün planları ${TRIAL_DAYS} gün ücretsiz deneyebilirsin, kredi kartı gerekmez. Deneme bitince ücret alınmaz.`],
      ]],
      ['Randevular', [
        ['Müşteriler nasıl randevu alır?', 'Linkini açar, hizmet, gün ve saat seçer, adını yazar. Uygulama ya da üyelik gerekmez.'],
        ['Linkimi ve QR kodumu nerede bulurum?', 'Panel → Link. Linki Instagram veya WhatsApp için kopyala ya da dükkanın için QR kodu indir.'],
        ['İki müşteri aynı saati alabilir mi?', 'Hayır. Bir saat alındığı anda diğer herkese otomatik kapanır.'],
        ['Müşteriye onay gidiyor mu?', 'Evet, e-postasını bırakırsa tarih, saat ve fiyatla bir onay e-postası alır.'],
        ['Yeni randevudan nasıl haberim olur?', 'Panel sorduğunda bildirimleri aç. Yeni randevular takvimine de anında düşer.'],
      ]],
      ['Hesap', [
        ['Şifremi veya e-postamı nasıl değiştiririm?', 'Panel → Profil → Düzenle. Şifreni unuttuysan giriş sayfasındaki “Şifremi unuttum” bağlantısını kullan.'],
        ['Para birimi, dil veya saat dilimini nasıl değiştiririm?', 'Panel → Ayarlar.'],
        ['Hesabımı nasıl silerim?', 'Panel → Ayarlar → Hesabı sil. Hesabın ve randevuları silinir.'],
      ]],
      ['Ödemeler', [
        ['Snippr ödeme alıyor mu?', 'Hayır. Müşteriler ödemeyi dükkanında doğrudan sana yapar. Snippr komisyon almaz.'],
      ]],
    ],
    contactTitle: 'Hâlâ yardım lazım mı?', contactBody: 'Bize yaz, e-postayla dönüş yapalım.',
    write: 'E-posta yaz', copy: 'Adresi kopyala', copied: 'Kopyalandı', faq: 'Tüm sorular', back: 'Ana sayfa',
  },
  nl: {
    title: 'Hulp en support', sub: 'Waarmee kunnen we helpen?', search: 'Zoeken in hulp', none: 'Geen resultaten. Probeer andere woorden, of schrijf ons hieronder.',
    quick: [
      ['Aan de slag', 'Behandelingen en tijden toevoegen', '/dashboard/services', Rocket],
      ['Je boekingslink', 'Delen of de QR printen', '/dashboard/link', Link2],
      ['Wachtwoord vergeten', 'Resetlink per e-mail', '/forgot-password', KeyRound],
      ['Contact', 'We antwoorden per e-mail', '#contact', Mail],
    ],
    groups: [
      ['Aan de slag', [
        ['Hoe stel ik mijn boekingspagina in?', 'Meld je aan en voeg in je dashboard je behandelingen en prijzen toe (Behandelingen) en je openingstijden (Profiel → Bewerken). Je boekingspagina is meteen klaar.'],
        ['Waar stel ik mijn openingstijden in?', 'Dashboard → Profiel → Bewerken → Openingstijden. Zet de dagen uit waarop je dicht bent. Klanten kunnen alleen boeken als je open bent.'],
        ['Hoe voeg ik behandelingen en prijzen toe?', 'Dashboard → Behandelingen. Vul een naam, duur en prijs in. Klanten kiezen een behandeling bij het boeken.'],
        ['Is Snippr gratis?', `Elk abonnement kun je ${TRIAL_DAYS} dagen gratis proberen, zonder creditcard. Er wordt niets afgeschreven als de proef afloopt.`],
      ]],
      ['Afspraken', [
        ['Hoe boeken klanten?', 'Ze openen je link, kiezen een behandeling, een dag en een tijd, en vullen hun naam in. Geen app of account nodig.'],
        ['Waar vind ik mijn link en QR-code?', 'Dashboard → Link. Kopieer de link voor Instagram of WhatsApp, of download de QR-code voor je zaak.'],
        ['Kunnen twee klanten hetzelfde tijdstip boeken?', 'Nee. Zodra een tijd bezet is, gaat die automatisch dicht voor iedereen.'],
        ['Krijgen klanten een bevestiging?', 'Ja. Als ze hun e-mail achterlaten, krijgen ze een bevestiging met datum, tijd en prijs.'],
        ['Hoe krijg ik een melding van nieuwe afspraken?', 'Zet meldingen aan als het dashboard erom vraagt. Nieuwe afspraken verschijnen ook meteen in je agenda.'],
      ]],
      ['Account', [
        ['Hoe wijzig ik mijn wachtwoord of e-mail?', 'Dashboard → Profiel → Bewerken. Vergeten? Gebruik “Wachtwoord vergeten?” op de inlogpagina.'],
        ['Hoe wijzig ik valuta, taal of tijdzone?', 'Dashboard → Instellingen.'],
        ['Hoe verwijder ik mijn account?', 'Dashboard → Instellingen → Account verwijderen. Je account en afspraken worden verwijderd.'],
      ]],
      ['Betalingen', [
        ['Neemt Snippr betalingen aan?', 'Nee. Klanten betalen je rechtstreeks in je zaak. Snippr neemt nooit een deel.'],
      ]],
    ],
    contactTitle: 'Nog hulp nodig?', contactBody: 'Schrijf ons, dan antwoorden we per e-mail.',
    write: 'E-mail schrijven', copy: 'Adres kopiëren', copied: 'Gekopieerd', faq: 'Alle vragen', back: 'Home',
  },
  de: {
    title: 'Hilfe und Support', sub: 'Wie können wir helfen?', search: 'Hilfe durchsuchen', none: 'Keine Ergebnisse. Versuch andere Wörter oder schreib uns unten.',
    quick: [
      ['Erste Schritte', 'Leistungen und Zeiten eintragen', '/dashboard/services', Rocket],
      ['Dein Buchungslink', 'Teilen oder QR drucken', '/dashboard/link', Link2],
      ['Passwort vergessen', 'Link per E-Mail', '/forgot-password', KeyRound],
      ['Kontakt', 'Wir antworten per E-Mail', '#contact', Mail],
    ],
    groups: [
      ['Erste Schritte', [
        ['Wie richte ich meine Buchungsseite ein?', 'Registriere dich und trag im Dashboard deine Leistungen und Preise (Leistungen) und deine Arbeitszeiten (Profil → Bearbeiten) ein. Deine Buchungsseite ist sofort fertig.'],
        ['Wo lege ich meine Arbeitszeiten fest?', 'Dashboard → Profil → Bearbeiten → Arbeitszeiten. Schalte die Tage ab, an denen du geschlossen hast. Kunden können nur buchen, wenn du geöffnet hast.'],
        ['Wie trage ich Leistungen und Preise ein?', 'Dashboard → Leistungen. Gib Name, Dauer und Preis ein. Kunden wählen beim Buchen eine Leistung.'],
        ['Ist Snippr kostenlos?', `Jeden Tarif kannst du ${TRIAL_DAYS} Tage kostenlos testen, ohne Kreditkarte. Nach dem Test wird nichts abgebucht.`],
      ]],
      ['Termine', [
        ['Wie buchen Kunden?', 'Sie öffnen deinen Link, wählen Leistung, Tag und Uhrzeit und geben ihren Namen ein. Keine App und kein Konto nötig.'],
        ['Wo finde ich meinen Link und QR-Code?', 'Dashboard → Link. Kopiere den Link für Instagram oder WhatsApp oder lade den QR-Code für deinen Laden herunter.'],
        ['Können zwei Kunden dieselbe Zeit buchen?', 'Nein. Sobald eine Zeit vergeben ist, wird sie für alle anderen automatisch geschlossen.'],
        ['Bekommen Kunden eine Bestätigung?', 'Ja. Wenn sie ihre E-Mail angeben, bekommen sie eine Bestätigung mit Datum, Uhrzeit und Preis.'],
        ['Wie werde ich über neue Termine benachrichtigt?', 'Schalte Benachrichtigungen ein, wenn das Dashboard fragt. Neue Termine erscheinen auch sofort in deinem Kalender.'],
      ]],
      ['Konto', [
        ['Wie ändere ich Passwort oder E-Mail?', 'Dashboard → Profil → Bearbeiten. Vergessen? Nutze „Passwort vergessen?“ auf der Anmeldeseite.'],
        ['Wie ändere ich Währung, Sprache oder Zeitzone?', 'Dashboard → Einstellungen.'],
        ['Wie lösche ich mein Konto?', 'Dashboard → Einstellungen → Konto löschen. Dein Konto und seine Termine werden entfernt.'],
      ]],
      ['Zahlungen', [
        ['Nimmt Snippr Zahlungen an?', 'Nein. Kunden bezahlen dich direkt im Laden. Snippr nimmt nie einen Anteil.'],
      ]],
    ],
    contactTitle: 'Noch Hilfe nötig?', contactBody: 'Schreib uns, wir antworten per E-Mail.',
    write: 'E-Mail schreiben', copy: 'Adresse kopieren', copied: 'Kopiert', faq: 'Alle Fragen', back: 'Startseite',
  },
  ar: {
    title: 'المساعدة والدعم', sub: 'كيف يمكننا المساعدة؟', search: 'ابحث في المساعدة', none: 'لا توجد نتائج. جرّب كلمات أخرى أو راسلنا أدناه.',
    quick: [
      ['البداية', 'أضف الخدمات والساعات', '/dashboard/services', Rocket],
      ['رابط الحجز', 'شاركه أو اطبع رمز QR', '/dashboard/link', Link2],
      ['نسيت كلمة المرور', 'رابط إعادة تعيين بالبريد', '/forgot-password', KeyRound],
      ['تواصل معنا', 'نرد بالبريد الإلكتروني', '#contact', Mail],
    ],
    groups: [
      ['البداية', [
        ['كيف أُعدّ صفحة الحجز؟', 'سجّل، ثم أضف في لوحتك خدماتك وأسعارك (الخدمات) وساعات عملك (الملف الشخصي ← تعديل). صفحة الحجز جاهزة فورًا.'],
        ['أين أضبط ساعات العمل؟', 'اللوحة ← الملف الشخصي ← تعديل ← ساعات العمل. أغلق الأيام التي لا تعمل فيها. لا يمكن للعملاء الحجز إلا عندما تكون مفتوحًا.'],
        ['كيف أضيف الخدمات والأسعار؟', 'اللوحة ← الخدمات. أدخل الاسم والمدة والسعر. يختار العملاء خدمة عند الحجز.'],
        ['هل Snippr مجاني؟', `يمكنك تجربة كل الخطط مجانًا لمدة ${TRIAL_DAYS} يومًا بدون بطاقة ائتمان، ولا يُخصم شيء عند انتهاء التجربة.`],
      ]],
      ['الحجوزات', [
        ['كيف يحجز العملاء؟', 'يفتحون رابطك ويختارون خدمة ويومًا ووقتًا ويكتبون اسمهم. لا حاجة لتطبيق أو حساب.'],
        ['أين أجد رابطي ورمز QR؟', 'اللوحة ← الرابط. انسخ الرابط لإنستغرام أو واتساب، أو نزّل رمز QR لمحلك.'],
        ['هل يمكن لعميلين حجز الوقت نفسه؟', 'لا. بمجرد حجز وقت يُغلق تلقائيًا للجميع.'],
        ['هل يحصل العملاء على تأكيد؟', 'نعم، إذا تركوا بريدهم يحصلون على تأكيد بالتاريخ والوقت والسعر.'],
        ['كيف أعرف بالحجوزات الجديدة؟', 'شغّل الإشعارات عندما تطلبها اللوحة. تظهر الحجوزات الجديدة أيضًا في تقويمك فورًا.'],
      ]],
      ['الحساب', [
        ['كيف أغيّر كلمة المرور أو البريد؟', 'اللوحة ← الملف الشخصي ← تعديل. نسيتها؟ استخدم "نسيت كلمة المرور؟" في صفحة تسجيل الدخول.'],
        ['كيف أغيّر العملة أو اللغة أو المنطقة الزمنية؟', 'اللوحة ← الإعدادات.'],
        ['كيف أحذف حسابي؟', 'اللوحة ← الإعدادات ← حذف الحساب. يُحذف حسابك ومواعيده.'],
      ]],
      ['الدفع', [
        ['هل يستقبل Snippr المدفوعات؟', 'لا. يدفع لك العملاء مباشرة في محلك، ولا يأخذ Snippr أي نسبة.'],
      ]],
    ],
    contactTitle: 'ما زلت تحتاج مساعدة؟', contactBody: 'راسلنا وسنرد عليك بالبريد الإلكتروني.',
    write: 'اكتب رسالة', copy: 'انسخ العنوان', copied: 'تم النسخ', faq: 'كل الأسئلة', back: 'الرئيسية',
  },
}

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif"

export default function HelpPage() {
  // dashboard language first, then the browser language
  const detected = useSyncExternalStore(() => () => {}, (): Lng => {
    try { const s = localStorage.getItem('snippr-lang'); if (isSiteLng(s)) return s } catch { /* blocked */ }
    return browserSiteLng()
  }, (): Lng => 'en')
  const [choice, setChoice] = useState<Lng | null>(null)
  const lng = choice ?? detected
  const c = C[lng]
  const locale = ({ en: 'en-GB', nl: 'nl-NL', de: 'de-DE', tr: 'tr-TR', ar: 'ar' } as Record<Lng, string>)[lng]

  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const groups = useMemo(() => {
    const s = q.trim().toLocaleLowerCase(locale)
    if (!s) return c.groups
    return c.groups
      .map(([name, items]) => [name, items.filter(([a, b]) => (a + ' ' + b).toLocaleLowerCase(locale).includes(s))] as [string, QA[]])
      .filter(([, items]) => items.length)
  }, [q, c, locale])

  const copy = async () => {
    try { await navigator.clipboard.writeText(SUPPORT_EMAIL); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* clipboard blocked: the address is shown as text */ }
  }

  return (
    <main className="min-h-screen bg-[#f2f2f7] text-[#1c1c1e]" style={{ fontFamily: FONT, colorScheme: 'light' }}>
      <div className="mx-auto max-w-[760px] px-4 pt-6 pb-24 sm:px-6">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 rounded-full px-2 py-1.5 text-[15px] font-medium text-[#0a84ff] hover:bg-white/70">
            <ArrowLeft size={18} /> {c.back}
          </Link>
          <div className="flex rounded-[10px] bg-[#e3e3e8] p-0.5" role="group" aria-label="Language">
            {SITE_LANGS.map(x => x.code).map(l => (
              <button key={l} onClick={() => { setChoice(l); try { localStorage.setItem('snippr-lang', l) } catch { /* blocked */ } }}
                className="relative rounded-[8px] px-3 py-1 text-[13px] font-semibold transition-colors"
                style={{ color: lng === l ? '#1c1c1e' : '#6e6e73' }}>
                {lng === l && <motion.span layoutId="lng-pill" className="absolute inset-0 rounded-[8px] bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                <span className="relative">{l.toUpperCase()}</span>
              </button>
            ))}
          </div>
        </div>

        {/* title + search */}
        <div className="mt-8 flex items-center gap-3">
          <div>
            <h1 className="text-[34px] leading-tight font-bold tracking-[-0.02em]">{c.title}</h1>
            <p className="text-[15px] text-[#6e6e73]">{c.sub}</p>
          </div>
        </div>
        <label className="mt-6 flex items-center gap-2 rounded-[12px] bg-[#e3e3e8] px-3 py-2.5 focus-within:bg-white focus-within:shadow-[0_0_0_2px_rgba(10,132,255,0.35)] transition-all">
          <Search size={17} className="text-[#8e8e93]" />
          <input id="help-search" value={q} onChange={e => setQ(e.target.value)} placeholder={c.search}
            className="w-full bg-transparent text-[16px] outline-none placeholder:text-[#8e8e93]" />
        </label>

        {/* quick actions */}
        {!q && (
          <div className="mt-6 grid grid-cols-2 gap-3">
            {c.quick.map(([title, sub, href, Icon], i) => (
              <motion.a key={href} href={href} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col gap-3 rounded-[18px] bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)]">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] text-white" style={{ background: ['#ff9500', '#0a84ff', '#34c759', '#5e5ce6'][i] }}>
                  <Icon size={19} />
                </span>
                <span>
                  <span className="block text-[15px] font-semibold">{title}</span>
                  <span className="block text-[13px] text-[#6e6e73]">{sub}</span>
                </span>
              </motion.a>
            ))}
          </div>
        )}

        {/* questions, grouped like iOS Settings */}
        {groups.length === 0 && <p className="mt-8 text-center text-[15px] text-[#6e6e73]">{c.none}</p>}
        {groups.map(([name, items]) => (
          <section key={name} className="mt-8">
            <h2 className="mb-2 px-4 text-[13px] font-medium uppercase tracking-[0.04em] text-[#6e6e73]">{name}</h2>
            <div className="overflow-hidden rounded-[14px] bg-white">
              {items.map(([question, answer], i) => {
                const id = name + i, isOpen = open === id || !!q.trim()
                return (
                  <div key={question} className={i ? 'border-t border-[#e5e5ea] ml-4' : ''}>
                    <button onClick={() => setOpen(isOpen && !q.trim() ? null : id)} aria-expanded={isOpen}
                      className={`flex w-full items-center gap-3 py-3.5 pr-4 text-left active:bg-[#f2f2f7] ${i ? '' : 'pl-4'}`}>
                      <span className="flex-1 text-[16px]">{question}</span>
                      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={18} className="text-[#c7c7cc]" />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                          <p className={`pb-4 pr-4 text-[15px] leading-relaxed text-[#3a3a3c] ${i ? '' : 'pl-4'}`}>{answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        {/* contact */}
        <section id="contact" className="mt-10 scroll-mt-6 rounded-[18px] bg-white p-5">
          <h2 className="text-[20px] font-bold">{c.contactTitle}</h2>
          <p className="mt-1 text-[15px] text-[#6e6e73]">{c.contactBody}</p>
          <p className="mt-4 select-all rounded-[10px] bg-[#f2f2f7] px-3 py-2.5 text-[15px] font-medium">{SUPPORT_EMAIL}</p>
          <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
            <a href={`mailto:${SUPPORT_EMAIL}?subject=Snippr`} className="flex-1 rounded-full bg-[#1c1c1e] px-5 py-3 text-center text-[15px] font-semibold text-white active:scale-[0.98] transition-transform">{c.write}</a>
            <button onClick={copy} className="flex flex-1 items-center justify-center gap-2 rounded-full border border-[#d1d1d6] bg-white px-5 py-3 text-[15px] font-medium active:scale-[0.98] transition-transform">
              {copied ? <Check size={16} className="text-[#34c759]" /> : <Copy size={16} />} {copied ? c.copied : c.copy}
            </button>
          </div>
          <Link href="/faq" className="mt-4 inline-block text-[15px] font-medium text-[#0a84ff]">{c.faq} →</Link>
        </section>
      </div>
    </main>
  )
}
