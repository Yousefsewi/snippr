import { emailLayout, type DetailRow } from './email-layout'
// Client emails: what they say (Turkish, Dutch, English, Arabic) and whether they are on.
// Used by the server (app/api/notify-booking, notify-status, cron/reminders) and by the
// dashboard preview, so what the barber previews is exactly what clients get.

export type MsgKind = 'confirmed' | 'cancelled' | 'thanks' | 'tip' | 'remind1d' | 'remind3d' | 'rescheduled'
// sent right after the barber changes an appointment (app/api/notify-status)
export const STATUS_KINDS: MsgKind[] = ['confirmed', 'cancelled', 'thanks', 'tip', 'rescheduled']
// sent by the daily reminder job (app/api/cron/reminders)
export const REMINDER_KINDS: MsgKind[] = ['remind1d', 'remind3d']
export const MSG_DEFAULTS: Record<MsgKind, boolean> = { confirmed: true, cancelled: true, thanks: true, tip: false, remind1d: true, remind3d: false, rescheduled: true }

export type MsgSettings = Partial<Record<MsgKind, boolean>>
export const isOn = (s: MsgSettings | null | undefined, k: MsgKind) => s?.[k] ?? MSG_DEFAULTS[k]

export type ClientLang = 'tr' | 'nl' | 'en' | 'ar' | 'de'
export const CLIENT_LANGS: ClientLang[] = ['tr', 'nl', 'en', 'ar', 'de']
export const normLang = (v: unknown, fallback: ClientLang = 'en'): ClientLang =>
  CLIENT_LANGS.includes(v as ClientLang) ? (v as ClientLang) : fallback
export const LOCALE: Record<ClientLang, string> = { tr: 'tr-TR', nl: 'nl-NL', en: 'en-GB', ar: 'ar-u-nu-latn', de: 'de-DE' }

export interface MsgData {
  client: string; barber: string; service?: string | null; date: string; time: string
  bookUrl: string; reviewUrl?: string | null; tip?: string | null
  /** rescheduled: the old date · time */
  previous?: string | null
  /** link to stop these emails (thank-you, tip, reminders) */
  unsubscribeUrl?: string | null
  /** link where the client can cancel the appointment (lib/manage-link.ts) */
  manageUrl?: string | null
}

const MANAGE: Record<ClientLang, { text: string; label: string }> = {
  tr: { text: 'Gelemeyecek misin?', label: 'Randevumu iptal et' },
  nl: { text: 'Kun je niet komen?', label: 'Afspraak annuleren' },
  en: { text: 'Can’t make it?', label: 'Cancel my appointment' },
  ar: { text: 'لا تستطيع الحضور؟', label: 'إلغاء موعدي' },
  de: { text: 'Du kannst nicht kommen?', label: 'Termin absagen' },
}
const UPCOMING_KINDS: MsgKind[] = ['confirmed', 'remind1d', 'remind3d', 'rescheduled']
const manageLine = (lang: ClientLang, url?: string | null) => url ? { ...MANAGE[lang], url } : undefined

const first = (n: string) => n.trim().split(/\s+/)[0] || n

type Built = { subject: string; heading: string; text: string; button: { label: string; url: string } }

