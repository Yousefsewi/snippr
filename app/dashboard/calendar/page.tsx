'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Ban, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Clock, Columns3, Columns4, Plane, Plus, Square, Trash2, CalendarPlus, RotateCw, Hourglass,
  type LucideIcon,
} from 'lucide-react'
import { FIRST_VISIT_DISCOUNT } from '@/lib/features'
import { useCurrency } from '@/lib/currency'
import { useLang } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'
import { DEFAULT_HOURS, type Day as HDay, type Hours } from '@/lib/hours'
import { blockName, blockReason, isBlock } from '@/lib/blocks'
import { addOwnAppointment, saveErrorKind } from '@/lib/owner-appointments'

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
interface Service { id: string; name: string; duration_min: number; price: number }

type View = 'day' | 'three' | 'week' | 'month'
type Sheet = null | 'appt' | 'block' | 'off'

const COPY = {
  en: {
    today: 'Today', views: { day: 'Day view', three: '3-day view', week: 'Week view', month: 'Month view' }, short: { day: 'Day', three: '3 days', week: 'Week', month: 'Month' },
    actions: 'Actions', addAppt: 'Add appointment', addBlock: 'Add blocked time', editHours: 'Edit working hours', addOff: 'Add time off',
    inWeeks: (n: number) => `In ${n} week${n > 1 ? 's' : ''}`, inMonths: (n: number) => `In ${n} months`, more: 'More', less: 'Less',
    add: 'Add', refresh: 'Refresh', addWait: 'Waitlist entry', addApptShort: 'Appointment', addBlockShort: 'Blocked time', addOffShort: 'Time off', cancel: 'Cancel', save: 'Save', saving: 'Saving…', delete: 'Delete',
    client: 'Client name', phone: 'Phone (optional)', service: 'Service', noService: 'No service', date: 'Date', time: 'Time', from: 'From', to: 'To', startDate: 'First day', endDate: 'Last day',
    reason: 'Reason (optional)', blockDefault: 'Closed', offDefault: 'Time off', reasonPh: 'e.g. Lunch break',
    blockHelp: 'Clients can’t book during this time.', offHelp: 'Your booking page is closed on these days.',
    noAppts: 'No appointments', more3: (n: number) => `+${n} more`, minutes: 'min',
    errName: 'Please enter the client’s name.', errTime: 'End time must be after the start time.', errPast: 'You can’t add something in the past.',
    errOverlap: 'There is already an appointment at this time.', errGeneric: 'Could not save. Please try again.', errDays: 'Pick a last day on or after the first day (max 60 days).',
    st: { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' } as Record<string, string>,
    closed: 'Closed', delBlock: 'Remove this blocked time?',
  },
  tr: {
    today: 'Bugün', views: { day: 'Günlük görünüm', three: '3 günlük görünüm', week: 'Haftalık görünüm', month: 'Aylık görünüm' }, short: { day: 'Gün', three: '3 gün', week: 'Hafta', month: 'Ay' },
    actions: 'İşlemler', addAppt: 'Randevu ekle', addBlock: 'Rezervasyona kapalı zaman ekle', editHours: 'Çalışma saatlerini düzenle', addOff: 'İzin ekle',
    inWeeks: (n: number) => `${n} hafta içinde`, inMonths: (n: number) => `${n} ay içinde`, more: 'Daha fazla', less: 'Daha az',
    add: 'Ekle', refresh: 'Yenile', addWait: 'Bekleme listesi', addApptShort: 'Randevu', addBlockShort: 'Rezervasyona kapalı zaman', addOffShort: 'İzin', cancel: 'Vazgeç', save: 'Kaydet', saving: 'Kaydediliyor…', delete: 'Sil',
    client: 'Müşteri adı', phone: 'Telefon (isteğe bağlı)', service: 'Hizmet', noService: 'Hizmet yok', date: 'Tarih', time: 'Saat', from: 'Başlangıç', to: 'Bitiş', startDate: 'İlk gün', endDate: 'Son gün',
    reason: 'Sebep (isteğe bağlı)', blockDefault: 'Kapalı', offDefault: 'İzin', reasonPh: 'örn. Öğle arası',
    blockHelp: 'Müşteriler bu saatlerde randevu alamaz.', offHelp: 'Bu günlerde randevu sayfan kapalı olur.',
    noAppts: 'Randevu yok', more3: (n: number) => `+${n} tane daha`, minutes: 'dk',
    errName: 'Lütfen müşterinin adını yaz.', errTime: 'Bitiş saati başlangıçtan sonra olmalı.', errPast: 'Geçmiş bir zamana ekleme yapılamaz.',
    errOverlap: 'Bu saatte zaten bir randevu var.', errGeneric: 'Kaydedilemedi. Lütfen tekrar dene.', errDays: 'Son gün, ilk günle aynı ya da sonra olmalı (en fazla 60 gün).',
    st: { pending: 'Beklemede', confirmed: 'Onaylandı', completed: 'Tamamlandı', cancelled: 'İptal' } as Record<string, string>,
    closed: 'Kapalı', delBlock: 'Bu kapalı zaman silinsin mi?',
  },
}

// soft event colors keyed by status
const EV: Record<string, { bg: string; text: string; bar: string }> = {
  confirmed: { bg: '#e9f6ec', text: '#1c6b3f', bar: '#34a853' },
  pending:   { bg: '#fff4e0', text: '#9a6516', bar: '#f5a623' },
  cancelled: { bg: '#fde8e6', text: '#a8302a', bar: '#e5484d' },
  completed: { bg: '#eeeeec', text: '#5b5a57', bar: '#9b9a97' },
}
const evColor = (s: string) => EV[s] ?? EV.completed
const BLOCK_BG = 'repeating-linear-gradient(135deg, #f1f1ef 0 6px, #e8e8e5 6px 12px)'

const hhmm = (iso: string | Date) => {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// time grid
const RANGE_START = 7
const RANGE_END = 22
const HOUR_H = 56
const HOURS = Array.from({ length: RANGE_END - RANGE_START }, (_, i) => RANGE_START + i)

const toKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const atDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const plusDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const mondayOf = (d: Date) => plusDays(d, -((d.getDay() + 6) % 7))
const DAY_KEYS: HDay[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']
const at = (dateKey: string, time: string) => new Date(`${dateKey}T${time}:00`)

/* close a popover when clicking outside it */
function useOutside(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) close() }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('mousedown', onDown); document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open, close])
  return ref
}

