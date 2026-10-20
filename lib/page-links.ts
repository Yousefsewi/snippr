// Shared rules for what a barber can put on their public booking page
// (social icons, link buttons, YouTube videos, theme colour). Used by the editor
// (app/dashboard/link) when saving AND by the public page (app/b/[slug]) when rendering,
// so nothing unsafe (e.g. "javascript:" links or arbitrary iframes) ever reaches customers.

export type SocialLink = { platform: string; url: string }
export type PageBlock = { id: string; type: 'link' | 'embed'; title: string; url: string; image?: string }

export const SOCIAL_PLATFORMS = [
  { key: 'instagram', label: 'Instagram', placeholder: 'instagram.com/yourshop' },
  { key: 'tiktok',    label: 'TikTok',    placeholder: 'tiktok.com/@yourshop' },
  { key: 'whatsapp',  label: 'WhatsApp',  placeholder: 'Phone number, e.g. +31 6 1234 5678' },
  { key: 'facebook',  label: 'Facebook',  placeholder: 'facebook.com/yourshop' },
  { key: 'youtube',   label: 'YouTube',   placeholder: 'youtube.com/@yourshop' },
  { key: 'x',         label: 'X',         placeholder: 'x.com/yourshop' },
  { key: 'website',   label: 'Website',   placeholder: 'yourshop.com' },
] as const

export const MAX_SOCIALS = 7
export const MAX_BLOCKS = 12

/** http(s) URL or null. Adds https:// when missing; rejects anything else (javascript:, data:, spaces…). */
export function safeUrl(input: string): string | null {
  const raw = input.trim()
  if (!raw || /\s/.test(raw)) return null
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`
  try {
    const u = new URL(withScheme)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null
    if (!u.hostname.includes('.')) return null
    return u.toString()
  } catch {
    return null
  }
}

/** WhatsApp accepts a phone number or a wa.me link. */
export function whatsappUrl(input: string): string | null {
  const digits = input.replace(/[^\d]/g, '')
  if (/wa\.me|whatsapp\.com/i.test(input)) return safeUrl(input)
  return digits.length >= 8 ? `https://wa.me/${digits}` : null
}

/** YouTube video id from watch / youtu.be / shorts / embed links, or null. */
export function youtubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? m[1] : null
}

export const isHexColor = (c: unknown): c is string => typeof c === 'string' && /^#[0-9a-f]{6}$/i.test(c)
