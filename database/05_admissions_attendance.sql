-- School Clubs Hub: Admissions and Attendance Tracking migration
-- Safe to run in Supabase > SQL Editor without altering or dropping existing data.

-- 1. Attendance Tracking enhancements ----------------------------------
-- Add attended_at timestamp to event_registrations if it doesn't exist
alter table event_registrations
  add column if not exists attended_at timestamptz;

-- Ensure check constraint on event_registrations accommodates statuses
do $$
begin
  if exists (
    select 1 from information_schema.constraint_column_usage
    where table_name = 'event_registrations' and constraint_name = 'event_registrations_status_check'
  ) then
    alter table event_registrations drop constraint event_registrations_status_check;
  end if;
  alter table event_registrations
    add constraint event_registrations_status_check
    check (status in ('registered', 'attended', 'late'));
exception when others then
  null;
end $$;

-- 2. Admissions (Club Applications) table ------------------------------
create table if not exists club_applications (
  id            uuid primary key default gen_random_uuid(),
  club_id       uuid not null references clubs(id) on delete cascade,
  user_id       uuid not null references users(id) on delete cascade,
  role_applied  text not null default 'member',
  motivation    text not null,
  skills        text,
  status        text not null default 'pending'
                check (status in ('pending', 'approved', 'rejected', 'interview')),
  feedback      text,
  reviewed_by   uuid references users(id) on delete set null,
  reviewed_at   timestamptz,
  created_at    timestamptz not null default now()
);

-- Indexes
create index if not exists club_applications_club_idx on club_applications (club_id, status);
create index if not exists club_applications_user_idx on club_applications (user_id, status);
create index if not exists event_registrations_status_idx on event_registrations (event_id, status);

-- Row Level Security
alter table club_applications enable row level security;
grant select, insert, update, delete on club_applications to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'club_applications' and policyname = 'api_access'
  ) then
    create policy "api_access" on club_applications
      for all to anon, authenticated using (true) with check (true);
  end if;
end $$;

-- 3. Sample Seed Data for Admissions ------------------------------------
-- Safe insert for testing Admissions
insert into club_applications (id, club_id, user_id, role_applied, motivation, skills, status, feedback, reviewed_by, reviewed_at, created_at)
values
  ('d0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000009', 'Photographer', 'I love landscape and portrait photography and would love to contribute to club exhibitions.', 'Lightroom, DSLR, Creative Eye', 'pending', null, null, null, now() - interval '2 days'),
  ('d0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000011', 'Hardware Specialist', 'I have experience building Arduino circuits and want to help build competition robots.', 'C++, Arduino, Soldering', 'interview', 'Great experience. Interview scheduled for Tuesday at 3 PM in Lab 2.', 'a0000000-0000-0000-0000-000000000004', now() - interval '1 day', now() - interval '4 days'),
  ('d0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000010', 'Speaker', 'Want to improve public argumentation and represent the school in debates.', 'Public speaking, Research', 'approved', 'Welcome to the Debate Society! Next meeting is on Thursday.', 'a0000000-0000-0000-0000-000000000007', now() - interval '3 days', now() - interval '7 days')
on conflict do nothing;

-- Update past attended event registrations to have sample attended_at timestamps
update event_registrations
set attended_at = registered_at + interval '1 hour'
where status = 'attended' and attended_at is null;
