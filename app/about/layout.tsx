import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About — Snippr',
  description: 'Why we built Snippr: simple, honest online booking for barbers.',
  other: { google: 'notranslate' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div translate="no" className="notranslate">{children}</div>
}
