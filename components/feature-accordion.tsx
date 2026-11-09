'use client'

import { useState } from 'react'
import Link from 'next/link'
import QRCode from 'react-qr-code'
import { SITE_URL } from '@/lib/site-url'
import { MousePointerClick, Bell, Mail, TrendingUp, Check, CalendarDays, Gift, QrCode, MapPin, Sparkles } from 'lucide-react'

// "How Snippr works" — four cards in a row; the one under the mouse (or tapped) expands
// and reveals its steps and a small UI mock on a colourful gradient. On phones the cards
// stack and every card shows its content.

import type { SiteLng as Lng } from '@/lib/site-lang'

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
  nl: {
    eyebrow: 'ZO WERKT SNIPPR',
    title: 'Gemaakt voor kappers wier dag draait om afspraken',
    body: 'Knippen brengt je verder, maar de berichten eromheen houden je op. Snippr regelt alles voor en na de afspraak, zodat je handen aan de tondeuse blijven.',
    cta: 'Gratis starten',
    cards: [
      { title: 'Boeken', desc: 'Een klant tikt op je link in Instagram of WhatsApp en kiest een vrij tijdstip. Geen app, geen account, geen telefoontjes.',
        steps: ['Tikt op de link in je bio', 'Kiest zaterdag 14:30', 'Krijgt meteen een bevestiging'] },
      { title: 'Melding', desc: 'Mis nooit een afspraak terwijl je aan het knippen bent.',
        steps: ['Direct een melding op je telefoon', 'Verschijnt live in je agenda', 'Bevestigen of annuleren met één tik'] },
      { title: 'Bevestiging', desc: 'Klanten weten precies wanneer ze moeten komen.',
        steps: ['Bevestigingsmail met datum en tijd', 'Behandeling en prijs erbij', 'Je adres opent in Maps'] },
      { title: 'Groeien', desc: 'Maak van nieuwe klanten vaste klanten.',
        steps: ['Je eigen pagina in je eigen kleuren', 'QR-code voor je etalage', 'Alle afspraken in één dashboard'] },
    ],
  },
  de: {
    eyebrow: 'SO FUNKTIONIERT SNIPPR',
    title: 'Gemacht für Barbiere, deren Tag von Terminen lebt',
    body: 'Haare schneiden bringt dich weiter, die Nachrichten drumherum bremsen dich. Snippr erledigt alles vor und nach dem Termin, damit deine Hände an der Maschine bleiben.',
    cta: 'Kostenlos starten',
    cards: [
      { title: 'Buchen', desc: 'Ein Kunde tippt auf deinen Link in Instagram oder WhatsApp und wählt eine freie Zeit. Keine App, kein Konto, keine Anrufe.',
        steps: ['Tippt auf den Link in deiner Bio', 'Wählt Samstag 14:30', 'Bekommt sofort eine Bestätigung'] },
      { title: 'Benachrichtigen', desc: 'Verpasse keinen Termin, während du schneidest.',
        steps: ['Sofortige Benachrichtigung aufs Handy', 'Erscheint live in deinem Kalender', 'Mit einem Tipp bestätigen oder absagen'] },
      { title: 'Bestätigen', desc: 'Kunden wissen genau, wann sie kommen sollen.',
        steps: ['Bestätigungsmail mit Datum und Uhrzeit', 'Leistung und Preis inklusive', 'Deine Adresse öffnet sich in Maps'] },
      { title: 'Wachsen', desc: 'Mach aus Erstkunden Stammkunden.',
        steps: ['Deine eigene Seite in deinen Farben', 'QR-Code fürs Schaufenster', 'Alle Termine in einem Dashboard'] },
    ],
  },
  ar: {
    eyebrow: 'كيف يعمل Snippr',
    title: 'مصمَّم للحلاقين الذين يعتمد يومهم على المواعيد',
    body: 'قص الشعر يدفعك للأمام، لكن الرسائل من حوله تبطئك. يتولى Snippr كل ما قبل الموعد وبعده، لتبقى يداك على ماكينة الحلاقة.',
    cta: 'ابدأ مجانًا',
    cards: [
      { title: 'الحجز', desc: 'يضغط العميل على رابطك في إنستغرام أو واتساب ويختار وقتًا متاحًا، بدون تطبيق أو حساب أو مكالمات.',
        steps: ['يضغط على الرابط في البايو', 'يختار السبت 14:30', 'يحصل على تأكيد فورًا'] },
      { title: 'الإشعار', desc: 'لا تفوّت أي حجز وأنت تعمل.',
        steps: ['إشعار فوري على هاتفك', 'يظهر مباشرة في تقويمك', 'أكّد أو ألغِ بلمسة واحدة'] },
      { title: 'التأكيد', desc: 'يعرف العميل بالضبط متى يأتي.',
        steps: ['بريد تأكيد بالتاريخ والوقت', 'الخدمة والسعر مذكوران', 'عنوانك يفتح في الخرائط'] },
      { title: 'النمو', desc: 'حوّل الزبائن الجدد إلى زبائن دائمين.',
        steps: ['صفحتك الخاصة بألوانك', 'رمز QR لواجهة محلك', 'كل الحجوزات في لوحة واحدة'] },
    ],
  },
}

