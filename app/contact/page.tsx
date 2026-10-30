'use client'

// Contact: ways to reach Snippr plus a message form (app/api/contact). Light iOS style,
// in Turkish, Dutch, English and Arabic, like the pricing, about and help pages.

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, BookOpen, Check, Copy, HelpCircle, Mail, Send, Sparkles, type LucideIcon } from 'lucide-react'
import { SUPPORT_EMAIL, SUPPORT_WHATSAPP } from '@/lib/site'
import { useStored, useClientValue, writeStored } from '@/lib/use-stored'
import { WhatsAppIcon } from '@/components/brand-icons'

type Lng = 'tr' | 'nl' | 'en' | 'ar'
type Topic = 'account' | 'bookings' | 'billing' | 'idea' | 'other'

const T = {
  tr: {
    back: 'Ana sayfa', h1a: 'Buradayız.', h1b: 'Nasıl yardımcı olabiliriz?',
    sub: 'Hesabın, randevuların ya da Snippr hakkında bir sorun mu var? Bize yaz, e-postana cevap verelim.',
    emailT: 'E-posta', emailD: 'Bize doğrudan e-posta gönder.', copy: 'Kopyala', copied: 'Kopyalandı', write: 'Yaz',
    waT: 'WhatsApp', waD: 'Hızlı sorular için mesaj at.', waGo: 'Sohbeti aç',
    helpT: 'Yardım merkezi', helpD: 'Adım adım rehberler ve ipuçları.', faqT: 'Sık sorulan sorular', faqD: 'Ödeme, planlar ve daha fazlası.', open: 'Aç',
    formT: 'Bize mesaj gönder', formD: 'Formu doldur, mesajın doğrudan destek ekibimize gelsin.',
    name: 'Adın', email: 'E-posta adresin', topic: 'Konu', message: 'Mesajın', messagePh: 'Ne oldu, nasıl yardımcı olabiliriz?',
    topics: { account: 'Hesabım', bookings: 'Randevular', billing: 'Ödeme ve planlar', idea: 'Öneri', other: 'Diğer' } as Record<Topic, string>,
    send: 'Gönder', sending: 'Gönderiliyor…', sentT: 'Mesajın ulaştı!', sentD: 'En kısa sürede e-postana cevap vereceğiz.', another: 'Yeni mesaj yaz',
    err: { name: 'Lütfen adını yaz.', email: 'Geçerli bir e-posta adresi yaz.', message: 'Mesajın en az 10 karakter olmalı.', rate: 'Çok fazla mesaj gönderdin. Lütfen bir saat sonra tekrar dene.', server: 'Gönderilemedi. Lütfen tekrar dene ya da bize e-posta at.' },
    privacy: 'Bilgilerini sadece mesajına cevap vermek için kullanırız.', privacyLink: 'Gizlilik',
    ctaT: 'Berber misin?', ctaD: 'Ücretsiz hesap aç, birkaç dakikada kendi randevu linkin hazır olsun.', ctaB: 'Ücretsiz başla',
  },
  nl: {
    back: 'Home', h1a: 'We zijn er voor je.', h1b: 'Waarmee kunnen we helpen?',
    sub: 'Vragen over je account, afspraken of Snippr? Stuur ons een bericht, we antwoorden per e-mail.',
    emailT: 'E-mail', emailD: 'Mail ons rechtstreeks.', copy: 'Kopiëren', copied: 'Gekopieerd', write: 'Mailen',
    waT: 'WhatsApp', waD: 'Stuur een bericht voor snelle vragen.', waGo: 'Chat openen',
    helpT: 'Helpcentrum', helpD: 'Stap-voor-stap uitleg en tips.', faqT: 'Veelgestelde vragen', faqD: 'Betalingen, abonnementen en meer.', open: 'Openen',
    formT: 'Stuur ons een bericht', formD: 'Vul het formulier in en je bericht komt direct bij ons supportteam.',
    name: 'Je naam', email: 'Je e-mailadres', topic: 'Onderwerp', message: 'Je bericht', messagePh: 'Wat is er gebeurd en hoe kunnen we helpen?',
    topics: { account: 'Mijn account', bookings: 'Afspraken', billing: 'Betaling & abonnementen', idea: 'Idee', other: 'Overig' } as Record<Topic, string>,
    send: 'Versturen', sending: 'Bezig met versturen…', sentT: 'Je bericht is verstuurd!', sentD: 'We antwoorden zo snel mogelijk per e-mail.', another: 'Nieuw bericht',
    err: { name: 'Vul je naam in.', email: 'Vul een geldig e-mailadres in.', message: 'Je bericht moet minstens 10 tekens hebben.', rate: 'Je hebt te veel berichten gestuurd. Probeer het over een uur opnieuw.', server: 'Versturen is niet gelukt. Probeer het opnieuw of mail ons.' },
    privacy: 'We gebruiken je gegevens alleen om je bericht te beantwoorden.', privacyLink: 'Privacy',
    ctaT: 'Ben je kapper?', ctaD: 'Maak een gratis account en heb binnen een paar minuten je eigen boekingslink.', ctaB: 'Gratis beginnen',
  },
  en: {
    back: 'Home', h1a: 'We’re here.', h1b: 'How can we help?',
    sub: 'Questions about your account, bookings or Snippr? Send us a message and we’ll reply by email.',
    emailT: 'Email', emailD: 'Email us directly.', copy: 'Copy', copied: 'Copied', write: 'Write',
    waT: 'WhatsApp', waD: 'Message us for quick questions.', waGo: 'Open chat',
    helpT: 'Help center', helpD: 'Step-by-step guides and tips.', faqT: 'FAQ', faqD: 'Payments, plans and more.', open: 'Open',
    formT: 'Send us a message', formD: 'Fill in the form and your message goes straight to our support team.',
    name: 'Your name', email: 'Your email', topic: 'Topic', message: 'Your message', messagePh: 'What happened, and how can we help?',
    topics: { account: 'My account', bookings: 'Bookings', billing: 'Payments & plans', idea: 'Idea', other: 'Other' } as Record<Topic, string>,
    send: 'Send', sending: 'Sending…', sentT: 'Message sent!', sentD: 'We’ll reply by email as soon as we can.', another: 'Write another',
    err: { name: 'Please enter your name.', email: 'Please enter a valid email address.', message: 'Your message needs at least 10 characters.', rate: 'Too many messages. Please try again in an hour.', server: 'Could not send. Please try again or email us.' },
    privacy: 'We only use your details to answer your message.', privacyLink: 'Privacy',
    ctaT: 'Are you a barber?', ctaD: 'Create a free account and get your own booking link in a few minutes.', ctaB: 'Get started free',
  },
  ar: {
    back: 'الرئيسية', h1a: 'نحن هنا.', h1b: 'كيف يمكننا مساعدتك؟',
    sub: 'لديك سؤال عن حسابك أو مواعيدك أو عن Snippr؟ راسلنا وسنردّ عليك عبر البريد.',
    emailT: 'البريد الإلكتروني', emailD: 'راسلنا مباشرة عبر البريد.', copy: 'نسخ', copied: 'تم النسخ', write: 'اكتب',
    waT: 'واتساب', waD: 'راسلنا للأسئلة السريعة.', waGo: 'افتح المحادثة',
    helpT: 'مركز المساعدة', helpD: 'أدلة خطوة بخطوة ونصائح.', faqT: 'الأسئلة الشائعة', faqD: 'الدفع والخطط والمزيد.', open: 'افتح',
    formT: 'أرسل لنا رسالة', formD: 'املأ النموذج وستصل رسالتك مباشرة إلى فريق الدعم.',
    name: 'اسمك', email: 'بريدك الإلكتروني', topic: 'الموضوع', message: 'رسالتك', messagePh: 'ماذا حدث، وكيف يمكننا مساعدتك؟',
    topics: { account: 'حسابي', bookings: 'المواعيد', billing: 'الدفع والخطط', idea: 'اقتراح', other: 'أخرى' } as Record<Topic, string>,
    send: 'إرسال', sending: 'جارٍ الإرسال…', sentT: 'تم إرسال رسالتك!', sentD: 'سنردّ عليك عبر البريد الإلكتروني في أقرب وقت.', another: 'اكتب رسالة جديدة',
    err: { name: 'يرجى إدخال اسمك.', email: 'يرجى إدخال بريد إلكتروني صحيح.', message: 'يجب أن تحتوي رسالتك على 10 أحرف على الأقل.', rate: 'أرسلت رسائل كثيرة. يرجى المحاولة بعد ساعة.', server: 'تعذّر الإرسال. حاول مرة أخرى أو راسلنا عبر البريد.' },
    privacy: 'نستخدم بياناتك فقط للرد على رسالتك.', privacyLink: 'الخصوصية',
    ctaT: 'هل أنت حلاق؟', ctaD: 'أنشئ حسابًا مجانيًا واحصل على رابط الحجز الخاص بك خلال دقائق.', ctaB: 'ابدأ مجانًا',
  },
}

