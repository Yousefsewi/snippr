'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MousePointerClick, Bell, Mail, TrendingUp, Check, CalendarDays, Gift, QrCode, MapPin, Sparkles } from 'lucide-react'

// "How Snippr works" — four cards in a row; the one under the mouse (or tapped) expands
// and reveals its steps and a small UI mock on a colourful gradient. On phones the cards
// stack and every card shows its content.

type Lng = 'en' | 'tr'

const COPY: Record<Lng, {
  eyebrow: string; title: string; body: string; cta: string
  cards: { title: string; desc: string; steps: [string, string, string] }[]
}> = {
  en: {
    eyebrow: 'HOW SNIPPR WORKS',
    title: 'Built for barbers whose day runs on bookings',
    body: 'Cutting hair moves you forward, but the messages around it slow you down. Snippr handles everything before and after the appointment, so your hands stay on the clippers.',
    cta: 'Start for free',
    cards: [
      { title: 'Book', desc: 'A customer taps your link from Instagram or WhatsApp and picks a free time — no app, no account, no calls.',
        steps: ['Taps the link in your bio', 'Picks Saturday at 14:30', 'Gets a confirmation right away'] },
      { title: 'Notify', desc: 'Never miss a booking while you’re cutting.',
        steps: ['Instant notification on your phone', 'Shows up live in your calendar', 'Confirm or cancel in one tap'] },
      { title: 'Confirm', desc: 'Customers know exactly when to come.',
        steps: ['Confirmation email with date & time', 'Service and price included', 'Your address opens in Maps'] },
      { title: 'Grow', desc: 'Turn first-timers into regulars.',
        steps: ['Your own page with your colours', 'QR code for your shop window', 'Every booking in one dashboard'] },
    ],
  },
  tr: {
    eyebrow: 'SNIPPR NASIL ÇALIŞIR',
    title: 'Günü randevularla dönen berberler için',
    body: 'Saç kesmek seni ilerletir, etrafındaki mesajlaşma ise yavaşlatır. Snippr randevudan önce ve sonra olan her şeyi halleder, ellerin makinede kalsın.',
    cta: 'Ücretsiz başla',
    cards: [
      { title: 'Randevu', desc: 'Müşteri Instagram veya WhatsApp’taki linkine dokunur ve boş bir saat seçer — uygulama yok, hesap yok, telefon yok.',
        steps: ['Bio’ndaki linke dokunur', 'Cumartesi 14:30’u seçer', 'Hemen onay alır'] },
      { title: 'Bildirim', desc: 'Tıraş yaparken hiçbir randevuyu kaçırma.',
        steps: ['Telefonuna anında bildirim', 'Takviminde canlı görünür', 'Tek dokunuşla onayla veya iptal et'] },
      { title: 'Onay', desc: 'Müşteri ne zaman geleceğini tam bilir.',
        steps: ['Tarih ve saatli onay maili', 'İndirim dahil fiyat', 'Adresin Haritalar’da açılır'] },
      { title: 'Büyü', desc: 'İlk kez gelenleri müdavime çevir.',
        steps: ['Kendi renklerinle kendi sayfan', 'Dükkân camın için QR kod', 'Tüm randevular tek panelde'] },
    ],
  },
}

const ICONS = [
  [MousePointerClick, CalendarDays, Gift],
  [Bell, CalendarDays, Check],
  [Mail, Sparkles, MapPin],
  [Gift, QrCode, TrendingUp],
]
const ICON_TINT = ['#d9f99d', '#bfdbfe', '#99f6e4']

// colourful wash behind the open card's mock, and the pale one for closed cards
const GRADIENTS = [
  'linear-gradient(120deg, #60a5fa 0%, #5eead4 50%, #d9f99d 100%)',
  'linear-gradient(120deg, #fda4af 0%, #fdba74 55%, #fde68a 100%)',
  'linear-gradient(120deg, #a5b4fc 0%, #c4b5fd 50%, #93c5fd 100%)',
  'linear-gradient(120deg, #6ee7b7 0%, #67e8f9 55%, #bae6fd 100%)',
]

