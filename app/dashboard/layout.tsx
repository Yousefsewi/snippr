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
import { Bell, Home, Calendar, Hourglass, Receipt, ListChecks, Blocks, PanelLeftClose, PanelLeftOpen, Scissors, User, CreditCard, Settings, HelpCircle, LogOut, Search, LifeBuoy, MoreHorizontal, Link2, type LucideIcon } from 'lucide-react'
import NotificationOptIn from '@/components/notification-opt-in'
import MobileTabBar from '@/components/mobile-tab-bar'
import { useStored, writeStored } from '@/lib/use-stored'
import { glass, glassHover, GLASS_WASH, SALON_STYLE_KEY, getSalonStyle } from '@/lib/glass'
import { isPlan, PLAN_NAMES, trialDaysLeft, trialCopy, type PlanId } from '@/lib/plan'
import { ANNOUNCEMENTS, NEWS_READ_KEY, newsDate, newsLang, parseRead, txt } from '@/lib/announcements'
import { L, SITE_LOCALE } from '@/lib/site-lang'

const navIcons: Record<string, LucideIcon> = {
  overview: Home, calendar: Calendar, waitlist: Hourglass, sales: Receipt, appointmentsNav: ListChecks, addons: Blocks, services: Scissors, profile: User,
}
const footerIcons: Record<string, LucideIcon> = {
  plansBilling: CreditCard, settings: Settings, help: HelpCircle,
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
  const { t, isRTL, lang } = useLang()
  const loc = SITE_LOCALE[lang]
  const { theme } = useTheme()
  const [loggingOut, setLoggingOut] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [showNotif, setShowNotif] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  // announcements (lib/announcements.ts); read ids are kept in this browser
  const newsRead = parseRead(useStored(NEWS_READ_KEY))
  const nl = newsLang(lang)
  const [me, setMe] = useState<{ name: string; email: string; photo: string | null }>({ name: '', email: '', photo: null })
  const [trial, setTrial] = useState<{ plan: string; left: number } | null>(null)
  // Services visibility is controlled from Settings (persisted in localStorage)
  const servicesOn = useStored('snippr:services') !== 'off'
  // Salon style (Settings → Salon style): pastel hair salon or black/grey barbershop
  const salonStyle = getSalonStyle(useStored(SALON_STYLE_KEY))

  // Full-bleed dashboard views render their own background — no narrow centered box
  const fullBleed = pathname === '/dashboard/calendar' || pathname === '/dashboard/appointments' || pathname === '/dashboard/plans' || pathname === '/dashboard' || pathname === '/dashboard/profile' || pathname === '/dashboard/link'

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
      // no date of birth / Terms acceptance yet (Google sign-in, or an account from before): finish that first
      if (!user.user_metadata?.terms_accepted_at) { router.replace('/complete-signup'); return }
      // no plan picked yet: choose one first (free trial, lib/plan.ts)
      if (!isPlan(user.user_metadata?.plan)) { router.replace('/choose-plan?next=/dashboard'); return }
      if (active) setTrial({ plan: PLAN_NAMES[user.user_metadata.plan as PlanId], left: trialDaysLeft(user.user_metadata.trial_started_at, Date.now()) })
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

  const markRead = (ids: string[]) => { try { writeStored(NEWS_READ_KEY, JSON.stringify([...new Set([...newsRead, ...ids])])) } catch { /* storage blocked */ } }
  const markAllRead = () => markRead(ANNOUNCEMENTS.map(a => a.id))

  const handleLogout = async () => {
    setLoggingOut(true)
    await supabase.auth.signOut()
    router.push('/login')
  }

  const unreadCount = ANNOUNCEMENTS.filter(a => !newsRead.includes(a.id)).length
  const today = new Date()

  // shared styles
  const sectionLabel: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: '#9b9a97',
    letterSpacing: '0.05em', textTransform: 'uppercase',
    margin: '0 0 8px', padding: '0 8px',
  }
  // iOS "liquid glass": every item is its own frosted tile; the active one is brighter
  const navLink = (active: boolean): React.CSSProperties => ({
    ...glass(active, 'tile'),
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '8px 10px', borderRadius: 14, textDecoration: 'none',
    color: active ? '#1d1d1f' : '#5f5e5b',
    fontSize: 15, fontWeight: active ? 600 : 500,
    transition: 'background 0.18s, box-shadow 0.18s, transform 0.18s', whiteSpace: 'nowrap',
  })

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ display: 'flex', minHeight: '100vh', background: '#f7f7f5', color: '#37352f', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', fontWeight: 500, ['--accent' as string]: salonStyle.key === 'barber' ? salonStyle.accent : theme.accent, ['--accent-2' as string]: salonStyle.accent2, ['--glass-wash' as string]: salonStyle.wash, ['--glass-page-wash' as string]: salonStyle.pageWash, ...salonStyle.vars } as React.CSSProperties}>

      {/* ── Sidebar (Notion light) — on phones the bottom tab bar replaces it ── */}
      <aside className="max-md:!hidden" style={{
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
        {/* collapsed: logo on top, expand button under it (the 56px column has no room side by side) */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between',
          flexDirection: collapsed ? 'column' : 'row', gap: collapsed ? 8 : 0,
          padding: collapsed ? '14px 0 10px' : '14px 12px 10px',
          borderBottom: '1px solid #e9e9e7',
        }}>
          <Link href="/dashboard" title={L(lang, { en: 'Home', nl: 'Home', de: 'Startseite', tr: 'Ana sayfa', ar: 'الرئيسية' })} aria-label={L(lang, { en: 'Dashboard home', nl: 'Dashboard-home', de: 'Dashboard-Startseite', tr: 'Panel ana sayfası', ar: 'الصفحة الرئيسية للوحة' })} style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', textDecoration: 'none', cursor: 'pointer' }}>
            {collapsed ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src="/logo.svg" alt="Snippr" style={{ width: 40, height: 'auto', flexShrink: 0, display: 'block' }} />
            ) : (
              <div style={{ overflow: 'hidden' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.svg" alt="Snippr" style={{ height: 24, width: 'auto', display: 'block', margin: '2px 0 3px' }} />
                <p style={{ fontSize: 12, color: '#9b9a97', margin: 0 }}>{L(lang, { en: 'Book smarter', nl: 'Slimmer boeken', de: 'Smarter buchen', tr: 'Akıllı randevu', ar: 'احجز بذكاء' })}</p>
              </div>
            )}
          </Link>
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? (L(lang, { en: 'Expand menu', nl: 'Menu uitklappen', de: 'Menü ausklappen', tr: 'Menüyü aç', ar: 'افتح القائمة' })) : (L(lang, { en: 'Collapse menu', nl: 'Menu inklappen', de: 'Menü einklappen', tr: 'Menüyü daralt', ar: 'صغّر القائمة' }))}
            aria-label={collapsed ? (L(lang, { en: 'Expand menu', nl: 'Menu uitklappen', de: 'Menü ausklappen', tr: 'Menüyü aç', ar: 'افتح القائمة' })) : (L(lang, { en: 'Collapse menu', nl: 'Menu inklappen', de: 'Menü einklappen', tr: 'Menüyü daralt', ar: 'صغّر القائمة' }))}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 30, height: 30, borderRadius: 9, background: 'none', border: 'none', color: '#9b9a97', cursor: 'pointer', flexShrink: 0, transition: 'background 0.15s, color 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.05)'; e.currentTarget.style.color = '#37352f' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#9b9a97' }}
          >
            {collapsed ? <PanelLeftOpen size={18} strokeWidth={1.8} /> : <PanelLeftClose size={18} strokeWidth={1.8} />}
          </button>
        </div>

        {/* Scrollable middle */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '8px 6px', display: 'flex', flexDirection: 'column', gap: 4 }}>

          {/* Search (Riter-style) */}
          {collapsed ? (
            <button style={{ ...glass(false, 'tile'), display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 0', borderRadius: 14, cursor: 'pointer', marginBottom: 4 }}>
              <Search size={16} strokeWidth={1.75} color="#9b9a97" />
            </button>
          ) : (
            <div style={{ ...glass(), display: 'flex', alignItems: 'center', gap: 8, padding: '9px 11px', borderRadius: 14, marginBottom: 6 }}>
              <Search size={15} strokeWidth={1.75} color="#9b9a97" style={{ flexShrink: 0 }} />
              <input
                placeholder={L(lang, { en: 'Search…', nl: 'Zoeken…', de: 'Suchen…', tr: 'Ara…', ar: 'بحث…' })}
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
              ...glass(showNotif, 'tile'),
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
            <div style={{ position: 'fixed', right: collapsed ? 'calc(100vw - 56px - 360px - 8px)' : 'calc(100vw - 250px - 360px - 8px)', top: '130px', width: '360px', background: '#ffffff', border: '1px solid #e9e9e7', borderRadius: 16, overflow: 'hidden', boxShadow: '0 12px 32px -12px rgba(0,0,0,0.18)', zIndex: 41 }}>
              {/* header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px 10px', borderBottom: '1px solid #f1f1ef' }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#37352f' }}>{t.notifications}</span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ background: 'none', border: 'none', padding: 0, color: '#787774', fontSize: 12.5, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {t.markAllRead}
                  </button>
                )}
              </div>
              <div style={{ maxHeight: 420, overflowY: 'auto' }}>
              {ANNOUNCEMENTS.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '28px 20px 30px' }}>
                  <span style={{ width: 40, height: 40, borderRadius: 11, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f5', border: '1px solid #ededec', color: '#9b9a97' }}>
                    <Bell size={19} strokeWidth={1.75} />
                  </span>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#37352f', margin: '12px 0 0' }}>{t.noNotifications}</p>
                  <p style={{ fontSize: 12.5, color: '#9b9a97', margin: '4px 0 0', lineHeight: 1.45 }}>
                    {L(lang, { en: 'New features and announcements will show up here.', nl: 'Nieuwe functies en aankondigingen verschijnen hier.', de: 'Neue Funktionen und Ankündigungen erscheinen hier.', tr: 'Yeni özellikler ve duyurular burada görünecek.', ar: 'ستظهر هنا الميزات الجديدة والإعلانات.' })}
                  </p>
                </div>
              ) : ANNOUNCEMENTS.map(a => {
                const unread = !newsRead.includes(a.id)
                return (
                  <Link
                    key={a.id}
                    href={`/dashboard/news/${a.id}`}
                    onClick={() => { setShowNotif(false); markRead([a.id]) }}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 14px', borderBottom: '1px solid #f7f7f5', background: '#ffffff', textDecoration: 'none', cursor: 'pointer', transition: 'background 0.15s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f7f7f5' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = '#ffffff' }}
                  >
                    {a.cover
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={a.cover} alt="" style={{ width: 64, height: 48, borderRadius: 8, objectFit: 'cover', flexShrink: 0, display: 'block' }} />
                      : <span style={{ width: 64, height: 48, borderRadius: 8, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f7f5', border: '1px solid #ededec', color: '#9b9a97' }}><Bell size={17} strokeWidth={1.75} /></span>}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 13.5, color: '#1d1d1f', margin: 0, lineHeight: 1.35, fontWeight: unread ? 600 : 500 }}>{txt(a.title, nl)}</p>
                      <p style={{ fontSize: 12.5, color: '#787774', margin: '3px 0 0', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{txt(a.summary, nl)}</p>
                      <p style={{ fontSize: 11.5, color: '#9b9a97', margin: '4px 0 0' }}>{newsDate(a.date, nl)}</p>
                    </div>
                    {unread && <span style={{ width: 7, height: 7, borderRadius: '50%', marginTop: 6, flexShrink: 0, background: '#1d1d1f' }} />}
                  </Link>
                )
              })}
              </div>
              <Link href="/dashboard/news" onClick={() => setShowNotif(false)}
                style={{ display: 'block', textAlign: 'center', padding: '11px 14px', borderTop: '1px solid #f1f1ef', fontSize: 13, fontWeight: 600, color: '#37352f', textDecoration: 'none' }}>
                {L(lang, { en: 'All announcements', nl: 'Alle aankondigingen', de: 'Alle Ankündigungen', tr: 'Tüm duyurular', ar: 'كل الإعلانات' })}
              </Link>
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
                        {today.toLocaleDateString(loc, { month: 'short' })}
                      </div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: '#37352f' }}>{today.getDate()}</div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 14, fontWeight: 500, color: '#37352f', margin: 0 }}>
                        {today.toLocaleDateString(loc, { weekday: 'long' })}
                      </p>
                      <p style={{ fontSize: 12.5, color: '#9b9a97', margin: '2px 0 0' }}>{t.viewCalendar}</p>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Upgrade / Plans card */}
              <div style={{ marginTop: 'auto', paddingTop: 16, padding: '16px 2px 0' }}>
                <div style={{ background: 'linear-gradient(135deg, var(--accent), var(--accent-2))', borderRadius: 20, padding: 14 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>{trial ? trialCopy(lang).title(trial.plan) : t.freePlanTitle}</p>
                  {trial && trial.left > 0 && <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: '4px 0 0' }}>{trialCopy(lang).left(trial.left)}</p>}
                  <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)', margin: '4px 0 10px', lineHeight: 1.4 }}>
                    {trial ? (trial.left > 0 ? trialCopy(lang).sub : trialCopy(lang).over) : t.freePlanSub}
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
                      <span>{L(lang, { en: 'Booking link', nl: 'Boekingslink', de: 'Buchungslink', tr: 'Randevu linki', ar: 'رابط الحجز' })}</span>
                    </Link>
                    {/* Need support? */}
                    <Link href="/dashboard/help" onClick={() => setShowProfileMenu(false)}
                      style={{ ...navLink(false), fontSize: 14, justifyContent: 'space-between' }}
                      onMouseEnter={e => { glassHover(e, true) }}
                      onMouseLeave={e => { glassHover(e, false) }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                        <LifeBuoy size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
                        {L(lang, { en: 'Need support?', nl: 'Hulp nodig?', de: 'Hilfe nötig?', tr: 'Destek mi lazım?', ar: 'تحتاج مساعدة؟' })}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', background: 'var(--accent)', borderRadius: 6, padding: '2px 6px' }}>{L(lang, { en: 'New', nl: 'Nieuw', de: 'Neu', tr: 'Yeni', ar: 'جديد' })}</span>
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
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: '#37352f', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.name || (L(lang, { en: 'Your account', nl: 'Je account', de: 'Dein Konto', tr: 'Hesabın', ar: 'حسابك' }))}</p>
                    <p style={{ fontSize: 12, color: '#9b9a97', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.email}</p>
                  </div>
                </Link>
                {/* ... → menu */}
                <button
                  onClick={() => setShowProfileMenu(o => !o)}
                  title={L(lang, { en: 'More', nl: 'Meer', de: 'Mehr', tr: 'Daha fazla', ar: 'المزيد' })}
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
              style={{ ...glass(false, 'tile'), display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', color: '#787774', padding: '8px 0', borderRadius: 14, cursor: 'pointer', marginTop: 4, transition: 'background 0.18s, transform 0.18s' }}
              onMouseEnter={e => glassHover(e, true)}
              onMouseLeave={e => glassHover(e, false)}
            >
              <LogOut size={16} strokeWidth={1.75} style={{ flexShrink: 0 }} />
            </button>
          )}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="min-w-0 max-md:!ml-0 max-md:!rounded-none max-md:!border-0 max-md:!shadow-none max-md:pb-[var(--tabbar-h)]" style={{
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
          <div className="max-md:!px-4 max-md:!pt-6 max-md:!pb-10" style={{ maxWidth: 900, margin: '0 auto', padding: '48px 40px 80px' }}>
            {children}
          </div>
        )}
      </main>

      {/* ── Phone navigation ── */}
      <MobileTabBar
        pathname={pathname}
        lng={lang}
        me={me}
        onLogout={handleLogout}
        tabs={[
          { href: '/dashboard', label: t.overview, Icon: Home },
          { href: '/dashboard/calendar', label: t.calendar, Icon: Calendar },
          { href: '/dashboard/appointments', label: t.appointmentsNav, Icon: ListChecks },
          { href: '/dashboard/sales', label: t.sales, Icon: Receipt },
        ]}
        more={[
          { href: '/dashboard/waitlist', label: t.waitlist, Icon: Hourglass },
          ...(servicesOn ? [{ href: '/dashboard/services', label: t.services, Icon: Scissors }] : []),
          { href: '/dashboard/profile', label: t.profile, Icon: User },
          { href: '/dashboard/link', label: L(lang, { en: 'Booking link', nl: 'Boekingslink', de: 'Buchungslink', tr: 'Randevu linki', ar: 'رابط الحجز' }), Icon: Link2 },
          { href: '/dashboard/addons', label: t.addons, Icon: Blocks },
          { href: '/dashboard/plans', label: t.plansBilling, Icon: CreditCard },
          { href: '/dashboard/settings', label: t.settings, Icon: Settings },
          { href: '/dashboard/help', label: t.help, Icon: HelpCircle },
        ]}
      />
    </div>
  )
}
