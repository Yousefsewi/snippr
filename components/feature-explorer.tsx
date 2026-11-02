'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, CalendarDays, ChevronRight, Clock3, MapPin, Plus, Scissors, Share } from 'lucide-react'

// "Feature explorer" on the homepage: tabs on top, a big heading, a short text and a plain
// spec list (label left, value right, thin lines — no boxes). On the left a small product
// picture per tab with "+" points that explain what you see. Soft mint → peach → green wash.
// Every value here is a real Snippr feature; keep it that way when editing.

type Lng = 'en' | 'tr'
type Tab = { key: string; tab: string; title: string; body: string; specs: [string, string][]; points: [string, string][] }

const COPY: Record<Lng, { cta: string; tabs: Tab[] }> = {
  en: {
    cta: 'Start for free',
    tabs: [
      {
        key: 'booking', tab: 'Booking page', title: 'Booked while\nyou cut',
        body: 'Your own booking page with your services, prices and free times. Customers open your link from Instagram, WhatsApp or the QR code in your window, pick a time and get a confirmation right away — no app, no account, no phone calls.',
        specs: [['Price', 'Free'], ['Customer account', 'Not needed'], ['App download', 'Not needed'], ['Languages', 'EN · TR · NL · AR'], ['Share it as', 'Link + QR code'], ['Setup time', '± 2 min']],
        points: [['Your shop', 'Photo, name and address at the top'], ['Date & time', 'Taken times disappear for everyone else'], ['Pay in the shop', 'Nothing is charged online']],
      },
      {
        key: 'calendar', tab: 'Calendar', title: 'Every booking,\none calendar',
        body: 'New bookings appear in your calendar the moment they come in, and your phone gets a notification. Block a lunch break or a day off in one move; nobody can book over it. A full day? People join your waiting list instead.',
        specs: [['Views', 'Day · Week · Month'], ['Double bookings', 'Blocked'], ['New booking alert', 'Instant push'], ['Closed times', 'Any slot, any day'], ['Waiting list', 'Built in'], ['Your hours', 'Per weekday']],
        points: [['Live', 'Bookings show up instantly'], ['Closed', 'Breaks and days off stay free'], ['Today', 'See your whole day at a glance']],
      },
      {
        key: 'reminders', tab: 'Reminders', title: 'Fewer\nempty chairs',
        body: 'Snippr emails your customers for you: a confirmation right after booking, a reminder before the appointment, and a message if it is cancelled. Every email goes out in the language your customer booked in. Switch each one on or off.',
        specs: [['Confirmation', 'Right away'], ['Reminder', '1 or 3 days before'], ['Sent at', '10:00 (NL time)'], ['Cancellation', 'Automatic'], ['Thank-you', 'After the visit'], ['Language', 'The customer’s own']],
        points: [['Reminder', 'Lands one day before, at 10:00'], ['Details', 'Date, time, service and price'], ['Maps', 'Your address opens in one tap']],
      },
      {
        key: 'sales', tab: 'Sales', title: 'Know what\nyou earned',
        body: 'See your sales for a day, a week or a month: services, tips and how people paid. Add a sale by hand when someone walks in, and export everything for your bookkeeping in one click.',
        specs: [['Periods', 'Day · Week · Month'], ['Tips', 'Tracked'], ['Payment methods', 'Cash · Card · Other'], ['Export', 'PDF · CSV · Excel'], ['Walk-ins', 'Add by hand'], ['First-visit discount', 'Optional']],
        points: [['This week', 'Your earnings day by day'], ['Tips', 'Counted separately'], ['Export', 'Ready for your accountant']],
      },
    ],
  },
  tr: {
    cta: 'Ücretsiz başla',
    tabs: [
      {
        key: 'booking', tab: 'Randevu sayfası', title: 'Sen keserken\nrandevu gelir',
        body: 'Hizmetlerin, fiyatların ve boş saatlerinle kendi randevu sayfan. Müşteri linkini Instagram’dan, WhatsApp’tan ya da camındaki QR koddan açar, saati seçer ve hemen onay alır — uygulama yok, hesap yok, telefon yok.',
        specs: [['Fiyat', 'Ücretsiz'], ['Müşteri hesabı', 'Gerekmez'], ['Uygulama', 'Gerekmez'], ['Diller', 'EN · TR · NL · AR'], ['Paylaşım', 'Link + QR kod'], ['Kurulum', '± 2 dk']],
        points: [['Dükkânın', 'Fotoğraf, ad ve adres en üstte'], ['Tarih ve saat', 'Dolan saat herkes için kapanır'], ['Dükkânda ödeme', 'Online hiçbir ücret alınmaz']],
      },
      {
        key: 'calendar', tab: 'Takvim', title: 'Tüm randevular\ntek takvimde',
        body: 'Yeni randevular gelir gelmez takviminde görünür, telefonuna bildirim düşer. Öğle arasını ya da izin gününü tek hareketle kapat; kimse üstüne randevu alamaz. Gün doluysa müşteri bekleme listesine yazılır.',
        specs: [['Görünüm', 'Gün · Hafta · Ay'], ['Çakışan randevu', 'Engellenir'], ['Yeni randevu', 'Anında bildirim'], ['Kapalı saatler', 'İstediğin saat, gün'], ['Bekleme listesi', 'Dahil'], ['Çalışma saatleri', 'Her gün ayrı']],
        points: [['Canlı', 'Randevular anında görünür'], ['Kapalı', 'Mola ve izinler boş kalır'], ['Bugün', 'Bütün günün tek bakışta']],
      },
      {
        key: 'reminders', tab: 'Hatırlatmalar', title: 'Daha az\nboş koltuk',
        body: 'Snippr müşterilerine senin yerine mail atar: randevudan hemen sonra onay, randevudan önce hatırlatma, iptal olursa bilgi. Her mail müşterinin randevu aldığı dilde gider. Her birini açıp kapatabilirsin.',
        specs: [['Onay', 'Hemen'], ['Hatırlatma', '1 veya 3 gün önce'], ['Gönderim saati', '10:00 (NL saati)'], ['İptal', 'Otomatik'], ['Teşekkür', 'Ziyaretten sonra'], ['Dil', 'Müşterinin dili']],
        points: [['Hatırlatma', 'Bir gün önce saat 10:00’da'], ['Bilgiler', 'Tarih, saat, hizmet ve fiyat'], ['Harita', 'Adresin tek dokunuşla açılır']],
      },
      {
        key: 'sales', tab: 'Satışlar', title: 'Ne kazandığını\nbil',
        body: 'Günün, haftanın ya da ayın satışlarını gör: hizmetler, bahşişler ve nasıl ödendiği. Kapıdan gelen müşteriyi elle ekle, muhasebe için her şeyi tek tıkla dışa aktar.',
        specs: [['Dönem', 'Gün · Hafta · Ay'], ['Bahşiş', 'Kaydedilir'], ['Ödeme şekli', 'Nakit · Kart · Diğer'], ['Dışa aktar', 'PDF · CSV · Excel'], ['Kapıdan gelen', 'Elle eklenir'], ['İlk ziyaret indirimi', 'İsteğe bağlı']],
        points: [['Bu hafta', 'Gün gün kazancın'], ['Bahşiş', 'Ayrı sayılır'], ['Dışa aktar', 'Muhasebeciye hazır']],
      },
    ],
  },
}

