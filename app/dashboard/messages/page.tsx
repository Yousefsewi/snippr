'use client'

// Automated client messages: which emails go out on their own, with a live preview.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft, Bell, CalendarCheck, CalendarPlus, CalendarX, CalendarClock, Crown, Eye, Gem, Heart, Hourglass, Mail, MessageCircle, Smartphone, Star, ThumbsUp, UserPlus, X,
  type LucideIcon,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useLang } from '@/lib/i18n'
import { isOn, messageHtml, type MsgKind, type MsgSettings } from '@/lib/messages'
import MessagesHero from '@/components/messages-hero'

type Channel = 'email' | 'push'
type Card = { id: string; icon: LucideIcon; title: string; desc: string; channels: Channel[]; kind?: MsgKind; always?: boolean; soon?: boolean }

const COPY = {
  en: {
    back: 'Add-ons', title: 'Automated messages', sub: 'Emails that go to your clients on their own, so you don’t have to text everyone.',
    on: 'On', off: 'Off', soon: 'Coming soon', always: 'Always on', preview: 'Preview', close: 'Close', subject: 'Subject',
    setup: 'Run supabase/messages.sql in the Supabase SQL Editor once to save these switches.',
    noEmail: 'Emails only go to clients who left an email address when booking.',
    sections: { reminders: 'Reminders', updates: 'Appointment updates', waitlist: 'Waitlist', loyalty: 'Client loyalty' },
    cards: {
      r3d: ['3 days before', 'Reminds clients of their upcoming appointment 3 days ahead.'],
      r24: ['24 hours before', 'Reminds clients of their appointment the day before.'],
      r1h: ['1 hour before', 'A last nudge one hour before the appointment.'],
      newBooking: ['New appointment', 'Clients get a booking confirmation, and you get a notification.'],
      confirmed: ['Appointment confirmed', 'Sent when you confirm a booking.'],
      cancelled: ['Appointment cancelled', 'Sent when you cancel a booking, with a link to pick a new time.'],
      thanks: ['Thanks for your visit', 'Sent when an appointment is completed, with your Google review link if you added one.'],
      tip: ['Thanks for the tip', 'Sent when you record a tip at the till.'],
      wJoin: ['Joined the waitlist', 'Confirms to clients that they are on your waitlist.'],
      wSlot: ['A spot opened up', 'Tells waiting clients when a time becomes free.'],
      points: ['Points summary', 'Sends clients a summary of the points they earned.'],
      tier: ['New loyalty tier', 'Tells clients when they reach a new tier.'],
      referral: ['Referral reward', 'Tells clients when a friend they referred books.'],
    },
    reviewHint: 'Add your Google review link', reviewSet: 'Google review link added',
    history: 'Message history', historySub: 'Emails Snippr sent to your clients.', historyEmpty: 'No messages sent yet', historyEmptySub: 'When an automatic email goes out, it shows up here.', kinds: { new: 'New appointment', confirmed: 'Appointment confirmed', cancelled: 'Appointment cancelled', thanks: 'Thanks for your visit', tip: 'Thanks for the tip' } as Record<string, string>, settingsTitle: 'Message settings', apptOn: 'Appointment',
  },
  tr: {
    back: 'Eklentiler', title: 'Otomatik mesajlar', sub: 'Müşterilerine kendiliğinden giden e-postalar. Herkese tek tek yazmana gerek kalmaz.',
    on: 'Etkin', off: 'Kapalı', soon: 'Yakında', always: 'Her zaman açık', preview: 'Önizle', close: 'Kapat', subject: 'Konu',
    setup: 'Bu ayarları kaydetmek için supabase/messages.sql dosyasını Supabase SQL Editor’da bir kez çalıştır.',
    noEmail: 'E-postalar sadece randevu alırken e-posta adresi bırakan müşterilere gider.',
    sections: { reminders: 'Hatırlatmalar', updates: 'Randevu güncellemeleri', waitlist: 'Bekleme listesi', loyalty: 'Müşteri sadakati' },
    cards: {
      r3d: ['3 gün öncesinde hatırlatma', 'Müşterilere yaklaşan randevularını 3 gün önceden hatırlatır.'],
      r24: ['24 saat öncesinde hatırlatma', 'Müşterilere randevularını bir gün önceden hatırlatır.'],
      r1h: ['1 saat öncesinde hatırlatma', 'Randevudan bir saat önce son bir hatırlatma.'],
      newBooking: ['Yeni randevu', 'Müşteriye randevu onayı gider, sana da bildirim gelir.'],
      confirmed: ['Randevu onaylandı', 'Bir randevuyu onayladığında gönderilir.'],
      cancelled: ['İptal edilen randevu', 'Randevuyu iptal ettiğinde, yeni saat seçme linkiyle gönderilir.'],
      thanks: ['Ziyaret için teşekkürler', 'Randevu tamamlanınca gönderilir. Google yorum linkin varsa içinde olur.'],
      tip: ['Bahşiş için teşekkürler', 'Kasada bahşiş girdiğinde gönderilir.'],
      wJoin: ['Bekleme listesine katılım', 'Müşteriye bekleme listende olduğunu bildirir.'],
      wSlot: ['Müsait zaman aralığı', 'Bekleyen müşterilere bir saat boşalınca haber verir.'],
      points: ['Puan kazanımı özeti', 'Müşterilere kazandıkları puanların özetini gönderir.'],
      tier: ['Yeni sadakat kademesi', 'Müşteriler yeni bir kademeye ulaşınca bildirir.'],
      referral: ['Kazanılan tavsiye ödülleri', 'Tavsiye ettikleri arkadaşları randevu alınca bildirir.'],
    },
    reviewHint: 'Google yorum linkini ekle', reviewSet: 'Google yorum linki eklendi',
    history: 'Mesaj geçmişi', historySub: 'Snippr’ın müşterilerine gönderdiği e-postalar.', historyEmpty: 'Henüz mesaj gönderilmedi', historyEmptySub: 'Otomatik bir e-posta gidince burada görünür.', kinds: { new: 'Yeni randevu', confirmed: 'Randevu onaylandı', cancelled: 'İptal edilen randevu', thanks: 'Ziyaret için teşekkürler', tip: 'Bahşiş için teşekkürler' } as Record<string, string>, settingsTitle: 'Mesaj ayarları', apptOn: 'Randevu',
  },
}

