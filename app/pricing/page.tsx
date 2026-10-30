'use client'

// Plans & pricing, iOS style. The plan cards are shared with the dashboard's Plans page
// (components/pricing-plans.tsx): only Free exists today; Pro and Business are "coming soon".
import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import LangCurrencyPicker from '@/components/lang-currency-picker'
import PricingPlans, { type Lng } from '@/components/pricing-plans'
import { useCurrencyChoice } from '@/lib/currency'

const T = {
  en: {
    eyebrow: 'PLANS & PRICING', h1a: 'Fill every chair.', h1b: 'Pay only when you grow.',
    sub: 'Everything Snippr does today is free. Pro and Business are on the way, and you keep all your data when they launch.',
    faqTitle: 'Questions about plans?', faqBody: 'Payments, switching plans, what happens to your data.', faqLink: 'Read the FAQ', back: 'Home',
  },
  tr: {
    eyebrow: 'PLANLAR VE FİYATLAR', h1a: 'Her koltuğu doldur.', h1b: 'Büyüdükçe öde.',
    sub: 'Snippr’ın bugün yaptığı her şey ücretsiz. Pro ve Business yolda; geldiklerinde tüm verilerin seninle kalır.',
    faqTitle: 'Planlarla ilgili sorun mu var?', faqBody: 'Ödeme, plan değiştirme, verilerine ne olacağı.', faqLink: 'SSS’yi oku', back: 'Ana sayfa',
  },
}

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif"

export default function PricingPage() {
  const detected = useSyncExternalStore(() => () => {}, (): Lng => {
    try { const s = localStorage.getItem('snippr-lang'); if (s && s.includes('tr')) return 'tr'; if (s && s.includes('en')) return 'en' } catch { /* blocked */ }
    return (navigator.language || '').toLowerCase().startsWith('tr') ? 'tr' : 'en'
  }, (): Lng => 'en')
  const [choice, setChoice] = useState<Lng | null>(null)
  const lng = choice ?? detected
  const t = T[lng]
  const [cur] = useCurrencyChoice()
  const chooseLng = (l: Lng) => { setChoice(l); try { localStorage.setItem('snippr-lang', l) } catch { /* storage blocked */ } }

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
        <header className="mx-auto mt-10 mb-8 max-w-[720px] text-center">
          <h1 className="text-[clamp(38px,6.4vw,68px)] leading-[1.02] font-semibold tracking-[-0.035em]" style={{ textWrap: 'balance' }}>
            <span className="block bg-gradient-to-b from-[#8e95b0] to-[#a9aec4] bg-clip-text text-transparent">{t.h1a}</span>
            <span className="block">{t.h1b}</span>
          </h1>
          <p className="mx-auto mt-5 max-w-[560px] text-[17px] leading-relaxed text-[#3a3a3c]">{t.sub}</p>
        </header>

        <PricingPlans lng={lng} cur={cur} mode="public" />

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
