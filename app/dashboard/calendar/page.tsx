'use client'

import { useState, useEffect } from 'react'
import { FIRST_VISIT_DISCOUNT } from '@/lib/features'
import { motion, AnimatePresence } from 'framer-motion'
import { useCurrency } from '@/lib/currency'
import { supabase } from '@/lib/supabase'

interface Appointment {
  id: string
  customer_name: string
  customer_phone: string | null
  start_time: string
  end_time: string
  status: string
  services: { name: string; price: number } | null
  discount_percent?: number // first-visit discount applied by the database
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
type View = 'Day' | 'Week' | 'Month'

// TickTick-style soft event colors keyed by status
const EV: Record<string, { bg: string; text: string; bar: string }> = {
  confirmed: { bg: '#e9f6ec', text: '#1c6b3f', bar: '#34a853' },
  pending:   { bg: '#fff4e0', text: '#9a6516', bar: '#f5a623' },
  cancelled: { bg: '#fde8e6', text: '#a8302a', bar: '#e5484d' },
  completed: { bg: '#eeeeec', text: '#5b5a57', bar: '#9b9a97' },
}
const evColor = (s: string) => EV[s] ?? EV.completed

const hhmm = (iso: string) => {
  const d = new Date(iso)
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Time-grid range (barber hours) for Day / Week views
const RANGE_START = 7
const RANGE_END = 21
const HOUR_H = 56
const HOURS = Array.from({ length: RANGE_END - RANGE_START + 1 }, (_, i) => RANGE_START + i)
const hourLabel = (h: number) => `${((h + 11) % 12) + 1} ${h < 12 ? 'AM' : 'PM'}`

const toKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export default function CalendarPage() {
  const { format } = useCurrency()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [barberId, setBarberId] = useState<string | null>(null)
  const now = new Date()

  // Load this barber's real appointments
  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: barber } = await supabase.from('barbers').select('id').eq('user_id', user.id).single()
      if (!barber || !active) return
      setBarberId(barber.id)
      const { data } = await supabase.from('appointments').select('*, services(name, price)').eq('barber_id', barber.id)
      if (active && data) setAppointments(data as Appointment[])
    })()
    return () => { active = false }
  }, [])

  // Live: a booking from the public link appears on the calendar instantly
  useEffect(() => {
    if (!barberId) return
    const channel = supabase
      .channel(`cal-appts-${barberId}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `barber_id=eq.${barberId}` },
        async () => {
          const { data } = await supabase.from('appointments').select('*, services(name, price)').eq('barber_id', barberId)
          setAppointments((data as Appointment[]) || [])
        })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [barberId])

  const [view, setView] = useState<View>('Month')
  const [anchor, setAnchor] = useState(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
  const [selectedDay, setSelectedDay] = useState<Date | null>(new Date(now.getFullYear(), now.getMonth(), now.getDate()))
  const [showModal, setShowModal] = useState(false)

  const y = anchor.getFullYear()
  const m = anchor.getMonth()

  // ── appointments indexed by day ──
  const apptsByDay: Record<string, Appointment[]> = {}
  appointments.forEach(a => { (apptsByDay[toKey(new Date(a.start_time))] ??= []).push(a) })
  Object.values(apptsByDay).forEach(list => list.sort((a, b) => a.start_time.localeCompare(b.start_time)))

  const todayKey = toKey(now)
  const selectedKey = selectedDay ? toKey(selectedDay) : null
  const selectedAppts = selectedKey ? (apptsByDay[selectedKey] ?? []) : []

  // ── navigation (unit depends on the active view) ──
  const navigate = (dir: number) => {
    const d = new Date(anchor)
    if (view === 'Month') d.setMonth(d.getMonth() + dir)
    else if (view === 'Week') d.setDate(d.getDate() + 7 * dir)
    else d.setDate(d.getDate() + dir)
    setAnchor(d)
  }
  const goToday = () => {
    const t = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    setAnchor(t); setSelectedDay(t)
  }

  // ── week days for the anchor's week (Sun → Sat) ──
  const weekStart = new Date(anchor); weekStart.setDate(anchor.getDate() - anchor.getDay())
  const weekDays = Array.from({ length: 7 }, (_, i) => { const d = new Date(weekStart); d.setDate(weekStart.getDate() + i); return d })

  // ── month grid (fixed 6 rows) ──
  const startOffset = new Date(y, m, 1).getDay()
  const daysInMonth = new Date(y, m + 1, 0).getDate()
  const monthCells = Array.from({ length: 42 }, (_, i) => {
    const n = i - startOffset + 1
    const date = new Date(y, m, n)
    return { date, inMonth: n >= 1 && n <= daysInMonth }
  })

  // ── title per view ──
  const weekLabel = () => {
    const a = weekDays[0], b = weekDays[6]
    const m1 = MONTHS[a.getMonth()].slice(0, 3), m2 = MONTHS[b.getMonth()].slice(0, 3)
    return a.getMonth() === b.getMonth()
      ? `${m1} ${a.getDate()} – ${b.getDate()}, ${b.getFullYear()}`
      : `${m1} ${a.getDate()} – ${m2} ${b.getDate()}, ${b.getFullYear()}`
  }
  const title = view === 'Month' ? `${MONTHS[m]} ${y}`
    : view === 'Week' ? weekLabel()
    : anchor.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })

  const selectDay = (date: Date, inMonth: boolean) => {
    if (!inMonth) setAnchor(date)
    setSelectedDay(toKey(date) === selectedKey ? null : date)
  }

  // Positioned block for Day / Week views
  const blockStyle = (a: Appointment) => {
    const s = new Date(a.start_time), e = new Date(a.end_time)
    const startH = s.getHours() + s.getMinutes() / 60
    const endH = e.getHours() + e.getMinutes() / 60
    const top = Math.max((startH - RANGE_START) * HOUR_H, 0)
    const height = Math.max((endH - startH) * HOUR_H - 3, 22)
    return { top, height }
  }

  const navBtn = 'flex h-8 w-8 items-center justify-center rounded-lg text-[#787774] transition hover:bg-[#f1f1ef]'

  // ── reusable day-column for the time grid ──
  const renderTimeColumn = (date: Date) => {
    const dayAppts = apptsByDay[toKey(date)] ?? []
    return (
      <div key={toKey(date)} className="relative flex-1 border-l border-[#ededec]">
        {HOURS.map(h => <div key={h} className="border-b border-[#f1f1ef]" style={{ height: HOUR_H }} />)}
        {dayAppts.map(a => {
          const c = evColor(a.status)
          const { top, height } = blockStyle(a)
          return (
            <div
              key={a.id}
              className="absolute left-1 right-1 overflow-hidden rounded-lg px-2 py-1 text-[11px]"
              style={{ top, height, background: c.bg, color: c.text, borderLeft: `3px solid ${c.bar}` }}
            >
              <p className="truncate font-semibold">{a.customer_name}</p>
              <p className="truncate opacity-80">{hhmm(a.start_time)}–{hhmm(a.end_time)} · {a.services?.name}</p>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col bg-white" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>

      {/* ── TOOLBAR ── */}
      <div className="flex items-center justify-between border-b border-[#ededec] px-6 py-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[19px] font-bold tracking-tight text-[#37352f]">{title}</h2>
          <button onClick={goToday} className="rounded-lg border border-[#e9e9e7] px-3 py-1.5 text-[14px] font-medium text-[#37352f] transition hover:bg-[#f7f7f5]">
            Today
          </button>
          <div className="flex items-center">
            <button onClick={() => navigate(-1)} className={navBtn} aria-label="Previous">‹</button>
            <button onClick={() => navigate(1)} className={navBtn} aria-label="Next">›</button>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex rounded-lg bg-[#f1f1ef] p-0.5">
            {(['Day', 'Week', 'Month'] as View[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-md px-3 py-1 text-[14px] font-medium transition ${
                  v === view ? 'bg-white text-[#37352f] shadow-sm' : 'text-[#9b9a97] hover:text-[#37352f]'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)} className="rounded-lg px-3.5 py-1.5 text-[14px] font-semibold text-white transition" style={{ background: 'var(--accent)' }}>
            + New
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* ═══ MONTH ═══ */}
          {view === 'Month' && (
            <>
              <div className="grid grid-cols-7 border-b border-[#ededec]">
                {WEEKDAYS.map(d => (
                  <div key={d} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#9b9a97]">{d}</div>
                ))}
              </div>
              <div className="grid flex-1 grid-cols-7 grid-rows-6 border-l border-[#ededec]">
                {monthCells.map(({ date, inMonth }, idx) => {
                  const key = toKey(date)
                  const dayAppts = apptsByDay[key] ?? []
                  const isToday = key === todayKey
                  const isSelected = key === selectedKey
                  return (
                    <button
                      key={idx}
                      onClick={() => selectDay(date, inMonth)}
                      className={`group relative flex flex-col gap-1 overflow-hidden border-b border-r border-[#ededec] p-1.5 text-left transition ${
                        isSelected ? 'bg-[#f7f7f5]' : 'hover:bg-[#fafafa]'
                      } ${!inMonth ? 'bg-[#fcfcfb]' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`flex h-[22px] min-w-[22px] items-center justify-center rounded-full px-1 text-[12.5px] font-semibold ${
                            isToday ? 'text-white' : !inMonth ? 'text-[#c4c3c0]' : 'text-[#37352f]'
                          }`}
                          style={isToday ? { background: 'var(--accent)' } : undefined}
                        >
                          {date.getDate()}
                        </span>
                      </div>
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        {dayAppts.slice(0, 3).map(a => {
                          const c = evColor(a.status)
                          return (
                            <div key={a.id} className="flex items-center gap-1 truncate rounded-[5px] py-[3px] pl-1.5 pr-1 text-[11px] font-medium" style={{ background: c.bg, color: c.text, borderLeft: `2.5px solid ${c.bar}` }}>
                              <span className="opacity-70">{hhmm(a.start_time)}</span>
                              <span className="truncate">{a.customer_name}</span>
                            </div>
                          )
                        })}
                        {dayAppts.length > 3 && <span className="pl-1.5 text-[11px] font-medium text-[#9b9a97]">+{dayAppts.length - 3} more</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* ═══ WEEK ═══ */}
          {view === 'Week' && (
            <>
              {/* day headers */}
              <div className="flex border-b border-[#ededec]">
                <div className="w-16 flex-shrink-0" />
                {weekDays.map(d => {
                  const isToday = toKey(d) === todayKey
                  return (
                    <div key={toKey(d)} className="flex flex-1 flex-col items-center gap-0.5 border-l border-[#ededec] py-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9b9a97]">{WEEKDAYS[d.getDay()]}</span>
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-[15px] font-semibold ${isToday ? 'text-white' : 'text-[#37352f]'}`}
                        style={isToday ? { background: 'var(--accent)' } : undefined}
                      >
                        {d.getDate()}
                      </span>
                    </div>
                  )
                })}
              </div>
              {/* scrollable time grid */}
              <div className="flex flex-1 overflow-y-auto">
                <div className="w-16 flex-shrink-0">
                  {HOURS.map(h => (
                    <div key={h} className="relative" style={{ height: HOUR_H }}>
                      <span className="absolute -top-2 right-2 text-[11px] text-[#9b9a97]">{hourLabel(h)}</span>
                    </div>
                  ))}
                </div>
                {weekDays.map(renderTimeColumn)}
              </div>
            </>
          )}

          {/* ═══ DAY ═══ */}
          {view === 'Day' && (
            <div className="flex flex-1 overflow-y-auto">
              <div className="w-16 flex-shrink-0">
                {HOURS.map(h => (
                  <div key={h} className="relative" style={{ height: HOUR_H }}>
                    <span className="absolute -top-2 right-2 text-[11px] text-[#9b9a97]">{hourLabel(h)}</span>
                  </div>
                ))}
              </div>
              {renderTimeColumn(anchor)}
            </div>
          )}
        </div>

        {/* DETAIL PANEL (month view) */}
        <AnimatePresence>
          {view === 'Month' && selectedDay && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 300, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col overflow-hidden border-l border-[#ededec] bg-[#fbfbfa]"
            >
              <div className="flex w-[300px] flex-1 flex-col p-5">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-[22px] font-bold leading-none text-[#37352f]">{selectedDay.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h3>
                    <p className="mt-1.5 text-[14px] text-[#9b9a97]">{selectedDay.toLocaleDateString('en-US', { weekday: 'long' })}</p>
                  </div>
                  <button onClick={() => setSelectedDay(null)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9b9a97] transition hover:bg-[#f1f1ef]">✕</button>
                </div>

                {selectedAppts.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                    <svg className="h-12 w-12 text-[#e3e2e0]" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
                    <p className="text-[14px] text-[#9b9a97]">No appointments</p>
                  </div>
                ) : (
                  <div className="flex-1 space-y-2.5 overflow-y-auto">
                    {selectedAppts.map((a, i) => {
                      const c = evColor(a.status)
                      return (
                        <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-2xl border border-[#e9e9e7] bg-white p-3.5" style={{ borderLeft: `3px solid ${c.bar}` }}>
                          <div className="flex items-center justify-between">
                            <h4 className="truncate text-[15px] font-semibold text-[#37352f]">{a.customer_name}</h4>
                            <span className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold capitalize" style={{ background: c.bg, color: c.text }}>{a.status}</span>
                          </div>
                          <p className="mt-0.5 text-[12.5px] text-[#787774]">{a.services?.name}</p>
                          <div className="mt-2.5 flex flex-col gap-1 text-[13px] text-[#9b9a97]">
                            <span>🕑 {hhmm(a.start_time)} – {hhmm(a.end_time)}</span>
                            {a.customer_phone && <span>📱 {a.customer_phone}</span>}
                            {a.services && <span>💰 {format(Math.round(a.services.price * (100 - (FIRST_VISIT_DISCOUNT ? (a.discount_percent ?? 0) : 0))) / 100)}{FIRST_VISIT_DISCOUNT && a.discount_percent ? ` (🎁 −${a.discount_percent}%)` : ''}</span>}
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                )}

                <button onClick={() => setShowModal(true)} className="mt-4 w-full rounded-xl py-2.5 text-[14px] font-semibold text-white transition" style={{ background: 'var(--accent)' }}>
                  + Add appointment
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
            <motion.div initial={{ scale: 0.97, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.97, opacity: 0 }} onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-2xl border border-[#e9e9e7] bg-white p-7 shadow-2xl">
              <h3 className="mb-6 text-xl font-bold text-[#37352f]">New appointment</h3>
              <div className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#37352f]">Date</label>
                  <input type="date" className="w-full rounded-xl border border-[#e9e9e7] bg-[#f7f7f5] px-3 py-2 text-[#37352f] focus:border-[#37352f] focus:outline-none" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#37352f]">Service</label>
                  <div className="flex flex-wrap gap-2">
                    {['Haircut', 'Trim', 'Styling', 'Other'].map(type => (
                      <button key={type} className="rounded-xl border border-[#e9e9e7] bg-[#f7f7f5] px-3 py-1.5 text-sm text-[#37352f] transition hover:bg-[#f1f1ef]">{type}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#37352f]">Time</label>
                  <input type="time" className="w-full rounded-xl border border-[#e9e9e7] bg-[#f7f7f5] px-3 py-2 text-[#37352f] focus:border-[#37352f] focus:outline-none" />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#37352f]">Notes</label>
                  <textarea placeholder="Add notes..." className="h-24 w-full resize-none rounded-xl border border-[#e9e9e7] bg-[#f7f7f5] px-3 py-2 text-[#37352f] placeholder-[#9b9a97] focus:border-[#37352f] focus:outline-none" />
                </div>
              </div>
              <div className="mt-8 flex gap-3">
                <button onClick={() => setShowModal(false)} className="flex-1 rounded-xl border border-[#e9e9e7] bg-white px-4 py-2 font-medium text-[#37352f] transition hover:bg-[#f7f7f5]">Cancel</button>
                <button onClick={() => setShowModal(false)} className="flex-1 rounded-xl px-4 py-2 font-medium text-white transition" style={{ background: 'var(--accent)' }}>Save</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
