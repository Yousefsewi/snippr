import InfoPage from '@/components/info-page'
import { SUPPORT_EMAIL } from '@/lib/site'

export const metadata = { title: 'Terms of Service — Snippr' }

export default function TermsPage() {
  return (
    <InfoPage
      title="Terms of Service"
      subtitle="The rules for using Snippr."
      sections={[
        {
          heading: 'The service',
          body: 'Snippr gives barbers an online booking page, calendar and customer tools. Snippr is a booking tool, not a payment processor — payments are handled directly between barbers and their customers.',
        },
        {
          heading: 'Your account',
          body: 'You are responsible for keeping your login details safe and for the information you publish on your booking page, including services, prices and opening hours.',
        },
        {
          heading: 'Bookings',
          body: 'Appointments are an agreement between the barber and the customer. Cancellations, no-shows and refunds are handled by the barber according to their own policy.',
        },
        {
          heading: 'Acceptable use',
          body: 'Do not use Snippr for spam, fake bookings, or anything unlawful. We may suspend accounts that abuse the service.',
        },
        {
          heading: 'Plans & billing',
          body: 'Paid plans are described on the pricing page. You can change or cancel your plan at any time from your dashboard.',
        },
        {
          heading: 'Changes',
          body: 'We may update these terms. If changes are significant, we will let you know by email or in the dashboard.',
        },
        {
          heading: 'Contact',
          body: `Questions about these terms? Email ${SUPPORT_EMAIL}.`,
        },
      ]}
    />
  )
}
