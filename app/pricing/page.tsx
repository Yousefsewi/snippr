'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Playfair_Display } from 'next/font/google'

const serif = Playfair_Display({ subsets: ['latin'], weight: ['700'], display: 'swap' })

// Kept in line with the dashboard's Plans page (app/dashboard/plans/page.tsx):
// only Free exists today; paid plans are shown as "coming soon" with planned features.
const plans: { name: string; price: string; period: string; desc: string; features: string[]; cta: string; href: string | null; highlighted: boolean }[] = [
  {
    name: 'Free',
    price: 'Free',
    period: 'available now — no credit card',
    desc: 'Everything Snippr does today',
    features: [
      'Your own booking page & link',
      'QR code for your shop',
      'Live calendar',
      'Booking confirmation emails',
      'New-booking notifications',
      'Email support',
    ],
    cta: 'Get started',
    href: '/register',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '$6',
    period: 'per month · coming soon',
    desc: 'Planned for growing barbers',
    features: [
      'Everything in Free, plus:',
      'First-visit discount for new customers',
      'Automatic reminders',
      'Online deposits',
      'Analytics & revenue',
      'Custom branding',
      'Priority support',
    ],
    cta: 'Coming soon',
    href: null,
    highlighted: false,
  },
  {
    name: 'Business',
    price: '$15',
    period: 'per month · coming soon',
    desc: 'Planned for shops & teams',
    features: [
      'Everything in Pro, plus:',
      'Multiple staff members',
      'Team calendar',
      'Advanced reports',
    ],
    cta: 'Coming soon',
    href: null,
    highlighted: false,
  },
]

export default function PricingPage() {
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
        maxWidth: '700px',
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
          Simple, transparent pricing
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: '16px',
            color: 'rgba(255,255,255,0.6)',
            margin: 0,
            lineHeight: 1.6,
          }}
        >
          Everything Snippr does today is free. Paid plans with extra features are coming — no hidden fees, no surprises, and you keep all your data.
        </motion.p>
      </section>

      {/* Pricing Cards */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
        }}>
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              style={{
                background: plan.highlighted
                  ? 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.08) 100%)'
                  : 'rgba(255,255,255,0.06)',
                border: plan.highlighted
                  ? '1.5px solid rgba(255,255,255,0.3)'
                  : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '40px 32px',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                transform: plan.highlighted ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {plan.highlighted && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  background: '#ffffff',
                  color: '#000000',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}>
                  Available now
                </div>
              )}

              <h3 style={{
                fontSize: '22px',
                fontWeight: 600,
                margin: '0 0 8px',
                color: '#ffffff',
              }}>
                {plan.name}
              </h3>
              <p style={{
                fontSize: '14px',
                color: 'rgba(255,255,255,0.5)',
                margin: '0 0 24px',
                minHeight: '40px',
              }}>
                {plan.desc}
              </p>

              <div style={{ marginBottom: '32px' }}>
                <div style={{
                  fontSize: '40px',
                  fontWeight: 700,
                  color: '#ffffff',
                  margin: 0,
                }}>
                  {plan.price}
                </div>
                <p style={{
                  fontSize: '13px',
                  color: 'rgba(255,255,255,0.5)',
                  margin: '4px 0 0',
                }}>
                  {plan.period}
                </p>
              </div>

              {plan.href ? (
              <Link href={plan.href} style={{
                display: 'block', textAlign: 'center', textDecoration: 'none',
                background: '#ffffff',
                color: '#000000',
                borderRadius: '10px',
                padding: '12px 24px',
                fontWeight: 600,
                fontSize: '14px',
                marginBottom: '32px',
              }}>
                {plan.cta}
              </Link>
              ) : (
              <button disabled style={{
                cursor: 'not-allowed', opacity: 0.6,
                background: plan.highlighted ? '#ffffff' : 'rgba(255,255,255,0.12)',
                border: plan.highlighted ? 'none' : '1px solid rgba(255,255,255,0.2)',
                color: plan.highlighted ? '#000000' : '#ffffff',
                borderRadius: '10px',
                padding: '12px 24px',
                fontWeight: 600,
                fontSize: '14px',
                marginBottom: '32px',
              }}>
                {plan.cta}
              </button>
              )}

              <div style={{ flex: 1 }}>
                <ul style={{
                  listStyle: 'none',
                  padding: 0,
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  {plan.features.map((feature, j) => (
                    <li
                      key={j}
                      style={{
                        fontSize: '14px',
                        color: 'rgba(255,255,255,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                      }}
                    >
                      <span style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: '#ffffff',
                        flexShrink: 0,
                      }}>
                        ✓
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{
        maxWidth: '700px',
        margin: '80px auto 0',
        padding: '80px 20px 0',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        textAlign: 'center',
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h2 style={{
            fontSize: '28px',
            fontWeight: 600,
            margin: '0 0 16px',
            color: '#ffffff',
          }}>
            Frequently asked questions
          </h2>
          <p style={{
            fontSize: '15px',
            color: 'rgba(255,255,255,0.6)',
            margin: '0 0 32px',
          }}>
            Can’t find the answer you’re looking for? Check out our full FAQ.
          </p>
          <Link href="/faq" style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px 24px',
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: '#ffffff',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '14px',
            transition: 'all 0.2s',
          }}>
            View all FAQs
          </Link>
        </motion.div>
      </section>
    </main>
  )
}
