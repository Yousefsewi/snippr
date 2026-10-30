'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useClientValue } from '@/lib/use-stored'

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = atob(base64)
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)))
}

export default function NotificationOptIn() {
  // Only offer push when the browser supports it and the user hasn't decided yet.
  const canAsk = useClientValue(
    () => 'serviceWorker' in navigator && 'PushManager' in window && Notification.permission === 'default',
    false,
  )
  const [dismissed, setDismissed] = useState(false)
  const visible = canAsk && !dismissed
  const setVisible = (v: boolean) => setDismissed(!v)
  const [busy, setBusy] = useState(false)

  const enable = async () => {
    setBusy(true)
    try {
      const registration = await navigator.serviceWorker.register('/sw.js')
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') { setVisible(false); setBusy(false); return }

      const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!publicKey) { setVisible(false); setBusy(false); return }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      })

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('barbers').update({ push_subscription: subscription.toJSON() }).eq('user_id', user.id)
      }
    } finally {
      setBusy(false)
      setVisible(false)
    }
  }

  if (!visible) return null

  return (
    <div
      className="fixed bottom-6 left-6 z-50 flex items-center gap-3 rounded-2xl px-4 py-3 max-md:right-4 max-md:left-4 max-md:bottom-[calc(var(--tabbar-h)+12px)]"
      style={{ background: '#1b1b1d', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 20px 50px rgba(0,0,0,0.45)', maxWidth: 320 }}
    >
      <div style={{ flex: 1 }}>
        <p className="text-white text-[13.5px] font-semibold leading-tight">Randevu bildirimlerini aç</p>
        <p className="text-[12px] mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Yeni randevu gelince telefonuna anında haber verelim.</p>
      </div>
      <button
        onClick={enable}
        disabled={busy}
        className="flex-shrink-0 rounded-full px-3.5 py-2 text-[12px] font-semibold"
        style={{ background: '#a8a8a8', color: '#0a0a0a', opacity: busy ? 0.6 : 1 }}
      >
        {busy ? '…' : 'Aç'}
      </button>
      <button
        onClick={() => setVisible(false)}
        aria-label="Kapat"
        className="flex-shrink-0"
        style={{ color: 'rgba(255,255,255,0.4)' }}
      >
        ✕
      </button>
    </div>
  )
}
