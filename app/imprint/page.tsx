import InfoPage from '@/components/info-page'
import { COMPANY, SUPPORT_EMAIL } from '@/lib/site'

export const metadata = { title: 'Imprint — Snippr', description: 'Company details for Snippr (Netherlands).' }

// Legal company details (Dutch/EU requirement). Values come from COMPANY in lib/site.ts.
const pending = 'Follows after KvK registration'

export default function ImprintPage() {
  const row = (label: string, value: string) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, padding: '6px 0' }}>
      <span>{label}</span>
      <span style={{ color: value ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)', textAlign: 'right' }}>{value || pending}</span>
    </div>
  )
  return (
    <InfoPage
      title="Imprint"
      subtitle="Who is behind Snippr."
      sections={[
        {
          heading: 'Company',
          body: (
            <div>
              {row('Trade name', COMPANY.name)}
              {row('Responsible', COMPANY.owner)}
              {row('Address', COMPANY.address ? `${COMPANY.address}, ${COMPANY.country}` : '')}
              {row('KvK number', COMPANY.kvk)}
              {row('BTW (VAT) number', COMPANY.btw)}
            </div>
          ),
        },
        {
          heading: 'Contact',
          body: <p style={{ margin: 0 }}>Email: <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: 'rgba(255,255,255,0.9)' }}>{SUPPORT_EMAIL}</a></p>,
        },
        {
          heading: 'Disputes',
          body: 'We prefer to solve any problem directly — just email us. Consumers in the EU can also use the European Commission’s online dispute resolution platform: ec.europa.eu/consumers/odr.',
        },
      ]}
    />
  )
}
