'use client'

// All appointments in one table: search, date range, filters, sorting, paging and export.

import { Fragment, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowDownUp, Check, ChevronDown, ChevronLeft, ChevronRight, ListChecks, Search, SlidersHorizontal, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'
import { FIRST_VISIT_DISCOUNT } from '@/lib/features'
import { isBlock } from '@/lib/blocks'
import { buildXlsx, downloadBlob, type Cell } from '@/lib/xlsx'
import { kindForStatus, notifyStatus } from '@/lib/notify-status'

interface Appt {
  id: string; customer_name: string; customer_phone: string | null; customer_email: string | null
  start_time: string; end_time: string; status: string; created_at: string
  service_id: string | null; services: { name: string; price: number } | null; discount_percent?: number
}
type Range = 'all' | 'upcoming' | 'today' | 'mtd' | 'last7' | 'last30' | 'thisMonth' | 'lastMonth'
type Sort = 'startDesc' | 'startAsc' | 'createdDesc' | 'createdAsc'
type Status = 'pending' | 'confirmed' | 'completed' | 'cancelled'
const STATUSES: Status[] = ['pending', 'confirmed', 'completed', 'cancelled']
const PAGE = 20

const COPY = {
  en: {
    title: 'Appointments', sub: 'View, filter and export the appointments booked with you.', export: 'Export', search: 'Search by ref or client',
    ranges: { all: 'All dates', upcoming: 'Upcoming', today: 'Today', mtd: 'Month to date', last7: 'Last 7 days', last30: 'Last 30 days', thisMonth: 'This month', lastMonth: 'Last month' },
    sorts: { startDesc: 'Scheduled date (newest first)', startAsc: 'Scheduled date (oldest first)', createdDesc: 'Created (newest first)', createdAsc: 'Created (oldest first)' },
    filters: 'Filters', status: 'Status', service: 'Service', anyService: 'All services', clear: 'Clear all', apply: 'Show results',
    cols: { ref: 'Ref #', client: 'Client', service: 'Service', created: 'Created', scheduled: 'Scheduled', duration: 'Duration', price: 'Price', status: 'Status' },
    st: { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' } as Record<string, string>,
    showing: (a: number, b: number, n: number) => `${a}–${b} of ${n} results`, none: 'No appointments match', noneSub: 'Try another date range or clear the filters.',
    h: 'h', min: 'min', confirm: 'Confirm', complete: 'Mark completed', cancel: 'Cancel', phone: 'Phone', email: 'Email',
  },
  tr: {
    title: 'Randevular', sub: 'Müşterilerin tarafından alınan randevuları görüntüle, filtrele ve dışa aktar.', export: 'Dışa aktar', search: 'Referans veya müşteri ile ara',
    ranges: { all: 'Tüm tarihler', upcoming: 'Gelecek', today: 'Bugün', mtd: 'Ay başından bugüne kadar', last7: 'Son 7 gün', last30: 'Son 30 gün', thisMonth: 'Bu ay', lastMonth: 'Geçen ay' },
    sorts: { startDesc: 'Planlanan tarih (yeniden eskiye)', startAsc: 'Planlanan tarih (eskiden yeniye)', createdDesc: 'Oluşturulma (yeniden eskiye)', createdAsc: 'Oluşturulma (eskiden yeniye)' },
    filters: 'Filtreler', status: 'Durum', service: 'Hizmet', anyService: 'Tüm hizmetler', clear: 'Temizle', apply: 'Sonuçları göster',
    cols: { ref: 'Ref #', client: 'Müşteri', service: 'Hizmet', created: 'Oluşturulma', scheduled: 'Planlanan tarih', duration: 'Süre', price: 'Fiyat', status: 'Durum' },
    st: { pending: 'Beklemede', confirmed: 'Onaylandı', completed: 'Tamamlandı', cancelled: 'İptal' } as Record<string, string>,
    showing: (a: number, b: number, n: number) => `${a} - ${b} / ${n} sonuç görüntüleniyor`, none: 'Eşleşen randevu yok', noneSub: 'Başka bir tarih aralığı dene ya da filtreleri temizle.',
    h: 'sa', min: 'dk', confirm: 'Onayla', complete: 'Tamamlandı yap', cancel: 'İptal et', phone: 'Telefon', email: 'E-posta',
  },
}

const PILL: Record<string, { bg: string; fg: string }> = {
  pending: { bg: '#fff4e0', fg: '#9a6516' }, confirmed: { bg: '#e6f0ff', fg: '#1d5bd6' },
  completed: { bg: '#e9f6ec', fg: '#1c6b3f' }, cancelled: { bg: '#fde8e6', fg: '#a8302a' },
}
const ref = (id: string) => `#${id.replace(/-/g, '').slice(0, 8).toUpperCase()}`
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())

function rangeOf(r: Range): [Date | null, Date | null] {
  const now = new Date(), today = dayStart(now), tomorrow = new Date(today.getTime() + 86400000)
  switch (r) {
    case 'upcoming': return [now, null]
    case 'today': return [today, tomorrow]
    case 'mtd': return [new Date(now.getFullYear(), now.getMonth(), 1), tomorrow]
    case 'last7': return [new Date(today.getTime() - 6 * 86400000), tomorrow]
    case 'last30': return [new Date(today.getTime() - 29 * 86400000), tomorrow]
    case 'thisMonth': return [new Date(now.getFullYear(), now.getMonth(), 1), new Date(now.getFullYear(), now.getMonth() + 1, 1)]
    case 'lastMonth': return [new Date(now.getFullYear(), now.getMonth() - 1, 1), new Date(now.getFullYear(), now.getMonth(), 1)]
    default: return [null, null]
  }
}

function useOutside(open: boolean, close: () => void) {
  const r = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (r.current && !r.current.contains(e.target as Node)) close() }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') close() }
    document.addEventListener('mousedown', onDown); document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open, close])
  return r
}

