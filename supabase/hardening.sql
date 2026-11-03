-- Security hardening (2026-11-03). RLS stays on for every table; this removes database
-- rights that the app never uses, so a mistake in a rule can't open data up.
-- "anon" = visitors who are not logged in (the public booking page).
-- Safe to run more than once.

begin;

-- 1) Nobody needs TRUNCATE / TRIGGER / REFERENCES through the API (TRUNCATE also skips RLS)
revoke truncate, trigger, references on public.appointments, public.barbers, public.services, public.waitlist from anon, authenticated;

-- 2) Visitors: appointments — they may only create a booking, never read, change or delete one
revoke all on public.appointments from anon;
grant insert (id, barber_id, service_id, customer_name, customer_phone, customer_email,
              start_time, end_time, status, client_lang, client_tz, age_confirmed_at)
  on public.appointments to anon;

-- 3) Visitors: barbers — read the public profile only (no user id, email, push keys, settings)
revoke all on public.barbers from anon;
grant select (id, name, slug, bio, address, photo_url, cover_url, accent, links, blocks,
              working_hours, first_visit_discount, waitlist_enabled)
  on public.barbers to anon;

-- 4) Visitors: services — read only
revoke all on public.services from anon;
grant select (id, barber_id, name, price, duration_min, created_at) on public.services to anon;

-- 5) Visitors: waitlist — nothing directly; they join through join_waitlist()
revoke all on public.waitlist from anon;

-- 6) The three booking helpers: only the app's roles may call them (not "everyone")
revoke execute on function public.get_booking_discount(uuid) from public;
revoke execute on function public.get_busy_slots(uuid, timestamptz, timestamptz) from public;
revoke execute on function public.join_waitlist(uuid, text, text, text, uuid, date, text) from public;
grant execute on function public.get_booking_discount(uuid) to anon, authenticated;
grant execute on function public.get_busy_slots(uuid, timestamptz, timestamptz) to anon, authenticated;
grant execute on function public.join_waitlist(uuid, text, text, text, uuid, date, text) to anon, authenticated;

commit;
