'use client'

import { useSyncExternalStore } from 'react'

// Same-tab writes fire this event; other tabs get the native 'storage' event.
const EVENT = 'snippr:storage'

function subscribe(onChange: () => void) {
  window.addEventListener('storage', onChange)
  window.addEventListener(EVENT, onChange)
  return () => {
    window.removeEventListener('storage', onChange)
    window.removeEventListener(EVENT, onChange)
  }
}

/** Reads a localStorage key and re-renders when it changes. Returns null on the server and during hydration. */
export function useStored(key: string): string | null {
  return useSyncExternalStore(subscribe, () => localStorage.getItem(key), () => null)
}

export function writeStored(key: string, value: string) {
  localStorage.setItem(key, value)
  window.dispatchEvent(new Event(EVENT))
}

const noopSubscribe = () => () => {}

/** A value that only exists in the browser (e.g. window.location.origin); `serverValue` is used during SSR/hydration. */
export function useClientValue<T>(getValue: () => T, serverValue: T): T {
  return useSyncExternalStore(noopSubscribe, getValue, () => serverValue)
}
