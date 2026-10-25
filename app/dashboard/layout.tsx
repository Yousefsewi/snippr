'use client'

import { ReactNode, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { enforceRememberMe } from '@/lib/remember-me'
import { isOnboarded, markOnboarded } from '@/lib/onboarding'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { LanguageProvider, useLang } from '@/lib/i18n'
import { CurrencyProvider } from '@/lib/currency'
import { ThemeProvider, useTheme } from '@/lib/theme'
import { Home, Calendar, Hourglass, Receipt, ListChecks, Blocks, Scissors, User, CreditCard, Settings, HelpCircle, LogOut, Search, LifeBuoy, MoreHorizontal, Link2, type LucideIcon } from 'lucide-react'
import NotificationOptIn from '@/components/notification-opt-in'
import { useStored } from '@/lib/use-stored'
import { glass, glassHover, GLASS_WASH, SALON_STYLE_KEY, getSalonStyle } from '@/lib/glass'

const navIcons: Record<string, LucideIcon> = {
  overview: Home, calendar: Calendar, waitlist: Hourglass, sales: Receipt, appointmentsNav: ListChecks, addons: Blocks, services: Scissors, profile: User,
}
const footerIcons: Record<string, LucideIcon> = {
  plansBilling: CreditCard, settings: Settings, help: HelpCircle,
}

type Notif = { id: string | number; text: string; type?: string; read: boolean; created_at: string; href?: string }

// Relative time, supports both past ("2h ago") and future ("in 2h")
const relTime = (iso: string) => {
  const diff = new Date(iso).getTime() - Date.now()
  const s = Math.abs(diff) / 1000
  if (s < 60) return 'just now'
  let label: string
  if (s < 3600) label = `${Math.floor(s / 60)}m`
  else if (s < 86400) label = `${Math.floor(s / 3600)}h`
  else label = `${Math.floor(s / 86400)}d`
  return diff > 0 ? `in ${label}` : `${label} ago`
}

const navItems = [
  { href: '/dashboard',          key: 'overview' as const },
  { href: '/dashboard/calendar', key: 'calendar' as const },
  { href: '/dashboard/appointments', key: 'appointmentsNav' as const },
  { href: '/dashboard/waitlist', key: 'waitlist' as const },
  { href: '/dashboard/sales',    key: 'sales' as const },
  { href: '/dashboard/addons',   key: 'addons' as const },
  { href: '/dashboard/services', key: 'services' as const },
]

const footerItems = [
  { href: '/dashboard/plans',    key: 'plansBilling' as const },
]

// Getting-started tips. Only real, working features — no made-up promotions.
// Clicking a notification navigates to its `href`.
const ANNOUNCEMENTS: Notif[] = [
  { id: 'n1', text: '✂️ Add your services and prices so clients can pick what they want.',            read: false, created_at: new Date(Date.now() - 1 * 3600000).toISOString(),  type: 'feature', href: '/dashboard/services' },
  { id: 'n2', text: '🕘 Set your working hours — clients can only book when you are open.',           read: false, created_at: new Date(Date.now() - 2 * 3600000).toISOString(),  type: 'feature', href: '/dashboard/profile/edit' },
  { id: 'n3', text: '📣 Share your booking link on Instagram & WhatsApp to get your first bookings.', read: false, created_at: new Date(Date.now() - 3 * 3600000).toISOString(),  type: 'promo',   href: '/dashboard/link' },
  { id: 'n4', text: '📅 Your calendar is live — new bookings appear instantly.',                      read: true,  created_at: new Date(Date.now() - 4 * 3600000).toISOString(),  type: 'feature', href: '/dashboard/calendar' },
]


export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <LanguageProvider>
      <CurrencyProvider>
        <ThemeProvider>
          <Chrome>{children}</Chrome>
          <NotificationOptIn />
        </ThemeProvider>
      </CurrencyProvider>
    </LanguageProvider>
  )
}

