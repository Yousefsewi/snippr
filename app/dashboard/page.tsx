'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/lib/i18n'
import { useCurrency } from '@/lib/currency'
import { FIRST_VISIT_DISCOUNT } from '@/lib/features'
import { glass, glassHover, GLASS_PAGE_WASH as PAGE_WASH } from '@/lib/glass'

interface Barber {
  id: string; name: string; slug: string; photo_url: string | null
}
interface Appointment {
  id: string; customer_name: string; customer_phone: string | null
  start_time: string; end_time: string; status: string
  service_id: string | null; services: { name: string; price: number } | null
  discount_percent?: number // first-visit discount applied by the database
}

const statusPill: Record<string, string> = {
  pending:   'bg-[#fdecc8] text-[#402c1b]',
  confirmed: 'bg-[#dbeddb] text-[#1c3829]',
  cancelled: 'bg-[#ffe2dd] text-[#5d1715]',
  completed: 'bg-[#e3e2e0] text-[#32302c]',
}

const quickLinks = [
  { href: '/dashboard/calendar', titleKey: 'calendar' as const, subKey: 'schedule' as const },
  { href: '/dashboard/services', titleKey: 'services' as const, subKey: 'manageOfferings' as const },
  { href: '/dashboard/profile',  titleKey: 'profile' as const,  subKey: 'yourDetails' as const },
]

