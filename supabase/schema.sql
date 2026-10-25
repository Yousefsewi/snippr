-- Snippr database schema.
-- Run this whole file once in Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run: every statement is idempotent.

create extension if not exists btree_gist with schema extensions;

/* ───────────────────────── tables ───────────────────────── */

create table if not exists public.barbers (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null unique references auth.users (id) on delete cascade,
  email             text,
  name              text not null default '',
  slug              text not null unique,
  bio               text,
  address           text,
  photo_url         text,            -- stored as a data: URL by the dashboard
  cover_url         text,
  accent            text,
  links             jsonb,
  blocks            jsonb,
  working_hours     jsonb,           -- { mon: { open, start, end }, ... }
  push_subscription jsonb,           -- web push (private)
  push_token        text,            -- Expo push token from the mobile app (private)
  created_at        timestamptz not null default now()
);

create table if not exists public.services (
  id           uuid primary key default gen_random_uuid(),
  barber_id    uuid not null references public.barbers (id) on delete cascade,
  name         text not null,
  duration_min int  not null default 30 check (duration_min > 0),
  price        numeric(10, 2) not null default 0 check (price >= 0),
  created_at   timestamptz not null default now()
);
create index if not exists services_barber_id_idx on public.services (barber_id);

create table if not exists public.appointments (
  id             uuid primary key default gen_random_uuid(),
  barber_id      uuid not null references public.barbers (id) on delete cascade,
  service_id     uuid references public.services (id) on delete set null,
  customer_name  text not null,
  customer_phone text,
  customer_email text,
  start_time     timestamptz not null,
  end_time       timestamptz not null,
  status         text not null default 'pending'
                 check (status in ('pending', 'confirmed', 'completed', 'cancelled')),
  created_at     timestamptz not null default now(),
  check (end_time > start_time)
);
create index if not exists appointments_barber_start_idx on public.appointments (barber_id, start_time);

-- Two active (non-cancelled) appointments for the same barber can never overlap,
-- even if two customers press "Book" at the same moment.
do $$ begin
  alter table public.appointments add constraint appointments_no_overlap
    exclude using gist (barber_id with =, tstzrange(start_time, end_time, '[)') with &&)
    where (status <> 'cancelled');
exception when duplicate_object then null;
end $$;

/* ───────────────────────── row level security ───────────────────────── */

alter table public.barbers      enable row level security;
alter table public.services     enable row level security;
alter table public.appointments enable row level security;

-- barbers: anyone can view a profile (public booking page); only the owner can change it
drop policy if exists "barbers are public"     on public.barbers;
drop policy if exists "owner inserts barber"   on public.barbers;
drop policy if exists "owner updates barber"   on public.barbers;
drop policy if exists "owner deletes barber"   on public.barbers;
create policy "barbers are public"   on public.barbers for select using (true);
create policy "owner inserts barber" on public.barbers for insert to authenticated with check (user_id = (select auth.uid()));
create policy "owner updates barber" on public.barbers for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "owner deletes barber" on public.barbers for delete to authenticated using (user_id = (select auth.uid()));

-- Rows are public, but email and push tokens are not: only expose the profile columns.
-- (The server route reads push data with the service role key, which bypasses this.)
revoke select on public.barbers from anon, authenticated;
grant select (id, user_id, name, slug, bio, address, photo_url, cover_url, accent, links, blocks, working_hours, created_at)
  on public.barbers to anon, authenticated;

-- services: public menu, owner manages
drop policy if exists "services are public"     on public.services;
drop policy if exists "owner manages services"  on public.services;
create policy "services are public" on public.services for select using (true);
create policy "owner manages services" on public.services for all to authenticated
  using      (barber_id in (select id from public.barbers where user_id = (select auth.uid())))
  with check (barber_id in (select id from public.barbers where user_id = (select auth.uid())));

-- appointments: anyone can request a booking; only the barber can see / change their bookings
drop policy if exists "barber reads own bookings"    on public.appointments;
drop policy if exists "barber updates own bookings"  on public.appointments;
drop policy if exists "barber deletes own bookings"  on public.appointments;
-- (the public booking insert policy lives in security-fixes.sql, which is applied at the end of this file)
create policy "barber reads own bookings" on public.appointments for select to authenticated
  using (barber_id in (select id from public.barbers where user_id = (select auth.uid())));
