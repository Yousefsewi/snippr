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
