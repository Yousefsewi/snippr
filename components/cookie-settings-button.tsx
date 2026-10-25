'use client'

import { openCookieSettings } from '@/lib/consent'

// "Change cookie settings" link for the privacy page
export default function CookieSettingsButton({ label = 'Change your cookie settings' }: { label?: string }) {
  return (
    <button type="button" onClick={openCookieSettings}
      style={{ background: 'none', border: 0, padding: 0, color: '#c4b5fd', textDecoration: 'underline', cursor: 'pointer', font: 'inherit' }}>
      {label}
    </button>
  )
}