create policy "barber updates own bookings" on public.appointments for update to authenticated
  using      (barber_id in (select id from public.barbers where user_id = (select auth.uid())))
  with check (barber_id in (select id from public.barbers where user_id = (select auth.uid())));
create policy "barber deletes own bookings" on public.appointments for delete to authenticated
  using (barber_id in (select id from public.barbers where user_id = (select auth.uid())));

/* ───────────────────────── functions ───────────────────────── */

-- Busy time ranges for the public booking page, without exposing customer details.
create or replace function public.get_busy_slots(p_barber_id uuid, p_from timestamptz, p_to timestamptz)
returns table (start_time timestamptz, end_time timestamptz)
language sql stable security definer set search_path = public
as $$
  select a.start_time, a.end_time
  from public.appointments a
  where a.barber_id = p_barber_id
    and a.status <> 'cancelled'
    and a.start_time < p_to
    and a.end_time > p_from
$$;
grant execute on function public.get_busy_slots(uuid, timestamptz, timestamptz) to anon, authenticated;

-- Create the barber profile as soon as someone signs up (works with email confirmation on).
-- The register form passes full_name and slug as user metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_name text := coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1));
  v_base text;
  v_slug text;
  i int := 0;
begin
  v_base := trim(both '-' from regexp_replace(lower(coalesce(nullif(new.raw_user_meta_data ->> 'slug', ''), v_name)), '[^a-z0-9]+', '-', 'g'));
  if v_base = '' then v_base := 'barber'; end if;
  v_slug := v_base;
  while exists (select 1 from public.barbers where slug = v_slug) loop
    i := i + 1;
    v_slug := v_base || '-' || i;
  end loop;

  insert into public.barbers (user_id, email, name, slug)
  values (new.id, new.email, v_name, v_slug)
  on conflict (user_id) do nothing;
  return new;
end
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

/* ───────────────────────── realtime ───────────────────────── */

-- Dashboard and calendar update live when a booking comes in.
do $$ begin
  alter publication supabase_realtime add table public.appointments;
exception when duplicate_object then null;
end $$;

/* ───────────────────────── abuse protection (also in security-fixes.sql) ───────────────────────── */

-- Each booking notifies (email + push) at most once
alter table public.appointments add column if not exists notified_at timestamptz;

-- Sane sizes: no year-long bookings, no 10k-character names
do $$ begin
  alter table public.appointments add constraint appointments_max_duration check (end_time - start_time <= interval '12 hours');
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.appointments add constraint appointments_name_len check (char_length(customer_name) between 1 and 100);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.appointments add constraint appointments_phone_len check (customer_phone is null or char_length(customer_phone) <= 40);
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.appointments add constraint appointments_email_len check (customer_email is null or char_length(customer_email) <= 254);
exception when duplicate_object then null; end $$;

-- Public bookings: pending only, in the future (max 1 year ahead), with a service of that same barber
drop policy if exists "anyone can request a booking" on public.appointments;
create policy "anyone can request a booking" on public.appointments for insert to anon, authenticated
  with check (
    status = 'pending'
    and notified_at is null
    and start_time > now() - interval '10 minutes'
    and start_time < now() + interval '1 year'
    and (service_id is null or exists (
      select 1 from public.services s where s.id = service_id and s.barber_id = appointments.barber_id))
  );

-- Spam brake: max 3 bookings per customer per barber per hour, max 20 bookings per barber per 10 minutes
create or replace function public.limit_booking_spam()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  -- the barber adding to their own calendar is never limited
  if exists (select 1 from public.barbers b where b.id = new.barber_id and b.user_id = auth.uid()) then
    return new;
  end if;

  if (select count(*) from public.appointments a
      where a.barber_id = new.barber_id
        and a.created_at > now() - interval '1 hour'
        and (lower(a.customer_name) = lower(new.customer_name)
             or (new.customer_phone is not null and a.customer_phone = new.customer_phone)
             or (new.customer_email is not null and lower(a.customer_email) = lower(new.customer_email)))) >= 3 then
    raise exception 'Too many bookings from you in a short time. Please try again later.' using errcode = 'P0001';
  end if;

  if (select count(*) from public.appointments a
      where a.barber_id = new.barber_id and a.created_at > now() - interval '10 minutes') >= 20 then
    raise exception 'This barber is receiving too many bookings right now. Please try again in a few minutes.' using errcode = 'P0001';
  end if;

  return new;
