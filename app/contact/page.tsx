import Link from 'next/link'
import InfoPage from '@/components/info-page'
import { SUPPORT_EMAIL } from '@/lib/site'

export const metadata = { title: 'Contact — Snippr' }

const link = { color: '#ffffff', textDecoration: 'underline' }

export default function ContactPage() {
  return (
    <InfoPage
      title="Contact us"
      subtitle="We usually reply within one business day."
      sections={[
        {
          heading: 'Support',
          body: <>Need help with your account or bookings? Email <a href={`mailto:${SUPPORT_EMAIL}`} style={link}>{SUPPORT_EMAIL}</a>.</>,
        },
        {
          heading: 'Common questions',
          body: <>Many answers are already in our <Link href="/faq" style={link}>FAQ</Link> and the <Link href="/pricing" style={link}>pricing page</Link>.</>,
        },
        {
          heading: 'Barbers',
          body: <>New to Snippr? <Link href="/register" style={link}>Create a free account</Link> and get your booking link in a few minutes.</>,
        },
      ]}
    />
  )
}
