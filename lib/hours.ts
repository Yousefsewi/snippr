// Opening hours, shared by the profile editor (app/dashboard/profile/edit) and the public
// booking page (app/b/[slug]). A barber who never saved hours gets these defaults, so the
// booking page never offers slots in the middle of the night.

export type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'
export type DayHours = { open: boolean; start: string; end: string }
export type Hours = Record<Day, DayHours>

export const DEFAULT_HOURS: Hours = {
  mon: { open: true, start: '09:00', end: '18:00' }, tue: { open: true, start: '09:00', end: '18:00' },
  wed: { open: true, start: '09:00', end: '18:00' }, thu: { open: true, start: '09:00', end: '18:00' },
  fri: { open: true, start: '09:00', end: '18:00' }, sat: { open: true, start: '10:00', end: '16:00' },
  sun: { open: false, start: '09:00', end: '18:00' },
}
