-- Fixes from the Supabase security/performance advisors (2026-10-21). Safe to run more than once.

-- 1) Internal trigger functions should not be callable through the public API.
--    Triggers keep working: Postgres doesn't check EXECUTE when a trigger fires.
--    (get_busy_slots and get_booking_discount stay public on purpose: the booking page uses them.)
revoke execute on function public.handle_new_user()          from public, anon, authenticated;
revoke execute on function public.limit_booking_spam()       from public, anon, authenticated;
-- rls_auto_enable is added by Supabase itself, so only touch it when it exists
do $$ begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
revoke execute on function public.set_first_visit_discount() from public, anon, authenticated;

-- 2) Index for the appointments -> services link (faster lookups and deletes)
create index if not exists appointments_service_id_idx on public.appointments (service_id);