const pop = {
  initial: { opacity: 0, y: -6, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -4, scale: 0.98 },
  transition: { type: 'spring' as const, stiffness: 520, damping: 34 },
}
const popCls = 'absolute z-40 mt-2 rounded-[18px] border border-black/[0.06] bg-white/95 p-2 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.28)] backdrop-blur-xl'
const field = 'w-full rounded-xl border border-[#e9e9e7] bg-[#f7f7f5] px-3 py-2.5 text-[15px] text-[#37352f] outline-none focus:border-[#37352f]'

/* ── two-month date picker ── */
function MonthGrid({ month, selected, onPick, locale, weekdays }: { month: Date; selected: Date; onPick: (d: Date) => void; locale: string; weekdays: string[] }) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const offset = (first.getDay() + 6) % 7
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate()
  const todayKey = toKey(new Date())
  return (
    <div className="w-[252px]">
      <p className="mb-3 text-center text-[15px] font-semibold capitalize text-[#37352f]">{first.toLocaleDateString(locale, { month: 'long', year: 'numeric' })}</p>
      <div className="grid grid-cols-7 text-center text-[12px] font-medium text-[#9b9a97]">
        {weekdays.map(w => <span key={w} className="py-1.5">{w}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {Array.from({ length: offset }, (_, i) => <span key={`e${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = new Date(month.getFullYear(), month.getMonth(), i + 1)
          const k = toKey(d)
          const sel = k === toKey(selected)
          const today = k === todayKey
          return (
            <button key={k} onClick={() => onPick(d)}
              className="mx-auto flex h-9 w-9 items-center justify-center rounded-full text-[14px] font-medium transition hover:bg-[#f1f1ef]"
              style={sel ? { background: 'var(--accent)', color: '#fff' } : today ? { boxShadow: 'inset 0 0 0 1.5px var(--accent)', color: '#37352f' } : { color: '#37352f' }}>
              {i + 1}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ── iOS-style sheet ── */
function SheetShell({ title, icon: Icon, onClose, children, footer }: { title: string; icon: LucideIcon; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-0 sm:items-center sm:p-4">
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-t-[24px] bg-white p-6 shadow-2xl sm:rounded-[24px]">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-[12px] text-white" style={{ background: 'var(--accent)' }}><Icon size={19} /></span>
          <h3 className="text-[19px] font-bold text-[#37352f]">{title}</h3>
        </div>
        <div className="space-y-4">{children}</div>
        <div className="mt-7 flex gap-3">{footer}</div>
      </motion.div>
    </motion.div>
  )
}

const Label = ({ children }: { children: React.ReactNode }) => <span className="mb-1.5 block text-[13.5px] font-semibold text-[#37352f]">{children}</span>

export default function CalendarPage() {
  const router = useRouter()
  const { format } = useCurrency()
  const { lang } = useLang()
  const lng = lang === 'tr' ? 'tr' : 'en'
  const t = COPY[lng]
  const locale = lng === 'tr' ? 'tr-TR' : 'en-US'
  const weekdays = Array.from({ length: 7 }, (_, i) => plusDays(mondayOf(new Date(2026, 0, 5)), i).toLocaleDateString(locale, { weekday: 'short' }))

  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [hours, setHours] = useState<Hours>(DEFAULT_HOURS)
  const [barberId, setBarberId] = useState<string | null>(null)
  const now = new Date()

  const reload = async (bid: string) => {
    const { data } = await supabase.from('appointments').select('*, services(name, price)').eq('barber_id', bid)
    setAppointments((data as Appointment[]) || [])
  }

  // Load this barber's real appointments, services and hours
  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: barber } = await supabase.from('barbers').select('id, working_hours').eq('user_id', user.id).single()
      if (!barber || !active) return
      setBarberId(barber.id)
      if (barber.working_hours) setHours(barber.working_hours as Hours)
      const [{ data }, { data: svc }] = await Promise.all([
        supabase.from('appointments').select('*, services(name, price)').eq('barber_id', barber.id),
        supabase.from('services').select('id, name, duration_min, price').eq('barber_id', barber.id).order('name'),
      ])
      if (!active) return
      if (data) setAppointments(data as Appointment[])
      if (svc) setServices(svc as Service[])
    })()
    return () => { active = false }
  }, [])

  // Live: a booking from the public link appears on the calendar instantly
  useEffect(() => {
    if (!barberId) return
    const channel = supabase
      .channel(`cal-appts-${barberId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `barber_id=eq.${barberId}` }, () => { reload(barberId) })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [barberId])

  const [view, setView] = useState<View>('week')
  const [anchor, setAnchor] = useState(atDay(now))
  const [selectedDay, setSelectedDay] = useState<Date | null>(atDay(now))
  const [menuOpen, setMenuOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [spinning, setSpinning] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickerMonth, setPickerMonth] = useState(new Date(now.getFullYear(), now.getMonth(), 1))
  const [moreJumps, setMoreJumps] = useState(false)
  const menuRef = useOutside(menuOpen, () => setMenuOpen(false))
  const pickerRef = useOutside(pickerOpen, () => setPickerOpen(false))
  const addRef = useOutside(addOpen, () => setAddOpen(false))
  const refresh = async () => {
    if (!barberId) return
    setSpinning(true)
    await reload(barberId)
    setTimeout(() => setSpinning(false), 400)
  }

  // sheets (add appointment / blocked time / time off)
  const [sheet, setSheet] = useState<Sheet>(null)
  const [fName, setFName] = useState('')
  const [fPhone, setFPhone] = useState('')
  const [fService, setFService] = useState('')
  const [fDate, setFDate] = useState(toKey(now))
  const [fDate2, setFDate2] = useState(toKey(now))
  const [fStart, setFStart] = useState('10:00')
  const [fEnd, setFEnd] = useState('11:00')
  const [fReason, setFReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const openSheet = (s: Exclude<Sheet, null>, day?: Date) => {
    const d = toKey(day ?? selectedDay ?? anchor)
    setFName(''); setFPhone(''); setFReason(''); setErr('')
    setFService(services[0]?.id ?? '')
    setFDate(d); setFDate2(d)
    const next = new Date(); next.setMinutes(0, 0, 0); next.setHours(Math.min(Math.max(next.getHours() + 1, 9), 20))
    setFStart(hhmm(next)); setFEnd(hhmm(new Date(next.getTime() + 60 * 60000)))
    setMenuOpen(false); setAddOpen(false); setSheet(s)
  }

  const y = anchor.getFullYear()
  const m = anchor.getMonth()

  // appointments indexed by day
  const apptsByDay: Record<string, Appointment[]> = {}
  appointments.forEach(a => { (apptsByDay[toKey(new Date(a.start_time))] ??= []).push(a) })
  Object.values(apptsByDay).forEach(list => list.sort((a, b) => a.start_time.localeCompare(b.start_time)))

  const todayKey = toKey(now)
  const selectedKey = selectedDay ? toKey(selectedDay) : null
  const selectedAppts = selectedKey ? (apptsByDay[selectedKey] ?? []) : []

  // navigation (unit depends on the active view)
  const step = view === 'day' ? 1 : view === 'three' ? 3 : 7
  const navigate = (dir: number) => {
    if (view === 'month') setAnchor(new Date(y, m + dir, 1))
    else setAnchor(plusDays(anchor, step * dir))
  }
  const jumpTo = (d: Date) => {
    const day = atDay(d)
    setAnchor(day); setSelectedDay(day); setPickerOpen(false)
    setPickerMonth(new Date(day.getFullYear(), day.getMonth(), 1))
  }

  // columns for the time grid
  const columns = view === 'day' ? [anchor]
    : view === 'three' ? [0, 1, 2].map(i => plusDays(anchor, i))
    : Array.from({ length: 7 }, (_, i) => plusDays(mondayOf(anchor), i))

  // month grid (6 rows, Monday first)
  const gridStart = mondayOf(new Date(y, m, 1))
  const monthCells = Array.from({ length: 42 }, (_, i) => { const date = plusDays(gridStart, i); return { date, inMonth: date.getMonth() === m } })

  const fmtShort = (d: Date) => d.toLocaleDateString(locale, { day: 'numeric', month: 'short' })
  const title = view === 'month'
    ? new Date(y, m, 1).toLocaleDateString(locale, { month: 'long', year: 'numeric' })
    : view === 'day'
      ? anchor.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
      : `${fmtShort(columns[0])} – ${fmtShort(columns[columns.length - 1])}`

  const selectDay = (date: Date, inMonth: boolean) => {
    if (!inMonth) setAnchor(new Date(date.getFullYear(), date.getMonth(), 1))
    setSelectedDay(toKey(date) === selectedKey ? null : date)
  }

  // positioned block for the time grid
  const blockStyle = (a: Appointment) => {
    const s = new Date(a.start_time), e = new Date(a.end_time)
    const startH = s.getHours() + s.getMinutes() / 60
    const endH = e.getHours() + e.getMinutes() / 60
    const top = Math.max((startH - RANGE_START) * HOUR_H, 0)
    const height = Math.max((Math.min(endH, RANGE_END) - Math.max(startH, RANGE_START)) * HOUR_H - 3, 22)
    return { top, height }
  }

  /* ── saving ── */
  const insertRow = (start: Date, end: Date, name: string, phone: string | null, serviceId: string | null) =>
    addOwnAppointment({ barberId: barberId!, start, end, name, phone, serviceId })
  const explain = (e: { code?: string; message?: string }) => ({ overlap: t.errOverlap, past: t.errPast, generic: t.errGeneric })[saveErrorKind(e)]

  async function save() {
    if (!barberId) return
    setErr('')
    if (sheet === 'appt') {
      if (!fName.trim()) return setErr(t.errName)
      const svc = services.find(s => s.id === fService)
      const start = at(fDate, fStart)
      const end = new Date(start.getTime() + (svc?.duration_min ?? 30) * 60000)
      if (start.getTime() < Date.now() - 5 * 60000) return setErr(t.errPast)
      setSaving(true)
      const e = await insertRow(start, end, fName.trim().slice(0, 100), fPhone.trim() || null, svc?.id ?? null)
      setSaving(false)
      if (e) return setErr(explain(e))
    }
    if (sheet === 'block') {
      const start = at(fDate, fStart), end = at(fDate, fEnd)
      if (end <= start) return setErr(t.errTime)
      if (start.getTime() < Date.now() - 5 * 60000) return setErr(t.errPast)
      setSaving(true)
      // the database allows at most 12 hours per row
      let e = null
      for (let s = start; s < end && !e; s = new Date(s.getTime() + 12 * 3600000)) {
        e = await insertRow(s, new Date(Math.min(end.getTime(), s.getTime() + 12 * 3600000)), blockName(fReason || t.blockDefault), null, null)
      }
      setSaving(false)
      if (e) return setErr(explain(e))
    }
    if (sheet === 'off') {
      const first = at(fDate, '00:00'), last = at(fDate2, '00:00')
      const days = Math.round((last.getTime() - first.getTime()) / 86400000)
      if (days < 0 || days > 60) return setErr(t.errDays)
      setSaving(true)
      let e = null
      for (let i = 0; i <= days && !e; i++) {
        const d = plusDays(first, i)
        const h = hours[DAY_KEYS[d.getDay()]]
        if (!h?.open) continue
        let s = at(toKey(d), h.start)
        const end = at(toKey(d), h.end)
        if (s.getTime() < Date.now()) s = new Date(Math.ceil(Date.now() / 300000) * 300000) // today: from now on
        while (s < end && !e) {
          const stop = new Date(Math.min(end.getTime(), s.getTime() + 12 * 3600000))
          e = await insertRow(s, stop, blockName(fReason || t.offDefault), null, null)
          s = stop
        }
      }
      setSaving(false)
      if (e) return setErr(explain(e))
    }
    setSheet(null)
    reload(barberId)
  }

  async function removeBlock(a: Appointment) {
    if (!barberId || !window.confirm(t.delBlock)) return
    await supabase.from('appointments').delete().eq('id', a.id)
    reload(barberId)
  }

  /* ── time grid column ── */
  const renderTimeColumn = (date: Date) => {
    const dayAppts = (apptsByDay[toKey(date)] ?? []).filter(a => a.status !== 'cancelled' || !isBlock(a))
    const h = hours[DAY_KEYS[date.getDay()]]
    return (
      <div key={toKey(date)} className="relative min-w-0 flex-1 border-l border-[#ededec]"
        style={!h?.open ? { background: 'repeating-linear-gradient(135deg, transparent 0 8px, rgba(0,0,0,0.025) 8px 16px)' } : undefined}>
        {HOURS.map(hr => <div key={hr} className="border-b border-[#f1f1ef]" style={{ height: HOUR_H }} />)}
        {toKey(date) === todayKey && now.getHours() >= RANGE_START && now.getHours() < RANGE_END && (
          <div className="pointer-events-none absolute right-0 left-0 z-10 flex items-center" style={{ top: (now.getHours() + now.getMinutes() / 60 - RANGE_START) * HOUR_H }}>
            <span className="-ml-1 h-2 w-2 rounded-full bg-[#e5484d]" /><span className="h-px flex-1 bg-[#e5484d]" />
          </div>
        )}
        {dayAppts.map(a => {
          const { top, height } = blockStyle(a)
          if (isBlock(a)) {
            return (
              <div key={a.id} className="group absolute right-1 left-1 overflow-hidden rounded-lg px-2 py-1 text-[11px] text-[#5b5a57]" style={{ top, height, background: BLOCK_BG }}>
                <p className="flex items-center gap-1 truncate font-semibold"><Ban size={11} /> {blockReason(a) || t.closed}</p>
                <p className="truncate opacity-80">{hhmm(a.start_time)}–{hhmm(a.end_time)}</p>
                <button onClick={() => removeBlock(a)} aria-label={t.delete}
                  className="absolute top-1 right-1 hidden rounded-md bg-white/90 p-1 text-[#a8302a] shadow-sm group-hover:block"><Trash2 size={12} /></button>
              </div>
            )
          }
          const c = evColor(a.status)
          return (
            <div key={a.id} className="absolute right-1 left-1 overflow-hidden rounded-lg px-2 py-1 text-[11px]"
              style={{ top, height, background: c.bg, color: c.text, borderLeft: `3px solid ${c.bar}` }}>
              <p className="truncate font-semibold">{a.customer_name}</p>
              <p className="truncate opacity-80">{hhmm(a.start_time)}–{hhmm(a.end_time)}{a.services?.name ? ` · ${a.services.name}` : ''}</p>
            </div>
          )
        })}
      </div>
    )
  }

  const navBtn = 'flex h-9 w-9 items-center justify-center text-[#787774] transition hover:bg-[#f1f1ef]'
  const VIEW_ICONS: Record<View, LucideIcon> = { day: Square, three: Columns3, week: Columns4, month: CalendarDays }
  const ViewIcon = VIEW_ICONS[view]
  const jumps = moreJumps ? [6, 8, 12, 26] : [1, 2, 3, 4, 5]

  return (
    <div className="flex h-screen flex-col bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>

      {/* ── TOOLBAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#ededec] px-6 py-3">
        <div className="flex items-center gap-2.5">
          <button onClick={() => jumpTo(now)} className="rounded-full border border-[#e9e9e7] px-4 py-2 text-[14px] font-semibold text-[#37352f] transition hover:bg-[#f7f7f5]">{t.today}</button>

          {/* ‹ date › with the date picker */}
          <div ref={pickerRef} className="relative">
            <div className="flex items-center overflow-hidden rounded-full border border-[#e9e9e7]">
              <button onClick={() => navigate(-1)} className={navBtn} aria-label="Previous"><ChevronLeft size={17} /></button>
              <button onClick={() => { setPickerMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1)); setPickerOpen(o => !o) }}
                className="min-w-[150px] border-x border-[#e9e9e7] px-4 py-2 text-[14px] font-semibold capitalize text-[#37352f] transition hover:bg-[#f7f7f5]">
                {title}
              </button>
              <button onClick={() => navigate(1)} className={navBtn} aria-label="Next"><ChevronRight size={17} /></button>
            </div>
            <AnimatePresence>
              {pickerOpen && (
                <motion.div {...pop} className={`${popCls} left-0 p-5`} style={{ transformOrigin: 'top left' }}>
                  <div className="relative flex gap-8">
                    <button onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() - 1, 1))} className="absolute top-0 left-0 rounded-full p-1 text-[#787774] hover:bg-[#f1f1ef]" aria-label="Previous month"><ChevronLeft size={18} /></button>
                    <button onClick={() => setPickerMonth(new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1))} className="absolute top-0 right-0 rounded-full p-1 text-[#787774] hover:bg-[#f1f1ef]" aria-label="Next month"><ChevronRight size={18} /></button>
                    <MonthGrid month={pickerMonth} selected={anchor} onPick={jumpTo} locale={locale} weekdays={weekdays} />
                    <div className="hidden md:block">
                      <MonthGrid month={new Date(pickerMonth.getFullYear(), pickerMonth.getMonth() + 1, 1)} selected={anchor} onPick={jumpTo} locale={locale} weekdays={weekdays} />
                    </div>
                  </div>
                  <div className="mt-4 flex max-w-[540px] flex-wrap gap-2 border-t border-[#f1f1ef] pt-4">
                    {jumps.map(w => (
                      <button key={w} onClick={() => jumpTo(plusDays(atDay(now), w * 7))}
                        className="rounded-full border border-[#e9e9e7] px-3.5 py-1.5 text-[13px] font-medium text-[#37352f] transition hover:bg-[#f7f7f5]">
                        {w === 26 ? t.inMonths(6) : t.inWeeks(w)}
                      </button>
                    ))}
                    <button onClick={() => setMoreJumps(v => !v)} className="flex items-center gap-1 rounded-full border border-[#e9e9e7] px-3.5 py-1.5 text-[13px] font-medium text-[#37352f] transition hover:bg-[#f7f7f5]">
                      {moreJumps ? t.less : t.more} <ChevronDown size={14} style={{ transform: moreJumps ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* view + actions menu */}
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenuOpen(o => !o)} className="flex items-center gap-2 rounded-full border border-[#e9e9e7] px-4 py-2 text-[14px] font-semibold text-[#37352f] transition hover:bg-[#f7f7f5]">
              <ViewIcon size={16} /> {t.short[view]} <ChevronDown size={15} style={{ transform: menuOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div {...pop} className={`${popCls} right-0 w-[300px]`} style={{ transformOrigin: 'top right' }}>
                  {(['day', 'three', 'week', 'month'] as View[]).map(v => {
                    const Icon = VIEW_ICONS[v]
                    return (
                      <button key={v} onClick={() => { setView(v); setMenuOpen(false) }}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium text-[#37352f] transition hover:bg-[#f4f4f2]">
                        <Icon size={18} className="text-[#787774]" />
                        <span className="flex-1">{t.views[v]}</span>
                        {v === view && <span className="h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} />}
                      </button>
                    )
                  })}
                  <div className="mx-3 my-2 h-px bg-[#ededec]" />
                  <p className="px-3 pt-1 pb-1 text-[13px] font-bold text-[#37352f]">{t.actions}</p>
                  {([
                    [t.addAppt, CalendarPlus, () => openSheet('appt')],
                    [t.addBlock, Ban, () => openSheet('block')],
                    [t.addOff, Plane, () => openSheet('off')],
                    [t.editHours, Clock, () => router.push('/dashboard/profile/edit')],
                  ] as [string, LucideIcon, () => void][]).map(([label, Icon, fn]) => (
                    <button key={label} onClick={fn} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] text-[#37352f] transition hover:bg-[#f4f4f2]">
                      <Icon size={17} className="text-[#787774]" /> {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={refresh} aria-label={t.refresh} title={t.refresh}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e9e9e7] text-[#37352f] transition hover:bg-[#f7f7f5]">
            <motion.span animate={{ rotate: spinning ? 360 : 0 }} transition={{ duration: spinning ? 0.6 : 0, ease: 'easeInOut' }} className="flex"><RotateCw size={16} /></motion.span>
          </button>
          <div ref={addRef} className="relative">
            <button onClick={() => setAddOpen(o => !o)} className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[14px] font-semibold text-white transition hover:brightness-95" style={{ background: 'var(--accent)' }}>
              <Plus size={16} strokeWidth={2.6} /> {t.add} <ChevronDown size={15} style={{ transform: addOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
            <AnimatePresence>
              {addOpen && (
                <motion.div {...pop} className={`${popCls} right-0 w-[290px]`} style={{ transformOrigin: 'top right' }}>
                  {([
                    [t.addApptShort, CalendarPlus, () => openSheet('appt')],
                    [t.addBlockShort, Ban, () => openSheet('block')],
                    [t.addOffShort, Plane, () => openSheet('off')],
                    [t.addWait, Hourglass, () => router.push('/dashboard/waitlist')],
                  ] as [string, LucideIcon, () => void][]).map(([label, Icon, fn]) => (
                    <button key={label} onClick={fn} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] text-[#37352f] transition hover:bg-[#f4f4f2]">
                      <Icon size={17} className="text-[#787774]" /> {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex flex-1 flex-col overflow-hidden">

          {/* ═══ MONTH ═══ */}
          {view === 'month' && (
            <>
              <div className="grid grid-cols-7 border-b border-[#ededec]">
                {weekdays.map(d => <div key={d} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-[#9b9a97]">{d}</div>)}
              </div>
              <div className="grid flex-1 grid-cols-7 grid-rows-6 border-l border-[#ededec]">
                {monthCells.map(({ date, inMonth }, idx) => {
                  const key = toKey(date)
                  const dayAppts = apptsByDay[key] ?? []
                  const isToday = key === todayKey
                  const isSelected = key === selectedKey
                  return (
                    <button key={idx} onClick={() => selectDay(date, inMonth)}
                      className={`group relative flex flex-col gap-1 overflow-hidden border-r border-b border-[#ededec] p-1.5 text-left transition ${isSelected ? 'bg-[#f7f7f5]' : 'hover:bg-[#fafafa]'} ${!inMonth ? 'bg-[#fcfcfb]' : ''}`}>
                      <span className={`flex h-[22px] min-w-[22px] items-center justify-center self-start rounded-full px-1 text-[12.5px] font-semibold ${isToday ? 'text-white' : !inMonth ? 'text-[#c4c3c0]' : 'text-[#37352f]'}`}
                        style={isToday ? { background: 'var(--accent)' } : undefined}>
                        {date.getDate()}
                      </span>
                      <div className="flex flex-col gap-0.5 overflow-hidden">
                        {dayAppts.slice(0, 3).map(a => {
                          const blk = isBlock(a)
                          const c = evColor(a.status)
                          return (
                            <div key={a.id} className="flex items-center gap-1 truncate rounded-[5px] py-[3px] pr-1 pl-1.5 text-[11px] font-medium"
                              style={blk ? { background: BLOCK_BG, color: '#5b5a57' } : { background: c.bg, color: c.text, borderLeft: `2.5px solid ${c.bar}` }}>
                              <span className="opacity-70">{hhmm(a.start_time)}</span>
                              <span className="truncate">{blk ? (blockReason(a) || t.closed) : a.customer_name}</span>
                            </div>
                          )
                        })}
                        {dayAppts.length > 3 && <span className="pl-1.5 text-[11px] font-medium text-[#9b9a97]">{t.more3(dayAppts.length - 3)}</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          {/* ═══ DAY / 3 DAYS / WEEK ═══ */}
          {view !== 'month' && (
            <>
              <div className="flex border-b border-[#ededec]">
                <div className="w-16 flex-shrink-0" />
                {columns.map(d => {
                  const isToday = toKey(d) === todayKey
                  return (
                    <button key={toKey(d)} onClick={() => { setAnchor(d); setView('day') }} className="flex min-w-0 flex-1 flex-col items-center gap-0.5 border-l border-[#ededec] py-2 transition hover:bg-[#fafafa]">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-[#9b9a97]">{d.toLocaleDateString(locale, { weekday: 'short' })}</span>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full text-[15px] font-semibold ${isToday ? 'text-white' : 'text-[#37352f]'}`}
                        style={isToday ? { background: 'var(--accent)' } : undefined}>
                        {d.getDate()}
                      </span>
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-1 overflow-y-auto pt-2">
                <div className="w-16 flex-shrink-0">
                  {HOURS.map(h => (
                    <div key={h} className="relative" style={{ height: HOUR_H }}>
                      <span className="absolute -top-2 right-2 text-[11px] text-[#9b9a97] tabular-nums">{String(h).padStart(2, '0')}:00</span>
                    </div>
                  ))}
                </div>
                {columns.map(renderTimeColumn)}
              </div>
            </>
          )}
        </div>

        {/* DETAIL PANEL (month view) */}
        <AnimatePresence>
          {view === 'month' && selectedDay && (
            <motion.aside initial={{ width: 0, opacity: 0 }} animate={{ width: 300, opacity: 1 }} exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }} className="flex flex-col overflow-hidden border-l border-[#ededec] bg-[#fbfbfa]">
              <div className="flex w-[300px] flex-1 flex-col p-5">
                <div className="mb-5 flex items-start justify-between">
                  <div>
                    <h3 className="text-[22px] leading-none font-bold text-[#37352f]">{selectedDay.toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</h3>
                    <p className="mt-1.5 text-[14px] capitalize text-[#9b9a97]">{selectedDay.toLocaleDateString(locale, { weekday: 'long' })}</p>
                  </div>
                  <button onClick={() => setSelectedDay(null)} className="flex h-7 w-7 items-center justify-center rounded-lg text-[#9b9a97] transition hover:bg-[#f1f1ef]">✕</button>
                </div>

                {selectedAppts.length === 0 ? (
                  <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                    <CalendarDays size={44} strokeWidth={1.4} className="text-[#e3e2e0]" />
                    <p className="text-[14px] text-[#9b9a97]">{t.noAppts}</p>
                  </div>
                ) : (
                  <div className="flex-1 space-y-2.5 overflow-y-auto">
                    {selectedAppts.map((a, i) => {
                      if (isBlock(a)) {
                        return (
                          <div key={a.id} className="flex items-center justify-between rounded-2xl p-3.5 text-[#5b5a57]" style={{ background: BLOCK_BG }}>
                            <div>
                              <p className="flex items-center gap-1.5 text-[14px] font-semibold"><Ban size={14} /> {blockReason(a) || t.closed}</p>
                              <p className="mt-0.5 text-[12.5px]">{hhmm(a.start_time)} – {hhmm(a.end_time)}</p>
                            </div>
                            <button onClick={() => removeBlock(a)} className="rounded-lg bg-white/80 p-2 text-[#a8302a] hover:bg-white" aria-label={t.delete}><Trash2 size={15} /></button>
                          </div>
                        )
                      }
                      const c = evColor(a.status)
                      return (
                        <motion.div key={a.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                          className="rounded-2xl border border-[#e9e9e7] bg-white p-3.5" style={{ borderLeft: `3px solid ${c.bar}` }}>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="truncate text-[15px] font-semibold text-[#37352f]">{a.customer_name}</h4>
                            <span className="rounded-full px-2 py-0.5 text-[10.5px] font-semibold" style={{ background: c.bg, color: c.text }}>{t.st[a.status] ?? a.status}</span>
                          </div>
                          {a.services?.name && <p className="mt-0.5 text-[12.5px] text-[#787774]">{a.services.name}</p>}
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

                <button onClick={() => openSheet('appt', selectedDay)} className="mt-4 w-full rounded-xl py-2.5 text-[14px] font-semibold text-white transition" style={{ background: 'var(--accent)' }}>
                  + {t.addAppt}
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      {/* ── SHEETS ── */}
      <AnimatePresence>
        {sheet && (
          <SheetShell
            title={sheet === 'appt' ? t.addAppt : sheet === 'block' ? t.addBlock : t.addOff}
            icon={sheet === 'appt' ? CalendarPlus : sheet === 'block' ? Ban : Plane}
            onClose={() => setSheet(null)}
            footer={<>
              <button onClick={() => setSheet(null)} className="flex-1 rounded-full border border-[#e9e9e7] bg-white px-4 py-2.5 font-semibold text-[#37352f] transition hover:bg-[#f7f7f5]">{t.cancel}</button>
              <button onClick={save} disabled={saving} className="flex-1 rounded-full px-4 py-2.5 font-semibold text-white transition disabled:opacity-50" style={{ background: 'var(--accent)' }}>{saving ? t.saving : t.save}</button>
            </>}
          >
            {sheet === 'appt' && (
              <>
                <label className="block"><Label>{t.client}</Label><input autoFocus value={fName} onChange={e => setFName(e.target.value)} maxLength={100} className={field} /></label>
                <label className="block"><Label>{t.phone}</Label><input value={fPhone} onChange={e => setFPhone(e.target.value)} inputMode="tel" maxLength={40} className={field} /></label>
                <label className="block"><Label>{t.service}</Label>
                  <select value={fService} onChange={e => setFService(e.target.value)} className={field}>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} · {s.duration_min} {t.minutes} · {format(s.price)}</option>)}
                    <option value="">{t.noService} (30 {t.minutes})</option>
                  </select>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><Label>{t.date}</Label><input type="date" value={fDate} onChange={e => setFDate(e.target.value)} className={field} /></label>
                  <label className="block"><Label>{t.time}</Label><input type="time" value={fStart} onChange={e => setFStart(e.target.value)} className={field} /></label>
                </div>
              </>
            )}
            {sheet === 'block' && (
              <>
                <p className="-mt-2 text-[14px] text-[#787774]">{t.blockHelp}</p>
                <label className="block"><Label>{t.date}</Label><input type="date" value={fDate} onChange={e => setFDate(e.target.value)} className={field} /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><Label>{t.from}</Label><input type="time" value={fStart} onChange={e => setFStart(e.target.value)} className={field} /></label>
                  <label className="block"><Label>{t.to}</Label><input type="time" value={fEnd} onChange={e => setFEnd(e.target.value)} className={field} /></label>
                </div>
                <label className="block"><Label>{t.reason}</Label><input value={fReason} onChange={e => setFReason(e.target.value)} placeholder={t.reasonPh} maxLength={60} className={field} /></label>
              </>
            )}
            {sheet === 'off' && (
              <>
                <p className="-mt-2 text-[14px] text-[#787774]">{t.offHelp}</p>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><Label>{t.startDate}</Label><input type="date" value={fDate} onChange={e => { setFDate(e.target.value); if (e.target.value > fDate2) setFDate2(e.target.value) }} className={field} /></label>
                  <label className="block"><Label>{t.endDate}</Label><input type="date" value={fDate2} min={fDate} onChange={e => setFDate2(e.target.value)} className={field} /></label>
                </div>
                <label className="block"><Label>{t.reason}</Label><input value={fReason} onChange={e => setFReason(e.target.value)} placeholder={t.offDefault} maxLength={60} className={field} /></label>
              </>
            )}
            {err && <p className="text-[14px] font-medium text-[#e5484d]">{err}</p>}
          </SheetShell>
        )}
      </AnimatePresence>
    </div>
  )
}

