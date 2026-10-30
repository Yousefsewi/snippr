// Client emails: what they say (Turkish, Dutch, English, Arabic) and whether they are on.
// Used by the server (app/api/notify-booking, notify-status, cron/reminders) and by the
// dashboard preview, so what the barber previews is exactly what clients get.

export type MsgKind = 'confirmed' | 'cancelled' | 'thanks' | 'tip' | 'remind1d' | 'remind3d'
// sent right after the barber changes an appointment (app/api/notify-status)
export const STATUS_KINDS: MsgKind[] = ['confirmed', 'cancelled', 'thanks', 'tip']
// sent by the daily reminder job (app/api/cron/reminders)
export const REMINDER_KINDS: MsgKind[] = ['remind1d', 'remind3d']
export const MSG_DEFAULTS: Record<MsgKind, boolean> = { confirmed: true, cancelled: true, thanks: true, tip: false, remind1d: true, remind3d: false }

export type MsgSettings = Partial<Record<MsgKind, boolean>>
export const isOn = (s: MsgSettings | null | undefined, k: MsgKind) => s?.[k] ?? MSG_DEFAULTS[k]

export type ClientLang = 'tr' | 'nl' | 'en' | 'ar'
export const CLIENT_LANGS: ClientLang[] = ['tr', 'nl', 'en', 'ar']
export const normLang = (v: unknown, fallback: ClientLang = 'en'): ClientLang =>
  CLIENT_LANGS.includes(v as ClientLang) ? (v as ClientLang) : fallback
export const LOCALE: Record<ClientLang, string> = { tr: 'tr-TR', nl: 'nl-NL', en: 'en-GB', ar: 'ar-u-nu-latn' }

