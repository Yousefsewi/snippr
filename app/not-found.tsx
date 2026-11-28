'use client'

// 404: a quiet, full-screen page in the site's colours. The homepage's dotted cube floats behind
// a single thin line of text ("This chair is empty.") and one small link back. Click the cube to
// scatter it. Inspired by editorial 404 pages: almost nothing on screen, one image, one sentence.

import Link from 'next/link'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import { useSiteLng } from '@/lib/use-site-lng'
import type { SiteLng } from '@/lib/site-lang'

const ParticleCube = dynamic(() => import('@/components/ParticleCube'), { ssr: false })

const COPY: Record<SiteLng, { title: string; body: string; home: string }> = {
  en: { title: 'This chair is empty.', body: 'The page you’re looking for isn’t here.', home: 'Back to the shop' },
  nl: { title: 'Deze stoel is leeg.', body: 'De pagina die je zoekt is er niet.', home: 'Terug naar de zaak' },
  de: { title: 'Dieser Stuhl ist leer.', body: 'Die Seite, die du suchst, gibt es hier nicht.', home: 'Zurück zum Laden' },
  tr: { title: 'Bu koltuk boş.', body: 'Aradığın sayfa burada değil.', home: 'Dükkâna dön' },
  ar: { title: 'هذا الكرسي فارغ.', body: 'الصفحة التي تبحث عنها غير موجودة هنا.', home: 'العودة إلى المحل' },
}

export default function NotFound() {
  const lng = useSiteLng()
  const c = COPY[lng]
  return (
    <main dir={lng === 'ar' ? 'rtl' : 'ltr'} lang={lng} style={{ position: 'relative', minHeight: '100vh', overflow: 'hidden', background: '#ece6de', color: '#1d1d1f', colorScheme: 'light' }}>
      {/* the site's soft sand / sky / rose light */}
      <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'radial-gradient(60% 50% at 12% 10%, rgba(205,170,125,0.45), transparent 70%), radial-gradient(55% 50% at 90% 35%, rgba(160,195,240,0.45), transparent 70%), radial-gradient(60% 50% at 45% 105%, rgba(240,170,190,0.38), transparent 70%)' }} />

      {/* the dotted cube, large, behind the text */}
      <div aria-hidden className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2" style={{ width: 'min(92vw, 760px)', aspectRatio: '1 / 1' }}>
        <div className="absolute cursor-pointer" style={{ inset: '-30%' }}>
          <ParticleCube />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute inset-x-0 bottom-[12vh] flex flex-col items-center px-6 text-center">
        <span className="text-[12px] tracking-[0.2em] text-[#1d1d1f]/50" style={{ fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' }}>404</span>
        <h1 className="mt-3 text-[clamp(34px,6vw,64px)] leading-[1.05] tracking-[-0.03em]" style={{ fontWeight: 300 }}>{c.title}</h1>
        <p className="mt-3 text-[15px] text-[#1d1d1f]/60">{c.body}</p>
        <Link href="/" className="pointer-events-auto mt-5 text-[14px] text-[#1d1d1f]/75 underline decoration-[#1d1d1f]/30 underline-offset-4 transition hover:text-[#1d1d1f] hover:decoration-[#1d1d1f]">
          {c.home}
        </Link>
      </motion.div>
    </main>
  )
}
