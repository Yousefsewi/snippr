// Automated client emails: what they say and whether they are on.
// Used by the server (app/api/notify-status) and by the dashboard preview, so both match.

export type MsgKind = 'confirmed' | 'cancelled' | 'thanks' | 'tip' | 'remind1d' | 'remind3d'
// sent right after the barber changes an appointment (app/api/notify-status)
export const STATUS_KINDS: MsgKind[] = ['confirmed', 'cancelled', 'thanks', 'tip']
// sent by the daily reminder job (app/api/cron/reminders)
export const REMINDER_KINDS: MsgKind[] = ['remind1d', 'remind3d']
export const MSG_DEFAULTS: Record<MsgKind, boolean> = { confirmed: true, cancelled: true, thanks: true, tip: false, remind1d: true, remind3d: false }

export type MsgSettings = Partial<Record<MsgKind, boolean>>
export const isOn = (s: MsgSettings | null | undefined, k: MsgKind) => s?.[k] ?? MSG_DEFAULTS[k]

type Lang = 'en' | 'tr'
export interface MsgData {
  client: string; barber: string; service?: string | null; date: string; time: string
  bookUrl: string; reviewUrl?: string | null; tip?: string | null
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')
const first = (n: string) => n.trim().split(/\s+/)[0] || n

export function buildMessage(kind: MsgKind, lang: Lang, d: MsgData) {
  const tr = lang === 'tr'
  const when = `${d.date} · ${d.time}`
  const svc = d.service ? (tr ? `${d.service}, ` : `${d.service}, `) : ''
  switch (kind) {
    case 'confirmed': return {
      subject: tr ? `${d.barber} randevunu onayladı ✅` : `${d.barber} confirmed your appointment ✅`,
      heading: tr ? `Görüşmek üzere, ${first(d.client)}!` : `See you soon, ${first(d.client)}!`,
      text: tr ? `${svc}${when} randevun onaylandı.` : `Your appointment (${svc}${when}) is confirmed.`,
      button: { label: tr ? 'Randevu sayfası' : 'Booking page', url: d.bookUrl },
    }
    case 'cancelled': return {
      subject: tr ? `${d.barber} randevunu iptal etti` : `${d.barber} cancelled your appointment`,
      heading: tr ? `Randevun iptal edildi` : `Your appointment was cancelled`,
      text: tr ? `${svc}${when} randevun iptal edildi. İstersen yeni bir saat seçebilirsin.` : `Your appointment (${svc}${when}) was cancelled. You can pick a new time whenever you like.`,
      button: { label: tr ? 'Yeni saat seç' : 'Book a new time', url: d.bookUrl },
    }
    case 'thanks': return {
      subject: tr ? `Geldiğin için teşekkürler, ${first(d.client)} ✂️` : `Thanks for your visit, ${first(d.client)} ✂️`,
      heading: tr ? `Bugün için teşekkürler!` : `Thanks for coming in!`,
      text: d.reviewUrl
        ? (tr ? `Umarız yeni görünümünü sevmişsindir. Bir dakikanı ayırıp ${d.barber} için Google’da yorum bırakır mısın? Çok yardımcı olur.` : `We hope you love your new look. Could you spare a minute to leave ${d.barber} a Google review? It really helps.`)
        : (tr ? `Umarız yeni görünümünü sevmişsindir. Bir sonraki randevunu istediğin zaman alabilirsin.` : `We hope you love your new look. Book your next visit whenever you’re ready.`),
      button: d.reviewUrl ? { label: tr ? 'Google’da yorum yaz' : 'Leave a Google review', url: d.reviewUrl } : { label: tr ? 'Tekrar randevu al' : 'Book again', url: d.bookUrl },
    }
    case 'remind1d':
    case 'remind3d': return {
      subject: tr
        ? (kind === 'remind1d' ? `Yarın randevun var: ${d.barber} ⏰` : `3 gün sonra randevun var: ${d.barber}`)
        : (kind === 'remind1d' ? `Reminder: your appointment with ${d.barber} is tomorrow ⏰` : `Reminder: your appointment with ${d.barber} is in 3 days`),
      heading: tr ? `Unutma, ${first(d.client)}!` : `Just a reminder, ${first(d.client)}!`,
      text: tr
        ? `${svc}${when} randevun var. Gelemeyeceksen lütfen ${d.barber}’e haber ver, böylece başkası o saati alabilir.`
        : `You have an appointment (${svc}${when}). If you can’t make it, please let ${d.barber} know so someone else can take the slot.`,
      button: { label: tr ? 'Randevu sayfası' : 'Booking page', url: d.bookUrl },
    }
    case 'tip': return {
      subject: tr ? `Bahşişin için teşekkürler 💛` : `Thank you for the tip 💛`,
      heading: tr ? `Çok naziksin, ${first(d.client)}!` : `That was kind of you, ${first(d.client)}!`,
      text: tr ? `${d.tip ? `${d.tip} bahşişin` : 'Bahşişin'} için ${d.barber} sana teşekkür ediyor. Bir dahaki sefere görüşmek üzere!` : `${d.barber} says thank you for your ${d.tip ? `${d.tip} ` : ''}tip. See you next time!`,
      button: { label: tr ? 'Tekrar randevu al' : 'Book again', url: d.bookUrl },
    }
  }
}

export function messageHtml(kind: MsgKind, lang: Lang, d: MsgData) {
  const m = buildMessage(kind, lang, d)
  const foot = lang === 'tr' ? `${d.barber} adına Snippr tarafından gönderildi.` : `Sent by Snippr on behalf of ${d.barber}.`
  return {
    subject: m.subject,
    html: `
    <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; color: #1d1d1f;">
      <p style="font-size: 16px; font-weight: 700; margin: 0 0 22px;">✂️ ${esc(d.barber)}</p>
      <h2 style="font-size: 22px; margin: 0 0 8px;">${esc(m.heading)}</h2>
      <p style="color: #555; line-height: 1.55; margin: 0 0 24px;">${esc(m.text)}</p>
      <a href="${esc(m.button.url)}" style="display: inline-block; background: #1d1d1f; color: #fff; text-decoration: none; font-weight: 600; padding: 12px 22px; border-radius: 12px;">${esc(m.button.label)}</a>
      <p style="color: #999; font-size: 12px; line-height: 1.5; margin: 28px 0 0;">${esc(foot)}</p>
    </div>`,
  }
}
