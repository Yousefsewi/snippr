-- Snippr: treat the same phone number written differently as one customer.
-- "06 1234 5678", "+31 6 1234 5678" and "0031612345678" all end in the same 9 digits,
-- so they now count as the same person for the first-visit discount and the spam brake.
-- Run this whole file once in Supabase Dashboard → SQL Editor → New query → Run.
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