const ICONS = [
  [MousePointerClick, CalendarDays, Gift],
  [Bell, CalendarDays, Check],
  [Mail, Sparkles, MapPin],
  [Gift, QrCode, TrendingUp],
]



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
        <img src="/logo.svg" alt="Snippr" style={{ height: 13, width: 'auto', display: 'block' }} />
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

// small example pictures inside the open card; off to keep the cards light and short
const SHOW_MOCKS = false

// Grainy colour-glow backgrounds for the four cards, drawn in CSS (no image files).
// 01 dark teal with an orange glow · 02 a tall orange light column in the middle of dark teal
// 03 dark teal with a glowing orange arc · 04 dark teal with a warm orange rise
const CARD_BG = [
  'radial-gradient(60% 45% at 50% 100%, #ff9a2e 0%, rgba(255,154,46,0.55) 35%, rgba(255,154,46,0) 75%), radial-gradient(70% 60% at 50% 55%, #2f6b6b 0%, rgba(47,107,107,0) 75%), linear-gradient(180deg, #0f1c20 0%, #13262a 100%)',
  'radial-gradient(22% 46% at 50% 55%, #ffa233 0%, rgba(255,162,51,0.85) 35%, rgba(255,162,51,0) 100%), radial-gradient(42% 70% at 50% 55%, rgba(54,120,118,0.95) 0%, rgba(54,120,118,0) 100%), linear-gradient(90deg, #08151a 0%, #0f2227 50%, #08151a 100%)',
  'radial-gradient(120% 75% at 110% 110%, #ff8c3a 0%, #f2581f 18%, #7a1414 30%, rgba(20,16,20,0) 42%), radial-gradient(60% 40% at 30% 5%, rgba(32,92,96,0.8) 0%, rgba(32,92,96,0) 75%), linear-gradient(180deg, #102024 0%, #151a1f 100%)',
  'radial-gradient(80% 45% at 30% 105%, #ffb15c 0%, rgba(255,140,58,0.65) 30%, rgba(255,140,58,0) 70%), radial-gradient(45% 30% at 85% 80%, rgba(242,88,31,0.7) 0%, rgba(242,88,31,0) 75%), radial-gradient(70% 50% at 60% 25%, rgba(40,100,104,0.8) 0%, rgba(40,100,104,0) 75%), linear-gradient(180deg, #0d181c 0%, #131f24 100%)',
]
// text colour on each card
const CARD_INK = ['#ffffff', '#ffffff', '#ffffff', '#ffffff']
// fine film grain over the colours (SVG noise)
const GRAIN = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.15' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3CfeComponentTransfer%3E%3CfeFuncR type='linear' slope='2.2' intercept='-0.6'/%3E%3CfeFuncG type='linear' slope='2.2' intercept='-0.6'/%3E%3CfeFuncB type='linear' slope='2.2' intercept='-0.6'/%3E%3C/feComponentTransfer%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"

