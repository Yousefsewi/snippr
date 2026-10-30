// The site's public address, e.g. https://www.snipprcalendar.com. Comes from the SITE_URL
// environment variable (set in Vercel); next.config.ts also passes it to the browser.
// Every link we hand out — booking links, QR codes, email links, SEO tags — uses this,
// never the address the page happens to be opened on. Locally it falls back to localhost.
export const SITE_URL = (process.env.SITE_URL || 'http://localhost:3000').replace(/\/+$/, '')
