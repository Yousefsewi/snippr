import type { Metadata } from 'next'
import type { SiteLng } from './site-lang'
import { TRIAL_DAYS } from './legal'

// Titles and descriptions of the homepage per language, and the links between the language
// versions (hreflang) so search engines show each visitor the right one.
export const HOME_PATHS: Record<SiteLng, string> = { en: '/', nl: '/nl', de: '/de', tr: '/tr', ar: '/ar' }

const META: Record<SiteLng, { title: string; description: string; locale: string }> = {
  en: { title: 'Snippr — Online Booking for Barbers & Salons', locale: 'en_GB',
    description: 'Online booking for barbers and salons. Put your link in your bio or on Instagram, or hang up your QR code — clients book in seconds.' },
  nl: { title: 'Snippr — Online afspraken voor kappers en barbershops, zonder commissie', locale: 'nl_NL',
    description: `Online boeken voor kappers, barbershops en salons. Je eigen boekingslink en QR-code, herinneringen per e-mail en nooit commissie. ${TRIAL_DAYS} dagen gratis.` },
  de: { title: 'Snippr — Online-Terminbuchung für Friseure und Barbershops', locale: 'de_DE',
    description: `Online-Terminbuchung für Friseure, Barbershops und Salons. Eigener Buchungslink und QR-Code, E-Mail-Erinnerungen und keine Provision. ${TRIAL_DAYS} Tage kostenlos.` },
  tr: { title: 'Snippr — Berber ve kuaförler için online randevu', locale: 'tr_TR',
    description: `Berber, kuaför ve salonlar için online randevu sistemi. Kendi randevu linkin ve QR kodun, e-posta hatırlatmaları, komisyon yok. ${TRIAL_DAYS} gün ücretsiz.` },
  ar: { title: 'Snippr — حجز المواعيد عبر الإنترنت للحلاقين والصالونات', locale: 'ar_AR',
    description: `نظام حجز مواعيد للحلاقين والصالونات: رابط حجز ورمز QR خاص بك، تذكيرات بالبريد الإلكتروني وبدون عمولة. ${TRIAL_DAYS} يومًا مجانًا.` },
}

export function homeMetadata(lng: SiteLng): Metadata {
  const m = META[lng]
  return {
    title: m.title,
    description: m.description,
    alternates: {
      canonical: HOME_PATHS[lng],
      languages: { en: '/', nl: '/nl', de: '/de', tr: '/tr', ar: '/ar', 'x-default': '/' },
    },
    openGraph: {
      url: HOME_PATHS[lng], siteName: 'Snippr', type: 'website', locale: m.locale,
      title: m.title, description: m.description,
      images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Snippr' }],
    },
    twitter: { card: 'summary_large_image', title: m.title, description: m.description, images: ['/og.jpg'] },
  }
}
