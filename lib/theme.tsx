'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useStored, writeStored } from './use-stored'

export interface ThemeDef {
  key: string
  label: string
  swatch: string       // small preview color for the picker (fallback)
  background: string    // CSS background applied to the dashboard wall
  accent: string        // primary accent color
  dark?: boolean        // dark wall → use light text on it
}

// Photo backgrounds (landscapes) — hosted on Unsplash, already used elsewhere in the app
const photo = (url: string, fallback: string) =>
  `${fallback} url('${url}') center / cover no-repeat`

export const THEMES: ThemeDef[] = [
  {
    key: 'plain', label: 'Plain', swatch: '#ffffff',
    background: '#ffffff', accent: '#37352f',
  },
  {
    // 1 — orange swirl on white
    key: 'sunset', label: 'Sunset', swatch: '#f97316',
    background: 'radial-gradient(at 62% 22%, rgba(251,146,60,0.55) 0px, transparent 48%), radial-gradient(at 45% 58%, rgba(245,158,11,0.55) 0px, transparent 45%), radial-gradient(at 72% 40%, rgba(239,68,68,0.35) 0px, transparent 42%), #ffffff',
    accent: '#ea580c',
  },
  {
    // 2 — dark navy grain
    key: 'midnight', label: 'Midnight', swatch: '#1e293b',
    background: 'radial-gradient(at 32% 22%, rgba(71,85,105,0.9) 0px, transparent 45%), radial-gradient(at 72% 62%, rgba(51,65,85,0.9) 0px, transparent 42%), #0f172a',
    accent: '#60a5fa', dark: true,
  },
  {
    // 4 — black & white blur
    key: 'mono', label: 'Mono', swatch: '#737373',
    background: 'radial-gradient(at 24% 30%, rgba(229,229,229,0.9) 0px, transparent 42%), radial-gradient(at 78% 72%, rgba(255,255,255,0.85) 0px, transparent 40%), radial-gradient(at 58% 44%, rgba(38,38,38,0.9) 0px, transparent 48%), #171717',
    accent: '#a3a3a3', dark: true,
  },
  {
    // 5 — foggy green forest (photo)
    key: 'forest', label: 'Forest', swatch: '#374b3f',
    background: photo('https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80', '#e8efe9'),
    accent: '#0f766e',
  },
  {
    // 7 — blue motion blur
    key: 'drift', label: 'Drift', swatch: '#60a5fa',
    background: 'linear-gradient(120deg, rgba(30,58,95,0.55), transparent 60%), radial-gradient(at 80% 28%, rgba(147,197,253,0.6) 0px, transparent 50%), radial-gradient(at 38% 72%, rgba(245,158,11,0.28) 0px, transparent 40%), linear-gradient(160deg, #cbd5e1, #64748b)',
    accent: '#2563eb',
  },
  {
    // 8 — pink pastel blur
    key: 'blush', label: 'Blush', swatch: '#f9a8d4',
    background: 'radial-gradient(at 35% 40%, rgba(244,114,182,0.6) 0px, transparent 55%), radial-gradient(at 62% 56%, rgba(252,165,165,0.5) 0px, transparent 50%), radial-gradient(at 76% 34%, rgba(196,181,253,0.45) 0px, transparent 45%), #dbeafe',
    accent: '#db2777',
  },
]

const KEY = 'snippr-theme'
const DEFAULT = 'plain'

interface ThemeCtx { theme: ThemeDef; setTheme: (key: string) => void }
const Ctx = createContext<ThemeCtx>({ theme: THEMES[0], setTheme: () => {} })

export function ThemeProvider({ children }: { children: ReactNode }) {
  const saved = useStored(KEY) ?? DEFAULT

  const setTheme = (k: string) => writeStored(KEY, k)

  const theme = THEMES.find(t => t.key === saved) ?? THEMES[0]

  return <Ctx.Provider value={{ theme, setTheme }}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)
