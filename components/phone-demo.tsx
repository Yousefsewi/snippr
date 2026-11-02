'use client'

// iPhone on the homepage feature section. It shows the real Snippr booking page
// (components/booking-screen.tsx); the older cartoon walkthrough (from snippr-demo/index.html)
// is kept behind SHOW_BOOKING_PAGE. Original note: interactive demo, used in the
// homepage feature section. A visitor can tap through it: welcome → service → date & time →
// name → booked. Sample shop "Golden Scissors"; nothing is sent anywhere.
// Buttons carry the class "pd-btn" so the homepage's glass button styles leave them alone,
// and text uses div/span (the homepage colours every <p> in a section).

import { useEffect, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { Nunito } from 'next/font/google'
import BookingScreen from '@/components/booking-screen'

const nunito = Nunito({ subsets: ['latin', 'latin-ext'], weight: ['600', '700', '800', '900'], display: 'swap' })

type Lng = 'en' | 'tr'
const BRAND = '#7D8F4E', BRAND2 = '#56663A'
// true: the phone shows the real Snippr booking page · false: the cartoon booking walkthrough
const SHOW_BOOKING_PAGE = true

const T = {
  tr: {
    skip: 'GEÇ', welcome: 'Golden Scissors’a hoş geldin', big: '20 sn', bigSub: 'randevu almak bu kadar kolay',
    start: 'BAŞLAYALIM', pick: 'Ne yaptıralım?', min: 'dk',
    services: [['Saç kesimi', 30, 25, '✂️'], ['Saç + Sakal', 45, 35, '🧔'], ['Sakal düzeltme', 20, 15, '🪒'], ['Çocuk tıraşı', 25, 18, '🧒']] as [string, number, number, string][],
    when: 'Ne zaman?', days: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'], today: 'Bugün', taken: 'dolu',
    who: 'Son bir şey', name: 'Adın ne?', namePh: 'Adını yaz', book: 'RANDEVU AL', next: 'DEVAM',
    done: 'Tamamdır!', mail: 'Onay e-postası yolda', again: 'BAŞTAN DENE', own: 'BANA DA BÖYLE SAYFA',
    hello: (n: string) => `Görüşürüz ${n}!`, locale: 'tr-TR',
  },
  en: {
    skip: 'SKIP', welcome: 'Welcome to Golden Scissors', big: '20 sec', bigSub: 'that’s all it takes to book',
    start: 'LET’S GO', pick: 'What are we doing?', min: 'min',
    services: [['Haircut', 30, 25, '✂️'], ['Hair + Beard', 45, 35, '🧔'], ['Beard trim', 20, 15, '🪒'], ['Kids cut', 25, 18, '🧒']] as [string, number, number, string][],
    when: 'When?', days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], today: 'Today', taken: 'taken',
    who: 'One last thing', name: 'What’s your name?', namePh: 'Type your name', book: 'BOOK IT', next: 'NEXT',
    done: 'You’re in!', mail: 'Confirmation email on its way', again: 'TRY AGAIN', own: 'GET A PAGE LIKE THIS',
    hello: (n: string) => `See you, ${n}!`, locale: 'en-GB',
  },
}
const TIMES = ['10:00', '10:30', '11:00', '11:30', '13:00', '13:30', '14:00', '14:30', '15:00', '16:00', '16:30', '17:00']
const TAKEN = new Set(['10:30', '13:00', '15:00', '16:30'])

// fixed "random" values so every visit (and the server render) looks the same
const rand = (i: number) => { const x = Math.sin(i * 9301 + 49297) * 233280; return x - Math.floor(x) }
// whole numbers, so the server and the browser write exactly the same styles
const BUBBLES = Array.from({ length: 10 }, (_, i) => ({ x: Math.round(rand(i) * 330), y: Math.round(100 + rand(i + 20) * 600), s: Math.round(3 + rand(i + 40) * 5), d: Math.round(rand(i + 60) * 40) / 10 }))
const CONFETTI = Array.from({ length: 28 }, (_, i) => ({ x: Math.round(40 + rand(i + 80) * 260), r: Math.round(rand(i + 120) * 360), up: Math.round(180 + rand(i + 160) * 80), dx: Math.round((rand(i + 200) - 0.5) * 120), c: ['#fff', '#FFE08A', '#7FE3D0', '#FFC1D9'][i % 4], d: rand(i + 240) * 0.4 }))

