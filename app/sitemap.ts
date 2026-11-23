import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'
import { HOME_PATHS } from '@/lib/home-meta'

// /sitemap.xml: the public pages search engines should know about.
// Barbers' booking pages (/b/…) are found through links, so they are not listed here.
const PAGES: { path: string; priority: number }[] = [
  { path: '', priority: 1 },
  { path: '/pricing', priority: 0.8 },
  { path: '/about', priority: 0.6 },
  { path: '/help', priority: 0.6 },
  { path: '/faq', priority: 0.6 },
  { path: '/contact', priority: 0.5 },
  { path: '/register', priority: 0.7 },
  { path: '/privacy', priority: 0.2 },
  { path: '/terms', priority: 0.2 },
  { path: '/imprint', priority: 0.2 },
  { path: '/dpa', priority: 0.2 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  // the homepage in every language, each listing the others (hreflang)
  const languages = Object.fromEntries(Object.entries(HOME_PATHS).map(([l, p]) => [l, `${SITE_URL}${p === '/' ? '' : p}`]))
  const homes = Object.values(HOME_PATHS).map(p => ({
    url: `${SITE_URL}${p === '/' ? '' : p}`, lastModified, changeFrequency: 'monthly' as const, priority: p === '/' ? 1 : 0.9, alternates: { languages },
  }))
  return [...homes, ...PAGES.filter(p => p.path !== '').map(p => ({ url: `${SITE_URL}${p.path}`, lastModified, changeFrequency: 'monthly' as const, priority: p.priority }))]
}
