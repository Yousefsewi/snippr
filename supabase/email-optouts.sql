-- Addresses that clicked "I don't want these emails" (thank-you, tip and reminder emails).
-- Only the server (service role) reads and writes it: RLS on, no policies, no API rights.
-- Safe to run more than once.
create table if not exists public.email_optouts (
  email      text primary key,
  source     text,
  created_at timestamptz not null default now()
);
alter table public.email_optouts enable row level security;
revoke all on public.email_optouts from anon, authenticated;
comment on table public.email_optouts is 'Client emails that unsubscribed from non-essential Snippr emails';
