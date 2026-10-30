'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Heart, MessagesSquare, ShieldCheck, Zap, CalendarCheck, type LucideIcon } from 'lucide-react'
import { useStored, useClientValue, writeStored } from '@/lib/use-stored'
import LangCurrencyPicker from '@/components/lang-currency-picker'

type Lng = 'en' | 'tr'

const T = {
  en: {
    back: 'Home', eyebrow: 'ABOUT SNIPPR',
    h1a: 'Fewer phone calls.', h1b: 'More haircuts.',
    sub: 'We’re making barber booking simple, one appointment at a time.',
    storyTag: 'Our story',
    story: [
      'Snippr started with a simple observation: barbers spend more time managing appointments than cutting hair. Phone calls, WhatsApp messages, missed bookings — it’s chaos.',
      'So we built what we wished existed: a tool simple enough for a solo barber to set up in 2 minutes, and honest about what it does.',
      'Snippr is new and growing. Every barber who joins now helps shape what we build next — tell us what you need and we’ll build it with you.',
    ],
    before: 'Before', after: 'With Snippr',
    chat: ['Are you free tomorrow at 3?', 'Sorry, saw this late 🙏', 'What about 4?', 'Hello??'],
    notifTitle: 'New booking', notifBody: 'Haircut · Tomorrow 15:00', notifTime: 'now',
    valuesTag: 'What we believe',
    values: [
      ['Simplicity', 'Tools should be simple. Complicated software wastes a barber’s time.'],
      ['Reliability', 'Barbers depend on us for their income. We take that seriously.'],
      ['Barbers first', 'Everything we build, we build for barbers — not for us.'],
      ['Built with you', 'We listen to the barbers using Snippr and build what they actually ask for.'],
    ],
    stats: [['Free', 'to get started'], ['24/7', 'online booking'], ['0%', 'commission on bookings'], ['2 min', 'to set up']],
    ctaTitle: 'Join Snippr', ctaSub: 'Start taking online bookings today. Free — no credit card needed.',
    ctaStart: 'Get started free', ctaContact: 'Talk to us',
  },
  tr: {
    back: 'Ana sayfa', eyebrow: 'SNIPPR HAKKINDA',
    h1a: 'Daha az telefon.', h1b: 'Daha çok kesim.',
    sub: 'Berber randevusunu her seferinde bir randevuyla kolaylaştırıyoruz.',
    storyTag: 'Hikâyemiz',
    story: [
      'Snippr basit bir gözlemle başladı: berberler saç kesmekten çok randevu yönetmekle uğraşıyor. Telefonlar, WhatsApp mesajları, kaçan randevular — tam bir karmaşa.',
      'Biz de olmasını istediğimiz şeyi yaptık: tek başına çalışan bir berberin 2 dakikada kurabileceği kadar basit ve ne yaptığı konusunda dürüst bir araç.',
      'Snippr yeni ve büyüyor. Şimdi katılan her berber, sırada ne yapacağımızı birlikte belirliyor — neye ihtiyacın olduğunu söyle, birlikte yapalım.',
    ],
    before: 'Önce', after: 'Snippr ile',
    chat: ['Yarın 3’te boş musun?', 'Kusura bakma, geç gördüm 🙏', '4 olur mu?', 'Alo??'],
    notifTitle: 'Yeni randevu', notifBody: 'Saç kesimi · Yarın 15:00', notifTime: 'şimdi',
    valuesTag: 'İnandıklarımız',
    values: [
      ['Sadelik', 'Araçlar basit olmalı. Karmaşık yazılımlar berberin vaktini çalar.'],
      ['Güvenilirlik', 'Berberler kazançları için bize güveniyor. Bunu ciddiye alıyoruz.'],
      ['Önce berber', 'Yaptığımız her şeyi kendimiz için değil, berberler için yapıyoruz.'],
      ['Seninle birlikte', 'Snippr kullanan berberleri dinliyor, gerçekten istediklerini yapıyoruz.'],
    ],
    stats: [['Ücretsiz', 'başlamak için'], ['7/24', 'online randevu'], ['%0', 'randevu komisyonu'], ['2 dk', 'kurulum süresi']],
    ctaTitle: 'Snippr’a katıl', ctaSub: 'Bugün online randevu almaya başla. Ücretsiz — kredi kartı gerekmez.',
    ctaStart: 'Ücretsiz başla', ctaContact: 'Bize yaz',
  },
}

