'use client'

// Dashboard appearance, saved on this device (localStorage).
// Used by app/dashboard/layout.tsx and the Appearance page (app/dashboard/appearance).

import { useStored, writeStored } from './use-stored'

export type AccentName = 'graphite' | 'indigo' | 'violet' | 'rose' | 'orange' | 'emerald' | 'sky'

export interface AppearancePrefs {
  accent: AccentName
  textSize: number      // percent of normal size: 90–120
  reduceMotion: boolean
  sidebarIcons: boolean
}

export const ACCENTS: Record<AccentName, { en: string; tr: string; color: string }> = {
  graphite: { en: 'Graphite', tr: 'Grafit', color: '#37352f' },
  indigo:   { en: 'Indigo',   tr: 'Çivit',   color: '#4f46e5' },
  violet:   { en: 'Violet',   tr: 'Mor',     color: '#7c3aed' },
  rose:     { en: 'Rose',     tr: 'Gül',     color: '#e11d48' },
  orange:   { en: 'Orange',   tr: 'Turuncu', color: '#ea580c' },
  emerald:  { en: 'Emerald',  tr: 'Zümrüt',  color: '#059669' },
  sky:      { en: 'Sky',      tr: 'Gök',     color: '#0284c7' },
}

export const TEXT_SIZES = [90, 95, 100, 105, 110, 115, 120]

export const DEFAULT_APPEARANCE: AppearancePrefs = { accent: 'graphite', textSize: 100, reduceMotion: false, sidebarIcons: true }

const KEY = 'snippr:appearance'

function parse(raw: string | null): AppearancePrefs {
  if (!raw) return DEFAULT_APPEARANCE
  try {
    const p = JSON.parse(raw) as Partial<AppearancePrefs>
    return {
      accent: p.accent && p.accent in ACCENTS ? p.accent : DEFAULT_APPEARANCE.accent,
      textSize: typeof p.textSize === 'number' && TEXT_SIZES.includes(p.textSize) ? p.textSize : DEFAULT_APPEARANCE.textSize,
      reduceMotion: !!p.reduceMotion,
      sidebarIcons: p.sidebarIcons !== false,
    }
  } catch { return DEFAULT_APPEARANCE }
}

export function useAppearance(): AppearancePrefs {
  return parse(useStored(KEY))
}

export function saveAppearance(p: AppearancePrefs) {
  try { writeStored(KEY, JSON.stringify(p)) } catch { /* storage blocked: lasts this visit only */ }
}