end
$$;

drop trigger if exists limit_booking_spam on public.appointments;
create trigger limit_booking_spam
  before insert on public.appointments
  for each row execute function public.limit_booking_spam();

/* ───────────────────────── first-visit discount (also in first-visit-discount.sql) ───────────────────────── */
--
-- Rules
--  * On for every barber, default 20%. Each barber can pick 5–50% in Settings.
--  * A customer gets it on their FIRST appointment with that barber only.
--  * "First" = no earlier non-cancelled appointment with the same phone number
--    (digits only) or email at that barber. A cancelled booking doesn't use it up.
--  * Without a phone number or email we can't check, so no discount.
--  * Decided by the database on insert; whatever the browser sends is ignored.

alter table public.barbers add column if not exists first_visit_discount int not null default 20;
do $$ begin
  alter table public.barbers add constraint barbers_first_visit_discount_range check (first_visit_discount between 5 and 50);
exception when duplicate_object then null; end $$;
-- the public booking page needs to show it
grant select (first_visit_discount) on public.barbers to anon, authenticated;

alter table public.appointments add column if not exists discount_percent int not null default 0;
do $$ begin
  alter table public.appointments add constraint appointments_discount_range check (discount_percent between 0 and 50);
exception when duplicate_object then null; end $$;

create or replace function public.set_first_visit_discount()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_discount int;
  v_phone text := nullif(regexp_replace(coalesce(new.customer_phone, ''), '\D', '', 'g'), '');
  v_email text := nullif(lower(trim(coalesce(new.customer_email, ''))), '');
begin
  new.discount_percent := 0;
  if v_phone is not null and length(v_phone) < 6 then v_phone := null; end if; -- too short to identify anyone
  if v_phone is null and v_email is null then return new; end if;

  select b.first_visit_discount into v_discount from public.barbers b where b.id = new.barber_id;

  if not exists (
    select 1 from public.appointments a
    where a.barber_id = new.barber_id
      and a.status <> 'cancelled'
      and ((v_phone is not null and regexp_replace(coalesce(a.customer_phone, ''), '\D', '', 'g') = v_phone)
        or (v_email is not null and lower(trim(coalesce(a.customer_email, ''))) = v_email))
  ) then
    new.discount_percent := coalesce(v_discount, 0);
  end if;
  return new;
end
$$;

drop trigger if exists set_first_visit_discount on public.appointments;
create trigger set_first_visit_discount
  before insert on public.appointments
  for each row execute function public.set_first_visit_discount();

-- Lets the booking page show "discount applied" right after booking, without
-- letting visitors read appointments: only by the (random) id, only for 10 minutes.
create or replace function public.get_booking_discount(p_id uuid)
returns int
language sql stable security definer set search_path = public
as $$
  select a.discount_percent from public.appointments a
  where a.id = p_id and a.created_at > now() - interval '10 minutes'
$$;
grant execute on function public.get_booking_discount(uuid) to anon, authenticated;

/* ───────────────────────── phone matching by last 9 digits (also in phone-match-fix.sql) ───────────────────────── */
-- Safe to re-run. Also merged into schema.sql.

-- last 9 digits of a phone number (null if it has fewer than 6 digits)
create or replace function public.phone_key(p text)
returns text
language sql immutable
as $$
  select case
    when length(regexp_replace(coalesce(p, ''), '\D', '', 'g')) < 6 then null
    else right(regexp_replace(p, '\D', '', 'g'), 9)
  end
$$;

create or replace function public.set_first_visit_discount()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_discount int;
  v_phone text := public.phone_key(new.customer_phone);
  v_email text := nullif(lower(trim(coalesce(new.customer_email, ''))), '');
