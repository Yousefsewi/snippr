import Link from 'next/link'
import InfoPage from '@/components/info-page'
import { SUPPORT_EMAIL } from '@/lib/site'

export const metadata = { title: 'Terms of Service — Snippr' }

// DRAFT terms of service — to be checked by a lawyer before launch.

const a: React.CSSProperties = { color: 'rgba(255,255,255,0.9)' }

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms of Service"
      subtitle="The rules for using Snippr. Last updated: 1 November 2026."
      sections={[
        {
          heading: 'The service',
          body: <>Snippr gives barbers and salons an online booking page, calendar and customer tools. Snippr is a booking tool, not a payment processor — payments are handled directly between barbers and their customers. Company details are on the <Link href="/imprint" style={a}>imprint page</Link>.</>,
        },
        {
          heading: 'Your account',
          body: 'You must be at least 18 years old to create a Snippr account; we ask for your date of birth when you sign up. Accounts are for businesses and self-employed professionals. You are responsible for keeping your login details safe and for the information you publish on your booking page, including services, prices and opening hours.',
        },
        {
          heading: 'Bookings',
          body: 'Appointments are an agreement between the barber and the customer. Cancellations, no-shows and refunds are handled by the barber according to their own policy. Snippr is not a party to that agreement.',
        },
        {
          heading: 'Your customers’ data',
          body: <>You are the controller of the personal data of people who book with you; Snippr processes it only on your behalf and on your instructions. Our <Link href="/dpa" style={a}>Data Processing Agreement</Link> is part of these terms and applies automatically. You must only use your customers’ data for their appointments and follow the GDPR.</>,
        },
        {
          heading: 'Acceptable use',
          body: 'Do not use Snippr for spam, fake bookings, harassment, or anything unlawful, and do not try to break or overload the service. We may suspend or close accounts that abuse the service, after warning you where possible.',
        },
        {
          heading: 'Plans, prices & billing',
          body: <>Snippr is free at the moment. Paid plans are described on the <Link href="/pricing" style={a}>pricing page</Link>; prices shown there exclude VAT (BTW) unless stated otherwise. A paid plan renews each month or year until you cancel. You can cancel at any time from your dashboard; the plan then stays active until the end of the period you paid for. Paid periods are not refunded, except where the law requires it.</>,
        },
        {
          heading: 'Availability',
          body: 'We work hard to keep Snippr online and your data safe, but we cannot promise the service will always be available or free of errors. We may change or improve features over time; if we remove an important feature of a paid plan, we will tell you in advance.',
        },
        {
          heading: 'Liability',
          body: 'Snippr is provided “as is”. To the extent the law allows, we are not liable for indirect damage such as lost income, missed appointments or lost data, and our total liability is limited to the amount you paid us in the 12 months before the damage (or €100 if you use the free plan). This does not limit liability for intent or gross negligence, or any rights you have that cannot be excluded by law.',
        },
        {
          heading: 'Ending your account',
          body: 'You can delete your account at any time in Settings → Delete account; your account, services, appointments and waiting list are then removed. Download your data first if you want to keep it (Settings → Download my data). We may end the service for an account with at least 30 days’ notice, or right away in case of serious abuse.',
        },
        {
          heading: 'Content and rights',
          body: 'You keep all rights to the photos and texts you upload and give us permission to show them on your booking page. The Snippr software, name and logo remain ours.',
        },
        {
          heading: 'Law and disputes',
          body: 'Dutch law applies. Disputes go to the competent court in the Netherlands, unless the law gives you the right to go to a court where you live. We always prefer to solve problems directly first — just email us.',
        },
        {
          heading: 'Changes',
          body: 'We may update these terms. If changes are significant, we will let you know by email or in the dashboard at least 30 days before they apply.',
        },
        {
          heading: 'Contact',
          body: `Questions about these terms? Email ${SUPPORT_EMAIL}.`,
        },
      ]}
    />
  )
}
