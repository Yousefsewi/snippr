'use client'

// Plans: Solo / Salon / Pro, with the monthly–yearly switch, the founder offer, add-ons and
// a comparison table. Shared by the public pricing page (app/pricing) and the dashboard
// (app/dashboard/plans). Prices are fixed in euros excl. VAT (lib/legal.ts).
// Features that don't exist yet are hidden (SHOW_UNRELEASED in lib/legal.ts); payments are
// not live yet, so everyone uses Snippr for free during early access.

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { isPlan } from '@/lib/plan'
import { L, type SiteLng } from '@/lib/site-lang'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Clock, Minus, MessageSquareText, Mail, Sparkles } from 'lucide-react'
import SubscriptionTerms from '@/components/subscription-terms'
import { PLAN_PRICES_EUR, FOUNDER_DISCOUNT, FOUNDER_SPOTS, TRIAL_DAYS, SMS_PACK, SHOW_UNRELEASED, VISIBLE_PLANS } from '@/lib/legal'

export type Lng = SiteLng
type PlanId = 'solo' | 'salon' | 'pro'
type Item = [string, boolean?] // label, coming soon?

const eur = (n: number) => `€${n.toFixed(2).replace('.', ',')}`
const eur0 = (n: number) => (Number.isInteger(n) ? `€${n}` : eur(n))