export function buildMessage(kind: MsgKind, lang: ClientLang, d: MsgData): Built {
  const c = first(d.client), b = d.barber
  const when = `${d.date} · ${d.time}`
  const svc = d.service ? `${d.service}, ` : ''
  const page = { tr: 'Randevu sayfası', nl: 'Afsprakenpagina', en: 'Booking page', de: 'Buchungsseite', ar: 'صفحة الحجز' }[lang]
  const again = { tr: 'Tekrar randevu al', nl: 'Opnieuw boeken', en: 'Book again', de: 'Erneut buchen', ar: 'احجز مجددًا' }[lang]

  switch (kind) {
    case 'confirmed': return {
      subject: { tr: `${b} randevunu onayladı ✅`, nl: `${b} heeft je afspraak bevestigd ✅`, en: `${b} confirmed your appointment ✅`, de: `${b} hat deinen Termin bestätigt ✅`, ar: `أكّد ${b} موعدك ✅` }[lang],
      heading: { tr: `Görüşmek üzere, ${c}!`, nl: `Tot snel, ${c}!`, en: `See you soon, ${c}!`, de: `Bis bald, ${c}!`, ar: `نراك قريبًا يا ${c}!` }[lang],
      text: { tr: `${svc}${when} randevun onaylandı.`, nl: `Je afspraak (${svc}${when}) is bevestigd.`, en: `Your appointment (${svc}${when}) is confirmed.`, de: `Dein Termin (${svc}${when}) ist bestätigt.`, ar: `تم تأكيد موعدك (${svc}${when}).` }[lang],
      button: { label: page, url: d.bookUrl },
    }
    case 'cancelled': return {
      subject: { tr: `${b} randevunu iptal etti`, nl: `${b} heeft je afspraak geannuleerd`, en: `${b} cancelled your appointment`, de: `${b} hat deinen Termin storniert`, ar: `ألغى ${b} موعدك` }[lang],
      heading: { tr: 'Randevun iptal edildi', nl: 'Je afspraak is geannuleerd', en: 'Your appointment was cancelled', de: 'Dein Termin wurde storniert', ar: 'تم إلغاء موعدك' }[lang],
      text: {
        tr: `${svc}${when} randevun iptal edildi. İstersen yeni bir saat seçebilirsin.`,
        nl: `Je afspraak (${svc}${when}) is geannuleerd. Je kunt altijd een nieuwe tijd kiezen.`,
        en: `Your appointment (${svc}${when}) was cancelled. You can pick a new time whenever you like.`, de: `Dein Termin (${svc}${when}) wurde storniert. Du kannst jederzeit eine neue Zeit wählen.`,
        ar: `تم إلغاء موعدك (${svc}${when}). يمكنك اختيار وقت جديد متى شئت.`,
      }[lang],
      button: { label: { tr: 'Yeni saat seç', nl: 'Kies een nieuwe tijd', en: 'Book a new time', de: 'Neue Zeit wählen', ar: 'اختر وقتًا جديدًا' }[lang], url: d.bookUrl },
    }
    case 'thanks': return {
      subject: { tr: `Geldiğin için teşekkürler, ${c} ✂️`, nl: `Bedankt voor je bezoek, ${c} ✂️`, en: `Thanks for your visit, ${c} ✂️`, de: `Danke für deinen Besuch, ${c} ✂️`, ar: `شكرًا لزيارتك يا ${c} ✂️` }[lang],
      heading: { tr: 'Bugün için teşekkürler!', nl: 'Bedankt voor vandaag!', en: 'Thanks for coming in!', de: 'Danke, dass du da warst!', ar: 'شكرًا لك على زيارة اليوم!' }[lang],
      text: d.reviewUrl
        ? {
          tr: `Umarız yeni görünümünü sevmişsindir. Bir dakikanı ayırıp ${b} için Google’da yorum bırakır mısın? Çok yardımcı olur.`,
          nl: `We hopen dat je blij bent met je nieuwe look. Wil je even een Google-review voor ${b} achterlaten? Dat helpt enorm.`,
          en: `We hope you love your new look. Could you spare a minute to leave ${b} a Google review? It really helps.`, de: `Wir hoffen, dir gefällt dein neuer Look. Hast du eine Minute für eine Google-Bewertung für ${b}? Das hilft sehr.`,
          ar: `نتمنى أن تكون مظهرك الجديد قد أعجبك. هل يمكنك تخصيص دقيقة لكتابة تقييم لـ ${b} على Google؟ سيساعد ذلك كثيرًا.`,
        }[lang]
        : {
          tr: 'Umarız yeni görünümünü sevmişsindir. Bir sonraki randevunu istediğin zaman alabilirsin.',
          nl: 'We hopen dat je blij bent met je nieuwe look. Boek je volgende bezoek wanneer het jou uitkomt.',
          en: 'We hope you love your new look. Book your next visit whenever you’re ready.', de: 'Wir hoffen, dir gefällt dein neuer Look. Buch deinen nächsten Besuch, wann immer du willst.',
          ar: 'نتمنى أن يكون مظهرك الجديد قد أعجبك. احجز زيارتك القادمة متى شئت.',
        }[lang],
      button: d.reviewUrl
        ? { label: { tr: 'Google’da yorum yaz', nl: 'Schrijf een Google-review', en: 'Leave a Google review', de: 'Google-Bewertung schreiben', ar: 'اكتب تقييمًا على Google' }[lang], url: d.reviewUrl }
        : { label: again, url: d.bookUrl },
    }
    case 'remind1d':
    case 'remind3d': {
      const tomorrow = kind === 'remind1d'
      return {
        subject: tomorrow
          ? { tr: `Yarın randevun var: ${b} ⏰`, nl: `Herinnering: morgen je afspraak bij ${b} ⏰`, en: `Reminder: your appointment with ${b} is tomorrow ⏰`, de: `Erinnerung: Morgen hast du deinen Termin bei ${b} ⏰`, ar: `تذكير: موعدك مع ${b} غدًا ⏰` }[lang]
          : { tr: `3 gün sonra randevun var: ${b}`, nl: `Herinnering: over 3 dagen je afspraak bij ${b}`, en: `Reminder: your appointment with ${b} is in 3 days`, de: `Erinnerung: In 3 Tagen hast du deinen Termin bei ${b}`, ar: `تذكير: موعدك مع ${b} بعد 3 أيام` }[lang],
        heading: { tr: `Unutma, ${c}!`, nl: `Even een herinnering, ${c}!`, en: `Just a reminder, ${c}!`, de: `Nur zur Erinnerung, ${c}!`, ar: `تذكير بسيط يا ${c}!` }[lang],
        text: {
          tr: `${svc}${when} randevun var. Gelemeyeceksen lütfen ${b}’e haber ver, böylece başkası o saati alabilir.`,
          nl: `Je hebt een afspraak (${svc}${when}). Kun je niet komen? Laat het ${b} dan even weten, zodat iemand anders die tijd kan krijgen.`,
          en: `You have an appointment (${svc}${when}). If you can’t make it, please let ${b} know so someone else can take the slot.`, de: `Du hast einen Termin (${svc}${when}). Wenn du nicht kommen kannst, sag ${b} bitte Bescheid, damit jemand anderes die Zeit bekommt.`,
          ar: `لديك موعد (${svc}${when}). إذا لم تتمكن من الحضور، يرجى إبلاغ ${b} ليتمكن شخص آخر من أخذ هذا الموعد.`,
        }[lang],
        button: { label: page, url: d.bookUrl },
      }
    }
    case 'rescheduled': {
      const was = d.previous ? { tr: ` (önceki: ${d.previous})`, nl: ` (was: ${d.previous})`, en: ` (was ${d.previous})`, de: ` (vorher ${d.previous})`, ar: ` (كان: ${d.previous})` }[lang] : ''
      return {
        subject: { tr: `Randevunun saati değişti: ${b}`, nl: `Je afspraak bij ${b} is verplaatst`, en: `Your appointment with ${b} has moved`, de: `Dein Termin bei ${b} wurde verschoben`, ar: `تم تغيير موعدك مع ${b}` }[lang],
        heading: { tr: `Yeni saatin, ${c}`, nl: `Je nieuwe tijd, ${c}`, en: `Your new time, ${c}`, de: `Deine neue Zeit, ${c}`, ar: `موعدك الجديد يا ${c}` }[lang],
        text: {
          tr: `${b} randevunu taşıdı. Yeni randevun: ${svc}${when}${was}. Bu saat uymuyorsa lütfen ${b}’e haber ver.`,
          nl: `${b} heeft je afspraak verplaatst. Nieuwe afspraak: ${svc}${when}${was}. Past dit niet? Laat het ${b} even weten.`,
          en: `${b} moved your appointment. New time: ${svc}${when}${was}. If this doesn’t work for you, please let ${b} know.`, de: `${b} hat deinen Termin verschoben. Neue Zeit: ${svc}${when}${was}. Wenn das nicht passt, sag ${b} bitte Bescheid.`,
          ar: `قام ${b} بتغيير موعدك. الموعد الجديد: ${svc}${when}${was}. إذا لم يناسبك هذا الوقت، يرجى إبلاغ ${b}.`,
        }[lang],
        button: { label: page, url: d.bookUrl },
      }
    }
    case 'tip': return {
      subject: { tr: 'Bahşişin için teşekkürler 💛', nl: 'Bedankt voor je fooi 💛', en: 'Thank you for the tip 💛', de: 'Danke für das Trinkgeld 💛', ar: 'شكرًا على الإكرامية 💛' }[lang],
      heading: { tr: `Çok naziksin, ${c}!`, nl: `Wat lief van je, ${c}!`, en: `That was kind of you, ${c}!`, de: `Das war sehr nett von dir, ${c}!`, ar: `هذا لطف منك يا ${c}!` }[lang],
      text: {
        tr: `${d.tip ? `${d.tip} bahşişin` : 'Bahşişin'} için ${b} sana teşekkür ediyor. Bir dahaki sefere görüşmek üzere!`,
        nl: `${b} bedankt je voor je fooi${d.tip ? ` van ${d.tip}` : ''}. Tot de volgende keer!`,
        en: `${b} says thank you for your ${d.tip ? `${d.tip} ` : ''}tip. See you next time!`,
        de: `${b} bedankt sich für dein Trinkgeld${d.tip ? ` von ${d.tip}` : ''}. Bis zum nächsten Mal!`,
        ar: `يشكرك ${b} على الإكرامية${d.tip ? ` (${d.tip})` : ''}. نراك في المرة القادمة!`,
      }[lang],
      button: { label: again, url: d.bookUrl },
    }
  }
}

