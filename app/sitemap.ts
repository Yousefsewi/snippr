import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

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
  { path: '/login', priority: 0.3 },
  { path: '/privacy', priority: 0.2 },
  { path: '/terms', priority: 0.2 },
]

export default function sitemap(): MetadataRoute.Sitemap {
  return PAGES.map(p => ({ url: `${SITE_URL}${p.path}`, changeFrequency: 'monthly', priority: p.priority }))
}
