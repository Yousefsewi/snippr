'use client'

// Plans: Solo / Salon / Pro, with the monthly–yearly switch, the founder offer, add-ons and
// a comparison table. Shared by the public pricing page (app/pricing) and the dashboard
// (app/dashboard/plans). Prices are fixed in euros excl. VAT (lib/legal.ts).
// Honest on purpose: features that don't exist yet are marked "coming soon"; payments are
// not live yet, so everyone uses Snippr for free during early access.

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Clock, Minus, MessageSquareText, Mail, Sparkles } from 'lucide-react'
import SubscriptionTerms from '@/components/subscription-terms'
import { PLAN_PRICES_EUR, FOUNDER_DISCOUNT, FOUNDER_SPOTS, TRIAL_DAYS, SMS_PACK } from '@/lib/legal'

export type Lng = 'en' | 'tr'
type PlanId = 'solo' | 'salon' | 'pro'
type Item = [string, boolean?] // label, coming soon?

const eur = (n: number) => `€${n.toFixed(2).replace('.', ',')}`
const eur0 = (n: number) => (Number.isInteger(n) ? `€${n}` : eur(n))

const T = {
  en: {
    monthly: 'Monthly', yearly: 'Yearly', save: '2 months free',
    perMonth: '/mo', exVat: 'excl. VAT', billedYearly: (n: string) => `${n} per year`, billedMonthly: 'billed monthly',
    soonTag: 'soon', popular: 'Most chosen',
    founderTitle: `Founder offer: ${FOUNDER_DISCOUNT}% off for life`,
    founderBody: `For the first ${FOUNDER_SPOTS} shops that join. Solo for ${eur(PLAN_PRICES_EUR.solo.monthly * (1 - FOUNDER_DISCOUNT / 100))}/mo, for as long as you stay.`,
    early: `Early access: Snippr is free while we open payments. After that, every plan starts with ${TRIAL_DAYS} days free, no card needed.`,
    plans: {
      solo: { name: 'Solo', who: 'For one barber or stylist', cta: `Try ${TRIAL_DAYS} days free`, ctaDash: 'You use this for free now' },
      salon: { name: 'Salon', who: 'For a shop with 2–5 people', cta: 'Coming soon', ctaDash: 'Coming soon' },
      pro: { name: 'Pro', who: 'For bigger shops and chains', cta: 'Contact us', ctaDash: 'Contact us' },
    } as Record<PlanId, { name: string; who: string; cta: string; ctaDash: string }>,
    lists: {
      solo: [['Your own booking page, link and QR code'], ['Live calendar: day, week, month, drag to move'], ['Unlimited appointments and clients'], ['Email confirmations and reminders'], ['Waitlist'], ['Sales and tips reports, PDF/Excel export'], ['Booking page in 4 languages'], ['No commission on bookings']],
      salon: [['Everything in Solo'], ['Up to 5 staff, one fixed price', true], ['A calendar per staff member', true], ['Team view of the whole day', true], ['Reports per staff member', true]],
      pro: [['Everything in Salon'], ['Unlimited staff and locations', true], ['Help moving from your old system'], ['Priority support']],
    } as Record<PlanId, Item[]>,
    foot: { solo: 'No card needed', salon: 'No price per extra staff', pro: 'Price on request' } as Record<PlanId, string>,
    addonsTitle: 'Extras',
    addons: [
      [Mail, 'Email reminders', 'Unlimited, included in every plan', 'Included'],
      [MessageSquareText, 'SMS reminders', `Pack of ${SMS_PACK.count} SMS`, `${eur0(SMS_PACK.price)} · soon`],
    ] as [typeof Mail, string, string, string][],
    compareTitle: 'Compare plans',
    rows: [
      ['People in the shop', '1', '2–5', 'Unlimited'],
      ['Booking page, link and QR code', true, true, true],
      ['Live calendar and drag to move', true, true, true],
      ['Email confirmations and reminders', true, true, true],
      ['Waitlist', true, true, true],
      ['Sales reports and export', true, true, true],
      ['Calendar per staff member', false, 'soon', 'soon'],
      ['Reports per staff member', false, 'soon', 'soon'],
      ['Multiple locations', false, false, 'soon'],
      ['SMS reminders', 'add-on', 'add-on', 'add-on'],
      ['Commission on bookings', '0%', '0%', '0%'],
    ] as (string | boolean)[][],
    vatNote: 'All prices in euros, excluding 21% VAT (BTW).',
  },
  tr: {
    monthly: 'Aylık', yearly: 'Yıllık', save: '2 ay bedava',
    perMonth: '/ay', exVat: 'KDV hariç', billedYearly: (n: string) => `yıllık ${n}`, billedMonthly: 'aylık ödenir',
    soonTag: 'yakında', popular: 'En çok seçilen',
    founderTitle: `Kurucu teklifi: ömür boyu %${FOUNDER_DISCOUNT} indirim`,
    founderBody: `Katılan ilk ${FOUNDER_SPOTS} işletmeye. Solo aylık ${eur(PLAN_PRICES_EUR.solo.monthly * (1 - FOUNDER_DISCOUNT / 100))}, Snippr’da kaldığın sürece.`,
    early: `Erken erişim: Ödemeler açılana kadar Snippr ücretsiz. Sonrasında her plan ${TRIAL_DAYS} gün ücretsiz başlar, kart gerekmez.`,
    plans: {
      solo: { name: 'Solo', who: 'Tek berber ya da kuaför için', cta: `${TRIAL_DAYS} gün ücretsiz dene`, ctaDash: 'Şu an ücretsiz kullanıyorsun' },
      salon: { name: 'Salon', who: '2–5 kişilik dükkân için', cta: 'Yakında', ctaDash: 'Yakında' },
      pro: { name: 'Pro', who: 'Büyük dükkânlar ve zincirler için', cta: 'Bize ulaş', ctaDash: 'Bize ulaş' },
    } as Record<PlanId, { name: string; who: string; cta: string; ctaDash: string }>,
    lists: {
      solo: [['Kendi randevu sayfan, linkin ve QR kodun'], ['Canlı takvim: gün, hafta, ay, sürükleyerek taşı'], ['Sınırsız randevu ve müşteri'], ['E-posta onay ve hatırlatmaları'], ['Bekleme listesi'], ['Satış ve bahşiş raporları, PDF/Excel'], ['4 dilde randevu sayfası'], ['Randevulardan komisyon yok']],
      salon: [['Solo’daki her şey'], ['5 kişiye kadar, tek sabit fiyat', true], ['Her çalışana ayrı takvim', true], ['Bütün günü tek ekranda ekip görünümü', true], ['Çalışan bazında raporlar', true]],
      pro: [['Salon’daki her şey'], ['Sınırsız çalışan ve şube', true], ['Eski sisteminden taşınmada yardım'], ['Öncelikli destek']],
    } as Record<PlanId, Item[]>,
    foot: { solo: 'Kart gerekmez', salon: 'Ek çalışan başına ücret yok', pro: 'Fiyat görüşmeyle' } as Record<PlanId, string>,
    addonsTitle: 'Ekstralar',
    addons: [
      [Mail, 'E-posta hatırlatmaları', 'Sınırsız, her plana dahil', 'Dahil'],
      [MessageSquareText, 'SMS hatırlatmaları', `${SMS_PACK.count} SMS’lik paket`, `${eur0(SMS_PACK.price)} · yakında`],
    ] as [typeof Mail, string, string, string][],
    compareTitle: 'Planları karşılaştır',
    rows: [
      ['Dükkândaki kişi sayısı', '1', '2–5', 'Sınırsız'],
      ['Randevu sayfası, link ve QR kod', true, true, true],
      ['Canlı takvim ve sürükleyerek taşıma', true, true, true],
      ['E-posta onay ve hatırlatmaları', true, true, true],
      ['Bekleme listesi', true, true, true],
      ['Satış raporları ve dışa aktarma', true, true, true],
      ['Her çalışana ayrı takvim', false, 'soon', 'soon'],
      ['Çalışan bazında raporlar', false, 'soon', 'soon'],
      ['Birden fazla şube', false, false, 'soon'],
      ['SMS hatırlatmaları', 'add-on', 'add-on', 'add-on'],
      ['Randevulardan komisyon', '%0', '%0', '%0'],
    ] as (string | boolean)[][],
    vatNote: 'Tüm fiyatlar euro, %21 KDV (BTW) hariç.',
  },
}

