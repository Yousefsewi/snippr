'use client'

// Overview widgets for the dashboard home (Fresha-style cards, Snippr glass look).
// Everything is computed from the barber's real appointments — nothing is invented.

import { useState } from 'react'
import Link from 'next/link'
import { BarChart3, CalendarClock, LineChart, Users } from 'lucide-react'
import { glass } from '@/lib/glass'

export interface WAppt {
  id: string
  customer_name: string
  start_time: string
  end_time: string
  status: string
  created_at?: string
  services: { name: string; price: number } | null
  discount_percent?: number
}

type Lng = 'en' | 'tr'

const COPY = {
  en: {
    sales: 'Recent sales', last7: 'Last 7 days', appts: 'Appointments', apptValue: 'Appointment value',
    salesS: 'Sales', bookedS: 'Booked value', salesNote: 'Sales = completed appointments.',
    upcoming: 'Upcoming appointments', next7: 'Next 7 days', booked: (n: number) => `${n} booked`,
    emptyUp: 'Your schedule is empty', emptyUpSub: 'Share your booking link to fill your week.', shareLink: 'Share my link',
    activity: 'Appointment activity', noActivity: 'No appointments yet', noActivitySub: 'New bookings will show up here the moment they come in.',
    today: 'Today’s next appointments', noToday: 'Nothing else today', noTodaySub: 'Enjoy the break — or open your calendar.', openCal: 'Open calendar',
    topServices: 'Top services', service: 'Service', thisMonth: 'This month', lastMonth: 'Last month',
    noServices: 'No bookings this month', noServicesSub: 'Your most booked services will appear here.',
    topClients: 'Top clients', client: 'Client', noClients: 'No clients yet', noClientsSub: 'Your regulars will show up here.',
    min: 'min', with: 'with',
  },
  tr: {
    sales: 'Son satışlar', last7: 'Son 7 gün', appts: 'Randevular', apptValue: 'Randevu değeri',
    salesS: 'Satış', bookedS: 'Randevu değeri', salesNote: 'Satış = tamamlanan randevular.',
    upcoming: 'Yaklaşan randevular', next7: 'Önümüzdeki 7 gün', booked: (n: number) => `${n} randevu`,
    emptyUp: 'Programın boş', emptyUpSub: 'Haftanı doldurmak için randevu linkini paylaş.', shareLink: 'Linkimi paylaş',
    activity: 'Randevu etkinliği', noActivity: 'Henüz randevu yok', noActivitySub: 'Yeni randevular geldiği anda burada görünür.',
    today: 'Bugünün sonraki randevuları', noToday: 'Bugün başka randevu yok', noTodaySub: 'Molanın tadını çıkar — ya da takvimini aç.', openCal: 'Takvimi aç',
    topServices: 'En iyi hizmetler', service: 'Hizmet', thisMonth: 'Bu ay', lastMonth: 'Geçen ay',
    noServices: 'Bu ay randevu yok', noServicesSub: 'En çok tercih edilen hizmetlerin burada görünür.',
    topClients: 'En iyi müşteriler', client: 'Müşteri', noClients: 'Henüz müşteri yok', noClientsSub: 'Düzenli müşterilerin burada görünür.',
    min: 'dk', with: '',
  },
}

// categorical slots 1 & 2 of the validated reference palette
const C_SALES = '#2a78d6'
const C_BOOKED = '#eb6834'
const INK = '#37352f', MUTED = '#9b9a97', GRID = 'rgba(55,53,47,0.08)'

const STATUS_PILL: Record<string, { bg: string; fg: string }> = {
  pending: { bg: '#fdecc8', fg: '#402c1b' },
  confirmed: { bg: '#dbeddb', fg: '#1c3829' },
  completed: { bg: '#e3e2e0', fg: '#32302c' },
  cancelled: { bg: '#ffe2dd', fg: '#5d1715' },
}

const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate())
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
const sameDay = (a: Date, b: Date) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
const durMin = (a: WAppt) => Math.round((new Date(a.end_time).getTime() - new Date(a.start_time).getTime()) / 60000)

// rounded axis max with 4 even steps
function niceMax(v: number) {
  if (v <= 0) return 4
  const raw = v / 4
  const mag = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 2, 2.5, 5, 10].map(m => m * mag).find(s => s >= raw) ?? raw
  return step * 4
}

/* ── building blocks ── */

function Card({ title, sub, children, className = '' }: { title: string; sub?: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`flex min-w-0 flex-col rounded-[22px] p-5 ${className}`} style={glass()}>
      <h2 className="text-[16px] font-semibold" style={{ color: INK }}>{title}</h2>
      {sub && <p className="mt-0.5 text-[13px]" style={{ color: MUTED }}>{sub}</p>}
      {children}
    </section>
  )
}

