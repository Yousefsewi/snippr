import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact — Snippr',
  description: 'Questions about Snippr? Send us a message and we’ll reply by email.',
  other: { google: 'notranslate' },
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div translate="no" className="notranslate">{children}</div>
}