/* ---------- barber mascot ---------- */
function Mascot({ happy, size = 150 }: { happy?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" fill="none" aria-hidden>
      <path d="M38 150c2-26 18-42 42-42s40 16 42 42z" fill="#fff" stroke="#4A2A1A" strokeWidth="4" strokeLinejoin="round" />
      <path d="M62 112l18 16 18-16" stroke="#4A2A1A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M50 128c6 3 12 3 18 0M92 128c6 3 12 3 18 0" stroke="#9DB06A" strokeWidth="4" strokeLinecap="round" />
      <circle cx="36" cy="72" r="10" fill="#F7C49A" stroke="#4A2A1A" strokeWidth="4" />
      <circle cx="124" cy="72" r="10" fill="#F7C49A" stroke="#4A2A1A" strokeWidth="4" />
      <ellipse cx="80" cy="70" rx="44" ry="42" fill="#F7C49A" stroke="#4A2A1A" strokeWidth="4" />
      <path d="M38 62c0-26 18-38 42-38 20 0 34 8 40 24-10-6-22-6-30 0-6-10-20-14-30-8-8 4-14 12-22 22z" fill="#6B3E26" stroke="#4A2A1A" strokeWidth="4" strokeLinejoin="round" />
      {happy
        ? <><path d="M58 70q6-8 12 0" stroke="#4A2A1A" strokeWidth="4" strokeLinecap="round" /><path d="M90 70q6-8 12 0" stroke="#4A2A1A" strokeWidth="4" strokeLinecap="round" /></>
        : <><path d="M58 72q6 6 12 0" stroke="#4A2A1A" strokeWidth="4" strokeLinecap="round" /><path d="M90 72q6 6 12 0" stroke="#4A2A1A" strokeWidth="4" strokeLinecap="round" /></>}
      <ellipse cx="52" cy="84" rx="7" ry="4.5" fill="#FF8F8F" opacity=".55" />
      <ellipse cx="108" cy="84" rx="7" ry="4.5" fill="#FF8F8F" opacity=".55" />
      <path d="M80 88c-6-8-18-10-26-4-6 5-4 14 3 14 3 0 4-3 2-5 8 4 16 1 21-5 5 6 13 9 21 5-2 2-1 5 2 5 7 0 9-9 3-14-8-6-20-4-26 4z" fill="#6B3E26" stroke="#4A2A1A" strokeWidth="3.5" strokeLinejoin="round" />
      {happy && <path d="M72 100q8 7 16 0" stroke="#4A2A1A" strokeWidth="3.5" strokeLinecap="round" />}
    </svg>
  )
}

