import type { Metadata } from 'next'

// Keep the browser from offering to translate the login screen
export const metadata: Metadata = { title: 'Log in — Snippr', other: { google: 'notranslate' } }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div translate="no" className="notranslate">{children}</div>
}
