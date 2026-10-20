'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { formatMoney, detectCurrency } from '@/lib/currency'
import { safeUrl, youtubeId, isHexColor } from '@/lib/page-links'
import { wallpaper } from '@/lib/page-themes'
import { DEFAULT_HOURS } from '@/lib/hours'
import { useClientValue } from '@/lib/use-stored'
import { FIRST_VISIT_DISCOUNT } from '@/lib/features'

/* ─────────────────────────  types  ───────────────────────── */
interface Barber {
  id: string
  first_visit_discount?: number // % off a customer's first appointment (set by the database)
  name: string
  slug: string
  email?: string
  address?: string | null
  photo_url?: string | null
  // optional customisation (rendered only if present)
  bio?: string | null
  cover_url?: string | null
  accent?: string | null
  links?: { platform: string; url: string }[] | null
  blocks?: { id: string; type: 'link' | 'embed'; title: string; url: string; image?: string }[] | null
}

interface Service { id: string; name: string; duration_min: number; price: number }

/* ─────────────────────────  helpers  ───────────────────────── */
const toLocalKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

// slots every 30 min between startMin and endMin (defaults to the whole day)
const genSlots = (durationMin: number, startMin = 0, endMin = 24 * 60): string[] => {
  const out: string[] = []
  for (let t = startMin; t + durationMin <= endMin; t += 30) {
    out.push(`${String(Math.floor(t / 60)).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`)
  }
  return out
}

type DayHours = { open: boolean; start: string; end: string }
type WorkingHours = Record<string, DayHours>
const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] // JS getDay() order