// iOS app-icon style tiles for the values
const VALUE_ICONS: [LucideIcon, string][] = [
  [Zap, 'linear-gradient(135deg,#ffb340,#ff7a00)'],
  [ShieldCheck, 'linear-gradient(135deg,#5ac8fa,#0a84ff)'],
  [Heart, 'linear-gradient(135deg,#ff6b9a,#ff2d55)'],
  [MessagesSquare, 'linear-gradient(135deg,#5fe08a,#28b463)'],
]

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif"
const ease = [0.22, 1, 0.36, 1] as const
// above the fold: plays on load
const enter = (d = 0) => ({ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: d, ease } })
const rise = (d = 0) => ({ initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: '-60px' }, transition: { duration: 0.6, delay: d, ease } })

export default function AboutPage() {
  const saved = useStored('snippr-lang')
  const navTr = useClientValue(() => (navigator.language || '').toLowerCase().startsWith('tr'), false)
  const lng: Lng = saved === 'tr' ? 'tr' : saved === 'en' ? 'en' : navTr ? 'tr' : 'en'
  const t = T[lng]

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f5f5f7] text-[#1d1d1f]" style={{ fontFamily: FONT, colorScheme: 'light' }}>
      <div className="mx-auto max-w-[1120px] px-4 pt-6 pb-24 sm:px-6">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 rounded-full px-2 py-1.5 text-[15px] font-medium text-[#0a84ff] hover:bg-white/70">
            <ArrowLeft size={18} /> {t.back}
          </Link>
          <LangCurrencyPicker lng={lng} setLng={l => writeStored('snippr-lang', l)} />
        </div>

        {/* hero */}
        <header className="mx-auto mt-14 max-w-[760px] text-center">
          <motion.h1 {...enter(0.05)} className="text-[clamp(40px,7vw,76px)] leading-[1.02] font-semibold tracking-[-0.035em]" style={{ textWrap: 'balance' }}>
            <span className="block bg-gradient-to-b from-[#8e95b0] to-[#a9aec4] bg-clip-text text-transparent">{t.h1a}</span>
            <span className="block">{t.h1b}</span>
          </motion.h1>
          <motion.p {...enter(0.1)} className="mx-auto mt-6 max-w-[540px] text-[18px] leading-relaxed text-[#3a3a3c]">{t.sub}</motion.p>
        </header>

        {/* story + before/after */}
        <motion.section {...rise()} className="mt-16 grid gap-3 rounded-[36px] bg-white p-3 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.25)] sm:p-4 lg:grid-cols-[1.1fr_1fr]">
          <div className="p-6 sm:p-10">
            <p className="text-[14px] font-semibold tracking-wide text-[#8e8e93] uppercase">{t.storyTag}</p>
            <div className="mt-5 flex flex-col gap-5 text-[17px] leading-[1.7] text-[#3a3a3c]">
              {t.story.map((p, i) => <p key={i} className={i === 0 ? 'text-[20px] leading-[1.55] font-medium text-[#1d1d1f]' : ''}>{p}</p>)}
            </div>
          </div>

          {/* little phone-style comparison */}
          <div className="flex flex-col gap-3 rounded-[28px] bg-[#f2f2f7] p-5 sm:p-7">
            <p className="text-[13px] font-semibold tracking-wide text-[#8e8e93] uppercase">{t.before}</p>
            <div className="flex flex-col gap-1.5">
              {t.chat.map((m, i) => (
                <motion.div key={m} initial={{ opacity: 0, y: 8, scale: 0.96 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
                  transition={{ delay: 0.15 + i * 0.18, type: 'spring', stiffness: 380, damping: 26 }}
                  className={`max-w-[78%] rounded-[18px] px-3.5 py-2 text-[15px] ${i % 2 ? 'self-end rounded-br-[6px] bg-[#34c759] text-white' : 'self-start rounded-bl-[6px] bg-white text-[#1d1d1f]'}`}>
                  {m}
                </motion.div>
              ))}
            </div>
            <p className="mt-4 text-[13px] font-semibold tracking-wide text-[#8e8e93] uppercase">{t.after}</p>
            <motion.div initial={{ opacity: 0, y: -14, scale: 0.97 }} whileInView={{ opacity: 1, y: 0, scale: 1 }} viewport={{ once: true }}
              transition={{ delay: 1, type: 'spring', stiffness: 300, damping: 24 }}
              className="flex items-center gap-3 rounded-[20px] bg-white/80 p-3.5 shadow-[0_8px_24px_-12px_rgba(0,0,0,0.25)] backdrop-blur">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon-192.png" alt="" className="h-10 w-10 rounded-[10px]" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[15px] font-semibold">{t.notifTitle}</p>
                  <p className="text-[12px] text-[#8e8e93]">{t.notifTime}</p>
                </div>
                <p className="mt-0.5 flex items-center gap-1.5 text-[14px] text-[#3a3a3c]"><CalendarCheck size={14} className="text-[#34c759]" /> {t.notifBody}</p>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* values */}
        <section className="mt-24">
          <motion.p {...rise()} className="text-center text-[14px] font-semibold tracking-wide text-[#8e8e93] uppercase">{t.valuesTag}</motion.p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {t.values.map(([title, desc], i) => {
              const [Icon, bg] = VALUE_ICONS[i]
              return (
                <motion.article key={title} {...rise(i * 0.07)} whileHover={{ y: -4 }}
                  className="rounded-[28px] bg-white p-7 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_20px_40px_-24px_rgba(0,0,0,0.3)]">
                  <span className="flex h-12 w-12 items-center justify-center rounded-[14px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]" style={{ background: bg }}>
                    <Icon size={23} strokeWidth={2.2} />
                  </span>
                  <h3 className="mt-6 text-[20px] font-semibold tracking-[-0.01em]">{title}</h3>
                  <p className="mt-2 text-[15.5px] leading-relaxed text-[#6e6e73]">{desc}</p>
                </motion.article>
              )
            })}
          </div>
        </section>

        {/* stats, widget style */}
        <section className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {t.stats.map(([n, label], i) => (
            <motion.div key={label} {...rise(i * 0.06)} className="rounded-[28px] bg-white px-6 py-8 text-center">
              <p className="bg-gradient-to-br from-[#ff6b9a] via-[#c28bff] to-[#6ea8ff] bg-clip-text text-[clamp(30px,4.4vw,46px)] leading-none font-semibold tracking-[-0.03em] text-transparent">{n}</p>
              <p className="mt-3 text-[15px] text-[#6e6e73]">{label}</p>
            </motion.div>
          ))}
        </section>

        {/* CTA */}
        <motion.section {...rise()} className="relative mt-24 overflow-hidden rounded-[36px] bg-[#1c1c1e] px-6 py-16 text-center text-white sm:px-12 sm:py-20">
          <motion.span aria-hidden className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full opacity-60 blur-3xl"
            style={{ background: 'conic-gradient(from 0deg, #ff6b9a, #c28bff, #6ea8ff, #ffb340, #ff6b9a)' }}
            animate={{ rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} />
          <div className="relative">
            <h2 className="text-[clamp(30px,4.6vw,48px)] leading-tight font-semibold tracking-[-0.03em]">{t.ctaTitle}</h2>
            <p className="mx-auto mt-4 max-w-[460px] text-[17px] text-white/70">{t.ctaSub}</p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link href="/register" className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[16px] font-semibold text-[#1c1c1e] transition hover:bg-white/90">
                {t.ctaStart} <ArrowRight size={17} />
              </Link>
              <Link href="/contact" className="rounded-full px-7 py-3.5 text-[16px] font-semibold text-white ring-1 ring-white/25 transition hover:bg-white/10">
                {t.ctaContact}
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </main>
  )
}
