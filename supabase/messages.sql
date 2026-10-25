-- ─────────────────────────────────────────────────────────────
-- Automated client messages + Google review link. Safe to run more than once.
-- ─────────────────────────────────────────────────────────────

-- which automatic emails the barber has switched on (missing key = default in the app)
alter table public.barbers add column if not exists message_settings jsonb not null default '{}'::jsonb;
-- link clients get in the "thanks for your visit" email
alter table public.barbers add column if not exists google_review_url text;
do $$ begin
  alter table public.barbers add constraint barbers_google_review_url_check
    check (google_review_url is null or (char_length(google_review_url) <= 500 and google_review_url ~* '^https://'));
exception when duplicate_object then null; end $$;
grant select (message_settings, google_review_url) on public.barbers to authenticated;

-- which automatic emails were already sent for an appointment (never send the same one twice)
alter table public.appointments add column if not exists messages_sent text[] not null default '{}';