const pop = { initial: { opacity: 0, y: -6, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -4 }, transition: { type: 'spring' as const, stiffness: 520, damping: 34 } }
const popCls = 'absolute z-40 mt-2 rounded-[18px] border border-black/[0.06] bg-white/95 p-1.5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.28)] backdrop-blur-xl'
const pillBtn = 'flex items-center gap-2 rounded-full border border-[#e3e2e0] bg-white px-4 py-2 text-[14px] font-semibold text-[#37352f] transition hover:bg-[#f7f7f5]'

function Menu<T extends string>({ value, options, onChange, icon, align = 'left' }: { value: T; options: Record<T, string>; onChange: (v: T) => void; icon?: React.ReactNode; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false)
  const r = useOutside(open, () => setOpen(false))
  return (
    <div ref={r} className="relative">
      <button onClick={() => setOpen(o => !o)} className={pillBtn}>
        <span className="max-w-[240px] truncate">{options[value]}</span>
        {icon ?? <ChevronDown size={15} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div {...pop} className={`${popCls} min-w-[250px] ${align === 'right' ? 'right-0' : 'left-0'}`}>
            {(Object.keys(options) as T[]).map(k => (
              <button key={k} onClick={() => { onChange(k); setOpen(false) }} className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[14.5px] text-[#37352f] hover:bg-[#f4f4f2]">
                {options[k]} {k === value && <Check size={15} strokeWidth={2.6} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function FileBadge({ label }: { label: string }) {
  return (
    <span className="relative flex h-[22px] w-[18px] flex-shrink-0 items-end justify-center rounded-[3px] border-[1.5px] border-[#787774] pb-[1px]">
      <span className="absolute -top-[1.5px] -right-[1.5px] h-[7px] w-[7px] rounded-bl-[2px] border-b-[1.5px] border-l-[1.5px] border-[#787774] bg-white" />
      <span className="text-[6.5px] leading-none font-extrabold tracking-tight text-[#37352f]">{label}</span>
    </span>
  )
}

export default function AppointmentsPage() {
  const { lang } = useLang()
  const lng = lang === 'tr' ? 'tr' : 'en'
  const t = COPY[lng]
  const locale = lng === 'tr' ? 'tr-TR' : 'en-US'
  const { format } = useCurrency()

  const [appts, setAppts] = useState<Appt[]>([])
  const [loading, setLoading] = useState(true)
  const [barberId, setBarberId] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [range, setRange] = useState<Range>('all')
  const [sort, setSort] = useState<Sort>('startDesc')
  const [statuses, setStatuses] = useState<Status[]>([])
  const [service, setService] = useState('')
  const [page, setPage] = useState(0)
  const [openId, setOpenId] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)
  const [filterOpen, setFilterOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const filterRef = useOutside(filterOpen, () => setFilterOpen(false))
  const exportRef = useOutside(exportOpen, () => setExportOpen(false))

  const fetchAll = async (bid: string) => {
    const { data } = await supabase.from('appointments').select('*, services(name, price)').eq('barber_id', bid)
    return ((data as Appt[]) || []).filter(a => !isBlock(a))
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: b } = await supabase.from('barbers').select('id').eq('user_id', user.id).single()
      if (!b || !active) return
      setBarberId(b.id)
      const list = await fetchAll(b.id)
      if (active) { setAppts(list); setLoading(false) }
    })()
    return () => { active = false }
  }, [])

  // live: new bookings appear right away
  useEffect(() => {
    if (!barberId) return
    const ch = supabase.channel(`appts-list-${barberId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'appointments', filter: `barber_id=eq.${barberId}` }, async () => setAppts(await fetchAll(barberId)))
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [barberId])

  /* ── filtering ── */
  const net = (a: Appt) => { const p = a.services?.price ?? 0; return FIRST_VISIT_DISCOUNT ? (p * (100 - (a.discount_percent ?? 0))) / 100 : p }
  const [from, to] = rangeOf(range)
  const needle = q.trim().toLowerCase().replace(/^#/, '')
  const filtered = appts.filter(a => {
    const s = new Date(a.start_time)
    if (from && s < from) return false
    if (to && s >= to) return false
    if (statuses.length && !statuses.includes(a.status as Status)) return false
    if (service && a.service_id !== service) return false
    if (needle && !a.customer_name.toLowerCase().includes(needle) && !a.id.replace(/-/g, '').toLowerCase().startsWith(needle) && !(a.customer_phone ?? '').includes(needle)) return false
    return true
  }).sort((a, b) => {
    const k = sort.startsWith('start') ? 'start_time' : 'created_at'
    const d = a[k].localeCompare(b[k])
    return sort.endsWith('Asc') ? d : -d
  })
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE))
  const cur = Math.min(page, pages - 1)
  const rows = filtered.slice(cur * PAGE, cur * PAGE + PAGE)

  const serviceOptions = [...new Map(appts.filter(a => a.service_id && a.services).map(a => [a.service_id!, a.services!.name])).entries()]
  const filterCount = statuses.length + (service ? 1 : 0)

  const dur = (a: Appt) => {
    const m = Math.round((new Date(a.end_time).getTime() - new Date(a.start_time).getTime()) / 60000)
    return m >= 60 ? `${Math.floor(m / 60)} ${t.h}${m % 60 ? ` ${m % 60} ${t.min}` : ''}` : `${m} ${t.min}`
  }
  const dt = (iso: string) => new Date(iso).toLocaleString(locale, { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  async function setStatus(a: Appt, status: Status) {
    setBusyId(a.id)
    await supabase.from('appointments').update({ status }).eq('id', a.id)
    setAppts(list => list.map(x => (x.id === a.id ? { ...x, status } : x)))
    setBusyId(null)
    const kind = kindForStatus(status)
    if (kind) notifyStatus(a.id, kind)
  }

  /* ── export ── */
  const table = (): Cell[][] => [
    [t.cols.ref, t.cols.client, t.phone, t.email, t.cols.service, t.cols.created, t.cols.scheduled, t.cols.duration, t.cols.price, t.cols.status],
    ...filtered.map(a => [ref(a.id), a.customer_name, a.customer_phone ?? '', a.customer_email ?? '', a.services?.name ?? '', dt(a.created_at), dt(a.start_time), dur(a), Math.round(net(a) * 100) / 100, t.st[a.status] ?? a.status]),
  ]
  const fileBase = `snippr-${lng === 'tr' ? 'randevular' : 'appointments'}-${new Date().toISOString().slice(0, 10)}`
  const exportCsv = () => {
    const esc = (v: Cell) => `"${String(v ?? '').replace(/"/g, '""')}"`
    downloadBlob(new Blob(['﻿' + table().map(r => r.map(esc).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }), `${fileBase}.csv`)
    setExportOpen(false)
  }
  const exportXlsx = () => {
    downloadBlob(buildXlsx([{ name: t.title, rows: table(), widths: [12, 22, 16, 24, 20, 20, 20, 12, 10, 14] }]), `${fileBase}.xlsx`)
    setExportOpen(false)
  }

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      <div className="mx-auto max-w-[1200px] px-6 pt-10 pb-20 sm:px-10">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-[30px] font-bold tracking-[-0.02em] text-[#37352f]">{t.title}</h1>
            <p className="mt-1 text-[14.5px] text-[#9b9a97]">{t.sub}</p>
          </div>
          <div ref={exportRef} className="relative print:hidden">
            <button onClick={() => setExportOpen(o => !o)} className={pillBtn}>
              {t.export} <ChevronDown size={15} style={{ transform: exportOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
            <AnimatePresence>
              {exportOpen && (
                <motion.div {...pop} className={`${popCls} right-0 w-[180px]`}>
                  {([['PDF', 'PDF', () => { setExportOpen(false); setTimeout(() => window.print(), 50) }], ['CSV', 'CSV', exportCsv], ['XLS', 'Excel', exportXlsx]] as [string, string, () => void][]).map(([b, l, fn]) => (
                    <button key={b} onClick={fn} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold text-[#37352f] hover:bg-[#f4f4f2]"><FileBadge label={b} /> {l}</button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* toolbar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex flex-wrap items-center gap-2">
            <label className="flex w-[260px] items-center gap-2 rounded-full border border-[#e3e2e0] bg-white px-3.5 py-2 focus-within:border-[#37352f]">
              <Search size={16} className="text-[#9b9a97]" />
              <input value={q} onChange={e => { setQ(e.target.value); setPage(0) }} placeholder={t.search} className="min-w-0 flex-1 bg-transparent text-[14px] text-[#37352f] outline-none placeholder:text-[#9b9a97]" />
              {q && <button onClick={() => setQ('')} aria-label="Clear"><X size={14} className="text-[#9b9a97]" /></button>}
            </label>
            <Menu value={range} options={t.ranges} onChange={v => { setRange(v); setPage(0) }} />
            <div ref={filterRef} className="relative">
              <button onClick={() => setFilterOpen(o => !o)} className={pillBtn}>
                <SlidersHorizontal size={15} /> {t.filters}
                {filterCount > 0 && <span className="rounded-full px-1.5 text-[12px] text-white" style={{ background: 'var(--accent)' }}>{filterCount}</span>}
              </button>
              <AnimatePresence>
                {filterOpen && (
                  <motion.div {...pop} className={`${popCls} left-0 w-[300px] p-4`}>
                    <p className="mb-2 text-[13px] font-semibold text-[#787774]">{t.status}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {STATUSES.map(s => {
                        const on = statuses.includes(s)
                        return (
                          <button key={s} onClick={() => { setStatuses(l => (on ? l.filter(x => x !== s) : [...l, s])); setPage(0) }}
                            className="rounded-full px-3 py-1.5 text-[13px] font-semibold transition" style={on ? { background: PILL[s].bg, color: PILL[s].fg, boxShadow: `inset 0 0 0 1.5px ${PILL[s].fg}` } : { background: '#f1f1ef', color: '#787774' }}>
                            {t.st[s]}
                          </button>
                        )
                      })}
                    </div>
                    <p className="mt-4 mb-2 text-[13px] font-semibold text-[#787774]">{t.service}</p>
                    <select value={service} onChange={e => { setService(e.target.value); setPage(0) }} className="w-full rounded-xl border border-[#e9e9e7] bg-[#f7f7f5] px-3 py-2 text-[14px] text-[#37352f] outline-none">
                      <option value="">{t.anyService}</option>
                      {serviceOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
                    </select>
                    <div className="mt-4 flex gap-2">
                      <button onClick={() => { setStatuses([]); setService(''); setPage(0) }} className="flex-1 rounded-full border border-[#e9e9e7] py-2 text-[13.5px] font-semibold text-[#37352f] hover:bg-[#f7f7f5]">{t.clear}</button>
                      <button onClick={() => setFilterOpen(false)} className="flex-1 rounded-full py-2 text-[13.5px] font-semibold text-white" style={{ background: 'var(--accent)' }}>{t.apply}</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
          <Menu value={sort} options={t.sorts} onChange={setSort} icon={<ArrowDownUp size={15} />} align="right" />
        </div>

        {/* table */}
        <div className="mt-4 overflow-hidden rounded-[20px] border border-[#ededec]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[920px] text-[14px] text-[#37352f]">
              <thead>
                <tr className="bg-[#fafaf9] text-left text-[12.5px] text-[#787774]">
                  {(['ref', 'client', 'service', 'created', 'scheduled', 'duration'] as const).map(c => <th key={c} className="px-4 py-3 font-semibold">{t.cols[c]}</th>)}
                  <th className="px-4 py-3 text-right font-semibold">{t.cols.price}</th>
                  <th className="px-4 py-3 font-semibold">{t.cols.status}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={8} className="py-16 text-center"><span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#e9e9e7] border-t-[#37352f]" /></td></tr>
                ) : rows.length === 0 ? (
                  <tr><td colSpan={8} className="py-16 text-center">
                    <ListChecks size={34} strokeWidth={1.5} className="mx-auto text-[#d3d2cf]" />
                    <p className="mt-3 text-[15px] font-semibold">{t.none}</p>
                    <p className="mt-1 text-[13.5px] text-[#9b9a97]">{t.noneSub}</p>
                  </td></tr>
                ) : rows.map(a => {
                  const pill = PILL[a.status] ?? PILL.completed
                  const open = openId === a.id
                  return (
                    <Fragment key={a.id}>
                      <tr onClick={() => setOpenId(open ? null : a.id)} className="cursor-pointer border-t border-[#f1f1ef] transition hover:bg-[#fafaf9]" style={{ background: open ? '#fafaf9' : undefined }}>
                        <td className="px-4 py-3 font-semibold whitespace-nowrap" style={{ color: 'var(--accent)' }}>{ref(a.id)}</td>
                        <td className="px-4 py-3 font-medium" style={{ color: 'var(--accent)' }}>{a.customer_name}</td>
                        <td className="px-4 py-3">{a.services?.name ?? '—'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-[#787774]">{dt(a.created_at)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">{dt(a.start_time)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-[#787774]">{dur(a)}</td>
                        <td className="px-4 py-3 text-right font-semibold tabular-nums">{format(net(a))}</td>
                        <td className="px-4 py-3"><span className="rounded-full px-2.5 py-1 text-[12px] font-semibold whitespace-nowrap" style={{ background: pill.bg, color: pill.fg }}>{t.st[a.status] ?? a.status}</span></td>
                      </tr>
                      {open && (
                        <tr className="bg-[#fafaf9] print:hidden">
                          <td colSpan={8} className="px-4 pb-4">
                            <div className="flex flex-wrap items-center gap-2 text-[13.5px]">
                              {a.customer_phone && <a href={`tel:${a.customer_phone}`} className="rounded-full bg-white px-3 py-1.5 font-medium ring-1 ring-[#ededec]">📱 {a.customer_phone}</a>}
                              {a.customer_email && <a href={`mailto:${a.customer_email}`} className="rounded-full bg-white px-3 py-1.5 font-medium ring-1 ring-[#ededec]">✉️ {a.customer_email}</a>}
                              <span className="flex-1" />
                              {a.status !== 'confirmed' && a.status !== 'completed' && <button disabled={busyId === a.id} onClick={() => setStatus(a, 'confirmed')} className="rounded-full px-3.5 py-1.5 font-semibold" style={{ background: PILL.confirmed.bg, color: PILL.confirmed.fg }}>{t.confirm}</button>}
                              {a.status !== 'completed' && <button disabled={busyId === a.id} onClick={() => setStatus(a, 'completed')} className="rounded-full px-3.5 py-1.5 font-semibold" style={{ background: PILL.completed.bg, color: PILL.completed.fg }}>{t.complete}</button>}
                              {a.status !== 'cancelled' && <button disabled={busyId === a.id} onClick={() => setStatus(a, 'cancelled')} className="rounded-full px-3.5 py-1.5 font-semibold" style={{ background: PILL.cancelled.bg, color: PILL.cancelled.fg }}>{t.cancel}</button>}
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* paging */}
        {!loading && filtered.length > 0 && (
          <div className="mt-4 flex items-center justify-center gap-3 text-[13.5px] text-[#787774] print:hidden">
            <button onClick={() => setPage(Math.max(0, cur - 1))} disabled={cur === 0} className="rounded-full p-1.5 hover:bg-[#f1f1ef] disabled:opacity-30" aria-label="Previous page"><ChevronLeft size={17} /></button>
            {t.showing(cur * PAGE + 1, Math.min(filtered.length, cur * PAGE + PAGE), filtered.length)}
            <button onClick={() => setPage(Math.min(pages - 1, cur + 1))} disabled={cur >= pages - 1} className="rounded-full p-1.5 hover:bg-[#f1f1ef] disabled:opacity-30" aria-label="Next page"><ChevronRight size={17} /></button>
          </div>
        )}
      </div>
    </div>
  )
}