function Empty({ icon: Icon, title, sub, action }: { icon: typeof BarChart3; title: string; sub: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-10 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-[14px]" style={{ background: 'rgba(42,120,214,0.1)', color: C_SALES }}>
        <Icon size={24} strokeWidth={1.8} />
      </span>
      <p className="mt-4 text-[15px] font-semibold" style={{ color: INK }}>{title}</p>
      <p className="mt-1 max-w-[280px] text-[13.5px]" style={{ color: MUTED }}>{sub}</p>
      {action && (
        <Link href={action.href} className="mt-4 rounded-full bg-[#1c1c1e] px-4 py-2 text-[13px] font-semibold text-white hover:bg-black">{action.label}</Link>
      )}
    </div>
  )
}

function Pill({ status, label }: { status: string; label: string }) {
  const c = STATUS_PILL[status] ?? STATUS_PILL.completed
  return <span className="rounded-full px-2 py-[2px] text-[11.5px] font-medium whitespace-nowrap" style={{ background: c.bg, color: c.fg }}>{label}</span>
}

function DateBlock({ d, locale }: { d: Date; locale: string }) {
  return (
    <div className="w-10 flex-shrink-0 text-center leading-none">
      <p className="text-[19px] font-bold" style={{ color: INK }}>{d.getDate()}</p>
      <p className="mt-1 text-[11.5px] font-medium" style={{ color: MUTED }}>{d.toLocaleDateString(locale, { month: 'short' })}</p>
    </div>
  )
}

/* ── charts ── */

const W = 560, H = 210, PL = 56, PR = 26, PT = 12, PB = 34

function SalesChart({ days, sales, booked, format, labels, locale }: {
  days: Date[]; sales: number[]; booked: number[]; format: (n: number) => string; labels: [string, string]; locale: string
}) {
  const [hover, setHover] = useState<number | null>(null)
  const max = niceMax(Math.max(...sales, ...booked))
  const iw = W - PL - PR, ih = H - PT - PB
  const x = (i: number) => PL + (iw * i) / (days.length - 1)
  const y = (v: number) => PT + ih - (ih * v) / max
  const path = (vals: number[]) => vals.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')

  return (
    <div className="relative mt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={`${labels[0]} / ${labels[1]}`}
        onMouseLeave={() => setHover(null)}>
        {[0, 1, 2, 3, 4].map(k => {
          const v = (max / 4) * k
          return (
            <g key={k}>
              <line x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} stroke={GRID} />
              <text x={PL - 8} y={y(v)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill={MUTED}>{format(v)}</text>
            </g>
          )
        })}
        {days.map((d, i) => (
          <text key={i} x={x(i)} y={H - 10} textAnchor="middle" fontSize="11" fill={MUTED}>
            {d.toLocaleDateString(locale, { day: 'numeric', weekday: 'short' })}
          </text>
        ))}
        {hover !== null && <line x1={x(hover)} x2={x(hover)} y1={PT} y2={PT + ih} stroke="rgba(55,53,47,0.25)" strokeDasharray="3 3" />}
        <path d={path(booked)} fill="none" stroke={C_BOOKED} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        <path d={path(sales)} fill="none" stroke={C_SALES} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        {[booked, sales].map((vals, s) => vals.map((v, i) => (
          <circle key={`${s}-${i}`} cx={x(i)} cy={y(v)} r={hover === i ? 5 : 3.5} fill={s ? C_SALES : C_BOOKED} stroke="#fff" strokeWidth="2" />
        )))}
        {/* wide invisible hit areas, one per day */}
        {days.map((_, i) => (
          <rect key={i} x={x(i) - iw / (days.length - 1) / 2} y={PT} width={iw / (days.length - 1)} height={ih} fill="transparent"
            onMouseEnter={() => setHover(i)} onClick={() => setHover(i)} />
        ))}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 z-10 rounded-[12px] bg-white px-3 py-2 text-[12.5px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5"
          style={{ left: `${(x(hover) / W) * 100}%`, transform: `translateX(${hover > days.length / 2 ? '-105%' : '5%'})` }}>
          <p className="mb-1 font-semibold" style={{ color: INK }}>{days[hover].toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' })}</p>
          <p className="flex items-center gap-1.5 whitespace-nowrap" style={{ color: INK }}><span className="h-2 w-2 rounded-full" style={{ background: C_SALES }} />{labels[0]}: <b>{format(sales[hover])}</b></p>
          <p className="flex items-center gap-1.5 whitespace-nowrap" style={{ color: INK }}><span className="h-2 w-2 rounded-full" style={{ background: C_BOOKED }} />{labels[1]}: <b>{format(booked[hover])}</b></p>
        </div>
      )}
      <div className="mt-2 flex flex-wrap gap-4 text-[12.5px]" style={{ color: INK }}>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: C_SALES }} />{labels[0]}</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: C_BOOKED }} />{labels[1]}</span>
      </div>
    </div>
  )
}

