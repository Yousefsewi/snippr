-- Snippr security fixes (booking abuse + one-time notifications).
-- Run this whole file once in Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run: every statement is idempotent. Also merged into schema.sql.

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