const FOOT: Record<ClientLang, (b: string) => string> = {
  tr: b => `${b} adına Snippr ile gönderildi.`,
  nl: b => `Verstuurd via Snippr namens ${b}.`,
  en: b => `Sent with Snippr on behalf of ${b}.`,
  ar: b => `أُرسلت عبر Snippr نيابةً عن ${b}.`,
  de: b => `Gesendet mit Snippr im Auftrag von ${b}.`,
}

const STOP: Record<ClientLang, string> = { tr: 'Bu e-postaları almak istemiyorum', nl: 'Ik wil deze e-mails niet meer ontvangen', en: 'I don’t want these emails', de: 'Ich möchte diese E-Mails nicht mehr', ar: 'لا أريد تلقي هذه الرسائل' }

const LABELS: Record<ClientLang, { service: string; date: string; time: string; was: string; now: string; total: string; discount: string }> = {
  tr: { service: 'Hizmet', date: 'Tarih', time: 'Saat', was: 'Eski saat', now: 'Yeni saat', total: 'Tutar', discount: 'İlk ziyaret indirimi' },
  nl: { service: 'Dienst', date: 'Datum', time: 'Tijd', was: 'Oude tijd', now: 'Nieuwe tijd', total: 'Bedrag', discount: 'Korting eerste bezoek' },
  en: { service: 'Service', date: 'Date', time: 'Time', was: 'Old time', now: 'New time', total: 'Amount', discount: 'First-visit discount' },
  ar: { service: 'الخدمة', date: 'التاريخ', time: 'الوقت', was: 'الموعد السابق', now: 'الموعد الجديد', total: 'المبلغ', discount: 'خصم الزيارة الأولى' },
  de: { service: 'Leistung', date: 'Datum', time: 'Uhrzeit', was: 'Alte Zeit', now: 'Neue Zeit', total: 'Betrag', discount: 'Rabatt beim ersten Besuch' },
}

