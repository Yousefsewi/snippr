'use client'

// Interactive iOS-style calendar for the homepage hero.
// Tap a free slot (or wait: it books one by itself) -> the row fills, a green "Confirmed"
// pill pops in, an iPhone-style notification slides down and an iMessage-style
// confirmation is "typed" to the client. The card tilts in 3D under the pointer.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'framer-motion'

type Lng = 'en' | 'tr'
type Slot = { time: string; service: string | null; name: string | null; fresh?: boolean }

const T = {
  tr: {
    locale: 'tr-TR', free: 'Boş', tapHint: 'Boş saate dokun', confirmed: 'Onaylandı', booked: 'dolu',
    notifTitle: 'Yeni randevu', viaLink: 'Linkten geldi', now: 'şimdi', toClient: 'Müşteriye giden',
    msg: (d: string, t: string) => `Randevun ${d} ${t} için onaylandı ✂️`, minutes: 'dk',
    services: [['Saç kesimi', 30], ['Sakal', 20], ['Saç ve sakal', 45], ['Çocuk tıraşı', 25], ['Boya', 60]] as [string, number][],
    names: ['Ali K.', 'Mehmet Y.', 'Can D.', 'Emre S.', 'Burak T.', 'Kerem A.', 'Deniz Ö.', 'Mert B.'],
  },
  en: {
    locale: 'en-US', free: 'Free', tapHint: 'Tap a free slot', confirmed: 'Confirmed', booked: 'booked',
    notifTitle: 'New booking', viaLink: 'Via your link', now: 'now', toClient: 'Sent to client',
    msg: (d: string, t: string) => `Your booking for ${d} at ${t} is confirmed ✂️`, minutes: 'min',
    services: [['Haircut', 30], ['Beard trim', 20], ['Hair & beard', 45], ['Kids cut', 25], ['Colour', 60]] as [string, number][],
    names: ['Alex K.', 'Sam Y.', 'Chris D.', 'Ethan S.', 'Ben T.', 'Leo A.', 'Noah O.', 'Max B.'],
  },
}

const START: [string, number | null, number | null][] = [
  ['09:00', 0, 0], ['10:30', 1, 1], ['12:00', null, null], ['13:00', 2, 2],
  ['14:30', null, null], ['16:00', null, null], ['17:30', 3, 3],
]
const initial = (lng: Lng): Slot[] => START.map(([time, s, n]) => ({
  time, service: s === null ? null : T[lng].services[s][0], name: n === null ? null : T[lng].names[n],
}))

const INK = '#1c1c1e', SUB = '#6e6e73', LINE = 'rgba(60,60,67,0.12)', GREEN = '#34c759', BLUE = '#0a84ff'
const GLASS: React.CSSProperties = {
  background: 'rgba(255,255,255,0.78)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.9)',
  boxShadow: '0 1px 0 rgba(255,255,255,0.9) inset, 0 30px 60px -20px rgba(40,30,20,0.28), 0 10px 20px -10px rgba(40,30,20,0.12)',
}

function Check({ size = 12, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
      <motion.path d="M5 12.5l4.5 4.5L19 7" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.35, delay: 0.1 }} />
    </svg>
  )
}

