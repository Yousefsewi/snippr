import { supabase } from '@/lib/supabase'

// The barber adds an appointment (or a closed time) to their own calendar.
// The database only accepts new rows as 'pending', so it is confirmed right after
// (`after` adds more fields to that second write, e.g. payment details).
export async function addOwnAppointment(row: {
  barberId: string; start: Date; end: Date; name: string; phone?: string | null; email?: string | null; serviceId?: string | null
}, after: Record<string, unknown> = {}) {
  const { data, error } = await supabase.from('appointments')
    .insert({
      barber_id: row.barberId, customer_name: row.name, customer_phone: row.phone ?? null, customer_email: row.email ?? null,
      service_id: row.serviceId ?? null, start_time: row.start.toISOString(), end_time: row.end.toISOString(), status: 'pending',
    })
    .select('id').single()
  if (error) return error
  await supabase.from('appointments').update({ status: 'confirmed', ...after }).eq('id', data.id)
  return null
}

export type SaveError = 'overlap' | 'past' | 'generic'

// 23P01 = overlaps another appointment; a row-level-security refusal here means the time is in the past
export const saveErrorKind = (e: { code?: string; message?: string }): SaveError =>
  e.code === '23P01' ? 'overlap' : e.code === '42501' || /row-level security/i.test(e.message ?? '') ? 'past' : 'generic'
