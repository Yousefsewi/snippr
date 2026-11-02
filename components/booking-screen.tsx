'use client'

// The real Snippr booking page (app/b/[slug]) drawn inside the homepage phone, with sample
// shop data. Tap Date or Time to open the picker, like on the real page. Nothing is sent.
// Text uses div/span because the homepage colours every <p> inside a section.

import { useState } from 'react'

type Lng = 'en' | 'tr'

const T = {
  en: { open: 'Open today 09:00–19:00', details: 'Appointment details', date: 'Date', time: 'Time', service: 'Service', choose: 'Choose', pickDate: 'Choose a date first', haircut: 'Haircut · €25', note: 'Times in your local time. You pay in the shop — nothing is charged online.', powered: 'Powered by', days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], today: 'Today', locale: 'en-GB' },
  tr: { open: 'Bugün açık 09:00–19:00', details: 'Randevu bilgileri', date: 'Tarih', time: 'Saat', service: 'Hizmet', choose: 'Seç', pickDate: 'Önce tarih seç', haircut: 'Saç kesimi · €25', note: 'Saatler senin yerel saatinde. Ödemeyi dükkânda yaparsın — online para çekilmez.', powered: 'Altyapı:', days: ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'], today: 'Bugün', locale: 'tr-TR' },
}
const TIMES = ['09:30', '10:00', '11:00', '11:30', '13:30', '14:00', '14:30', '15:30', '16:00']
const TAKEN = new Set(['10:00', '13:30', '15:30'])

const ICON = {
  date: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
  time: 'M12 7v5l3 2M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z',
  service: 'M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM20 4L8.1 15.9M14.5 14.5L20 20M8.1 8.1L12 12',
}

