'use client'

// Plans & pricing, iOS style. Kept honest and in line with the dashboard's Plans page
// (app/dashboard/plans/page.tsx): only Free exists today; Pro and Business are "coming soon".
import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import LangCurrencyPicker from '@/components/lang-currency-picker'
import { convertFromUSD, formatMoney, useCurrencyChoice } from '@/lib/currency'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Link2, QrCode, CalendarDays, Mail, Bell, LifeBuoy, Sparkles, BellRing, Wallet, BarChart3, Palette, Zap,
  Users, CalendarRange, FileBarChart, Check, Info, ArrowLeft, CreditCard, type LucideIcon,
} from 'lucide-react'

type Lng = 'en' | 'tr'
type Feature = [LucideIcon, string, string] // icon, label, explanation
type Plan = {
  id: 'free' | 'pro' | 'business'; name: string; tagline: string
  monthly: number; yearly: number; available: boolean
  features: Feature[]; foot: [string, string]; badge: string
  orb: string; ring: string
}

const T = {
  en: {
    eyebrow: 'PLANS & PRICING', h1a: 'Fill every chair.', h1b: 'Pay only when you grow.',
    sub: 'Everything Snippr does today is free. Pro and Business are on the way, and you keep all your data when they launch.',
    monthly: 'Monthly', yearly: 'Yearly', save: '2 months free',
    perMonth: '/mo', billedYearly: (n: string) => `Billed yearly as ${n}`, billedMonthly: 'Billed monthly', freeNote: 'Free while you grow',
    included: "What's included:", get: 'Get', access: 'access', soon: 'Coming soon', current: 'Available now',
    faqTitle: 'Questions about plans?', faqBody: 'Payments, switching plans, what happens to your data.', faqLink: 'Read the FAQ', back: 'Home',
    plans: [
      { id: 'free', name: 'Free', tagline: 'Everything Snippr does today.', monthly: 0, yearly: 0, available: true, badge: 'FREE',
        orb: 'conic-gradient(from 200deg, #34c759, #30d5c8, #0a84ff, #34c759)', ring: '#111',
        foot: ['No credit card needed.', 'No surprise charges.'],
        features: [
          [Link2, 'Your own booking page & link', 'A page with your name where clients book in seconds.'],
          [QrCode, 'QR code for your shop', 'Print it for the mirror or the door; clients scan and book.'],
          [CalendarDays, 'Live calendar', 'New bookings appear instantly. Taken times close for everyone else.'],
          [Mail, 'Confirmation emails', 'Clients who leave their email get the date, time and price.'],
          [Bell, 'New-booking notifications', 'Get notified on your phone or computer.'],
          [LifeBuoy, 'Email support', 'Write to us and we answer by email.'],
        ] },
      { id: 'pro', name: 'Pro', tagline: 'For barbers who want to grow.', monthly: 6, yearly: 60, available: false, badge: 'PRO',
        orb: 'conic-gradient(from 30deg, #ff9f0a, #ff375f, #bf5af2, #ff9f0a)', ring: '#111',
        foot: ['Coming soon.', 'You keep all your data.'],
        features: [
          [Sparkles, 'Everything in Free', 'All free features stay included.'],
          [BellRing, 'Automatic reminders', 'Clients get a reminder before their appointment, so fewer no-shows.'],
          [Wallet, 'Online deposits', 'Ask for a small deposit when booking.'],
          [BarChart3, 'Analytics & revenue', 'See bookings, busy hours and earnings at a glance.'],
          [Palette, 'Custom branding', 'Your colours and photos on your booking page.'],
          [Zap, 'Priority support', 'Your questions go to the front of the line.'],
        ] },
      { id: 'business', name: 'Business', tagline: 'For shops with a team.', monthly: 15, yearly: 150, available: false, badge: 'BUSINESS',
        orb: 'conic-gradient(from 120deg, #5e5ce6, #0a84ff, #64d2ff, #5e5ce6)', ring: '#1c1c5e',
        foot: ['Coming soon.', 'You keep all your data.'],
        features: [
          [Sparkles, 'Everything in Pro', 'All Pro features stay included.'],
          [Users, 'Multiple staff members', 'Every barber in your shop gets their own calendar.'],
          [CalendarRange, 'Team calendar', 'See the whole shop’s day in one view.'],
          [FileBarChart, 'Advanced reports', 'Revenue per barber and per service.'],
        ] },
    ] as Plan[],
  },
  tr: {
    eyebrow: 'PLANLAR VE FİYATLAR', h1a: 'Her koltuğu doldur.', h1b: 'Büyüdükçe öde.',
    sub: 'Snippr’ın bugün yaptığı her şey ücretsiz. Pro ve Business yolda; geldiklerinde tüm verilerin seninle kalır.',
    monthly: 'Aylık', yearly: 'Yıllık', save: '2 ay bedava',
    perMonth: '/ay', billedYearly: (n: string) => `Yıllık ${n} olarak ödenir`, billedMonthly: 'Aylık ödenir', freeNote: 'Büyürken ücretsiz',
    included: 'Neler dahil:', get: '', access: 'erişimi al', soon: 'Yakında', current: 'Şimdi kullanılabilir',
    faqTitle: 'Planlarla ilgili sorun mu var?', faqBody: 'Ödeme, plan değiştirme, verilerine ne olacağı.', faqLink: 'SSS’yi oku', back: 'Ana sayfa',
    plans: [
      { id: 'free', name: 'Free', tagline: 'Snippr’ın bugün yaptığı her şey.', monthly: 0, yearly: 0, available: true, badge: 'FREE',
        orb: 'conic-gradient(from 200deg, #34c759, #30d5c8, #0a84ff, #34c759)', ring: '#111',
        foot: ['Kredi kartı gerekmez.', 'Sürpriz ücret yok.'],
        features: [
          [Link2, 'Kendi randevu sayfan ve linkin', 'Müşterilerin saniyeler içinde randevu aldığı, adını taşıyan sayfa.'],
          [QrCode, 'Dükkânın için QR kod', 'Aynaya ya da kapıya yapıştır; müşteri okutup randevu alır.'],
          [CalendarDays, 'Canlı takvim', 'Yeni randevular anında düşer. Dolu saatler herkese kapanır.'],
          [Mail, 'Onay e-postaları', 'E-postasını bırakan müşteriye tarih, saat ve fiyat gider.'],
          [Bell, 'Yeni randevu bildirimi', 'Telefonuna ya da bilgisayarına bildirim gelir.'],
          [LifeBuoy, 'E-posta desteği', 'Bize yaz, e-postayla cevap verelim.'],
        ] },
      { id: 'pro', name: 'Pro', tagline: 'Büyümek isteyen berberler için.', monthly: 6, yearly: 60, available: false, badge: 'PRO',
        orb: 'conic-gradient(from 30deg, #ff9f0a, #ff375f, #bf5af2, #ff9f0a)', ring: '#111',
        foot: ['Yakında.', 'Tüm verilerin seninle kalır.'],
        features: [
          [Sparkles, 'Free’deki her şey', 'Ücretsiz özelliklerin hepsi dahil.'],
          [BellRing, 'Otomatik hatırlatma', 'Müşteriye randevudan önce hatırlatma gider, gelmeyen azalır.'],
          [Wallet, 'Online kapora', 'Randevu alırken küçük bir kapora iste.'],
          [BarChart3, 'Analiz ve kazanç', 'Randevuları, yoğun saatleri ve kazancını bir bakışta gör.'],
          [Palette, 'Kendi markan', 'Randevu sayfanda kendi renklerin ve fotoğrafların.'],
          [Zap, 'Öncelikli destek', 'Soruların sıranın en önüne geçer.'],
        ] },
      { id: 'business', name: 'Business', tagline: 'Ekibi olan dükkânlar için.', monthly: 15, yearly: 150, available: false, badge: 'BUSINESS',
        orb: 'conic-gradient(from 120deg, #5e5ce6, #0a84ff, #64d2ff, #5e5ce6)', ring: '#1c1c5e',
        foot: ['Yakında.', 'Tüm verilerin seninle kalır.'],
        features: [
          [Sparkles, 'Pro’daki her şey', 'Pro özelliklerinin hepsi dahil.'],
          [Users, 'Birden fazla berber', 'Dükkândaki her berberin kendi takvimi olur.'],
          [CalendarRange, 'Ekip takvimi', 'Tüm dükkânın gününü tek ekranda gör.'],
          [FileBarChart, 'Gelişmiş raporlar', 'Berber ve hizmet bazında kazanç.'],
        ] },
    ] as Plan[],
  },
}

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif"

