'use client'

// 404: a dusk landscape made of points (components/dream-field.tsx) under a lilac sky with a thin
// crescent moon, and one line of white text with a small link back. Almost nothing else on screen.

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useSiteLng } from '@/lib/use-site-lng'
import type { SiteLng } from '@/lib/site-lang'

const DreamField = dynamic(() => import('@/components/dream-field'), { ssr: false })

const COPY: Record<SiteLng, { title: string; home: string }> = {
  en: { title: 'this chair is empty', home: 'back to the shop' },
  nl: { title: 'deze stoel is leeg', home: 'terug naar de zaak' },
  de: { title: 'dieser Stuhl ist leer', home: 'zurück zum Laden' },
  tr: { title: 'bu koltuk boş', home: 'dükkâna dön' },
  ar: { title: 'هذا الكرسي فارغ', home: 'العودة إلى المحل' },
}

// a thin crescent: a light disc with a sky-coloured disc slightly offset over it
const Moon = ({ size, left, top, rotate }: { size: number; left: string; top: string; rotate: number }) => (
  <div aria-hidden style={{ position: 'absolute', left, top, width: size, height: size, transform: `rotate(${rotate}deg)` }}>
    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#f4f2ff', boxShadow: '0 0 18px rgba(244,242,255,0.6)' }} />
    <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#706f92', transform: `translate(${size * 0.18}px, ${-size * 0.12}px)` }} />
  </div>
)

export default function NotFound() {
  const lng = useSiteLng()
  const c = COPY[lng]
  return (
    <main dir={lng === 'ar' ? 'rtl' : 'ltr'} lang={lng} style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: 'linear-gradient(to bottom, #6d6c8f 0%, #78779a 45%, #8a88a8 100%)', color: '#fff', colorScheme: 'dark' }}>
      <Moon size={42} left="57%" top="5%" rotate={-20} />
      <Moon size={20} left="65%" top="13%" rotate={-35} />
      <DreamField className="absolute inset-0" />
      {/* a soft shade behind the text so it stays readable over the dots */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(40% 22% at 50% 50%, rgba(60,58,90,0.35), transparent 75%)' }} />

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <span className="text-[14px] text-white/85">404</span>
        <h1 className="mt-4 text-[clamp(38px,6.5vw,76px)] leading-[1.05] tracking-[-0.02em]" style={{ fontWeight: 400, color: '#ffffff', textShadow: '0 2px 24px rgba(30,28,60,0.45)' }}>{c.title}</h1>
        <Link href="/" className="mt-7 text-[15px] text-white/90 underline decoration-white/50 underline-offset-4 transition hover:decoration-white">
          {c.home}
        </Link>
      </motion.div>
    </main>
  )
}
