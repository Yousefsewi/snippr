-- Age confirmation on the booking page: when the customer ticked
-- "I am 16 or older, or a parent or guardian booking for my child".
-- Safe to run more than once.
alter table public.appointments add column if not exists age_confirmed_at timestamptz;
comment on column public.appointments.age_confirmed_at is 'When the customer confirmed they are 16+ (or a parent booking for a child)';