function Tip({ text }: { text: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button type="button" aria-label={text} onClick={() => setOpen(o => !o)} onBlur={() => setOpen(false)}
        className="ml-1 inline-flex text-[#aeaeb2] hover:text-[#6e6e73] focus-visible:text-[#6e6e73]">
        <Info size={14} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.span role="tooltip" initial={{ opacity: 0, y: 4, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-[calc(100%+8px)] left-1/2 z-20 w-[220px] -translate-x-1/2 rounded-[12px] bg-[#1c1c1e]/95 px-3 py-2 text-[12.5px] leading-snug font-normal text-white shadow-lg backdrop-blur">
            {text}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}

// big price: currency symbol and number shown separately
function moneyParts(n: number, cur: string) {
  const full = formatMoney(n, cur)
  try {
    const parts = new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, currencyDisplay: 'narrowSymbol', minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 }).formatToParts(n)
    return {
      symbol: parts.filter(x => x.type === 'currency').map(x => x.value).join(''),
      number: parts.filter(x => x.type !== 'currency').map(x => x.value).join('').trim(),
      full,
    }
  } catch {
    return { symbol: '', number: String(n), full }
  }
}

export default function PricingPage() {
  const detected = useSyncExternalStore(() => () => {}, (): Lng => {
    try { const s = localStorage.getItem('snippr-lang'); if (s && s.includes('tr')) return 'tr'; if (s && s.includes('en')) return 'en' } catch { /* blocked */ }
    return (navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'en'
  }, (): Lng => 'en')
  const [choice, setChoice] = useState<Lng | null>(null)
  const lng = choice ?? detected
  const t = T[lng]
  const [yearly, setYearly] = useState(true)
  const [cur] = useCurrencyChoice()
  const chooseLng = (l: Lng) => { setChoice(l); try { localStorage.setItem('snippr-lang', l) } catch { /* storage blocked */ } }
  // plan prices are set in USD and shown in the visitor's currency (rounded)
  const priceOf = (p: Plan): [number, number] => [convertFromUSD(p.monthly, cur), convertFromUSD(p.yearly, cur)]
  const money = (n: number) => moneyParts(n, cur)

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]" style={{ fontFamily: FONT, colorScheme: 'light' }}>
      <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-24 sm:px-6">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 rounded-full px-2 py-1.5 text-[15px] font-medium text-[#0a84ff] hover:bg-white/70">
            <ArrowLeft size={18} /> {t.back}
          </Link>
          <LangCurrencyPicker lng={lng} setLng={chooseLng} />
        </div>

        {/* header */}
        <header className="mx-auto mt-10 max-w-[720px] text-center">
          <div className="flex flex-col items-center gap-2 text-[#ff6a00]">
            <CreditCard size={22} />
            <p className="font-mono text-[13px] font-semibold tracking-[0.12em]">{t.eyebrow}</p>
          </div>
          <h1 className="mt-4 text-[clamp(38px,6.4vw,68px)] leading-[1.02] font-semibold tracking-[-0.035em]" style={{ textWrap: 'balance' }}>
            <span className="block bg-gradient-to-b from-[#8e95b0] to-[#a9aec4] bg-clip-text text-transparent">{t.h1a}</span>
            <span className="block">{t.h1b}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-relaxed text-[#3a3a3c]">{t.sub}</p>

          {/* monthly / yearly, iOS segmented control */}
          <div className="mt-8 inline-flex items-center gap-3">
            <div className="relative flex rounded-[12px] bg-[#e3e3e8] p-[3px]">
              {[false, true].map(y => (
                <button key={String(y)} onClick={() => setYearly(y)} className="relative min-w-[96px] rounded-[9px] px-4 py-1.5 text-[14px] font-semibold"
                  style={{ color: yearly === y ? '#1c1c1e' : '#6e6e73' }}>
                  {yearly === y && <motion.span layoutId="billing" className="absolute inset-0 rounded-[9px] bg-white shadow-[0_3px_8px_rgba(0,0,0,0.12),0_1px_1px_rgba(0,0,0,0.04)]" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                  <span className="relative">{y ? t.yearly : t.monthly}</span>
                </button>
              ))}
            </div>
            <span className="rounded-full bg-[#34c759]/12 px-2.5 py-1 text-[12px] font-semibold text-[#248a3d]">{t.save}</span>
          </div>
        </header>

        {/* plans */}
        <section className="mt-12 rounded-[36px] bg-white p-3 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.25)] sm:p-4">
          <div className="grid gap-3 lg:grid-cols-3">
            {t.plans.map((p, i) => {
              const [mo, yr] = priceOf(p)
              const perMonth = yearly ? Math.round((yr / 12) * 100) / 100 : mo
              const featured = p.available
              return (
                <motion.article key={p.id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.08 * i, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col rounded-[28px] p-6 sm:p-8" style={{ background: featured ? '#f2f2f7' : '#ffffff' }}>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-[32px] leading-none font-semibold tracking-[-0.02em]">{p.name}</h2>
                      <p className="mt-3 text-[17px] text-[#3a3a3c]">{p.tagline}</p>
                    </div>
                    {/* glossy orb, slowly turning */}
                    <motion.span aria-hidden className="h-12 w-12 flex-shrink-0 rounded-full" style={{ background: p.orb, boxShadow: 'inset -6px -8px 14px rgba(0,0,0,0.18), inset 6px 6px 12px rgba(255,255,255,0.55)' }}
                      animate={{ rotate: 360 }} transition={{ duration: 14, repeat: Infinity, ease: 'linear' }} />
                  </div>

                  <div className="mt-8 flex items-end gap-1">
                    <span className="bg-gradient-to-br from-[#ff6b9a] via-[#c28bff] to-[#6ea8ff] bg-clip-text text-[52px] leading-none font-semibold text-transparent">{money(perMonth).symbol}</span>
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span key={`${p.id}-${yearly}-${cur}`} initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -14, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        className="text-[52px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
                        {money(perMonth).number}
                      </motion.span>
                    </AnimatePresence>
                    {p.monthly > 0 && <span className="mb-1 text-[18px] text-[#6e6e73]">{t.perMonth}</span>}
                  </div>
                  <p className="mt-2 text-[15px] text-[#6e6e73]">
                    {p.monthly === 0 ? t.freeNote : yearly ? t.billedYearly(money(yr).full) : t.billedMonthly}
                  </p>

                  <div className="my-7 h-px bg-[#e5e5ea]" />
                  <p className="text-[15px] text-[#6e6e73]">{t.included}</p>
                  <ul className="mt-4 flex flex-1 flex-col gap-4">
                    {p.features.map(([Icon, label, tip]) => (
                      <li key={label} className="flex items-center gap-3 text-[16px]">
                        <Icon size={19} strokeWidth={1.8} className="flex-shrink-0 text-[#1d1d1f]" />
                        <span className="flex flex-1 items-center">{label}<Tip text={tip} /></span>
                        <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-[#e5e5ea]">
                          <Check size={13} strokeWidth={3} className="text-[#1d1d1f]" />
                        </span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-9 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
                    <p className="min-w-[150px] flex-1 text-[14px] leading-snug">
                      <span className="block text-[#6e6e73]">{p.foot[0]}</span>
                      <span className="block">{p.foot[1]}</span>
                    </p>
                    {p.available ? (
                      <motion.div whileTap={{ scale: 0.96 }}>
                        <Link href="/register" className="inline-flex items-center gap-2 whitespace-nowrap rounded-full px-5 py-3.5 text-[15px] font-semibold text-white shadow-[0_10px_24px_-10px_rgba(0,0,0,0.6)]" style={{ background: p.ring }}>
                          {t.get && <span>{t.get}</span>}
                          <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] font-bold tracking-[0.06em] text-[#111]">{p.badge}</span>
                          <span>{t.access}</span>
                        </Link>
                      </motion.div>
                    ) : (
                      <span className="inline-flex cursor-default items-center gap-2 whitespace-nowrap rounded-full px-5 py-3.5 text-[15px] font-semibold text-white/90" style={{ background: p.ring, opacity: 0.55 }} aria-disabled="true">
                        <span className="rounded-full bg-white/90 px-2 py-0.5 font-mono text-[11px] font-bold tracking-[0.06em] text-[#111]">{p.badge}</span>
                        {t.soon}
                      </span>
                    )}
                  </div>
                </motion.article>
              )
            })}
          </div>
        </section>

        {/* faq link */}
        <section className="mx-auto mt-12 flex max-w-[720px] flex-col items-center gap-3 rounded-[24px] bg-white px-6 py-8 text-center">
          <h2 className="text-[22px] font-semibold">{t.faqTitle}</h2>
          <p className="text-[15px] text-[#6e6e73]">{t.faqBody}</p>
          <Link href="/faq" className="mt-1 text-[15px] font-semibold text-[#0a84ff]">{t.faqLink} →</Link>
        </section>
      </div>
    </main>
  )
}
