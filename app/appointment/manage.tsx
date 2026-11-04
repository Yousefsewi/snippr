'use client'

// Shows one appointment and lets the client cancel it. Nothing happens until they press
// the button and confirm. The link (with its signed token) comes from their email.

import { useEffect, useState, useSyncExternalStore } from 'react'
import Link from 'next/link'

type Lang = 'tr' | 'nl' | 'en' | 'ar'
type Appt = { client: string; barber: string; service: string | null; start: string; end: string; status: string; bookUrl: string | null; canCancel: boolean; past: boolean }

const LOCALE: Record<Lang, string> = { tr: 'tr-TR', nl: 'nl-NL', en: 'en-GB', ar: 'ar-u-nu-latn' }

const COPY: Record<Lang, Record<string, string>> = {
  tr: {
    title: 'Randevun', with: 'Berber', service: 'Hizmet', date: 'Tarih', time: 'Saat',
    cancel: 'Randevumu iptal et', sure: 'Emin misin? Bu randevu iptal edilir ve saat başkasına açılır.', yes: 'Evet, iptal et', no: 'Vazgeç',
    busy: 'Bir saniye…', done: 'Randevun iptal edildi', doneSub: 'Berberine haber verdik. İstersen yeni bir saat seçebilirsin.',
    already: 'Bu randevu iptal edilmiş.', past: 'Bu randevunun saati geçti, artık iptal edilemez.', closed: 'Bu randevu artık değiştirilemez.',
    newTime: 'Yeni saat seç', bad: 'Bu link çalışmıyor. Randevu e-postandaki linki kullan.', err: 'Bir sorun oldu. Lütfen biraz sonra tekrar dene.', loading: 'Yükleniyor…',
  },
  nl: {
    title: 'Je afspraak', with: 'Kapper', service: 'Behandeling', date: 'Datum', time: 'Tijd',
    cancel: 'Afspraak annuleren', sure: 'Weet je het zeker? De afspraak wordt geannuleerd en de tijd komt vrij voor iemand anders.', yes: 'Ja, annuleren', no: 'Terug',
    busy: 'Even geduld…', done: 'Je afspraak is geannuleerd', doneSub: 'We hebben je kapper laten weten. Je kunt altijd een nieuwe tijd kiezen.',
    already: 'Deze afspraak is geannuleerd.', past: 'Deze afspraak is al begonnen of voorbij en kan niet meer geannuleerd worden.', closed: 'Deze afspraak kan niet meer gewijzigd worden.',
    newTime: 'Kies een nieuwe tijd', bad: 'Deze link werkt niet. Gebruik de link uit je afspraakmail.', err: 'Er ging iets mis. Probeer het zo opnieuw.', loading: 'Laden…',
  },
  en: {
    title: 'Your appointment', with: 'Barber', service: 'Service', date: 'Date', time: 'Time',
    cancel: 'Cancel my appointment', sure: 'Are you sure? The appointment is cancelled and the time opens up for someone else.', yes: 'Yes, cancel', no: 'Go back',
    busy: 'One moment…', done: 'Your appointment is cancelled', doneSub: 'We let your barber know. You can pick a new time whenever you like.',
    already: 'This appointment was cancelled.', past: 'This appointment has started or passed and can’t be cancelled anymore.', closed: 'This appointment can’t be changed anymore.',
    newTime: 'Book a new time', bad: 'This link doesn’t work. Use the link from your booking email.', err: 'Something went wrong. Please try again in a moment.', loading: 'Loading…',
  },
  ar: {
    title: 'موعدك', with: 'الحلاق', service: 'الخدمة', date: 'التاريخ', time: 'الوقت',
    cancel: 'إلغاء موعدي', sure: 'هل أنت متأكد؟ سيتم إلغاء الموعد ويصبح الوقت متاحًا لشخص آخر.', yes: 'نعم، ألغِ', no: 'رجوع',
    busy: 'لحظة…', done: 'تم إلغاء موعدك', doneSub: 'أبلغنا الحلاق. يمكنك اختيار وقت جديد متى شئت.',
    already: 'تم إلغاء هذا الموعد.', past: 'بدأ هذا الموعد أو انتهى ولا يمكن إلغاؤه.', closed: 'لا يمكن تغيير هذا الموعد بعد الآن.',
    newTime: 'اختر وقتًا جديدًا', bad: 'هذا الرابط لا يعمل. استخدم الرابط من بريد الحجز.', err: 'حدث خطأ. يرجى المحاولة بعد قليل.', loading: 'جارٍ التحميل…',
  },
}

const noop = () => () => {}