function Mock({ i, lng }: { i: number; lng: Lng }) {
  const card: React.CSSProperties = { background: '#fff', borderRadius: 18, padding: 16, boxShadow: '0 10px 30px rgba(15,23,42,0.12)', border: '1px solid rgba(255,255,255,0.9)' }
  if (i === 0) return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <span style={{ width: 34, height: 34, borderRadius: 10, background: '#111827', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>✦</span>
        <div><p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Golden Scissors</p><p style={{ margin: 0, fontSize: 11.5, color: '#64748b' }}>{lng === 'tr' ? 'Saç kesimi · 30 dk' : 'Haircut · 30 min'}</p></div>
      </div>
      <div style={{ display: 'flex', gap: 6, background: '#f1f5f9', borderRadius: 12, padding: 8 }}>
        {['10:00', '14:30', '16:00'].map(t => (
          <span key={t} style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600, padding: '7px 0', borderRadius: 8, background: t === '14:30' ? '#111827' : '#dbeafe', color: t === '14:30' ? '#fff' : '#1e3a8a' }}>{t}</span>
        ))}
      </div>
    </div>
  )
  if (i === 1) return (
    <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ width: 38, height: 38, borderRadius: 11, background: '#111827', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>✦</span>
      <div style={{ minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{lng === 'tr' ? 'Yeni randevu 🎉' : 'New booking 🎉'}</p>
        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#475569' }}>{lng === 'tr' ? 'Ali — Cumartesi 14:30, saç kesimi' : 'Ali — Saturday 14:30, haircut'}</p>
      </div>
      <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{lng === 'tr' ? 'şimdi' : 'now'}</span>
    </div>
  )
  if (i === 2) return (
    <div style={card}>
      <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{lng === 'tr' ? 'Randevun hazır, Ali!' : 'You’re booked, Ali!'}</p>
      {[[lng === 'tr' ? 'Tarih' : 'Date', lng === 'tr' ? 'Cumartesi, 1 Kasım' : 'Saturday, 1 November'], [lng === 'tr' ? 'Saat' : 'Time', '14:30'], [lng === 'tr' ? 'Hizmet' : 'Service', lng === 'tr' ? 'Saç kesimi · €25' : 'Haircut · €25']].map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ color: '#94a3b8' }}>{k}</span><span style={{ fontWeight: 600, color: k.includes('First') || k.includes('İlk') ? '#be185d' : '#0f172a' }}>{v}</span>
        </div>
      ))}
    </div>
  )
  return (
    <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
      {/* simple QR-like grid */}
      <div style={{ width: 64, height: 64, borderRadius: 10, background: '#fff', border: '1px solid #e2e8f0', padding: 6, display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 2, flexShrink: 0 }}>
        {Array.from({ length: 25 }).map((_, k) => <span key={k} style={{ borderRadius: 2, background: [0, 1, 3, 4, 5, 9, 12, 15, 19, 20, 21, 23, 24, 7, 17].includes(k) ? '#0f172a' : 'transparent' }} />)}
      </div>
      <div>
        <span style={{ display: 'inline-block', fontSize: 12, fontWeight: 700, color: '#9d174d', background: '#fce7f3', borderRadius: 999, padding: '3px 10px' }}>✦ {lng === 'tr' ? 'Golden Scissors' : 'Golden Scissors'}</span>
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#475569' }}>{lng === 'tr' ? 'Tara ve randevu al' : 'Scan to book'}</p>
      </div>
    </div>
  )
}

export default function FeatureAccordion({ lng }: { lng: Lng }) {
  const c = COPY[lng]
  const [active, setActive] = useState(0)

  return (
    <section id="how" className="fa-section py-16 px-4" style={{ background: 'transparent' }}>
      <style>{`
        .fa-row { display: flex; gap: 16px; height: 580px; }
        .fa-card { flex: 1 1 0; min-width: 0; transition: flex-grow .55s cubic-bezier(.22,1,.36,1), box-shadow .3s; }
        .fa-card.is-open { flex-grow: 1.75; }
        .fa-detail { opacity: 0; transform: translateY(10px); transition: opacity .35s ease .12s, transform .45s cubic-bezier(.22,1,.36,1) .12s; pointer-events: none; }
        .fa-card.is-open .fa-detail { opacity: 1; transform: none; pointer-events: auto; }
        .fa-wash { opacity: .28; transition: opacity .45s ease; }
        .fa-card.is-open .fa-wash { opacity: 1; }
        @media (max-width: 900px) {
          .fa-row { flex-direction: column; height: auto; }
          .fa-card, .fa-card.is-open { flex: none; }
          .fa-detail { opacity: 1; transform: none; pointer-events: auto; }
          .fa-wash { opacity: 1; }
        }
      `}</style>

      <div className="glass-card mx-auto w-full max-w-[1680px] rounded-[40px] px-5 py-14 md:px-12 md:py-20">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <p className="mb-4 text-[12px] font-bold tracking-[0.14em]" style={{ color: '#1d1d1f' }}>{c.eyebrow}</p>
          <h2 style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.035em', color: '#0f172a', margin: 0 }}>{c.title}</h2>
          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-relaxed md:text-[17px]">{c.body}</p>
          <Link href="/register" className="mt-8 inline-flex items-center rounded-xl px-6 py-3.5 text-[15px] font-semibold text-white transition-all hover:opacity-90" style={{ background: '#0f172a', boxShadow: '0 8px 20px rgba(15,23,42,0.2)' }}>
            {c.cta}
          </Link>
        </div>

        <div className="fa-row">
          {c.cards.map((card, i) => {
            const open = active === i
            return (
              <div
                key={card.title}
                className={`fa-card ${open ? 'is-open' : ''}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                tabIndex={0}
                style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, background: '#ffffff', cursor: 'pointer', outline: 'none',
                  boxShadow: open ? '0 24px 50px rgba(15,23,42,0.14)' : '0 4px 16px rgba(15,23,42,0.05)' }}
              >
                {/* colour wash at the bottom (pale when closed, vivid when open) */}
                <div className="fa-wash" aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '52%', background: GRADIENTS[i],
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 45%)', maskImage: 'linear-gradient(to bottom, transparent 0%, #000 45%)' }} />

                <div style={{ position: 'relative', padding: '30px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: '#0f172a', margin: 0 }}>{card.title}</h3>
                  <p style={{ fontSize: 14, lineHeight: 1.55, margin: '10px 0 0', maxWidth: 340 }}>{card.desc}</p>

                  <div className="fa-detail" style={{ marginTop: 18, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {card.steps.map((s, k) => {
                        const Icon = ICONS[i][k]
                        return (
                          <li key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#334155' }}>
                            <span style={{ width: 22, height: 22, borderRadius: 7, background: ICON_TINT[k], display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#0f172a' }}><Icon size={13} /></span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s}</span>
                          </li>
                        )
                      })}
                    </ul>
                    <div style={{ marginTop: 'auto', paddingTop: 24 }}>
                      <div style={{ borderRadius: 24, padding: 10, background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.7)' }}>
                        <Mock i={i} lng={lng} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
