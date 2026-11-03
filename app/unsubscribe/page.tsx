'use client'

// "Don't send me these emails" page, opened from the link at the bottom of thank-you, tip
// and reminder emails. Nothing happens until the person presses the button.

import { useState, useSyncExternalStore } from 'react'

const COPY = {
  en: { title: 'Stop these emails?', sub: 'You won’t get thank-you, tip or reminder emails from Snippr barbers at', btn: 'Unsubscribe', busy: 'One moment…', done: 'Done — you’re unsubscribed.', doneSub: 'You’ll still get the emails that belong to a booking you make (confirmation, changes, cancellation).', bad: 'This link doesn’t work. Use the link from the most recent email.', err: 'Something went wrong. Please try again in a moment.' },
  tr: { title: 'Bu e-postaları durduralım mı?', sub: 'Snippr berberlerinden teşekkür, bahşiş ve hatırlatma e-postası almayacaksın:', btn: 'Abonelikten çık', busy: 'Bir saniye…', done: 'Tamam — abonelikten çıktın.', doneSub: 'Aldığın bir randevuyla ilgili e-postalar (onay, değişiklik, iptal) yine gelir.', bad: 'Bu link çalışmıyor. En son gelen e-postadaki linki kullan.', err: 'Bir sorun oldu. Lütfen biraz sonra tekrar dene.' },
  nl: { title: 'Deze e-mails stoppen?', sub: 'Je krijgt geen bedank-, fooi- of herinneringsmails meer van Snippr-kappers op', btn: 'Afmelden', busy: 'Even geduld…', done: 'Klaar — je bent afgemeld.', doneSub: 'E-mails over een afspraak die je maakt (bevestiging, wijziging, annulering) krijg je nog wel.', bad: 'Deze link werkt niet. Gebruik de link uit de nieuwste e-mail.', err: 'Er ging iets mis. Probeer het zo opnieuw.' },
}

export default function UnsubscribePage() {
  const lng = useSyncExternalStore(() => () => {}, () => {
    const l = (navigator.language || '').toLowerCase()
    return l.startsWith('tr') ? 'tr' : l.startsWith('nl') ? 'nl' : 'en'
  }, () => 'en') as keyof typeof COPY
  const c = COPY[lng]
  const params = useSyncExternalStore(() => () => {}, () => window.location.search, () => '')
  const q = new URLSearchParams(params)
  const email = q.get('e') ?? ''
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'bad' | 'err'>('idle')

  const go = async () => {
    setState('busy')
    try {
      const res = await fetch(`/api/unsubscribe?${params.replace(/^\?/, '')}`, { method: 'POST' })
      setState(res.ok ? 'done' : res.status === 400 ? 'bad' : 'err')
    } catch { setState('err') }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f4f5] px-5" style={{ colorScheme: 'light' }}>
      <div className="w-full max-w-[420px] rounded-[28px] border border-[#ececec] bg-white p-8 text-center shadow-[0_20px_50px_-30px_rgba(0,0,0,0.18)]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.svg" alt="Snippr" className="mx-auto mb-7 h-7 w-auto" />
        {state === 'done' ? (
          <>
            <h1 className="text-[22px] font-semibold text-[#1d1d1f]">{c.done}</h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[#6e6e73]">{c.doneSub}</p>
          </>
        ) : (
          <>
            <h1 className="text-[22px] font-semibold text-[#1d1d1f]">{c.title}</h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-[#6e6e73]">{c.sub} <b className="break-all text-[#1d1d1f]">{email}</b></p>
            <button type="button" onClick={go} disabled={!email || state === 'busy'}
              className="mt-6 w-full rounded-full bg-[#1d1d1f] py-3 text-[15px] font-semibold text-white transition hover:bg-black disabled:opacity-50">
              {state === 'busy' ? c.busy : c.btn}
            </button>
            {(state === 'bad' || !email) && <p className="mt-3 text-[13px] text-[#c62828]">{c.bad}</p>}
            {state === 'err' && <p className="mt-3 text-[13px] text-[#c62828]">{c.err}</p>}
          </>
        )}
      </div>
    </main>
  )
}
