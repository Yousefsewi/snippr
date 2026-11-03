// Email opt-out ("unsubscribe") for the non-essential client emails: thank-you, tip thanks
// and reminders. Booking confirmations, cancellations and moves are always sent (they are
// part of the booking itself). Server only.
//
// Marketing rule for Snippr (Telecommunicatiewet / GDPR): never send newsletters or
// campaigns to anyone without a recorded, freely given opt-in (no pre-ticked boxes), and
// every such email needs this unsubscribe link and the sender's details.

import { createHmac, timingSafeEqual } from 'crypto'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { MsgKind } from './messages'
import { SITE_URL } from './site-url'

/** Emails a client can turn off with the unsubscribe link. */
export const OPTOUT_KINDS: MsgKind[] = ['thanks', 'tip', 'remind1d', 'remind3d']

const norm = (email: string) => email.trim().toLowerCase()

// The link carries a signature, so nobody can unsubscribe someone else's address.
function secret() {
  const s = process.env.UNSUBSCRIBE_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!s) throw new Error('no secret for unsubscribe links')
  return createHmac('sha256', s).update('snippr-unsubscribe-v1').digest()
}
export function optoutToken(email: string) {
  return createHmac('sha256', secret()).update(norm(email)).digest('base64url')
}
export function validToken(email: string, token: string) {
  try {
    const a = Buffer.from(optoutToken(email)), b = Buffer.from(String(token))
    return a.length === b.length && timingSafeEqual(a, b)
  } catch { return false }
}

/** Page link (shown in the email) and one-click link (List-Unsubscribe header). */
export function optoutLinks(email: string) {
  const q = `e=${encodeURIComponent(norm(email))}&t=${optoutToken(email)}`
  return { page: `${SITE_URL}/unsubscribe?${q}`, oneClick: `${SITE_URL}/api/unsubscribe?${q}` }
}

/** true when this address turned these emails off (missing table = nobody opted out yet). */
export async function hasOptedOut(supabase: SupabaseClient, email: string) {
  const { data, error } = await supabase.from('email_optouts').select('email').eq('email', norm(email)).maybeSingle()
  return !error && !!data
}

export async function saveOptout(supabase: SupabaseClient, email: string, source: string) {
  const { error } = await supabase.from('email_optouts').upsert({ email: norm(email), source }, { onConflict: 'email' })
  return error
}
