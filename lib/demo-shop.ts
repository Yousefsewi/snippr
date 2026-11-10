// The demo shop at snipprcalendar.com/b/demo: a complete example booking page to show barbers.
// It lives in code (not in the database), so nobody can change it, and bookings made on it are
// only simulated: nothing is saved and no email goes out.
import type { Hours as WorkingHours } from './hours'

export const DEMO_SLUG = 'demo'

const open = (start: string, end: string) => ({ open: true, start, end })
const DEMO_HOURS: WorkingHours = {
  mon: { open: false, start: '09:00', end: '18:00' },
  tue: open('09:00', '18:00'), wed: open('09:00', '18:00'), thu: open('09:00', '21:00'),
  fri: open('09:00', '18:00'), sat: open('09:00', '17:00'), sun: { open: false, start: '10:00', end: '16:00' },
}

export const DEMO_BARBER = {
  id: 'demo',
  name: 'Golden Scissors',
  slug: DEMO_SLUG,
  bio: 'Fades, beards & hot-towel shaves. Walk-ins welcome.',
  address: 'Assen, Nederland',
  photo_url: '/demo/barber-avatar.webp',
  cover_url: '/demo/barbershop-cover.webp',
  accent: '#c9a27a',
  links: [{ platform: 'instagram', url: 'https://www.instagram.com/' }],
  blocks: [],
  working_hours: DEMO_HOURS,
  first_visit_discount: 0,
}

export const DEMO_SERVICES = [
  { id: 'demo-kids', name: 'Kinderknipbeurt', duration_min: 25, price: 18 },
  { id: 'demo-beard', name: 'Baard trimmen', duration_min: 20, price: 15 },
  { id: 'demo-cut', name: 'Knippen', duration_min: 30, price: 25 },
  { id: 'demo-fade', name: 'Skin fade', duration_min: 45, price: 30 },
  { id: 'demo-combo', name: 'Knippen + baard', duration_min: 50, price: 38 },
]

/** A few taken times so the day looks real (minutes from midnight). */
export const demoBusy = (d: Date): [number, number][] => {
  const k = d.getDate() % 3
  return k === 0 ? [[600, 630], [780, 840], [960, 1005]] : k === 1 ? [[570, 600], [690, 750], [900, 930]] : [[660, 690], [810, 870]]
}