function UpcomingBars({ days, counts, locale }: { days: Date[]; counts: number[]; locale: string }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(4, ...counts)
  const ticks = niceMax(max)
  const iw = W - 36 - PR, ih = H - PT - PB
  const slot = iw / days.length
  const bw = Math.min(38, slot * 0.55)
  const y = (v: number) => PT + ih - (ih * v) / ticks
  return (
    <div className="relative mt-4">
      <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label="Upcoming appointments per day" onMouseLeave={() => setHover(null)}>
        {[0, 1, 2, 3, 4].map(k => {
          const v = (ticks / 4) * k
          return (
            <g key={k}>
              <line x1={36} x2={W - PR} y1={y(v)} y2={y(v)} stroke={GRID} />
              <text x={28} y={y(v)} textAnchor="end" dominantBaseline="middle" fontSize="11" fill={MUTED}>{Number.isInteger(v) ? v : ''}</text>
            </g>
          )
        })}
        {days.map((d, i) => {
          const cx = 36 + slot * i + slot / 2
          const h = (ih * counts[i]) / ticks
          const r = Math.min(4, h)
          const top = PT + ih - h
          return (
            <g key={i}>
              {counts[i] > 0 && (
                <path d={`M${cx - bw / 2},${PT + ih} V${top + r} Q${cx - bw / 2},${top} ${cx - bw / 2 + r},${top} H${cx + bw / 2 - r} Q${cx + bw / 2},${top} ${cx + bw / 2},${top + r} V${PT + ih} Z`}
                  fill={C_SALES} opacity={hover === null || hover === i ? 1 : 0.45} />
              )}
              <text x={cx} y={H - 10} textAnchor="middle" fontSize="11" fill={MUTED}>{d.toLocaleDateString(locale, { day: 'numeric', weekday: 'short' })}</text>
              <rect x={36 + slot * i} y={PT} width={slot} height={ih} fill="transparent" onMouseEnter={() => setHover(i)} onClick={() => setHover(i)} />
            </g>
          )
        })}
      </svg>
      {hover !== null && (
        <div className="pointer-events-none absolute top-0 z-10 rounded-[12px] bg-white px-3 py-2 text-[12.5px] whitespace-nowrap shadow-[0_8px_24px_rgba(0,0,0,0.12)] ring-1 ring-black/5"
          style={{ left: `${((36 + slot * hover + slot / 2) / W) * 100}%`, transform: 'translateX(-50%)', color: INK }}>
          <b>{days[hover].toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'short' })}</b> · {counts[hover]}
        </div>
      )}
    </div>
  )
}

/* ── tables ── */

