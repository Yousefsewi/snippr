"use client"

import { useState, useSyncExternalStore } from "react"
import { Button } from "@/components/ui/button"

const KEY = "snippr-cookie-consent"

const subscribe = (onChange: () => void) => {
  window.addEventListener("storage", onChange)
  return () => window.removeEventListener("storage", onChange)
}

export default function CookieConsent() {
  // Server snapshot says "already accepted" so nothing renders until the client has read localStorage.
  const stored = useSyncExternalStore(subscribe, () => !!localStorage.getItem(KEY), () => true)
  const [dismissed, setDismissed] = useState(false)

  if (stored || dismissed) return null

  const accept = () => {
    localStorage.setItem(KEY, "accepted")
    setDismissed(true)
  }

  return (
    <div className="bg-background fixed bottom-5 left-5 z-[100] mx-auto max-w-md rounded-2xl border p-4 shadow-2xl">
      <h4 className="font-semibold">🍪 Cookie Notice</h4>

      <p className="text-muted-foreground mt-4 text-sm">
        We use cookies to ensure that we give you the best experience on our website.{" "}
        <a href="/privacy" className="text-blue-500 hover:underline">
          Read cookies policies
        </a>
        .
      </p>

      <div className="mt-4 flex shrink-0 items-center justify-between gap-x-4">
        <Button variant="link" size="sm" className="px-0 text-xs underline" onClick={accept}>
          Manage your preferences
        </Button>
        <Button size="sm" onClick={accept}>Accept</Button>
      </div>
    </div>
  )
}
