// "Manage my appointment" links in client emails. The link carries a signature over the
// appointment id, so only the person who got the email can open or cancel that booking.
// Server only.

import { createHmac, timingSafeEqual } from 'crypto'
import { SITE_URL } from './site-url'

function key() {
  const s = process.env.UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!s) throw new Error('no secret for appointment links')
  return createHmac('sha256', s).update('snippr-manage-v1').digest()
}

export function manageToken(id: string) {
  return createHmac('sha256', key()).update(id).digest('base64url')
}

export function validManageToken(id: string, token: unknown) {
  try {
    const a = Buffer.from(manageToken(id)), b = Buffer.from(String(token))
    return a.length === b.length && timingSafeEqual(a, b)
  } catch { return false }
}

/** Link to the client's appointment page (cancel / book a new time). null if not configured. */
export function manageUrl(id: string, lang: string) {
  try {
    return `${SITE_URL}/appointment?id=${id}&t=${manageToken(id)}&l=${encodeURIComponent(lang)}`
  } catch { return null }
}
