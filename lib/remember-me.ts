// "Remember me" on the login screen. When it's off we keep a flag in localStorage and a
// browser-session cookie (no expiry, so the browser drops it on close). If the flag is set
// but the cookie is gone, the browser was closed since login: sign out.
import { supabase } from '@/lib/supabase'

export const SESSION_ONLY_KEY = 'snippr:session-only'
export const ALIVE_COOKIE = 'snippr_alive'

/** Returns true when the user was signed out because "Remember me" was off. */
export async function enforceRememberMe(): Promise<boolean> {
  try {
    if (!localStorage.getItem(SESSION_ONLY_KEY)) return false
    if (document.cookie.split('; ').some(c => c.startsWith(`${ALIVE_COOKIE}=`))) return false
    localStorage.removeItem(SESSION_ONLY_KEY)
    await supabase.auth.signOut({ scope: 'local' })
    return true
  } catch {
    return false
  }
}
