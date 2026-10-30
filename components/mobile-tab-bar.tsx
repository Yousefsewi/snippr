'use client'

// Phone navigation for the dashboard: an iOS-style tab bar at the bottom, and a
// "More" sheet with everything else. Hidden from tablet size up (md:hidden).

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, MoreHorizontal, X, type LucideIcon } from 'lucide-react'

export type TabItem = { href: string; label: string; Icon: LucideIcon }

export default function MobileTabBar({
  tabs, more, pathname, tr, me, onLogout,
}: {
  tabs: TabItem[]
  more: TabItem[]
  pathname: string
  tr: boolean
  me: { name: string; email: string; photo: string | null }
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const isActive = (href: string) => (href === '/dashboard' ? pathname === href : pathname === href || pathname.startsWith(`${href}/`))
  const moreActive = more.some(m => isActive(m.href))

  // close the sheet when the page changes
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) { setLastPath(pathname); setOpen(false) }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="md:hidden">
      {/* tab bar */}
      <nav aria-label={tr ? 'Ana menü' : 'Main menu'}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-black/[0.06] bg-white/85 backdrop-blur-xl"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="mx-auto flex max-w-[520px] items-stretch justify-around px-1">
          {tabs.map(({ href, label, Icon }) => {
            const on = isActive(href)
            return (
              <Link key={href} href={href} className="relative flex min-w-0 flex-1 flex-col items-center gap-0.5 pt-2 pb-1.5 text-[10.5px] font-semibold"
                style={{ color: on ? 'var(--accent)' : '#8e8e93' }} aria-current={on ? 'page' : undefined}>
                <Icon size={23} strokeWidth={on ? 2.2 : 1.8} />
                <span className="w-full truncate text-center">{label}</span>
              </Link>
            )
          })}
          <button onClick={() => setOpen(true)} className="flex min-w-0 flex-1 flex-col items-center gap-0.5 pt-2 pb-1.5 text-[10.5px] font-semibold"
            style={{ color: moreActive || open ? 'var(--accent)' : '#8e8e93' }} aria-haspopup="dialog" aria-expanded={open}>
            <MoreHorizontal size={23} strokeWidth={moreActive ? 2.2 : 1.8} />
            <span>{tr ? 'Daha fazla' : 'More'}</span>
          </button>
        </div>
      </nav>

      {/* "More" sheet */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div key="dim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} className="fixed inset-0 z-50 bg-black/30" />
            <motion.div key="sheet" role="dialog" aria-modal="true" aria-label={tr ? 'Daha fazla' : 'More'}
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', stiffness: 420, damping: 38 }}
              drag="y" dragConstraints={{ top: 0, bottom: 0 }} dragElastic={{ top: 0, bottom: 0.6 }}
              onDragEnd={(_, info) => { if (info.offset.y > 90 || info.velocity.y > 600) setOpen(false) }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-[26px] bg-[#f2f2f7] px-4 pt-2"
              style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
              <div className="mx-auto mb-3 h-[5px] w-10 rounded-full bg-black/15" />
              <div className="mb-3 flex items-center justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white text-[17px] font-bold text-[#787774]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {me.photo ? <img src={me.photo} alt="" className="h-full w-full object-cover" /> : (me.name || me.email || '?').charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[16px] font-semibold text-[#1c1c1e]">{me.name || (tr ? 'Hesabın' : 'Your account')}</p>
                    <p className="truncate text-[13px] text-[#8e8e93]">{me.email}</p>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} aria-label={tr ? 'Kapat' : 'Close'} className="flex h-8 w-8 items-center justify-center rounded-full bg-black/[0.06] text-[#3a3a3c]"><X size={17} /></button>
              </div>

              <div className="overflow-hidden rounded-[16px] bg-white">
                {more.map(({ href, label, Icon }, i) => {
                  const on = isActive(href)
                  return (
                    <Link key={href} href={href} className="flex items-center gap-3 px-4 py-3.5 text-[16px] active:bg-black/[0.04]"
                      style={{ borderTop: i ? '0.5px solid rgba(60,60,67,0.18)' : 'none', color: on ? 'var(--accent)' : '#1c1c1e', fontWeight: on ? 600 : 500 }}>
                      <Icon size={20} strokeWidth={1.9} style={{ color: on ? 'var(--accent)' : '#8e8e93' }} />
                      <span className="flex-1">{label}</span>
                      <span className="text-[#c7c7cc]">›</span>
                    </Link>
                  )
                })}
              </div>

              <button onClick={onLogout} className="mt-3 flex w-full items-center gap-3 rounded-[16px] bg-white px-4 py-3.5 text-left text-[16px] font-medium text-[#ff3b30] active:bg-black/[0.04]">
                <LogOut size={20} strokeWidth={1.9} /> {tr ? 'Çıkış yap' : 'Sign out'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
