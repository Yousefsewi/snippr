'use client'

import { ReactNode } from 'react'

export default function CRMLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#F5F5F5',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {children}
    </div>
  )
}
