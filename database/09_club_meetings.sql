-- Club meetings and meeting attendance.
-- Safe to run in Supabase > SQL Editor without altering existing data.

create table if not exists club_meetings (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references clubs(id) on delete cascade,
  title       text not null,
  meeting_date date not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  mode        text not null check (mode in ('online', 'offline')),
  meeting_url text,
  location    text,
  status      text not null default 'scheduled'
              check (status in ('scheduled', 'cancelled')),
  created_by  uuid references users(id) on delete set null,
  created_at  timestamptz not null default now(),
  unique (club_id, meeting_date),
  check (ends_at > starts_at),
  check (
    (mode = 'online' and meeting_url is not null and location is null) or
    (mode = 'offline' and location is not null and meeting_url is null)
  )
);

create table if not exists meeting_attendance (
  club_id     uuid not null,
  user_id     uuid not null references users(id) on delete cascade,
  meeting_date date not null,
  status      text not null default 'pending'
              check (status in ('pending', 'present', 'late', 'absent')),
  attended_at timestamptz,
  recorded_at timestamptz not null default now(),
  primary key (club_id, user_id, meeting_date),
  foreign key (club_id, meeting_date)
    references club_meetings(club_id, meeting_date) on delete cascade
);

create index if not exists club_meetings_starts_at_idx
  on club_meetings (starts_at desc);
create index if not exists meeting_attendance_user_idx
  on meeting_attendance (user_id, meeting_date);

grant select, insert, update, delete on club_meetings, meeting_attendance to anon, authenticated;
alter table club_meetings enable row level security;
alter table meeting_attendance enable row level security;

do $$
declare t text;
begin
  foreach t in array array['club_meetings', 'meeting_attendance']
  loop
    if not exists (
      select 1 from pg_policies
      where schemaname = 'public' and tablename = t and policyname = 'api_access'
    ) then
      execute format(
        'create policy "api_access" on %I for all to anon, authenticated using (true) with check (true)',
        t
      );
    end if;
  end loop;
end $$;
