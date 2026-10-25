'use client'

// Daily sales: what was done and how it was paid, for one day.
// Built from the barber's appointments plus the payment the barber records at the till.

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, ChevronLeft, ChevronRight, Plus, Receipt, Wallet } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'
import { FIRST_VISIT_DISCOUNT } from '@/lib/features'
import { isBlock } from '@/lib/blocks'
import { addOwnAppointment, saveErrorKind } from '@/lib/owner-appointments'
import { buildXlsx, downloadBlob, type Cell } from '@/lib/xlsx'
import { notifyStatus } from '@/lib/notify-status'

type Method = 'cash' | 'card' | 'other'
type Period = 'day' | 'week' | 'month'
interface Appt {
  id: string; customer_name: string; start_time: string; end_time: string; status: string
  services: { name: string; price: number } | null; discount_percent?: number
  payment_method?: Method | null; tip_amount?: number | null
}
interface Service { id: string; name: string; duration_min: number; price: number }

const COPY = {
  en: {
    title: 'Daily sales', titles: { day: 'Daily sales', week: 'Weekly sales', month: 'Monthly sales' }, periods: { day: 'Daily', week: 'Weekly', month: 'Monthly' },
    sub: 'See sales and payments for a day, week or month, and export them.', export: 'Export', csv: 'CSV', excel: 'Excel', pdf: 'PDF', print: 'Print / PDF', newSale: 'New sale',
    byDay: 'By day', dayCol: 'Day', apptsCol: 'Appointments', salesCol: 'Sales', tillAll: 'Till — appointments', sheetSummary: 'Summary', sheetDays: 'Days', sheetAppts: 'Appointments',
    colDate: 'Date', colTime: 'Time', colClient: 'Client', colService: 'Service', colStatus: 'Status', colPrice: 'Price', colPay: 'Payment', colTip: 'Tip', period: 'Period',
    today: 'Today',
    items: 'Sales summary', itemType: 'Item', qty: 'Qty', gross: 'Total',
    rServices: 'Services (completed)', rDiscounts: 'First-visit discounts', rUpcoming: 'Booked, not finished yet', rCancelled: 'Cancelled', rTotal: 'Total sales',
    cash: 'Payment summary', method: 'Payment method', collected: 'Collected',
    m: { cash: 'Cash', card: 'Card', other: 'Other' } as Record<Method, string>, mNone: 'Not recorded yet', mTotal: 'Total collected', tips: 'Tips',
    till: 'Till — today’s appointments', tillHelp: 'Pick how each finished appointment was paid. This marks it as completed.', tip: 'Tip', noAppts: 'No appointments on this day.',
    st: { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' } as Record<string, string>,
    setupTitle: 'One step to turn on the till', setupBody: 'Run supabase/sales.sql in the Supabase SQL Editor once, then refresh. The summary already works without it.',
    sale: 'New sale', client: 'Client', walkIn: 'Walk-in client', service: 'Service', payBy: 'Paid by', cancel: 'Cancel', save: 'Save', saving: 'Saving…',
    errOverlap: 'Another appointment is running right now — finish or move it first.', errGeneric: 'Could not save. Please try again.', errService: 'Pick a service.',
  },
  tr: {
    title: 'Günlük satışlar', titles: { day: 'Günlük satışlar', week: 'Haftalık satışlar', month: 'Aylık satışlar' }, periods: { day: 'Günlük', week: 'Haftalık', month: 'Aylık' },
    sub: 'Günün, haftanın ya da ayın satışlarını ve ödemelerini gör, dışa aktar.', export: 'Dışa aktar', csv: 'CSV', excel: 'Excel', pdf: 'PDF', print: 'Yazdır / PDF', newSale: 'Yeni ekle',
    byDay: 'Günlere göre', dayCol: 'Gün', apptsCol: 'Randevu', salesCol: 'Satış', tillAll: 'Kasa — randevular', sheetSummary: 'Özet', sheetDays: 'Günler', sheetAppts: 'Randevular',
    colDate: 'Tarih', colTime: 'Saat', colClient: 'Müşteri', colService: 'Hizmet', colStatus: 'Durum', colPrice: 'Tutar', colPay: 'Ödeme', colTip: 'Bahşiş', period: 'Dönem',
    today: 'Bugün',
    items: 'İşlem özeti', itemType: 'Öğe türü', qty: 'Adet', gross: 'Brüt toplam',
    rServices: 'Hizmetler (tamamlanan)', rDiscounts: 'İlk ziyaret indirimleri', rUpcoming: 'Randevulu, henüz bitmedi', rCancelled: 'İptal edilenler', rTotal: 'Toplam satış',
    cash: 'Nakit hareketi özeti', method: 'Ödeme türü', collected: 'Toplanan',
    m: { cash: 'Nakit', card: 'Kart', other: 'Diğer' } as Record<Method, string>, mNone: 'Henüz girilmedi', mTotal: 'Toplanan ödemeler', tips: 'Bahşişler',
    till: 'Kasa — günün randevuları', tillHelp: 'Biten her randevunun nasıl ödendiğini seç. Seçince randevu “tamamlandı” olur.', tip: 'Bahşiş', noAppts: 'Bu gün randevu yok.',
    st: { pending: 'Beklemede', confirmed: 'Onaylandı', completed: 'Tamamlandı', cancelled: 'İptal' } as Record<string, string>,
    setupTitle: 'Kasayı açmak için bir adım kaldı', setupBody: 'supabase/sales.sql dosyasını Supabase SQL Editor’da bir kez çalıştır, sonra yenile. Özet tablolar şimdiden çalışıyor.',
    sale: 'Yeni satış', client: 'Müşteri', walkIn: 'Kapıdan gelen müşteri', service: 'Hizmet', payBy: 'Ödeme', cancel: 'Vazgeç', save: 'Kaydet', saving: 'Kaydediliyor…',
    errOverlap: 'Şu anda başka bir randevu var — önce onu bitir ya da kaydır.', errGeneric: 'Kaydedilemedi. Lütfen tekrar dene.', errService: 'Bir hizmet seç.',
  },
}

const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const hhmm = (iso: string) => new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
const METHODS: Method[] = ['cash', 'card', 'other']

// first day and day after the last day of the period containing d
function periodRange(d: Date, p: Period): [Date, Date] {
  if (p === 'day') return [new Date(d), new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)]
  if (p === 'week') { const mon = new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7)); return [mon, new Date(mon.getFullYear(), mon.getMonth(), mon.getDate() + 7)] }
  return [new Date(d.getFullYear(), d.getMonth(), 1), new Date(d.getFullYear(), d.getMonth() + 1, 1)]
}

