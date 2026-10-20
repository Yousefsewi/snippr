-- Snippr: first-visit discount.
-- Run this whole file once in Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run: every statement is idempotent. Also merged into schema.sql.
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
