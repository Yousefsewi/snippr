// Curated list of common timezones grouped by region (important countries/cities)
export interface TZ { value: string; city: string; region: string }

export const TIMEZONES: TZ[] = [
  // Americas
  { value: 'America/Los_Angeles',            city: 'Los Angeles',  region: 'Americas' },
  { value: 'America/Denver',                 city: 'Denver',       region: 'Americas' },
  { value: 'America/Chicago',                city: 'Chicago',      region: 'Americas' },
  { value: 'America/New_York',               city: 'New York',     region: 'Americas' },
  { value: 'America/Toronto',                city: 'Toronto',      region: 'Americas' },
  { value: 'America/Mexico_City',            city: 'Mexico City',  region: 'Americas' },
  { value: 'America/Sao_Paulo',              city: 'São Paulo',    region: 'Americas' },
  { value: 'America/Argentina/Buenos_Aires', city: 'Buenos Aires', region: 'Americas' },
  // Europe
  { value: 'Europe/London',    city: 'London',    region: 'Europe' },
  { value: 'Europe/Paris',     city: 'Paris',     region: 'Europe' },
  { value: 'Europe/Berlin',    city: 'Berlin',    region: 'Europe' },
  { value: 'Europe/Amsterdam', city: 'Amsterdam', region: 'Europe' },
  { value: 'Europe/Madrid',    city: 'Madrid',    region: 'Europe' },
  { value: 'Europe/Rome',      city: 'Rome',      region: 'Europe' },
  { value: 'Europe/Istanbul',  city: 'Istanbul',  region: 'Europe' },
  { value: 'Europe/Moscow',    city: 'Moscow',    region: 'Europe' },
  // Africa
  { value: 'Africa/Cairo',        city: 'Cairo',        region: 'Africa' },
  { value: 'Africa/Lagos',        city: 'Lagos',        region: 'Africa' },
  { value: 'Africa/Johannesburg', city: 'Johannesburg', region: 'Africa' },
  // Asia & Middle East
  { value: 'Asia/Dubai',     city: 'Dubai',            region: 'Asia & Middle East' },
  { value: 'Asia/Riyadh',    city: 'Riyadh',           region: 'Asia & Middle East' },
  { value: 'Asia/Tehran',    city: 'Tehran',           region: 'Asia & Middle East' },
  { value: 'Asia/Karachi',   city: 'Karachi',          region: 'Asia & Middle East' },
  { value: 'Asia/Kolkata',   city: 'Mumbai / Kolkata', region: 'Asia & Middle East' },
  { value: 'Asia/Dhaka',     city: 'Dhaka',            region: 'Asia & Middle East' },
  { value: 'Asia/Bangkok',   city: 'Bangkok',          region: 'Asia & Middle East' },
  { value: 'Asia/Singapore', city: 'Singapore',        region: 'Asia & Middle East' },
  { value: 'Asia/Hong_Kong', city: 'Hong Kong',        region: 'Asia & Middle East' },
  { value: 'Asia/Shanghai',  city: 'Shanghai',         region: 'Asia & Middle East' },
  { value: 'Asia/Tokyo',     city: 'Tokyo',            region: 'Asia & Middle East' },
  { value: 'Asia/Seoul',     city: 'Seoul',            region: 'Asia & Middle East' },
  // Oceania
  { value: 'Australia/Sydney', city: 'Sydney',   region: 'Oceania' },
  { value: 'Pacific/Auckland', city: 'Auckland', region: 'Oceania' },
]

export const TZ_REGIONS = ['Americas', 'Europe', 'Africa', 'Asia & Middle East', 'Oceania']

// The browser's actual timezone — correct per user, no hardcoding
export function detectTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

// "GMT+3" style label for a timezone, computed live (handles DST)
export function gmtOffset(tz: string): string {
  try {
    const now = new Date()
    const utc = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
    const local = new Date(now.toLocaleString('en-US', { timeZone: tz }))
    const diffMin = Math.round((local.getTime() - utc.getTime()) / 60000)
    const sign = diffMin >= 0 ? '+' : '-'
    const h = Math.floor(Math.abs(diffMin) / 60)
    const m = Math.abs(diffMin) % 60
    return `GMT${sign}${h}${m ? ':' + String(m).padStart(2, '0') : ''}`
  } catch {
    return ''
  }
}

// City label for a tz value, falling back to the raw value
export function tzCity(tz: string): string {
  return TIMEZONES.find(t => t.value === tz)?.city ?? tz.split('/').pop()?.replace(/_/g, ' ') ?? tz
}

export const TZ_KEY = 'snippr-tz'

export function getSavedTimezone(): string {
  if (typeof window === 'undefined') return 'UTC'
  return localStorage.getItem(TZ_KEY) || detectTimezone()
}

export function setSavedTimezone(tz: string) {
  if (typeof window !== 'undefined') localStorage.setItem(TZ_KEY, tz)
}
