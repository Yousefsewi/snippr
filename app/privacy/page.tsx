import Link from 'next/link'
import InfoPage from '@/components/info-page'
import { COMPANY, SUPPORT_EMAIL } from '@/lib/site'
import CookieSettingsButton from '@/components/cookie-settings-button'

export const metadata = { title: 'Privacy Policy — Snippr' }

// DRAFT privacy policy (GDPR/AVG) — to be checked by a lawyer before launch.
// Company details come from COMPANY in lib/site.ts.

const ul: React.CSSProperties = { margin: '0 0 12px', paddingLeft: 18 }
const p: React.CSSProperties = { margin: '0 0 12px' }
const a: React.CSSProperties = { color: 'rgba(255,255,255,0.9)' }

export default function PrivacyPage() {
  const who = [COMPANY.name, COMPANY.address && `${COMPANY.address}, ${COMPANY.country}`, COMPANY.kvk && `KvK ${COMPANY.kvk}`].filter(Boolean).join(' · ')
  return (
    <InfoPage
      title="Privacy Policy"
      subtitle="How Snippr collects, uses and protects personal data. Last updated: 1 November 2026."
      sections={[
        {
          heading: 'Who we are',
          body: (
            <>
              <p style={p}>Snippr is an online booking tool for barbers and salons, run from the Netherlands ({who}). Contact: <a href={`mailto:${SUPPORT_EMAIL}`} style={a}>{SUPPORT_EMAIL}</a>. Full company details are on the <Link href="/imprint" style={a}>imprint page</Link>.</p>
              <p style={{ margin: 0 }}>
                <b>Two roles.</b> For the accounts of barbers (our customers) and for visitors of this website, Snippr is the <i>controller</i>. For the data of people who book an appointment with a barber, the <b>barber is the controller</b> and Snippr is the <i>processor</i> that runs the booking system for them — see our <Link href="/dpa" style={a}>Data Processing Agreement</Link>. Questions about a specific booking can go to the barber or to us.
              </p>
            </>
          ),
        },
        {
          heading: 'What we collect',
          body: (
            <ul style={ul}>
              <li><b>Barbers (account holders)</b>: name, email address, date of birth (to check you are 18 or older), password (stored only as a secure hash — we can never read it), shop name, address, photos, services, prices, working hours and settings.</li>
              <li><b>People who book</b>: the name you enter (required), and — only if you choose to give them — your email address and phone number; the appointment (service, date, time, status); your language and time zone so reminders arrive at the right time. If you join a waiting list, the same details plus your preferred day.</li>
              <li><b>Messages to us</b>: what you write in the contact form and your email address.</li>
              <li><b>Technical data</b>: IP address and browser details in short-lived server logs, used for security and to stop spam.</li>
            </ul>
          ),
        },
        {
          heading: 'Why we use it, and on what legal basis',
          body: (
            <ul style={ul}>
              <li><b>Running the service</b> — accounts, booking pages, appointments, confirmation and reminder emails, notifications to the barber. Basis: performance of a contract (GDPR art. 6(1)(b)); for bookings, on behalf of the barber.</li>
              <li><b>Age check at sign-up</b> — basis: legal obligation and our legitimate interest in only contracting with adults (art. 6(1)(c) and (f)).</li>
              <li><b>Security and abuse prevention</b> — rate limits, leaked-password check, logs. Basis: legitimate interest (art. 6(1)(f)).</li>
              <li><b>Answering your messages</b> — basis: legitimate interest (art. 6(1)(f)).</li>
              <li><b>Bookkeeping</b> (once paid plans start) — basis: legal obligation (art. 6(1)(c)).</li>
            </ul>
          ),
        },
        {
          heading: 'What we never do',
          body: 'We do not sell personal data, do not use it for advertising, do not build profiles and do not send marketing emails. All emails Snippr sends are about an account or an appointment.',
        },
        {
          heading: 'Who can see the data',
          body: 'A customer’s name, phone number and email are visible only to the barber they booked with. Other barbers and visitors cannot see them; the public booking page only shows which time slots are taken. Inside Snippr, access is limited to what is needed for support and security.',
        },
        {
          heading: 'Service providers (sub-processors)',
          body: (
            <>
              <ul style={ul}>
                <li><b>Supabase</b> — database and sign-in. Servers in the EU (Ireland).</li>
                <li><b>Vercel</b> — hosts the website and runs the server code. Vercel Inc. is a US company; transfers are covered by the EU–US Data Privacy Framework and/or Standard Contractual Clauses.</li>
                <li><b>Google (Gmail)</b> — sends our emails. Covered by the EU–US Data Privacy Framework / Standard Contractual Clauses.</li>
                <li><b>Google sign-in</b> — only if you choose “Continue with Google”: Google confirms who you are and shares your name, email address and profile picture with us. We never see your Google password.</li>
                <li><b>Browser push services</b> (e.g. Google, Apple, Mozilla) — deliver new-booking notifications to a barber’s device, only if the barber turns them on.</li>
                <li><b>Expo</b> — delivers notifications to the Snippr mobile app, if a barber uses it.</li>
                <li><b>OpenStreetMap (Nominatim)</b> — suggests addresses while a barber types their shop address in the dashboard. Only the typed text and your IP address are sent.</li>
                <li><b>Have I Been Pwned</b> — checks whether a new password appeared in a data leak. Only the first 5 characters of a hash of the password leave the device; never the password or any personal data.</li>
                <li><b>YouTube</b> — only if a barber adds a video to their page. The video’s preview picture is loaded from YouTube (no cookies); the player itself only loads when you press play, or right away if you accepted all cookies.</li>
              </ul>
              <p style={{ margin: 0 }}>Fonts and images are served from our own site. We do not use Google Fonts, analytics or tracking tools.</p>
            </>
          ),
        },
        {
          id: 'cookies',
          heading: 'Cookies & local storage',
          body: (
            <>
              <p style={p}>
                We only use cookies and browser storage that Snippr needs to work. We do not use advertising, tracking or analytics cookies.
              </p>
              <ul style={ul}>
                <li><b>Sign-in</b>: keeps you logged in to your dashboard (browser storage, set by Supabase).</li>
                <li><b>Remember me</b>: when you untick it at login, a small cookie (<code>snippr_alive</code>) signs you out once you close the browser.</li>
                <li><b>Your choices</b>: your cookie choice, language and dashboard settings (browser storage).</li>
              </ul>
              <p style={p}>
                These are necessary, so they stay on. Analytics and marketing are switched off and not in use; if we ever add them, we will ask first and respect your choice.
              </p>
              <CookieSettingsButton />
            </>
          ),
        },
        {
          heading: 'How long we keep it',
          body: (
            <ul style={ul}>
              <li>Barber accounts, with their services, appointments and waiting list, are kept until the account is deleted; everything is then removed.</li>
              <li>A barber can delete single appointments at any time.</li>
              <li>Server logs are kept for a short period (at most 30 days) by our hosting provider.</li>
              <li>Contact-form messages are kept as long as needed to help you, and at most 2 years.</li>
              <li>Invoices (once paid plans start) are kept for 7 years, as Dutch tax law requires.</li>
            </ul>
          ),
        },
        {
          heading: 'Security',
          body: 'All traffic is encrypted (HTTPS). Passwords are stored only as hashes. Database rules make sure a barber can only read their own customers’ data. If a data breach ever happens that puts your rights at risk, we will report it to the Dutch Data Protection Authority within 72 hours and inform affected people and barbers.',
        },
        {
          heading: 'Your rights',
          body: (
            <>
              <p style={p}>You have the right to access, correct, delete and export your data, to object to or restrict its use, and to withdraw consent where we rely on it.</p>
              <ul style={ul}>
                <li><b>Barbers</b> can edit their data in the dashboard, download all of it as a file (Settings → Download my data) and delete their account (Settings → Delete account).</li>
                <li><b>People who booked</b> can ask the barber, or email us and we will pass it on or help directly.</li>
              </ul>
              <p style={{ margin: 0 }}>Email <a href={`mailto:${SUPPORT_EMAIL}`} style={a}>{SUPPORT_EMAIL}</a>; we answer within one month. You can also file a complaint with the Dutch Data Protection Authority (<i>Autoriteit Persoonsgegevens</i>, autoriteitpersoonsgegevens.nl) or the authority in your own EU country.</p>
            </>
          ),
        },
        {
          heading: 'Age',
          body: 'Accounts are for people aged 18 or older; we ask for your date of birth at sign-up. Booking pages are meant for adults or for parents booking for their children. If you believe a child gave us personal data, email us and we will delete it.',
        },
        {
          heading: 'Changes',
          body: 'If we change this policy we update the date at the top. Important changes are announced by email or in the dashboard.',
        },
      ]}
    />
  )
}
