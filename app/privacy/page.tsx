import InfoPage from '@/components/info-page'
import { SUPPORT_EMAIL } from '@/lib/site'
import CookieSettingsButton from '@/components/cookie-settings-button'

export const metadata = { title: 'Privacy Policy — Snippr' }

export default function PrivacyPage() {
  return (
    <InfoPage
      title="Privacy Policy"
      subtitle="How Snippr collects, uses and protects your data."
      sections={[
        {
          heading: 'What we collect',
          body: 'For barbers: your name, email, password (stored encrypted, never readable by us), shop details, services, prices, working hours and profile photos. For customers who book: the name, phone number and email you enter, and the appointment you choose.',
        },
        {
          heading: 'How we use it',
          body: 'Only to run the booking service: showing a barber’s booking page, creating appointments, and sending sign-up, password-reset and booking-confirmation emails plus new-booking notifications to the barber. We do not sell your data and we do not use it for advertising.',
        },
        {
          heading: 'Who can see customer data',
          body: 'A customer’s name, phone number and email are visible only to the barber they booked with. Other barbers and visitors cannot see them; the public booking page only shows which time slots are taken.',
        },
        {
          id: 'cookies',
          heading: 'Cookies & local storage',
          body: (
            <>
              <p style={{ margin: '0 0 12px' }}>
                We only use cookies and browser storage that Snippr needs to work. We do not use advertising, tracking or analytics cookies.
              </p>
              <ul style={{ margin: '0 0 12px', paddingLeft: 18 }}>
                <li><b>Sign-in</b>: keeps you logged in to your dashboard (browser storage, set by Supabase).</li>
                <li><b>Remember me</b>: when you untick it at login, a small cookie (<code>snippr_alive</code>) signs you out once you close the browser.</li>
                <li><b>Your choices</b>: your cookie choice, language and dashboard settings (browser storage).</li>
              </ul>
              <p style={{ margin: '0 0 12px' }}>
                These are necessary, so they stay on. Analytics and marketing are switched off and not in use; if we ever add them, we will ask first and respect your choice.
              </p>
              <CookieSettingsButton />
            </>
          ),
        },
        {
          heading: 'Services we use',
          body: 'Supabase stores the database and handles sign-in (servers in the EU, Ireland). Vercel hosts the website. Emails are sent through Google (Gmail). Notifications go through your browser’s push service, and through Expo for the Snippr mobile app. These providers only process data so that Snippr works.',
        },
        {
          heading: 'How long we keep it',
          body: 'Barber accounts and their appointments are kept until the account is deleted. Appointments are removed together with the barber’s account.',
        },
        {
          heading: 'Your rights',
          body: `You can view and edit your data in your dashboard at any time. You have the right to access, correct, export or delete your data — email ${SUPPORT_EMAIL} and we will handle it. You can also file a complaint with your local data protection authority.`,
        },
        {
          heading: 'Contact',
          body: `Questions about privacy? Email ${SUPPORT_EMAIL}.`,
        },
      ]}
    />
  )
}
