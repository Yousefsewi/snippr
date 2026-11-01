'use client'

import { useState } from 'react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import { SITE_URL } from '@/lib/site-url'
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

// colourful wash behind each card: soft, blurred glows (like light through frosted glass)
// 01 sky blue + warm yellow · 02 mint, white and dusty rose on charcoal
// 03 hot pink, orange and deep blue · 04 electric blue, cyan, white and a touch of pink
const GRADIENTS = [
  'radial-gradient(55% 75% at 18% 92%, #2f8fe6 0%, transparent 70%), radial-gradient(50% 70% at 88% 35%, #f8d465 0%, transparent 72%), radial-gradient(45% 55% at 55% 62%, #ffffff 0%, transparent 70%), linear-gradient(160deg, #8fdcf0 0%, #5bb8ea 100%)',
  'radial-gradient(50% 65% at 32% 62%, #b9f3d8 0%, transparent 70%), radial-gradient(35% 45% at 66% 82%, #df9a98 0%, transparent 72%), radial-gradient(45% 55% at 58% 38%, #ffffff 0%, transparent 70%), linear-gradient(175deg, #dfe6e2 0%, #8b958f 55%, #22262a 100%)',
  'radial-gradient(45% 55% at 28% 70%, #ff4f8b 0%, transparent 72%), radial-gradient(45% 55% at 72% 55%, #ffb547 0%, transparent 72%), radial-gradient(60% 55% at 50% 100%, #2340ff 0%, transparent 75%), radial-gradient(35% 45% at 88% 88%, #22c8ff 0%, transparent 72%), linear-gradient(165deg, #f1f2f7 0%, #b8a8ff 100%)',
  'radial-gradient(55% 65% at 22% 88%, #1f4dff 0%, transparent 72%), radial-gradient(45% 55% at 78% 62%, #5fe3ff 0%, transparent 72%), radial-gradient(40% 50% at 50% 45%, #ffffff 0%, transparent 70%), radial-gradient(30% 40% at 92% 96%, #ff7ad6 0%, transparent 72%), linear-gradient(165deg, #e3ecff 0%, #6f8dff 100%)',
]
// step number colour per card (light on the dark one)
const NUM_COLOR = ['rgba(255,255,255,0.55)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0.55)', 'rgba(255,255,255,0.55)']

function Mock({ i, lng }: { i: number; lng: Lng }) {
  const tr = lng === 'tr'
  const card: React.CSSProperties = { background: '#fff', borderRadius: 18, padding: 16, boxShadow: '0 10px 30px rgba(15,23,42,0.12)', border: '1px solid rgba(255,255,255,0.9)' }
  // the shop's own avatar, like a barber would upload: initials on a warm colour
  const shopAvatar = (size: number) => (
    <span style={{ width: size, height: size, borderRadius: '50%', background: '#7c5a3a', color: '#f6ead9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-noto-serif), Georgia, serif', fontSize: size * 0.4, fontWeight: 600, flexShrink: 0, letterSpacing: '0.02em' }}>GS</span>
  )
  if (i === 0) return (
    <div style={card}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        {shopAvatar(36)}
        <div style={{ minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: '#0f172a' }}>Golden Scissors</p>
          <p style={{ margin: 0, fontSize: 11.5, color: '#64748b' }}>{tr ? 'Saç kesimi · 30 dk · €25' : 'Haircut · 30 min · €25'}</p>
        </div>
      </div>
      <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 600, color: '#64748b' }}>{tr ? 'Cumartesi, 1 Kasım' : 'Saturday, 1 November'}</p>
      <div style={{ display: 'flex', gap: 6 }}>
        {['10:00', '14:30', '16:00'].map(t => {
          const on = t === '14:30'
          return (
            <span key={t} style={{ flex: 1, textAlign: 'center', fontSize: 12, fontWeight: 600, padding: '8px 0', borderRadius: 10, border: `1px solid ${on ? '#111827' : '#e2e8f0'}`, background: on ? '#111827' : '#fff', color: on ? '#fff' : '#334155' }}>{t}</span>
          )
        })}
      </div>
    </div>
  )
  if (i === 1) return (
    // looks like a phone lock-screen notification from the Snippr app
    <div style={{ ...card, padding: '11px 14px 13px', background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icon-192.png" alt="" width={18} height={18} style={{ borderRadius: 5, display: 'block' }} />
        <span style={{ fontSize: 10.5, fontWeight: 600, letterSpacing: '0.06em', color: '#64748b' }}>SNIPPR</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: '#94a3b8' }}>{tr ? 'şimdi' : 'now'}</span>
      </div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{tr ? 'Yeni randevu' : 'New booking'}</p>
      <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#334155', lineHeight: 1.4 }}>{tr ? 'Ali, Cumartesi 14:30 için saç kesimi randevusu aldı.' : 'Ali booked a haircut for Saturday at 14:30.'}</p>
    </div>
  )
  if (i === 2) return (
    <div style={card}>
      <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{tr ? 'Randevun hazır, Ali!' : 'You’re booked, Ali!'}</p>
      {[[tr ? 'Tarih' : 'Date', tr ? 'Cumartesi, 1 Kasım' : 'Saturday, 1 November'], [tr ? 'Saat' : 'Time', '14:30'], [tr ? 'Hizmet' : 'Service', tr ? 'Saç kesimi · €25' : 'Haircut · €25']].map(([k, v]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, padding: '5px 0', borderTop: '1px solid #f1f5f9' }}>
          <span style={{ color: '#94a3b8' }}>{k}</span><span style={{ fontWeight: 600, color: '#0f172a' }}>{v}</span>
        </div>
      ))}
    </div>
  )
  return (
    // a real, scannable QR code (opens the Snippr homepage)
    <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{ padding: 6, borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff', flexShrink: 0, lineHeight: 0 }}>
        <QRCode value={SITE_URL} size={60} fgColor="#0f172a" />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {shopAvatar(22)}
          <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: '#0f172a' }}>Golden Scissors</p>
        </div>
        <p style={{ margin: '6px 0 0', fontSize: 12, color: '#475569' }}>{tr ? 'Kameranla tara, randevunu al' : 'Scan with your camera to book'}</p>
      </div>
    </div>
  )
}

