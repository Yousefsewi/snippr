'use client'

// Dashboard → Plans & billing. Same plan cards as the public pricing page
// (components/pricing-plans.tsx), with Free marked as the barber's current plan.
import PricingPlans from '@/components/pricing-plans'
import { useCurrency } from '@/lib/currency'
import { useLang } from '@/lib/i18n'

const T = {
  en: {
    title: 'Plans & billing', sub: 'Choose the plan that fits your business.',
    noteStrong: 'Launch: every plan is free to try.', note: 'No card needed. Before payments open we’ll email you first, and you keep all your data. Nothing is ever charged without your OK.',
  },
  tr: {
    title: 'Planlar ve fatura', sub: 'İşletmene uyan planı seç.',
    noteStrong: 'Lansman: Bütün planları ücretsiz deneyebilirsin.', note: 'Kart gerekmez. Ödemeler açılmadan önce sana e-postayla haber veririz ve tüm verilerin seninle kalır. Onayın olmadan asla ödeme alınmaz.',
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

        <div className="mt-6 mb-8 rounded-[20px] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-[15px] leading-relaxed text-[#3a3a3c]"><strong className="text-[#1d1d1f]">{t.noteStrong}</strong> {t.note}</p>
        </div>

        <PricingPlans lng={lng} cur={currency} mode="dashboard" />
      </div>
    </div>
  )
}