function RankTable({ head, rows, empty }: { head: [string, string, string]; rows: [string, number, number][]; empty: React.ReactNode }) {
  if (!rows.length) return <>{empty}</>
  return (
    <table className="mt-3 w-full text-[13.5px]" style={{ color: INK }}>
      <thead>
        <tr style={{ color: MUTED }} className="text-left text-[12.5px]">
          <th className="py-2 font-medium">{head[0]}</th>
          <th className="w-20 py-2 text-right font-medium">{head[1]}</th>
          <th className="w-20 py-2 text-right font-medium">{head[2]}</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(([name, a, b]) => (
          <tr key={name} style={{ borderTop: `1px solid ${GRID}` }}>
            <td className="max-w-0 truncate py-2.5 pr-2">{name}</td>
            <td className="py-2.5 text-right font-semibold tabular-nums">{a}</td>
            <td className="py-2.5 text-right tabular-nums" style={{ color: MUTED }}>{b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

/* ── main ── */

export default function DashboardWidgets({ appts, lang, format, statusLabel, applyDiscount }: {
  appts: WAppt[]; lang: string; format: (n: number) => string; statusLabel: Record<string, string>; applyDiscount: boolean
}) {
  const lng: Lng = lang === 'tr' ? 'tr' : 'en'
  const t = COPY[lng]
  const locale = lng === 'tr' ? 'tr-TR' : 'en-US'
  const now = new Date()
  const today = dayStart(now)
  const live = appts.filter(a => a.status !== 'cancelled')
  const value = (a: WAppt) => (a.services?.price ?? 0) * (100 - (applyDiscount ? a.discount_percent ?? 0 : 0)) / 100

  // last 7 days
  const past = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6))
  const onDay = (d: Date) => live.filter(a => sameDay(new Date(a.start_time), d))
  const sales = past.map(d => onDay(d).filter(a => a.status === 'completed').reduce((s, a) => s + value(a), 0))
  const booked = past.map(d => onDay(d).reduce((s, a) => s + value(a), 0))
  const pastCount = past.reduce((s, d) => s + onDay(d).length, 0)

  // next 7 days
  const next = Array.from({ length: 7 }, (_, i) => addDays(today, i))
  const upcomingList = live.filter(a => new Date(a.start_time) >= now && new Date(a.start_time) < addDays(today, 7))
  const upCounts = next.map(d => upcomingList.filter(a => sameDay(new Date(a.start_time), d)).length)

  // activity: newest bookings first
  const activity = [...appts]
    .sort((a, b) => new Date(b.created_at ?? b.start_time).getTime() - new Date(a.created_at ?? a.start_time).getTime())
    .slice(0, 5)

  const todayNext = live
    .filter(a => sameDay(new Date(a.start_time), now) && new Date(a.end_time) >= now)
    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

  // this month vs last month
  const mStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lmStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const rank = (key: (a: WAppt) => string | null) => {
    const m = new Map<string, [number, number]>()
    for (const a of live) {
      const k = key(a); if (!k) continue
      const d = new Date(a.start_time)
      const row = m.get(k) ?? [0, 0]
      if (d >= mStart) row[0]++
      else if (d >= lmStart) row[1]++
      m.set(k, row)
    }
    return [...m.entries()].filter(([, [a, b]]) => a + b > 0).sort((x, y) => y[1][0] - x[1][0] || y[1][1] - x[1][1]).slice(0, 5)
      .map(([k, [a, b]]) => [k, a, b] as [string, number, number])
  }

  const apptLine = (a: WAppt) => {
    const d = new Date(a.start_time)
    return (
      <div className="flex min-w-0 gap-3 py-3" style={{ borderTop: `1px solid ${GRID}` }}>
        <DateBlock d={d} locale={locale} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[12.5px]" style={{ color: MUTED }}>
            <span>{d.toLocaleString(locale, { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
            <Pill status={a.status} label={statusLabel[a.status] ?? a.status} />
          </div>
          <p className="mt-0.5 truncate text-[14.5px] font-semibold" style={{ color: INK }}>{a.services?.name ?? '—'}</p>
          <p className="truncate text-[12.5px]" style={{ color: MUTED }}>{a.customer_name} · {durMin(a)} {t.min}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <Card title={t.sales} sub={t.last7}>
        <p className="mt-3 text-[30px] leading-none font-bold tracking-[-0.02em]" style={{ color: INK }}>{format(sales.reduce((s, v) => s + v, 0))}</p>
        <p className="mt-3 text-[13px]" style={{ color: INK }}>{t.appts} <b>{pastCount}</b></p>
        <p className="text-[13px]" style={{ color: INK }}>{t.apptValue} <b>{format(booked.reduce((s, v) => s + v, 0))}</b></p>
        <SalesChart days={past} sales={sales} booked={booked} format={format} labels={[t.salesS, t.bookedS]} locale={locale} />
        <p className="mt-2 text-[11.5px]" style={{ color: MUTED }}>{t.salesNote}</p>
      </Card>

      <Card title={t.upcoming} sub={upcomingList.length ? `${t.next7} · ${t.booked(upcomingList.length)}` : t.next7}>
        {upcomingList.length
          ? <UpcomingBars days={next} counts={upCounts} locale={locale} />
          : <Empty icon={BarChart3} title={t.emptyUp} sub={t.emptyUpSub} action={{ href: '/dashboard/link', label: t.shareLink }} />}
      </Card>

      <Card title={t.activity}>
        {activity.length
          ? <div className="mt-2">{activity.map(a => <div key={a.id}>{apptLine(a)}</div>)}</div>
          : <Empty icon={CalendarClock} title={t.noActivity} sub={t.noActivitySub} />}
      </Card>

      <Card title={t.today}>
        {todayNext.length
          ? <div className="mt-2">{todayNext.slice(0, 5).map(a => <div key={a.id}>{apptLine(a)}</div>)}</div>
          : <Empty icon={CalendarClock} title={t.noToday} sub={t.noTodaySub} action={{ href: '/dashboard/calendar', label: t.openCal }} />}
      </Card>

      <Card title={t.topServices}>
        <RankTable head={[t.service, t.thisMonth, t.lastMonth]} rows={rank(a => a.services?.name ?? null)}
          empty={<Empty icon={LineChart} title={t.noServices} sub={t.noServicesSub} />} />
      </Card>

      <Card title={t.topClients}>
        <RankTable head={[t.client, t.thisMonth, t.lastMonth]} rows={rank(a => a.customer_name?.trim() || null)}
          empty={<Empty icon={Users} title={t.noClients} sub={t.noClientsSub} />} />
      </Card>
    </div>
  )
}