/* floating see-through props: scissors, comb, barber pole */
const PROPS = [
  { x: -26, y: 150, s: 60, r: -20, k: 'scissors', d: 0 },
  { x: 330, y: 200, s: 54, r: 18, k: 'comb', d: 0.6 },
  { x: 336, y: 380, s: 62, r: -12, k: 'pole', d: 1.1 },
  { x: -30, y: 470, s: 54, r: 24, k: 'comb', d: 1.6 },
  { x: 326, y: 640, s: 50, r: 30, k: 'scissors', d: 0.3 },
  { x: -24, y: 700, s: 56, r: -8, k: 'pole', d: 0.9 },
]
function Prop({ k }: { k: string }) {
  const w = 'rgba(255,255,255,.55)', e = 'rgba(255,255,255,.8)'
  if (k === 'scissors') return (<svg viewBox="0 0 64 64" width="100%" height="100%"><circle cx="16" cy="46" r="10" fill="none" stroke={e} strokeWidth="5" /><circle cx="40" cy="50" r="10" fill="none" stroke={e} strokeWidth="5" /><path d="M22 38L52 8M34 42L44 14" stroke={e} strokeWidth="5" strokeLinecap="round" /></svg>)
  if (k === 'comb') return (<svg viewBox="0 0 64 64" width="100%" height="100%"><rect x="6" y="20" width="52" height="12" rx="4" fill={w} stroke={e} strokeWidth="2" />{[12, 20, 28, 36, 44, 52].map(x => <rect key={x} x={x - 2} y="32" width="4" height="16" rx="2" fill={w} />)}</svg>)
  return (<svg viewBox="0 0 64 64" width="100%" height="100%"><rect x="22" y="6" width="20" height="52" rx="10" fill={w} stroke={e} strokeWidth="2" /><path d="M22 18l20 10M22 32l20 10M22 46l20 8" stroke="rgba(255,255,255,.9)" strokeWidth="4" /></svg>)
}
function Floaties() {
  return <>{PROPS.map((p, i) => (
    <motion.div key={i} className="pointer-events-none absolute" style={{ left: p.x, top: p.y, width: p.s, height: p.s, rotate: p.r, opacity: 0.7 }}
      animate={{ y: [0, -12, 0], rotate: [p.r, p.r + 8, p.r] }} transition={{ duration: 4 + i * 0.4, repeat: Infinity, ease: 'easeInOut', delay: p.d }}>
      <Prop k={p.k} />
    </motion.div>
  ))}</>
}
function Bubbles() {
  return <>{BUBBLES.map((o, i) => (
    <motion.span key={i} className="pointer-events-none absolute rounded-full" style={{ left: o.x, top: o.y, width: o.s, height: o.s, background: 'rgba(255,255,255,.55)' }}
      animate={{ y: [0, -30, 0], opacity: [0.2, 0.9, 0.2] }} transition={{ duration: 5, repeat: Infinity, delay: o.d }} />
  ))}</>
}
function Confetti() {
  return <>{CONFETTI.map((o, i) => (
    <motion.span key={i} className="pointer-events-none absolute" style={{ left: o.x, top: 260, width: 8, height: 12, borderRadius: 2, background: o.c }}
      initial={{ y: 0, opacity: 1, rotate: 0 }} animate={{ y: [0, -o.up, 420], x: o.dx, rotate: o.r * 3, opacity: [1, 1, 0] }}
      transition={{ duration: 2.2, delay: o.d, ease: 'easeOut' }} />
  ))}</>
}

const PILL_DARK: React.CSSProperties = { background: 'rgba(30,40,12,.16)', color: '#fff' }
const PILL_LIGHT: React.CSSProperties = { background: '#fff', color: BRAND2, boxShadow: '0 8px 20px rgba(30,40,12,.18)' }
const euro = (n: number) => `€${n}`

function BigButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button type="button" whileTap={{ scale: 0.95 }} disabled={disabled} onClick={onClick}
      className="pd-btn w-full rounded-full py-4 text-[16px] font-black tracking-[0.12em] transition-opacity"
      style={{ background: '#fff', color: BRAND2, opacity: disabled ? 0.45 : 1, boxShadow: '0 12px 28px rgba(30,40,12,.25)' }}>
      {children}
    </motion.button>
  )
}

type St = { service: number | null; day: number; time: string | null; name: string }

