'use client'

import { useState } from 'react'
import { useClientValue } from '@/lib/use-stored'
import QRCode from 'react-qr-code'

export default function DownloadPopup() {
  const [open, setOpen] = useState(true)
  const url = useClientValue(() => window.location.origin + '/register', '/register')

  if (!open) return null

  return (
    <div
      className="fixed bottom-24 right-6 z-50 flex items-center gap-4 rounded-2xl p-4 pr-5 animate-[fadeUp_.4s_ease]"
      style={{
        // liquid glass, like the rest of the landing page
        background: 'linear-gradient(145deg, rgba(255,255,255,0.78), rgba(255,255,255,0.45))',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: '1px solid rgba(255,255,255,0.85)',
        boxShadow: 'inset 0 1px 0 #fff, 0 16px 40px rgba(30,30,60,0.16)',
        maxWidth: 340,
      }}
    >
      {/* close */}
      <button
        onClick={() => setOpen(false)}
        aria-label="Close"
        className="absolute top-2.5 right-2.5 w-5 h-5 flex items-center justify-center rounded-full transition-colors"
        style={{ color: 'rgba(29,29,31,0.4)' }}
        onMouseEnter={(e) => { e.currentTarget.style.color = '#1d1d1f' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(29,29,31,0.4)' }}
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>

      {/* left: text */}
      <div className="flex flex-col">
        {/* flower icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#1d1d1f" className="mb-3">
          <circle cx="12" cy="6" r="2.6" /><circle cx="12" cy="18" r="2.6" />
          <circle cx="6" cy="12" r="2.6" /><circle cx="18" cy="12" r="2.6" />
          <circle cx="7.8" cy="7.8" r="2.4" /><circle cx="16.2" cy="16.2" r="2.4" />
          <circle cx="16.2" cy="7.8" r="2.4" /><circle cx="7.8" cy="16.2" r="2.4" />
        </svg>
        <p className="font-semibold text-[15px] leading-tight" style={{ color: '#1d1d1f' }}>Snippr on your phone</p>
        <p className="text-[13px] mt-1" style={{ color: 'rgba(29,29,31,0.6)' }}>Scan to set up your booking page</p>
      </div>

      {/* right: QR */}
      <div className="flex-shrink-0 bg-white rounded-xl p-2" style={{ width: 84, height: 84 }}>
        <QRCode value={url} size={68} style={{ width: '100%', height: '100%' }} />
      </div>

      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  )
}
