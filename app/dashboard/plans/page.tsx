'use client'

// Dashboard → Plans & billing. Same plan cards as the public pricing page
// (components/pricing-plans.tsx), with Free marked as the barber's current plan.
import { Sparkles } from 'lucide-react'
import PricingPlans from '@/components/pricing-plans'
import { useCurrency } from '@/lib/currency'
import { useLang } from '@/lib/i18n'

const T = {
  en: {
    title: 'Plans & billing', sub: 'Choose the plan that fits your business.',
    noteStrong: 'Everything is free right now.', note: 'Pro and Business are coming soon, and you keep all your data when they launch. Nothing is ever charged without you choosing a paid plan.',
  },
  tr: {
    title: 'Planlar ve fatura', sub: 'İşletmene uyan planı seç.',
    noteStrong: 'Şu an her şey ücretsiz.', note: 'Pro ve Business yakında geliyor; geldiklerinde tüm verilerin seninle kalır. Ücretli bir plan seçmeden asla ödeme alınmaz.',
  },
}

export default function PlansPage() {
  const { lang } = useLang()
  const lng = lang === 'tr' ? 'tr' : 'en'
  const t = T[lng]
  const { currency } = useCurrency()

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-[#1d1d1f]" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif" }}>
      <div className="mx-auto max-w-[1200px] px-5 pt-10 pb-20 sm:px-8">
        <h1 className="text-[32px] font-semibold tracking-[-0.025em]">{t.title}</h1>
        <p className="mt-1 text-[16px] text-[#6e6e73]">{t.sub}</p>

        <div className="mt-6 mb-8 flex items-start gap-3 rounded-[20px] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[11px] text-white" style={{ background: 'linear-gradient(145deg,#34c759,#0a84ff)' }}>
            <Sparkles size={18} />
          </span>
          <p className="text-[15px] leading-relaxed text-[#3a3a3c]"><strong className="text-[#1d1d1f]">{t.noteStrong}</strong> {t.note}</p>
        </div>

        <PricingPlans lng={lng} cur={currency} mode="dashboard" />
      </div>
    </div>
  )
}
