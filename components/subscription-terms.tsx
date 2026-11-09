'use client'

// Pre-contract information for paid plans ("Before you subscribe"), shown under the plans on
// /pricing and in the dashboard: seller, exact prices in euros with and without VAT, trial,
// founder offer, billing, automatic renewal, cancelling, refunds and payment.
// When payments go live, the checkout must repeat this summary, require a Terms box and use a
// button that says payment is due (e.g. "Pay and subscribe").
// DRAFT: to be checked by a lawyer.

import Link from 'next/link'
import type { SiteLng } from '@/lib/site-lang'
import { PLAN_PRICES_EUR, VISIBLE_PLANS, VAT_RATE, TRIAL_DAYS, FOUNDER_DISCOUNT, FOUNDER_SPOTS } from '@/lib/legal'

const eur = (n: number) => `€${n.toFixed(2).replace('.', ',')}`
const incl = (n: number) => eur(Math.round(n * (1 + VAT_RATE) * 100) / 100)
const vat = Math.round(VAT_RATE * 100)
type PlanKey = keyof typeof PLAN_PRICES_EUR

const COPY = {
  en: {
    title: 'Before you subscribe',
    sub: 'Payments are not open yet; during early access Snippr is free. When paid plans start, these terms apply and we tell you by email first.',
    names: { solo: 'Solo', salon: 'Salon', pro: 'Pro' } as Record<PlanKey, string>,
    per: (m: string, y: string, mi: string, yi: string) => `${m}/month or ${y}/year excl. ${vat}% VAT (${mi} or ${yi} incl. VAT)`,
    proNote: ' — starting price; the final price is agreed with you',
    rows: [
      ['Seller', <>Snippr, the Netherlands — company details on the <Link href="/imprint">imprint page</Link>.</>],
      ['Price', null],
      ['Free trial', `${TRIAL_DAYS} days, no card needed. If you don’t choose a plan at the end, nothing is charged.`],
      ['Founder offer', `The first ${FOUNDER_SPOTS} shops that subscribe get ${FOUNDER_DISCOUNT}% off their plan for as long as they keep it without a break.`],
      ['Billing', 'In advance, in euros, per month or per year (the yearly plan costs about 10 months).'],
      ['Renewal', 'Your plan renews automatically for the same period until you cancel. We email you before a yearly plan renews.'],
      ['Cancel', 'Any time in Dashboard → Plans & billing. Your plan stays active until the end of the period you paid for; nothing more is charged. You can download your data at any time.'],
      ['Refunds', 'Paid plans are for businesses, so the 14-day consumer withdrawal right does not apply. Paid periods are not refunded, except where the law requires it.'],
      ['Payment', 'By card or iDEAL through a payment provider. Snippr never sees or stores your card details.'],
    ] as [string, React.ReactNode][],
    terms: <>Full rules: <Link href="/terms">Terms of Service</Link> and <Link href="/dpa">Data Processing Agreement</Link>.</>,
  },
  tr: {
    title: 'Abone olmadan önce',
    sub: 'Ödemeler henüz açılmadı; erken erişim boyunca Snippr ücretsiz. Ücretli planlar başladığında bu koşullar geçerli olur ve önce sana e-postayla haber veririz.',
    names: { solo: 'Solo', salon: 'Salon', pro: 'Pro' } as Record<PlanKey, string>,
    per: (m: string, y: string, mi: string, yi: string) => `aylık ${m} ya da yıllık ${y}, %${vat} KDV (BTW) hariç (KDV dahil ${mi} ya da ${yi})`,
    proNote: ' — başlangıç fiyatı; son fiyat seninle konuşularak belirlenir',
    rows: [
      ['Satıcı', <>Snippr, Hollanda — şirket bilgileri <Link href="/imprint">künye sayfasında</Link>.</>],
      ['Fiyat', null],
      ['Ücretsiz deneme', `${TRIAL_DAYS} gün, kart gerekmez. Deneme sonunda plan seçmezsen hiçbir ücret alınmaz.`],
      ['Kurucu teklifi', `Abone olan ilk ${FOUNDER_SPOTS} işletme, planını aralıksız sürdürdüğü sürece %${FOUNDER_DISCOUNT} indirimli öder.`],
      ['Ödeme dönemi', 'Peşin, euro ile, aylık ya da yıllık (yıllık plan yaklaşık 10 ay fiyatına).'],
      ['Yenileme', 'Planın sen iptal edene kadar aynı süreyle kendiliğinden yenilenir. Yıllık plan yenilenmeden önce sana e-posta göndeririz.'],
      ['İptal', 'İstediğin an Panel → Planlar ve fatura’dan. Planın, ödediğin dönemin sonuna kadar açık kalır; başka ücret alınmaz. Verilerini her zaman indirebilirsin.'],
      ['Geri ödeme', 'Ücretli planlar işletmeler içindir; bu yüzden tüketicilere tanınan 14 günlük cayma hakkı geçerli değildir. Ödenmiş dönemler, yasanın gerektirdiği durumlar dışında iade edilmez.'],
      ['Ödeme', 'Kartla ya da iDEAL ile, bir ödeme sağlayıcısı üzerinden. Snippr kart bilgilerini hiçbir zaman görmez ve saklamaz.'],
    ] as [string, React.ReactNode][],
    terms: <>Tüm kurallar: <Link href="/terms">Kullanım Şartları</Link> ve <Link href="/dpa">Veri İşleme Sözleşmesi</Link>.</>,
  },
  nl: {
    title: 'Voordat je een abonnement neemt',
    sub: 'Betalingen zijn nog niet open; tijdens de lancering is Snippr gratis. Als betaalde abonnementen starten, gelden deze voorwaarden en mailen we je eerst.',
    names: { solo: 'Solo', salon: 'Salon', pro: 'Pro' } as Record<PlanKey, string>,
    per: (m: string, y: string, mi: string, yi: string) => `${m}/maand of ${y}/jaar excl. ${vat}% btw (${mi} of ${yi} incl. btw)`,
    proNote: ' — vanafprijs; de uiteindelijke prijs spreken we met je af',
    rows: [
      ['Verkoper', <>Snippr, Nederland — bedrijfsgegevens op de <Link href="/imprint">impressumpagina</Link>.</>],
      ['Prijs', null],
      ['Gratis proef', `${TRIAL_DAYS} dagen, geen kaart nodig. Kies je aan het eind geen abonnement, dan wordt er niets afgeschreven.`],
      ['Oprichtersaanbod', `De eerste ${FOUNDER_SPOTS} zaken die een abonnement nemen krijgen ${FOUNDER_DISCOUNT}% korting, zolang ze het zonder onderbreking houden.`],
      ['Facturering', 'Vooraf, in euro, per maand of per jaar (het jaarabonnement kost ongeveer 10 maanden).'],
      ['Verlenging', 'Je abonnement wordt automatisch verlengd met dezelfde periode tot je opzegt. We mailen je voordat een jaarabonnement wordt verlengd.'],
      ['Opzeggen', 'Altijd, via Dashboard → Abonnementen. Je abonnement blijft actief tot het einde van de betaalde periode; er wordt niets meer afgeschreven. Je kunt je gegevens altijd downloaden.'],
      ['Terugbetaling', 'Betaalde abonnementen zijn voor bedrijven, dus het herroepingsrecht van 14 dagen voor consumenten geldt niet. Betaalde periodes worden niet terugbetaald, behalve waar de wet dat vereist.'],
      ['Betaling', 'Met kaart of iDEAL via een betaalprovider. Snippr ziet of bewaart je kaartgegevens nooit.'],
    ] as [string, React.ReactNode][],
    terms: <>Alle regels: <Link href="/terms">Algemene voorwaarden</Link> en <Link href="/dpa">Verwerkersovereenkomst</Link> (in het Engels).</>,
  },
  de: {
    title: 'Bevor du ein Abo abschließt',
    sub: 'Zahlungen sind noch nicht geöffnet; während des Starts ist Snippr kostenlos. Wenn bezahlte Tarife starten, gelten diese Bedingungen und wir schreiben dir vorher eine E-Mail.',
    names: { solo: 'Solo', salon: 'Salon', pro: 'Pro' } as Record<PlanKey, string>,
    per: (m: string, y: string, mi: string, yi: string) => `${m}/Monat oder ${y}/Jahr zzgl. ${vat} % MwSt. (${mi} oder ${yi} inkl. MwSt.)`,
    proNote: ' — Einstiegspreis; den endgültigen Preis vereinbaren wir mit dir',
    rows: [
      ['Verkäufer', <>Snippr, Niederlande — Firmendaten im <Link href="/imprint">Impressum</Link>.</>],
      ['Preis', null],
      ['Kostenloser Test', `${TRIAL_DAYS} Tage, keine Karte nötig. Wählst du am Ende keinen Tarif, wird nichts abgebucht.`],
      ['Gründerangebot', `Die ersten ${FOUNDER_SPOTS} Läden, die ein Abo abschließen, bekommen ${FOUNDER_DISCOUNT} % Rabatt, solange sie es ohne Unterbrechung behalten.`],
      ['Abrechnung', 'Im Voraus, in Euro, monatlich oder jährlich (der Jahrestarif kostet etwa 10 Monate).'],
      ['Verlängerung', 'Dein Tarif verlängert sich automatisch um denselben Zeitraum, bis du kündigst. Vor der Verlängerung eines Jahrestarifs schreiben wir dir.'],
      ['Kündigen', 'Jederzeit unter Dashboard → Tarife. Dein Tarif bleibt bis zum Ende des bezahlten Zeitraums aktiv; danach wird nichts mehr abgebucht. Du kannst deine Daten jederzeit herunterladen.'],
      ['Erstattung', 'Bezahlte Tarife sind für Unternehmen, daher gilt das 14-tägige Widerrufsrecht für Verbraucher nicht. Bezahlte Zeiträume werden nicht erstattet, außer wenn das Gesetz es verlangt.'],
      ['Zahlung', 'Per Karte oder iDEAL über einen Zahlungsanbieter. Snippr sieht oder speichert deine Kartendaten nie.'],
    ] as [string, React.ReactNode][],
    terms: <>Alle Regeln: <Link href="/terms">Nutzungsbedingungen</Link> und <Link href="/dpa">Auftragsverarbeitungsvertrag</Link> (auf Englisch).</>,
  },
  ar: {
    title: 'قبل أن تشترك',
    sub: 'الدفع غير متاح بعد، وخلال الإطلاق Snippr مجاني. عند بدء الخطط المدفوعة تسري هذه الشروط ونراسلك أولًا.',
    names: { solo: 'Solo', salon: 'Salon', pro: 'Pro' } as Record<PlanKey, string>,
    per: (m: string, y: string, mi: string, yi: string) => `${m} شهريًا أو ${y} سنويًا بدون ضريبة ${vat}% (${mi} أو ${yi} شاملة الضريبة)`,
    proNote: ' — سعر مبدئي، ونتفق معك على السعر النهائي',
    rows: [
      ['البائع', <>Snippr، هولندا — بيانات الشركة في <Link href="/imprint">صفحة البيانات القانونية</Link>.</>],
      ['السعر', null],
      ['تجربة مجانية', `${TRIAL_DAYS} يومًا بدون بطاقة. إذا لم تختر خطة في النهاية فلن يُخصم شيء.`],
      ['عرض المؤسسين', `أول ${FOUNDER_SPOTS} محلًا تشترك تحصل على خصم ${FOUNDER_DISCOUNT}% طالما استمرت دون انقطاع.`],
      ['الفوترة', 'مقدمًا، باليورو، شهريًا أو سنويًا (الخطة السنوية تكلف نحو 10 أشهر).'],
      ['التجديد', 'تتجدد خطتك تلقائيًا للمدة نفسها حتى تلغيها. نراسلك قبل تجديد الخطة السنوية.'],
      ['الإلغاء', 'في أي وقت من اللوحة ← الخطط. تبقى خطتك فعّالة حتى نهاية الفترة المدفوعة ولا يُخصم شيء بعدها. يمكنك تنزيل بياناتك في أي وقت.'],
      ['الاسترداد', 'الخطط المدفوعة مخصصة للشركات، لذا لا ينطبق حق الانسحاب للمستهلكين لمدة 14 يومًا. لا تُسترد الفترات المدفوعة إلا حيث يفرض القانون ذلك.'],
      ['الدفع', 'بالبطاقة أو iDEAL عبر مزود دفع. لا يرى Snippr بيانات بطاقتك ولا يحفظها أبدًا.'],
    ] as [string, React.ReactNode][],
    terms: <>القواعد الكاملة: <Link href="/terms">شروط الخدمة</Link> و<Link href="/dpa">اتفاقية معالجة البيانات</Link> (بالإنجليزية).</>,
  },
}

