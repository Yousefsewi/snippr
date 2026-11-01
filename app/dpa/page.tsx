import Link from 'next/link'
import InfoPage from '@/components/info-page'
import { COMPANY, SUPPORT_EMAIL } from '@/lib/site'

export const metadata = { title: 'Data Processing Agreement — Snippr', description: 'Verwerkersovereenkomst: how Snippr processes your customers’ data on your behalf.' }

// DRAFT data processing agreement (GDPR art. 28 / verwerkersovereenkomst) — to be checked by a lawyer.

const ul: React.CSSProperties = { margin: '0 0 12px', paddingLeft: 18 }
const a: React.CSSProperties = { color: 'rgba(255,255,255,0.9)' }

export default function DpaPage() {
  return (
    <InfoPage
      title="Data Processing Agreement"
      subtitle="Verwerkersovereenkomst — part of our Terms of Service. Last updated: 1 November 2026."
      sections={[
        {
          heading: '1. Parties and scope',
          body: <>This agreement is between you, the barber or salon using Snippr (the <b>controller</b>), and {COMPANY.name} (the <b>processor</b>, details on the <Link href="/imprint" style={a}>imprint page</Link>). It applies automatically when you accept our <Link href="/terms" style={a}>Terms of Service</Link> and covers all personal data of your customers that Snippr processes for you.</>,
        },
        {
          heading: '2. What we process',
          body: (
            <ul style={ul}>
              <li><b>Purpose</b>: running your booking page, calendar, waiting list, confirmation and reminder emails, and notifications to you.</li>
              <li><b>People</b>: your customers and people on your waiting list.</li>
              <li><b>Data</b>: name, and if given, email address and phone number; appointment details (service, date, time, status, tips and payment method you record); language and time zone; notes on the waiting list.</li>
              <li><b>Duration</b>: as long as your account exists. No special categories of data (such as health data) are needed or should be entered.</li>
            </ul>
          ),
        },
        {
          heading: '3. Our obligations',
          body: (
            <ul style={ul}>
              <li>We process the data only on your documented instructions — using Snippr as intended counts as those instructions — unless EU or Dutch law requires otherwise.</li>
              <li>Everyone at Snippr with access to the data is bound to confidentiality.</li>
              <li>We take appropriate technical and organisational security measures: encrypted connections (HTTPS), hashed passwords, database rules that keep each barber’s data separate, limited access, and EU-based database servers.</li>
              <li>We help you answer requests from your customers (access, correction, deletion, export) and with data protection impact assessments where needed.</li>
              <li>We tell you without undue delay, and where possible within 48 hours, after discovering a personal data breach that affects your customers, so you can meet your 72-hour reporting duty.</li>
              <li>We give you the information needed to show compliance and allow reasonable audits, at most once a year and with notice.</li>
            </ul>
          ),
        },
        {
          heading: '4. Sub-processors',
          body: (
            <>
              <p style={{ margin: '0 0 12px' }}>You give general permission for the following sub-processors. We will announce new ones at least 30 days in advance so you can object; they are bound to the same obligations.</p>
              <ul style={ul}>
                <li><b>Supabase</b> — database and authentication, EU (Ireland).</li>
                <li><b>Vercel</b> — hosting and server code (US company; EU–US Data Privacy Framework / Standard Contractual Clauses).</li>
                <li><b>Google (Gmail)</b> — sending emails to your customers (EU–US Data Privacy Framework / Standard Contractual Clauses).</li>
              </ul>
            </>
          ),
        },
        {
          heading: '5. End of the agreement',
          body: 'When you delete your account, all your customers’ data is deleted from the live database right away and disappears from backups within their normal rotation (at most 30 days). Before that you can export it from the dashboard.',
        },
        {
          heading: '6. Your obligations',
          body: 'You make sure you are allowed to process your customers’ data, inform them about it (for example by linking to your own privacy notice or ours), and only enter the data that is needed for appointments.',
        },
        {
          heading: '7. Liability and law',
          body: <>Liability follows the <Link href="/terms" style={a}>Terms of Service</Link>. Dutch law applies. Questions: <a href={`mailto:${SUPPORT_EMAIL}`} style={a}>{SUPPORT_EMAIL}</a>.</>,
        },
      ]}
    />
  )
}
