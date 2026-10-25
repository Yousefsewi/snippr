'use client'

// Waitlist: clients who want a time that isn't free yet.
// Clients join from the public booking page (join_waitlist) or the barber adds them here.

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowDownUp, BarChart3, CalendarCheck, CalendarPlus, ChevronDown, Hourglass, Mail, MessageCircle, MoreVertical, Phone, Plus, Settings2, Trash2, UserPlus,
  type LucideIcon,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'
import { addOwnAppointment, saveErrorKind } from '@/lib/owner-appointments'

type TimePref = 'any' | 'morning' | 'afternoon' | 'evening'
interface Entry {
  id: string; customer_name: string; customer_phone: string | null; customer_email: string | null
  preferred_date: string; time_pref: TimePref; note: string | null; status: 'waiting' | 'booked'; source: 'barber' | 'client'
  created_at: string; service_id: string | null; services: { name: string } | null
}
interface Service { id: string; name: string; duration_min: number; price: number }
type Tab = 'waiting' | 'expired' | 'booked'
type Range = 'future' | 'today' | 'tomorrow' | 'week' | 'month' | 'all'
type Sort = 'oldest' | 'newest' | 'date'

const COPY = {
  en: {
    title: 'Waitlist', add: 'Add', reports: 'View reports', settings: 'Settings',
    ranges: { future: 'All upcoming dates', today: 'Today', tomorrow: 'Tomorrow', week: 'Next 7 days', month: 'Next 30 days', all: 'All dates' },
    sorts: { oldest: 'Created (oldest first)', newest: 'Created (newest first)', date: 'Requested date' },
    tabs: { waiting: 'Waiting', expired: 'Expired', booked: 'Booked' },
    empty: { waiting: ['No waitlist entries', 'No clients are on your waitlist.'], expired: ['Nothing expired', 'Requests whose date has passed show up here.'], booked: ['No bookings yet', 'Clients you book from the waitlist show up here.'] },
    prefs: { any: 'Any time', morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' },
    fromClient: 'Joined from your page', addedByYou: 'Added by you', created: 'Added',
    book: 'Book', remove: 'Remove', whatsapp: 'WhatsApp', call: 'Call', email: 'Email',
    sheetAdd: 'Add to waitlist', sheetBook: 'Book appointment', name: 'Client name', phone: 'Phone', mail: 'Email (optional)', service: 'Service', anyService: 'Any service',
    date: 'Preferred date', when: 'Preferred time', note: 'Note (optional)', time: 'Time', bookDate: 'Date',
    cancel: 'Cancel', save: 'Save', saving: 'Saving…', confirmRemove: 'Remove this client from the waitlist?',
    errName: 'Please enter the client’s name.', errContact: 'Add a phone number or email.', errPast: 'You can’t book a time in the past.', errOverlap: 'There is already an appointment at this time.', errGeneric: 'Could not save. Please try again.',
    setupTitle: 'One step to turn on the waitlist', setupBody: 'Run supabase/waitlist.sql in the Supabase SQL Editor once, then refresh this page.',
    rTitle: 'Waitlist report', rTotal: 'All requests', rWaiting: 'Waiting now', rBooked: 'Booked', rRate: 'Booked from waitlist', rFromPage: 'Joined from your page', rTopService: 'Most wanted service', rNone: '—',
    sTitle: 'Waitlist settings', sToggle: 'Clients can join from my booking page', sHelp: 'When a day is full, your booking page shows a “Join the waitlist” button.', done: 'Done',
    msg: (n: string) => `Hi ${n}, a spot just opened up! Would you like to book it?`,
  },
  tr: {
    title: 'Bekleme listesi', add: 'Ekle', reports: 'Raporları görüntüle', settings: 'Ayarlar',
    ranges: { future: 'Gelecek tüm tarihler', today: 'Bugün', tomorrow: 'Yarın', week: 'Önümüzdeki 7 gün', month: 'Önümüzdeki 30 gün', all: 'Tüm tarihler' },
    sorts: { oldest: 'Oluşturulma tarihi (eskiden yeniye)', newest: 'Oluşturulma tarihi (yeniden eskiye)', date: 'İstenen tarih' },
    tabs: { waiting: 'Bekleyenler', expired: 'Süresi dolanlar', booked: 'Rezervasyon yapılanlar' },
    empty: { waiting: ['Bekleme listesi girişi yok', 'Bekleme listesinde hiç müşterin yok.'], expired: ['Süresi dolan yok', 'Tarihi geçen istekler burada görünür.'], booked: ['Henüz rezervasyon yok', 'Bekleme listesinden randevu verdiğin müşteriler burada görünür.'] },
    prefs: { any: 'Herhangi bir saat', morning: 'Sabah', afternoon: 'Öğleden sonra', evening: 'Akşam' },
    fromClient: 'Sayfandan katıldı', addedByYou: 'Sen ekledin', created: 'Eklendi',
    book: 'Randevu ver', remove: 'Kaldır', whatsapp: 'WhatsApp', call: 'Ara', email: 'E-posta',
    sheetAdd: 'Bekleme listesine ekle', sheetBook: 'Randevu ver', name: 'Müşteri adı', phone: 'Telefon', mail: 'E-posta (isteğe bağlı)', service: 'Hizmet', anyService: 'Fark etmez',
    date: 'İstenen tarih', when: 'İstenen saat', note: 'Not (isteğe bağlı)', time: 'Saat', bookDate: 'Tarih',
    cancel: 'Vazgeç', save: 'Kaydet', saving: 'Kaydediliyor…', confirmRemove: 'Bu müşteri bekleme listesinden kaldırılsın mı?',
    errName: 'Lütfen müşterinin adını yaz.', errContact: 'Telefon ya da e-posta ekle.', errPast: 'Geçmiş bir saate randevu verilemez.', errOverlap: 'Bu saatte zaten bir randevu var.', errGeneric: 'Kaydedilemedi. Lütfen tekrar dene.',
    setupTitle: 'Bekleme listesini açmak için bir adım kaldı', setupBody: 'supabase/waitlist.sql dosyasını Supabase SQL Editor’da bir kez çalıştır, sonra bu sayfayı yenile.',
    rTitle: 'Bekleme listesi raporu', rTotal: 'Tüm istekler', rWaiting: 'Şu an bekleyen', rBooked: 'Randevu verilen', rRate: 'Randevuya dönüşme', rFromPage: 'Sayfandan katılan', rTopService: 'En çok istenen hizmet', rNone: '—',
    sTitle: 'Bekleme listesi ayarları', sToggle: 'Müşteriler randevu sayfamdan katılabilsin', sHelp: 'Bir gün dolu olduğunda randevu sayfanda “Bekleme listesine katıl” butonu çıkar.', done: 'Tamam',
    msg: (n: string) => `Merhaba ${n}, bir yer açıldı! Randevu almak ister misin?`,
  },
}

const todayKey = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const addDaysKey = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}` }
const PREF_TIME: Record<TimePref, string> = { any: '10:00', morning: '10:00', afternoon: '14:00', evening: '18:00' }

const field = 'w-full rounded-xl border border-[#e9e9e7] bg-[#f7f7f5] px-3 py-2.5 text-[15px] text-[#37352f] outline-none focus:border-[#37352f]'
const pill = 'flex items-center gap-2 rounded-full border border-[#e3e2e0] bg-white px-4 py-2.5 text-[14.5px] font-semibold text-[#37352f] transition hover:bg-[#f7f7f5]'
const pop = { initial: { opacity: 0, y: -6, scale: 0.97 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -4 }, transition: { type: 'spring' as const, stiffness: 520, damping: 34 } }
const popCls = 'absolute z-40 mt-2 min-w-[240px] rounded-[18px] border border-black/[0.06] bg-white/95 p-1.5 shadow-[0_24px_60px_-12px_rgba(0,0,0,0.28)] backdrop-blur-xl'

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

function Dropdown<T extends string>({ value, options, onChange, icon: Icon, align = 'left' }: { value: T; options: Record<T, string>; onChange: (v: T) => void; icon?: LucideIcon; align?: 'left' | 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useOutside(open, () => setOpen(false))
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(o => !o)} className={pill}>
        <span className="max-w-[230px] truncate">{options[value]}</span>
        {Icon ? <Icon size={16} /> : <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div {...pop} className={`${popCls} ${align === 'right' ? 'right-0' : 'left-0'}`}>
            {(Object.keys(options) as T[]).map(k => (
              <button key={k} onClick={() => { onChange(k); setOpen(false) }}
                className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-[14.5px] text-[#37352f] hover:bg-[#f4f4f2]">
                {options[k]}
                {k === value && <span className="h-2 w-2 rounded-full" style={{ background: 'var(--accent)' }} />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Sheet({ title, icon: Icon, onClose, children, footer }: { title: string; icon: LucideIcon; onClose: () => void; children: React.ReactNode; footer: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 sm:items-center sm:p-4">
      <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 30, opacity: 0 }} transition={{ type: 'spring', stiffness: 420, damping: 34 }}
        onClick={e => e.stopPropagation()} className="max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-[24px] bg-white p-6 shadow-2xl sm:rounded-[24px]">
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

export default function WaitlistPage() {
  const { lang } = useLang()
  const lng = lang === 'tr' ? 'tr' : 'en'
  const t = COPY[lng]
  const locale = lng === 'tr' ? 'tr-TR' : 'en-US'
  const { format } = useCurrency()

  const [barberId, setBarberId] = useState<string | null>(null)
  const [enabled, setEnabled] = useState(true)
  const [entries, setEntries] = useState<Entry[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [missing, setMissing] = useState(false)

  const [tab, setTab] = useState<Tab>('waiting')
  const [range, setRange] = useState<Range>('future')
  const [sort, setSort] = useState<Sort>('oldest')
  const [menu, setMenu] = useState(false)
  const menuRef = useOutside(menu, () => setMenu(false))

  const [sheet, setSheet] = useState<null | 'add' | 'book' | 'reports' | 'settings'>(null)
  const [target, setTarget] = useState<Entry | null>(null)
  const [f, setF] = useState({ name: '', phone: '', email: '', service: '', date: todayKey(), pref: 'any' as TimePref, note: '', time: '10:00' })
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')

  const load = async (bid: string) => {
    const { data, error } = await supabase.from('waitlist').select('*, services(name)').eq('barber_id', bid)
    if (error) { setMissing(true); return }
    setEntries((data as Entry[]) || [])
  }

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: b } = await supabase.from('barbers').select('id').eq('user_id', user.id).single()
      if (!b || !active) return
      setBarberId(b.id)
      const [{ data: svc }, { data: flag }] = await Promise.all([
        supabase.from('services').select('id, name, duration_min, price').eq('barber_id', b.id).order('name'),
        supabase.from('barbers').select('waitlist_enabled').eq('id', b.id).single(),
      ])
      if (!active) return
      setServices((svc as Service[]) || [])
      if (flag && typeof (flag as { waitlist_enabled?: boolean }).waitlist_enabled === 'boolean') setEnabled((flag as { waitlist_enabled: boolean }).waitlist_enabled)
      await load(b.id)
      if (active) setLoading(false)
    })()
    return () => { active = false }
  }, [])

  // live: someone joining from the booking page shows up right away
  useEffect(() => {
    if (!barberId || missing) return
    const ch = supabase.channel(`waitlist-${barberId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'waitlist', filter: `barber_id=eq.${barberId}` }, () => { load(barberId) })
      .subscribe()
    return () => { supabase.removeChannel(ch) }
  }, [barberId, missing])

  /* ── lists ── */
  const today = todayKey()
  const inRange = (d: string) => {
    if (range === 'all') return true
    if (range === 'future') return d >= today
    if (range === 'today') return d === today
    if (range === 'tomorrow') return d === addDaysKey(1)
    if (range === 'week') return d >= today && d <= addDaysKey(7)
    return d >= today && d <= addDaysKey(30)
  }
  const groups: Record<Tab, Entry[]> = {
    waiting: entries.filter(e => e.status === 'waiting' && e.preferred_date >= today && inRange(e.preferred_date)),
    expired: entries.filter(e => e.status === 'waiting' && e.preferred_date < today),
    booked: entries.filter(e => e.status === 'booked'),
  }
  const sorted = [...groups[tab]].sort((a, b) =>
    sort === 'date' ? a.preferred_date.localeCompare(b.preferred_date) || a.created_at.localeCompare(b.created_at)
      : sort === 'newest' ? b.created_at.localeCompare(a.created_at) : a.created_at.localeCompare(b.created_at))

  /* ── actions ── */
  const openAdd = () => { setF({ name: '', phone: '', email: '', service: '', date: todayKey(), pref: 'any', note: '', time: '10:00' }); setErr(''); setMenu(false); setSheet('add') }
  const openBook = (e: Entry) => {
    setTarget(e)
    setF(x => ({ ...x, service: e.service_id ?? services[0]?.id ?? '', date: e.preferred_date < today ? today : e.preferred_date, time: PREF_TIME[e.time_pref] }))
    setErr(''); setSheet('book')
  }

  async function saveAdd() {
    if (!barberId) return
    if (!f.name.trim()) return setErr(t.errName)
    if (!f.phone.trim() && !f.email.trim()) return setErr(t.errContact)
    setSaving(true)
    const { error } = await supabase.from('waitlist').insert({
      barber_id: barberId, customer_name: f.name.trim().slice(0, 100), customer_phone: f.phone.trim() || null, customer_email: f.email.trim().toLowerCase() || null,
      service_id: f.service || null, preferred_date: f.date, time_pref: f.pref, note: f.note.trim().slice(0, 300) || null, source: 'barber',
    })
    setSaving(false)
    if (error) return setErr(t.errGeneric)
    setSheet(null); load(barberId)
  }

  async function saveBook() {
    if (!barberId || !target) return
    const svc = services.find(s => s.id === f.service)
    const start = new Date(`${f.date}T${f.time}:00`)
    if (start.getTime() < Date.now() - 5 * 60000) return setErr(t.errPast)
    setSaving(true)
    const e = await addOwnAppointment({
      barberId, start, end: new Date(start.getTime() + (svc?.duration_min ?? 30) * 60000),
      name: target.customer_name, phone: target.customer_phone, email: target.customer_email, serviceId: svc?.id ?? null,
    })
    if (e) { setSaving(false); return setErr({ overlap: t.errOverlap, past: t.errPast, generic: t.errGeneric }[saveErrorKind(e)]) }
    await supabase.from('waitlist').update({ status: 'booked' }).eq('id', target.id)
    setSaving(false); setSheet(null); setTab('booked'); load(barberId)
  }

  async function remove(e: Entry) {
    if (!barberId || !window.confirm(t.confirmRemove)) return
    await supabase.from('waitlist').delete().eq('id', e.id)
    load(barberId)
  }

  async function toggleEnabled() {
    if (!barberId) return
    const next = !enabled
    setEnabled(next)
    const { error } = await supabase.from('barbers').update({ waitlist_enabled: next }).eq('id', barberId)
    if (error) setEnabled(!next)
  }

  /* ── report numbers ── */
  const booked = entries.filter(e => e.status === 'booked').length
  const svcCount = new Map<string, number>()
  entries.forEach(e => { if (e.services?.name) svcCount.set(e.services.name, (svcCount.get(e.services.name) ?? 0) + 1) })
  const topService = [...svcCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]

  const fmtDate = (d: string) => new Date(`${d}T12:00:00`).toLocaleDateString(locale, { weekday: 'short', day: 'numeric', month: 'short' })
  const ago = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'short' })
  const waLink = (e: Entry) => e.customer_phone ? `https://wa.me/${e.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(t.msg(e.customer_name.split(' ')[0]))}` : null

  return (
    <div className="pb-20" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-[32px] font-bold tracking-[-0.02em] text-[#37352f]">{t.title}</h1>
        <div className="flex items-center gap-2">
          <div ref={menuRef} className="relative">
            <button onClick={() => setMenu(o => !o)} aria-label="More" className="flex h-11 w-11 items-center justify-center rounded-full border border-[#e3e2e0] bg-white text-[#37352f] hover:bg-[#f7f7f5]">
              <MoreVertical size={18} />
            </button>
            <AnimatePresence>
              {menu && (
                <motion.div {...pop} className={`${popCls} right-0`}>
                  {([[t.reports, BarChart3, 'reports'], [t.settings, Settings2, 'settings']] as [string, LucideIcon, 'reports' | 'settings'][]).map(([label, Icon, s]) => (
                    <button key={s} onClick={() => { setMenu(false); setSheet(s) }} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[14.5px] text-[#37352f] hover:bg-[#f4f4f2]">
                      <Icon size={17} className="text-[#787774]" /> {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={openAdd} disabled={missing} className="flex items-center gap-1.5 rounded-full px-5 py-2.5 text-[15px] font-semibold text-white transition hover:brightness-95 disabled:opacity-40" style={{ background: 'var(--accent)' }}>
            <Plus size={16} strokeWidth={2.6} /> {t.add}
          </button>
        </div>
      </div>

      {missing ? (
        <div className="mt-10 rounded-[22px] border border-[#f5d48a] bg-[#fff8e6] p-6">
          <p className="text-[16px] font-semibold text-[#5c4300]">{t.setupTitle}</p>
          <p className="mt-1.5 text-[14.5px] text-[#7a5d10]">{t.setupBody}</p>
        </div>
      ) : (
        <>
          {/* filters */}
          <div className="mt-5 flex flex-wrap gap-2">
            <Dropdown value={range} options={t.ranges} onChange={setRange} />
            <Dropdown value={sort} options={t.sorts} onChange={setSort} icon={ArrowDownUp} />
          </div>

          {/* tabs */}
          <div className="mt-6 flex gap-6 overflow-x-auto border-b border-[#ededec]">
            {(['waiting', 'expired', 'booked'] as Tab[]).map(k => (
              <button key={k} onClick={() => setTab(k)} className="relative flex flex-shrink-0 items-center gap-2 pb-3 text-[15px] font-semibold" style={{ color: tab === k ? '#37352f' : '#9b9a97' }}>
                {t.tabs[k]}
                <span className="rounded-full px-2 py-0.5 text-[12px]" style={{ background: tab === k ? '#37352f' : '#f1f1ef', color: tab === k ? '#fff' : '#787774' }}>{groups[k].length}</span>
                {tab === k && <motion.span layoutId="wl-tab" className="absolute right-0 bottom-0 left-0 h-[2.5px] rounded-full bg-[#37352f]" />}
              </button>
            ))}
          </div>

          {/* list */}
          {loading ? (
            <div className="flex justify-center py-20"><span className="h-6 w-6 animate-spin rounded-full border-2 border-[#e9e9e7] border-t-[#37352f]" /></div>
          ) : sorted.length === 0 ? (
            <div className="flex flex-col items-center py-20 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-[18px] text-white shadow-[0_10px_30px_-10px_rgba(98,80,214,0.6)]" style={{ background: 'linear-gradient(160deg,#8b7bff,#6250d6)' }}>
                <Hourglass size={28} />
              </span>
              <p className="mt-5 text-[18px] font-semibold text-[#37352f]">{t.empty[tab][0]}</p>
              <p className="mt-1 text-[14.5px] text-[#9b9a97]">{t.empty[tab][1]}</p>
            </div>
          ) : (
            <div className="mt-4 flex flex-col gap-2.5">
              <AnimatePresence initial={false}>
                {sorted.map(e => {
                  const wa = waLink(e)
                  return (
                    <motion.div key={e.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.98 }}
                      className="rounded-[20px] border border-[#ededec] bg-white p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-[#f1f1ef] text-[16px] font-bold text-[#787774]">{e.customer_name.charAt(0).toUpperCase()}</span>
                          <div className="min-w-0">
                            <p className="truncate text-[16px] font-semibold text-[#37352f]">{e.customer_name}</p>
                            <p className="text-[13px] text-[#9b9a97]">{e.source === 'client' ? t.fromClient : t.addedByYou} · {t.created} {ago(e.created_at)}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {e.status === 'waiting' && (
                            <button onClick={() => openBook(e)} className="flex items-center gap-1.5 rounded-full px-3.5 py-2 text-[13.5px] font-semibold text-white" style={{ background: 'var(--accent)' }}>
                              <CalendarCheck size={15} /> {t.book}
                            </button>
                          )}
                          <button onClick={() => remove(e)} aria-label={t.remove} className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ededec] text-[#a8302a] hover:bg-[#fdf0f0]"><Trash2 size={15} /></button>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-[13px]">
                        <span className="rounded-full bg-[#f1f1ef] px-3 py-1 font-medium text-[#37352f]">📅 {fmtDate(e.preferred_date)} · {t.prefs[e.time_pref]}</span>
                        {e.services?.name && <span className="rounded-full bg-[#f1f1ef] px-3 py-1 font-medium text-[#37352f]">✂️ {e.services.name}</span>}
                      </div>
                      {e.note && <p className="mt-2.5 text-[14px] text-[#787774]">“{e.note}”</p>}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 rounded-full bg-[#e8f8ee] px-3 py-1.5 text-[13px] font-semibold text-[#14833b]"><MessageCircle size={14} /> {t.whatsapp}</a>}
                        {e.customer_phone && <a href={`tel:${e.customer_phone}`} className="flex items-center gap-1.5 rounded-full bg-[#f1f1ef] px-3 py-1.5 text-[13px] font-semibold text-[#37352f]"><Phone size={14} /> {e.customer_phone}</a>}
                        {e.customer_email && <a href={`mailto:${e.customer_email}`} className="flex items-center gap-1.5 rounded-full bg-[#f1f1ef] px-3 py-1.5 text-[13px] font-semibold text-[#37352f]"><Mail size={14} /> {e.customer_email}</a>}
                      </div>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          )}
        </>
      )}

      {/* ── sheets ── */}
      <AnimatePresence>
        {(sheet === 'add' || sheet === 'book') && (
          <Sheet title={sheet === 'add' ? t.sheetAdd : `${t.sheetBook} · ${target?.customer_name ?? ''}`} icon={sheet === 'add' ? UserPlus : CalendarPlus} onClose={() => setSheet(null)}
            footer={<>
              <button onClick={() => setSheet(null)} className="flex-1 rounded-full border border-[#e9e9e7] px-4 py-2.5 font-semibold text-[#37352f] hover:bg-[#f7f7f5]">{t.cancel}</button>
              <button onClick={sheet === 'add' ? saveAdd : saveBook} disabled={saving} className="flex-1 rounded-full px-4 py-2.5 font-semibold text-white disabled:opacity-50" style={{ background: 'var(--accent)' }}>{saving ? t.saving : t.save}</button>
            </>}>
            {sheet === 'add' && (
              <>
                <label className="block"><Label>{t.name}</Label><input autoFocus value={f.name} onChange={e => setF({ ...f, name: e.target.value })} maxLength={100} className={field} /></label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="block"><Label>{t.phone}</Label><input value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} inputMode="tel" maxLength={40} className={field} /></label>
                  <label className="block"><Label>{t.mail}</Label><input value={f.email} onChange={e => setF({ ...f, email: e.target.value })} type="email" maxLength={254} className={field} /></label>
                </div>
              </>
            )}
            <label className="block"><Label>{t.service}</Label>
              <select value={f.service} onChange={e => setF({ ...f, service: e.target.value })} className={field}>
                {sheet === 'add' && <option value="">{t.anyService}</option>}
                {services.map(s => <option key={s.id} value={s.id}>{s.name} · {s.duration_min} min · {format(s.price)}</option>)}
                {sheet === 'book' && <option value="">{t.anyService} (30 min)</option>}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block"><Label>{sheet === 'add' ? t.date : t.bookDate}</Label><input type="date" min={today} value={f.date} onChange={e => setF({ ...f, date: e.target.value })} className={field} /></label>
              {sheet === 'add'
                ? <label className="block"><Label>{t.when}</Label>
                    <select value={f.pref} onChange={e => setF({ ...f, pref: e.target.value as TimePref })} className={field}>
                      {(Object.keys(t.prefs) as TimePref[]).map(p => <option key={p} value={p}>{t.prefs[p]}</option>)}
                    </select>
                  </label>
                : <label className="block"><Label>{t.time}</Label><input type="time" value={f.time} onChange={e => setF({ ...f, time: e.target.value })} className={field} /></label>}
            </div>
            {sheet === 'add' && <label className="block"><Label>{t.note}</Label><textarea value={f.note} onChange={e => setF({ ...f, note: e.target.value })} maxLength={300} rows={2} className={`${field} resize-none`} /></label>}
            {err && <p className="text-[14px] font-medium text-[#e5484d]">{err}</p>}
          </Sheet>
        )}

        {sheet === 'reports' && (
          <Sheet title={t.rTitle} icon={BarChart3} onClose={() => setSheet(null)}
            footer={<button onClick={() => setSheet(null)} className="flex-1 rounded-full px-4 py-2.5 font-semibold text-white" style={{ background: 'var(--accent)' }}>{t.done}</button>}>
            <div className="grid grid-cols-2 gap-2.5">
              {([
                [t.rTotal, entries.length],
                [t.rWaiting, entries.filter(e => e.status === 'waiting' && e.preferred_date >= today).length],
                [t.rBooked, booked],
                [t.rRate, entries.length ? `%${Math.round((booked / entries.length) * 100)}` : t.rNone],
                [t.rFromPage, entries.filter(e => e.source === 'client').length],
                [t.rTopService, topService ?? t.rNone],
              ] as [string, string | number][]).map(([label, v]) => (
                <div key={label} className="rounded-2xl bg-[#f7f7f5] p-4">
                  <p className="truncate text-[22px] font-bold text-[#37352f]">{v}</p>
                  <p className="mt-1 text-[13px] text-[#787774]">{label}</p>
                </div>
              ))}
            </div>
          </Sheet>
        )}

        {sheet === 'settings' && (
          <Sheet title={t.sTitle} icon={Settings2} onClose={() => setSheet(null)}
            footer={<button onClick={() => setSheet(null)} className="flex-1 rounded-full px-4 py-2.5 font-semibold text-white" style={{ background: 'var(--accent)' }}>{t.done}</button>}>
            <button onClick={toggleEnabled} className="flex w-full items-center justify-between gap-4 rounded-2xl bg-[#f7f7f5] p-4 text-left">
              <span>
                <span className="block text-[15px] font-semibold text-[#37352f]">{t.sToggle}</span>
                <span className="mt-1 block text-[13px] text-[#787774]">{t.sHelp}</span>
              </span>
              {/* iOS switch */}
              <span className="relative h-[31px] w-[51px] flex-shrink-0 rounded-full transition-colors" style={{ background: enabled ? '#34c759' : '#e3e2e0' }}>
                <motion.span className="absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15)]" animate={{ left: enabled ? 22 : 2 }} transition={{ type: 'spring', stiffness: 600, damping: 35 }} />
              </span>
            </button>
          </Sheet>
        )}
      </AnimatePresence>
    </div>
  )
}
