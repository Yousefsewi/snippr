import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Help & support — Snippr', description: 'Guides and answers for Snippr: setting up your booking page, your calendar, reminders and your account.', other: { google: 'notranslate' } }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div translate="no" className="notranslate">{children}</div>
}