function Chrome({ children }: { children: ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const { t, isRTL } = useLang()
  const { theme } = useTheme()
  const [loggingOut, setLoggingOut] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>(ANNOUNCEMENTS)
  const [me, setMe] = useState<{ name: string; email: string; photo: string | null }>({ name: '', email: '', photo: null })
  // Services visibility is controlled from Settings (persisted in localStorage)
  const servicesOn = useStored('snippr:services') !== 'off'
  // Salon style (Settings → Salon style): pastel hair salon or black/grey barbershop
  const salonStyle = getSalonStyle(useStored(SALON_STYLE_KEY))

  // Full-bleed dashboard views render their own background — no narrow centered box
  const fullBleed = pathname === '/dashboard/calendar' || pathname === '/dashboard/appointments' || pathname === '/dashboard' || pathname === '/dashboard/profile' || pathname === '/dashboard/link'

  // Load the signed-in barber for the sidebar profile card.
  // If the account exists but the barber profile row was never created
  // (e.g. they confirmed via the email link instead of finishing the
  // register form), create it here so the rest of the dashboard works.
  useEffect(() => {
    let active = true
    ;(async () => {
      if (await enforceRememberMe()) { router.replace('/login'); return }
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      let { data: barber } = await supabase.from('barbers').select('id, name, photo_url, working_hours').eq('user_id', user.id).single()

      if (!barber) {
        const emailPrefix = (user.email ?? 'barber').split('@')[0]
        const baseSlug = emailPrefix.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'barber'
        const slug = `${baseSlug}-${user.id.slice(0, 6)}`
        const { data: created } = await supabase
          .from('barbers')
          .insert({ user_id: user.id, email: user.email, name: emailPrefix, slug })
          .select('id, name, photo_url, working_hours')
          .single()
        barber = created
      }

      if (!barber || !active) return
      // brand-new shop (no hours, no services yet): run the setup questions first
      if (!barber.working_hours && !isOnboarded(user.id)) {
        const { count } = await supabase.from('services').select('id', { count: 'exact', head: true }).eq('barber_id', barber.id)
        if (!count) { router.replace('/onboarding'); return }
        markOnboarded(user.id)
      }
      setMe({ name: barber.name ?? '', email: user.email ?? '', photo: barber.photo_url ?? null })
    })()
    return () => { active = false }
  }, [router])

  const markAllRead = () => setNotifs(prev => prev.map(n => ({ ...n, read: true })))

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const unreadCount = notifs.filter(n => !n.read).length
  const today = new Date()

  // shared styles
  const sectionLabel: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: '#9b9a97',
    letterSpacing: '0.05em', textTransform: 'uppercase',
    margin: '0 0 8px', padding: '0 8px',
  }
  // iOS "liquid glass": every item is its own frosted tile; the active one is brighter
  const navLink = (active: boolean): React.CSSProperties => ({
    ...glass(active),
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '8px 10px', borderRadius: 14, textDecoration: 'none',
    color: active ? '#1d1d1f' : '#5f5e5b',
    fontSize: 15, fontWeight: active ? 600 : 500,
    transition: 'background 0.18s, box-shadow 0.18s, transform 0.18s', whiteSpace: 'nowrap',
  })

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ display: 'flex', minHeight: '100vh', background: '#f7f7f5', color: '#37352f', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontWeight: 500, ['--accent' as string]: salonStyle.key === 'barber' ? salonStyle.accent : theme.accent, ['--accent-2' as string]: salonStyle.accent2, ['--glass-wash' as string]: salonStyle.wash, ['--glass-page-wash' as string]: salonStyle.pageWash } as React.CSSProperties}>

      {/* ── Sidebar (Notion light) ── */}
      <aside style={{
        width: collapsed ? 56 : 250,
        flexShrink: 0,
        // soft colour wash behind the glass tiles so the frosting is visible
        background: GLASS_WASH,
        borderRight: '1px solid #e9e9e7',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        transition: 'width 0.2s ease',
        zIndex: 40,
        overflow: 'hidden',
      }}>

        {/* Workspace header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 12px 10px',
          borderBottom: '1px solid #e9e9e7',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            {collapsed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/icon-192.png" alt="Snippr" style={{ width: 32, height: 32, borderRadius: 9, flexShrink: 0, display: 'block' }} />
            ) : (
              <div style={{ overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" alt="Snippr" style={{ height: 24, width: 'auto', display: 'block', margin: '2px 0 3px' }} />
                <p style={{ fontSize: 12, color: '#9b9a97', margin: 0 }}>Book smarter</p>
              </div>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{ background: 'none', border: 'none', color: '#9b9a97', cursor: 'pointer', fontSize: 15, padding: 4 }}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Scrollable middle */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 4 }}>

          {/* Search (Riter-style) */}
          {collapsed ? (
            <button style={{ ...glass(), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0', borderRadius: 14, cursor: 'pointer', marginBottom: 4 }}>
              <Search size={16} strokeWidth={1.75} color="#9b9a97" />
            </button>
          ) : (
            <div style={{ ...glass(), display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', borderRadius: 14, marginBottom: 6 }}>
              <Search size={15} strokeWidth={1.75} color="#9b9a97" style={{ flexShrink: 0 }} />
              <input
                placeholder="Search…"
                style={{ flex: 1, minWidth: 0, border: 'none', outline: 'none', background: 'transparent', fontSize: 14.5, color: '#37352f', fontFamily: 'inherit' }}
              />
            </div>
          )}


          {/* Main nav */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {navItems.filter(item => item.key !== 'services' || servicesOn).map((item) => {
              const isActive = pathname === item.href || (item.href === '/dashboard/addons' && (pathname.startsWith('/dashboard/addons') || pathname === '/dashboard/messages'))
              const Icon = navIcons[item.key]
              return (
                <Link key={item.href} href={item.href} style={navLink(isActive)}
                  onMouseEnter={e => { if (!isActive) glassHover(e, true) }}
                  onMouseLeave={e => { if (!isActive) glassHover(e, false) }}
                >
                  {collapsed
                    ? <Icon size={17} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                    : <><Icon size={17} strokeWidth={1.75} style={{ flexShrink: 0, color: isActive ? '#37352f' : '#9b9a97' }} /><span>{t[item.key]}</span></>}
                </Link>
              )
            })}
          </nav>

          {/* Notifications */}
          <div style={{ position: 'relative', marginTop: 4 }}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            style={{
              ...glass(showNotif),
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '8px 10px', borderRadius: 14, cursor: 'pointer',
              color: '#5f5e5b', fontSize: 15, fontWeight: 500, textAlign: 'left', whiteSpace: 'nowrap',
              justifyContent: collapsed ? 'center' : undefined,
              transition: 'background 0.18s, transform 0.18s',
            }}
            onMouseEnter={e => { if (!showNotif) glassHover(e, true) }}
            onMouseLeave={e => { if (!showNotif) glassHover(e, false) }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {!collapsed && <span style={{ flex: 1 }}>{t.notifications}</span>}
            {!collapsed && unreadCount > 0 && (
              <span style={{ background: '#eb5757', color: '#fff', fontSize: 10, fontWeight: 600, borderRadius: 20, padding: '1px 6px' }}>{unreadCount}</span>
            )}
            {collapsed && unreadCount > 0 && (
              <span style={{ position: 'absolute', marginLeft: 14, marginTop: -10, width: 7, height: 7, borderRadius: '50%', background: '#eb5757' }} />
            )}
          </button>

          {/* Notifications dropdown */}
          {showNotif && (
            <>
            {/* click-away overlay */}
            <div onClick={() => setShowNotif(false)} style={{ position: 'fixed', inset: 0, zIndex: 39 }} />
            <div style={{ position: 'fixed', right: collapsed ? 'calc(100vw - 56px - 300px - 8px)' : 'calc(100vw - 250px - 300px - 8px)', top: '130px', width: '300px', background: '#ffffff', border: '1px solid #e9e9e7', borderRadius: 16, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', maxHeight: '400px', overflowY: 'auto', zIndex: 41 }}>
              {notifs.length === 0 ? (
                <p style={{ fontSize: 13, color: '#9b9a97', textAlign: 'center', padding: '16px 10px', margin: 0 }}>{t.noNotifications}</p>
              ) : notifs.map(n => {
                const colors: Record<string, { bg: string; dot: string }> = {
                  discount: { bg: '#fdf2f8', dot: '#db2777' },
                  feature:  { bg: '#eff6ff', dot: '#3b82f6' },
                  promo:    { bg: '#f0fdf4', dot: '#22c55e' },
                }
                const c = colors[n.type ?? 'feature'] ?? colors.feature
                return (
                  <Link
                    key={n.id}
                    href={n.href ?? '#'}
                    onClick={() => { setShowNotif(false); setNotifs(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x)) }}
                    style={{ display: 'flex', gap: 8, padding: '11px 11px', borderBottom: '1px solid #f7f7f5', background: n.read ? '#ffffff' : c.bg, transition: 'background 0.2s', textDecoration: 'none', cursor: 'pointer' }}
                    onMouseEnter={e => { glassHover(e, true) }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.read ? '#ffffff' : c.bg }}
                  >
                    <span style={{ width: 6, height: 6, borderRadius: '50%', marginTop: 5, flexShrink: 0, background: !n.read ? c.dot : '#d3d3d1' }} />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 13.5, color: '#37352f', margin: 0, lineHeight: 1.35, fontWeight: n.read ? 500 : 600 }}>{n.text}</p>
                      <p style={{ fontSize: 10.5, color: '#9b9a97', margin: '2px 0 0' }}>{relTime(n.created_at)}</p>
                    </div>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#c0c0c0" strokeWidth="2" style={{ flexShrink: 0, marginTop: 3 }}><path d="M9 18l6-6-6-6"/></svg>
                  </Link>
                )
              })}
              {notifs.length > 0 && (
                <button onClick={markAllRead} style={{ width: '100%', padding: '8px', background: 'none', border: 'none', color: '#787774', fontSize: 13, cursor: 'pointer' }}>
                  {t.markAllRead}
                </button>
              )}
            </div>
            </>
          )}
          </div>

          {!collapsed && (
            <>
              {/* Today's calendar widget */}
              <div style={{ marginTop: 14 }}>
                <p style={sectionLabel}>{t.today}</p>
                <Link href="/dashboard/calendar" style={{ textDecoration: 'none' }}>
                  <div style={{ ...glass(), display: 'flex', alignItems: 'center', gap: 12, margin: '0 2px', padding: '10px 12px', borderRadius: 18 }}>
                    <div style={{ textAlign: 'center', lineHeight: 1, flexShrink: 0 }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#eb5757', textTransform: 'uppercase' }}>
                        {today.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#37352f' }}>{today.getDate()}</div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#37352f', margin: 0 }}>
                        {today.toLocaleDateString('en-US', { weekday: 'long' })}
                      </p>
                      <p style={{ fontSize: 12.5, color: '#9b9a97', margin: '2px 0 0' }}>{t.viewCalendar}</p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Upgrade / Plans card */}
              <div style={{ marginTop: 'auto', paddingTop: 16, padding: '16px 2px 0' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', borderRadius: 20, padding: 14 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>{t.freePlanTitle}</p>
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', margin: '4px 0 10px', lineHeight: 1.4 }}>
                    {t.freePlanSub}
                  </p>
                  <Link href="/dashboard/plans" style={{
                    display: 'block', textAlign: 'center', background: '#fff', color: '#1f1f1f',
                    fontSize: 13.5, fontWeight: 600, padding: '7px 0', borderRadius: 14, textDecoration: 'none',
                  }}>
                    {t.upgradePlan}
                  </Link>
                </div>
              </div>

            </>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '8px 6px', borderTop: '1px solid rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: 6 }}>

          {footerItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = footerIcons[item.key]
            return (
              <Link key={item.href} href={item.href} style={{ ...navLink(isActive), fontSize: 14 }}
                onMouseEnter={e => { if (!isActive) glassHover(e, true) }}
                onMouseLeave={e => { if (!isActive) glassHover(e, false) }}
              >
                {collapsed
                  ? <Icon size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                  : <><Icon size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} /><span>{t[item.key]}</span></>}
              </Link>
            )
          })}

          {/* User profile card + menu */}
          {!collapsed ? (
            <div style={{ position: 'relative', marginTop: 8 }}>

              {/* Pop-up menu */}
              {showProfileMenu && (
                <>
                  {/* click-away overlay */}
                  <div onClick={() => setShowProfileMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 45 }} />
                  <div style={{ position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0, background: 'rgba(255,255,255,0.72)', backdropFilter: 'blur(24px) saturate(180%)', WebkitBackdropFilter: 'blur(24px) saturate(180%)', border: '1px solid rgba(255,255,255,0.8)', borderRadius: 18, boxShadow: '0 12px 32px rgba(30,30,60,0.16)', padding: 6, zIndex: 46, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {/* Booking link */}
                    <Link href="/dashboard/link" onClick={() => setShowProfileMenu(false)}
                      style={{ ...navLink(pathname === '/dashboard/link'), fontSize: 14 }}
                      onMouseEnter={e => { if (pathname !== '/dashboard/link') glassHover(e, true) }}
                      onMouseLeave={e => { if (pathname !== '/dashboard/link') glassHover(e, false) }}
                    >
                      <Link2 size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                      <span>Booking link</span>
                    </Link>
                    {/* Need support? */}
                    <Link href="/dashboard/help" onClick={() => setShowProfileMenu(false)}
                      style={{ ...navLink(false), fontSize: 14, justifyContent: 'space-between' }}
                      onMouseEnter={e => { glassHover(e, true) }}
                      onMouseLeave={e => { glassHover(e, false) }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <LifeBuoy size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                        Need support?
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: 'var(--accent)', borderRadius: 6, padding: '2px 6px' }}>New</span>
                    </Link>
                    {/* Settings */}
                    <Link href="/dashboard/settings" onClick={() => setShowProfileMenu(false)}
                      style={{ ...navLink(pathname === '/dashboard/settings'), fontSize: 14 }}
                      onMouseEnter={e => { if (pathname !== '/dashboard/settings') glassHover(e, true) }}
                      onMouseLeave={e => { if (pathname !== '/dashboard/settings') glassHover(e, false) }}
                    >
                      <Settings size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                      <span>{t.settings}</span>
                    </Link>
                    {/* Help & Instructions */}
                    <Link href="/dashboard/help" onClick={() => setShowProfileMenu(false)}
                      style={{ ...navLink(pathname === '/dashboard/help'), fontSize: 14 }}
                      onMouseEnter={e => { if (pathname !== '/dashboard/help') glassHover(e, true) }}
                      onMouseLeave={e => { if (pathname !== '/dashboard/help') glassHover(e, false) }}
                    >
                      <HelpCircle size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                      <span>{t.help}</span>
                    </Link>
                    <div style={{ height: 1, background: '#e9e9e7', margin: '6px 4px' }} />
                    {/* Sign out */}
                    <button onClick={handleLogout} disabled={loggingOut}
                      style={{ ...navLink(false), fontSize: 14, width: '100%', cursor: 'pointer', color: '#eb5757' }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#fdf0f0' }}
                      onMouseLeave={e => { glassHover(e, false) }}
                    >
                      <LogOut size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                      <span>{loggingOut ? t.signingOut : t.signOut}</span>
                    </button>
                  </div>
                </>
              )}

              <div style={{ ...glass(true), display: 'flex', alignItems: 'center', gap: 4, padding: '7px 7px 7px 10px', borderRadius: 18 }}>
                {/* avatar + name → profile */}
                <Link href="/dashboard/profile" style={{ display: 'flex', alignItems: 'center', gap: 9, flex: 1, minWidth: 0, textDecoration: 'none', borderRadius: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 9, overflow: 'hidden', flexShrink: 0, background: '#f7f7f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {me.photo
                      ? <img src={me.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      : <span style={{ fontSize: 15, fontWeight: 700, color: '#787774' }}>{(me.name || me.email || '?').charAt(0).toUpperCase()}</span>}
                  </div>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: '#37352f', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.name || 'Your account'}</p>
                    <p style={{ fontSize: 12, color: '#9b9a97', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.email}</p>
                  </div>
                </Link>
                {/* ... → menu */}
                <button
                  onClick={() => setShowProfileMenu(o => !o)}
                  title="More"
                  style={{ flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, border: 'none', background: 'none', color: '#9b9a97', cursor: 'pointer' }}
                  onMouseEnter={e => { glassHover(e, true) }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'none' }}
                >
                  <MoreHorizontal size={16} strokeWidth={1.75} />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title={t.signOut}
              style={{ ...glass(), display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', color: '#787774', padding: '8px 0', borderRadius: 14, cursor: 'pointer', marginTop: 4, transition: 'background 0.18s, transform 0.18s' }}
              onMouseEnter={e => glassHover(e, true)}
              onMouseLeave={e => glassHover(e, false)}
            >
              <LogOut size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main style={{
        marginLeft: collapsed ? 56 : 250,
        flex: 1,
        transition: 'margin-left 0.2s ease',
        minHeight: '100vh',
        background: '#ffffff',
        borderRadius: '18px 0 0 18px',
        borderTop: '1px solid #e9e9e7',
        borderLeft: '1px solid #e9e9e7',
        boxShadow: '-3px 0 16px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}>
        {fullBleed ? (
          children
        ) : (
          <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 40px 80px' }}>
            {children}
          </div>
        )}
      </main>

    </div>
  )
}