const LANG_NAMES: Record<Lng, string> = { tr: 'Türkçe', nl: 'Nederlands', en: 'English', ar: 'العربية' }
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif"
const ease = [0.22, 1, 0.36, 1] as const
const field = 'w-full rounded-[14px] bg-[#f2f2f7] px-4 py-3 text-[16px] text-[#1d1d1f] outline-none ring-1 ring-transparent transition placeholder:text-[#aeaeb2] focus:bg-white focus:ring-[#1d1d1f]/30'

function Card({ icon: Icon, grad, title, desc, children }: { icon: LucideIcon | typeof WhatsAppIcon; grad: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <motion.div whileHover={{ y: -3 }} className="flex flex-col rounded-[24px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_20px_40px_-26px_rgba(0,0,0,0.35)]">
      <span className="flex h-11 w-11 items-center justify-center rounded-[13px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" style={{ background: grad }}>
        <Icon size={21} strokeWidth={2.1} />
      </span>
      <h3 className="mt-5 text-[17px] font-semibold text-[#1d1d1f]">{title}</h3>
      <p className="mt-1 flex-1 text-[14.5px] text-[#6e6e73]">{desc}</p>
      <div className="mt-5 flex flex-wrap gap-2">{children}</div>
    </motion.div>
  )
}

const pillDark = 'inline-flex items-center gap-1.5 rounded-full bg-[#1d1d1f] px-4 py-2 text-[14px] font-semibold text-white transition hover:bg-black'
const pillLight = 'inline-flex items-center gap-1.5 rounded-full bg-[#f2f2f7] px-4 py-2 text-[14px] font-semibold text-[#1d1d1f] transition hover:bg-[#e8e8ed]'

