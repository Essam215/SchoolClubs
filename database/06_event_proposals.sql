-- Event proposals submitted by non-admin members and reviewed by administrators.
-- Safe to run in Supabase > SQL Editor without altering existing data.

create table if not exists event_proposals (
  id                uuid primary key default gen_random_uuid(),
  club_id           uuid not null references clubs(id) on delete cascade,
  author_id         uuid not null references users(id) on delete cascade,
  title             text not null,
  description       text,
  location          text,
  starts_at         timestamptz not null,
  ends_at           timestamptz not null,
  capacity          int check (capacity is null or capacity > 0),
  status            text not null default 'pending'
                    check (status in ('pending','approved','rejected')),
  review_note       text,
  reviewed_by       uuid references users(id) on delete set null,
  reviewed_at       timestamptz,
  approved_event_id uuid references events(id) on delete set null,
  created_at        timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists event_proposals_status_created_idx
  on event_proposals (status, created_at desc);
create index if not exists event_proposals_author_created_idx
  on event_proposals (author_id, created_at desc);

create or replace function create_event_from_approved_proposal()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'pending' and new.status = 'approved' then
    insert into events (club_id, title, description, location, starts_at, ends_at, capacity, status, created_by)
    values (new.club_id, new.title, new.description, new.location, new.starts_at, new.ends_at, new.capacity, 'upcoming', new.author_id)
    returning id into new.approved_event_id;
  end if;
  return new;
end;
$$;

drop trigger if exists event_proposal_approval_creates_event on event_proposals;
create trigger event_proposal_approval_creates_event
  before update of status on event_proposals
  for each row
  execute function create_event_from_approved_proposal();

alter table event_proposals enable row level security;
grant select, insert, update, delete on event_proposals to anon, authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'event_proposals' and policyname = 'api_access'
  ) then
    create policy "api_access" on event_proposals
      for all to anon, authenticated using (true) with check (true);
  end if;
end $$;
