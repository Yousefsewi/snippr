import { notFound } from 'next/navigation'
import HomePage from '@/components/home-page'
import { homeMetadata } from '@/lib/home-meta'
import type { SiteLng } from '@/lib/site-lang'

// /nl, /de, /tr and /ar: the homepage in that language. Any other single word is a 404.
const LANGS = ['nl', 'de', 'tr', 'ar'] as const
type PageLng = (typeof LANGS)[number]
const isPageLng = (v: string): v is PageLng => (LANGS as readonly string[]).includes(v)

export const dynamicParams = false
export function generateStaticParams() {
  return LANGS.map(lang => ({ lang }))
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  return isPageLng(lang) ? homeMetadata(lang) : {}
}

export default async function Page({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!isPageLng(lang)) notFound()
  return <HomePage fixedLng={lang as SiteLng} />
}
