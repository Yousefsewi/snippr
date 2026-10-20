'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      setSuccess(true)
      setEmail('')
      setTimeout(() => setSuccess(false), 3000)
    } catch {
      setError('Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      style={{
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.12)',
        borderRadius: '20px',
        padding: '40px',
        textAlign: 'center',
        maxWidth: '500px',
        margin: '0 auto',
      }}
    >
      <h3 style={{
        fontSize: '24px',
        fontWeight: 600,
        color: '#ffffff',
        margin: '0 0 12px',
      }}>
        Stay updated
      </h3>
      <p style={{
        fontSize: '14px',
        color: 'rgba(255,255,255,0.6)',
        margin: '0 0 24px',
      }}>
        Get the latest tips and updates delivered to your inbox.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '8px', flexDirection: 'column' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading || success}
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '12px 16px',
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s',
              opacity: loading || success ? 0.5 : 1,
            }}
          />
          <button
            type="submit"
            disabled={loading || success}
            style={{
              background: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              color: '#000000',
              fontWeight: 600,
              fontSize: '14px',
              padding: '12px 24px',
              cursor: loading || success ? 'not-allowed' : 'pointer',
              opacity: loading || success ? 0.7 : 1,
              transition: 'all 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {success ? '✓' : loading ? '...' : 'Subscribe'}
          </button>
        </div>

        {success && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: '13px',
              color: '#4ade80',
              margin: 0,
            }}
          >
            Thank you! Check your email.
          </motion.p>
        )}

        {error && (
          <p style={{
            fontSize: '13px',
            color: '#f87171',
            margin: 0,
          }}>
            {error}
          </p>
        )}
      </form>

      <p style={{
        fontSize: '12px',
        color: 'rgba(255,255,255,0.35)',
        margin: '16px 0 0',
      }}>
        We respect your privacy. Unsubscribe at any time.
      </p>
    </motion.div>
  )
}