export default function SubscriptionTerms({ lng }: { lng: SiteLng }) {
  const c = COPY[lng] ?? COPY.en
  const line = (k: PlanKey) => { const p = PLAN_PRICES_EUR[k]; return c.per(eur(p.monthly), eur(p.yearly), incl(p.monthly), incl(p.yearly)) + (k === 'pro' ? c.proNote : '') }
  return (
    <section id="before-you-subscribe" className="mx-auto mt-6 max-w-[860px] rounded-[24px] bg-white px-6 py-7 text-left shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:px-8">
      <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{c.title}</h2>
      <p className="mt-1 text-[14px] text-[#6e6e73]">{c.sub}</p>
      <dl className="mt-5 divide-y divide-[#f0f0f0] text-[14px] [&_a]:font-medium [&_a]:text-[#1d1d1f] [&_a]:underline [&_a]:underline-offset-2">
        {c.rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-3 sm:grid-cols-[150px_1fr] sm:gap-4">
            <dt className="font-semibold text-[#1d1d1f]">{k}</dt>
            <dd className="m-0 leading-relaxed text-[#3a3a3c]">
              {v ?? (
                <span className="flex flex-col gap-1">
                  {VISIBLE_PLANS.map(k2 => (
                    <span key={k2}><b className="text-[#1d1d1f]">{c.names[k2]}</b> — {line(k2)}</span>
                  ))}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-[13px] text-[#6e6e73] [&_a]:font-medium [&_a]:text-[#1d1d1f] [&_a]:underline [&_a]:underline-offset-2">{c.terms}</p>
    </section>
  )
}
