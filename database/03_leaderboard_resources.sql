-- Non-destructive migration for recognition points and the resource library.
-- Safe to run after 01_schema.sql too; existing feature tables are retained.

create table if not exists club_point_awards (
  id          uuid primary key default gen_random_uuid(),
  club_id     uuid not null references clubs(id) on delete cascade,
  user_id     uuid not null references users(id) on delete cascade,
  awarded_by  uuid references users(id) on delete set null,
  points      int not null check (points between 1 and 100),
  reason      text not null,
  created_at  timestamptz not null default now()
);

create table if not exists resources (
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

create index if not exists club_point_awards_club_user_created_idx
  on club_point_awards (club_id, user_id, created_at desc);
create index if not exists resources_club_category_created_idx
  on resources (club_id, category, created_at desc);

alter table club_point_awards enable row level security;
alter table resources enable row level security;
grant select, insert, update, delete on club_point_awards, resources to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'club_point_awards' and policyname = 'api_access'
  ) then
    create policy "api_access" on club_point_awards
      for all to anon, authenticated using (true) with check (true);
  end if;
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'resources' and policyname = 'api_access'
  ) then
    create policy "api_access" on resources
      for all to anon, authenticated using (true) with check (true);
  end if;
end $$;