function Screen({ t, step, setStep, st, set, reset, days }: {
  t: typeof T.en; step: number; setStep: (n: number) => void; st: St; set: (p: Partial<St>) => void; reset: () => void; days: Date[]
}) {
  const s = st.service !== null ? t.services[st.service] : null
  const anim = { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -24 }, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } }
  const dayLabel = (d: Date | undefined, o: Intl.DateTimeFormatOptions) => d ? d.toLocaleDateString(t.locale, o) : ''

  if (step === 0) return (
    <motion.div key="0" {...anim} className="absolute inset-0 flex flex-col items-center px-7 pt-6 pb-10 text-center text-white">
      <motion.div animate={{ y: [0, -10, 0], rotate: [-3, 3, -3] }} transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }} className="mt-4">
        <Mascot size={170} />
      </motion.div>
      <div className="mt-8 text-[14px] font-bold opacity-90">{t.welcome}</div>
      <div className="mt-1 text-[64px] leading-none font-black tracking-tight">{t.big}</div>
      <div className="mt-2 text-[17px] font-extrabold">{t.bigSub}</div>
      <div className="mt-auto w-full"><BigButton onClick={() => setStep(1)}>{t.start}</BigButton></div>
    </motion.div>
  )

  if (step === 1) return (
    <motion.div key="1" {...anim} className="absolute inset-0 flex flex-col px-7 pt-4 pb-10 text-white">
      <div className="flex items-center gap-3"><Mascot size={60} /><div className="text-[26px] leading-tight font-black">{t.pick}</div></div>
      <div className="mt-6 flex flex-col gap-3">
        {t.services.map(([n, m, p, ic], i) => (
          <motion.button type="button" whileTap={{ scale: 0.97 }} key={n} onClick={() => set({ service: i })}
            className="pd-btn flex items-center gap-3 rounded-full py-3 pr-5 pl-3 text-left transition-all"
            style={st.service === i ? PILL_LIGHT : PILL_DARK}>
            <span className="flex h-10 w-10 items-center justify-center rounded-full text-[20px]" style={{ background: st.service === i ? '#EEF2E2' : 'rgba(255,255,255,.18)' }}>{ic}</span>
            <span className="flex-1">
              <span className="block text-[16px] leading-tight font-extrabold">{n}</span>
              <span className="block text-[12px] font-bold opacity-75">{m} {t.min}</span>
            </span>
            <span className="text-[18px] font-black">{euro(p)}</span>
          </motion.button>
        ))}
      </div>
      <div className="mt-auto"><BigButton disabled={st.service === null} onClick={() => setStep(2)}>{t.next}</BigButton></div>
    </motion.div>
  )

  if (step === 2) return (
    <motion.div key="2" {...anim} className="absolute inset-0 flex flex-col px-7 pt-4 pb-10 text-white">
      <div className="text-[26px] font-black">{t.when}</div>
      <div className="my-3 text-center">
        <motion.div key={st.time || 'x'} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          className="text-[68px] leading-none font-black tracking-tight">{st.time || '--:--'}</motion.div>
        <div className="mt-1 text-[14px] font-extrabold opacity-90">{dayLabel(days[st.day], { weekday: 'long', day: 'numeric', month: 'long' })}</div>
      </div>
      <div className="-mx-7 flex gap-2 overflow-x-auto px-7" style={{ scrollbarWidth: 'none' }}>
        {days.map((d, i) => (
          <motion.button type="button" whileTap={{ scale: 0.92 }} key={i} onClick={() => set({ day: i, time: null })}
            className="pd-btn w-[52px] flex-shrink-0 rounded-[20px] py-2 text-center" style={st.day === i ? PILL_LIGHT : PILL_DARK}>
            <span className="block text-[11px] font-extrabold opacity-80">{i === 0 ? t.today : t.days[d.getDay()]}</span>
            <span className="block text-[19px] font-black">{d.getDate()}</span>
          </motion.button>
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {TIMES.map(h => {
          const busy = TAKEN.has(h) && st.day % 2 === 0
          return (
            <motion.button type="button" whileTap={busy ? {} : { scale: 0.92 }} key={h} disabled={busy} onClick={() => set({ time: h })}
              className="pd-btn rounded-full py-2.5 text-[14px] font-black"
              style={busy ? { background: 'rgba(30,40,12,.08)', color: 'rgba(255,255,255,.45)', textDecoration: 'line-through' } : st.time === h ? PILL_LIGHT : PILL_DARK}>
              {busy ? t.taken : h}
            </motion.button>
          )
        })}
      </div>
      <div className="mt-auto"><BigButton disabled={!st.time} onClick={() => setStep(3)}>{t.next}</BigButton></div>
    </motion.div>
  )

  if (step === 3) return (
    <motion.div key="3" {...anim} className="absolute inset-0 flex flex-col px-7 pt-4 pb-10 text-white">
      <div className="text-[14px] font-extrabold opacity-90">{t.who}</div>
      <div className="text-[30px] leading-tight font-black">{t.name}</div>
      <input value={st.name} onChange={e => set({ name: e.target.value.slice(0, 24) })} placeholder={t.namePh} aria-label={t.name}
        className="mt-5 w-full rounded-full px-6 py-4 text-[18px] font-extrabold outline-none placeholder:text-white/60"
        style={{ background: 'rgba(30,40,12,.16)', color: '#fff', border: '2px solid rgba(255,255,255,.35)' }} />
      {s && <div className="mt-6 rounded-[28px] p-5" style={{ background: 'rgba(255,255,255,.18)' }}>
        <div className="flex items-center gap-3">
          <span className="text-[30px]">{s[3]}</span>
          <div className="flex-1"><div className="text-[17px] font-black">{s[0]}</div><div className="text-[13px] font-bold opacity-85">{dayLabel(days[st.day], { weekday: 'short', day: 'numeric', month: 'short' })} · {st.time} · {s[1]} {t.min}</div></div>
          <span className="text-[22px] font-black">{euro(s[2])}</span>
        </div>
      </div>}
      <div className="mt-auto"><BigButton disabled={!st.name.trim()} onClick={() => setStep(4)}>{t.book}</BigButton></div>
    </motion.div>
  )

  return (
    <motion.div key="4" {...anim} className="absolute inset-0 flex flex-col items-center px-7 pt-6 pb-10 text-center text-white">
      <Confetti />
      <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="mt-6">
        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 1.6, repeat: Infinity }}><Mascot happy size={180} /></motion.div>
      </motion.div>
      <div className="mt-6 text-[52px] leading-none font-black">{t.done}</div>
      <div className="mt-2 text-[18px] font-extrabold">{t.hello(st.name.trim())}</div>
      <div className="mt-1 text-[14px] font-bold opacity-90">{s && `${s[0]} · ${st.time}`}</div>
      <div className="mt-4 rounded-full px-4 py-1.5 text-[12.5px] font-bold" style={{ background: 'rgba(255,255,255,.2)' }}>✉️ {t.mail}</div>
      <div className="mt-auto flex w-full flex-col gap-3">
        <BigButton onClick={reset}>{t.again}</BigButton>
        <Link href="/register" className="text-[13px] font-black tracking-[0.1em] text-white underline underline-offset-4">{t.own}</Link>
      </div>
    </motion.div>
  )
}

