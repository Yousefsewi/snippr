import type { Metadata } from 'next'

// Keep the browser from offering to translate the sign-up screen
export const metadata: Metadata = { title: 'Sign up — Snippr', description: 'Create your Snippr account and get your own booking link for your barbershop or salon in a few minutes. Free for 15 days, no card needed.', other: { google: 'notranslate' } }

export default function Layout({ children }: { children: React.ReactNode }) {
  return <div translate="no" className="notranslate">{children}</div>
}
