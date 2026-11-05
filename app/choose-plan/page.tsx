'use client'

// First step after signing up: pick a plan and start the free trial. Payments aren't live,
// so no card is asked and nothing is charged; the choice is saved on the account
// (lib/plan.ts) and can be changed later under Dashboard → Plans.

import { useEffect, useState, useSyncExternalStore } from 'react'
import { useRouter } from 'next/navigation'
import { Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuthLng } from '@/lib/auth-copy'
import { PLAN_PRICES_EUR, TRIAL_DAYS, VISIBLE_PLANS } from '@/lib/legal'
import { PLAN_NAMES, PLAN_PREF_KEY, isPlan, type PlanId } from '@/lib/plan'

const eur = (n: number) => `€${n.toFixed(2).replace('.', ',')}`

const COPY = {
  en: {
    badge: 'Launch', title: 'Choose your plan', sub: `Every plan is free for ${TRIAL_DAYS} days. No card needed, and nothing is charged when the trial ends.`,
    perMonth: '/mo', exVat: 'excl. VAT, after the trial', from: 'from ',
    who: { solo: 'For one barber or stylist', salon: 'For a shop with 2–5 people', pro: 'For bigger shops and chains' } as Record<PlanId, string>,
    points: ['Booking page, link and QR code', 'Live calendar and email reminders', 'Clients can cancel themselves'],
    start: (p: string) => `Start free with ${p}`, busy: 'One moment…', change: 'You can change your plan any time.', err: 'Something went wrong. Please try again.',
  },
  tr: {
    badge: 'Lansman', title: 'Planını seç', sub: `Bütün planlar ${TRIAL_DAYS} gün ücretsiz. Kart gerekmez, deneme bitince otomatik ücret alınmaz.`,
    perMonth: '/ay', exVat: 'KDV hariç, denemeden sonra', from: '',
    who: { solo: 'Tek berber ya da kuaför için', salon: '2–5 kişilik dükkân için', pro: 'Büyük dükkânlar ve zincirler için' } as Record<PlanId, string>,
    points: ['Randevu sayfası, link ve QR kod', 'Canlı takvim ve e-posta hatırlatmaları', 'Müşteri randevusunu kendisi iptal edebilir'],
    start: (p: string) => `${p} ile ücretsiz başla`, busy: 'Bir saniye…', change: 'Planını istediğin zaman değiştirebilirsin.', err: 'Bir sorun oldu. Lütfen tekrar dene.',
  },
  nl: {
    badge: 'Lancering', title: 'Kies je abonnement', sub: `Elk abonnement is ${TRIAL_DAYS} dagen gratis. Geen kaart nodig, en er wordt niets afgeschreven als de proef afloopt.`,
    perMonth: '/mnd', exVat: 'excl. btw, na de proef', from: 'vanaf ',
    who: { solo: 'Voor één kapper of stylist', salon: 'Voor een zaak met 2–5 mensen', pro: 'Voor grotere zaken en ketens' } as Record<PlanId, string>,
    points: ['Boekingspagina, link en QR-code', 'Live agenda en e-mailherinneringen', 'Klanten kunnen zelf annuleren'],
    start: (p: string) => `Gratis starten met ${p}`, busy: 'Even geduld…', change: 'Je kunt je abonnement altijd wijzigen.', err: 'Er ging iets mis. Probeer het opnieuw.',
  },
}

const noop = () => () => {}

