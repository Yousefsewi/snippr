'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Playfair_Display } from 'next/font/google'

const serif = Playfair_Display({ subsets: ['latin'], weight: ['700'], display: 'swap' })

export default function NotFound() {
  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom, #0e1a0d 0%, #0b1509 50%, #050a04 78%, #000000 100%)',
      color: '#ffffff',
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* Animated background elements */}
      <div style={{
        position: 'absolute',
        top: '10%',
        left: '10%',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, transparent 70%)',
        filter: 'blur(40px)',
      }} />

      <div style={{
        position: 'absolute',
        bottom: '10%',
        right: '10%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(76,175,80,0.03) 0%, transparent 70%)',
        filter: 'blur(50px)',
      }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        style={{
          textAlign: 'center',
          zIndex: 10,
          maxWidth: '600px',
          padding: '40px 20px',
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <h1 className={`${serif.className}`} style={{
            fontSize: 'clamp(64px, 10vw, 120px)',
            fontWeight: 700,
            margin: '0 0 20px',
            background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            404
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 style={{
            fontSize: '28px',
            fontWeight: 600,
            margin: '0 0 16px',
            color: '#ffffff',
          }}>
            Page not found
          </h2>
          <p style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.6)',
            margin: '0 0 32px',
            lineHeight: 1.6,
          }}>
            Sorry, we couldn’t find the page you’re looking for. It might have been moved or deleted.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}
        >
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px 32px',
            borderRadius: '12px',
            background: '#ffffff',
            color: '#000000',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}>
            Back to home
          </Link>
          <Link href="/dashboard" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px 32px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#ffffff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}>
            Dashboard
          </Link>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{
            fontSize: '13px',
            color: 'rgba(255,255,255,0.35)',
            marginTop: '48px',
          }}
        >
          Error Code: 404
        </motion.p>
      </motion.div>
    </main>
  )
}