export default function ManageAppointment() {
  const search = useSyncExternalStore(noop, () => window.location.search, () => '')
  const q = new URLSearchParams(search)
  const id = q.get('id') ?? '', t = q.get('t') ?? ''
  const l = q.get('l')
  const lang: Lang = l === 'tr' || l === 'nl' || l === 'ar' ? l : 'en'
  const c = COPY[lang]

  const [appt, setAppt] = useState<Appt | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'confirm' | 'busy' | 'done' | 'bad' | 'err'>('loading')

  useEffect(() => {
    if (!search) return
    let alive = true
    fetch(`/api/appointment?id=${encodeURIComponent(id)}&t=${encodeURIComponent(t)}`)
      .then(async res => {
        if (!alive) return
        if (!res.ok) { setState(res.status === 400 || res.status === 404 ? 'bad' : 'err'); return }
        setAppt(await res.json()); setState('ready')
      })
      .catch(() => { if (alive) setState('err') })
    return () => { alive = false }
  }, [search, id, t])

  const cancel = async () => {
    setState('busy')
    try {
      const res = await fetch('/api/appointment', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, t }) })
      if (res.ok) setState('done')
      else if (res.status === 409) { setAppt(a => a ? { ...a, canCancel: false } : a); setState('ready') }
      else setState(res.status === 400 ? 'bad' : 'err')
    } catch { setState('err') }
  }

  const start = appt ? new Date(appt.start) : null
  const status = appt?.status === 'cancelled' ? c.already
    : appt && !appt.canCancel ? (appt.past ? c.past : c.closed) : null

  return (
    <main dir={lang === 'ar' ? 'rtl' : 'ltr'} className="flex min-h-screen items-center justify-center bg-[#f4f4f5] px-4 py-10" style={{ colorScheme: 'light' }}>
      <div className="w-full max-w-[440px] rounded-[24px] border border-[#ececec] bg-white p-7 sm:p-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Snippr" className="mb-7 h-7 w-auto" />

        {state === 'loading' && <p className="text-[15px] text-[#6e6e73]">{c.loading}</p>}
        {state === 'bad' && <p className="text-[15px] text-[#c62828]">{c.bad}</p>}
        {state === 'err' && !appt && <p className="text-[15px] text-[#c62828]">{c.err}</p>}

        {appt && start && (
          <>
            <h1 className="text-[24px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">{state === 'done' ? c.done : c.title}</h1>
            {state === 'done' && <p className="mt-2 text-[15px] leading-relaxed text-[#6e6e73]">{c.doneSub}</p>}

            <dl className="mt-6 divide-y divide-[#f0f0f0] rounded-[14px] border border-[#ececec] text-[15px]">
              {([
                [c.with, appt.barber],
                ...(appt.service ? [[c.service, appt.service]] : []),
                [c.date, start.toLocaleDateString(LOCALE[lang], { weekday: 'long', day: 'numeric', month: 'long' })],
                [c.time, start.toLocaleTimeString(LOCALE[lang], { hour: '2-digit', minute: '2-digit' })],
              ] as [string, string][]).map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-4 px-4 py-3">
                  <dt className="text-[#6e6e73]">{k}</dt>
                  <dd className={`m-0 text-end font-medium text-[#1d1d1f] ${state === 'done' ? 'line-through opacity-60' : ''}`}>{v}</dd>
                </div>
              ))}
            </dl>

            {status && state !== 'done' && <p className="mt-5 text-[14.5px] text-[#6e6e73]">{status}</p>}

            {appt.canCancel && state === 'ready' && (
              <button type="button" onClick={() => setState('confirm')}
                className="mt-6 h-12 w-full rounded-[12px] border border-[#e5e5e5] bg-white text-[15px] font-semibold text-[#c62828] transition hover:bg-[#fff5f5]">
                {c.cancel}
              </button>
            )}

            {(state === 'confirm' || state === 'busy') && (
              <div className="mt-6 rounded-[14px] bg-[#fff5f5] p-4">
                <p className="text-[14.5px] leading-relaxed text-[#3a3a3c]">{c.sure}</p>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={cancel} disabled={state === 'busy'}
                    className="h-11 flex-1 rounded-[10px] bg-[#c62828] text-[14.5px] font-semibold text-white transition hover:bg-[#a91f1f] disabled:opacity-60">
                    {state === 'busy' ? c.busy : c.yes}
                  </button>
                  <button type="button" onClick={() => setState('ready')} disabled={state === 'busy'}
                    className="h-11 flex-1 rounded-[10px] border border-[#e5e5e5] bg-white text-[14.5px] font-semibold text-[#1d1d1f] transition hover:bg-[#f7f7f7]">
                    {c.no}
                  </button>
                </div>
              </div>
            )}

            {state === 'err' && <p className="mt-4 text-[14px] text-[#c62828]">{c.err}</p>}

            {appt.bookUrl && (state === 'done' || !appt.canCancel) && (
              <Link href={appt.bookUrl} className="mt-6 flex h-12 w-full items-center justify-center rounded-[12px] bg-[#1d1d1f] text-[15px] font-semibold text-white transition hover:bg-black">
                {c.newTime}
              </Link>
            )}
          </>
        )}
      </div>
    </main>
  )
}
