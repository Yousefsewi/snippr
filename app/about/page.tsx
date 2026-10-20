'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Playfair_Display } from 'next/font/google'

const serif = Playfair_Display({ subsets: ['latin'], weight: ['700'], display: 'swap' })

export default function AboutPage() {
  return (
    <main style={{
      background: 'linear-gradient(to bottom, #0e1a0d 0%, #0b1509 50%, #050a04 78%, #000000 100%)',
      color: '#ffffff',
      minHeight: '100vh',
      paddingTop: '80px',
      paddingBottom: '80px',
    }}>

      {/* Hero */}
      <section style={{
        maxWidth: '800px',
        margin: '0 auto 80px',
        padding: '0 20px',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className={serif.className} style={{
            fontSize: 'clamp(40px, 6vw, 56px)',
            fontWeight: 700,
            margin: '0 0 20px',
            lineHeight: 1.2,
          }}>
            About Snippr
          </h1>
          <p style={{
            fontSize: '18px',
            color: 'rgba(255,255,255,0.7)',
            margin: 0,
            lineHeight: 1.6,
          }}>
            We’re simplifying barber booking, one appointment at a time.
          </p>
        </motion.div>
      </section>

      {/* Story */}
      <section style={{
        maxWidth: '700px',
        margin: '0 auto 80px',
        padding: '0 20px',
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 style={{
            fontSize: '28px',
            fontWeight: 600,
            margin: '0 0 24px',
            color: '#ffffff',
          }}>
            Our Story
          </h2>
          <div style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.65)',
            lineHeight: 1.8,
          }}>
            <p>
              Snippr was born from a simple observation: barbers spend more time managing appointments than actually cutting hair. Phone calls, WhatsApp messages, missed bookings — it’s chaos.
            </p>
            <p>
              We decided to build what we wished existed. A tool that’s simple enough for a solo barber to set up in 2 minutes, and honest about what it does.
            </p>
            <p>
              Snippr is new and growing. Every barber who joins now helps shape what we build next — tell us what you need and we’ll build it with you.
            </p>
          </div>
        </motion.div>
      </section>

      {/* Values */}
      <section style={{
        maxWidth: '1000px',
        margin: '0 auto 80px',
        padding: '0 20px',
      }}>
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            fontSize: '28px',
            fontWeight: 600,
            margin: '0 0 48px',
            color: '#ffffff',
          }}
        >
          Our Values
        </motion.h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '32px',
        }}>
          {[
            { icon: '⚡', title: 'Simplicity', desc: 'Tools should be simple. Complex software wastes barbers\' time.' },
            { icon: '🎯', title: 'Reliability', desc: 'Barbers depend on us. We never let them down.' },
            { icon: '🤝', title: 'Customer First', desc: 'Everything we build, we build for barbers, not for us.' },
            { icon: '🗣️', title: 'Built with you', desc: 'We listen to the barbers using Snippr and build what they actually ask for.' },
          ].map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '32px',
              }}
            >
              <div style={{
                fontSize: '40px',
                marginBottom: '16px',
              }}>
                {value.icon}
              </div>
              <h3 style={{
                fontSize: '18px',
                fontWeight: 600,
                margin: '0 0 12px',
                color: '#ffffff',
              }}>
                {value.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)',
                margin: 0,
                lineHeight: 1.6,
              }}>
                {value.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section style={{
        maxWidth: '1000px',
        margin: '0 auto 80px',
        padding: '60px 20px',
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '20px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '40px',
          textAlign: 'center',
        }}>
          {[
            { number: 'Free', label: 'To get started' },
            { number: '24/7', label: 'Online booking' },
            { number: '0%', label: 'Commission on your bookings' },
            { number: '2 min', label: 'Setup time' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div style={{
                fontSize: 'clamp(32px, 5vw, 48px)',
                fontWeight: 700,
                color: '#ffffff',
                margin: '0 0 8px',
              }}>
                {stat.number}
              </div>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.6)',
                margin: 0,
              }}>
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '60px 20px',
        textAlign: 'center',
        borderTop: '1px solid rgba(255,255,255,0.08)',
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
            Join the Snippr community
          </h2>
          <p style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.6)',
            margin: '0 0 32px',
          }}>
            Start accepting online bookings today. Free to try — no credit card required.
          </p>
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
        </motion.div>
      </section>
    </main>
  )
}
