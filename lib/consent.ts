// Cookie choice, stored in the visitor's browser.
// Snippr only uses what's needed to run the site (sign-in, settings, this choice).
// Analytics and marketing are off and unused today; if we ever add them, check
// hasConsent('analytics') / hasConsent('marketing') before loading anything.

export const CONSENT_KEY = 'snippr-cookie-consent'
export const OPEN_COOKIE_SETTINGS = 'snippr:open-cookie-settings'

export type Consent = { v: 1; necessary: true; analytics: boolean; marketing: boolean; at: string }

export function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY)
    if (!raw) return null
    // "accepted" came from the older one-button notice: ask again once, now that there are choices
    if (raw === 'accepted') return null
    const c = JSON.parse(raw)
    return c && c.v === 1 ? c : null
  } catch {
    return null
  }
}

export function saveConsent(analytics: boolean, marketing: boolean) {
  const c: Consent = { v: 1, necessary: true, analytics, marketing, at: new Date().toISOString() }
  try { localStorage.setItem(CONSENT_KEY, JSON.stringify(c)) } catch { /* private mode: choice lasts this visit only */ }
  return c
}

export function hasConsent(kind: 'analytics' | 'marketing') {
  return !!readConsent()?.[kind]
}

/** Opens the cookie window again (e.g. from the privacy page). */
export function openCookieSettings() {
  window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS))
}