const ORDER: PlanId[] = ['solo', 'salon', 'pro']

/** mode 'public': buttons lead to sign-up / contact. mode 'dashboard': Solo shows that it's free for them now. */
export default function PricingPlans({ lng, mode = 'public' }: { lng: Lng; cur?: string; mode?: 'public' | 'dashboard' }) {
  const t = T[lng] ?? T.en
  const [yearly, setYearly] = useState(false)

  const cell = (v: string | boolean) => {
    if (v === true) return <Check size={17} strokeWidth={2.6} className="mx-auto text-[#1d1d1f]" />
    if (v === false) return <Minus size={16} className="mx-auto text-[#c7c7cc]" />
    if (v === 'soon') return <span className="text-[12px] font-medium text-[#8e8e93]">{t.soonTag}</span>
    if (v === 'add-on') return <span className="text-[12px] font-medium text-[#3a3a3c]">+ SMS</span>
    return <span className="text-[14px] font-semibold text-[#1d1d1f]">{v}</span>
  }

  return (
    <>
      {/* early access + founder offer */}
      <div className="mx-auto mb-8 flex max-w-[860px] flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 items-start gap-3 rounded-[20px] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <Clock size={18} className="mt-0.5 flex-shrink-0 text-[#6e6e73]" />
          <p className="text-[14px] leading-snug text-[#3a3a3c]">{t.early}</p>
        </div>
        <div className="flex flex-1 items-start gap-3 rounded-[20px] bg-[#1d1d1f] px-5 py-4 text-white">
          <Sparkles size={18} className="mt-0.5 flex-shrink-0 text-[#ffd60a]" />
          <div>
            <p className="text-[14px] font-semibold">{t.founderTitle}</p>
            <p className="mt-0.5 text-[13px] leading-snug text-white/70">{t.founderBody}</p>
          </div>
        </div>
      </div>

      {/* monthly / yearly */}
      <div className="flex justify-center">
        <div className="inline-flex items-center gap-3">
          <div className="relative flex rounded-[12px] bg-[#e3e3e8] p-[3px]">
            {[false, true].map(y => (
              <button key={String(y)} onClick={() => setYearly(y)} className="relative min-w-[96px] rounded-[9px] px-4 py-1.5 text-[14px] font-semibold"
                style={{ color: yearly === y ? '#1c1c1e' : '#6e6e73' }}>
                {yearly === y && <motion.span layoutId={`billing-${mode}`} className="absolute inset-0 rounded-[9px] bg-white shadow-[0_3px_8px_rgba(0,0,0,0.12),0_1px_1px_rgba(0,0,0,0.04)]" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                <span className="relative">{y ? t.yearly : t.monthly}</span>
              </button>
            ))}
          </div>
          <span className="rounded-full bg-[#34c759]/12 px-2.5 py-1 text-[12px] font-semibold text-[#248a3d]">{t.save}</span>
        </div>
      </div>

      {/* plan cards */}
      <section className={`${mode === 'public' ? 'mt-10' : 'mt-6'} grid gap-4 ${mode === 'public' ? 'lg:grid-cols-3' : 'xl:grid-cols-3'}`}>
        {ORDER.map((id, i) => {
          const p = t.plans[id]
          const price = PLAN_PRICES_EUR[id]
          const shown = yearly ? Math.round((price.yearly / 12) * 100) / 100 : price.monthly
          const featured = id === 'solo'
          const dark = featured
          const href = id === 'pro' ? '/contact' : '/register'
          const live = id !== 'salon'
          return (
            <motion.article key={id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.07 * i, ease: [0.22, 1, 0.36, 1] }}
              className={`relative flex flex-col rounded-[28px] p-7 ${dark ? 'bg-[#1d1d1f] text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]' : 'bg-white text-[#1d1d1f] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'}`}>
              {featured && <span className="absolute top-6 right-6 rounded-full bg-[#ffd60a] px-2.5 py-1 text-[11.5px] font-bold text-[#1d1d1f]">{t.popular}</span>}
              <h2 className="text-[26px] font-semibold tracking-[-0.02em]">{p.name}</h2>
              <p className={`mt-1 text-[15px] ${dark ? 'text-white/65' : 'text-[#6e6e73]'}`}>{p.who}</p>

              <div className="mt-7 flex items-end gap-1.5">
                {id === 'pro' && <span className={`mb-1.5 text-[14px] ${dark ? 'text-white/60' : 'text-[#6e6e73]'}`}>{lng === 'tr' ? '' : 'from'}</span>}
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={`${id}-${yearly}`} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -12, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="text-[46px] leading-none font-semibold tracking-[-0.03em] tabular-nums">{eur(shown)}</motion.span>
                </AnimatePresence>
                <span className={`mb-1.5 text-[16px] ${dark ? 'text-white/60' : 'text-[#6e6e73]'}`}>{t.perMonth}{id === 'pro' && lng === 'tr' ? '’dan' : ''}</span>
              </div>
              <p className={`mt-2 text-[13.5px] ${dark ? 'text-white/55' : 'text-[#8e8e93]'}`}>
                {t.exVat} · {yearly ? t.billedYearly(eur0(price.yearly)) : t.billedMonthly}
              </p>

              <ul className="mt-7 flex flex-1 flex-col gap-3">
                {t.lists[id].map(([label, soon]) => (
                  <li key={label} className="flex items-start gap-2.5 text-[15px] leading-snug">
                    <Check size={17} strokeWidth={2.6} className={`mt-0.5 flex-shrink-0 ${soon ? (dark ? 'text-white/35' : 'text-[#c7c7cc]') : ''}`} />
                    <span className={soon ? (dark ? 'text-white/55' : 'text-[#8e8e93]') : ''}>
                      {label}{soon && <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold ${dark ? 'bg-white/10' : 'bg-[#f2f2f7]'}`}>{t.soonTag}</span>}
                    </span>
                  </li>
                ))}
              </ul>

              <p className={`mt-7 text-[13px] ${dark ? 'text-white/55' : 'text-[#8e8e93]'}`}>{t.foot[id]}</p>
              {mode === 'dashboard' && id === 'solo' ? (
                <span className="mt-3 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-white/10 text-[15px] font-semibold">
                  <Check size={16} strokeWidth={3} className="text-[#34c759]" /> {p.ctaDash}
                </span>
              ) : live ? (
                <Link href={href} className={`mt-3 inline-flex h-12 items-center justify-center rounded-full text-[15px] font-semibold transition ${dark ? 'bg-white text-[#1d1d1f] hover:bg-[#f2f2f7]' : 'bg-[#1d1d1f] text-white hover:bg-black'}`}>
                  {mode === 'dashboard' ? p.ctaDash : p.cta}
                </Link>
              ) : (
                <span aria-disabled="true" className="mt-3 inline-flex h-12 cursor-default items-center justify-center rounded-full bg-[#f2f2f7] text-[15px] font-semibold text-[#8e8e93]">{p.cta}</span>
              )}
            </motion.article>
          )
        })}
      </section>

      {/* extras */}
      <section className="mx-auto mt-6 max-w-[860px] rounded-[24px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-[16px] font-semibold text-[#1d1d1f]">{t.addonsTitle}</h3>
        <div className="mt-3 divide-y divide-[#f0f0f0]">
          {t.addons.map(([Icon, name, desc, price]) => (
            <div key={name} className="flex items-center gap-3 py-3">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-[10px] border border-[#ececec] bg-[#f7f7f8] text-[#6e6e73]"><Icon size={17} strokeWidth={1.75} /></span>
              <div className="min-w-0 flex-1"><p className="text-[15px] font-medium text-[#1d1d1f]">{name}</p><p className="text-[13px] text-[#8e8e93]">{desc}</p></div>
              <span className="text-[14px] font-semibold text-[#1d1d1f]">{price}</span>
            </div>
          ))}
        </div>
      </section>

      {/* comparison table */}
      <section className="mx-auto mt-6 max-w-[860px] overflow-x-auto rounded-[24px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-[16px] font-semibold text-[#1d1d1f]">{t.compareTitle}</h3>
        <table className="mt-3 w-full min-w-[520px] text-left">
          <thead>
            <tr className="border-b border-[#ececec] text-[13px] text-[#6e6e73]">
              <th className="py-2.5 font-medium" />
              {ORDER.map(id => <th key={id} className="w-[110px] py-2.5 text-center font-semibold text-[#1d1d1f]">{t.plans[id].name}</th>)}
            </tr>
          </thead>
          <tbody>
            {t.rows.map(([label, ...vals]) => (
              <tr key={String(label)} className="border-b border-[#f4f4f5] last:border-0">
                <td className="py-3 pr-3 text-[14px] text-[#3a3a3c]">{label}</td>
                {vals.map((v, k) => <td key={k} className="py-3 text-center">{cell(v)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-4 text-[12.5px] text-[#8e8e93]">{t.vatNote}</p>
      </section>

      {/* pre-contract information for paid plans */}
      <SubscriptionTerms lng={lng} />
    </>
  )
}
