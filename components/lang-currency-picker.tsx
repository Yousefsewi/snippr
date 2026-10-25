'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronDown, Globe } from 'lucide-react'
import { CURRENCIES, useCurrencyChoice } from '@/lib/currency'

type Lng = 'en' | 'tr'

const LANGS: { code: Lng; tag: string; label: string }[] = [
  { code: 'en', tag: 'EN', label: 'English' },
  { code: 'tr', tag: 'TR', label: 'Türkçe' },
]

const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif"

function Row({ tag, label, on, onClick }: { tag: string; label: string; on: boolean; onClick: () => void }) {
  return (
    <button type="button" role="menuitemradio" aria-checked={on} onClick={onClick}
      className="flex w-full items-center gap-2.5 rounded-[10px] px-3 py-[9px] text-left transition-colors hover:bg-black/[0.04] active:bg-black/[0.07]">
      <span className="w-6 text-[11px] font-medium tracking-wide text-[#8e8e93]" style={{ fontWeight: on ? 700 : 500, color: on ? '#1c1c1e' : undefined }}>{tag}</span>
      <span className="flex-1 truncate text-[15px]" style={{ color: on ? '#1c1c1e' : '#6e6e73', fontWeight: on ? 600 : 400 }}>{label}</span>
      {on && <Check size={15} strokeWidth={2.6} className="text-[#1c1c1e]" />}
    </button>
  )
}

export default function LangCurrencyPicker({
  lng, setLng, theme = 'light', placement = 'down', align = 'right',
}: {
  lng: Lng
  setLng: (l: Lng) => void
  theme?: 'light' | 'dark'
  placement?: 'up' | 'down'
  align?: 'left' | 'right' | 'center'
}) {
  const [open, setOpen] = useState(false)
  const [cur, setCur] = useCurrencyChoice()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])

  const tr = lng === 'tr'
  const dark = theme === 'dark'
  const pos = [
    placement === 'up' ? 'bottom-[calc(100%+10px)]' : 'top-[calc(100%+10px)]',
    align === 'right' ? 'right-0' : align === 'left' ? 'left-0' : 'left-1/2 -translate-x-1/2',
  ].join(' ')

  return (
    <div ref={ref} className="relative" style={{ fontFamily: FONT }}>
      <button type="button" onClick={() => setOpen(o => !o)} aria-haspopup="menu" aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold transition-colors"
        style={dark
          ? { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', color: 'rgba(255,255,255,0.85)' }
          : { background: '#fff', border: '1px solid rgba(0,0,0,0.08)', color: '#1c1c1e', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <Globe size={14} />
        {LANGS.find(l => l.code === lng)?.label}
        <span style={{ opacity: 0.45 }}>·</span>
        {cur}
        <ChevronDown size={13} strokeWidth={2.4} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div role="menu"
            initial={{ opacity: 0, scale: 0.96, y: placement === 'up' ? 6 : -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: placement === 'up' ? 4 : -4 }}
            transition={{ type: 'spring', stiffness: 520, damping: 34 }}
            style={{ transformOrigin: placement === 'up' ? 'bottom center' : 'top center', colorScheme: 'light' }}
            className={`absolute z-50 ${pos} grid w-[min(420px,calc(100vw-32px))] grid-cols-2 overflow-hidden rounded-[18px] bg-white/95 text-left shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35),0_0_0_0.5px_rgba(0,0,0,0.08)] backdrop-blur-xl`}>
            {/* languages */}
            <div className="ios-scroll max-h-[300px] overflow-y-auto p-2" style={{ borderRight: '0.5px solid rgba(0,0,0,0.1)' }}>
              <p className="px-3 pt-1.5 pb-1 text-[11px] font-semibold tracking-[0.08em] text-[#8e8e93] uppercase">{tr ? 'Dil' : 'Language'}</p>
              {LANGS.map(l => (
                <Row key={l.code} tag={l.tag} label={l.label} on={l.code === lng} onClick={() => setLng(l.code)} />
              ))}
            </div>
            {/* currencies */}
            <div className="ios-scroll max-h-[300px] overflow-y-auto p-2">
              <p className="px-3 pt-1.5 pb-1 text-[11px] font-semibold tracking-[0.08em] text-[#8e8e93] uppercase">{tr ? 'Para birimi' : 'Currency'}</p>
              {CURRENCIES.map(c => (
                <Row key={c.code} tag={c.code.slice(0, 2)} label={c.code} on={c.code === cur} onClick={() => setCur(c.code)} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
