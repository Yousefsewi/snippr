import type { Metadata } from 'next'

// Keep the browser from offering to translate the login screen
export const metadata: Metadata = { title: 'Log in — Snippr', description: 'Log in to your Snippr dashboard to see your bookings and calendar.', robots: { index: false, follow: true }, other: { google: 'notranslate' } }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div translate="no" className="notranslate">{children}</div>
}
