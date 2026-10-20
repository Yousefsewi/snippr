'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { SUPPORT_EMAIL } from '@/lib/site'
import { Playfair_Display } from 'next/font/google'

const serif = Playfair_Display({ subsets: ['latin'], weight: ['700'], display: 'swap' })

const faqs = [
  {
    question: 'How do I create a booking link?',
    answer: 'Sign up for a Snippr account, add your services and availability, and you\'ll get a unique booking link. Share it on Instagram or WhatsApp, or print its QR code for your shop.',
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No setup fees. Everything available today is free — you can start accepting bookings right away, no credit card required.',
  },
  {
    question: 'How do customers book appointments?',
    answer: 'Customers simply visit your booking link, select a service and time that works for them, and confirm. If they leave their email they get a confirmation right away; reminders before the appointment are coming soon.',
  },
  {
    question: 'Can I manage multiple barbers?',
    answer: 'Not yet — today each account is one barber with one calendar. Team calendars are on our roadmap.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'Currently, payments are handled directly between you and your customers. Snippr is a booking tool, not a payment processor.',
  },
  {
    question: 'Do you have a mobile app?',
    answer: 'Not yet in the app stores. Snippr works fully in your phone\x27s browser today — you can add it to your home screen. Native iOS and Android apps are in the works.',
  },
  {
    question: 'Do customers get a confirmation?',
    answer: 'Yes — if a customer leaves their email, they get a confirmation with the date, time and price right after booking, and you get a notification. Automatic reminders are coming soon.',
  },
  {
    question: 'Can I set my opening hours?',
    answer: 'Yes — set your hours for each day of the week and switch off the days you are closed. Customers can only book when you are open.',
  },
]

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

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
          Frequently Asked Questions
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
          Everything you need to know about Snippr barber booking.
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

            {openIndex === index && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
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
            Still have questions?
          </h2>
          <p style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.6)',
            margin: '0 0 32px',
          }}>
            Email us — we usually reply within a day.
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
              Get started
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
              Contact support
            </a>
          </div>
        </motion.div>
      </section>
    </main>
  )
}
