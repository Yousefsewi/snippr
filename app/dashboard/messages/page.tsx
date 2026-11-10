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
import { isOn, planAllows, PRO_ONLY_KINDS, messageHtml, type MsgKind, type MsgSettings } from '@/lib/messages'
import type { ClientLang } from '@/lib/messages'
import MessagesHero from '@/components/messages-hero'
import { SHOW_UNRELEASED } from '@/lib/legal'
import { SITE_LOCALE, toSiteLng } from '@/lib/site-lang'

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
      r3d: ['3 days before', 'Reminds clients of their upcoming appointment 3 days ahead (sent every morning).'],
      r24: ['The day before', 'Reminds clients of their appointment the day before (sent every morning).'],
      r1h: ['1 hour before', 'A last nudge one hour before. Needs an hourly job — coming soon.'],
      newBooking: ['New appointment', 'Clients get a booking confirmation, and you get a notification.'],
      confirmed: ['Appointment confirmed', 'Sent when you confirm a booking.'],
      rescheduled: ['Appointment moved', 'Sent when you move a booking to another time in your calendar.'],
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
    history: 'Message history', historySub: 'Emails Snippr sent to your clients.', historyEmpty: 'No messages sent yet', historyEmptySub: 'When an automatic email goes out, it shows up here.', kinds: { remind1d: 'Reminder (1 day before)', remind3d: 'Reminder (3 days before)', new: 'New appointment', confirmed: 'Appointment confirmed', rescheduled: 'Appointment moved', cancelled: 'Appointment cancelled', thanks: 'Thanks for your visit', tip: 'Thanks for the tip' } as Record<string, string>, upgrade: 'Switch to Pro', settingsTitle: 'Message settings', apptOn: 'Appointment',
  },
  tr: {
    back: 'Eklentiler', title: 'Otomatik mesajlar', sub: 'Müşterilerine kendiliğinden giden e-postalar. Herkese tek tek yazmana gerek kalmaz.',
    on: 'Etkin', off: 'Kapalı', soon: 'Yakında', always: 'Her zaman açık', preview: 'Önizle', close: 'Kapat', subject: 'Konu',
    setup: 'Bu ayarları kaydetmek için supabase/messages.sql dosyasını Supabase SQL Editor’da bir kez çalıştır.',
    noEmail: 'E-postalar sadece randevu alırken e-posta adresi bırakan müşterilere gider.',
    sections: { reminders: 'Hatırlatmalar', updates: 'Randevu güncellemeleri', waitlist: 'Bekleme listesi', loyalty: 'Müşteri sadakati' },
    cards: {
      r3d: ['3 gün öncesinde hatırlatma', 'Müşterilere yaklaşan randevularını 3 gün önceden hatırlatır (her sabah gönderilir).'],
      r24: ['1 gün öncesinde hatırlatma', 'Müşterilere randevularını bir gün önceden hatırlatır (her sabah gönderilir).'],
      r1h: ['1 saat öncesinde hatırlatma', 'Randevudan bir saat önce son hatırlatma. Saatlik çalışan bir sistem gerektirir — yakında.'],
      newBooking: ['Yeni randevu', 'Müşteriye randevu onayı gider, sana da bildirim gelir.'],
      confirmed: ['Randevu onaylandı', 'Bir randevuyu onayladığında gönderilir.'],
      rescheduled: ['Randevu taşındı', 'Takvimde bir randevuyu başka bir saate taşıdığında gönderilir.'],
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
    history: 'Mesaj geçmişi', historySub: 'Snippr’ın müşterilerine gönderdiği e-postalar.', historyEmpty: 'Henüz mesaj gönderilmedi', historyEmptySub: 'Otomatik bir e-posta gidince burada görünür.', kinds: { remind1d: 'Hatırlatma (1 gün önce)', remind3d: 'Hatırlatma (3 gün önce)', new: 'Yeni randevu', confirmed: 'Randevu onaylandı', rescheduled: 'Randevu taşındı', cancelled: 'İptal edilen randevu', thanks: 'Ziyaret için teşekkürler', tip: 'Bahşiş için teşekkürler' } as Record<string, string>, upgrade: 'Pro’ya geç', settingsTitle: 'Mesaj ayarları', apptOn: 'Randevu',
  },
  nl: {
    back: 'Add-ons', title: 'Automatische berichten', sub: 'E-mails die vanzelf naar je klanten gaan, zodat je niet iedereen hoeft te appen.',
    on: 'Aan', off: 'Uit', soon: 'Binnenkort', always: 'Altijd aan', preview: 'Voorbeeld', close: 'Sluiten', subject: 'Onderwerp',
    setup: 'Voer supabase/messages.sql één keer uit in de Supabase SQL Editor om deze schakelaars op te slaan.',
    noEmail: 'E-mails gaan alleen naar klanten die bij het boeken een e-mailadres hebben achtergelaten.',
    sections: { reminders: 'Herinneringen', updates: 'Updates over afspraken', waitlist: 'Wachtlijst', loyalty: 'Klantenbinding' },
    cards: {
      r3d: ['3 dagen vooraf', 'Herinnert klanten 3 dagen van tevoren aan hun afspraak (elke ochtend verstuurd).'],
      r24: ['De dag ervoor', 'Herinnert klanten de dag ervoor aan hun afspraak (elke ochtend verstuurd).'],
      r1h: ['1 uur vooraf', 'Een laatste herinnering een uur van tevoren.'],
      newBooking: ['Nieuwe afspraak', 'Klanten krijgen een bevestiging en jij krijgt een melding.'],
      confirmed: ['Afspraak bevestigd', 'Verstuurd als je een afspraak bevestigt.'],
      rescheduled: ['Afspraak verplaatst', 'Verstuurd als je een afspraak in je agenda naar een andere tijd verplaatst.'],
      cancelled: ['Afspraak geannuleerd', 'Verstuurd als je een afspraak annuleert, met een link om een nieuwe tijd te kiezen.'],
      thanks: ['Bedankt voor je bezoek', 'Verstuurd als een afspraak is afgerond, met je Google-reviewlink als je die hebt toegevoegd.'],
      tip: ['Bedankt voor de fooi', 'Verstuurd als je bij de kassa een fooi vastlegt.'],
      wJoin: ['Aangemeld voor de wachtlijst', 'Bevestigt klanten dat ze op je wachtlijst staan.'],
      wSlot: ['Er is een plek vrij', 'Laat wachtende klanten weten dat er een tijd vrijkomt.'],
      points: ['Puntenoverzicht', 'Stuurt klanten een overzicht van hun gespaarde punten.'],
      tier: ['Nieuw loyaliteitsniveau', 'Laat klanten weten dat ze een nieuw niveau hebben bereikt.'],
      referral: ['Beloning voor doorverwijzen', 'Laat klanten weten dat een doorverwezen vriend heeft geboekt.'],
    },
    reviewHint: 'Voeg je Google-reviewlink toe', reviewSet: 'Google-reviewlink toegevoegd',
    history: 'Berichtengeschiedenis', historySub: 'E-mails die Snippr naar je klanten heeft gestuurd.', historyEmpty: 'Nog geen berichten verstuurd', historyEmptySub: 'Als er een automatische e-mail uitgaat, verschijnt die hier.', kinds: { remind1d: 'Herinnering (1 dag vooraf)', remind3d: 'Herinnering (3 dagen vooraf)', new: 'Nieuwe afspraak', confirmed: 'Afspraak bevestigd', rescheduled: 'Afspraak verplaatst', cancelled: 'Afspraak geannuleerd', thanks: 'Bedankt voor je bezoek', tip: 'Bedankt voor de fooi' } as Record<string, string>, upgrade: 'Overstappen naar Pro', settingsTitle: 'Berichtinstellingen', apptOn: 'Afspraak',
  },
  de: {
    back: 'Add-ons', title: 'Automatische Nachrichten', sub: 'E-Mails, die von selbst an deine Kunden gehen, damit du nicht jedem schreiben musst.',
    on: 'An', off: 'Aus', soon: 'Bald', always: 'Immer an', preview: 'Vorschau', close: 'Schließen', subject: 'Betreff',
    setup: 'Führe supabase/messages.sql einmal im Supabase SQL Editor aus, um diese Schalter zu speichern.',
    noEmail: 'E-Mails gehen nur an Kunden, die beim Buchen eine E-Mail-Adresse angegeben haben.',
    sections: { reminders: 'Erinnerungen', updates: 'Termin-Updates', waitlist: 'Warteliste', loyalty: 'Kundenbindung' },
    cards: {
      r3d: ['3 Tage vorher', 'Erinnert Kunden 3 Tage vorher an ihren Termin (jeden Morgen verschickt).'],
      r24: ['Am Vortag', 'Erinnert Kunden am Vortag an ihren Termin (jeden Morgen verschickt).'],
      r1h: ['1 Stunde vorher', 'Eine letzte Erinnerung eine Stunde vorher.'],
      newBooking: ['Neuer Termin', 'Kunden bekommen eine Buchungsbestätigung, du eine Benachrichtigung.'],
      confirmed: ['Termin bestätigt', 'Wird verschickt, wenn du eine Buchung bestätigst.'],
      rescheduled: ['Termin verschoben', 'Wird verschickt, wenn du eine Buchung im Kalender auf eine andere Zeit verschiebst.'],
      cancelled: ['Termin storniert', 'Wird verschickt, wenn du eine Buchung stornierst, mit einem Link für eine neue Zeit.'],
      thanks: ['Danke für deinen Besuch', 'Wird verschickt, wenn ein Termin abgeschlossen ist, mit deinem Google-Bewertungslink, falls hinterlegt.'],
      tip: ['Danke für das Trinkgeld', 'Wird verschickt, wenn du an der Kasse Trinkgeld erfasst.'],
      wJoin: ['Auf der Warteliste', 'Bestätigt Kunden, dass sie auf deiner Warteliste stehen.'],
      wSlot: ['Ein Platz ist frei', 'Sagt wartenden Kunden Bescheid, wenn eine Zeit frei wird.'],
      points: ['Punkteübersicht', 'Schickt Kunden eine Übersicht ihrer gesammelten Punkte.'],
      tier: ['Neue Treuestufe', 'Sagt Kunden Bescheid, wenn sie eine neue Stufe erreichen.'],
      referral: ['Empfehlungsprämie', 'Sagt Kunden Bescheid, wenn ein empfohlener Freund bucht.'],
    },
    reviewHint: 'Google-Bewertungslink hinzufügen', reviewSet: 'Google-Bewertungslink hinzugefügt',
    history: 'Nachrichtenverlauf', historySub: 'E-Mails, die Snippr an deine Kunden geschickt hat.', historyEmpty: 'Noch keine Nachrichten verschickt', historyEmptySub: 'Wenn eine automatische E-Mail rausgeht, erscheint sie hier.', kinds: { remind1d: 'Erinnerung (1 Tag vorher)', remind3d: 'Erinnerung (3 Tage vorher)', new: 'Neuer Termin', confirmed: 'Termin bestätigt', rescheduled: 'Termin verschoben', cancelled: 'Termin storniert', thanks: 'Danke für deinen Besuch', tip: 'Danke für das Trinkgeld' } as Record<string, string>, upgrade: 'Zu Pro wechseln', settingsTitle: 'Nachrichteneinstellungen', apptOn: 'Termin',
  },
  ar: {
    back: 'الإضافات', title: 'الرسائل التلقائية', sub: 'رسائل بريد تصل لعملائك تلقائيًا، فلا تحتاج لمراسلة كل واحد.',
    on: 'مفعّل', off: 'متوقف', soon: 'قريبًا', always: 'مفعّل دائمًا', preview: 'معاينة', close: 'إغلاق', subject: 'الموضوع',
    setup: 'شغّل supabase/messages.sql مرة واحدة في محرر SQL في Supabase لحفظ هذه الإعدادات.',
    noEmail: 'تُرسل الرسائل فقط للعملاء الذين تركوا بريدهم عند الحجز.',
    sections: { reminders: 'التذكيرات', updates: 'تحديثات المواعيد', waitlist: 'قائمة الانتظار', loyalty: 'ولاء العملاء' },
    cards: {
      r3d: ['قبل 3 أيام', 'يذكّر العملاء بموعدهم قبل 3 أيام (يُرسل كل صباح).'],
      r24: ['قبل يوم', 'يذكّر العملاء بموعدهم في اليوم السابق (يُرسل كل صباح).'],
      r1h: ['قبل ساعة', 'تذكير أخير قبل ساعة.'],
      newBooking: ['موعد جديد', 'يحصل العملاء على تأكيد الحجز ويصلك إشعار.'],
      confirmed: ['تأكيد الموعد', 'يُرسل عندما تؤكد حجزًا.'],
      rescheduled: ['نقل الموعد', 'يُرسل عندما تنقل حجزًا إلى وقت آخر في تقويمك.'],
      cancelled: ['إلغاء الموعد', 'يُرسل عندما تلغي حجزًا، مع رابط لاختيار وقت جديد.'],
      thanks: ['شكرًا لزيارتك', 'يُرسل عند اكتمال الموعد، مع رابط تقييم Google إن أضفته.'],
      tip: ['شكرًا على الإكرامية', 'يُرسل عندما تسجل إكرامية في الصندوق.'],
      wJoin: ['الانضمام لقائمة الانتظار', 'يؤكد للعملاء أنهم في قائمة انتظارك.'],
      wSlot: ['توفر مكان', 'يخبر العملاء المنتظرين عندما يصبح وقت متاحًا.'],
      points: ['ملخص النقاط', 'يرسل للعملاء ملخص النقاط التي جمعوها.'],
      tier: ['مستوى ولاء جديد', 'يخبر العملاء عند وصولهم لمستوى جديد.'],
      referral: ['مكافأة الإحالة', 'يخبر العملاء عندما يحجز صديق أحالوه.'],
    },
    reviewHint: 'أضف رابط تقييم Google', reviewSet: 'تمت إضافة رابط تقييم Google',
    history: 'سجل الرسائل', historySub: 'الرسائل التي أرسلها Snippr لعملائك.', historyEmpty: 'لم تُرسل رسائل بعد', historyEmptySub: 'عند إرسال رسالة تلقائية تظهر هنا.', kinds: { remind1d: 'تذكير (قبل يوم)', remind3d: 'تذكير (قبل 3 أيام)', new: 'موعد جديد', confirmed: 'تأكيد الموعد', rescheduled: 'نقل الموعد', cancelled: 'إلغاء الموعد', thanks: 'شكرًا لزيارتك', tip: 'شكرًا على الإكرامية' } as Record<string, string>, upgrade: 'انتقل إلى Pro', settingsTitle: 'إعدادات الرسائل', apptOn: 'الموعد',
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
  const lng = toSiteLng(lang)
  const locale = SITE_LOCALE[lng]
  const t = COPY[lng]

  const [barber, setBarber] = useState<{ id: string; name: string; slug: string } | null>(null)
  const [settings, setSettings] = useState<MsgSettings>({})
  const [review, setReview] = useState<string | null>(null)
  const [ready, setReady] = useState(true)
  const [preview, setPreview] = useState<MsgKind | null>(null)
  const [history, setHistory] = useState<{ id: string; kind: string; client: string; email: string; date: string }[]>([])
  // the account's plan: some emails are Pro only (lib/messages.ts → PRO_ONLY_KINDS)
  const [plan, setPlan] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    ;(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      if (active) setPlan(typeof user.user_metadata?.plan === 'string' ? user.user_metadata.plan : null)
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
    if (!barber || !ready || !planAllows(plan, k)) return
    const next = { ...settings, [k]: !isOn(settings, k) }
    setSettings(next)
    const { error } = await supabase.from('barbers').update({ message_settings: next }).eq('id', barber.id)
    if (error) setSettings(settings)
  }

  const C = t.cards
  const sections: { title: string; cards: Card[] }[] = [
    { title: t.sections.reminders, cards: [
      { id: 'r3d', icon: Bell, title: C.r3d[0], desc: C.r3d[1], channels: ['email'], kind: 'remind3d' },
      { id: 'r24', icon: Bell, title: C.r24[0], desc: C.r24[1], channels: ['email'], kind: 'remind1d' },
      { id: 'r1h', icon: Bell, title: C.r1h[0], desc: C.r1h[1], channels: ['email'], soon: true },
    ] },
    { title: t.sections.updates, cards: [
      { id: 'newBooking', icon: CalendarPlus, title: C.newBooking[0], desc: C.newBooking[1], channels: ['email', 'push'], always: true },
      { id: 'confirmed', icon: CalendarCheck, title: C.confirmed[0], desc: C.confirmed[1], channels: ['email'], kind: 'confirmed' },
      { id: 'rescheduled', icon: CalendarClock, title: C.rescheduled[0], desc: C.rescheduled[1], channels: ['email'], kind: 'rescheduled' },
      { id: 'cancelled', icon: CalendarX, title: C.cancelled[0], desc: C.cancelled[1], channels: ['email'], kind: 'cancelled' },
      { id: 'thanks', icon: ThumbsUp, title: C.thanks[0], desc: C.thanks[1], channels: ['email'], kind: 'thanks' },
      { id: 'tip', icon: Heart, title: C.tip[0], desc: C.tip[1], channels: ['email'], kind: 'tip' },
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
    date: new Date(2026, 10, 14).toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' }), time: '14:30',
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

      {sections
        // messages that aren't built yet stay hidden (lib/legal.ts → SHOW_UNRELEASED)
        .map(sec => ({ ...sec, cards: sec.cards.filter(c => SHOW_UNRELEASED || !c.soon) }))
        .filter(sec => sec.cards.length)
        .map(sec => (
        <section key={sec.title} className="mt-9">
          <h2 className="mb-3 text-[19px] font-bold text-[#37352f]">{sec.title}</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sec.cards.map(c => {
              const locked = c.kind ? !planAllows(plan, c.kind) : false
              const on = !locked && (c.always || (c.kind ? isOn(settings, c.kind) : false))
              return (
                <motion.div key={c.id} whileHover={{ y: -2 }} className="flex flex-col rounded-[20px] border border-[#ededec] bg-white p-5" style={{ opacity: c.soon ? 0.62 : 1 }}>
                  <div className="flex items-start justify-between gap-3">
                    <c.icon size={22} strokeWidth={1.8} style={{ color: c.soon ? '#9b9a97' : 'var(--accent)' }} />
                    {c.kind && <Switch on={on} onChange={() => toggle(c.kind!)} disabled={!ready || locked} />}
                  </div>
                  <h3 className="mt-4 flex items-center gap-2 text-[15.5px] font-semibold text-[#37352f]">
                    {c.title}
                    {c.kind && PRO_ONLY_KINDS.includes(c.kind) && <span className="rounded-md bg-[#1d1d1f] px-1.5 py-0.5 text-[10.5px] font-bold tracking-wide text-white">PRO</span>}
                  </h3>
                  <p className="mt-1 flex-1 text-[13.5px] leading-relaxed text-[#787774]">{c.desc}</p>
                  {c.kind === 'thanks' && ready && (
                    <Link href="/dashboard/addons?google=1" className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold" style={{ color: review ? '#1c6b3f' : 'var(--accent)' }}>
                      <Star size={13} /> {review ? t.reviewSet : t.reviewHint}
                    </Link>
                  )}
                  <div className="mt-4 flex items-center justify-between gap-2">
                    {locked ? (
                      <Link href="/dashboard/plans" className="rounded-full bg-[#1d1d1f] px-2.5 py-1 text-[12px] font-semibold text-white hover:bg-black">{t.upgrade}</Link>
                    ) : (
                    <span className="rounded-full px-2.5 py-1 text-[12px] font-semibold"
                      style={c.soon ? { background: '#f1f1ef', color: '#9b9a97' } : on ? { background: '#e9f6ec', color: '#1c6b3f' } : { background: '#f1f1ef', color: '#787774' }}>
                      {c.soon ? t.soon : c.always ? t.always : on ? t.on : t.off}
                    </span>
                    )}
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
              <p className="text-right text-[12.5px] whitespace-nowrap text-[#9b9a97]">{t.apptOn}<br />{new Date(h.date).toLocaleDateString(locale, { day: 'numeric', month: 'short' })}</p>
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
