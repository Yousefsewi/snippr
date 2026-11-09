// Languages of the public website (homepage, pricing…). Picked in the footer, saved as
// `snippr-lang` (the dashboard and the login pages read the same key).
// Chosen for Snippr's markets: Dutch (NL/BE), German (DE/AT/CH), Turkish and Arabic
// speaking barbers in Europe, and English for everyone else.

export type SiteLng = 'en' | 'nl' | 'de' | 'tr' | 'ar'

export const SITE_LANGS: { code: SiteLng; tag: string; label: string }[] = [
  { code: 'en', tag: 'EN', label: 'English' },
  { code: 'nl', tag: 'NL', label: 'Nederlands' },
  { code: 'de', tag: 'DE', label: 'Deutsch' },
  { code: 'tr', tag: 'TR', label: 'Türkçe' },
  { code: 'ar', tag: 'AR', label: 'العربية' },
]

export const isSiteLng = (v: unknown): v is SiteLng => typeof v === 'string' && SITE_LANGS.some(l => l.code === v)

/** Language from the browser, for a first visit (no saved choice yet). */
export function browserSiteLng(): SiteLng {
  const l = (typeof navigator !== 'undefined' ? navigator.language : '').toLowerCase()
  const two = l.slice(0, 2)
  return isSiteLng(two) ? two : 'en'
}

/** One short text in every site language. */
export type All = Record<SiteLng, string>
export const L = (lng: SiteLng, t: All) => t[lng] ?? t.en

/** Date/number locale for each site language (Arabic with Latin digits, like the booking page). */
export const SITE_LOCALE: Record<SiteLng, string> = { en: 'en-GB', nl: 'nl-NL', de: 'de-DE', tr: 'tr-TR', ar: 'ar-u-nu-latn' }
/** Any language code → a site language (unknown → English). */
export const toSiteLng = (v: unknown): SiteLng => (isSiteLng(v) ? v : 'en')