export default function FeatureAccordion({ lng }: { lng: Lng }) {
  const c = COPY[lng]
  // the card under the mouse opens; when the mouse leaves, all cards close again
  const [active, setActive] = useState<number | null>(null)

  return (
    <section id="how" className="fa-section py-16 px-4" style={{ background: 'transparent' }}>
      <style>{`
        /* height follows the screen: shorter on laptops, never taller than before */
        .fa-row { display: flex; gap: 16px; height: clamp(430px, 60vh, 580px); }
        .fa-card { flex: 1 1 0; min-width: 0; transition: flex-grow .55s cubic-bezier(.22,1,.36,1), box-shadow .3s; }
        .fa-card.is-open { flex-grow: 1.75; }
        .fa-detail { opacity: 0; transform: translateY(10px); transition: opacity .35s ease .12s, transform .45s cubic-bezier(.22,1,.36,1) .12s; pointer-events: none; }
        .fa-card.is-open .fa-detail { opacity: 1; transform: none; pointer-events: auto; }
        .fa-wash { opacity: .8; transition: opacity .45s ease; }
        /* closed cards: big step number + the three step icons, so they never look empty */
        .fa-peek { opacity: 1; transition: opacity .3s ease; }
        .fa-card.is-open .fa-peek { opacity: 0; pointer-events: none; }
        .fa-card.is-open .fa-wash { opacity: 1; }
        @media (max-width: 900px) {
          .fa-row { flex-direction: column; height: auto; }
          .fa-card, .fa-card.is-open { flex: none; }
          .fa-detail { opacity: 1; transform: none; pointer-events: auto; }
          .fa-wash { opacity: 1; }
          .fa-peek { display: none; }
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

        <div className="fa-row" onMouseLeave={() => setActive(null)}>
          {c.cards.map((card, i) => {
            const open = active === i
            return (
              <div
                key={card.title}
                className={`fa-card ${open ? 'is-open' : ''}`}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                onClick={() => setActive(i)}
                tabIndex={0}
                style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, background: '#ffffff', cursor: 'pointer', outline: 'none',
                  boxShadow: open ? '0 24px 50px rgba(15,23,42,0.14)' : '0 4px 16px rgba(15,23,42,0.05)' }}
              >
                {/* colour wash at the bottom (pale when closed, vivid when open) */}
                <div className="fa-wash" aria-hidden style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '52%', background: GRADIENTS[i],
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, #000 45%)', maskImage: 'linear-gradient(to bottom, transparent 0%, #000 45%)' }} />

                {/* peek for closed cards */}
                <div className="fa-peek" aria-hidden style={{ position: 'absolute', left: 28, right: 20, bottom: 26, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 14 }}>
                  <span style={{ fontSize: 'clamp(52px, 5vw, 80px)', fontWeight: 700, lineHeight: 0.8, letterSpacing: '-0.05em', color: NUM_COLOR[i], textShadow: '0 2px 18px rgba(0,0,0,0.08)' }}>0{i + 1}</span>
                  <span style={{ display: 'flex', gap: 6 }}>
                    {ICONS[i].map((Icon, k) => (
                      <span key={k} style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(255,255,255,0.8)', border: '1px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 12px rgba(15,23,42,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a' }}><Icon size={15} /></span>
                    ))}
                  </span>
                </div>

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