export default function ContactPage() {
  const saved = useStored('snippr-lang')
  const navLang = useClientValue<Lng>(() => {
    const n = (navigator.language || '').toLowerCase()
    return n.startsWith('tr') ? 'tr' : n.startsWith('nl') ? 'nl' : n.startsWith('ar') ? 'ar' : 'en'
  }, 'en')
  const lng: Lng = saved === 'tr' || saved === 'nl' || saved === 'en' || saved === 'ar' ? saved : navLang
  const t = T[lng]
  const dir = lng === 'ar' ? 'rtl' : 'ltr'

  const [copied, setCopied] = useState(false)
  const [f, setF] = useState({ name: '', email: '', topic: 'account' as Topic, message: '', website: '' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [sent, setSent] = useState(false)

  const copy = async () => { try { await navigator.clipboard.writeText(SUPPORT_EMAIL); setCopied(true); setTimeout(() => setCopied(false), 1800) } catch { /* blocked */ } }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setErr('')
    if (!f.name.trim()) return setErr(t.err.name)
    if (!/^\S+@\S+\.\S+$/.test(f.email.trim())) return setErr(t.err.email)
    if (f.message.trim().length < 10) return setErr(t.err.message)
    setBusy(true)
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...f, lang: lng }) })
      const j = await res.json().catch(() => ({}))
      if (!res.ok) { setErr(t.err[(j.error as keyof typeof t.err) ?? 'server'] ?? t.err.server); return }
      setSent(true)
    } catch {
      setErr(t.err.server)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main dir={dir} lang={lng} className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]" style={{ fontFamily: FONT, colorScheme: 'light' }}>
      <div className="mx-auto max-w-[1080px] px-4 pt-6 pb-24 sm:px-6">
        {/* top bar */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center gap-1 rounded-full px-2 py-1.5 text-[15px] font-medium text-[#0a84ff] hover:bg-white/70">
            <ArrowLeft size={18} className="rtl:-scale-x-100" /> {t.back}
          </Link>
          <div lang="mul" className="flex flex-wrap gap-1 rounded-full bg-[#e3e3e8] p-[3px]">
            {(['tr', 'nl', 'en', 'ar'] as Lng[]).map(l => (
              <button key={l} onClick={() => writeStored('snippr-lang', l)} className="relative rounded-full px-3 py-1 text-[13px] font-semibold" style={{ color: lng === l ? '#1c1c1e' : '#6e6e73' }}>
                {lng === l && <motion.span layoutId="contact-lang" className="absolute inset-0 rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.12)]" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                <span className="relative">{LANG_NAMES[l]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* header */}
        <header className="mx-auto mt-12 max-w-[720px] text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease }}
            className="text-[clamp(38px,6.4vw,64px)] leading-[1.04] font-semibold tracking-[-0.035em]" style={{ textWrap: 'balance' }}>
            <span className="block bg-gradient-to-b from-[#8e95b0] to-[#a9aec4] bg-clip-text text-transparent">{t.h1a}</span>
            <span className="block">{t.h1b}</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08, ease }}
            className="mx-auto mt-5 max-w-[560px] text-[17px] leading-relaxed text-[#3a3a3c]">{t.sub}</motion.p>
        </header>

        {/* ways to reach us */}
        <section className={`mt-12 grid gap-3 sm:grid-cols-2 ${SUPPORT_WHATSAPP ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`}>
          <Card icon={Mail} grad="linear-gradient(145deg,#9a8cff,#5e5ce6)" title={t.emailT} desc={t.emailD}>
            <a href={`mailto:${SUPPORT_EMAIL}`} className={pillDark}><Mail size={15} /> {t.write}</a>
            <button onClick={copy} className={pillLight}>{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? t.copied : t.copy}</button>
            <p className="w-full truncate pt-1 text-[13px] text-[#8e8e93]" dir="ltr">{SUPPORT_EMAIL}</p>
          </Card>
          {SUPPORT_WHATSAPP && (
            <Card icon={WhatsAppIcon} grad="linear-gradient(145deg,#5ff07f,#1ebe57)" title={t.waT} desc={t.waD}>
              <a href={`https://wa.me/${SUPPORT_WHATSAPP}`} target="_blank" rel="noopener noreferrer" className={pillDark}>{t.waGo}</a>
            </Card>
          )}
          <Card icon={BookOpen} grad="linear-gradient(145deg,#ffc24d,#ff7a00)" title={t.helpT} desc={t.helpD}>
            <Link href="/help" className={pillLight}>{t.open} <ArrowRight size={15} className="rtl:-scale-x-100" /></Link>
          </Card>
          <Card icon={HelpCircle} grad="linear-gradient(145deg,#5ac8fa,#0a63e8)" title={t.faqT} desc={t.faqD}>
            <Link href="/faq" className={pillLight}>{t.open} <ArrowRight size={15} className="rtl:-scale-x-100" /></Link>
          </Card>
        </section>

        {/* form */}
        <section className="mt-3 grid gap-3 lg:grid-cols-[1.4fr_1fr]">
          <div className="rounded-[28px] bg-white p-6 sm:p-9">
            <AnimatePresence mode="wait" initial={false}>
              {sent ? (
                <motion.div key="sent" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex min-h-[380px] flex-col items-center justify-center text-center">
                  <motion.span initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }}
                    className="flex h-20 w-20 items-center justify-center rounded-full text-white" style={{ background: 'radial-gradient(circle at 32% 28%, #7be38f, #1fa44a)', boxShadow: '0 16px 40px -12px rgba(31,164,74,0.6)' }}>
                    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                      <motion.path d="M5 12.5l4.5 4.5L19 7.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.45, delay: 0.25 }} />
                    </svg>
                  </motion.span>
                  <h2 className="mt-6 text-[26px] font-semibold tracking-[-0.02em]">{t.sentT}</h2>
                  <p className="mt-2 max-w-[340px] text-[15.5px] text-[#6e6e73]">{t.sentD}</p>
                  <button onClick={() => { setSent(false); setF(x => ({ ...x, message: '' })) }} className={`${pillLight} mt-6`}>{t.another}</button>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} noValidate>
                  <h2 className="text-[24px] font-semibold tracking-[-0.02em]">{t.formT}</h2>
                  <p className="mt-1 text-[15px] text-[#6e6e73]">{t.formD}</p>
                  <div className="mt-6 grid gap-3 sm:grid-cols-2">
                    <label className="block"><span className="mb-1.5 block text-[13.5px] font-semibold">{t.name}</span>
                      <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} maxLength={100} autoComplete="name" className={field} /></label>
                    <label className="block"><span className="mb-1.5 block text-[13.5px] font-semibold">{t.email}</span>
                      <input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} type="email" maxLength={254} autoComplete="email" dir="ltr" className={field} /></label>
                  </div>
                  <p className="mt-4 mb-2 text-[13.5px] font-semibold">{t.topic}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(Object.keys(t.topics) as Topic[]).map(k => (
                      <button type="button" key={k} onClick={() => setF({ ...f, topic: k })} aria-pressed={f.topic === k}
                        className="rounded-full px-3.5 py-1.5 text-[14px] font-semibold transition"
                        style={f.topic === k ? { background: '#1d1d1f', color: '#fff' } : { background: '#f2f2f7', color: '#3a3a3c' }}>
                        {t.topics[k]}
                      </button>
                    ))}
                  </div>
                  <label className="mt-4 block"><span className="mb-1.5 block text-[13.5px] font-semibold">{t.message}</span>
                    <textarea value={f.message} onChange={e => setF({ ...f, message: e.target.value })} rows={6} maxLength={3000} placeholder={t.messagePh} className={`${field} resize-none`} /></label>
                  {/* hidden from people; bots fill it in */}
                  <input type="text" tabIndex={-1} autoComplete="off" aria-hidden="true" value={f.website} onChange={e => setF({ ...f, website: e.target.value })}
                    className="absolute h-0 w-0 opacity-0" style={{ left: -9999 }} name="website" />
                  {err && <p className="mt-3 text-[14px] font-medium text-[#ff3b30]">{err}</p>}
                  <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-[13px] text-[#8e8e93]">{t.privacy} <Link href="/privacy" className="font-semibold text-[#0a84ff]">{t.privacyLink}</Link></p>
                    <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-full bg-[#1d1d1f] px-6 py-3 text-[15px] font-semibold text-white transition hover:bg-black disabled:opacity-50">
                      <Send size={16} className="rtl:-scale-x-100" /> {busy ? t.sending : t.send}
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </div>

          {/* barber sign-up */}
          <div className="relative flex flex-col justify-end overflow-hidden rounded-[28px] bg-[#1c1c1e] p-7 text-white sm:p-9">
            <motion.span aria-hidden className="pointer-events-none absolute -top-20 -right-16 h-64 w-64 rounded-full opacity-60 blur-3xl"
              style={{ background: 'conic-gradient(from 0deg, #ff6b9a, #c28bff, #6ea8ff, #ffb340, #ff6b9a)' }}
              animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} />
            <span className="relative flex h-11 w-11 items-center justify-center rounded-[13px] bg-white/15"><Sparkles size={21} /></span>
            <h3 className="relative mt-16 text-[26px] font-semibold tracking-[-0.02em]">{t.ctaT}</h3>
            <p className="relative mt-2 text-[15.5px] text-white/70">{t.ctaD}</p>
            <Link href="/register" className="relative mt-6 inline-flex items-center gap-2 self-start rounded-full bg-white px-5 py-3 text-[15px] font-semibold text-[#1c1c1e] hover:bg-white/90">
              {t.ctaB} <ArrowRight size={16} className="rtl:-scale-x-100" />
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
