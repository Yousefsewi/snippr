-- ─────────────────────────────────────────────────────────────
-- Appointment reminders: remember the client's language and time zone from the
-- booking page, so reminder emails are in their language and show their local time.
-- Safe to run more than once.
-- ─────────────────────────────────────────────────────────────

alter table public.appointments add column if not exists client_lang text;
alter table public.appointments add column if not exists client_tz text;

do $$ begin
  alter table public.appointments add constraint appointments_client_lang_check
    check (client_lang is null or client_lang in ('tr', 'nl', 'en', 'ar'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.appointments add constraint appointments_client_tz_len
    check (client_tz is null or char_length(client_tz) <= 64);
exception when duplicate_object then null; end $$;

-- the daily reminder job looks appointments up by start time
create index if not exists appointments_start_time_idx on public.appointments (start_time);