export default function ChoosePlan() {
  const router = useRouter()
  const c = COPY[useAuthLng()]
  const search = useSyncExternalStore(noop, () => window.location.search, () => '')
  const pref = useSyncExternalStore(noop, () => { try { return localStorage.getItem(PLAN_PREF_KEY) } catch { return null } }, () => null)
  const nextParam = new URLSearchParams(search).get('next')
  const next = nextParam === '/onboarding' ? '/onboarding' : '/dashboard'

  const [picked, setPicked] = useState<PlanId | null>(null)
  const plan: PlanId = picked ?? (isPlan(pref) && VISIBLE_PLANS.includes(pref) ? pref : 'solo')
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace('/login'); return }
      if (!user.user_metadata?.terms_accepted_at) { router.replace('/complete-signup'); return }
      if (isPlan(user.user_metadata?.plan)) { router.replace(next); return }
      setReady(true)
    })
  }, [router, next])

  const start = async () => {
    setBusy(true); setError('')
    const { error } = await supabase.auth.updateUser({ data: { plan, trial_started_at: new Date().toISOString() } })
    if (error) { setBusy(false); setError(c.err); return }
    try { localStorage.removeItem(PLAN_PREF_KEY) } catch { /* blocked */ }
    router.replace(next)
  }

  if (!ready) return <main className="min-h-screen bg-[#f5f5f7]" />

  return (
    <main className="min-h-screen bg-[#f5f5f7] px-4 py-10 text-[#1d1d1f] sm:py-16" style={{ colorScheme: 'light' }}>
      <div className="mx-auto max-w-[980px]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Snippr" className="mx-auto h-7 w-auto" />
        <div className="mt-8 text-center">
          <span className="inline-block rounded-full bg-[#1d1d1f] px-3 py-1 text-[12px] font-semibold text-white">{c.badge}</span>
          <h1 className="mt-4 text-[30px] font-semibold tracking-[-0.025em] sm:text-[36px]">{c.title}</h1>
          <p className="mx-auto mt-2 max-w-[520px] text-[16px] leading-relaxed text-[#6e6e73]">{c.sub}</p>
        </div>

        <div role="radiogroup" aria-label={c.title} className={`mt-10 grid gap-4 ${VISIBLE_PLANS.length === 3 ? 'md:grid-cols-3' : 'mx-auto max-w-[680px] md:grid-cols-2'}`}>
          {VISIBLE_PLANS.map(id => {
            const on = id === plan
            return (
              <button key={id} type="button" role="radio" aria-checked={on} onClick={() => setPicked(id)}
                className={`flex flex-col rounded-[16px] border-2 bg-white p-6 text-left transition ${on ? 'border-[#1d1d1f]' : 'border-[#e5e5e7] hover:border-[#c7c7cc]'}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[20px] font-semibold">{PLAN_NAMES[id]}</span>
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${on ? 'border-[#1d1d1f] bg-[#1d1d1f] text-white' : 'border-[#d1d1d6]'}`}>
                    {on && <Check size={14} strokeWidth={3} />}
                  </span>
                </div>
                <span className="mt-1 text-[14px] text-[#6e6e73]">{c.who[id]}</span>
                <span className="mt-5 text-[13px] font-semibold text-[#248a3d]">{TRIAL_DAYS} × €0</span>
                <span className="mt-1 text-[15px]">
                  <span className="text-[#6e6e73]">{id === 'pro' ? c.from : ''}</span>
                  <b className="text-[22px] font-semibold tracking-[-0.02em]">{eur(PLAN_PRICES_EUR[id].monthly)}</b>
                  <span className="text-[#6e6e73]">{c.perMonth}</span>
                </span>
                <span className="mt-0.5 text-[12.5px] text-[#8e8e93]">{c.exVat}</span>
              </button>
            )
          })}
        </div>

        <ul className="mx-auto mt-8 flex max-w-[680px] flex-col gap-2 text-[14.5px] text-[#3a3a3c] sm:flex-row sm:justify-center sm:gap-6">
          {c.points.map(p => <li key={p} className="flex items-center gap-2"><Check size={16} strokeWidth={2.6} className="flex-shrink-0 text-[#248a3d]" />{p}</li>)}
        </ul>

        <div className="mx-auto mt-8 max-w-[420px] text-center">
          <button type="button" onClick={start} disabled={busy}
            className="h-12 w-full rounded-[12px] bg-[#1d1d1f] text-[16px] font-semibold text-white transition hover:bg-black disabled:opacity-60">
            {busy ? c.busy : c.start(PLAN_NAMES[plan])}
          </button>
          {error && <p role="alert" className="mt-3 text-[14px] text-[#d70015]">{error}</p>}
          <p className="mt-3 text-[13px] text-[#8e8e93]">{c.change}</p>
        </div>
      </div>
    </main>
  )
}
