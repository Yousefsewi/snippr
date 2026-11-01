'use client'

// Barber profile: cover + photo, key numbers, recent appointments, email notifications
// and account & security. Every number comes from the barber's own appointments.

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  BadgeCheck, CalendarDays, Camera, Check, ChevronRight, Copy, Download, ExternalLink, Globe, KeyRound, Link2, Mail,
  MapPin, Pencil, RefreshCw, Search, Trash2,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'
import { isBlock } from '@/lib/blocks'
import { isOn, type MsgKind, type MsgSettings } from '@/lib/messages'
import { SITE_URL } from '@/lib/site-url'

type Status = 'pending' | 'confirmed' | 'completed' | 'cancelled'
type Appt = {
  id: string; customer_name: string; customer_email: string | null; customer_phone: string | null
  start_time: string; status: Status; tip_amount: number | null
  services: { name: string; price: number } | null
}

const T = {
  tr: {
    barber: 'Berber', noLocation: 'Konum ekle', edit: 'Profili düzenle', myPage: 'Randevu sayfam',
    changeCover: 'Kapak fotoğrafını değiştir', changePhoto: 'Fotoğrafı değiştir', verified: 'Onaylı hesap',
    stats: ['Tamamlanan randevu', 'Müşteri', 'Yaklaşan randevu', 'Bu ay kazanç'],
    recent: 'Son randevular', export: 'Dışa aktar', search: 'Ara…', viewAll: 'Tümünü gör', refresh: 'Yenile',
    cols: ['Müşteri', 'Hizmet', 'Tarih', 'Saat', 'Durum'],
    status: { pending: 'Bekliyor', confirmed: 'Onaylı', completed: 'Tamamlandı', cancelled: 'İptal' } as Record<Status, string>,
    empty: 'Henüz randevu yok. Randevu linkini paylaşınca burada görünecek.', noMatch: 'Sonuç bulunamadı.',
    notif: 'Müşteri e-postaları', notifSub: 'Müşterilerine otomatik giden e-postalar.',
    kinds: { remind1d: 'Randevudan 1 gün önce hatırlatma', confirmed: 'Randevu onaylandı', cancelled: 'Randevu iptal edildi', thanks: 'Ziyaret sonrası teşekkür' } as Partial<Record<MsgKind, string>>,
    allMessages: 'Tüm mesaj ayarları', notReady: 'Mesaj ayarları henüz kurulmamış.',
    security: 'Hesap ve güvenlik', email: 'E-posta', password: 'Şifre', changePw: 'Şifreyi değiştir',
    link: 'Randevu linki', copyLink: 'Randevu linkini kopyala', copy: 'Kopyala', copied: 'Kopyalandı', language: 'Panel dili', change: 'Değiştir',
    del: 'Hesabı sil', delSub: 'Ayarlar sayfasından',
  },
  en: {
    barber: 'Barber', noLocation: 'Add your location', edit: 'Edit profile', myPage: 'My booking page',
    changeCover: 'Change cover photo', changePhoto: 'Change photo', verified: 'Verified account',
    stats: ['Completed appointments', 'Clients', 'Upcoming appointments', 'Earned this month'],
    recent: 'Recent appointments', export: 'Export', search: 'Search…', viewAll: 'View all', refresh: 'Refresh',
    cols: ['Client', 'Service', 'Date', 'Time', 'Status'],
    status: { pending: 'Pending', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' } as Record<Status, string>,
    empty: 'No appointments yet. Share your booking link and they will show up here.', noMatch: 'No results.',
    notif: 'Client emails', notifSub: 'Emails your clients get automatically.',
    kinds: { remind1d: 'Reminder 1 day before', confirmed: 'Appointment confirmed', cancelled: 'Appointment cancelled', thanks: 'Thank-you after the visit' } as Partial<Record<MsgKind, string>>,
    allMessages: 'All message settings', notReady: 'Message settings are not set up yet.',
    security: 'Account & security', email: 'Email', password: 'Password', changePw: 'Change password',
    link: 'Booking link', copyLink: 'Copy booking link', copy: 'Copy', copied: 'Copied', language: 'Dashboard language', change: 'Change',
    del: 'Delete account', delSub: 'From the settings page',
  },
}

const STATUS_STYLE: Record<Status, { bg: string; fg: string }> = {
  pending: { bg: '#fff4e5', fg: '#c26a00' },
  confirmed: { bg: '#e6f7ec', fg: '#1a8a44' },
  completed: { bg: '#eef1f6', fg: '#4b5563' },
  cancelled: { bg: '#fdecec', fg: '#c62828' },
}
const NOTIF_KINDS: MsgKind[] = ['remind1d', 'confirmed', 'cancelled', 'thanks']
const DEFAULT_COVER = 'linear-gradient(100deg, #b9c8e8 0%, #d9c9df 30%, #f6c3a8 58%, #f7b9a6 72%, #f8e5c6 100%)'

// Read an image File, downscale it on a canvas, return a JPEG data URL
function fileToDataUrl(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.max(1, Math.round(img.width * scale))
        canvas.height = Math.max(1, Math.round(img.height * scale))
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('no ctx'))
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.onerror = reject
      img.src = reader.result as string
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function Toggle({ on, onChange, disabled }: { on: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button type="button" role="switch" aria-checked={on} disabled={disabled} onClick={onChange}
      className="relative h-[22px] w-[38px] flex-shrink-0 rounded-full transition-colors disabled:opacity-40"
      style={{ background: on ? '#2563eb' : '#d9dce1' }}>
      <span className="absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-all"
        style={{ left: on ? 18 : 2 }} />
    </button>
  )
}

const card = 'rounded-[18px] border border-[#ececea] bg-white'

export default function ProfilePage() {
  const { lang, setLang } = useLang()
  const lng = lang === 'tr' ? 'tr' : 'en'
  const t = T[lng]
  const locale = lng === 'tr' ? 'tr-TR' : 'en-GB'
  const { format } = useCurrency()

  const avatarRef = useRef<HTMLInputElement>(null)
  const bannerRef = useRef<HTMLInputElement>(null)
  const [me, setMe] = useState({ id: '', name: '', email: '', photo: null as string | null, location: '', slug: '', verified: false })
  const [banner, setBanner] = useState<string | null>(null)
  const [appts, setAppts] = useState<Appt[]>([])
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState(0) // when the appointments were loaded
  const [settings, setSettings] = useState<MsgSettings>({})
  const [msgReady, setMsgReady] = useState(true)
  const [q, setQ] = useState('')
  const [copied, setCopied] = useState(false)

  const loadAppts = useCallback(async (barberId: string) => {
    const { data } = await supabase.from('appointments')
      .select('id, customer_name, customer_email, customer_phone, start_time, status, tip_amount, services(name, price)')
      .eq('barber_id', barberId).order('start_time', { ascending: false }).limit(2000)
    setNow(Date.now())
    setAppts(((data ?? []) as unknown as Appt[]).filter(a => !isBlock(a)))
    setLoading(false)
  }, [])

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !active) return
      // cover_url may not exist on older databases: fall back without it
      let { data } = await supabase.from('barbers').select('id, name, photo_url, address, slug, cover_url').eq('user_id', user.id).single()
      if (!data) {
        const retry = await supabase.from('barbers').select('id, name, photo_url, address, slug').eq('user_id', user.id).single()
        data = retry.data as typeof data
      }
      if (!data || !active) return
      setMe({
        id: data.id, name: data.name || '', email: user.email ?? '', photo: data.photo_url || null,
        location: data.address || '', slug: data.slug || '', verified: Boolean(user.email_confirmed_at),
      })
      let localCover: string | null = null
      try { localCover = localStorage.getItem('snippr:cover') } catch { /* storage blocked */ }
      setBanner((data as { cover_url?: string }).cover_url ?? localCover ?? null)
      const { data: m, error } = await supabase.from('barbers').select('message_settings').eq('id', data.id).single()
      if (!active) return
      if (error) setMsgReady(false)
      else setSettings((m?.message_settings as MsgSettings) ?? {})
      await loadAppts(data.id)
    })()
    return () => { active = false }
  }, [loadAppts])

  // key numbers
  const stats = useMemo(() => {
    const d = new Date(now)
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime()
    let done = 0, upcoming = 0, earned = 0
    const clients = new Set<string>()
    for (const a of appts) {
      const at = new Date(a.start_time).getTime()
      if (a.status === 'cancelled') continue
      clients.add((a.customer_email || a.customer_phone || a.customer_name).trim().toLowerCase())
      const finished = a.status === 'completed' || (a.status === 'confirmed' && at < now)
      if (finished) {
        done++
        if (at >= monthStart) earned += Number(a.services?.price ?? 0) + Number(a.tip_amount ?? 0)
      } else if (at >= now) upcoming++
    }
    return [String(done), String(clients.size), String(upcoming), format(earned)]
  }, [appts, format, now])

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase()
    return s ? appts.filter(a => `${a.customer_name} ${a.services?.name ?? ''} ${a.customer_email ?? ''}`.toLowerCase().includes(s)) : appts
  }, [appts, q])

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' })
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })

  function exportCsv() {
    const esc = (v: string) => `"${v.replace(/"/g, '""')}"`
    const rows = [t.cols, ...shown.map(a => [a.customer_name, a.services?.name ?? '', fmtDate(a.start_time), fmtTime(a.start_time), t.status[a.status]])]
    const blob = new Blob(['﻿' + rows.map(r => r.map(esc).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url; link.download = 'snippr-appointments.csv'; link.click()
    URL.revokeObjectURL(url)
  }

  async function toggle(k: MsgKind) {
    if (!me.id || !msgReady) return
    const prev = settings
    const next = { ...settings, [k]: !isOn(settings, k) }
    setSettings(next)
    const { error } = await supabase.from('barbers').update({ message_settings: next }).eq('id', me.id)
    if (error) setSettings(prev)
  }

  async function onAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await fileToDataUrl(file, 400)
    setMe(m => ({ ...m, photo: url }))
    if (me.id) await supabase.from('barbers').update({ photo_url: url }).eq('id', me.id)
  }

  async function onBannerPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await fileToDataUrl(file, 1600)
    setBanner(url)
    try { localStorage.setItem('snippr:cover', url) } catch { /* storage blocked */ }
    // also saved in the database when the cover_url column exists (ignored otherwise)
    if (me.id) await supabase.from('barbers').update({ cover_url: url }).eq('id', me.id)
  }

  const bookingUrl = me.slug ? `${SITE_URL}/b/${me.slug}` : ''
  const copyLink = async () => {
    try { await navigator.clipboard.writeText(bookingUrl); setCopied(true); setTimeout(() => setCopied(false), 1600) } catch { /* blocked */ }
  }

  return (
    <div className="min-h-screen bg-[#f6f7f9] px-4 py-6 text-[#1f2328] sm:px-6 lg:px-8">
      <input ref={avatarRef} type="file" accept="image/*" onChange={onAvatarPick} className="hidden" />
      <input ref={bannerRef} type="file" accept="image/*" onChange={onBannerPick} className="hidden" />

      <div className="w-full space-y-4">
        {/* ── header: cover, photo, name, numbers ── */}
        <section className={`${card} overflow-hidden`}>
          <div className="group relative h-[160px] sm:h-[220px] lg:h-[240px]"
            style={banner ? { backgroundImage: `url(${banner})`, backgroundSize: 'cover', backgroundPosition: 'center' } : { background: DEFAULT_COVER }}>
            {!banner && (
              <>
                <span aria-hidden className="absolute -bottom-[260px] left-[18%] h-[420px] w-[420px] rounded-full border border-white/50 bg-white/15" />
                <span aria-hidden className="absolute -top-24 right-[8%] h-64 w-64 rounded-full bg-white/25 blur-3xl" />
              </>
            )}
            <button onClick={() => bannerRef.current?.click()} title={t.changeCover} aria-label={t.changeCover}
              className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-[#1f2328] shadow-sm backdrop-blur transition hover:bg-white">
              <Camera size={16} />
            </button>
          </div>

          <div className="px-5 pb-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <button onClick={() => avatarRef.current?.click()} title={t.changePhoto} aria-label={t.changePhoto}
                  className="group relative -mt-12 h-24 w-24 flex-shrink-0 overflow-hidden rounded-full border-[5px] border-white bg-gradient-to-br from-[#f2b8a2] to-[#b9a4e6] shadow-[0_6px_18px_rgba(0,0,0,0.12)] sm:-mt-16 sm:h-[128px] sm:w-[128px]">
                  {me.photo
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={me.photo} alt="" className="h-full w-full object-cover" />
                    : <span className="flex h-full w-full items-center justify-center text-[40px] font-bold text-white">{(me.name || '?').charAt(0).toUpperCase()}</span>}
                  <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <Camera size={22} color="#fff" />
                  </span>
                </button>
                <div className="min-w-0 sm:pb-1">
                  <h1 className="flex items-center gap-1.5 text-[24px] font-semibold tracking-[-0.01em]">
                    <span className="truncate">{me.name || '…'}</span>
                    {me.verified && <span title={t.verified}><BadgeCheck size={20} className="flex-shrink-0 fill-[#2f80ed] text-white" /></span>}
                  </h1>
                  <p className="mt-0.5 text-[14px] text-[#6b7280]">{t.barber}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-[#8a8f98]">
                    <span className="flex items-center gap-1"><MapPin size={14} />{me.location || t.noLocation}</span>
                    {me.email && <span className="flex min-w-0 items-center gap-1"><Mail size={14} /><span className="truncate">{me.email}</span></span>}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:pb-1">
                {me.slug && (
                  <a href={`/b/${me.slug}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#e3e5e8] bg-white px-3.5 py-2 text-[13px] font-medium text-[#3b4048] transition hover:bg-[#f6f7f9]">
                    <ExternalLink size={14} /> {t.myPage}
                  </a>
                )}
                <Link href="/dashboard/profile/edit"
                  className="inline-flex items-center gap-1.5 rounded-[10px] border border-[#e3e5e8] bg-white px-3.5 py-2 text-[13px] font-medium text-[#3b4048] transition hover:bg-[#f6f7f9]">
                  <Pencil size={14} /> {t.edit}
                </Link>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-y-5 border-t border-[#f0f0ee] pt-5 md:grid-cols-4">
              {stats.map((v, i) => (
                <div key={i} className={`text-center ${i % 2 === 1 ? 'border-l border-[#eeeeec]' : ''} ${i === 2 ? 'md:border-l md:border-[#eeeeec]' : ''}`}>
                  <p className="text-[22px] font-semibold tabular-nums">{loading ? '–' : v}</p>
                  <p className="mt-1 text-[13px] text-[#6b7280]">{t.stats[i]}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
          {/* ── recent appointments ── */}
          <section className={`${card} flex min-w-0 flex-col p-4 sm:p-5`}>
            <h2 className="text-[16px] font-semibold">{t.recent}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-[9px] border border-[#e3e5e8] px-2.5 py-1.5 text-[12.5px] font-medium tabular-nums text-[#3b4048]">{shown.length}</span>
              <div className="flex overflow-hidden rounded-[9px] border border-[#e3e5e8]">
                <button onClick={exportCsv} disabled={!shown.length} className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12.5px] font-medium text-[#3b4048] transition hover:bg-[#f6f7f9] disabled:opacity-40">
                  <Download size={14} /> {t.export}
                </button>
                <button onClick={() => { if (me.id) { setLoading(true); loadAppts(me.id) } }} title={t.refresh} aria-label={t.refresh}
                  className="border-l border-[#e3e5e8] px-2 text-[#3b4048] transition hover:bg-[#f6f7f9]">
                  <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                </button>
              </div>
              <label className="ml-auto flex min-w-[150px] flex-1 items-center gap-1.5 rounded-[9px] border border-[#e3e5e8] px-2.5 py-1.5 sm:max-w-[220px]">
                <Search size={14} className="text-[#9aa0a8]" />
                <input value={q} onChange={e => setQ(e.target.value)} placeholder={t.search} className="w-full bg-transparent text-[12.5px] outline-none placeholder:text-[#a6abb2]" />
              </label>
              <Link href="/dashboard/appointments" className="rounded-[9px] border border-[#e3e5e8] px-2.5 py-1.5 text-[12.5px] font-medium text-[#3b4048] transition hover:bg-[#f6f7f9]">{t.viewAll}</Link>
            </div>

            <div className="mt-3 flex flex-1 flex-col overflow-x-auto">
              <table className="w-full min-w-[520px] text-[13px]">
                <thead>
                  <tr className="bg-[#f6f7f9] text-left text-[12px] text-[#6b7280]">
                    <th className="rounded-l-[8px] px-3 py-2.5 font-medium">#</th>
                    {t.cols.map((c, i) => <th key={c} className={`px-3 py-2.5 font-medium ${i === t.cols.length - 1 ? 'rounded-r-[8px]' : ''}`}>{c}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {shown.slice(0, 7).map((a, i) => (
                    <tr key={a.id} className="border-b border-[#f2f2f0] last:border-0">
                      <td className="px-3 py-3 text-[#a6abb2] tabular-nums">{i + 1}</td>
                      <td className="max-w-[160px] truncate px-3 py-3 font-medium">{a.customer_name}</td>
                      <td className="max-w-[150px] truncate px-3 py-3 text-[#5b616b]">{a.services?.name ?? '—'}</td>
                      <td className="px-3 py-3 text-[#5b616b] tabular-nums">{fmtDate(a.start_time)}</td>
                      <td className="px-3 py-3 text-[#5b616b] tabular-nums" dir="ltr">{fmtTime(a.start_time)}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-[6px] px-2 py-0.5 text-[11.5px] font-semibold" style={{ background: STATUS_STYLE[a.status].bg, color: STATUS_STYLE[a.status].fg }}>
                          {t.status[a.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {!loading && !shown.length && (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 px-3 py-12 text-center">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eef3ff] text-[#2563eb]">
                    <CalendarDays size={26} />
                  </span>
                  <p className="max-w-[320px] text-[13.5px] text-[#6b7280]">{appts.length ? t.noMatch : t.empty}</p>
                  {!appts.length && bookingUrl && (
                    <button onClick={copyLink}
                      className="inline-flex items-center gap-1.5 rounded-[10px] bg-[#1f2328] px-4 py-2 text-[13px] font-medium text-white transition hover:bg-black">
                      {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? t.copied : t.copyLink}
                    </button>
                  )}
                </div>
              )}
            </div>
          </section>

          <div className="space-y-4">
            {/* ── client emails ── */}
            <section className={`${card} p-4 sm:p-5`}>
              <h2 className="text-[16px] font-semibold">{t.notif}</h2>
              <p className="mt-0.5 text-[12.5px] text-[#8a8f98]">{msgReady ? t.notifSub : t.notReady}</p>
              <div className="mt-3 divide-y divide-[#f2f2f0]">
                {NOTIF_KINDS.map(k => (
                  <div key={k} className="flex items-center justify-between gap-3 py-2.5">
                    <span className="text-[13px] text-[#3b4048]">{t.kinds[k]}</span>
                    <Toggle on={isOn(settings, k)} onChange={() => toggle(k)} disabled={!msgReady || !me.id} />
                  </div>
                ))}
              </div>
              <Link href="/dashboard/messages" className="mt-2 flex items-center gap-1 text-[13px] font-medium text-[#2563eb]">
                {t.allMessages} <ChevronRight size={15} className="rtl:-scale-x-100" />
              </Link>
            </section>

            {/* ── account & security ── */}
            <section className={`${card} p-4 sm:p-5`}>
              <h2 className="text-[16px] font-semibold">{t.security}</h2>
              <div className="mt-2 divide-y divide-[#f2f2f0] text-[13px]">
                <Row icon={Mail} label={t.email}><span className="truncate text-[#5b616b]">{me.email}</span></Row>
                <Row icon={KeyRound} label={t.password}>
                  <Link href="/dashboard/profile/edit" className="font-medium text-[#2563eb]">{t.changePw}</Link>
                </Row>
                {bookingUrl && (
                  <Row icon={Link2} label={t.link}>
                    <button onClick={copyLink} className="font-medium text-[#2563eb]">{copied ? t.copied : t.copy}</button>
                  </Row>
                )}
                <Row icon={Globe} label={t.language}>
                  <button onClick={() => setLang(lng === 'tr' ? 'en' : 'tr')} className="font-medium text-[#2563eb]">
                    {lng === 'tr' ? 'Türkçe' : 'English'} · {t.change}
                  </button>
                </Row>
                <Row icon={Trash2} label={t.del} danger>
                  <Link href="/dashboard/settings" className="text-[#8a8f98]">{t.delSub} <ChevronRight size={14} className="inline rtl:-scale-x-100" /></Link>
                </Row>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}

function Row({ icon: Icon, label, danger, children }: { icon: typeof Mail; label: string; danger?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3">
      <span className={`flex flex-shrink-0 items-center gap-2 ${danger ? 'text-[#c62828]' : 'text-[#3b4048]'}`}><Icon size={15} className={danger ? '' : 'text-[#9aa0a8]'} />{label}</span>
      <span className="flex min-w-0 justify-end">{children}</span>
    </div>
  )
}
