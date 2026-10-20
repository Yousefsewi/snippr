"use client"

import { useState, useSyncExternalStore } from "react"

const KEY = "snippr-cookie-consent"

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange)
  return () => window.removeEventListener("storage", onChange)
}

// Snippr only stores what it needs to keep you signed in and remember your settings.
// No tracking or ad cookies, so this is a small notice with one button.
export default function CookieConsent() {
  // Server snapshot says "already accepted" so nothing renders until the client has read localStorage.
  const stored = useSyncExternalStore(subscribe, () => { try { return !!localStorage.getItem(KEY) } catch { return true } }, () => true)
  const [dismissed, setDismissed] = useState(false)

  if (stored || dismissed) return null

  const accept = () => {
    try { localStorage.setItem(KEY, "accepted") } catch { /* private mode: just hide it */ }
    setDismissed(true)
  }

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="fixed inset-x-4 bottom-4 z-[100] flex items-center gap-4 rounded-[22px] border border-white/70 bg-white/80 px-5 py-4 text-[#111] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:inset-x-auto sm:left-5 sm:max-w-[420px]"
      style={{ colorScheme: "light" }}
    >
      <p className="text-[13px] leading-snug text-[#3a3a3c]">
        We only use essential cookies to keep you signed in. No tracking.{" "}
        <a href="/privacy" className="font-medium text-[#111] underline underline-offset-2">Privacy</a>
      </p>
      <button
        onClick={accept}
        className="flex-shrink-0 rounded-full bg-[#1c1c1e] px-5 py-2 text-[13px] font-semibold text-white transition-transform active:scale-95"
      >
        OK
      </button>
    </div>
  )
}
