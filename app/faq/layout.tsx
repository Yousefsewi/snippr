import type { Metadata } from 'next'
import { FAQ_TEXT } from './faq-text'

export const metadata: Metadata = {
  title: 'FAQ — Snippr',
  description: 'Answers about Snippr online booking for barbers and salons: booking links, setup costs, confirmations, opening hours and payments.',
}

// FAQPage structured data from the English questions on the page.
const JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_TEXT.en.faqs.map(f => ({ '@type': 'Question', name: f.question, acceptedAnswer: { '@type': 'Answer', text: f.answer } })),
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSONLD) }} />
      {children}
    </>
  )
}
