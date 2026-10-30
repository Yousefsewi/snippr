import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/site-url'

// /robots.txt: keep private and technical pages out of search results.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/api', '/onboarding', '/auth', '/reset-password'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