const mono = { fontFamily: 'var(--font-geist-mono), ui-monospace, monospace' } as const
const serif = { fontFamily: 'var(--font-noto-serif), Georgia, serif' } as const

// where the "+" points sit on each picture (percent of the picture box)
const POINTS: Record<string, [number, number][]> = {
  booking: [[0, 24], [100, 70], [0, 94]],
  calendar: [[100, 10], [0, 62], [100, 82]],
  reminders: [[100, 12], [0, 50], [100, 86]],
  sales: [[0, 26], [100, 52], [0, 88]],
}

function Picture({ k, lng }: { k: string; lng: Lng }) {
  const tr = lng === 'tr'
  const card = 'rounded-[26px] bg-white/85 shadow-[0_40px_80px_-40px_rgba(30,50,40,0.45)] ring-1 ring-black/[0.04] backdrop-blur'
  // the real Snippr booking page (app/b/[slug]): dark glass sheet, cover with "open today",
  // iOS-style rows with coloured icon tiles — with sample shop data
  if (k === 'booking') {
    const ios = { fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable', 'Segoe UI', system-ui, sans-serif" }
    // plain icon: one colour, flat, thin outline — no colours, no gloss
    const row = (Icon: typeof CalendarDays, label: string, value: string, last?: boolean) => (
      <div className="flex items-center gap-3 px-3 py-2.5" style={last ? undefined : { borderBottom: '1px solid rgba(255,255,255,0.12)', marginLeft: 0 }}>
        <span className="flex h-[30px] w-[30px] flex-shrink-0 items-center justify-center rounded-[9px] text-white/85"
          style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.14)' }}>
          <Icon size={15} strokeWidth={1.75} />
        </span>
        <span className="text-[14px] text-white">{label}</span>
        <span className="ml-auto flex items-center gap-1 text-[13.5px] text-white/60">{value}<ChevronRight size={14} className="text-white/40" /></span>
      </div>
    )
    return (
      <div className="mx-auto w-[300px]" style={ios}>
        <div className="relative overflow-hidden rounded-[34px] p-3 shadow-[0_40px_80px_-30px_rgba(20,14,10,0.6)]" style={{ border: '1px solid rgba(255,255,255,0.18)' }}>
          {/* background: the shop photo, blurred and darkened (like the real booking page) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/demo/barbershop-cover.webp" alt="" className="absolute inset-0 h-full w-full object-cover" style={{ filter: 'blur(26px) saturate(1.15)', transform: 'scale(1.35)' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(30,20,14,0.45) 0%, rgba(22,18,18,0.72) 55%, rgba(16,15,17,0.86) 100%)' }} />

          <div className="relative">
            <div className="mx-auto mb-2.5 h-1 w-9 rounded-full bg-white/30" />
            {/* cover photo */}
            <div className="relative h-[148px] overflow-hidden rounded-[22px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/demo/barbershop-cover.webp" alt="" className="absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.45) 100%)' }} />
              <span className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-[10px] text-white" style={{ background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)', backdropFilter: 'blur(8px)' }}><Share size={14} /></span>
              <span className="absolute top-2.5 left-2.5 flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-semibold text-white"
                style={{ background: 'rgba(20,16,14,0.45)', border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(8px)' }}>
                <span className="h-1.5 w-1.5 rounded-full bg-[#34c759]" />{tr ? 'Bugün açık 09:00–19:00' : 'Open today 09:00–19:00'}
              </span>
            </div>
            {/* barber photo, overlapping the cover */}
            <div className="relative -mt-9 flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/demo/barber-avatar.webp" alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-full object-cover" style={{ boxShadow: '0 0 0 3px rgba(255,255,255,0.92), 0 10px 24px rgba(0,0,0,0.35)' }} />
            </div>
            <div className="mt-2 text-center text-[19px] font-bold text-white">Golden Scissors</div>
            <div className="mt-0.5 flex items-center justify-center gap-1 text-[12px] text-white/70"><MapPin size={12} /><span className="underline">Assen</span></div>
          <div className="mt-3 px-1 text-[13px] font-semibold text-white">{tr ? 'Randevu bilgileri' : 'Appointment details'}</div>
          <div className="mt-2 overflow-hidden rounded-[16px]" style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}>
            {row(CalendarDays, tr ? 'Tarih' : 'Date', tr ? 'Cmt 1 Kas' : 'Sat 1 Nov')}
            {row(Clock3, tr ? 'Saat' : 'Time', '14:30')}
            {row(Scissors, tr ? 'Hizmet' : 'Service', tr ? 'Saç kesimi' : 'Haircut', true)}
          </div>
          <div className="mt-2 px-1 text-[10.5px] leading-snug text-white/55">{tr ? 'Ödemeyi dükkânda yaparsın — online para çekilmez.' : 'You pay in the shop — nothing is charged online.'}</div>
          </div>
        </div>
      </div>
    )
  }
  if (k === 'calendar') return (
    <div className={`${card} mx-auto w-[340px] p-5`}>
      <div className="flex items-baseline justify-between"><p className="text-[15px] font-semibold text-[#1d1d1f]">{tr ? 'Bugün' : 'Today'}</p><p className="text-[11px] uppercase tracking-[0.12em] text-[#6b7280]" style={mono}>4 {tr ? 'randevu' : 'bookings'}</p></div>
      <div className="mt-4 space-y-2">
        {[['10:00', 'Ali · ' + (tr ? 'Saç kesimi' : 'Haircut'), '#e8f0fe', '#1d4ed8'], ['11:00', 'Mehmet · ' + (tr ? 'Sakal' : 'Beard'), '#eaf7ee', '#15803d'], ['12:30', tr ? 'Öğle arası' : 'Lunch break', '#f3f4f6', '#6b7280'], ['14:30', 'Sam · Fade', '#fdf2e9', '#b45309'], ['16:00', 'Yusuf · ' + (tr ? 'Saç + sakal' : 'Hair + beard'), '#e8f0fe', '#1d4ed8']].map(([t, n, bg, fg]) => (
          <div key={t} className="flex items-center gap-3">
            <span className="w-11 text-[12px] text-[#9ca3af] tabular-nums" style={mono}>{t}</span>
            <span className="flex-1 rounded-[10px] px-3 py-2 text-[12.5px] font-medium" style={{ background: bg, color: fg }}>{n}</span>
          </div>
        ))}
      </div>
    </div>
  )
  if (k === 'reminders') return (
    <div className={`${card} mx-auto w-[330px] p-5`}>
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#6b7280]" style={mono}>{tr ? 'Yarın · 10:00' : 'Tomorrow · 10:00'}</p>
      <p className="mt-2 text-[16px] font-semibold text-[#1d1d1f]">{tr ? 'Yarın görüşürüz, Ali!' : 'See you tomorrow, Ali!'}</p>
      <div className="mt-4 divide-y divide-[#f0f0ee] text-[13px]">
        {[[tr ? 'Tarih' : 'Date', tr ? 'Cumartesi 1 Kasım' : 'Saturday 1 Nov'], [tr ? 'Saat' : 'Time', '14:30'], [tr ? 'Hizmet' : 'Service', tr ? 'Saç kesimi · €25' : 'Haircut · €25']].map(([a, b]) => (
          <div key={a} className="flex justify-between py-2"><span className="text-[#9ca3af]">{a}</span><span className="font-medium text-[#1d1d1f]">{b}</span></div>
        ))}
      </div>
      <div className="mt-4 rounded-full border border-[#e5e7eb] py-2.5 text-center text-[13px] font-medium text-[#1d1d1f]">{tr ? 'Haritada aç' : 'Open in Maps'}</div>
    </div>
  )
  const bars = [38, 62, 45, 80, 70, 95, 52]
  return (
    <div className={`${card} mx-auto w-[340px] p-5`}>
      <p className="text-[11px] uppercase tracking-[0.12em] text-[#6b7280]" style={mono}>{tr ? 'Bu hafta' : 'This week'}</p>
      <p className="mt-1 text-[30px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">€1.240</p>
      <div className="mt-4 flex h-[110px] items-end gap-2">
        {bars.map((h, i) => <span key={i} className="flex-1 rounded-t-[6px]" style={{ height: `${h}%`, background: i === 5 ? '#1d1d1f' : '#d9e4dc' }} />)}
      </div>
      <div className="mt-2 flex justify-between text-[10.5px] text-[#9ca3af]" style={mono}>
        {(tr ? ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'] : ['M', 'T', 'W', 'T', 'F', 'S', 'S']).map((d, i) => <span key={i} className="flex-1 text-center">{d}</span>)}
      </div>
      <div className="mt-4 flex justify-between border-t border-[#f0f0ee] pt-3 text-[13px]"><span className="text-[#9ca3af]">{tr ? 'Bahşiş' : 'Tips'}</span><span className="font-medium text-[#1d1d1f]">€86</span></div>
    </div>
  )
}

export default function FeatureExplorer({ lng }: { lng: Lng }) {
  const c = COPY[lng] ?? COPY.en
  const [active, setActive] = useState(0)
  const [openPoint, setOpenPoint] = useState<number | null>(null)
  const tab = c.tabs[active]

  return (
    <section className="feature-explorer relative overflow-hidden px-5 py-20 md:px-10 lg:py-28">
      {/* colour wash, faded at the top and bottom so it melts into the page */}
      <div aria-hidden className="pointer-events-none absolute inset-0"
        style={{ background: 'linear-gradient(180deg, #eef3ee 0%, #f3f1e9 40%, #fbeedd 70%, #eef6dc 100%)', maskImage: 'linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, #000 12%, #000 88%, transparent)' }} />
      <div className="relative mx-auto grid max-w-[1280px] items-center gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">

        {/* picture with "+" points */}
        <div className="relative order-2 min-h-[420px] lg:order-1 lg:min-h-[560px]">
          <AnimatePresence mode="wait">
            <motion.div key={tab.key} className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0, y: 16, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
              <div className="relative lg:scale-[1.22] xl:scale-[1.3]">
                <Picture k={tab.key} lng={lng} />
                {POINTS[tab.key].map(([x, y], i) => {
                  const open = openPoint === i
                  const [label, text] = tab.points[i]
                  return (
                    <div key={i} className="absolute z-10" style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                      onMouseEnter={() => setOpenPoint(i)} onMouseLeave={() => setOpenPoint(null)}>
                      <button type="button" onClick={() => setOpenPoint(open ? null : i)} aria-expanded={open} aria-label={label}
                        className="fx-point flex h-8 w-8 items-center justify-center rounded-[9px] bg-[#e9efe9]/90 text-[#1d1d1f] shadow-[0_6px_16px_-6px_rgba(0,0,0,0.25)] ring-1 ring-white backdrop-blur transition hover:scale-105">
                        <Plus size={16} strokeWidth={1.75} className={`transition-transform ${open ? 'rotate-45' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {open && (
                          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} transition={{ duration: 0.18 }}
                            className={`absolute top-10 w-[170px] lg:top-1/2 lg:w-[190px] lg:-translate-y-1/2 ${x > 50 ? "right-0 text-right lg:right-auto lg:left-11 lg:text-left" : "left-0 text-left lg:left-auto lg:right-11 lg:text-right"}`}>
                            <p className="text-[11px] uppercase tracking-[0.12em] text-[#1d1d1f]" style={mono}>{label}</p>
                            <p className="mt-1 text-[13px] leading-snug text-[#4b5563]">{text}</p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* tabs, heading, text, spec list */}
        <div className="order-1 min-w-0 lg:order-2">
          <div className="-mx-1 flex gap-1 overflow-x-auto rounded-[14px] bg-white/80 p-1.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)] backdrop-blur [scrollbar-width:none]" role="tablist">
            {c.tabs.map((tb, i) => (
              <button key={tb.key} role="tab" aria-selected={i === active} onClick={() => { setActive(i); setOpenPoint(null) }}
                className="fx-tab flex-shrink-0 rounded-[10px] px-4 py-2.5 text-[12.5px] uppercase tracking-[0.08em] transition-colors hover:text-[#1d1d1f]"
                style={{ ...mono, background: i === active ? '#e3ece4' : 'transparent', color: i === active ? '#1d1d1f' : '#4b5563' }}>
                {tb.tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={tab.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35 }}>
              <h2 className="mt-10 whitespace-pre-line text-[44px] leading-[1.02] tracking-[-0.03em] text-[#1d1d1f] md:text-[60px]" style={{ ...serif, fontWeight: 400 }}>
                {tab.title}
              </h2>
              <p className="mt-6 max-w-[560px] text-[16.5px] leading-[1.6] text-[#3b4048] md:text-[18px]">{tab.body}</p>

              <dl className="mt-9 border-t border-[#1d1d1f]/10">
                {tab.specs.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 border-b border-[#1d1d1f]/10 py-3.5">
                    <dt className="text-[13px] uppercase tracking-[0.08em] text-[#1d1d1f]" style={mono}>{k}</dt>
                    <dd className="text-right text-[13px] uppercase tracking-[0.08em] text-[#6b7280]" style={mono}>{v}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </AnimatePresence>

          <Link href="/register" className="group mt-8 flex items-center justify-between rounded-[12px] bg-white px-5 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.05)] transition hover:shadow-[0_10px_30px_-14px_rgba(0,0,0,0.25)]">
            <span className="text-[15px] uppercase tracking-[0.08em] text-[#1d1d1f]" style={mono}>{c.cta}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#e3ece4] text-[#1d1d1f] transition group-hover:translate-x-0.5">
              <ArrowRight size={16} />
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
