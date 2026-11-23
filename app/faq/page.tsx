'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { SUPPORT_EMAIL } from '@/lib/site'
import { playfair as serif } from '@/lib/fonts'
import { useSiteLng } from '@/lib/use-site-lng'
import { FAQ_TEXT } from './faq-text'


export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const c = FAQ_TEXT[useSiteLng()]
  const faqs = c.faqs

  return (
    <main style={{
      background: 'linear-gradient(to bottom, #0e1a0d 0%, #0b1509 50%, #050a04 78%, #000000 100%)',
      color: '#ffffff',
      minHeight: '100vh',
      paddingTop: '80px',
      paddingBottom: '80px',
    }}>

      {/* Header */}
      <section style={{
        textAlign: 'center',
        maxWidth: '600px',
        margin: '0 auto 60px',
        padding: '0 20px',
      }}>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className={serif.className}
          style={{
            fontSize: 'clamp(40px, 6vw, 56px)',
            fontWeight: 700,
            margin: '0 0 20px',
            lineHeight: 1.2,
          }}
        >
          {c.title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.6)',
            margin: 0,
          }}
        >
          {c.sub}
        </motion.p>
      </section>

      {/* FAQ List */}
      <section style={{
        maxWidth: '700px',
        margin: '0 auto',
        padding: '0 20px',
      }}>
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            style={{
              borderTop: '1px solid rgba(255,255,255,0.08)',
              padding: '24px 0',
            }}
          >
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              style={{
                width: '100%',
                background: 'none',
                border: 'none',
                color: 'inherit',
                textAlign: 'left',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: '20px',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget.firstChild as HTMLElement).style.color = '#fff'
              }}
              onMouseLeave={(e) => {
                (e.currentTarget.firstChild as HTMLElement).style.color = 'rgba(255,255,255,0.9)'
              }}
            >
              <h3 style={{
                fontSize: '16px',
                fontWeight: 600,
                margin: 0,
                color: 'rgba(255,255,255,0.9)',
                transition: 'color 0.2s',
              }}>
                {faq.question}
              </h3>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.4)"
                strokeWidth="2"
                style={{
                  flexShrink: 0,
                  transition: 'transform 0.3s',
                  transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>

            {/* the answer is always in the page (search engines read it); shown when opened */}
            {(
              <motion.div
                hidden={openIndex !== index}
                initial={false}
                animate={{ opacity: openIndex === index ? 1 : 0 }}
                transition={{ duration: 0.3 }}
              >
                <p style={{
                  fontSize: '14px',
                  color: 'rgba(255,255,255,0.6)',
                  margin: '16px 0 0',
                  lineHeight: 1.6,
                }}>
                  {faq.answer}
                </p>
              </motion.div>
            )}
          </motion.div>
        ))}
      </section>

      {/* CTA Section */}
      <section style={{
        maxWidth: '600px',
        margin: '80px auto 0',
        padding: '60px 20px 0',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 style={{
            fontSize: '28px',
            fontWeight: 600,
            margin: '0 0 16px',
            color: '#ffffff',
          }}>
            {c.still}
          </h2>
          <p style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.6)',
            margin: '0 0 32px',
          }}>
            {c.reply}
          </p>
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap',
          }}>
            <Link href="/register" style={{
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
            }}>
              {c.start}
            </Link>
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{
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
            }}>
              {c.contact}
            </a>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
