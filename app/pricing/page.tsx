'use client'

// Plans & pricing, iOS style. The plan cards are shared with the dashboard's Plans page
// (components/pricing-plans.tsx): Solo, Salon and Pro; free during early access.
import { useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import LangCurrencyPicker from '@/components/lang-currency-picker'
import PricingPlans, { type Lng } from '@/components/pricing-plans'
import { useCurrencyChoice } from '@/lib/currency'
import { browserSiteLng, isSiteLng, type SiteLng } from '@/lib/site-lang'

const T = {
  en: {
    eyebrow: 'PLANS & PRICING', h1a: 'Fill every chair.', h1b: 'One fixed price. No commission.',
    sub: 'Pay the same every month, however many bookings you get. Snippr never takes a cut of your bookings.',
    faqTitle: 'Questions about plans?', faqBody: 'Payments, switching plans, what happens to your data.', faqLink: 'Read the FAQ', back: 'Home',
  },
  tr: {
    eyebrow: 'PLANLAR VE FİYATLAR', h1a: 'Her koltuğu doldur.', h1b: 'Sabit fiyat. Komisyon yok.',
    sub: 'Kaç randevu alırsan al, her ay aynı fiyatı ödersin. Snippr randevularından asla pay almaz.',
    faqTitle: 'Planlarla ilgili sorun mu var?', faqBody: 'Ödeme, plan değiştirme, verilerine ne olacağı.', faqLink: 'SSS’yi oku', back: 'Ana sayfa',
  },
}

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif"

export default function PricingPage() {
  // the site language (5 languages); this page's texts exist in English and Turkish so far
  const detected = useSyncExternalStore(() => () => {}, (): SiteLng => {
    try { const s = localStorage.getItem('snippr-lang'); if (isSiteLng(s)) return s } catch { /* blocked */ }
    return browserSiteLng()
  }, (): SiteLng => 'en')
  const [choice, setChoice] = useState<SiteLng | null>(null)
  const siteLng = choice ?? detected
  const lng: Lng = siteLng === 'tr' ? 'tr' : 'en'
  const t = T[lng]
  const [cur] = useCurrencyChoice()
  const chooseLng = (l: SiteLng) => { setChoice(l); try { localStorage.setItem('snippr-lang', l) } catch { /* storage blocked */ } }

  return (
    <main className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]" style={{ fontFamily: FONT, colorScheme: 'light' }}>
      <div className="mx-auto max-w-[1200px] px-4 pt-6 pb-24 sm:px-6">
        {/* top bar */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1 rounded-full px-2 py-1.5 text-[15px] font-medium text-[#0a84ff] hover:bg-white/70">
            <ArrowLeft size={18} /> {t.back}
          </Link>
          <LangCurrencyPicker lng={siteLng} setLng={chooseLng} />
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
