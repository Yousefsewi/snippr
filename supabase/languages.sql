-- ─────────────────────────────────────────────────────────────
-- Client languages: Turkish, Dutch, English and Arabic on the booking page and in emails.
-- Safe to run more than once.
-- ─────────────────────────────────────────────────────────────

alter table public.appointments drop constraint if exists appointments_client_lang_check;
alter table public.appointments add constraint appointments_client_lang_check
  check (client_lang is null or client_lang in ('tr', 'nl', 'en', 'ar'));
