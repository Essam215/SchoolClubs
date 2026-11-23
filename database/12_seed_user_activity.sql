-- Adds per-user tasks and related club activity for seeded students and leaders.
-- Requires database/01_schema.sql through database/11_seed_expanded_demo_data.sql.
-- Safe to rerun: generated IDs and composite keys are deterministic.

-- Five additional events per club provide a richer registration history.
with club_leaders as (
  select distinct on (m.club_id) m.club_id, m.user_id
  from club_members m
  join users u on u.id = m.user_id
  where m.role = 'leader' and u.role = 'club_leader'
  order by m.club_id, m.user_id
),
active_clubs as (
  select l.club_id, l.user_id as created_by
  from club_leaders l
  where exists (
    select 1
    from club_members m
    join users u on u.id = m.user_id
    where m.club_id = l.club_id and u.role in ('student', 'club_leader')
  )
),
numbered_clubs as (
  select club_id, created_by, row_number() over (order by club_id) as club_no
  from active_clubs
)
insert into events
  (id, club_id, title, description, location, starts_at, ends_at, capacity, status, created_by)
select
  ('e5000000-0000-0000-0000-' || lpad(((c.club_no - 1) * 5 + e.event_no)::text, 12, '0'))::uuid,
  c.club_id,
  'Member workshop ' || e.event_no,
  'Sample workshop for club members.',
  'Club activity room',
  (current_date + 30 + e.event_no + time '10:00')::timestamptz,
  (current_date + 30 + e.event_no + time '12:00')::timestamptz,
  20 + e.event_no,
  'upcoming',
  c.created_by
from numbered_clubs c
cross join generate_series(1, 5) as e(event_no)
on conflict do nothing;

-- Ten tasks per seeded student or club leader, assigned within their club.
with club_leaders as (
  select distinct on (m.club_id) m.club_id, m.user_id
  from club_members m
  join users u on u.id = m.user_id
  where m.role = 'leader' and u.role = 'club_leader'
  order by m.club_id, m.user_id
),
primary_memberships as (
  select distinct on (m.user_id)
    m.user_id, m.club_id, l.user_id as created_by, u.full_name
  from club_members m
  join users u on u.id = m.user_id
  join club_leaders l on l.club_id = m.club_id
  where u.role in ('student', 'club_leader')
  order by m.user_id, (m.role = 'leader') desc, m.club_id
),
task_rows as (
  select
    p.user_id, p.club_id, p.created_by, p.full_name, t.task_no,
    e.id as event_id,
    md5(p.user_id::text || ':user-task:' || t.task_no::text) as id_hash
  from primary_memberships p
  cross join generate_series(1, 10) as t(task_no)
  join lateral (
    select ev.id
    from events ev
    where ev.club_id = p.club_id and left(ev.id::text, 8) = 'e5000000'
    order by ev.starts_at, ev.id
    limit 1
  ) e on true
)
insert into tasks
  (id, club_id, event_id, title, description, status, priority, due_date, assigned_to, created_by, completed_at)
select
  ('f3000000-' || substr(id_hash, 1, 4) || '-' || substr(id_hash, 5, 4) || '-' ||
    substr(id_hash, 9, 4) || '-' || substr(id_hash, 13, 12))::uuid,
  club_id,
  event_id,
  'Personal demo task ' || task_no || ' - ' || full_name,
  'Assigned sample task ' || task_no || ' for ' || full_name || '.',
  case task_no % 4 when 0 then 'todo' when 1 then 'in_progress' when 2 then 'review' else 'done' end,
  case task_no % 3 when 0 then 'low' when 1 then 'medium' else 'high' end,
  current_date + task_no,
  user_id,
  created_by,
  case when task_no % 4 = 3 then now() - interval '1 day' else null end
from task_rows
on conflict do nothing;

-- Register each club member for the generated club events.
insert into event_registrations (event_id, user_id, status, registered_at, attended_at)
select
  e.id,
  m.user_id,
  'registered',
  now() - interval '1 day',
  null
