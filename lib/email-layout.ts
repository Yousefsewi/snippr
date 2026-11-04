// One email design for everything Snippr sends (account emails, client emails, contact form).
// Built with tables and inline styles so it looks the same in Gmail, Outlook and on phones.
// Light grey page, white card, brand at the top, heading, text, an optional details box,
// one big button and a quiet footer. Right-to-left for Arabic.

import { SITE_URL } from './site-url'

export const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;')

export type DetailRow = { label: string; value: string; strong?: boolean; tone?: 'pink' | 'muted' | 'strike' }

export interface EmailParts {
  lang?: string
  /** short line shown next to the subject in the inbox */
  preheader?: string
  /** the shop name (client emails) — shown with its first letter; omit for Snippr's own emails */
  shop?: string
  heading: string
  /** one or more paragraphs */
  text: string | string[]
  details?: DetailRow[]
  button?: { label: string; url: string }
  /** a quoted block, e.g. the contact-form message */
  quote?: string
  /** small grey line under the button */
  note?: string
  /** footer lines (plain text) */
  footer?: string[]
  unsubscribe?: { url: string; label: string }
}

const FONT = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
const INK = '#1d1d1f', MUTED = '#6e6e73', LINE = '#ececee'

export function emailLayout(p: EmailParts): string {
  const rtl = p.lang === 'ar'
  const dir = rtl ? 'rtl' : 'ltr'
  const align = rtl ? 'right' : 'left'
  const paras = (Array.isArray(p.text) ? p.text : [p.text]).filter(Boolean)

  const brand = p.shop
    ? `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td width="40" height="40" align="center" valign="middle" style="width:40px;height:40px;border-radius:20px;background:${INK};color:#ffffff;font:600 17px ${FONT};">${esc(p.shop.trim().charAt(0).toUpperCase() || 'S')}</td>
        <td style="padding-${rtl ? 'right' : 'left'}:12px;font:600 16px ${FONT};color:${INK};">${esc(p.shop)}</td>
      </tr></table>`
    : `<table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
        <td valign="middle"><img src="${SITE_URL}/icon-192.png" width="32" height="32" alt="" style="display:block;border:0;border-radius:9px;" /></td>
        <td style="padding-${rtl ? 'right' : 'left'}:10px;font:700 19px ${FONT};color:${INK};letter-spacing:-0.3px;">snippr</td>
      </tr></table>`

  const details = p.details?.length
    ? `<tr><td style="padding:22px 0 4px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f7f8;border-radius:14px;">
          ${p.details.map((r, i) => {
            const color = r.tone === 'pink' ? '#be185d' : r.tone === 'muted' ? MUTED : INK
            const deco = r.tone === 'strike' ? 'text-decoration:line-through;color:#a1a1a6;' : ''
            return `<tr>
              <td style="padding:12px 16px;${i ? `border-top:1px solid ${LINE};` : ''}font:400 14px ${FONT};color:${MUTED};width:38%;text-align:${align};">${esc(r.label)}</td>
              <td style="padding:12px 16px;${i ? `border-top:1px solid ${LINE};` : ''}font:${r.strong === false ? 400 : 600} 14px ${FONT};color:${color};text-align:${rtl ? 'left' : 'right'};${deco}">${esc(r.value)}</td>
            </tr>`
          }).join('')}
        </table>
      </td></tr>`
    : ''

  const quote = p.quote
    ? `<tr><td style="padding:20px 0 0;"><div style="background:#f7f7f8;border-radius:14px;padding:16px 18px;font:400 15px/1.6 ${FONT};color:${INK};white-space:pre-wrap;">${esc(p.quote)}</div></td></tr>`
    : ''

  const button = p.button
    ? `<tr><td style="padding:26px 0 0;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="${rtl ? 'margin-left:auto;' : ''}"><tr>
          <td align="center" bgcolor="${INK}" style="border-radius:12px;">
            <a href="${esc(p.button.url)}" target="_blank" style="display:inline-block;padding:14px 26px;font:600 15px ${FONT};color:#ffffff;text-decoration:none;border-radius:12px;">${esc(p.button.label)}</a>
          </td>
        </tr></table>
      </td></tr>`
    : ''

  const note = p.note ? `<tr><td style="padding:18px 0 0;font:400 13px/1.55 ${FONT};color:${MUTED};">${esc(p.note)}</td></tr>` : ''

  const footer = [...(p.footer ?? [])].map(esc)
  if (p.unsubscribe) footer.push(`<a href="${esc(p.unsubscribe.url)}" style="color:#8e8e93;text-decoration:underline;">${esc(p.unsubscribe.label)}</a>`)

  return `<!doctype html>
<html lang="${esc(p.lang ?? 'en')}" dir="${dir}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="color-scheme" content="light only"><title>${esc(p.heading)}</title></head>
<body style="margin:0;padding:0;background:#f4f4f5;-webkit-text-size-adjust:100%;">
  ${p.preheader ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(p.preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" dir="${dir}" style="max-width:560px;">
        <tr><td style="padding:0 4px 16px;text-align:${align};">${brand}</td></tr>
        <tr><td style="background:#ffffff;border-radius:20px;border:1px solid ${LINE};padding:30px 28px;text-align:${align};">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            <tr><td style="font:700 24px/1.25 ${FONT};color:${INK};letter-spacing:-0.4px;">${esc(p.heading)}</td></tr>
            ${paras.map((t, i) => `<tr><td style="padding:${i ? 10 : 12}px 0 0;font:400 15px/1.6 ${FONT};color:#3a3a3c;">${esc(t)}</td></tr>`).join('')}
            ${details}${quote}${button}${note}
          </table>
        </td></tr>
        ${footer.length ? `<tr><td style="padding:18px 8px 0;font:400 12px/1.6 ${FONT};color:#8e8e93;text-align:center;">${footer.join('<br>')}</td></tr>` : ''}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}
