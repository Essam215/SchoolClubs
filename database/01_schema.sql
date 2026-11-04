-- School Clubs Hub: database schema (Supabase / PostgreSQL)
-- Run this first in Supabase > SQL Editor, then run 02_seed.sql.
-- WARNING: it drops and recreates the tables below.

create extension if not exists pgcrypto;

drop table if exists club_point_awards, resources, suggestion_votes, suggestions, notifications, tasks,
  event_registrations, events, club_members, clubs, users cascade;

-- People -------------------------------------------------------------
create table users (
  id           uuid primary key default gen_random_uuid(),
  full_name    text not null,
  email        text not null unique check (email = lower(email)),
  role         text not null check (role in ('student','club_leader','advisor','admin')),
  grade        text,
  avatar_color text not null default '#D91E2E',
  created_at   timestamptz not null default now()
);

-- Clubs ---------------------------------------------------------------
create table clubs (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  description text,
  category    text,
  color       text not null default '#D91E2E',
  advisor_id  uuid references users(id) on delete set null,
  created_at  timestamptz not null default now()
);

create table club_members (
  club_id   uuid not null references clubs(id) on delete cascade,
  user_id   uuid not null references users(id) on delete cascade,
  role      text not null default 'member' check (role in ('member','leader')),
  joined_at timestamptz not null default now(),
  primary key (club_id, user_id)
);

-- Event management ----------------------------------------------------
create table events (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references clubs(id) on delete cascade,
  title       text not null,
  description text,
  location    text,
  starts_at   timestamptz not null,
  ends_at     timestamptz not null,
  capacity    int check (capacity is null or capacity > 0),
  status      text not null default 'upcoming'
              check (status in ('upcoming','completed','cancelled')),
  created_by  uuid references users(id) on delete set null,
  created_at  timestamptz not null default now(),
  check (ends_at > starts_at)
);

create table event_registrations (
  event_id      uuid not null references events(id) on delete cascade,
  user_id       uuid not null references users(id) on delete cascade,
  status        text not null default 'registered' check (status in ('registered','attended')),
  registered_at timestamptz not null default now(),
  primary key (event_id, user_id)
);

-- Task management -----------------------------------------------------
create table tasks (
  id           uuid primary key default gen_random_uuid(),
  club_id      uuid not null references clubs(id) on delete cascade,
  event_id     uuid references events(id) on delete set null,
  title        text not null,
  description  text,
  status       text not null default 'todo' check (status in ('todo','in_progress','review','done')),
  priority     text not null default 'medium' check (priority in ('low','medium','high')),
  due_date     date,
  assigned_to  uuid references users(id) on delete set null,
  created_by   uuid references users(id) on delete set null,
  created_at   timestamptz not null default now(),
  completed_at timestamptz
);

-- Notifications -------------------------------------------------------
create table notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  type       text not null check (type in ('event','task','suggestion','system')),
  title      text not null,
  message    text,
  link       text,
  is_read    boolean not null default false,
  created_at timestamptz not null default now()
);

-- Suggestion box ------------------------------------------------------
create table suggestions (
  id           uuid primary key default gen_random_uuid(),
  club_id      uuid references clubs(id) on delete cascade,   -- null = whole school
  author_id    uuid not null references users(id) on delete cascade,
  category     text not null default 'other'
               check (category in ('event_idea','activity','facilities','other')),
  title        text not null,
  body         text not null,
  is_anonymous boolean not null default false,
  status       text not null default 'new'
               check (status in ('new','under_review','accepted','rejected','implemented')),
  response     text,
  responded_by uuid references users(id) on delete set null,
  responded_at timestamptz,
  created_at   timestamptz not null default now()
);

create table suggestion_votes (
  suggestion_id uuid not null references suggestions(id) on delete cascade,
  user_id       uuid not null references users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  primary key (suggestion_id, user_id)
);

-- Member recognition points --------------------------------------------
create table club_point_awards (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references clubs(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  awarded_by  uuid references users(id) on delete set null,
  points      int not null check (points between 1 and 100),
  reason      text not null,
  created_at  timestamptz not null default now()
);

-- Resource library -----------------------------------------------------
create table resources (
  id               uuid primary key default gen_random_uuid(),
  club_id          uuid references clubs(id) on delete cascade,
  created_by       uuid references users(id) on delete set null,
  title            text not null,
  description      text,
  category         text not null default 'other',
  quantity         int not null default 0 check (quantity >= 0),
  unit             text not null default 'items',
  storage_location text,
  resource_type    text not null default 'physical_item'
                   check (resource_type in ('article','video','document','website','physical_item')),
  url              text,
  created_at       timestamptz not null default now()
);

-- Indexes -------------------------------------------------------------
create index on club_members (user_id);
create index on events (club_id, starts_at);
create index on event_registrations (user_id);
create index on tasks (club_id, status);
create index on tasks (assigned_to);
create index on notifications (user_id, is_read, created_at desc);
create index on suggestions (club_id, created_at desc);
create index on club_point_awards (club_id, user_id, created_at desc);
create index on resources (club_id, category, created_at desc);

-- Row Level Security --------------------------------------------------
-- The .NET API talks to Supabase with the publishable (anon) key, so the
-- anon role needs access. All permission checks happen in the API.
-- For production: switch the API to the secret/service key (or a direct
-- Npgsql connection) and delete these open policies.
do $$
declare t text;
begin
  foreach t in array array['users','clubs','club_members','events','event_registrations',
    'tasks','notifications','suggestions','suggestion_votes','club_point_awards','resources']
  loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy "api_access" on %I for all to anon, authenticated using (true) with check (true)', t);
  end loop;
end $$;