const T = {
  en: {
    monthly: 'Monthly', yearly: 'Yearly', save: '2 months free',
    perMonth: '/mo', exVat: 'excl. VAT', billedYearly: (n: string) => `${n} per year`, billedMonthly: 'billed monthly',
    soonTag: 'soon', popular: 'Most chosen', everythingSolo: 'Everything in Solo',
    founderTitle: `Founder offer: ${FOUNDER_DISCOUNT}% off for life`,
    founderBody: `For the first ${FOUNDER_SPOTS} shops that join. Solo for ${eur(PLAN_PRICES_EUR.solo.monthly * (1 - FOUNDER_DISCOUNT / 100))}/mo, for as long as you stay.`,
    early: `Launch: every plan is free for ${TRIAL_DAYS} days. No card needed, and nothing is charged when the trial ends.`, yourPlan: 'Your plan',
    plans: {
      solo: { name: 'Solo', who: 'For one barber or stylist', cta: `Try ${TRIAL_DAYS} days free`, ctaDash: 'Switch to this plan' },
      salon: { name: 'Salon', who: 'For a shop with 2–5 people', cta: `Try ${TRIAL_DAYS} days free`, ctaDash: 'Switch to this plan' },
      pro: { name: 'Pro', who: 'For bigger shops and chains', cta: `Try ${TRIAL_DAYS} days free`, ctaDash: 'Switch to this plan' },
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
    soonTag: 'yakında', popular: 'En çok seçilen', everythingSolo: 'Solo’daki her şey',
    founderTitle: `Kurucu teklifi: ömür boyu %${FOUNDER_DISCOUNT} indirim`,
    founderBody: `Katılan ilk ${FOUNDER_SPOTS} işletmeye. Solo aylık ${eur(PLAN_PRICES_EUR.solo.monthly * (1 - FOUNDER_DISCOUNT / 100))}, Snippr’da kaldığın sürece.`,
    early: `Lansman: Bütün planlar ${TRIAL_DAYS} gün ücretsiz. Kart gerekmez, deneme bitince otomatik ücret alınmaz.`, yourPlan: 'Senin planın',
    plans: {
      solo: { name: 'Solo', who: 'Tek berber ya da kuaför için', cta: `${TRIAL_DAYS} gün ücretsiz dene`, ctaDash: 'Bu plana geç' },
      salon: { name: 'Salon', who: '2–5 kişilik dükkân için', cta: `${TRIAL_DAYS} gün ücretsiz dene`, ctaDash: 'Bu plana geç' },
      pro: { name: 'Pro', who: 'Büyük dükkânlar ve zincirler için', cta: `${TRIAL_DAYS} gün ücretsiz dene`, ctaDash: 'Bu plana geç' },
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
  nl: {
    monthly: 'Maandelijks', yearly: 'Jaarlijks', save: '2 maanden gratis',
    perMonth: '/mnd', exVat: 'excl. btw', billedYearly: (n: string) => `${n} per jaar`, billedMonthly: 'per maand gefactureerd',
    soonTag: 'binnenkort', popular: 'Meest gekozen', everythingSolo: 'Alles uit Solo',
    founderTitle: `Oprichtersaanbod: levenslang ${FOUNDER_DISCOUNT}% korting`,
    founderBody: `Voor de eerste ${FOUNDER_SPOTS} zaken die meedoen. Solo voor ${eur(PLAN_PRICES_EUR.solo.monthly * (1 - FOUNDER_DISCOUNT / 100))}/mnd, zolang je blijft.`,
    early: `Lancering: elk abonnement is ${TRIAL_DAYS} dagen gratis. Geen kaart nodig, en er wordt niets afgeschreven als de proef afloopt.`, yourPlan: 'Jouw abonnement',
    plans: {
      solo: { name: 'Solo', who: 'Voor één kapper of stylist', cta: `${TRIAL_DAYS} dagen gratis proberen`, ctaDash: 'Overstappen naar dit abonnement' },
      salon: { name: 'Salon', who: 'Voor een zaak met 2–5 mensen', cta: `${TRIAL_DAYS} dagen gratis proberen`, ctaDash: 'Overstappen naar dit abonnement' },
      pro: { name: 'Pro', who: 'Voor grotere zaken en ketens', cta: `${TRIAL_DAYS} dagen gratis proberen`, ctaDash: 'Overstappen naar dit abonnement' },
    } as Record<PlanId, { name: string; who: string; cta: string; ctaDash: string }>,
    lists: {
      solo: [['Je eigen boekingspagina, link en QR-code'], ['Live agenda: dag, week, maand, slepen om te verplaatsen'], ['Onbeperkt afspraken en klanten'], ['Bevestigingen en herinneringen per e-mail'], ['Wachtlijst'], ['Omzet- en fooienoverzicht, PDF/Excel-export'], ['Boekingspagina in 4 talen'], ['Geen commissie op afspraken']],
      salon: [['Alles uit Solo'], ['Tot 5 medewerkers, één vaste prijs', true], ['Een agenda per medewerker', true], ['Teamoverzicht van de hele dag', true], ['Overzichten per medewerker', true]],
      pro: [['Alles uit Salon'], ['Onbeperkt medewerkers en vestigingen', true], ['Hulp bij overstappen van je oude systeem'], ['Voorrang bij support']],
    } as Record<PlanId, Item[]>,
    foot: { solo: 'Geen kaart nodig', salon: 'Geen prijs per extra medewerker', pro: 'Prijs op aanvraag' } as Record<PlanId, string>,
    addonsTitle: 'Extra’s',
    addons: [
      [Mail, 'Herinneringen per e-mail', 'Onbeperkt, bij elk abonnement inbegrepen', 'Inbegrepen'],
      [MessageSquareText, 'Sms-herinneringen', `Pakket van ${SMS_PACK.count} sms’jes`, `${eur0(SMS_PACK.price)} · binnenkort`],
    ] as [typeof Mail, string, string, string][],
    compareTitle: 'Abonnementen vergelijken',
    rows: [
      ['Mensen in de zaak', '1', '2–5', 'Onbeperkt'],
      ['Boekingspagina, link en QR-code', true, true, true],
      ['Live agenda en slepen om te verplaatsen', true, true, true],
      ['Bevestigingen en herinneringen per e-mail', true, true, true],
      ['Wachtlijst', true, true, true],
      ['Omzetoverzicht en export', true, true, true],
      ['Agenda per medewerker', false, 'soon', 'soon'],
      ['Overzichten per medewerker', false, 'soon', 'soon'],
      ['Meerdere vestigingen', false, false, 'soon'],
      ['Sms-herinneringen', 'add-on', 'add-on', 'add-on'],
      ['Commissie op afspraken', '0%', '0%', '0%'],
    ] as (string | boolean)[][],
    vatNote: 'Alle prijzen in euro, exclusief 21% btw.',
  },
  de: {
    monthly: 'Monatlich', yearly: 'Jährlich', save: '2 Monate gratis',
    perMonth: '/Monat', exVat: 'zzgl. MwSt.', billedYearly: (n: string) => `${n} pro Jahr`, billedMonthly: 'monatliche Abrechnung',
    soonTag: 'bald', popular: 'Am häufigsten gewählt', everythingSolo: 'Alles aus Solo',
    founderTitle: `Gründerangebot: ${FOUNDER_DISCOUNT} % Rabatt auf Lebenszeit`,
    founderBody: `Für die ersten ${FOUNDER_SPOTS} Läden, die mitmachen. Solo für ${eur(PLAN_PRICES_EUR.solo.monthly * (1 - FOUNDER_DISCOUNT / 100))}/Monat, solange du dabei bleibst.`,
    early: `Start: Jeder Tarif ist ${TRIAL_DAYS} Tage kostenlos. Keine Karte nötig, und nach dem Test wird nichts abgebucht.`, yourPlan: 'Dein Tarif',
    plans: {
      solo: { name: 'Solo', who: 'Für einen Barbier oder Stylisten', cta: `${TRIAL_DAYS} Tage kostenlos testen`, ctaDash: 'Zu diesem Tarif wechseln' },
      salon: { name: 'Salon', who: 'Für einen Laden mit 2–5 Personen', cta: `${TRIAL_DAYS} Tage kostenlos testen`, ctaDash: 'Zu diesem Tarif wechseln' },
      pro: { name: 'Pro', who: 'Für größere Läden und Ketten', cta: `${TRIAL_DAYS} Tage kostenlos testen`, ctaDash: 'Zu diesem Tarif wechseln' },
    } as Record<PlanId, { name: string; who: string; cta: string; ctaDash: string }>,
    lists: {
      solo: [['Deine eigene Buchungsseite, Link und QR-Code'], ['Live-Kalender: Tag, Woche, Monat, per Ziehen verschieben'], ['Unbegrenzt Termine und Kunden'], ['Bestätigungen und Erinnerungen per E-Mail'], ['Warteliste'], ['Umsatz- und Trinkgeldberichte, PDF/Excel-Export'], ['Buchungsseite in 4 Sprachen'], ['Keine Provision auf Buchungen']],
      salon: [['Alles aus Solo'], ['Bis zu 5 Mitarbeiter, ein fester Preis', true], ['Ein Kalender pro Mitarbeiter', true], ['Teamansicht des ganzen Tages', true], ['Berichte pro Mitarbeiter', true]],
      pro: [['Alles aus Salon'], ['Unbegrenzt Mitarbeiter und Standorte', true], ['Hilfe beim Umzug aus deinem alten System'], ['Bevorzugter Support']],
    } as Record<PlanId, Item[]>,
    foot: { solo: 'Keine Karte nötig', salon: 'Kein Preis pro zusätzlichem Mitarbeiter', pro: 'Preis auf Anfrage' } as Record<PlanId, string>,
    addonsTitle: 'Extras',
    addons: [
      [Mail, 'E-Mail-Erinnerungen', 'Unbegrenzt, in jedem Tarif enthalten', 'Inklusive'],
      [MessageSquareText, 'SMS-Erinnerungen', `Paket mit ${SMS_PACK.count} SMS`, `${eur0(SMS_PACK.price)} · bald`],
    ] as [typeof Mail, string, string, string][],
    compareTitle: 'Tarife vergleichen',
    rows: [
      ['Personen im Laden', '1', '2–5', 'Unbegrenzt'],
      ['Buchungsseite, Link und QR-Code', true, true, true],
      ['Live-Kalender und Verschieben per Ziehen', true, true, true],
      ['Bestätigungen und Erinnerungen per E-Mail', true, true, true],
      ['Warteliste', true, true, true],
      ['Umsatzberichte und Export', true, true, true],
      ['Kalender pro Mitarbeiter', false, 'soon', 'soon'],
      ['Berichte pro Mitarbeiter', false, 'soon', 'soon'],
      ['Mehrere Standorte', false, false, 'soon'],
      ['SMS-Erinnerungen', 'add-on', 'add-on', 'add-on'],
      ['Provision auf Buchungen', '0 %', '0 %', '0 %'],
    ] as (string | boolean)[][],
    vatNote: 'Alle Preise in Euro, zzgl. 21 % niederländischer MwSt. (BTW).',
  },
  ar: {
    monthly: 'شهري', yearly: 'سنوي', save: 'شهران مجانًا',
    perMonth: '/شهر', exVat: 'بدون ضريبة القيمة المضافة', billedYearly: (n: string) => `${n} سنويًا`, billedMonthly: 'يُدفع شهريًا',
    soonTag: 'قريبًا', popular: 'الأكثر اختيارًا', everythingSolo: 'كل ما في Solo',
    founderTitle: `عرض المؤسسين: خصم ${FOUNDER_DISCOUNT}% مدى الحياة`,
    founderBody: `لأول ${FOUNDER_SPOTS} محلًا تنضم. Solo مقابل ${eur(PLAN_PRICES_EUR.solo.monthly * (1 - FOUNDER_DISCOUNT / 100))} شهريًا طالما بقيت معنا.`,
    early: `إطلاق: كل الخطط مجانية لمدة ${TRIAL_DAYS} يومًا. لا حاجة لبطاقة، ولا يُخصم شيء عند انتهاء التجربة.`, yourPlan: 'خطتك',
    plans: {
      solo: { name: 'Solo', who: 'لحلاق أو مصفف واحد', cta: `جرّب ${TRIAL_DAYS} يومًا مجانًا`, ctaDash: 'انتقل إلى هذه الخطة' },
      salon: { name: 'Salon', who: 'لمحل فيه 2–5 أشخاص', cta: `جرّب ${TRIAL_DAYS} يومًا مجانًا`, ctaDash: 'انتقل إلى هذه الخطة' },
      pro: { name: 'Pro', who: 'للمحلات الكبيرة والسلاسل', cta: `جرّب ${TRIAL_DAYS} يومًا مجانًا`, ctaDash: 'انتقل إلى هذه الخطة' },
    } as Record<PlanId, { name: string; who: string; cta: string; ctaDash: string }>,
    lists: {
      solo: [['صفحة حجز خاصة بك مع رابط ورمز QR'], ['تقويم مباشر: يوم، أسبوع، شهر، اسحب لنقل المواعيد'], ['مواعيد وعملاء بلا حدود'], ['تأكيدات وتذكيرات بالبريد الإلكتروني'], ['قائمة انتظار'], ['تقارير المبيعات والإكراميات، تصدير PDF/Excel'], ['صفحة حجز بـ 4 لغات'], ['بدون عمولة على الحجوزات']],
      salon: [['كل ما في Solo'], ['حتى 5 موظفين بسعر ثابت', true], ['تقويم لكل موظف', true], ['عرض الفريق ليوم كامل', true], ['تقارير لكل موظف', true]],
      pro: [['كل ما في Salon'], ['موظفون وفروع بلا حدود', true], ['مساعدة في الانتقال من نظامك القديم'], ['دعم بأولوية']],
    } as Record<PlanId, Item[]>,
    foot: { solo: 'لا حاجة لبطاقة', salon: 'لا سعر إضافي لكل موظف', pro: 'السعر عند الطلب' } as Record<PlanId, string>,
    addonsTitle: 'إضافات',
    addons: [
      [Mail, 'تذكيرات بالبريد الإلكتروني', 'بلا حدود، ضمن كل الخطط', 'مشمول'],
      [MessageSquareText, 'تذكيرات SMS', `باقة ${SMS_PACK.count} رسالة`, `${eur0(SMS_PACK.price)} · قريبًا`],
    ] as [typeof Mail, string, string, string][],
    compareTitle: 'قارن الخطط',
    rows: [
      ['عدد الأشخاص في المحل', '1', '2–5', 'بلا حدود'],
      ['صفحة حجز ورابط ورمز QR', true, true, true],
      ['تقويم مباشر والسحب لنقل المواعيد', true, true, true],
      ['تأكيدات وتذكيرات بالبريد', true, true, true],
      ['قائمة انتظار', true, true, true],
      ['تقارير المبيعات والتصدير', true, true, true],
      ['تقويم لكل موظف', false, 'soon', 'soon'],
      ['تقارير لكل موظف', false, 'soon', 'soon'],
      ['فروع متعددة', false, false, 'soon'],
      ['تذكيرات SMS', 'add-on', 'add-on', 'add-on'],
      ['العمولة على الحجوزات', '0%', '0%', '0%'],
    ] as (string | boolean)[][],
    vatNote: 'جميع الأسعار باليورو، بدون ضريبة القيمة المضافة الهولندية 21%.',
  },
}

const ORDER: PlanId[] = VISIBLE_PLANS
const SOON_COL = ['solo', 'salon', 'pro'].map(id => VISIBLE_PLANS.includes(id as PlanId))

/** mode 'public': buttons lead to sign-up / contact. mode 'dashboard': Solo shows that it's free for them now. */
export default function PricingPlans({ lng, mode = 'public' }: { lng: Lng; cur?: string; mode?: 'public' | 'dashboard' }) {
  const t = T[lng] ?? T.en
  const [yearly, setYearly] = useState(false)
  // dashboard: the plan this account picked (lib/plan.ts), and switching to another one
  const [current, setCurrent] = useState<PlanId | null>(null)
  const [switching, setSwitching] = useState<PlanId | null>(null)
  useEffect(() => {
    if (mode !== 'dashboard') return
    supabase.auth.getUser().then(({ data: { user } }) => { const p = user?.user_metadata?.plan; if (isPlan(p)) setCurrent(p) })
  }, [mode])
  const switchTo = async (id: PlanId) => {
    setSwitching(id)
    const { error } = await supabase.auth.updateUser({ data: { plan: id } })
    setSwitching(null)
    if (!error) setCurrent(id)
  }
  // hide anything that isn't built yet
  const items = (id: PlanId): Item[] => SHOW_UNRELEASED ? t.lists[id] : t.lists[id]
    .filter(([, soon]) => !soon)
    .map(([label], i) => [id === 'pro' && i === 0 && !VISIBLE_PLANS.includes('salon') ? t.everythingSolo : label] as Item)
  const addons = t.addons.filter(a => SHOW_UNRELEASED || !a[3].includes(t.soonTag))
  const rows = t.rows
    .filter((r, i) => SHOW_UNRELEASED || i !== 0) // staff count: team features aren't built yet
    .filter(r => SHOW_UNRELEASED || !r.slice(1).includes('soon'))
    .filter(r => SHOW_UNRELEASED || !r.slice(1).includes('add-on'))
    .map(([label, ...vals]) => [label, ...vals.filter((_, k) => SOON_COL[k])])

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
      <section className={`${mode === 'public' ? 'mt-10' : 'mt-6'} grid gap-4 ${ORDER.length === 3 ? (mode === 'public' ? 'lg:grid-cols-3' : 'xl:grid-cols-3') : 'mx-auto max-w-[860px] md:grid-cols-2'}`}>
        {ORDER.map((id, i) => {
          const p = t.plans[id]
          const price = PLAN_PRICES_EUR[id]
          const shown = yearly ? Math.round((price.yearly / 12) * 100) / 100 : price.monthly
          const featured = id === 'solo'
          const dark = featured
          const href = `/register?plan=${id}`
          return (
            <motion.article key={id} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.07 * i, ease: [0.22, 1, 0.36, 1] }}
              className={`relative flex flex-col rounded-[28px] p-7 ${dark ? 'bg-[#1d1d1f] text-white shadow-[0_30px_60px_-30px_rgba(0,0,0,0.45)]' : 'bg-white text-[#1d1d1f] shadow-[0_1px_2px_rgba(0,0,0,0.04)]'}`}>
              {featured && <span className="absolute top-6 right-6 rounded-full bg-[#ffd60a] px-2.5 py-1 text-[11.5px] font-bold text-[#1d1d1f]">{t.popular}</span>}
              <h2 className="text-[26px] font-semibold tracking-[-0.02em]">{p.name}</h2>
              <p className={`mt-1 text-[15px] ${dark ? 'text-white/65' : 'text-[#6e6e73]'}`}>{p.who}</p>

              <div className="mt-7 flex items-end gap-1.5">
                {id === 'pro' && <span className={`mb-1.5 text-[14px] ${dark ? 'text-white/60' : 'text-[#6e6e73]'}`}>{L(lng, { en: 'from', nl: 'vanaf', de: 'ab', tr: '', ar: 'من' })}</span>}
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
                {items(id).map(([label, soon]) => (
                  <li key={label} className="flex items-start gap-2.5 text-[15px] leading-snug">
                    <Check size={17} strokeWidth={2.6} className={`mt-0.5 flex-shrink-0 ${soon ? (dark ? 'text-white/35' : 'text-[#c7c7cc]') : ''}`} />
                    <span className={soon ? (dark ? 'text-white/55' : 'text-[#8e8e93]') : ''}>
                      {label}{soon && <span className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10.5px] font-semibold ${dark ? 'bg-white/10' : 'bg-[#f2f2f7]'}`}>{t.soonTag}</span>}
                    </span>
                  </li>
                ))}
              </ul>

              <p className={`mt-7 text-[13px] ${dark ? 'text-white/55' : 'text-[#8e8e93]'}`}>{t.foot[id]}</p>
              {mode === 'dashboard' ? (
                current === id ? (
                  <span className={`mt-3 inline-flex h-12 items-center justify-center gap-2 rounded-full text-[15px] font-semibold ${dark ? 'bg-white/10' : 'bg-[#f2f2f7]'}`}>
                    <Check size={16} strokeWidth={3} className="text-[#34c759]" /> {t.yourPlan}
                  </span>
                ) : (
                  <button type="button" onClick={() => switchTo(id)} disabled={!!switching}
                    className={`mt-3 inline-flex h-12 items-center justify-center rounded-full text-[15px] font-semibold transition disabled:opacity-60 ${dark ? 'bg-white text-[#1d1d1f] hover:bg-[#f2f2f7]' : 'bg-[#1d1d1f] text-white hover:bg-black'}`}>
                    {switching === id ? '…' : p.ctaDash}
                  </button>
                )
              ) : (
                <Link href={href} className={`mt-3 inline-flex h-12 items-center justify-center rounded-full text-[15px] font-semibold transition ${dark ? 'bg-white text-[#1d1d1f] hover:bg-[#f2f2f7]' : 'bg-[#1d1d1f] text-white hover:bg-black'}`}>
                  {p.cta}
                </Link>
              )}
            </motion.article>
          )
        })}
      </section>

      {/* extras */}
      <section className="mx-auto mt-6 max-w-[860px] rounded-[24px] bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <h3 className="text-[16px] font-semibold text-[#1d1d1f]">{t.addonsTitle}</h3>
        <div className="mt-3 divide-y divide-[#f0f0f0]">
          {addons.map(([Icon, name, desc, price]) => (
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
            {rows.map(([label, ...vals]) => (
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