const footer = (lang: ClientLang, barber: string) => [FOOT[lang](barber), 'snipprcalendar.com']

/** the date/time box shown in booking-related emails */
function bookingDetails(kind: MsgKind, lang: ClientLang, d: MsgData): DetailRow[] | undefined {
  const L = LABELS[lang]
  if (kind === 'thanks' || kind === 'tip') return undefined
  const rows: DetailRow[] = []
  if (d.service) rows.push({ label: L.service, value: d.service })
  if (kind === 'rescheduled') {
    rows.push({ label: L.now, value: `${d.date} · ${d.time}` })
    if (d.previous) rows.push({ label: L.was, value: d.previous, tone: 'strike', strong: false })
  } else {
    rows.push({ label: L.date, value: d.date }, { label: L.time, value: d.time, tone: kind === 'cancelled' ? 'strike' : undefined })
  }
  return rows
}

// shorter text for emails that show date and time in the details box (no repeating)
function boxedText(kind: MsgKind, lang: ClientLang, b: string): string | null {
  switch (kind) {
    case 'confirmed': return {
      tr: `${b} randevunu onayladı. Seni bekliyoruz.`,
      nl: `${b} heeft je afspraak bevestigd. Tot dan!`,
      en: `${b} confirmed your appointment. See you then!`, de: `${b} hat deinen Termin bestätigt. Bis dann!`,
      ar: `أكّد ${b} موعدك. نراك قريبًا!`,
    }[lang]
    case 'cancelled': return {
      tr: `${b} bu randevuyu iptal etti. İstediğin zaman yeni bir saat seçebilirsin.`,
      nl: `${b} heeft deze afspraak geannuleerd. Je kunt altijd een nieuwe tijd kiezen.`,
      en: `${b} cancelled this appointment. You can pick a new time whenever you like.`, de: `${b} hat diesen Termin storniert. Du kannst jederzeit eine neue Zeit wählen.`,
      ar: `ألغى ${b} هذا الموعد. يمكنك اختيار وقت جديد متى شئت.`,
    }[lang]
    case 'remind1d': case 'remind3d': return {
      tr: `Gelemeyeceksen lütfen ${b}’e haber ver, böylece başkası o saati alabilir.`,
      nl: `Kun je niet komen? Laat het ${b} even weten, zodat iemand anders die tijd kan krijgen.`,
      en: `If you can’t make it, please let ${b} know so someone else can take the slot.`, de: `Wenn du nicht kommen kannst, sag ${b} bitte Bescheid, damit jemand anderes die Zeit bekommt.`,
      ar: `إذا لم تتمكن من الحضور، يرجى إبلاغ ${b} ليتمكن شخص آخر من أخذ الموعد.`,
    }[lang]
    case 'rescheduled': return {
      tr: `${b} randevunu yeni bir saate taşıdı. Bu saat uymuyorsa lütfen haber ver.`,
      nl: `${b} heeft je afspraak naar een nieuwe tijd verplaatst. Past dit niet? Laat het even weten.`,
      en: `${b} moved your appointment to a new time. If it doesn’t work for you, please let them know.`, de: `${b} hat deinen Termin auf eine neue Zeit verschoben. Wenn sie nicht passt, sag bitte Bescheid.`,
      ar: `نقل ${b} موعدك إلى وقت جديد. إذا لم يناسبك، يرجى إبلاغه.`,
    }[lang]
    default: return null
  }
}