/* ---------- realistic iPhone frame, scaled to fit its box ---------- */
const W = 390, H = 844, F = 16
const OW = W + 2 * F, OH = H + 2 * F

export default function PhoneDemo({ lng, maxHeight = 640 }: { lng: Lng; maxHeight?: number }) {
  const t = T[lng] ?? T.en
  const boxRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(0.7)
  const [step, setStep] = useState(0)
  const [st, setSt] = useState<St>({ service: null, day: 0, time: null, name: '' })
  // today's date, read in the browser only (empty on the server)
  const todayKey = useSyncExternalStore(() => () => {}, () => new Date().toDateString(), () => '')
  const days = useMemo(() => {
    if (!todayKey) return [] as Date[]
    const today = new Date(todayKey)
    return Array.from({ length: 7 }, (_, i) => { const d = new Date(today); d.setDate(today.getDate() + i); return d })
  }, [todayKey])
  const [clock, setClock] = useState('')
  const set = (p: Partial<St>) => setSt(o => ({ ...o, ...p }))
  const reset = () => { setStep(0); setSt({ service: null, day: 0, time: null, name: '' }) }

  // fit the phone into the width it gets, never taller than maxHeight
  useLayoutEffect(() => {
    const el = boxRef.current
    if (!el) return
    const fit = () => setScale(Math.min(1, el.clientWidth / OW, maxHeight / OH))
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [maxHeight])

  // the clock in the status bar, updated in the browser
  useEffect(() => {
    const f = () => setClock(new Date().toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' }))
    const first = setTimeout(f, 0)
    const id = setInterval(f, 10000)
    return () => { clearTimeout(first); clearInterval(id) }
  }, [])

  const btn = (side: 'left' | 'right', top: number, h: number) => (
    <span className="absolute" style={{ [side]: -5, top, width: 6, height: h, borderRadius: side === 'left' ? '4px 0 0 4px' : '0 4px 4px 0',
      background: side === 'left' ? 'linear-gradient(90deg,#9d988f,#e9e6e0 60%,#c9c5bd)' : 'linear-gradient(90deg,#c9c5bd,#e9e6e0 40%,#9d988f)',
      boxShadow: '0 1px 2px rgba(0,0,0,.25)' }} />
  )

  return (
    <div ref={boxRef} className={`${nunito.className} phone-demo w-full`} style={{ color: '#3b3b3b' }}>
      <div className="mx-auto" style={{ width: OW * scale, height: OH * scale }}>
        <div className="relative origin-top-left" style={{ width: OW, height: OH, transform: `scale(${scale})` }}>
          {btn('left', 170, 34)}{btn('left', 236, 66)}{btn('left', 314, 66)}{btn('right', 262, 104)}
          {/* titanium rim */}
          <div className="absolute inset-0 rounded-[70px]" style={{
            background: 'linear-gradient(135deg,#f7f5f1 0%,#c8c3ba 22%,#efece6 45%,#b3ada3 70%,#e6e2db 100%)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,.9), inset 0 2px 3px rgba(255,255,255,.8), inset 0 -2px 4px rgba(0,0,0,.18), 0 60px 100px -20px rgba(60,45,30,.35), 0 25px 40px -10px rgba(60,45,30,.25), 0 4px 10px rgba(60,45,30,.12)' }} />
          {/* black bezel */}
          <div className="absolute rounded-[62px] bg-black" style={{ inset: 8, boxShadow: 'inset 0 0 0 1.5px #1c1c1e' }} />
          {/* screen */}
          <div className="absolute overflow-hidden rounded-[54px]" style={{ inset: F, background: SHOW_BOOKING_PAGE ? '#1a1412' : `linear-gradient(170deg, ${BRAND} 0%, ${BRAND2} 100%)` }}>
            {SHOW_BOOKING_PAGE ? <BookingScreen lng={lng} days={days} /> : <><Bubbles /><Floaties /></>}
            {/* status bar */}
            <div className="relative z-20 flex items-center justify-between px-10 pt-[18px] text-[16px] font-black text-white">
              <span>{clock}</span>
              <span className="absolute top-[11px] left-1/2 h-[36px] w-[124px] -translate-x-1/2 rounded-full bg-black" />
              <span className="flex items-center gap-1.5">
                <svg width="18" height="12" viewBox="0 0 18 12" fill="#fff"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
                <svg width="26" height="13" viewBox="0 0 26 13"><rect x=".5" y=".5" width="22" height="12" rx="3.5" fill="none" stroke="#fff" opacity=".6" /><rect x="2" y="2" width="19" height="9" rx="2" fill="#fff" /><rect x="23.5" y="4.5" width="2" height="4" rx="1" fill="#fff" opacity=".6" /></svg>
              </span>
            </div>
            {!SHOW_BOOKING_PAGE && <>
            {/* back / progress / skip */}
            <div className="relative z-20 mt-5 flex h-6 items-center justify-between px-7 text-white">
              {step > 0 && step < 4
                ? <button type="button" onClick={() => setStep(step - 1)} aria-label="Back" className="pd-btn -ml-1 flex h-9 w-9 items-center justify-center rounded-full" style={{ background: 'rgba(30,40,12,.16)' }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5l-7 7 7 7" /></svg></button>
                : <span />}
              {step > 0 && step < 4 && <div className="flex gap-1.5">{[1, 2, 3].map(i => <span key={i} className="h-2 rounded-full transition-all" style={{ width: step === i ? 22 : 8, background: step >= i ? '#fff' : 'rgba(255,255,255,.4)' }} />)}</div>}
              {step === 0
                ? <button type="button" onClick={() => setStep(1)} className="pd-btn text-[13px] font-black tracking-[0.12em] text-white" style={{ background: 'transparent' }}>{t.skip}</button>
                : <span className="w-9" />}
            </div>
            <div className="absolute inset-x-0 bottom-0 z-10" style={{ top: 90 }}>
              <AnimatePresence mode="wait">
                <Screen key={step} t={t} step={step} setStep={setStep} st={st} set={set} reset={reset} days={days} />
              </AnimatePresence>
            </div>
            </>}
            <span className="absolute bottom-2.5 left-1/2 z-30 h-[5px] w-[140px] -translate-x-1/2 rounded-full bg-white/90" />
            {/* faint glass reflection */}
            <div className="pointer-events-none absolute inset-0 z-40" style={{ background: 'linear-gradient(115deg, rgba(255,255,255,.10) 0%, rgba(255,255,255,0) 35%)' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
