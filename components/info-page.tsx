'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Playfair_Display } from 'next/font/google'

const serif = Playfair_Display({ subsets: ['latin'], weight: ['700'], display: 'swap' })

export type InfoSection = { heading: string; body: React.ReactNode; id?: string }

// Shared layout for simple text pages (privacy, terms, contact) — same look as /faq and /about.
export default function InfoPage({ title, subtitle, sections }: { title: string; subtitle: string; sections: InfoSection[] }) {
  return (
    <main style={{
      background: 'linear-gradient(to bottom, #0e1a0d 0%, #0b1509 50%, #050a04 78%, #000000 100%)',
      color: '#ffffff',
      minHeight: '100vh',
      paddingTop: '80px',
      paddingBottom: '80px',
    }}>
      <section style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 60px', padding: '0 20px' }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={serif.className}
          style={{ fontSize: 'clamp(40px, 6vw, 56px)', fontWeight: 700, margin: '0 0 20px', lineHeight: 1.2 }}
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', margin: 0 }}
        >
          {subtitle}
        </motion.p>
      </section>

      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '0 20px' }}>
        {sections.map((s, i) => (
          <motion.div
            key={s.heading}
            id={s.id}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            style={{ borderTop: '1px solid rgba(255,255,255,0.08)', padding: '24px 0', scrollMarginTop: 80 }}
          >
            <h2 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 12px', color: 'rgba(255,255,255,0.9)' }}>{s.heading}</h2>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>{s.body}</div>
          </motion.div>
        ))}
      </section>

      <div style={{ textAlign: 'center', marginTop: '60px' }}>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', textDecoration: 'none' }}>← Back to home</Link>
      </div>
    </main>
  )
}
