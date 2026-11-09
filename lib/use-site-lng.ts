'use client'

// The visitor's site language on pages outside the homepage: the one picked in the footer
// (saved as `snippr-lang`), otherwise the browser language. English on the server.
import { useSyncExternalStore } from 'react'
import { browserSiteLng, isSiteLng, type SiteLng } from './site-lang'

const EVENT = 'snippr:storage' // same event lib/use-stored.ts fires
const subscribe = (cb: () => void) => {
  window.addEventListener('storage', cb)
  window.addEventListener(EVENT, cb)
  return () => { window.removeEventListener('storage', cb); window.removeEventListener(EVENT, cb) }
}

export function useSiteLng(): SiteLng {
  return useSyncExternalStore(subscribe, () => {
    let saved: string | null = null
    try { saved = localStorage.getItem('snippr-lang') } catch { /* blocked */ }
    return isSiteLng(saved) ? saved : browserSiteLng()
  }, () => 'en' as SiteLng)
}