export default function DashboardPage() {
  const router = useRouter()
  const { t, isRTL } = useLang()
  const { format } = useCurrency()
  const [loading, setLoading]       = useState(true)
  const [barber, setBarber]         = useState<Barber | null>(null)
  const [appointments, setAppts]    = useState<Appointment[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) { router.push('/login'); return }

      const { data } = await supabase
        .from('barbers').select('id, name, slug, photo_url').eq('user_id', user.id).single()
      if (!data) { setLoading(false); return }
      setBarber(data)

      const { data: appts } = await supabase
        .from('appointments').select('*, services(name, price)')
        .eq('barber_id', data.id).order('start_time', { ascending: false })
      setAppts((appts as Appointment[]) || [])
      setLoading(false)
    })()
  }, [router])

  // Live: a booking made from the public link instantly shows up in the list
  useEffect(() => {
    if (!barber) return
    const channel = supabase
      .channel(`dash-appts-${barber.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'appointments', filter: `barber_id=eq.${barber.id}` },
        async () => {
          const { data: appts } = await supabase
            .from('appointments').select('*, services(name, price)')
            .eq('barber_id', barber.id).order('start_time', { ascending: false })
          setAppts((appts as Appointment[]) || [])
        })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [barber])

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id)
    await supabase.from('appointments').update({ status }).eq('id', id)
    setAppts(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setUpdatingId(null)
  }

  const fmt     = (iso: string) => new Date(iso).toLocaleString('tr-TR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })
  const fmtTime = (iso: string) => new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', border: '2px solid #e9e9e7', borderTopColor: '#37352f', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )

  if (!barber) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', color: '#9b9a97', fontSize: 14 }}>
      No barber profile found.
    </div>
  )

  const upcoming        = appointments.filter(a => new Date(a.start_time) >= new Date() && a.status !== 'cancelled')
  const uniqueCustomers = new Set(appointments.map(a => a.customer_name)).size
  const revenue         = appointments.filter(a => ['completed','confirmed'].includes(a.status)).reduce((s, a) => s + (a.services?.price ?? 0) * (100 - (FIRST_VISIT_DISCOUNT ? (a.discount_percent ?? 0) : 0)) / 100, 0)

  const hour = new Date().getHours()
  const greeting = hour < 12 ? t.greetMorning : hour < 18 ? t.greetAfternoon : t.greetEvening

  const statusLabel: Record<string, string> = {
    pending: t.st_pending, confirmed: t.st_confirmed, cancelled: t.st_cancelled, completed: t.st_completed,
  }

  const stats = [
    { label: t.totalAppointments, value: appointments.length, sub: t.allTime },
    { label: t.uniqueCustomers,   value: uniqueCustomers,     sub: t.allTime },
    { label: t.revenue,           value: format(revenue),     sub: t.confirmedCompleted },
  ]

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ background: PAGE_WASH, minHeight: '100vh', color: '#37352f', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 48px 96px', animation: 'fadeIn 0.35s ease' }}>
        <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

        {/* Greeting */}
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, letterSpacing: '-0.02em', margin: 0, color: '#37352f' }}>
            {greeting}, {barber.name}
          </h1>
          <p style={{ marginTop: 6, fontSize: 14, color: '#9b9a97', margin: 0 }}>
            {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
            {' · '}{upcoming.length} {t.upcomingWord} {upcoming.length !== 1 ? t.apptWordPlural : t.apptWord}
          </p>
        </div>

        {/* Quick access */}
        <section style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#9b9a97', letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 12px 4px' }}>{t.quickAccess}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
            {quickLinks.map(({ href, titleKey, subKey }) => (
              <Link key={href} href={href} style={{ ...glass(), display: 'block', padding: 18, borderRadius: 20, textDecoration: 'none', transition: 'background 0.18s, transform 0.18s' }}
                onMouseEnter={e => glassHover(e, true)}
                onMouseLeave={e => glassHover(e, false)}
              >
                <p style={{ fontSize: 14, fontWeight: 500, color: '#37352f', margin: 0 }}>{t[titleKey]}</p>
                <p style={{ fontSize: 13, color: '#9b9a97', margin: '4px 0 0' }}>{t[subKey]}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* At a glance */}
        <section style={{ marginBottom: 40 }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: '#9b9a97', letterSpacing: '0.05em', textTransform: 'uppercase', margin: '0 0 12px 4px' }}>{t.atAGlance}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
            {stats.map(({ label, value, sub }) => (
              <div key={label} style={{ ...glass(), padding: 18, borderRadius: 20, transition: 'background 0.18s, transform 0.18s' }}
                onMouseEnter={e => glassHover(e, true)}
                onMouseLeave={e => glassHover(e, false)}
              >
                <p style={{ fontSize: 22, fontWeight: 600, color: '#37352f', margin: 0 }}>{value}</p>
                <p style={{ fontSize: 14, color: '#37352f', margin: '4px 0 0' }}>{label}</p>
                <p style={{ fontSize: 12, color: '#9b9a97', margin: 0 }}>{sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Appointments */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: '#9b9a97', letterSpacing: '0.05em', textTransform: 'uppercase', margin: 0 }}>{t.allAppointments}</p>
            <span style={{ fontSize: 12, color: '#9b9a97' }}>{appointments.length} {t.totalWord}</span>
          </div>
          <div style={{ ...glass(), overflow: 'hidden', borderRadius: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 130px 120px 110px', borderBottom: '1px solid rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.35)', padding: '12px 16px', fontSize: 12, fontWeight: 500, color: '#9b9a97' }}>
              <span>{t.colCustomer}</span><span>{t.colService}</span><span>{t.colDate}</span><span style={{ textAlign: 'right' }}>{t.colStatus}</span>
            </div>
            {appointments.length === 0 ? (
              <div style={{ padding: '56px 24px', textAlign: 'center', fontSize: 14, color: '#9b9a97' }}>{t.noAppointments}</div>
            ) : appointments.map((appt) => {
              const pill = statusPill[appt.status] ?? statusPill.completed
              const isExpanded = expandedId === appt.id
              return (
                <div key={appt.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.6)' }}>
                  <div onClick={() => setExpandedId(isExpanded ? null : appt.id)}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 130px 120px 110px', alignItems: 'center', padding: '11px 16px', cursor: 'pointer', background: isExpanded ? 'rgba(255,255,255,0.6)' : 'transparent', transition: 'background 0.15s' }}
                    onMouseEnter={e => { if (!isExpanded) e.currentTarget.style.background = 'rgba(255,255,255,0.5)' }}
                    onMouseLeave={e => { if (!isExpanded) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: '#e9e9e7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 600, color: '#787774' }}>
                        {appt.customer_name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontSize: 14, color: '#37352f' }}>{appt.customer_name}</span>
                    </div>
                    <span style={{ fontSize: 14, color: '#9b9a97' }}>
                      {appt.services?.name ?? '—'}
                      {FIRST_VISIT_DISCOUNT && !!appt.discount_percent && <span title="First-visit discount" style={{ marginLeft: 6, fontSize: 11, fontWeight: 600, color: '#9d174d', background: '#fce7f3', borderRadius: 6, padding: '1px 6px' }}>🎁 −{appt.discount_percent}%</span>}
                    </span>
                    <span style={{ fontSize: 12, color: '#9b9a97' }}>{fmt(appt.start_time)}</span>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
                      <span className={pill} style={{ borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 500 }}>{statusLabel[appt.status] ?? appt.status}</span>
                      <span style={{ fontSize: 10, color: '#9b9a97', display: 'inline-block', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▼</span>
                    </div>
                  </div>
                  {isExpanded && (
                    <div style={{ background: 'rgba(255,255,255,0.4)', padding: '16px 16px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 12 }}>
                        {[
                          { l: 'Date',    v: fmtDate(appt.start_time) },
                          { l: 'Time',    v: `${fmtTime(appt.start_time)} – ${fmtTime(appt.end_time)}` },
                          { l: 'Service', v: appt.services?.name ?? '—' },
                          ...(FIRST_VISIT_DISCOUNT && appt.discount_percent ? [{ l: 'First-visit discount', v: appt.services ? `${appt.discount_percent}% — customer pays ${format(Math.round(appt.services.price * (100 - appt.discount_percent)) / 100)}` : `${appt.discount_percent}%` }] : []),
                          { l: 'Phone',   v: appt.customer_phone ?? '—' },
                        ].map(({ l, v }) => (
                          <div key={l} style={{ ...glass(true), padding: '10px 12px', borderRadius: 14 }}>
                            <p style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.08em', color: '#9b9a97', margin: 0, textTransform: 'uppercase' }}>{l}</p>
                            <p style={{ fontSize: 13, color: '#37352f', margin: '3px 0 0' }}>{v}</p>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {appt.status !== 'confirmed' && (
                          <button onClick={e => { e.stopPropagation(); updateStatus(appt.id, 'confirmed') }} disabled={updatingId === appt.id}
                            className="bg-[#dbeddb] text-[#1c3829]" style={{ borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', opacity: updatingId === appt.id ? 0.5 : 1 }}>
                            {t.confirm}
                          </button>
                        )}
                        {appt.status !== 'completed' && (
                          <button onClick={e => { e.stopPropagation(); updateStatus(appt.id, 'completed') }} disabled={updatingId === appt.id}
                            style={{ borderRadius: 8, border: '1px solid #e9e9e7', background: '#fff', color: '#37352f', padding: '8px 14px', fontSize: 12, fontWeight: 500, cursor: 'pointer', opacity: updatingId === appt.id ? 0.5 : 1 }}>
                            {t.markComplete}
                          </button>
                        )}
                        {appt.status !== 'cancelled' && (
                          <button onClick={e => { e.stopPropagation(); updateStatus(appt.id, 'cancelled') }} disabled={updatingId === appt.id}
                            className="bg-[#ffe2dd] text-[#5d1715]" style={{ borderRadius: 8, padding: '8px 14px', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer', opacity: updatingId === appt.id ? 0.5 : 1 }}>
                            {t.cancel}
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      </div>
    </div>
  )
}