export interface MsgData {
  client: string; barber: string; service?: string | null; date: string; time: string
  bookUrl: string; reviewUrl?: string | null; tip?: string | null
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const first = (n: string) => n.trim().split(/\s+/)[0] || n

type Built = { subject: string; heading: string; text: string; button: { label: string; url: string } }

export function buildMessage(kind: MsgKind, lang: ClientLang, d: MsgData): Built {
  const c = first(d.client), b = d.barber
  const when = `${d.date} · ${d.time}`
  const svc = d.service ? `${d.service}, ` : ''
  const page = { tr: 'Randevu sayfası', nl: 'Afsprakenpagina', en: 'Booking page', ar: 'صفحة الحجز' }[lang]
  const again = { tr: 'Tekrar randevu al', nl: 'Opnieuw boeken', en: 'Book again', ar: 'احجز مجددًا' }[lang]

  switch (kind) {
    case 'confirmed': return {
      subject: { tr: `${b} randevunu onayladı ✅`, nl: `${b} heeft je afspraak bevestigd ✅`, en: `${b} confirmed your appointment ✅`, ar: `أكّد ${b} موعدك ✅` }[lang],
      heading: { tr: `Görüşmek üzere, ${c}!`, nl: `Tot snel, ${c}!`, en: `See you soon, ${c}!`, ar: `نراك قريبًا يا ${c}!` }[lang],
      text: { tr: `${svc}${when} randevun onaylandı.`, nl: `Je afspraak (${svc}${when}) is bevestigd.`, en: `Your appointment (${svc}${when}) is confirmed.`, ar: `تم تأكيد موعدك (${svc}${when}).` }[lang],
      button: { label: page, url: d.bookUrl },
    }
    case 'cancelled': return {
      subject: { tr: `${b} randevunu iptal etti`, nl: `${b} heeft je afspraak geannuleerd`, en: `${b} cancelled your appointment`, ar: `ألغى ${b} موعدك` }[lang],
      heading: { tr: 'Randevun iptal edildi', nl: 'Je afspraak is geannuleerd', en: 'Your appointment was cancelled', ar: 'تم إلغاء موعدك' }[lang],
      text: {
        tr: `${svc}${when} randevun iptal edildi. İstersen yeni bir saat seçebilirsin.`,
        nl: `Je afspraak (${svc}${when}) is geannuleerd. Je kunt altijd een nieuwe tijd kiezen.`,
        en: `Your appointment (${svc}${when}) was cancelled. You can pick a new time whenever you like.`,
        ar: `تم إلغاء موعدك (${svc}${when}). يمكنك اختيار وقت جديد متى شئت.`,
      }[lang],
      button: { label: { tr: 'Yeni saat seç', nl: 'Kies een nieuwe tijd', en: 'Book a new time', ar: 'اختر وقتًا جديدًا' }[lang], url: d.bookUrl },
    }
    case 'thanks': return {
      subject: { tr: `Geldiğin için teşekkürler, ${c} ✂️`, nl: `Bedankt voor je bezoek, ${c} ✂️`, en: `Thanks for your visit, ${c} ✂️`, ar: `شكرًا لزيارتك يا ${c} ✂️` }[lang],
      heading: { tr: 'Bugün için teşekkürler!', nl: 'Bedankt voor vandaag!', en: 'Thanks for coming in!', ar: 'شكرًا لك على زيارة اليوم!' }[lang],
      text: d.reviewUrl
        ? {
          tr: `Umarız yeni görünümünü sevmişsindir. Bir dakikanı ayırıp ${b} için Google’da yorum bırakır mısın? Çok yardımcı olur.`,
          nl: `We hopen dat je blij bent met je nieuwe look. Wil je even een Google-review voor ${b} achterlaten? Dat helpt enorm.`,
          en: `We hope you love your new look. Could you spare a minute to leave ${b} a Google review? It really helps.`,
          ar: `نتمنى أن تكون مظهرك الجديد قد أعجبك. هل يمكنك تخصيص دقيقة لكتابة تقييم لـ ${b} على Google؟ سيساعد ذلك كثيرًا.`,
        }[lang]
        : {
          tr: 'Umarız yeni görünümünü sevmişsindir. Bir sonraki randevunu istediğin zaman alabilirsin.',
          nl: 'We hopen dat je blij bent met je nieuwe look. Boek je volgende bezoek wanneer het jou uitkomt.',
          en: 'We hope you love your new look. Book your next visit whenever you’re ready.',
          ar: 'نتمنى أن يكون مظهرك الجديد قد أعجبك. احجز زيارتك القادمة متى شئت.',
        }[lang],
      button: d.reviewUrl
        ? { label: { tr: 'Google’da yorum yaz', nl: 'Schrijf een Google-review', en: 'Leave a Google review', ar: 'اكتب تقييمًا على Google' }[lang], url: d.reviewUrl }
        : { label: again, url: d.bookUrl },
    }
    case 'remind1d':
    case 'remind3d': {
      const tomorrow = kind === 'remind1d'
      return {
        subject: tomorrow
          ? { tr: `Yarın randevun var: ${b} ⏰`, nl: `Herinnering: morgen je afspraak bij ${b} ⏰`, en: `Reminder: your appointment with ${b} is tomorrow ⏰`, ar: `تذكير: موعدك مع ${b} غدًا ⏰` }[lang]
          : { tr: `3 gün sonra randevun var: ${b}`, nl: `Herinnering: over 3 dagen je afspraak bij ${b}`, en: `Reminder: your appointment with ${b} is in 3 days`, ar: `تذكير: موعدك مع ${b} بعد 3 أيام` }[lang],
        heading: { tr: `Unutma, ${c}!`, nl: `Even een herinnering, ${c}!`, en: `Just a reminder, ${c}!`, ar: `تذكير بسيط يا ${c}!` }[lang],
        text: {
          tr: `${svc}${when} randevun var. Gelemeyeceksen lütfen ${b}’e haber ver, böylece başkası o saati alabilir.`,
          nl: `Je hebt een afspraak (${svc}${when}). Kun je niet komen? Laat het ${b} dan even weten, zodat iemand anders die tijd kan krijgen.`,
          en: `You have an appointment (${svc}${when}). If you can’t make it, please let ${b} know so someone else can take the slot.`,
          ar: `لديك موعد (${svc}${when}). إذا لم تتمكن من الحضور، يرجى إبلاغ ${b} ليتمكن شخص آخر من أخذ هذا الموعد.`,
        }[lang],
        button: { label: page, url: d.bookUrl },
      }
    }
    case 'tip': return {
      subject: { tr: 'Bahşişin için teşekkürler 💛', nl: 'Bedankt voor je fooi 💛', en: 'Thank you for the tip 💛', ar: 'شكرًا على الإكرامية 💛' }[lang],
      heading: { tr: `Çok naziksin, ${c}!`, nl: `Wat lief van je, ${c}!`, en: `That was kind of you, ${c}!`, ar: `هذا لطف منك يا ${c}!` }[lang],
      text: {
        tr: `${d.tip ? `${d.tip} bahşişin` : 'Bahşişin'} için ${b} sana teşekkür ediyor. Bir dahaki sefere görüşmek üzere!`,
        nl: `${b} bedankt je voor je fooi${d.tip ? ` van ${d.tip}` : ''}. Tot de volgende keer!`,
        en: `${b} says thank you for your ${d.tip ? `${d.tip} ` : ''}tip. See you next time!`,
        ar: `يشكرك ${b} على الإكرامية${d.tip ? ` (${d.tip})` : ''}. نراك في المرة القادمة!`,
      }[lang],
      button: { label: again, url: d.bookUrl },
    }
  }
}

const FOOT: Record<ClientLang, (b: string) => string> = {
  tr: b => `${b} adına Snippr tarafından gönderildi.`,
  nl: b => `Verstuurd door Snippr namens ${b}.`,
  en: b => `Sent by Snippr on behalf of ${b}.`,
  ar: b => `أُرسلت بواسطة Snippr نيابةً عن ${b}.`,
}

function layout(lang: ClientLang, barber: string, inner: string) {
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  return `
    <div dir="${dir}" lang="${lang}" style="font-family: -apple-system, 'Segoe UI', Roboto, Tahoma, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1d1d1f; text-align: ${dir === 'rtl' ? 'right' : 'left'};">
      <p style="font-size: 16px; font-weight: 700; margin: 0 0 22px;">✂️ ${esc(barber)}</p>
      ${inner}
      <p style="color: #999; font-size: 12px; line-height: 1.5; margin: 28px 0 0;">${esc(FOOT[lang](barber))}</p>
    </div>`
}

export function messageHtml(kind: MsgKind, lang: ClientLang, d: MsgData) {
  const m = buildMessage(kind, lang, d)
  return {
    subject: m.subject,
    html: layout(lang, d.barber, `
      <h2 style="font-size: 22px; margin: 0 0 8px;">${esc(m.heading)}</h2>
      <p style="color: #555; line-height: 1.55; margin: 0 0 24px;">${esc(m.text)}</p>
      <a href="${esc(m.button.url)}" style="display: inline-block; background: #1d1d1f; color: #fff; text-decoration: none; font-weight: 600; padding: 12px 22px; border-radius: 12px;">${esc(m.button.label)}</a>`),
  }
}

/** "Your booking request was received" email, sent right after a client books. */
export function bookingReceivedHtml(lang: ClientLang, d: { client: string; barber: string; service?: string | null; date: string; time: string; extraRow?: string }) {
  const c = first(d.client)
  const L = {
    tr: { subject: `${d.barber} ile randevun alındı`, hi: `Randevun alındı, ${c}!`, intro: 'Randevu bilgilerin:', barber: 'Berber', service: 'Hizmet', date: 'Tarih', time: 'Saat' },
    nl: { subject: `Je afspraak bij ${d.barber} is geboekt`, hi: `Je bent geboekt, ${c}!`, intro: 'Dit zijn je afspraakgegevens:', barber: 'Kapper', service: 'Dienst', date: 'Datum', time: 'Tijd' },
    en: { subject: `Your appointment with ${d.barber} is booked`, hi: `You're booked, ${c}!`, intro: 'Here are your appointment details:', barber: 'Barber', service: 'Service', date: 'Date', time: 'Time' },
    ar: { subject: `تم حجز موعدك مع ${d.barber}`, hi: `تم حجز موعدك يا ${c}!`, intro: 'تفاصيل موعدك:', barber: 'الحلاق', service: 'الخدمة', date: 'التاريخ', time: 'الوقت' },
  }[lang]
  const row = (k: string, v: string) => `<tr><td style="padding: 6px 0; color: #888; width: 35%;">${esc(k)}</td><td style="padding: 6px 0; font-weight: 600;">${esc(v)}</td></tr>`
  return {
    subject: L.subject,
    html: layout(lang, d.barber, `
      <h2 style="font-size: 22px; margin: 0 0 8px;">${esc(L.hi)}</h2>
      <p style="color: #555; margin: 0;">${esc(L.intro)}</p>
      <table style="width: 100%; border-collapse: collapse; margin-top: 12px;">
        ${row(L.barber, d.barber)}
        ${d.service ? row(L.service, d.service) : ''}
        ${row(L.date, d.date)}
        ${row(L.time, d.time)}
        ${d.extraRow ?? ''}
      </table>`),
  }
}