// UUID v4; crypto.randomUUID only exists on https/localhost, so fall back for LAN testing
const newId = (): string => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  const b = crypto.getRandomValues(new Uint8Array(16))
  b[6] = (b[6] & 0x0f) | 0x40
  b[8] = (b[8] & 0x3f) | 0x80
  const h = Array.from(b, x => x.toString(16).padStart(2, '0')).join('')
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`
}
const toMin = (hhmm: string) => { const [h, m] = (hhmm || '0:0').split(':').map(Number); return h * 60 + m }

/* ─────────────────────────  page  ───────────────────────── */
export default function BookingPage() {
  const slug = useParams().slug as string
  const ccy = typeof window !== 'undefined' ? detectCurrency() : 'USD'

  const [barber, setBarber] = useState<Barber | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const [service, setService] = useState<Service | null>(null)
  const [date, setDate] = useState<Date | null>(null)
  const [time, setTime] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  // Busy ranges (minutes from midnight) for one day; `day` guards against showing another day's data while loading.
  const [booked, setBooked] = useState<{ day: string; ranges: [number, number][] }>({ day: '', ranges: [] })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  // % actually applied to the booking just made (decided by the database)
  const [appliedDiscount, setAppliedDiscount] = useState(0)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  // which iOS-style row is expanded: service → date → time open one after another
  // shown inside the dashboard's iPhone preview (?preview=1)
  const inPreview = useClientValue(() => new URLSearchParams(window.location.search).has('preview'), false)
  const [openRow, setOpenRow] = useState<'service' | 'date' | 'time' | null>(null)

  /* load barber + services */
  useEffect(() => {
    (async () => {
      // Only public profile columns are readable (email and push tokens are private)
      const { data: b } = await supabase.from('barbers')
        .select('id, name, slug, bio, address, photo_url, cover_url, accent, links, blocks, working_hours')
        .eq('slug', slug).single()
      if (!b) { setNotFound(true); setLoading(false); return }
      // Read separately so the page still works if first-visit-discount.sql hasn't been run yet
      const { data: d } = await supabase.from('barbers').select('first_visit_discount').eq('id', b.id).maybeSingle()
      setBarber({ ...b, first_visit_discount: d?.first_visit_discount ?? 0 })
      const { data: s } = await supabase.from('services').select('*').eq('barber_id', b.id).order('price')
      setServices(s || [])
      setLoading(false)
    })()
  }, [slug])

  const accent = isHexColor(barber?.accent) ? barber.accent : '#111827'
  const firstVisit = FIRST_VISIT_DISCOUNT ? (barber?.first_visit_discount ?? 0) : 0
  const discounted = (price: number) => Math.round(price * (100 - firstVisit)) / 100

  /* next 14 days — every day open (24/7) */
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + i); return d
  })

  /* fetch booked slots whenever date changes */
  useEffect(() => {
    if (!barber || !date) return
    (async () => {
      const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999)
      // Customers can't read appointments directly; this RPC returns only busy times
      const { data } = await supabase.rpc('get_busy_slots', {
        p_barber_id: barber.id, p_from: dayStart.toISOString(), p_to: dayEnd.toISOString(),
      })
      setBooked({
        day: date.toDateString(),
        ranges: ((data || []) as { start_time: string; end_time: string }[]).map(a => {
          const s = new Date(a.start_time), e = new Date(a.end_time)
          const startM = s < dayStart ? 0 : s.getHours() * 60 + s.getMinutes()
          const endM = e > dayEnd ? 24 * 60 : e.getHours() * 60 + e.getMinutes()
          return [startM, Math.max(endM, startM + 1)] as [number, number]
        }),
      })
    })()
  }, [barber, date])

  const durationMin = service?.duration_min ?? 30
  const dayRanges = date && booked.day === date.toDateString() ? booked.ranges : []
  const isToday = !!date && date.toDateString() === new Date().toDateString()
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()
  // A slot is unavailable if it overlaps an existing appointment or has already passed today.
  const isTaken = (t: string) => {
    const s = toMin(t), e = s + durationMin
    if (isToday && s <= nowMin) return true
    return dayRanges.some(([bs, be]) => s < be && e > bs)
  }

  // Respect the barber's working hours for the selected day (falls back to all-day if not set)
  const wh: WorkingHours = (barber as { working_hours?: WorkingHours } | null)?.working_hours ?? DEFAULT_HOURS
  const dayHours = wh && date ? wh[DAY_KEYS[date.getDay()]] : undefined
  const isClosed = !!dayHours && dayHours.open === false
  const slots = isClosed
    ? []
    : genSlots(
        service?.duration_min ?? 30,
        dayHours?.open ? toMin(dayHours.start) : 0,
        dayHours?.open ? toMin(dayHours.end) : 24 * 60,
      )

  const share = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : ''
    if (navigator.share) { try { await navigator.share({ title: barber?.name, url }) } catch { /* cancelled */ } }
    else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000) }
  }

  const submit = async () => {
    if (!barber || !date || !time || !name) return // service is optional
    setSubmitting(true); setError('')
    const [h, m] = time.split(':').map(Number)
    const start = new Date(date); start.setHours(h, m, 0, 0)
    const end = new Date(start.getTime() + (service?.duration_min ?? 30) * 60000)

    const slotTaken = () => {
      setError('That time was just taken — pick another.'); setSubmitting(false); setTime('')
      const s = h * 60 + m
      setBooked(b => ({ ...b, ranges: [...b.ranges, [s, s + durationMin]] }))
    }

    // Any non-cancelled appointment that overlaps [start, end) blocks this booking
    const { data: existing } = await supabase.rpc('get_busy_slots', {
      p_barber_id: barber.id, p_from: start.toISOString(), p_to: end.toISOString(),
    })
    if (existing && existing.length) { slotTaken(); return }

    // The id is made here so the notify route can be told which booking this is
    // (visitors can't read appointments back after inserting them)
    const appointmentId = newId()
    const { error: err } = await supabase.from('appointments').insert({
      id: appointmentId, barber_id: barber.id, service_id: service?.id ?? null, customer_name: name,
      customer_phone: phone || null, customer_email: email || null,
      start_time: start.toISOString(), end_time: end.toISOString(), status: 'pending',
    })
    // 23P01 = the database's no-overlap rule: someone booked this slot a moment ago
    if (err?.code === '23P01') { slotTaken(); return }
    if (err) { setError(`Could not book: ${err.message}`); setSubmitting(false); return }
    setDone(true); setSubmitting(false)
    if (FIRST_VISIT_DISCOUNT) supabase.rpc('get_booking_discount', { p_id: appointmentId })
      .then(({ data }) => setAppliedDiscount(typeof data === 'number' ? data : 0))

    // Confirmation email to the customer + push to the barber. The server reads every
    // detail from the database itself; it only needs to know which booking this is.
    fetch('/api/notify-booking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appointmentId, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
    }).catch(() => { /* booking already succeeded — notifications are best-effort */ })
  }

  const reset = () => { setOpenRow(null); setDone(false); setAppliedDiscount(0); setService(null); setDate(null); setTime(''); setName(''); setPhone(''); setEmail(''); setError('') }

  /* ───────── loading / 404 ───────── */
  if (loading) return (
    <GlassBackdrop image={null} accent="#111827">
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ ...GLASS_PANEL, width: 76, height: 76, borderRadius: 26, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 26, height: 26, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.25)', borderTopColor: '#fff', animation: 'spin .7s linear infinite' }} />
        </div>
      </div>
    </GlassBackdrop>
  )
  if (notFound || !barber) return (
    <GlassBackdrop image={null} accent="#111827">
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div style={{ ...GLASS_PANEL, borderRadius: 36, padding: '34px 30px', textAlign: 'center', color: '#fff', maxWidth: 360 }}>
          <p style={{ fontSize: 40, margin: 0 }}>✂️</p>
          <p style={{ fontSize: 19, fontWeight: 700, margin: '10px 0 6px' }}>This page isn’t available</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, margin: 0 }}>The link may be wrong or the barber moved.</p>
        </div>
      </div>
    </GlassBackdrop>
  )

  // The panel shows the profile photo; the page background is a separate image (cover_url).
  // Without a background image the backdrop is a soft mesh in the barber's theme colour.
  const bgImage = barber.photo_url
  // today's opening hours for the chip on the photo
  const todayHours = wh[DAY_KEYS[new Date().getDay()]]
  const backdrop = barber.cover_url || null
  const price = service?.price ?? 0
  const total = firstVisit > 0 ? discounted(price) : price

  return (
    <GlassBackdrop image={backdrop} accent={accent}>
      {/* in the dashboard's phone preview (?preview=1) leave room for the status bar & notch */}
      <div style={{ width: '100%', maxWidth: 470, margin: '0 auto', padding: `${inPreview ? 62 : 22}px 14px 48px`, boxSizing: 'border-box', color: '#fff' }}>

        {/* ══ the one big glass panel ══ */}
        <div style={{ ...GLASS_PANEL, borderRadius: 46, padding: 14 }}>
          {/* grabber */}
          <div style={{ width: 38, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.45)', margin: '2px auto 12px' }} />

          {/* photo with glass chips */}
          <div style={{ position: 'relative', width: '100%', aspectRatio: '1 / 0.82', borderRadius: 34, overflow: 'hidden', background: bgImage ? '#1a1a1a' : `linear-gradient(160deg, ${accent} 0%, #1a1a1a 100%)` }}>
            {bgImage
              ? <img src={bgImage} alt={barber.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              : <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.92)', fontSize: 92, fontWeight: 800 }}>{barber.name?.charAt(0).toUpperCase()}</div>}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,0.35) 100%)' }} />

            {/* logo + share */}
            <div style={{ ...GLASS_CHIP, position: 'absolute', top: 14, left: 14, width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, fontWeight: 800 }}>✦</div>
            <button onClick={share} aria-label="Share"
              style={{ ...GLASS_CHIP, position: 'absolute', top: 14, right: 14, width: 40, height: 40, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
              {copied
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5" /></svg>
                : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></svg>}
            </button>

            {/* chips over the photo */}
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 16, display: 'flex', justifyContent: 'center', gap: 8, flexWrap: 'wrap', padding: '0 12px' }}>
              <span style={{ ...GLASS_CHIP, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 999, fontSize: 12.5, fontWeight: 600 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: todayHours?.open ? '#4ade80' : '#a1a1aa', boxShadow: todayHours?.open ? '0 0 8px #4ade80' : 'none' }} />
                {todayHours?.open ? `Open today ${todayHours.start}–${todayHours.end}` : 'Closed today'}
              </span>
              {firstVisit > 0 && (
                <span style={{ ...GLASS_CHIP, display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 999, fontSize: 12.5, fontWeight: 600 }}>
                  🎁 {firstVisit}% off your first visit
                </span>
              )}
            </div>
          </div>

          <div style={{ padding: '18px 10px 6px' }}>
            {/* who */}
            <h1 style={{ fontSize: 25, fontWeight: 700, margin: 0, letterSpacing: '-0.02em', textAlign: 'center' }}>{barber.name}</h1>
            {barber.address && (
              <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(barber.address)}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.82)', fontSize: 13.5, margin: '6px 0 0', textDecoration: 'none' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                <span style={{ textDecoration: 'underline', textUnderlineOffset: 2 }}>{barber.address}</span>
              </a>
            )}
            {barber.links && barber.links.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 10, marginTop: 14 }}>
                {barber.links.filter(l => safeUrl(l.url)).map((l, i) => (
                  <a key={i} href={safeUrl(l.url) ?? '#'} target="_blank" rel="noopener noreferrer"
                    style={{ ...GLASS_CHIP, width: 40, height: 40, borderRadius: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                    <SocialIcon platform={l.platform} size={19} />
                  </a>
                ))}
              </div>
            )}
            {barber.bio && <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.82)', fontSize: 14, margin: '14px auto 0', maxWidth: 360, lineHeight: 1.5 }}>{barber.bio}</p>}

            {/* link buttons + videos */}
            {barber.blocks && barber.blocks.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 }}>
                {barber.blocks.map(b => {
                  if (b.type === 'embed') {
                    // Only YouTube videos are embedded; any other address is never put in an iframe
                    const ytId = youtubeId(b.url)
                    if (!ytId) return null
                    return (
                      <div key={b.id} style={{ borderRadius: 22, overflow: 'hidden', aspectRatio: '16/9', width: '100%', border: '1px solid rgba(255,255,255,0.25)' }}>
                        <iframe src={`https://www.youtube-nocookie.com/embed/${ytId}`} title={b.title} width="100%" height="100%" style={{ border: 'none', display: 'block' }} allowFullScreen />
                      </div>
                    )
                  }
                  return (
                    <a key={b.id} href={safeUrl(b.url) ?? '#'} target="_blank" rel="noopener noreferrer"
                      style={{ ...GLASS_ROW, display: 'flex', alignItems: 'center', minHeight: 52, padding: 7, borderRadius: 999, color: '#fff', textDecoration: 'none', transition: 'transform .15s' }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.015)' }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)' }}>
                      {b.image
                        ? <img src={b.image} alt="" style={{ width: 38, height: 38, borderRadius: 999, objectFit: 'cover', flexShrink: 0 }} />
                        : <span style={{ width: 38, height: 38, borderRadius: 999, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0 }}>🔗</span>}
                      <span style={{ flex: 1, textAlign: 'center', fontSize: 14.5, fontWeight: 600, padding: '0 38px 0 0' }}>{b.title}</span>
                    </a>
                  )
                })}
              </div>
            )}

            {done ? (
              /* ══ booked ══ */
              <div style={{ textAlign: 'center', padding: '26px 4px 10px' }}>
                <div style={{ ...GLASS_CHIP, width: 62, height: 62, margin: '0 auto', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </div>
                <h2 style={{ fontSize: 21, fontWeight: 700, margin: '16px 0 6px' }}>Booking requested!</h2>
                <p style={{ color: 'rgba(255,255,255,0.82)', fontSize: 14, margin: 0 }}>
                  {service ? `${service.name} · ` : ''}{date?.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })} at {time}
                </p>
                {appliedDiscount > 0 && (
                  <p style={{ ...GLASS_CHIP, display: 'inline-block', marginTop: 14, padding: '9px 15px', borderRadius: 16, fontSize: 13.5, fontWeight: 600 }}>
                    🎁 {appliedDiscount}% first-visit discount applied{service && service.price > 0 ? ` — you pay ${formatMoney(Math.round(service.price * (100 - appliedDiscount)) / 100, ccy)} instead of ${formatMoney(service.price, ccy)}` : ''}
                  </p>
                )}
                <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, margin: '12px 0 0' }}>{barber.name} will confirm shortly.</p>
                <button onClick={reset} style={{ ...GLASS_PILL_BTN, marginTop: 20 }}>Book another</button>
              </div>
            ) : (
              <>
                {/* ══ booking details — iPhone Settings-style grouped lists ══ */}
                <p style={SECTION_TITLE}>Booking Details</p>

                {/* group 1: service · date · time (tap a row to open it) */}
                <div style={IOS_GROUP}>
                  {services.length > 0 && (
                    <>
                      <IosRow icon="✂️" tint="#ff9f0a" label="Service" value={service ? service.name : 'Optional'} open={openRow === 'service'}
                        onClick={() => setOpenRow(openRow === 'service' ? null : 'service')} />
                      {openRow === 'service' && (
                        <div style={IOS_PANEL}>
                          {services.map((s, k) => {
                            const sel = service?.id === s.id
                            return (
                              <button key={s.id} onClick={() => { setService(sel ? null : s); setTime(''); setOpenRow(sel ? 'service' : 'date') }}
                                style={{ ...IOS_OPTION, borderTop: k ? IOS_SEPARATOR : 'none' }}>
                                <span style={{ flex: 1, minWidth: 0 }}>
                                  <span style={{ display: 'block', fontSize: 15 }}>{s.name}</span>
                                  <span style={{ display: 'block', fontSize: 12.5, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>
                                    {s.duration_min} min{firstVisit > 0 && s.price > 0 ? ` · first visit ${formatMoney(discounted(s.price), ccy)}` : ''}
                                  </span>
                                </span>
                                <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.85)' }}>{formatMoney(s.price, ccy)}</span>
                                <span style={{ width: 22, textAlign: 'right', color: '#0a84ff', fontSize: 17, fontWeight: 700 }}>{sel ? '✓' : ''}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                      <div style={IOS_SEPARATOR_LINE} />
                    </>
                  )}

                  <IosRow icon="📅" tint="#ff453a" label="Date" open={openRow === 'date'}
                    value={date ? date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }) : 'Choose'}
                    onClick={() => setOpenRow(openRow === 'date' ? null : 'date')} />
                  {openRow === 'date' && (
                    <div style={{ ...IOS_PANEL, padding: '12px 12px 14px' }}>
                      <div className="glass-scroll" style={{ display: 'flex', gap: 8, overflowX: 'auto' }}>
                        {days.map(d => {
                          const sel = date && toLocalKey(d) === toLocalKey(date)
                          return (
                            <button key={d.toISOString()} onClick={() => { setDate(d); setTime(''); setOpenRow('time') }}
                              style={{ ...(sel ? GLASS_SELECTED : GLASS_ROW), flexShrink: 0, width: 54, padding: '8px 0', borderRadius: 16, cursor: 'pointer', textAlign: 'center', color: sel ? '#111' : '#fff', fontFamily: 'inherit' }}>
                              <div style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', opacity: 0.75 }}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                              <div style={{ fontSize: 17, fontWeight: 700, marginTop: 2 }}>{d.getDate()}</div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  <div style={IOS_SEPARATOR_LINE} />
                  <IosRow icon="🕒" tint="#0a84ff" label="Time" open={openRow === 'time'} disabled={!date}
                    value={time || (date ? 'Choose' : 'Pick a date first')}
                    onClick={() => { if (date) setOpenRow(openRow === 'time' ? null : 'time') }} />
                  {openRow === 'time' && date && (
                    <div style={{ ...IOS_PANEL, padding: 12 }}>
                      {isClosed ? (
                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontSize: 14, padding: '10px 0', margin: 0 }}>Closed on this day — pick another date.</p>
                      ) : (
                        <div className="glass-scroll" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                          {slots.map(t => {
                            const taken = isTaken(t)
                            const sel = time === t
                            return (
                              <button key={t} disabled={taken} onClick={() => { setTime(t); setOpenRow(null) }}
                                style={{ ...(sel ? GLASS_SELECTED : GLASS_ROW), padding: '9px 0', borderRadius: 12, color: sel ? '#111' : '#fff', fontSize: 13.5, fontWeight: 600, cursor: taken ? 'not-allowed' : 'pointer', opacity: taken ? 0.32 : 1, textDecoration: taken ? 'line-through' : 'none', fontFamily: 'inherit' }}>
                                {t}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p style={IOS_FOOTNOTE}>Times shown in your local time. You pay in the shop — nothing is charged online.</p>

                {/* group 2: your details, iOS form rows */}
                {date && time && (
                  <>
                    <p style={IOS_HEADER}>Your details</p>
                    <div style={IOS_GROUP}>
                      <IosField icon="👤" tint="#30d158" label="Name" value={name} onChange={setName} placeholder="Required" />
                      <div style={IOS_SEPARATOR_LINE} />
                      <IosField icon="✉️" tint="#5e5ce6" label="Email" value={email} onChange={setEmail} placeholder="For confirmation" type="email" />
                      <div style={IOS_SEPARATOR_LINE} />
                      <IosField icon="📞" tint="#64d2ff" label="Phone" value={phone} onChange={setPhone} placeholder="Optional" type="tel" />
                    </div>
                    {firstVisit > 0 && (
                      <p style={IOS_FOOTNOTE}>🎁 First time here? Add your phone or email and {firstVisit}% is taken off automatically.</p>
                    )}

                    {/* group 3: payment details */}
                    {service && (
                      <>
                        <p style={IOS_HEADER}>Payment details</p>
                        <div style={IOS_GROUP}>
                          <div style={IOS_STATIC_ROW}><span>{service.name}</span><span style={{ color: 'rgba(255,255,255,0.8)' }}>{formatMoney(price, ccy)}</span></div>
                          {firstVisit > 0 && price > 0 && (
                            <>
                              <div style={IOS_SEPARATOR_LINE} />
                              <div style={{ ...IOS_STATIC_ROW, color: '#fbcfe8' }}><span>🎁 First visit −{firstVisit}%</span><span>−{formatMoney(price - total, ccy)}</span></div>
                            </>
                          )}
                          <div style={IOS_SEPARATOR_LINE} />
                          <div style={{ ...IOS_STATIC_ROW, fontWeight: 700 }}><span>Total</span><span>{formatMoney(total, ccy)}</span></div>
                        </div>
                        {firstVisit > 0 && price > 0 && <p style={IOS_FOOTNOTE}>The discount applies if this is your first visit.</p>}
                      </>
                    )}
                  </>
                )}

                {error && <p style={{ color: '#fecaca', fontSize: 13, margin: '14px 0 0', textAlign: 'center', fontWeight: 600 }}>{error}</p>}
              </>
            )}
          </div>
        </div>

        {/* ══ white "Book" pill under the panel ══ */}
        {!done && date && time && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 16 }}>
            <button onClick={submit} disabled={submitting || !name}
              style={{ padding: '15px 34px', borderRadius: 999, background: '#ffffff', border: 'none', color: '#111', fontSize: 15.5, fontWeight: 700, fontFamily: 'inherit',
                boxShadow: '0 12px 30px rgba(0,0,0,0.25)', cursor: submitting || !name ? 'not-allowed' : 'pointer', opacity: submitting || !name ? 0.6 : 1 }}>
              {submitting ? 'Booking…' : service ? `Book · ${formatMoney(total, ccy)}` : 'Book'}
            </button>
          </div>
        )}
        {!done && date && time && !name && (
          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.75)', margin: '8px 0 0' }}>Enter your name to book</p>
        )}

        {/* footer */}
        <p style={{ textAlign: 'center', marginTop: 22, color: 'rgba(255,255,255,0.7)', fontSize: 12.5 }}>
          Powered by <Link href="/" style={{ color: '#fff', fontWeight: 700, textDecoration: 'none' }}>Snippr</Link>
        </p>
      </div>
    </GlassBackdrop>
  )
}

/* ───────── visionOS-style liquid glass ───────── */

// Full-screen photo behind everything (the barber's photo, or a default), softly blurred and
// tinted with the barber's colour, so the glass panel has something to refract.
function GlassBackdrop({ image, accent, children }: { image: string | null; accent: string; children: React.ReactNode }) {
  return (
    <div style={{ position: 'relative', minHeight: '100vh', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif', overflow: 'hidden', background: '#1a1a1c' }}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .glass-input::placeholder{color:rgba(255,255,255,0.6)}
        .glass-input:focus{border-color:rgba(255,255,255,0.6)!important;background:rgba(255,255,255,0.16)!important}
        .glass-scroll{scrollbar-width:none}
        .glass-scroll::-webkit-scrollbar{display:none}
      `}</style>
      <div aria-hidden style={{ position: 'fixed', inset: 0, zIndex: 0 }}>
        {image
          ? <img src={image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', transform: 'scale(1.12)', filter: 'blur(14px) saturate(1.15)' }} />
          : <div style={{ position: 'absolute', inset: 0, background: wallpaper(accent), filter: 'blur(40px) saturate(1.2)', transform: 'scale(1.2)' }} />}
        <div style={{ position: 'absolute', inset: 0, background: image ? `radial-gradient(circle at 20% 10%, ${accent}55 0%, transparent 55%), linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.35) 100%)` : 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.18) 100%)' }} />
      </div>
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  )
}

const GLASS_PANEL: React.CSSProperties = {
  background: 'linear-gradient(160deg, rgba(255,255,255,0.24) 0%, rgba(255,255,255,0.06) 100%), rgba(24,22,30,0.24)',
  backdropFilter: 'blur(40px) saturate(170%)',
  WebkitBackdropFilter: 'blur(40px) saturate(170%)',
  border: '1px solid rgba(255,255,255,0.28)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.40), inset 0 -1px 0 rgba(255,255,255,0.06), 0 30px 80px rgba(0,0,0,0.35)',
}
const GLASS_CHIP: React.CSSProperties = {
  background: 'rgba(255,255,255,0.18)',
  backdropFilter: 'blur(20px) saturate(170%)',
  WebkitBackdropFilter: 'blur(20px) saturate(170%)',
  border: '1px solid rgba(255,255,255,0.32)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35)',
  color: '#fff',
}
const GLASS_ROW: React.CSSProperties = {
  background: 'rgba(255,255,255,0.10)',
  border: '1px solid rgba(255,255,255,0.18)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14)',
}
const GLASS_SELECTED: React.CSSProperties = {
  background: '#ffffff',
  border: '1px solid #ffffff',
  boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
}
const GLASS_PILL_BTN: React.CSSProperties = {
  ...GLASS_CHIP, padding: '11px 22px', borderRadius: 999, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
}
// ── iPhone Settings-style grouped list ──
const IOS_GROUP: React.CSSProperties = {
  background: 'rgba(255,255,255,0.13)', border: '1px solid rgba(255,255,255,0.20)', borderRadius: 22, overflow: 'hidden',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.16)',
}
const IOS_SEPARATOR = '0.5px solid rgba(255,255,255,0.22)'
const IOS_SEPARATOR_LINE: React.CSSProperties = { height: 0, borderTop: IOS_SEPARATOR, marginLeft: 58 }
const IOS_PANEL: React.CSSProperties = { background: 'rgba(0,0,0,0.14)', borderTop: IOS_SEPARATOR }
const IOS_OPTION: React.CSSProperties = {
  width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px 11px 58px', background: 'transparent',
  border: 'none', color: '#fff', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
}
const IOS_STATIC_ROW: React.CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12, padding: '13px 16px', fontSize: 15, color: '#fff' }
const IOS_HEADER: React.CSSProperties = { fontSize: 12.5, fontWeight: 500, color: 'rgba(255,255,255,0.65)', textTransform: 'uppercase', letterSpacing: '0.04em', margin: '22px 16px 7px' }
const IOS_FOOTNOTE: React.CSSProperties = { fontSize: 12.5, color: 'rgba(255,255,255,0.65)', margin: '7px 16px 0', lineHeight: 1.45 }

// a tappable row: coloured icon square, label, value and a chevron that turns when open
function IosRow({ icon, tint, label, value, open, disabled, onClick }: { icon: string; tint: string; label: string; value: string; open: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', background: open ? 'rgba(255,255,255,0.08)' : 'transparent', border: 'none', color: '#fff', cursor: disabled ? 'default' : 'pointer', fontFamily: 'inherit', textAlign: 'left', opacity: disabled ? 0.6 : 1 }}>
      <span style={{ width: 30, height: 30, borderRadius: 8, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, flexShrink: 0, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}>{icon}</span>
      <span style={{ fontSize: 15.5 }}>{label}</span>
      <span style={{ marginLeft: 'auto', fontSize: 15, color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '55%' }}>{value}</span>
      <span style={{ fontSize: 20, lineHeight: 1, color: 'rgba(255,255,255,0.45)', transform: open ? 'rotate(90deg)' : 'none', transition: 'transform .2s' }}>›</span>
    </button>
  )
}

// an iOS form row: icon, label on the left, input on the right
function IosField({ icon, tint, label, value, onChange, placeholder, type = 'text' }: { icon: string; tint: string; label: string; value: string; onChange: (v: string) => void; placeholder: string; type?: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', color: '#fff', cursor: 'text' }}>
      <span style={{ width: 30, height: 30, borderRadius: 8, background: tint, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)' }}>{icon}</span>
      <span style={{ fontSize: 15.5, width: 64, flexShrink: 0 }}>{label}</span>
      <input className="glass-input" type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 15.5, textAlign: 'right', padding: '6px 0', fontFamily: 'inherit' }} />
    </label>
  )
}

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 15.5, fontWeight: 600, margin: '24px 4px 14px', paddingBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.22)', color: '#fff',
}

/* Clean monochrome social icons (Linktree style) */
function SocialIcon({ platform, size = 26 }: { platform: string; size?: number }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor' }
  switch (platform) {
    case 'instagram':
      return <svg {...p}><path d="M12 2.2c3.2 0 3.6 0 4.9.07 1.2.06 1.8.25 2.2.42.55.21.95.47 1.37.89.42.42.68.82.89 1.37.17.4.36 1 .42 2.2.06 1.3.07 1.7.07 4.9s0 3.6-.07 4.9c-.06 1.2-.25 1.8-.42 2.2-.21.55-.47.95-.89 1.37-.42.42-.82.68-1.37.89-.4.17-1 .36-2.2.42-1.3.06-1.7.07-4.9.07s-3.6 0-4.9-.07c-1.2-.06-1.8-.25-2.2-.42-.55-.21-.95-.47-1.37-.89-.42-.42-.68-.82-.89-1.37-.17-.4-.36-1-.42-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.07-4.9c.06-1.2.25-1.8.42-2.2.21-.55.47-.95.89-1.37.42-.42.82-.68 1.37-.89.4-.17 1-.36 2.2-.42C8.4 2.2 8.8 2.2 12 2.2zm0 1.8c-3.1 0-3.5 0-4.7.07-.9.04-1.4.2-1.7.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.12.3-.28.8-.32 1.7C3.46 8.5 3.45 8.9 3.45 12s0 3.5.07 4.7c.04.9.2 1.4.32 1.7.17.43.37.74.69 1.06.32.32.63.52 1.06.69.3.12.8.28 1.7.32 1.2.06 1.6.07 4.7.07s3.5 0 4.7-.07c.9-.04 1.4-.2 1.7-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.12-.3.28-.8.32-1.7.06-1.2.07-1.6.07-4.7s0-3.5-.07-4.7c-.04-.9-.2-1.4-.32-1.7a2.9 2.9 0 0 0-.69-1.06 2.9 2.9 0 0 0-1.06-.69c-.3-.12-.8-.28-1.7-.32C15.5 4 15.1 4 12 4zm0 3.06A4.94 4.94 0 1 1 12 17a4.94 4.94 0 0 1 0-9.88zm0 1.8a3.14 3.14 0 1 0 0 6.28 3.14 3.14 0 0 0 0-6.28zM17.1 6.9a1.15 1.15 0 1 1 0 2.3 1.15 1.15 0 0 1 0-2.3z"/></svg>
    case 'youtube':
      return <svg {...p}><path d="M23 7.5a3 3 0 0 0-2.1-2.1C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.5 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.5a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5a3 3 0 0 0 2.1-2.1 31 31 0 0 0 .5-4.5 31 31 0 0 0-.5-4.5zM9.75 15.5v-7l6 3.5z"/></svg>
    case 'tiktok':
      return <svg {...p}><path d="M16.6 5.8a4.3 4.3 0 0 1-1-2.8h-3.1v12.4a2.5 2.5 0 1 1-2.5-2.5c.26 0 .5.04.74.11V9.85a5.6 5.6 0 0 0-.74-.05A5.6 5.6 0 1 0 15.6 15.4V9.1a7.3 7.3 0 0 0 4.3 1.38V7.4a4.3 4.3 0 0 1-3.3-1.6z"/></svg>
    case 'x':
      return <svg {...p}><path d="M18.2 2.3h3.3l-7.2 8.2 8.5 11.2h-6.7l-5.2-6.8-6 6.8H1.6l7.7-8.8L1.1 2.3h6.8l4.7 6.2zm-1.2 17.6h1.8L7.1 4.1H5.2z"/></svg>
    case 'facebook':
      return <svg {...p}><path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.45 2.9h-2.35v7A10 10 0 0 0 22 12z"/></svg>
    case 'whatsapp':
      return <svg {...p}><path d="M12 2a10 10 0 0 0-8.5 15.2L2 22l4.9-1.5A10 10 0 1 0 12 2zm0 1.8a8.2 8.2 0 0 1 6.9 12.6l-.2.3.6 2.2-2.3-.6-.3.2A8.2 8.2 0 1 1 12 3.8zm-3 3.5c-.2 0-.5.07-.7.36-.24.3-.9.9-.9 2.2s.92 2.55 1.05 2.73c.13.18 1.8 2.9 4.45 3.94 2.2.86 2.65.7 3.13.65.48-.04 1.55-.63 1.77-1.25.22-.62.22-1.15.15-1.26-.07-.1-.26-.18-.55-.32-.29-.15-1.7-.84-1.96-.94-.26-.1-.46-.15-.65.15-.18.29-.74.93-.9 1.12-.17.18-.33.2-.62.07-.29-.15-1.22-.45-2.32-1.43-.86-.77-1.44-1.7-1.6-2-.16-.29-.02-.45.13-.6.13-.13.29-.34.44-.5.14-.18.19-.3.29-.5.1-.2.05-.36-.02-.5-.07-.15-.65-1.58-.9-2.16-.23-.56-.47-.49-.65-.5z"/></svg>
    case 'website':
      return <svg {...p}><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 6h-2.95a15.7 15.7 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.9 8zM12 4.1c.83 1.2 1.48 2.53 1.9 3.9h-3.8c.42-1.37 1.07-2.7 1.9-3.9zM4.26 14a8.2 8.2 0 0 1 0-4h3.38a16.5 16.5 0 0 0 0 4zm.84 2h2.95c.34 1.27.8 2.46 1.38 3.56A8.03 8.03 0 0 1 5.1 16zm2.95-8H5.1a8.03 8.03 0 0 1 4.33-3.56A15.7 15.7 0 0 0 8.05 8zM12 19.9c-.83-1.2-1.48-2.53-1.9-3.9h3.8c-.42 1.37-1.07 2.7-1.9 3.9zm2.36-5.9H9.64a14.7 14.7 0 0 1 0-4h4.72a14.7 14.7 0 0 1 0 4zm.2 5.56c.59-1.1 1.05-2.29 1.39-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14a16.5 16.5 0 0 0 0-4h3.38a8.2 8.2 0 0 1 0 4z"/></svg>
    default:
      return <svg {...p}><path d="M10.6 13.4a3 3 0 0 0 4.5.3l2-2a3 3 0 0 0-4.2-4.2l-1.1 1.1m-.4 3.2a3 3 0 0 0-4.5-.3l-2 2a3 3 0 0 0 4.2 4.2l1.1-1.1" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  }
}
