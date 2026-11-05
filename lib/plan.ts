// The plan a shop picked at sign-up and its free trial. Payments aren't live yet, so this is
// only stored on the account (Supabase user_metadata: plan, trial_started_at) and shown in
// the dashboard. Nothing is charged and nothing is locked when the trial ends.

import { PLAN_PRICES_EUR, TRIAL_DAYS } from './legal'

export type PlanId = keyof typeof PLAN_PRICES_EUR
export const PLAN_IDS = Object.keys(PLAN_PRICES_EUR) as PlanId[]
export const PLAN_NAMES: Record<PlanId, string> = { solo: 'Solo', salon: 'Salon', pro: 'Pro' }
export const isPlan = (v: unknown): v is PlanId => typeof v === 'string' && (PLAN_IDS as string[]).includes(v)

/** plan chosen on the pricing page before signing up (?plan=salon), pre-selected later */
export const PLAN_PREF_KEY = 'snippr:plan-pref'

/** Days left in the trial (0 when it's over). `now` is passed in so render stays pure. */
export function trialDaysLeft(startedAt: unknown, now: number) {
  const start = typeof startedAt === 'string' ? Date.parse(startedAt) : NaN
  if (Number.isNaN(start)) return TRIAL_DAYS
  const used = Math.floor((now - start) / 86400000)
  return Math.max(0, TRIAL_DAYS - used)
}

type L = 'en' | 'tr' | 'nl'
export const TRIAL_COPY: Record<L, { title: (plan: string) => string; left: (n: number) => string; over: string; sub: string; btn: string }> = {
  en: { title: p => `${p} plan · free trial`, left: n => (n === 1 ? '1 day left' : `${n} days left`), over: 'Your trial has ended. You can keep using Snippr for free for now.', sub: 'No card needed. Nothing is charged when the trial ends.', btn: 'See plans' },
  tr: { title: p => `${p} planı · ücretsiz deneme`, left: n => `${n} gün kaldı`, over: 'Deneme süren doldu. Şimdilik Snippr’ı ücretsiz kullanmaya devam edebilirsin.', sub: 'Kart gerekmez. Deneme bitince otomatik ücret alınmaz.', btn: 'Planları gör' },
  nl: { title: p => `${p}-abonnement · gratis proef`, left: n => (n === 1 ? 'nog 1 dag' : `nog ${n} dagen`), over: 'Je proefperiode is voorbij. Je kunt Snippr voorlopig gratis blijven gebruiken.', sub: 'Geen kaart nodig. Er wordt niets afgeschreven als de proef afloopt.', btn: 'Bekijk abonnementen' },
}
export const trialCopy = (lang: string) => TRIAL_COPY[(lang === 'tr' || lang === 'nl' ? lang : 'en') as L]
