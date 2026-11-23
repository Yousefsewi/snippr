import type { Metadata } from 'next'
import { createClient } from '@supabase/supabase-js'
import { DEMO_BARBER, DEMO_SLUG } from '@/lib/demo-shop'

// Link previews for a barber's own booking page: when a barber shares snipprcalendar.com/b/<name>
// on WhatsApp or Instagram, the preview shows the shop's name, a short text and, if the shop has
// a photo on the web, that photo (otherwise the Snippr share picture). Only public columns are read.

const OG_DEFAULT = { url: '/og.jpg', width: 1200, height: 630, alt: 'Snippr' }
const webImage = (v: unknown) => (typeof v === 'string' && /^https:\/\//.test(v) ? v : null)

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  let shop: { name: string; bio?: string | null; address?: string | null; cover_url?: string | null; photo_url?: string | null } | null = null
  if (slug === DEMO_SLUG) shop = DEMO_BARBER
  else {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL, key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      if (url && key) {
        const { data } = await createClient(url, key).from('barbers')
          .select('name, bio, address, cover_url, photo_url').eq('slug', slug).maybeSingle()
        shop = data
      }
    } catch { /* fall back to the general preview */ }
  }
  if (!shop?.name) return {}

  const title = `${shop.name} — Book online`
  const description = (shop.bio?.trim() || `Book your appointment with ${shop.name}${shop.address ? ` in ${shop.address.split(',')[0]}` : ''} online, in seconds.`).slice(0, 200)
  const photo = webImage(shop.cover_url) ?? webImage(shop.photo_url)
  const images = photo ? [{ url: photo, alt: shop.name }] : [OG_DEFAULT]
  return {
    title: `${shop.name} · Snippr`,
    description,
    // the demo shop is a sample: reachable by link, not listed in search results
    ...(slug === DEMO_SLUG ? { robots: { index: false, follow: true } } : {}),
    openGraph: { type: 'website', siteName: 'Snippr', url: `/b/${slug}`, title, description, images },
    twitter: { card: 'summary_large_image', title, description, images: images.map(i => i.url) },
  }
}

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children
}
