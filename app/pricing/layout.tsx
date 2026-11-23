import type { Metadata } from 'next'
import { PLAN_PRICES_EUR, TRIAL_DAYS } from '@/lib/legal'
import { SITE_URL } from '@/lib/site-url'

export const metadata: Metadata = {
  title: 'Plans & pricing — Snippr',
  description: `One fixed monthly price, no commission on bookings. Solo from €${PLAN_PRICES_EUR.solo.monthly.toFixed(2)}, every plan free for ${TRIAL_DAYS} days, no card needed.`,
  other: { google: 'notranslate' },
}

// Structured data: Snippr as a web app with its plans, so search engines can show prices.
const JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Snippr',
  url: SITE_URL,
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web, iOS, Android (browser)',
  description: 'Online booking for barbers, hairdressers and beauty salons: your own booking link and QR code, live calendar and email reminders.',
  offers: (['solo', 'salon', 'pro'] as const).map(id => ({
    '@type': 'Offer',
    name: id === 'solo' ? 'Solo' : id === 'salon' ? 'Salon' : 'Pro',
    price: PLAN_PRICES_EUR[id].monthly.toFixed(2),
    priceCurrency: 'EUR',
    url: `${SITE_URL}/pricing`,
  })),
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div translate="no" className="notranslate">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
      {children}
    </div>
  )
}
