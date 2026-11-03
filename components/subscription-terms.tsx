'use client'

// Pre-contract information for paid plans ("Before you subscribe"), shown under the plan
// cards on /pricing and in the dashboard. Says who sells, the exact price in euros with and
// without VAT, billing period, automatic renewal, how to cancel, refunds and payment.
// When paid plans go live, the checkout must repeat the summary, require a Terms box and
// use a button that says payment is due (e.g. "Pay and subscribe").
// DRAFT: to be checked by a lawyer.

import Link from 'next/link'
import { PLAN_PRICES_EUR, VAT_RATE } from '@/lib/legal'

const eur = (n: number) => `€${n.toFixed(2).replace('.', ',')}`
const incl = (n: number) => eur(Math.round(n * (1 + VAT_RATE) * 100) / 100)
const vat = Math.round(VAT_RATE * 100)

const COPY = {
  en: {
    title: 'Before you subscribe',
    sub: 'Pro and Business are not on sale yet. When they are, these terms apply.',
    rows: [
      ['Seller', <>Snippr, the Netherlands — company details on the <Link href="/imprint">imprint page</Link>.</>],
      ['Price', null],
      ['Billing', 'In advance, in euros, per month or per year (the yearly plan costs 10 months).'],
      ['Renewal', 'Your plan renews automatically for the same period until you cancel. We email you before a yearly plan renews.'],
      ['Cancel', 'Any time in Dashboard → Plans & billing. Your plan stays active until the end of the period you paid for; nothing more is charged. You keep all your data and go back to Free.'],
      ['Refunds', 'Paid plans are for businesses, so the 14-day consumer withdrawal right does not apply. Paid periods are not refunded, except where the law requires it.'],
      ['Payment', 'By card or iDEAL through a payment provider. Snippr never sees or stores your card details.'],
      ['Free plan', 'Stays free, needs no card and never turns into a paid plan by itself.'],
    ] as [string, React.ReactNode][],
    per: (m: string, y: string, mi: string, yi: string) => `${m}/month or ${y}/year excl. ${vat}% VAT (${mi} or ${yi} incl. VAT)`,
    terms: <>Full rules: <Link href="/terms">Terms of Service</Link> and <Link href="/dpa">Data Processing Agreement</Link>.</>,
  },
  tr: {
    title: 'Abone olmadan önce',
    sub: 'Pro ve Business henüz satışta değil. Satışa açıldıklarında bu koşullar geçerli olacak.',
    rows: [
      ['Satıcı', <>Snippr, Hollanda — şirket bilgileri <Link href="/imprint">künye sayfasında</Link>.</>],
      ['Fiyat', null],
      ['Ödeme dönemi', 'Peşin, euro ile, aylık ya da yıllık (yıllık plan 10 ay fiyatına).'],
      ['Yenileme', 'Planın sen iptal edene kadar aynı süreyle kendiliğinden yenilenir. Yıllık plan yenilenmeden önce sana e-posta göndeririz.'],
      ['İptal', 'İstediğin an Panel → Planlar ve fatura’dan. Planın, ödediğin dönemin sonuna kadar açık kalır; başka ücret alınmaz. Tüm verilerin seninle kalır ve ücretsiz plana dönersin.'],
      ['Geri ödeme', 'Ücretli planlar işletmeler içindir; bu yüzden tüketicilere tanınan 14 günlük cayma hakkı geçerli değildir. Ödenmiş dönemler, yasanın gerektirdiği durumlar dışında iade edilmez.'],
      ['Ödeme', 'Kartla ya da iDEAL ile, bir ödeme sağlayıcısı üzerinden. Snippr kart bilgilerini hiçbir zaman görmez ve saklamaz.'],
      ['Ücretsiz plan', 'Ücretsiz kalır, kart istemez ve hiçbir zaman kendiliğinden ücretli plana dönüşmez.'],
    ] as [string, React.ReactNode][],
    per: (m: string, y: string, mi: string, yi: string) => `aylık ${m} ya da yıllık ${y}, %${vat} KDV (BTW) hariç (KDV dahil ${mi} ya da ${yi})`,
    terms: <>Tüm kurallar: <Link href="/terms">Kullanım Şartları</Link> ve <Link href="/dpa">Veri İşleme Sözleşmesi</Link>.</>,
  },
}

export default function SubscriptionTerms({ lng }: { lng: 'en' | 'tr' }) {
  const c = COPY[lng] ?? COPY.en
  const line = (k: 'pro' | 'business') => { const p = PLAN_PRICES_EUR[k]; return c.per(eur(p.monthly), eur(p.yearly), incl(p.monthly), incl(p.yearly)) }
  return (
    <section id="before-you-subscribe" className="mx-auto mt-10 max-w-3xl rounded-[28px] bg-white px-6 py-7 text-left shadow-[0_20px_50px_-30px_rgba(0,0,0,0.18)] sm:px-8">
      <h2 className="text-[20px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">{c.title}</h2>
      <p className="mt-1 text-[14px] text-[#6e6e73]">{c.sub}</p>
      <dl className="mt-5 divide-y divide-[#f0f0f0] text-[14px] [&_a]:font-medium [&_a]:text-[#1d1d1f] [&_a]:underline [&_a]:underline-offset-2">
        {c.rows.map(([k, v]) => (
          <div key={k} className="grid gap-1 py-3 sm:grid-cols-[150px_1fr] sm:gap-4">
            <dt className="font-semibold text-[#1d1d1f]">{k}</dt>
            <dd className="m-0 leading-relaxed text-[#3a3a3c]">
              {v ?? (
                <span className="flex flex-col gap-1">
                  <span><b className="text-[#1d1d1f]">Pro</b> — {line('pro')}</span>
                  <span><b className="text-[#1d1d1f]">Business</b> — {line('business')}</span>
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