export function messageHtml(kind: MsgKind, lang: ClientLang, d: MsgData) {
  const m = buildMessage(kind, lang, d)
  const text = boxedText(kind, lang, d.barber) ?? m.text
  return {
    subject: m.subject,
    html: emailLayout({
      lang, preheader: kind === 'thanks' || kind === 'tip' ? m.text : `${d.date} · ${d.time}`, shop: d.barber,
      heading: m.heading, text,
      details: bookingDetails(kind, lang, d),
      button: m.button,
      footer: footer(lang, d.barber),
      unsubscribe: d.unsubscribeUrl ? { url: d.unsubscribeUrl, label: STOP[lang] } : undefined,
      manage: UPCOMING_KINDS.includes(kind) ? manageLine(lang, d.manageUrl) : undefined,
    }),
  }
}

/** "Your booking request was received" email, sent right after a client books. */
export function bookingReceivedHtml(lang: ClientLang, d: { client: string; barber: string; service?: string | null; date: string; time: string; discount?: string | null; bookUrl?: string | null; manageUrl?: string | null }) {
  const c = first(d.client)
  const L = {
    tr: { subject: `${d.barber} ile randevun alındı`, hi: `Randevun alındı, ${c}!`, intro: `${d.barber} randevunu aldı. Bilgiler aşağıda.`, note: 'Gelemeyeceksen lütfen berberine haber ver, böylece başkası o saati alabilir.', page: 'Randevu sayfası' },
    nl: { subject: `Je afspraak bij ${d.barber} is geboekt`, hi: `Je bent geboekt, ${c}!`, intro: `${d.barber} heeft je afspraak ontvangen. Hieronder de gegevens.`, note: 'Kun je niet komen? Laat het je kapper even weten, dan kan iemand anders die tijd krijgen.', page: 'Afsprakenpagina' },
    en: { subject: `Your appointment with ${d.barber} is booked`, hi: `You're booked, ${c}!`, intro: `${d.barber} has your appointment. Here are the details.`, note: 'Can’t make it? Please let your barber know, so someone else can take the slot.', page: 'Booking page' },
    ar: { subject: `تم حجز موعدك مع ${d.barber}`, hi: `تم حجز موعدك يا ${c}!`, intro: `استلم ${d.barber} موعدك. التفاصيل أدناه.`, note: 'إذا لم تتمكن من الحضور، يرجى إبلاغ الحلاق ليتمكن شخص آخر من أخذ الموعد.', page: 'صفحة الحجز' },
    de: { subject: `Dein Termin bei ${d.barber} ist gebucht`, hi: `Du bist gebucht, ${c}!`, intro: `${d.barber} hat deinen Termin. Hier sind die Details.`, note: 'Du kannst nicht kommen? Sag deinem Barbier bitte Bescheid, damit jemand anderes die Zeit bekommt.', page: 'Buchungsseite' },
  }[lang]
  const D = LABELS[lang]
  const rows: DetailRow[] = []
  if (d.service) rows.push({ label: D.service, value: d.service })
  rows.push({ label: D.date, value: d.date }, { label: D.time, value: d.time })
  if (d.discount) rows.push({ label: D.discount, value: d.discount, tone: 'pink' })
  return {
    subject: L.subject,
    html: emailLayout({
      lang, preheader: `${d.date} · ${d.time}`, shop: d.barber,
      heading: L.hi, text: L.intro, details: rows,
      button: d.bookUrl ? { label: L.page, url: d.bookUrl } : undefined,
      manage: manageLine(lang, d.manageUrl),
      note: d.manageUrl ? undefined : L.note,
      footer: footer(lang, d.barber),
    }),
  }
}