export default function FeatureAccordion({ lng }: { lng: Lng }) {
  const c = COPY[lng]
  // the card under the mouse opens; when the mouse leaves, all cards close again
  const [active, setActive] = useState<number | null>(null)

  return (
    <section id="how" className="fa-section py-16 px-4" style={{ background: 'transparent' }}>
      <style>{`
        /* height follows the screen: shorter on laptops, never taller than before */
        .fa-row { display: flex; gap: 16px; height: clamp(300px, 38vh, 340px); }
        .fa-card { flex: 1 1 0; min-width: 0; transition: flex-grow .55s cubic-bezier(.22,1,.36,1), box-shadow .3s; }
        .fa-card.is-open { flex-grow: 1.75; }
        .fa-detail { opacity: 0; transform: translateY(10px); transition: opacity .35s ease .12s, transform .45s cubic-bezier(.22,1,.36,1) .12s; pointer-events: none; }
        .fa-card.is-open .fa-detail { opacity: 1; transform: none; pointer-events: auto; }
        /* closed cards: the three step icons at the bottom */
        .fa-peek { opacity: 1; transition: opacity .3s ease; }
        .fa-card.is-open .fa-peek { opacity: 0; pointer-events: none; }
        @media (max-width: 900px) {
          .fa-row { flex-direction: column; height: auto; }
          .fa-card, .fa-card.is-open { flex: none; min-height: 220px; }
          .fa-detail { opacity: 1; transform: none; pointer-events: auto; }
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
                style={{ position: 'relative', overflow: 'hidden', borderRadius: 28, background: CARD_BG[i], color: CARD_INK[i], cursor: 'pointer', outline: 'none',
                  boxShadow: open ? '0 24px 50px rgba(15,23,42,0.14)' : '0 4px 16px rgba(15,23,42,0.05)' }}
              >
                <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundSize: '140px 140px', mixBlendMode: 'overlay', opacity: 0.9, pointerEvents: 'none' }} />
                <div aria-hidden style={{ position: 'absolute', inset: 0, backgroundImage: GRAIN, backgroundSize: '140px 140px', mixBlendMode: 'soft-light', opacity: 0.6, pointerEvents: 'none' }} />
                {CARD_INK[i] === '#ffffff' && <div aria-hidden style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.28) 0%, rgba(0,0,0,0) 45%)', pointerEvents: 'none' }} />}

                {/* peek for closed cards */}
                <div className="fa-peek" aria-hidden style={{ position: 'absolute', left: 28, right: 20, bottom: 26, display: 'flex' }}>
                  <span style={{ display: 'flex', gap: 6 }}>
                    {ICONS[i].map((Icon, k) => (
                      <span key={k} style={{ width: 34, height: 34, borderRadius: 11, background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: CARD_INK[i] }}><Icon size={15} strokeWidth={1.75} /></span>
                    ))}
                  </span>
                </div>

                <div style={{ position: 'relative', padding: '30px 28px', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <div role="heading" aria-level={3} style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em', color: CARD_INK[i], margin: 0 }}>{card.title}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.55, margin: '10px 0 0', maxWidth: 340, color: CARD_INK[i], opacity: 0.85 }}>{card.desc}</div>

                  <div className="fa-detail" style={{ marginTop: 18, display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {card.steps.map((s, k) => {
                        const Icon = ICONS[i][k]
                        return (
                          <li key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: CARD_INK[i] }}>
                            <span style={{ width: 22, height: 22, borderRadius: 7, background: 'rgba(255,255,255,0.22)', border: '1px solid rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: CARD_INK[i] }}><Icon size={13} strokeWidth={1.75} /></span>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s}</span>
                          </li>
                        )
                      })}
                    </ul>
                    {SHOW_MOCKS && (
                    <div style={{ marginTop: 'auto', paddingTop: 24 }}>
                      <div style={{ borderRadius: 24, padding: 10, background: '#f5f5f4', border: '1px solid #ececea' }}>
                        <Mock i={i} lng={lng} />
                      </div>
                    </div>
                    )}
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