begin
  new.discount_percent := 0;
  if v_phone is null and v_email is null then return new; end if;

  select b.first_visit_discount into v_discount from public.barbers b where b.id = new.barber_id;

  if not exists (
    select 1 from public.appointments a
    where a.barber_id = new.barber_id
      and a.status <> 'cancelled'
      and ((v_phone is not null and public.phone_key(a.customer_phone) = v_phone)
        or (v_email is not null and lower(trim(coalesce(a.customer_email, ''))) = v_email))
  ) then
    new.discount_percent := coalesce(v_discount, 0);
  end if;
  return new;
end
$$;

create or replace function public.limit_booking_spam()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  v_phone text := public.phone_key(new.customer_phone);
begin
  -- the barber adding to their own calendar is never limited
  if exists (select 1 from public.barbers b where b.id = new.barber_id and b.user_id = auth.uid()) then
    return new;
  end if;

  if (select count(*) from public.appointments a
      where a.barber_id = new.barber_id
        and a.created_at > now() - interval '1 hour'
        and (lower(a.customer_name) = lower(new.customer_name)
             or (v_phone is not null and public.phone_key(a.customer_phone) = v_phone)
             or (new.customer_email is not null and lower(a.customer_email) = lower(new.customer_email)))) >= 3 then
    raise exception 'Too many bookings from you in a short time. Please try again later.' using errcode = 'P0001';
  end if;

  if (select count(*) from public.appointments a
      where a.barber_id = new.barber_id and a.created_at > now() - interval '10 minutes') >= 20 then
    raise exception 'This barber is receiving too many bookings right now. Please try again in a few minutes.' using errcode = 'P0001';
  end if;

  return new;
end
$$;

-- ── Advisor fixes (same as supabase/advisor-fixes.sql) ──
revoke execute on function public.handle_new_user()          from public, anon, authenticated;
revoke execute on function public.limit_booking_spam()       from public, anon, authenticated;
-- rls_auto_enable is added by Supabase itself, so only touch it when it exists
do $$ begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
revoke execute on function public.set_first_visit_discount() from public, anon, authenticated;
create index if not exists appointments_service_id_idx on public.appointments (service_id);

-- ── Waitlist (same as supabase/waitlist.sql) ──
create table if not exists public.waitlist (
  id             uuid primary key default gen_random_uuid(),
  barber_id      uuid not null references public.barbers (id) on delete cascade,
  service_id     uuid references public.services (id) on delete set null,
  customer_name  text not null check (char_length(customer_name) between 1 and 100),
  customer_phone text check (customer_phone is null or char_length(customer_phone) <= 40),
  customer_email text check (customer_email is null or char_length(customer_email) <= 254),
  preferred_date date not null,
  time_pref      text not null default 'any' check (time_pref in ('any', 'morning', 'afternoon', 'evening')),
  note           text check (note is null or char_length(note) <= 300),
  status         text not null default 'waiting' check (status in ('waiting', 'booked')),
  source         text not null default 'barber' check (source in ('barber', 'client')),
  created_at     timestamptz not null default now()
);
create index if not exists waitlist_barber_id_idx on public.waitlist (barber_id);
create index if not exists waitlist_service_id_idx on public.waitlist (service_id);

alter table public.waitlist enable row level security;

-- only the barber sees and manages their own list
drop policy if exists "barber manages own waitlist" on public.waitlist;
create policy "barber manages own waitlist" on public.waitlist for all to authenticated
  using      (barber_id in (select id from public.barbers where user_id = (select auth.uid())))
  with check (barber_id in (select id from public.barbers where user_id = (select auth.uid())));

revoke all on public.waitlist from anon;
grant select, insert, update, delete on public.waitlist to authenticated;

-- the barber can switch "clients can join from my booking page" on or off
alter table public.barbers add column if not exists waitlist_enabled boolean not null default true;
grant select (waitlist_enabled) on public.barbers to anon, authenticated;

