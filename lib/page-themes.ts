// Wallpaper-style themes for the public booking page, inspired by iOS wallpapers and built
// from Apple's system colours. A theme is stored as its accent colour (barbers.accent), so no
// database change is needed: the public page looks the accent up here to draw the wallpaper.
// A custom colour (not in the list) gets a wallpaper generated from that colour.

export type PageTheme = { name: string; accent: string; colors: [string, string, string]; base: string }

export const PAGE_THEMES: { group: string; items: PageTheme[] }[] = [
  { group: 'Vivid', items: [
    { name: 'Sunset',   accent: '#ff6b4a', colors: ['#ff9f0a', '#ff375f', '#bf5af2'], base: '#2a0f2e' },
    { name: 'Ocean',    accent: '#0a84ff', colors: ['#64d2ff', '#0a84ff', '#5e5ce6'], base: '#071a3a' },
    { name: 'Aurora',   accent: '#30d158', colors: ['#64d2ff', '#30d158', '#0a84ff'], base: '#04221c' },
    { name: 'Lavender', accent: '#bf5af2', colors: ['#ff8ad8', '#bf5af2', '#5e5ce6'], base: '#1b0b33' },
    { name: 'Rose',     accent: '#ff375f', colors: ['#ff9f0a', '#ff375f', '#ff2d92'], base: '#2b0716' },
    { name: 'Citrus',   accent: '#ffd60a', colors: ['#ffd60a', '#ff9f0a', '#30d158'], base: '#2b1d05' },
  ] },
  { group: 'Calm', items: [
    { name: 'Graphite', accent: '#8e8e93', colors: ['#aeaeb2', '#636366', '#3a3a3c'], base: '#0e0e10' },
    { name: 'Midnight', accent: '#5e5ce6', colors: ['#5e5ce6', '#0a84ff', '#1c1c3a'], base: '#05050f' },
    { name: 'Sand',     accent: '#c9a27a', colors: ['#f2d4b0', '#c9a27a', '#8a5a44'], base: '#2a1c14' },
    { name: 'Sage',     accent: '#7fae8a', colors: ['#c8e6c9', '#7fae8a', '#3e6b57'], base: '#0f1f19' },
    { name: 'Blush',    accent: '#e8a0b4', colors: ['#ffd6e0', '#e8a0b4', '#9b6b9e'], base: '#24131f' },
    { name: 'Mist',     accent: '#9fb8d6', colors: ['#e3eefb', '#9fb8d6', '#5f7898'], base: '#111a26' },
  ] },
]

const ALL = PAGE_THEMES.flatMap(g => g.items)

export const findTheme = (accent: string) => ALL.find(t => t.accent.toLowerCase() === accent.toLowerCase())

// lighten (+) or darken (-) a #rrggbb colour by mixing with white/black
function shade(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16)
  const mix = (c: number) => Math.round(amount >= 0 ? c + (255 - c) * amount : c * (1 + amount))
  const r = mix(n >> 16), g = mix((n >> 8) & 255), b = mix(n & 255)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

/** CSS background for the wallpaper of a given accent colour (preset or custom). */
export function wallpaper(accent: string): string {
  const t = findTheme(accent) ?? { colors: [shade(accent, 0.45), accent, shade(accent, -0.35)] as [string, string, string], base: shade(accent, -0.8) }
  const [a, b, c] = t.colors
  return [
    `radial-gradient(circle at 20% 15%, ${a} 0%, transparent 50%)`,
    `radial-gradient(circle at 85% 35%, ${b} 0%, transparent 55%)`,
    `radial-gradient(circle at 35% 90%, ${c} 0%, transparent 55%)`,
    `radial-gradient(circle at 75% 85%, ${a}99 0%, transparent 45%)`,
    t.base,
  ].join(', ')
}
