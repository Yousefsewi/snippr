'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useStored } from '@/lib/use-stored'
import { SALON_STYLE_KEY } from '@/lib/glass'

// Thin iOS-style progress bar at the top of the screen while a page change is loading.
// Starts the moment an internal link is clicked (so on a slow connection the user sees
// the click registered) and finishes when the new pathname renders.
export default function TopLoader() {
  const pathname = usePathname()
  const barber = useStored(SALON_STYLE_KEY) === 'barber' && pathname.startsWith('/dashboard')
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null)
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null)
  const active = useRef(false)

  const stopTimers = useCallback(() => {
    if (trickle.current) clearInterval(trickle.current)
    if (safety.current) clearTimeout(safety.current)
    trickle.current = null
    safety.current = null
  }, [])

  const finish = useCallback(() => {
    if (!active.current) return
    active.current = false
    stopTimers()
    setProgress(100)
    setTimeout(() => { setVisible(false); setTimeout(() => setProgress(0), 250) }, 220)
  }, [stopTimers])

  useEffect(() => {
    const start = () => {
      if (active.current) return
      active.current = true
      setVisible(true)
      setProgress(8)
      // creep towards 90% but never reach it until the page actually arrives
      trickle.current = setInterval(() => setProgress(p => p + (90 - p) * 0.08), 200)
      // a failed navigation should not leave the bar stuck forever
      safety.current = setTimeout(finish, 15000)
    }

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      const a = (e.target as HTMLElement | null)?.closest('a')
      if (!a || !a.href || a.hasAttribute('download')) return
      if (a.target && a.target !== '_self') return
      const url = new URL(a.href, location.href)
      if (url.origin !== location.origin) return
      if (url.pathname === location.pathname && url.search === location.search) return // same page / #hash
      start()
    }

    document.addEventListener('click', onClick, true)
    window.addEventListener('popstate', start)
    return () => {
      document.removeEventListener('click', onClick, true)
      window.removeEventListener('popstate', start)
      stopTimers()
    }
  }, [finish, stopTimers])

  // New page rendered → complete the bar
  useEffect(() => { finish() }, [pathname, finish])

  return (
    <div
      aria-hidden
      style={{
        position: 'fixed', top: 0, left: 0, zIndex: 9999, pointerEvents: 'none',
        height: 3, width: `${progress}%`,
        borderRadius: '0 3px 3px 0',
        background: barber
          ? 'linear-gradient(90deg, #0a0a0a, #525252, #a3a3a3)'
          : 'linear-gradient(90deg, #c4a47c, #f472b6, #93c5fd)',
        boxShadow: barber
          ? '0 0 10px rgba(0,0,0,0.35), 0 0 4px rgba(0,0,0,0.25)'
          : '0 0 10px rgba(244,114,182,0.55), 0 0 4px rgba(147,197,253,0.6)',
        opacity: visible ? 1 : 0,
        transition: `width ${progress === 0 ? '0s' : '0.2s'} ease, opacity 0.25s ease`,
      }}
    />
  )
}
