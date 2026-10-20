import type { CSSProperties, MouseEvent } from 'react'

// iOS "liquid glass" surfaces for the dashboard: translucent, blurred backdrop,
// specular top edge and a soft shadow. Needs something colourful behind it
// (see GLASS_WASH) or the frosting is invisible on a plain white page.
export const GLASS_BG        = 'linear-gradient(145deg, rgba(255,255,255,0.62), rgba(255,255,255,0.30))'
export const GLASS_BG_HOVER  = 'linear-gradient(145deg, rgba(255,255,255,0.85), rgba(255,255,255,0.50))'
export const GLASS_BG_ACTIVE = 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,255,255,0.70))'

// Salon styles: the colour wash behind the glass and the accent colours.
// "salon" = soft pastels for hair salons, "barber" = black / graphite / white for barbershops.
export interface SalonStyle {
  key: 'salon' | 'barber'
  label: string
  sub: string
  wash: string      // behind the sidebar tiles
  pageWash: string  // behind the overview cards
  accent: string    // logo tile, badges
  accent2: string   // second stop of the upgrade card gradient
}

export const SALON_STYLES: SalonStyle[] = [
  {
    key: 'salon', label: 'Hair salon', sub: 'Soft pastels: beige, rose and sky blue',
    wash: 'radial-gradient(circle at 15% 8%, rgba(196,164,124,0.28), transparent 42%), radial-gradient(circle at 95% 45%, rgba(147,197,253,0.26), transparent 48%), radial-gradient(circle at 10% 92%, rgba(244,114,182,0.18), transparent 45%), #f2f2ef',
    pageWash: 'radial-gradient(circle at 12% 18%, rgba(196,164,124,0.22), transparent 38%), radial-gradient(circle at 88% 30%, rgba(147,197,253,0.24), transparent 42%), radial-gradient(circle at 50% 85%, rgba(244,114,182,0.14), transparent 45%), #f7f7f5',
    accent: '#37352f', accent2: '#57534e',
  },
  {
    key: 'barber', label: 'Barbershop', sub: 'Bold and clean: black, graphite and white',
    wash: 'radial-gradient(circle at 15% 6%, rgba(10,10,10,0.22), transparent 42%), radial-gradient(circle at 95% 50%, rgba(82,82,82,0.30), transparent 48%), radial-gradient(circle at 8% 95%, rgba(23,23,23,0.20), transparent 45%), #e6e6e6',
    pageWash: 'radial-gradient(circle at 10% 15%, rgba(10,10,10,0.16), transparent 38%), radial-gradient(circle at 90% 28%, rgba(82,82,82,0.22), transparent 42%), radial-gradient(circle at 50% 90%, rgba(38,38,38,0.12), transparent 45%), #f0f0f0',
    accent: '#0a0a0a', accent2: '#404040',
  },
]

export const SALON_STYLE_KEY = 'snippr:style'
export const getSalonStyle = (key: string | null) => SALON_STYLES.find(s => s.key === key) ?? SALON_STYLES[0]

// CSS variables set on the dashboard root; everything below reads them
export const GLASS_WASH = 'var(--glass-wash)'
export const GLASS_PAGE_WASH = 'var(--glass-page-wash)'

export const glass = (active = false): CSSProperties => ({
  background: active ? GLASS_BG_ACTIVE : GLASS_BG,
  backdropFilter: 'blur(20px) saturate(180%)',
  WebkitBackdropFilter: 'blur(20px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.75)',
  boxShadow: active
    ? 'inset 0 1px 0 rgba(255,255,255,1), inset 0 -1px 0 rgba(0,0,0,0.04), 0 6px 18px rgba(30,30,60,0.10), 0 1px 3px rgba(30,30,60,0.06)'
    : 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.03), 0 3px 10px rgba(30,30,60,0.05)',
})

export const glassHover = (e: MouseEvent, on: boolean) => {
  const el = e.currentTarget as HTMLElement
  el.style.background = on ? GLASS_BG_HOVER : GLASS_BG
  el.style.transform = on ? 'translateY(-1px)' : 'none'
}
