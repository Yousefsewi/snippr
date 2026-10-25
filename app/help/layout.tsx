import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Help & support — Snippr', other: { google: 'notranslate' } }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div translate="no" className="notranslate">{children}</div>
}
