import { supabase } from '@/lib/supabase'
import type { MsgKind } from '@/lib/messages'

// Ask the server to send the matching automatic email to the client (best effort).
// The server checks ownership, the barber's settings and that it wasn't sent before.
export async function notifyStatus(appointmentId: string, kind: MsgKind) {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return
    let lang = 'en'
    try { lang = localStorage.getItem('snippr-lang') === 'tr' ? 'tr' : 'en' } catch { /* storage blocked */ }
    await fetch('/api/notify-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
      body: JSON.stringify({ appointmentId, kind, lang, timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone }),
    })
  } catch { /* the status change itself already worked */ }
}

export const kindForStatus = (status: string): MsgKind | null =>
  status === 'confirmed' ? 'confirmed' : status === 'cancelled' ? 'cancelled' : status === 'completed' ? 'thanks' : null
