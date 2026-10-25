-- Snippr new features: waitlist + daily sales + automated messages.
-- Paste ALL of this into Supabase → SQL Editor → Run. Safe to run more than once.

-- ─────────────────────────────────────────────────────────────
-- Waitlist: clients who want a time that is not free yet.
-- The barber adds them from the dashboard; clients can also join from the
-- public booking page through join_waitlist() (checked + rate-limited).
-- Safe to run more than once.
-- ─────────────────────────────────────────────────────────────

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

-- ─────────────────────────────────────────────────────────────
-- Daily sales: the barber records how a finished appointment was paid
-- (cash / card / other) and any tip. Safe to run more than once.
-- ─────────────────────────────────────────────────────────────

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
