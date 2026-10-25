import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Plans & pricing — Snippr', other: { google: 'notranslate' } }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div translate="no" className="notranslate">{children}</div>
}