const ios = { fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif" }

function Row({ label, value, icon, onClick, dim }: { label: string; value: string; icon: string; onClick?: () => void; dim?: boolean }) {
  return (
    <button type="button" onClick={onClick} className="pd-btn flex w-full items-center gap-3 px-4 py-3 text-left" style={{ background: 'transparent' }}>
      <span className="flex h-[34px] w-[34px] flex-shrink-0 items-center justify-center rounded-[10px] text-white/85" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d={icon} /></svg>
      </span>
      <span className="text-[17px] text-white">{label}</span>
      <span className="ml-auto flex items-center gap-1.5 text-[16px]" style={{ color: dim ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.65)' }}>
        {value}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6" /></svg>
      </span>
    </button>
  )
}

export default function BookingScreen({ lng, days }: { lng: Lng; days: Date[] }) {
  const t = T[lng] ?? T.en
  const [open, setOpen] = useState<'date' | 'time' | null>(null)
  const [day, setDay] = useState<number | null>(null)
  const [time, setTime] = useState<string | null>(null)
  const dayText = day !== null && days[day] ? days[day].toLocaleDateString(t.locale, { weekday: 'short', day: 'numeric', month: 'short' }) : t.choose
  const line = <div style={{ height: 1, background: 'rgba(255,255,255,0.12)', marginLeft: 64 }} />
  const activeLang = lng === 'tr' ? 'Türkçe' : 'English'

  return (
    <div className="absolute inset-0 overflow-hidden" style={ios}>
      {/* page background: the shop photo, blurred and darkened */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/demo/barbershop-cover.webp" alt="" className="absolute inset-0 h-full w-full object-cover" style={{ filter: 'blur(30px) saturate(1.1)', transform: 'scale(1.4)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(40,26,18,0.55) 0%, rgba(20,16,16,0.8) 50%, rgba(10,10,12,0.92) 100%)' }} />

      <div className="absolute inset-x-0 bottom-0 overflow-y-auto px-3.5 pb-8" style={{ top: 58, scrollbarWidth: 'none' }}>
        {/* glass sheet */}
        <div className="rounded-[34px] p-3" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.16)' }}>
          <div className="mx-auto mb-3 h-[5px] w-10 rounded-full bg-white/30" />
          {/* cover photo */}
          <div className="relative h-[200px] overflow-hidden rounded-[26px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/demo/barbershop-cover.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.45) 100%)' }} />
            <span className="absolute top-3 right-3 flex h-10 w-10 items-center justify-center rounded-[13px] text-white" style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)' }}>
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v12M7 8l5-5 5 5M5 14v5a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-5" /></svg>
            </span>
            <span className="absolute top-3 left-3 flex items-center gap-2 whitespace-nowrap rounded-full px-3.5 py-1.5 text-[13.5px] font-semibold text-white" style={{ background: 'rgba(20,16,14,0.5)', border: '1px solid rgba(255,255,255,0.3)' }}>
              <span className="h-2 w-2 rounded-full bg-[#34c759]" />{t.open}
            </span>
          </div>
          {/* barber photo */}
          <div className="relative -mt-10 flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/demo/barber-avatar.webp" alt="" width={84} height={84} className="h-[84px] w-[84px] rounded-full object-cover" style={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.92), 0 10px 24px rgba(0,0,0,0.35)' }} />
          </div>
          <div className="mt-2.5 text-center text-[24px] font-bold text-white">Golden Scissors</div>
          <div className="mt-1 flex items-center justify-center gap-1.5 text-[14px] text-white/70">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" /><circle cx="12" cy="10" r="2.5" /></svg>
            <span className="underline">Assen</span>
          </div>

          <div className="mt-5 px-1 text-[16px] font-semibold text-white">{t.details}</div>
          <div className="mt-2.5 overflow-hidden rounded-[20px]" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}>
            <Row label={t.date} value={dayText} icon={ICON.date} onClick={() => setOpen(open === 'date' ? null : 'date')} />
            {open === 'date' && (
              <div className="flex gap-1.5 overflow-x-auto px-4 pb-3" style={{ scrollbarWidth: 'none' }}>
                {days.map((d, i) => (
                  <button key={i} type="button" onClick={() => { setDay(i); setTime(null); setOpen('time') }}
                    className="pd-btn w-[46px] flex-shrink-0 rounded-[14px] py-1.5 text-center"
                    style={{ background: day === i ? '#fff' : 'rgba(255,255,255,0.1)', color: day === i ? '#111' : '#fff' }}>
                    <span className="block text-[11px] opacity-70">{i === 0 ? t.today : t.days[d.getDay()]}</span>
                    <span className="block text-[17px] font-semibold">{d.getDate()}</span>
                  </button>
                ))}
              </div>
            )}
            {line}
            <Row label={t.time} value={time ?? (day === null ? t.pickDate : t.choose)} icon={ICON.time} dim={day === null}
              onClick={() => { if (day !== null) setOpen(open === 'time' ? null : 'time') }} />
            {open === 'time' && day !== null && (
              <div className="grid grid-cols-3 gap-1.5 px-4 pb-3">
                {TIMES.map(h => {
                  const busy = TAKEN.has(h)
                  return (
                    <button key={h} type="button" disabled={busy} onClick={() => { setTime(h); setOpen(null) }}
                      className="pd-btn rounded-[12px] py-2 text-[14px] font-semibold"
                      style={busy
                        ? { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', textDecoration: 'line-through' }
                        : { background: time === h ? '#fff' : 'rgba(255,255,255,0.1)', color: time === h ? '#111' : '#fff' }}>
                      {h}
                    </button>
                  )
                })}
              </div>
            )}
            {line}
            <Row label={t.service} value={t.haircut} icon={ICON.service} />
          </div>
          <div className="mt-2.5 px-2 text-[13px] leading-snug text-white/60">{t.note}</div>
        </div>

        <div className="mt-5 text-center text-[14px] text-white/60">{t.powered} <b className="text-white">Snippr</b></div>
        <div className="mt-3 flex justify-center gap-2">
          {['Türkçe', 'Nederlands', 'English'].map(l => (
            <span key={l} className="rounded-full px-3.5 py-1.5 text-[13px] font-semibold"
              style={{ border: '1px solid rgba(255,255,255,0.25)', color: l === activeLang ? '#fff' : 'rgba(255,255,255,0.55)', background: l === activeLang ? 'rgba(255,255,255,0.12)' : 'transparent' }}>{l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
