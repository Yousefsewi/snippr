import { supabase } from '@/lib/supabase'

// "Download my data" (GDPR right of access / data portability): everything Snippr stores
// for the signed-in barber, as one JSON file. Database rules only return the barber's own rows.
// Columns are listed by name: the database only lets the browser read these (technical
// push-notification keys stay server-side).
export async function downloadMyData() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not signed in')

  const { data: barber } = await supabase.from('barbers').select('id, user_id, name, slug, bio, address, photo_url, cover_url, accent, links, blocks, working_hours, first_visit_discount, waitlist_enabled, message_settings, google_review_url, created_at').eq('user_id', user.id).maybeSingle()
  const id = barber?.id
  const [services, appointments, waitlist] = id
    ? await Promise.all([
        supabase.from('services').select('id, name, price, duration_min, created_at').eq('barber_id', id),
        supabase.from('appointments').select('id, customer_name, customer_email, customer_phone, service_id, start_time, end_time, status, discount_percent, tip_amount, payment_method, paid_at, client_lang, client_tz, created_at').eq('barber_id', id).order('start_time'),
        supabase.from('waitlist').select('id, customer_name, customer_email, customer_phone, service_id, preferred_date, time_pref, note, status, source, created_at').eq('barber_id', id).order('created_at'),
      ])
    : [{ data: [] }, { data: [] }, { data: [] }]

  const file = {
    exported_at: new Date().toISOString(),
    note: 'All data Snippr stores for your account (snipprcalendar.com).',
    account: {
      email: user.email,
      created_at: user.created_at,
      email_confirmed_at: user.email_confirmed_at,
      last_sign_in_at: user.last_sign_in_at,
      details: user.user_metadata,
    },
    profile: barber ?? null,
    services: services.data ?? [],
    appointments: appointments.data ?? [],
    waitlist: waitlist.data ?? [],
  }

  const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `snippr-my-data-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
