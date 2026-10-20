'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useStored, writeStored } from './use-stored'

type Mode = 'light' | 'dark'

// CSS variables applied to the dashboard root for each mode
export const MODE_VARS: Record<Mode, Record<string, string>> = {
  light: {
    '--bg': '#ffffff',
    '--sidebar': '#f7f7f5',
    '--card': '#ffffff',
    '--card2': '#fbfbfa',
    '--text': '#37352f',
    '--text2': '#787774',
    '--muted': '#9b9a97',
    '--border': '#e9e9e7',
    '--hover': '#f1f1ef',
    '--primary': '#37352f',
    '--on-primary': '#ffffff',
  },
  dark: {
    '--bg': '#191919',
    '--sidebar': '#202020',
    '--card': '#262626',
    '--card2': '#2a2a2a',
    '--text': '#e8e8e6',
    '--text2': '#b4b4b1',
    '--muted': '#8c8c89',
    '--border': '#363636',
    '--hover': '#2e2e2e',
    '--primary': '#e8e8e6',
    '--on-primary': '#191919',
  },
}

const KEY = 'snippr-mode'

interface ModeCtx { mode: Mode; toggle: () => void }
const Ctx = createContext<ModeCtx>({ mode: 'light', toggle: () => {} })

export function ModeProvider({ children }: { children: ReactNode }) {
  const saved = useStored(KEY)
  const mode: Mode = saved === 'dark' ? 'dark' : 'light'

  const toggle = () => writeStored(KEY, mode === 'light' ? 'dark' : 'light')

  return <Ctx.Provider value={{ mode, toggle }}>{children}</Ctx.Provider>
}

export const useMode = () => useContext(Ctx)