export default function HeroCalendar({ lng }: { lng: Lng }) {
  const t = T[lng]
  const reduce = useReducedMotion()
  const [slots, setSlots] = useState<Slot[]>(() => initial(lng))
  const [notif, setNotif] = useState<{ id: number; time: string; service: string; mins: number; name: string } | null>(null)
  const [bubble, setBubble] = useState<{ id: number; text: string; typing: boolean } | null>(null)
  const [hover, setHover] = useState(false)
  const idRef = useRef(0)
  const timers = useRef<number[]>([])

  // (the parent passes key={lng}, so a language switch starts a fresh demo)
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const later = (fn: () => void, ms: number) => { timers.current.push(window.setTimeout(fn, ms)) }

  const today = useMemo(() => new Date(), [])
  const dayLong = today.toLocaleDateString(t.locale, { day: 'numeric', month: 'long' })
  const dayShort = today.toLocaleDateString(t.locale, { weekday: 'long' }).toLocaleLowerCase(t.locale)
  const bookedCount = slots.filter(s => s.service).length
  const firstFree = slots.findIndex(s => !s.service)

  // latest slots, so handlers and the demo timer never act on stale data
  const slotsRef = useRef(slots)
  useEffect(() => { slotsRef.current = slots }, [slots])

  const book = useCallback((i: number) => {
    const prev = slotsRef.current
    if (!prev[i] || prev[i].service) return
    const [service, mins] = t.services[Math.floor(Math.random() * t.services.length)]
    const name = t.names[Math.floor(Math.random() * t.names.length)]
    const id = ++idRef.current
    const time = prev[i].time
    const next = prev.map((s, j) => (j === i ? { ...s, service, name, fresh: true } : { ...s, fresh: false }))
    slotsRef.current = next
    setSlots(next)
    setNotif({ id, time, service, mins, name })
    setBubble({ id, text: t.msg(dayShort, time), typing: true })
    later(() => setBubble(b => (b && b.id === id ? { ...b, typing: false } : b)), 1100)
    later(() => setNotif(n => (n && n.id === id ? null : n)), 3600)
    later(() => setBubble(b => (b && b.id === id ? null : b)), 5200)
  }, [t, dayShort])

  // self-playing demo while nobody is interacting; starts over when the day is full
  useEffect(() => {
    if (hover || reduce) return
    const id = window.setInterval(() => {
      const free = slotsRef.current.map((s, i) => (s.service ? -1 : i)).filter(i => i >= 0)
      if (!free.length) { const fresh = initial(lng); slotsRef.current = fresh; setSlots(fresh); return }
      book(free[Math.floor(Math.random() * free.length)])
    }, 4200)
    return () => clearInterval(id)
  }, [hover, reduce, book, lng])

  // 3D tilt following the pointer
  const mx = useMotionValue(0), my = useMotionValue(0)
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [9, -9]), { stiffness: 140, damping: 16 })
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-12, 12]), { stiffness: 140, damping: 16 })
  const near = { x: useTransform(ry, v => v * 1.6), y: useTransform(rx, v => v * -1.6) }
  const onMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduce || e.pointerType !== 'mouse') return
    const r = e.currentTarget.getBoundingClientRect()
    mx.set((e.clientX - r.left) / r.width - 0.5); my.set((e.clientY - r.top) / r.height - 0.5)
  }
  const onLeave = () => { mx.set(0); my.set(0); setHover(false) }

  return (
    <div className="relative select-none" style={{ perspective: 1200, width: 'min(460px, 100%)' }}
      onPointerMove={onMove} onPointerEnter={() => setHover(true)} onPointerLeave={onLeave}>
      <motion.div style={{ rotateX: rx, rotateY: ry, transformStyle: 'preserve-3d' }}
        initial={{ opacity: 0, y: 30, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative">

        {/* ── main calendar card ── */}
        <div className="relative rounded-[30px] px-6 pt-6 pb-4" style={GLASS}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.08em]" style={{ color: '#ff3b30' }}>{today.toLocaleDateString(t.locale, { weekday: 'long' })}</p>
              <p className="text-[28px] font-bold leading-tight tracking-[-0.02em]" style={{ color: INK }}>{dayLong}</p>
            </div>
            {/* fill ring */}
            <div className="flex items-center gap-2 rounded-full px-2.5 py-1.5" style={{ background: 'rgba(118,118,128,0.12)' }}>
              <svg width="22" height="22" viewBox="0 0 36 36" className="-rotate-90">
                <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(60,60,67,0.18)" strokeWidth="5" />
                <motion.circle cx="18" cy="18" r="15" fill="none" stroke={GREEN} strokeWidth="5" strokeLinecap="round"
                  strokeDasharray={94.2} animate={{ strokeDashoffset: 94.2 * (1 - bookedCount / slots.length) }} transition={{ type: 'spring', stiffness: 120, damping: 18 }} />
              </svg>
              <span className="text-[13px] font-semibold tabular-nums" style={{ color: INK }}>{bookedCount}/{slots.length} <span style={{ color: SUB, fontWeight: 500 }}>{t.booked}</span></span>
            </div>
          </div>

          <div className="mt-4" style={{ borderTop: `1px solid ${LINE}` }}>
            {slots.map((s, i) => {
              const free = !s.service
              return (
                <motion.button key={s.time} type="button" layout onClick={() => book(i)} disabled={!free}
                  whileTap={free ? { scale: 0.97 } : undefined}
                  className="relative flex w-full items-center gap-4 overflow-hidden px-2 py-[11px] text-left outline-none focus-visible:ring-2 focus-visible:ring-[#0a84ff]/40 rounded-[14px]"
                  style={{ borderBottom: i < slots.length - 1 ? `1px solid ${LINE}` : 'none', cursor: free ? 'pointer' : 'default' }}
                  aria-label={free ? `${s.time} ${t.free}` : `${s.time} ${s.service}`}>
                  {/* green wash that sweeps across when a slot gets booked */}
                  <AnimatePresence>
                    {s.fresh && (
                      <motion.span key="wash" className="absolute inset-0 rounded-[14px]" style={{ background: 'rgba(52,199,89,0.12)', transformOrigin: 'left' }}
                        initial={{ scaleX: 0, opacity: 1 }} animate={{ scaleX: 1, opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} />
                    )}
                  </AnimatePresence>
                  <span className="relative w-[50px] font-mono text-[14px] tabular-nums" style={{ color: SUB }}>{s.time}</span>
                  <span className="relative h-7 w-[3px] rounded-full" style={{ background: free ? 'rgba(60,60,67,0.15)' : s.fresh ? GREEN : BLUE }} />
                  <span className="relative min-w-0 flex-1">
                    {/* no exit animation here: the booked text replaces "Free" right away, then slides in */}
                    {free ? (
                        <span className="flex items-center gap-2 text-[16px]" style={{ color: SUB }}>
                          {t.free}
                          {i === firstFree && (
                            <span className="flex items-center gap-1.5 text-[11.5px] font-medium" style={{ color: BLUE }}>
                              <span className="relative flex h-2 w-2">
                                {!reduce && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: BLUE }} />}
                                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: BLUE }} />
                              </span>
                              {t.tapHint}
                            </span>
                          )}
                        </span>
                      ) : (
                        <motion.span key={`busy-${s.service}-${s.name}`} className="block" initial={s.fresh ? { opacity: 0, y: 8 } : false} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
                          <span className="block truncate text-[16px] font-semibold" style={{ color: INK }}>{s.service}</span>
                          <span className="block truncate text-[13px]" style={{ color: SUB }}>{s.name}</span>
                        </motion.span>
                      )}
                  </span>
                  <AnimatePresence>
                    {s.fresh && (
                      <motion.span key="ok" className="relative flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold text-white"
                        style={{ background: GREEN, boxShadow: '0 6px 14px -6px rgba(52,199,89,0.8)' }}
                        initial={{ scale: 1.8, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 18, delay: 0.15 }}>
                        <Check /> {t.confirmed}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* ── iPhone-style notification, floats nearer to the viewer ── */}
        <motion.div className="pointer-events-none absolute -top-[136px] -right-3 w-[236px] sm:-right-10" style={{ x: near.x, y: near.y, translateZ: 60 }}>
          <AnimatePresence>
            {notif && (
              <motion.div key={notif.id} className="rounded-[22px] px-4 py-3" style={GLASS}
                initial={{ y: -40, opacity: 0, scale: 0.9 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: -30, opacity: 0, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 360, damping: 26 }}>
                <div className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/icon-192.png" alt="" className="h-5 w-5 rounded-[6px]" />
                  <span className="text-[11px] font-semibold uppercase tracking-[0.06em]" style={{ color: SUB }}>Snippr</span>
                  <span className="ml-auto text-[11px]" style={{ color: SUB }}>{t.now}</span>
                </div>
                <p className="mt-1.5 text-[14px] font-semibold" style={{ color: INK }}>{t.notifTitle}</p>
                <p className="font-mono text-[30px] leading-none font-semibold tracking-tight tabular-nums" style={{ color: INK }}>{notif.time}</p>
                <p className="mt-1 text-[12.5px]" style={{ color: '#3a3a3c' }}>{notif.service}, {notif.mins} {t.minutes} · {notif.name}</p>
                <span className="mt-2 inline-block rounded-full px-2 py-0.5 text-[10.5px] font-medium" style={{ background: 'rgba(10,132,255,0.1)', color: BLUE }}>{t.viaLink}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── message to the client, iMessage style ── */}
        <motion.div className="pointer-events-none absolute -bottom-12 -right-4 w-[240px] sm:-right-10" style={{ x: near.x, y: near.y, translateZ: 40 }}>
          <AnimatePresence>
            {bubble && (
              <motion.div key={bubble.id} initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }} className="flex flex-col items-end">
                <span className="mb-1 mr-2 text-[10.5px] font-medium" style={{ color: SUB }}>{t.toClient}</span>
                <motion.div layout className="rounded-[20px] rounded-br-[6px] px-4 py-2.5 text-[13.5px] leading-snug text-white"
                  style={{ background: BLUE, boxShadow: '0 14px 30px -14px rgba(10,132,255,0.8)' }}>
                  {bubble.typing ? (
                    <span className="flex gap-1 py-1">
                      {[0, 1, 2].map(d => (
                        <motion.span key={d} className="h-2 w-2 rounded-full bg-white/80" animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: d * 0.15 }} />
                      ))}
                    </span>
                  ) : (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{bubble.text}</motion.span>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}