function Switch({ on, onChange, disabled }: { on: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button role="switch" aria-checked={on} onClick={onChange} disabled={disabled}
      className="relative h-[28px] w-[46px] flex-shrink-0 rounded-full transition-colors disabled:opacity-40" style={{ background: on ? '#34c759' : '#e3e2e0' }}>
      <motion.span className="absolute top-[2px] h-[24px] w-[24px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.18)]" animate={{ left: on ? 20 : 2 }} transition={{ type: 'spring', stiffness: 600, damping: 35 }} />
    </button>
  )
}

export default function MessagesPage() {
  const { lang } = useLang()
  const lng = lang === 'tr' ? 'tr' : 'en'
  const t = COPY[lng]

  const [barber, setBarber] = useState<{ id: string; name: string; slug: string } | null>(null)
  const [settings, setSettings] = useState<MsgSettings>({})
  const [review, setReview] = useState<string | null>(null)
  const [ready, setReady] = useState(true)
  const [preview, setPreview] = useState<MsgKind | null>(null)
  const [history, setHistory] = useState<{ id: string; kind: string; client: string; email: string; date: string }[]>([])

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: b } = await supabase.from('barbers').select('id, name, slug').eq('user_id', user.id).single()
      if (!b || !active) return
      setBarber(b)
      const { data: m, error } = await supabase.from('barbers').select('message_settings, google_review_url').eq('id', b.id).single()
      if (!active) return
      if (error) { setReady(false); return }
      setSettings((m?.message_settings as MsgSettings) ?? {})
      setReview(m?.google_review_url ?? null)
      // every email that went out: booking confirmations (notified_at) + automatic ones (messages_sent)
      const { data: h } = await supabase.from('appointments')
        .select('id, customer_name, customer_email, start_time, notified_at, messages_sent')
        .eq('barber_id', b.id).not('customer_email', 'is', null).order('start_time', { ascending: false }).limit(200)
      if (!active || !h) return
      const rows: { id: string; kind: string; client: string; email: string; date: string }[] = []
      for (const a of h as { id: string; customer_name: string; customer_email: string; start_time: string; notified_at: string | null; messages_sent: string[] | null }[]) {
        if (a.customer_name.startsWith('⛔')) continue
        if (a.notified_at) rows.push({ id: `${a.id}-new`, kind: 'new', client: a.customer_name, email: a.customer_email, date: a.start_time })
        for (const k of a.messages_sent ?? []) rows.push({ id: `${a.id}-${k}`, kind: k, client: a.customer_name, email: a.customer_email, date: a.start_time })
      }
      setHistory(rows.slice(0, 60))
    })()
    return () => { active = false }
  }, [])

  async function toggle(k: MsgKind) {
    if (!barber || !ready) return
    const next = { ...settings, [k]: !isOn(settings, k) }
    setSettings(next)
    const { error } = await supabase.from('barbers').update({ message_settings: next }).eq('id', barber.id)
    if (error) setSettings(settings)
  }

  const C = t.cards
  const sections: { title: string; cards: Card[] }[] = [
    { title: t.sections.updates, cards: [
      { id: 'newBooking', icon: CalendarPlus, title: C.newBooking[0], desc: C.newBooking[1], channels: ['email', 'push'], always: true },
      { id: 'confirmed', icon: CalendarCheck, title: C.confirmed[0], desc: C.confirmed[1], channels: ['email'], kind: 'confirmed' },
      { id: 'cancelled', icon: CalendarX, title: C.cancelled[0], desc: C.cancelled[1], channels: ['email'], kind: 'cancelled' },
      { id: 'thanks', icon: ThumbsUp, title: C.thanks[0], desc: C.thanks[1], channels: ['email'], kind: 'thanks' },
      { id: 'tip', icon: Heart, title: C.tip[0], desc: C.tip[1], channels: ['email'], kind: 'tip' },
    ] },
    { title: t.sections.reminders, cards: [
      { id: 'r3d', icon: Bell, title: C.r3d[0], desc: C.r3d[1], channels: ['email'], soon: true },
      { id: 'r24', icon: Bell, title: C.r24[0], desc: C.r24[1], channels: ['email'], soon: true },
      { id: 'r1h', icon: Bell, title: C.r1h[0], desc: C.r1h[1], channels: ['email'], soon: true },
    ] },
    { title: t.sections.waitlist, cards: [
      { id: 'wJoin', icon: Hourglass, title: C.wJoin[0], desc: C.wJoin[1], channels: ['email'], soon: true },
      { id: 'wSlot', icon: CalendarClock, title: C.wSlot[0], desc: C.wSlot[1], channels: ['email'], soon: true },
    ] },
    { title: t.sections.loyalty, cards: [
      { id: 'points', icon: Gem, title: C.points[0], desc: C.points[1], channels: ['email'], soon: true },
      { id: 'tier', icon: Crown, title: C.tier[0], desc: C.tier[1], channels: ['email'], soon: true },
      { id: 'referral', icon: UserPlus, title: C.referral[0], desc: C.referral[1], channels: ['email'], soon: true },
    ] },
  ]

  const sample = (k: MsgKind) => messageHtml(k, lng, {
    client: lng === 'tr' ? 'Ahmet Yılmaz' : 'Alex Morgan', barber: barber?.name || 'Snippr', service: lng === 'tr' ? 'Saç kesimi' : 'Haircut',
    date: new Date(2026, 10, 14).toLocaleDateString(lng === 'tr' ? 'tr-TR' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long' }), time: '14:30',
    bookUrl: '#', reviewUrl: review, tip: '50',
  })

  return (
    <div className="pb-16" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif' }}>
      <Link href="/dashboard/addons" className="inline-flex items-center gap-1 text-[14.5px] font-medium text-[#0a84ff] hover:underline"><ArrowLeft size={16} /> {t.back}</Link>
      <h1 className="mt-3 mb-4 text-[30px] font-bold tracking-[-0.02em] text-[#37352f]">{t.title}</h1>
      <MessagesHero lang={lng} />
      <h2 id="settings" className="mt-10 scroll-mt-6 text-[22px] font-bold text-[#37352f]">{t.settingsTitle}</h2>
      <p className="mt-1 max-w-[560px] text-[15px] text-[#787774]">{t.sub}</p>
      <p className="mt-3 flex items-center gap-2 text-[13px] text-[#9b9a97]"><Mail size={14} /> {t.noEmail}</p>

      {!ready && <div className="mt-5 rounded-[18px] border border-[#f5d48a] bg-[#fff8e6] p-4 text-[14px] text-[#5c4300]">{t.setup}</div>}

      {sections.map(sec => (
        <section key={sec.title} className="mt-9">
          <h2 className="mb-3 text-[19px] font-bold text-[#37352f]">{sec.title}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sec.cards.map(c => {
              const on = c.always || (c.kind ? isOn(settings, c.kind) : false)
              return (
                <motion.div key={c.id} whileHover={{ y: -2 }} className="flex flex-col rounded-[20px] border border-[#ededec] bg-white p-5" style={{ opacity: c.soon ? 0.62 : 1 }}>
                  <div className="flex items-start justify-between gap-3">
                    <c.icon size={22} strokeWidth={1.8} style={{ color: c.soon ? '#9b9a97' : 'var(--accent)' }} />
                    {c.kind && <Switch on={on} onChange={() => toggle(c.kind!)} disabled={!ready} />}
                  </div>
                  <h3 className="mt-4 text-[15.5px] font-semibold text-[#37352f]">{c.title}</h3>
                  <p className="mt-1 flex-1 text-[13.5px] leading-relaxed text-[#787774]">{c.desc}</p>
                  {c.kind === 'thanks' && ready && (
                    <Link href="/dashboard/addons?google=1" className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: review ? '#1c6b3f' : 'var(--accent)' }}>
                      <Star size={13} /> {review ? t.reviewSet : t.reviewHint}
                    </Link>
                  )}
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <span className="rounded-full px-2.5 py-1 text-[12px] font-semibold"
                      style={c.soon ? { background: '#f1f1ef', color: '#9b9a97' } : on ? { background: '#e9f6ec', color: '#1c6b3f' } : { background: '#f1f1ef', color: '#787774' }}>
                      {c.soon ? t.soon : c.always ? t.always : on ? t.on : t.off}
                    </span>
                    <span className="flex items-center gap-2 text-[#9b9a97]">
                      {c.kind && (
                        <button onClick={() => setPreview(c.kind!)} className="flex items-center gap-1 rounded-full px-2 py-1 text-[12.5px] font-semibold text-[#37352f] hover:bg-[#f1f1ef]"><Eye size={14} /> {t.preview}</button>
                      )}
                      {c.channels.includes('email') && <Mail size={15} />}
                      {c.channels.includes('push') && <Smartphone size={15} />}
                      {c.soon && <MessageCircle size={15} />}
                    </span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </section>
      ))}

      {/* message history */}
      <section id="history" className="mt-12 scroll-mt-6">
        <h2 className="text-[22px] font-bold text-[#37352f]">{t.history}</h2>
        <p className="mt-1 text-[14.5px] text-[#787774]">{t.historySub}</p>
        <div className="mt-4 overflow-hidden rounded-[20px] border border-[#ededec] bg-white">
          {history.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Mail size={30} strokeWidth={1.5} className="text-[#d3d2cf]" />
              <p className="mt-3 text-[15px] font-semibold text-[#37352f]">{t.historyEmpty}</p>
              <p className="mt-1 text-[13.5px] text-[#9b9a97]">{t.historyEmptySub}</p>
            </div>
          ) : history.map((h, i) => (
            <div key={h.id} className="flex items-center gap-3 px-5 py-3" style={{ borderTop: i ? '1px solid #f1f1ef' : 'none' }}>
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#f1f1ef] text-[#787774]"><Mail size={16} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[14.5px] font-semibold text-[#37352f]">{t.kinds[h.kind] ?? h.kind}</p>
                <p className="truncate text-[13px] text-[#9b9a97]">{h.client} · {h.email}</p>
              </div>
              <p className="text-right text-[12.5px] whitespace-nowrap text-[#9b9a97]">{t.apptOn}<br />{new Date(h.date).toLocaleDateString(lng === 'tr' ? 'tr-TR' : 'en-GB', { day: 'numeric', month: 'short' })}</p>
            </div>
          ))}
        </div>
      </section>

      {/* email preview, shown like a phone mail app */}
      <AnimatePresence>
        {preview && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPreview(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4">
            <motion.div initial={{ y: 30, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-[420px] overflow-hidden rounded-[28px] bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#ededec] px-5 py-3.5">
                <div className="min-w-0">
                  <p className="text-[12px] text-[#9b9a97]">{t.subject}</p>
                  <p className="truncate text-[14.5px] font-semibold text-[#37352f]">{sample(preview).subject}</p>
                </div>
                <button onClick={() => setPreview(null)} aria-label={t.close} className="rounded-full p-1.5 text-[#787774] hover:bg-[#f1f1ef]"><X size={18} /></button>
              </div>
              <iframe title="preview" srcDoc={sample(preview).html} sandbox="" className="h-[380px] w-full border-0 bg-white" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
