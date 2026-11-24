'use client'

// Last-resort error screen when the whole app crashes; the error is reported to Sentry.
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { Sentry.captureException(error) }, [error])
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#ece6de', color: '#1d1d1f', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ textAlign: 'center', padding: 24 }}>
          <h1 style={{ fontSize: 24, margin: '0 0 8px' }}>Something went wrong</h1>
          <p style={{ margin: '0 0 20px', color: '#6e6e73' }}>We have been notified and will fix it. Please try again.</p>
          <button onClick={reset} style={{ height: 44, padding: '0 22px', borderRadius: 999, border: 0, background: '#1d1d1f', color: '#fff', fontSize: 16, cursor: 'pointer' }}>Try again</button>
        </div>
      </body>
    </html>
  )
}