// small file badge like the ones in Finder / Files
function FileBadge({ label }: { label: string }) {
  return (
    <span className="relative flex h-[22px] w-[18px] flex-shrink-0 items-end justify-center rounded-[3px] border-[1.5px] border-[#787774] pb-[1px]">
      <span className="absolute -top-[1.5px] -right-[1.5px] h-[7px] w-[7px] rounded-bl-[2px] border-b-[1.5px] border-l-[1.5px] border-[#787774] bg-white" />
      <span className="text-[6.5px] leading-none font-extrabold tracking-tight text-[#37352f]">{label}</span>
    </span>
  )
}
const field = 'w-full rounded-xl border border-[#e9e9e7] bg-[#f7f7f5] px-3 py-2.5 text-[15px] text-[#37352f] outline-none focus:border-[#37352f]'

function Table({ title, head, rows, foot }: { title: string; head: [string, string, string]; rows: [string, string | number, string, boolean?][]; foot: [string, string | number, string][] }) {
  return (
    <section className="overflow-hidden rounded-[20px] border border-[#ededec] bg-white">
      <h2 className="px-5 pt-5 pb-3 text-[16px] font-semibold text-[#37352f]">{title}</h2>
      <table className="w-full text-[14px] text-[#37352f]">
        <thead>
          <tr className="text-left text-[12.5px] text-[#9b9a97]">
            <th className="px-5 py-2.5 font-medium">{head[0]}</th>
            <th className="w-16 px-2 py-2.5 text-right font-medium">{head[1]}</th>
            <th className="w-28 px-5 py-2.5 text-right font-medium">{head[2]}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([a, b, c, muted]) => (
            <tr key={a} className="border-t border-[#f1f1ef]" style={{ color: muted ? '#9b9a97' : undefined }}>
              <td className="px-5 py-3">{a}</td><td className="px-2 py-3 text-right tabular-nums">{b}</td><td className="px-5 py-3 text-right tabular-nums">{c}</td>
            </tr>
          ))}
          {foot.map(([a, b, c]) => (
            <tr key={a} className="border-t border-[#e3e2e0] bg-[#fafaf9] font-semibold">
              <td className="px-5 py-3">{a}</td><td className="px-2 py-3 text-right tabular-nums">{b}</td><td className="px-5 py-3 text-right tabular-nums">{c}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default function SalesPage() {
  const { lang } = useLang()
  const lng = lang === 'tr' ? 'tr' : 'en'
  const t = COPY[lng]
  const locale = lng === 'tr' ? 'tr-TR' : 'en-US'
  const { format } = useCurrency()

  const [barberId, setBarberId] = useState<string | null>(null)
  const [day, setDay] = useState(() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d })
  const [period, setPeriod] = useState<Period>('day')
  const [rangeFrom, rangeTo] = periodRange(day, period)
  const rangeKey = `${dayKey(rangeFrom)}_${dayKey(rangeTo)}`
  const [appts, setAppts] = useState<Appt[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [tillReady, setTillReady] = useState(true)
  const [loading, setLoading] = useState(true)
  const [exportOpen, setExportOpen] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const [sheet, setSheet] = useState(false)
  const [sale, setSale] = useState({ name: '', service: '', method: 'cash' as Method, tip: '' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    if (!exportOpen) return
    const onDown = (e: MouseEvent) => { if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false) }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [exportOpen])

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: b } = await supabase.from('barbers').select('id').eq('user_id', user.id).single()
      if (!b || !active) return
      setBarberId(b.id)
      const [{ data: svc }, probe] = await Promise.all([
        supabase.from('services').select('id, name, duration_min, price').eq('barber_id', b.id).order('name'),
        supabase.from('appointments').select('payment_method').limit(1),
      ])
      if (!active) return
      setServices((svc as Service[]) || [])
      setTillReady(!probe.error)
    })()
    return () => { active = false }
  }, [])

  const fetchRange = async (bid: string, from: Date, to: Date) => {
    const { data } = await supabase.from('appointments').select('*, services(name, price)')
      .eq('barber_id', bid).gte('start_time', from.toISOString()).lt('start_time', to.toISOString()).order('start_time')
    return ((data as Appt[]) || []).filter(a => !isBlock(a))
  }
  const load = async (bid: string) => { setAppts(await fetchRange(bid, rangeFrom, rangeTo)); setLoading(false) }
  useEffect(() => {
    if (!barberId) return
    let active = true
    const [from, to] = rangeKey.split('_').map(k => new Date(`${k}T00:00:00`))
    fetchRange(barberId, from, to).then(list => { if (active) { setAppts(list); setLoading(false) } })
    return () => { active = false }
  }, [barberId, rangeKey])

  /* ── numbers ── */
  const net = (a: Appt) => {
    const p = a.services?.price ?? 0
    return FIRST_VISIT_DISCOUNT ? (p * (100 - (a.discount_percent ?? 0))) / 100 : p
  }
  const done = appts.filter(a => a.status === 'completed')
  const open = appts.filter(a => a.status === 'pending' || a.status === 'confirmed')
  const cancelled = appts.filter(a => a.status === 'cancelled')
  const sum = (list: Appt[], f: (a: Appt) => number) => list.reduce((s, a) => s + f(a), 0)
  const grossDone = sum(done, a => a.services?.price ?? 0)
  const discounts = grossDone - sum(done, net)
  const totalSales = sum(done, net)
  const tips = sum(done, a => Number(a.tip_amount ?? 0))
  const byMethod = (m: Method | null) => done.filter(a => (a.payment_method ?? null) === m)
  const collected = METHODS.reduce((s, m) => s + sum(byMethod(m), a => net(a) + Number(a.tip_amount ?? 0)), 0)

  const itemRows: [string, string | number, string, boolean?][] = [
    [t.rServices, done.length, format(grossDone)],
    ...(FIRST_VISIT_DISCOUNT ? [[t.rDiscounts, done.filter(a => a.discount_percent).length, `−${format(discounts)}`] as [string, number, string]] : []),
    [t.rUpcoming, open.length, format(sum(open, net)), true],
    [t.rCancelled, cancelled.length, format(sum(cancelled, net)), true],
  ]
  const cashRows: [string, string | number, string, boolean?][] = [
    ...METHODS.map(m => [t.m[m], byMethod(m).length, format(sum(byMethod(m), a => net(a) + Number(a.tip_amount ?? 0)))] as [string, number, string]),
    [t.mNone, byMethod(null).length, format(sum(byMethod(null), net)), true],
  ]

  /* ── till actions ── */
  const patch = (id: string, p: Partial<Appt>) => setAppts(list => list.map(a => (a.id === id ? { ...a, ...p } : a)))
  async function setMethod(a: Appt, m: Method) {
    const clear = a.payment_method === m
    const upd = clear ? { payment_method: null, paid_at: null } : { payment_method: m, paid_at: new Date().toISOString(), status: 'completed' }
    patch(a.id, upd as Partial<Appt>)
    const { error } = await supabase.from('appointments').update(upd).eq('id', a.id)
    if (error && barberId) load(barberId)
    else if (!clear && a.status !== 'completed') notifyStatus(a.id, 'thanks')
  }
  async function setTip(a: Appt, v: string) {
    const tip = Math.min(100000, Math.max(0, Number(v.replace(',', '.')) || 0))
    if (tip === Number(a.tip_amount ?? 0)) return
    patch(a.id, { tip_amount: tip })
    const { error } = await supabase.from('appointments').update({ tip_amount: tip }).eq('id', a.id)
    if (error && barberId) load(barberId)
    else if (tip > 0 && a.status === 'completed') notifyStatus(a.id, 'tip')
  }

  async function saveSale() {
    if (!barberId) return
    const svc = services.find(s => s.id === sale.service)
    if (!svc) return setErr(t.errService)
    setSaving(true); setErr('')
    const start = new Date()
    const e = await addOwnAppointment({ barberId, start, end: new Date(start.getTime() + svc.duration_min * 60000), name: (sale.name.trim() || t.walkIn).slice(0, 100), serviceId: svc.id },
      { status: 'completed', payment_method: sale.method, paid_at: new Date().toISOString(), tip_amount: Math.max(0, Number(sale.tip.replace(',', '.')) || 0) })
    if (e) { setSaving(false); return setErr(saveErrorKind(e) === 'overlap' ? t.errOverlap : t.errGeneric) }
    setSaving(false); setSheet(false)
    const today = new Date(); today.setHours(0, 0, 0, 0)
    if (today >= rangeFrom && today < rangeTo) load(barberId); else setDay(today)
  }

  /* ── per-day breakdown (week / month) ── */
  const days: Date[] = []
  for (let d = new Date(rangeFrom); d < rangeTo; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) days.push(d)
  const dayRows = days.map(d => {
    const list = done.filter(a => dayKey(new Date(a.start_time)) === dayKey(d))
    return { d, count: list.length, sales: sum(list, net), tips: sum(list, a => Number(a.tip_amount ?? 0)) }
  })

  const periodLabel = period === 'day'
    ? day.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })
    : period === 'week'
      ? `${rangeFrom.toLocaleDateString(locale, { day: 'numeric', month: 'short' })} – ${new Date(rangeTo.getTime() - 86400000).toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })}`
      : rangeFrom.toLocaleDateString(locale, { month: 'long', year: 'numeric' })
  const fileBase = `snippr-${lng === 'tr' ? 'satislar' : 'sales'}-${period === 'month' ? dayKey(rangeFrom).slice(0, 7) : period === 'week' ? `${lng === 'tr' ? 'hafta' : 'week'}-${dayKey(rangeFrom)}` : dayKey(day)}`
  const round = (n: number) => Math.round(n * 100) / 100

  const apptTable = (): Cell[][] => [
    [t.colDate, t.colTime, t.colClient, t.colService, t.colStatus, t.colPrice, t.colPay, t.colTip],
    ...appts.map(a => [dayKey(new Date(a.start_time)), hhmm(a.start_time), a.customer_name, a.services?.name ?? '', t.st[a.status] ?? a.status, round(net(a)), a.payment_method ? t.m[a.payment_method] : '', round(Number(a.tip_amount ?? 0))]),
  ]

  function downloadCsv() {
    const esc = (v: Cell) => `"${String(v ?? '').replace(/"/g, '""')}"`
    // BOM so Excel shows Turkish letters correctly
    const blob = new Blob(['\ufeff' + apptTable().map(r => r.map(esc).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' })
    downloadBlob(blob, `${fileBase}.csv`); setExportOpen(false)
  }

  function downloadExcel() {
    const summary: Cell[][] = [
      [t.period, periodLabel],
      [],
      [t.itemType, t.qty, t.gross],
      [t.rServices, done.length, round(grossDone)],
      ...(FIRST_VISIT_DISCOUNT ? [[t.rDiscounts, done.filter(a => a.discount_percent).length, -round(discounts)]] : []),
      [t.rUpcoming, open.length, round(sum(open, net))],
      [t.rCancelled, cancelled.length, round(sum(cancelled, net))],
      [t.rTotal, done.length, round(totalSales)],
      [],
      [t.method, t.qty, t.collected],
      ...METHODS.map(m => [t.m[m], byMethod(m).length, round(sum(byMethod(m), a => net(a) + Number(a.tip_amount ?? 0)))]),
      [t.mNone, byMethod(null).length, round(sum(byMethod(null), net))],
      [t.mTotal, done.filter(a => a.payment_method).length, round(collected)],
      [t.tips, done.filter(a => Number(a.tip_amount ?? 0) > 0).length, round(tips)],
    ]
    const sheets = [
      { name: t.sheetSummary, rows: summary, widths: [30, 12, 14] },
      ...(period === 'day' ? [] : [{ name: t.sheetDays, rows: [[t.dayCol, t.apptsCol, t.salesCol, t.tips], ...dayRows.map(r => [dayKey(r.d), r.count, round(r.sales), round(r.tips)])] as Cell[][], widths: [14, 14, 12, 12] }]),
      { name: t.sheetAppts, rows: apptTable(), widths: [12, 8, 24, 22, 14, 10, 10, 10] },
    ]
    downloadBlob(buildXlsx(sheets), `${fileBase}.xlsx`); setExportOpen(false)
  }

  const shift = (n: number) => setDay(d => period === 'month' ? new Date(d.getFullYear(), d.getMonth() + n, 1) : new Date(d.getFullYear(), d.getMonth(), d.getDate() + n * (period === 'week' ? 7 : 1)))
  const isToday = new Date() >= rangeFrom && new Date() < rangeTo

  return (
    <div className="pb-16" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-[30px] font-bold tracking-[-0.02em] text-[#37352f]">{t.titles[period]}</h1>
          <p className="mt-1 text-[14.5px] text-[#9b9a97]">{t.sub}</p>
        </div>
        <div className="flex items-center gap-2 print:hidden">
          <div ref={exportRef} className="relative">
            <button onClick={() => setExportOpen(o => !o)} className="flex items-center gap-1.5 rounded-full border border-[#e3e2e0] bg-white px-4 py-2.5 text-[14px] font-semibold text-[#37352f] hover:bg-[#f7f7f5]">
              {t.export} <ChevronDown size={15} style={{ transform: exportOpen ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
            </button>
            <AnimatePresence>
              {exportOpen && (
                <motion.div initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -4 }}
                  className="absolute right-0 z-40 mt-2 w-[190px] rounded-[16px] border border-black/[0.06] bg-white p-1.5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.28)]">
                  {([
                    ['PDF', t.pdf, () => { setExportOpen(false); setTimeout(() => window.print(), 50) }],
                    ['CSV', t.csv, downloadCsv],
                    ['XLS', t.excel, downloadExcel],
                  ] as [string, string, () => void][]).map(([badge, label, fn]) => (
                    <button key={badge} onClick={fn} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-semibold text-[#37352f] hover:bg-[#f4f4f2]">
                      <FileBadge label={badge} /> {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={() => { setSale({ name: '', service: services[0]?.id ?? '', method: 'cash', tip: '' }); setErr(''); setSheet(true) }} disabled={!tillReady}
            className="flex items-center gap-1.5 rounded-full px-4 py-2.5 text-[14px] font-semibold text-white disabled:opacity-40" style={{ background: 'var(--accent)' }}>
            <Plus size={16} strokeWidth={2.6} /> {t.newSale}
          </button>
        </div>
      </div>

      {/* day switcher */}
      <div className="mt-5 flex flex-wrap items-center gap-2 print:hidden">
        <div className="flex rounded-full bg-[#f1f1ef] p-1">
          {(['day', 'week', 'month'] as Period[]).map(pr => (
            <button key={pr} onClick={() => setPeriod(pr)} className="relative rounded-full px-4 py-1.5 text-[13.5px] font-semibold" style={{ color: period === pr ? '#37352f' : '#9b9a97' }}>
              {period === pr && <motion.span layoutId="sales-period" className="absolute inset-0 rounded-full bg-white shadow-[0_1px_4px_rgba(0,0,0,0.12)]" transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
              <span className="relative">{t.periods[pr]}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center overflow-hidden rounded-full border border-[#e3e2e0] bg-white">
          <button onClick={() => shift(-1)} className="flex h-9 w-9 items-center justify-center text-[#787774] hover:bg-[#f7f7f5]" aria-label="Previous"><ChevronLeft size={17} /></button>
          <button onClick={() => { const d = new Date(); d.setHours(0, 0, 0, 0); setDay(d) }} className="border-x border-[#e3e2e0] px-3.5 py-2 text-[13.5px] font-semibold text-[#37352f] hover:bg-[#f7f7f5]" style={{ opacity: isToday ? 0.5 : 1 }}>{t.today}</button>
          <label className="relative cursor-pointer px-4 py-2 text-[13.5px] font-semibold capitalize text-[#37352f] hover:bg-[#f7f7f5]">
            {periodLabel}
            <input type="date" value={dayKey(day)} onChange={e => { if (e.target.value) setDay(new Date(`${e.target.value}T00:00:00`)) }} className="absolute inset-0 cursor-pointer opacity-0" />
          </label>
          <button onClick={() => shift(1)} className="flex h-9 w-9 items-center justify-center border-l border-[#e3e2e0] text-[#787774] hover:bg-[#f7f7f5]" aria-label="Next"><ChevronRight size={17} /></button>
        </div>
      </div>
      <p className="mt-4 hidden text-[15px] font-semibold capitalize print:block">{periodLabel}</p>

      {!tillReady && (
        <div className="mt-5 rounded-[18px] border border-[#f5d48a] bg-[#fff8e6] p-5 print:hidden">
          <p className="text-[15px] font-semibold text-[#5c4300]">{t.setupTitle}</p>
          <p className="mt-1 text-[14px] text-[#7a5d10]">{t.setupBody}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><span className="h-6 w-6 animate-spin rounded-full border-2 border-[#e9e9e7] border-t-[#37352f]" /></div>
      ) : (
        <>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <Table title={t.items} head={[t.itemType, t.qty, t.gross]} rows={itemRows} foot={[[t.rTotal, done.length, format(totalSales)]]} />
            <Table title={t.cash} head={[t.method, t.qty, t.collected]} rows={cashRows}
              foot={[[t.mTotal, done.filter(a => a.payment_method).length, format(collected)], [t.tips, done.filter(a => Number(a.tip_amount ?? 0) > 0).length, format(tips)]]} />
          </div>

          {period !== 'day' && (
            <section className="mt-4 overflow-hidden rounded-[20px] border border-[#ededec] bg-white">
              <h2 className="px-5 pt-5 pb-3 text-[16px] font-semibold text-[#37352f]">{t.byDay}</h2>
              <table className="w-full text-[14px] text-[#37352f]">
                <thead>
                  <tr className="text-left text-[12.5px] text-[#9b9a97]">
                    <th className="px-5 py-2.5 font-medium">{t.dayCol}</th>
                    <th className="px-2 py-2.5 text-right font-medium">{t.apptsCol}</th>
                    <th className="px-2 py-2.5 text-right font-medium">{t.tips}</th>
                    <th className="w-28 px-5 py-2.5 text-right font-medium">{t.salesCol}</th>
                  </tr>
                </thead>
                <tbody>
                  {dayRows.map(r => (
                    <tr key={dayKey(r.d)} className="border-t border-[#f1f1ef]" style={{ color: r.count ? undefined : '#c4c3c0' }}>
                      <td className="px-5 py-2.5 capitalize">
                        <button onClick={() => { setDay(r.d); setPeriod('day') }} className="hover:underline">{r.d.toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })}</button>
                      </td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{r.count}</td>
                      <td className="px-2 py-2.5 text-right tabular-nums">{format(r.tips)}</td>
                      <td className="px-5 py-2.5 text-right font-semibold tabular-nums">
                        <span className="mr-2 inline-block h-1.5 rounded-full align-middle" style={{ width: `${Math.round((r.sales / Math.max(1, ...dayRows.map(x => x.sales))) * 48)}px`, background: 'var(--accent)', opacity: r.sales ? 0.6 : 0 }} />
                        {format(r.sales)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          {/* till */}
          <section className="mt-4 overflow-hidden rounded-[20px] border border-[#ededec] bg-white">
            <div className="flex items-center gap-2.5 px-5 pt-5">
              <Wallet size={18} className="text-[#787774]" />
              <h2 className="text-[16px] font-semibold text-[#37352f]">{period === 'day' ? t.till : t.tillAll}</h2>
            </div>
            <p className="px-5 pt-1 pb-3 text-[13.5px] text-[#9b9a97] print:hidden">{t.tillHelp}</p>
            {appts.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center text-[14px] text-[#9b9a97]"><Receipt size={30} strokeWidth={1.5} /> {t.noAppts}</div>
            ) : appts.map(a => {
              const off = a.status === 'cancelled'
              return (
                <div key={a.id} className="flex flex-wrap items-center gap-3 border-t border-[#f1f1ef] px-5 py-3" style={{ opacity: off ? 0.5 : 1 }}>
                  <span className="text-[14px] font-semibold tabular-nums text-[#37352f]" style={{ width: period === 'day' ? 48 : 108 }}>{period !== 'day' && <span className="mr-1.5 font-medium text-[#9b9a97]">{new Date(a.start_time).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</span>}{hhmm(a.start_time)}</span>
                  <div className="min-w-[140px] flex-1">
                    <p className="truncate text-[14.5px] font-semibold text-[#37352f]">{a.customer_name}</p>
                    <p className="truncate text-[12.5px] text-[#9b9a97]">{a.services?.name ?? '—'} · {t.st[a.status] ?? a.status}</p>
                  </div>
                  <span className="w-20 text-right text-[14px] font-semibold tabular-nums text-[#37352f]">{format(net(a))}</span>
                  {!off && tillReady && (
                    <>
                      <div className="flex rounded-full bg-[#f1f1ef] p-0.5 print:hidden">
                        {METHODS.map(m => (
                          <button key={m} onClick={() => setMethod(a, m)} className="relative rounded-full px-3 py-1.5 text-[13px] font-semibold" style={{ color: a.payment_method === m ? '#fff' : '#787774' }}>
                            {a.payment_method === m && <motion.span layoutId={`pm-${a.id}`} className="absolute inset-0 rounded-full" style={{ background: 'var(--accent)' }} transition={{ type: 'spring', stiffness: 500, damping: 35 }} />}
                            <span className="relative">{t.m[m]}</span>
                          </button>
                        ))}
                      </div>
                      <label className="flex items-center gap-1.5 text-[13px] text-[#9b9a97]">
                        {t.tip}
                        <input key={`${a.id}-${a.tip_amount ?? 0}`} defaultValue={Number(a.tip_amount ?? 0) || ''} inputMode="decimal" placeholder="0"
                          onBlur={e => setTip(a, e.target.value)} onKeyDown={e => { if (e.key === 'Enter') (e.target as HTMLInputElement).blur() }}
                          className="w-16 rounded-lg border border-[#e9e9e7] bg-[#f7f7f5] px-2 py-1 text-right text-[13.5px] tabular-nums text-[#37352f] outline-none focus:border-[#37352f]" />
                      </label>
                    </>
                  )}
                  {a.payment_method && <span className="hidden text-[13px] print:inline">{t.m[a.payment_method]}{Number(a.tip_amount ?? 0) > 0 ? ` + ${format(Number(a.tip_amount))}` : ''}</span>}
                </div>
              )
            })}
          </section>
        </>
      )}

      {/* new sale sheet */}
      <AnimatePresence>
        {sheet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSheet(false)} className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center sm:p-4">
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-md rounded-t-[24px] bg-white p-6 shadow-2xl sm:rounded-[24px]">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-[12px] text-white" style={{ background: 'var(--accent)' }}><Receipt size={19} /></span>
                <h3 className="text-[19px] font-bold text-[#37352f]">{t.sale}</h3>
              </div>
              <div className="space-y-4">
                <label className="block"><span className="mb-1.5 block text-[13.5px] font-semibold text-[#37352f]">{t.client}</span>
                  <input value={sale.name} onChange={e => setSale({ ...sale, name: e.target.value })} placeholder={t.walkIn} maxLength={100} className={field} /></label>
                <label className="block"><span className="mb-1.5 block text-[13.5px] font-semibold text-[#37352f]">{t.service}</span>
                  <select value={sale.service} onChange={e => setSale({ ...sale, service: e.target.value })} className={field}>
                    {services.map(s => <option key={s.id} value={s.id}>{s.name} · {format(s.price)}</option>)}
                  </select></label>
                <div>
                  <span className="mb-1.5 block text-[13.5px] font-semibold text-[#37352f]">{t.payBy}</span>
                  <div className="flex rounded-full bg-[#f1f1ef] p-1">
                    {METHODS.map(m => (
                      <button key={m} onClick={() => setSale({ ...sale, method: m })} className="relative flex-1 rounded-full py-2 text-[14px] font-semibold" style={{ color: sale.method === m ? '#fff' : '#787774' }}>
                        {sale.method === m && <motion.span layoutId="sale-pm" className="absolute inset-0 rounded-full" style={{ background: 'var(--accent)' }} />}
                        <span className="relative">{t.m[m]}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <label className="block"><span className="mb-1.5 block text-[13.5px] font-semibold text-[#37352f]">{t.tip}</span>
                  <input value={sale.tip} onChange={e => setSale({ ...sale, tip: e.target.value.replace(/[^\d.,]/g, '') })} inputMode="decimal" placeholder="0" className={field} /></label>
                {err && <p className="text-[14px] font-medium text-[#e5484d]">{err}</p>}
              </div>
              <div className="mt-7 flex gap-3">
                <button onClick={() => setSheet(false)} className="flex-1 rounded-full border border-[#e9e9e7] px-4 py-2.5 font-semibold text-[#37352f] hover:bg-[#f7f7f5]">{t.cancel}</button>
                <button onClick={saveSale} disabled={saving} className="flex-1 rounded-full px-4 py-2.5 font-semibold text-white disabled:opacity-50" style={{ background: 'var(--accent)' }}>{saving ? t.saving : t.save}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