-- clients join through this function, never by writing to the table directly
create or replace function public.join_waitlist(
  p_barber_id uuid, p_name text, p_phone text, p_email text, p_service_id uuid, p_date date, p_time_pref text
) returns void
language plpgsql security definer set search_path = public
as $$
declare
  v_name  text := nullif(trim(coalesce(p_name, '')), '');
  v_phone text := nullif(trim(coalesce(p_phone, '')), '');
  v_email text := nullif(lower(trim(coalesce(p_email, ''))), '');
begin
  if v_name is null or char_length(v_name) > 100 then
    raise exception 'Please enter your name.' using errcode = 'P0001';
  end if;
  if v_phone is null and v_email is null then
    raise exception 'Please add a phone number or email so the barber can reach you.' using errcode = 'P0001';
  end if;
  if char_length(coalesce(v_phone, '')) > 40 or char_length(coalesce(v_email, '')) > 254 then
    raise exception 'Contact details are too long.' using errcode = 'P0001';
  end if;
  if p_date is null or p_date < current_date or p_date > current_date + 365 then
    raise exception 'Please pick a date within the next year.' using errcode = 'P0001';
  end if;
  if coalesce(p_time_pref, 'any') not in ('any', 'morning', 'afternoon', 'evening') then
    raise exception 'Invalid time preference.' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.barbers b where b.id = p_barber_id and b.waitlist_enabled) then
    raise exception 'This barber is not taking waitlist requests.' using errcode = 'P0001';
  end if;
  if p_service_id is not null and not exists (select 1 from public.services s where s.id = p_service_id and s.barber_id = p_barber_id) then
    raise exception 'Unknown service.' using errcode = 'P0001';
  end if;

  -- spam limits
  if (select count(*) from public.waitlist w where w.barber_id = p_barber_id and w.created_at > now() - interval '10 minutes') >= 10 then
    raise exception 'Too many requests right now. Please try again in a few minutes.' using errcode = 'P0001';
  end if;
  if (select count(*) from public.waitlist w
      where w.barber_id = p_barber_id and w.created_at > now() - interval '1 hour'
        and ((v_phone is not null and w.customer_phone = v_phone) or (v_email is not null and w.customer_email = v_email))) >= 3 then
    raise exception 'You are already on the waitlist.' using errcode = 'P0001';
  end if;

  insert into public.waitlist (barber_id, service_id, customer_name, customer_phone, customer_email, preferred_date, time_pref, source)
  values (p_barber_id, p_service_id, v_name, v_phone, v_email, p_date, coalesce(p_time_pref, 'any'), 'client');
end
$$;

revoke execute on function public.join_waitlist(uuid, text, text, text, uuid, date, text) from public;
grant execute on function public.join_waitlist(uuid, text, text, text, uuid, date, text) to anon, authenticated;

-- live updates in the dashboard when a client joins
do $$ begin
  alter publication supabase_realtime add table public.waitlist;
exception when duplicate_object then null; end $$;

-- ── Daily sales (same as supabase/sales.sql) ──
alter table public.appointments add column if not exists payment_method text;
alter table public.appointments add column if not exists tip_amount numeric(10, 2) not null default 0;
alter table public.appointments add column if not exists paid_at timestamptz;

do $$ begin
  alter table public.appointments add constraint appointments_payment_method_check
    check (payment_method is null or payment_method in ('cash', 'card', 'other'));
exception when duplicate_object then null; end $$;
do $$ begin
  alter table public.appointments add constraint appointments_tip_range
    check (tip_amount >= 0 and tip_amount <= 100000);
exception when duplicate_object then null; end $$;

-- clients booking from the public page can never set payment fields themselves
create or replace function public.clear_client_payment()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if not exists (select 1 from public.barbers b where b.id = new.barber_id and b.user_id = auth.uid()) then
    new.payment_method := null;
    new.tip_amount := 0;
    new.paid_at := null;
  end if;
  return new;
end
$$;
revoke execute on function public.clear_client_payment() from public, anon, authenticated;

drop trigger if exists appointments_clear_client_payment on public.appointments;
create trigger appointments_clear_client_payment
  before insert on public.appointments
  for each row execute function public.clear_client_payment();

-- ── Automated messages (same as supabase/messages.sql) ──
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