from club_members m
join users u on u.id = m.user_id and u.role in ('student', 'club_leader')
join events e on e.club_id = m.club_id and left(e.id::text, 8) = 'e5000000'
on conflict do nothing;

-- Five notifications per seeded student or club leader.
with eligible_users as (
  select distinct u.id
  from users u
  join club_members m on m.user_id = u.id
  where u.role in ('student', 'club_leader')
),
notification_rows as (
  select u.id as user_id, n.notification_no,
    md5(u.id::text || ':user-notification:' || n.notification_no::text) as id_hash
  from eligible_users u
  cross join generate_series(1, 5) as n(notification_no)
)
insert into notifications (id, user_id, type, title, message, link, is_read, created_at)
select
  ('f4000000-' || substr(id_hash, 1, 4) || '-' || substr(id_hash, 5, 4) || '-' ||
    substr(id_hash, 9, 4) || '-' || substr(id_hash, 13, 12))::uuid,
  user_id,
  case notification_no when 1 then 'event' when 2 then 'task' when 3 then 'suggestion' when 4 then 'system' else 'event' end,
  'Activity update ' || notification_no,
  'Sample activity update ' || notification_no || ' for your club account.',
  case notification_no when 1 then 'events' when 2 then 'tasks' when 3 then 'suggestions' when 4 then null else 'meetings' end,
  notification_no % 2 = 0,
  now() - (notification_no::text || ' days')::interval
from notification_rows
on conflict do nothing;

-- Three additional past meetings per club for per-user attendance history.
with club_leaders as (
  select distinct on (m.club_id) m.club_id, m.user_id
  from club_members m
  join users u on u.id = m.user_id
  where m.role = 'leader' and u.role = 'club_leader'
  order by m.club_id, m.user_id
),
active_clubs as (
  select l.club_id, l.user_id as created_by
  from club_leaders l
  where exists (
    select 1
    from club_members m
    join users u on u.id = m.user_id
    where m.club_id = l.club_id and u.role in ('student', 'club_leader')
  )
),
numbered_clubs as (
  select club_id, created_by, row_number() over (order by club_id) as club_no
  from active_clubs
)
insert into club_meetings
  (id, club_id, title, meeting_date, starts_at, ends_at, mode, meeting_url, location, status, created_by)
select
  ('e6000000-0000-0000-0000-' || lpad(((c.club_no - 1) * 3 + d.meeting_no)::text, 12, '0'))::uuid,
  c.club_id,
  'Demo weekly check-in ' || d.meeting_no,
  current_date - (d.meeting_no * 7),
  (current_date - (d.meeting_no * 7) + time '14:00')::timestamptz,
  (current_date - (d.meeting_no * 7) + time '15:00')::timestamptz,
  case when d.meeting_no = 2 then 'online' else 'offline' end,
  case when d.meeting_no = 2 then 'https://meet.google.com/abc-defg-hij' else null end,
  case when d.meeting_no = 2 then null else 'Club meeting room' end,
  'scheduled',
  c.created_by
from numbered_clubs c
cross join generate_series(1, 3) as d(meeting_no)
on conflict do nothing;

-- Attendance is limited to club members and references the stored meeting dates.
insert into meeting_attendance (club_id, user_id, meeting_date, status, attended_at, recorded_at)
select
  m.club_id,
  m.user_id,
  meeting.meeting_date,
  case (current_date - meeting.meeting_date) / 7
    when 1 then 'present'
    when 2 then 'late'
    else 'absent'
  end,
  case when (current_date - meeting.meeting_date) / 7 in (1, 2)
    then (meeting.meeting_date + time '15:00')::timestamptz
    else null
  end,
  (meeting.meeting_date + time '15:30')::timestamptz
from club_members m
join users u on u.id = m.user_id and u.role in ('student', 'club_leader')
join club_meetings meeting
  on meeting.club_id = m.club_id and left(meeting.id::text, 8) = 'e6000000'
on conflict do nothing;
