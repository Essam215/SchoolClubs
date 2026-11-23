-- Adds 50 related demo rows to every application table.
-- Requires database/01_schema.sql through database/10_seed_club_meetings.sql.
-- Safe to rerun: all generated IDs and composite keys are deterministic.

-- Users ----------------------------------------------------------------
insert into users (id, full_name, email, role, grade, avatar_color)
select
  ('a1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  case when n <= 5 then 'Demo Leader ' else 'Demo Student ' end || lpad(n::text, 2, '0'),
  case when n <= 5 then 'demo.leader.' else 'demo.student.' end ||
    lpad(n::text, 2, '0') || '@schoolclubs.test',
  case when n <= 5 then 'club_leader' else 'student' end,
  case when n <= 5 then 'Grade 12' else 'Grade ' || (9 + n % 4)::text end,
  (array['#D91E2E', '#2563EB', '#7C3AED', '#0F766E', '#C2410C'])[(n - 1) % 5 + 1]
from generate_series(1, 50) as g(n)
on conflict do nothing;

-- Clubs ----------------------------------------------------------------
insert into clubs (id, name, description, category, color, advisor_id)
select
  ('c1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  'Demo Club ' || lpad(n::text, 3, '0'),
  'Sample club ' || n || ' for testing the School Clubs Hub.',
  (array['Technology', 'Arts', 'Science', 'Humanities'])[(n - 1) % 4 + 1],
  (array['#D91E2E', '#2563EB', '#7C3AED', '#15803D', '#C2410C'])[(n - 1) % 5 + 1],
  ('a0000000-0000-0000-0000-' || lpad((2 + (n - 1) % 2)::text, 12, '0'))::uuid
from generate_series(1, 50) as g(n)
on conflict do nothing;

-- Club memberships: one leader and one student for each demo club.
insert into club_members (club_id, user_id, role)
select
  ('c1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('a1000000-0000-0000-0000-' || lpad((1 + (n - 1) % 5)::text, 12, '0'))::uuid,
  'leader'
from generate_series(1, 50) as g(n)
union all
select
  ('c1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('a1000000-0000-0000-0000-' || lpad((6 + (n - 1) % 45)::text, 12, '0'))::uuid,
  'member'
from generate_series(1, 50) as g(n)
on conflict do nothing;

-- Events ----------------------------------------------------------------
insert into events
  (id, club_id, title, description, location, starts_at, ends_at, capacity, status, created_by)
select
  ('e1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('c1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  'Demo event ' || lpad(n::text, 2, '0'),
  'Sample event ' || n || ' for testing club event management.',
  'Demo room ' || n,
  (current_date + n + time '10:00')::timestamptz,
  (current_date + n + time '12:00')::timestamptz,
  10 + n,
  'upcoming',
  ('a1000000-0000-0000-0000-' || lpad((1 + (n - 1) % 5)::text, 12, '0'))::uuid
from generate_series(1, 50) as g(n)
on conflict do nothing;

-- Event registrations ---------------------------------------------------
insert into event_registrations (event_id, user_id, status, registered_at, attended_at)
select
  ('e1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('a1000000-0000-0000-0000-' || lpad((6 + (n - 1) % 45)::text, 12, '0'))::uuid,
  case n % 3 when 0 then 'attended' when 1 then 'late' else 'registered' end,
  now() - (n::text || ' days')::interval,
  case when n % 3 in (0, 1) then now() - (n::text || ' days')::interval + interval '1 hour' else null end
from generate_series(1, 50) as g(n)
on conflict do nothing;

-- Tasks -----------------------------------------------------------------
insert into tasks
  (id, club_id, event_id, title, description, status, priority, due_date, assigned_to, created_by, completed_at)
select
  ('f1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('c1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('e1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  'Demo task ' || lpad(n::text, 2, '0'),
  'Sample task ' || n || ' for testing task tracking.',
  case n % 4 when 0 then 'todo' when 1 then 'in_progress' when 2 then 'review' else 'done' end,
  case n % 3 when 0 then 'low' when 1 then 'medium' else 'high' end,
  current_date + (n % 30),
  ('a1000000-0000-0000-0000-' || lpad((6 + (n - 1) % 45)::text, 12, '0'))::uuid,
  ('a1000000-0000-0000-0000-' || lpad((1 + (n - 1) % 5)::text, 12, '0'))::uuid,
  case when n % 4 = 3 then now() - interval '1 day' else null end
from generate_series(1, 50) as g(n)
on conflict do nothing;

-- Notifications ---------------------------------------------------------
insert into notifications (id, user_id, type, title, message, link, is_read, created_at)
select
  ('f2000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('a1000000-0000-0000-0000-' || lpad((6 + (n - 1) % 45)::text, 12, '0'))::uuid,
  case n % 4 when 0 then 'event' when 1 then 'task' when 2 then 'suggestion' else 'system' end,
  'Demo notification ' || lpad(n::text, 2, '0'),
  'Sample notification ' || n || ' for testing updates.',
  case n % 4 when 0 then 'events' when 1 then 'tasks' when 2 then 'suggestions' else null end,
  n % 2 = 0,
  now() - (n::text || ' hours')::interval
from generate_series(1, 50) as g(n)
on conflict do nothing;

-- Suggestions -----------------------------------------------------------
insert into suggestions
  (id, club_id, author_id, category, title, body, is_anonymous, status, response, responded_by, responded_at)
select
  ('b1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('c1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('a1000000-0000-0000-0000-' || lpad((6 + (n - 1) % 45)::text, 12, '0'))::uuid,
  (array['event_idea', 'activity', 'facilities', 'other'])[(n - 1) % 4 + 1],
  'Demo suggestion ' || lpad(n::text, 2, '0'),
  'Sample suggestion ' || n || ' for testing the suggestion box.',
  n % 2 = 0,
  case n % 5 when 0 then 'new' when 1 then 'under_review' when 2 then 'accepted' when 3 then 'rejected' else 'implemented' end,
  case when n % 5 = 0 then null else 'Sample response for suggestion ' || n || '.' end,
  case when n % 5 = 0 then null else ('a1000000-0000-0000-0000-' || lpad((1 + (n - 1) % 5)::text, 12, '0'))::uuid end,
  case when n % 5 = 0 then null else now() - (n::text || ' days')::interval end
from generate_series(1, 50) as g(n)
on conflict do nothing;

-- Suggestion votes ------------------------------------------------------
insert into suggestion_votes (suggestion_id, user_id)
select
  ('b1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('a1000000-0000-0000-0000-' || lpad((1 + (n - 1) % 5)::text, 12, '0'))::uuid
from generate_series(1, 50) as g(n)
on conflict do nothing;

-- Recognition points ----------------------------------------------------
insert into club_point_awards (id, club_id, user_id, awarded_by, points, reason, created_at)
select
  ('d1100000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('c1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('a1000000-0000-0000-0000-' || lpad((6 + (n - 1) % 45)::text, 12, '0'))::uuid,
  ('a1000000-0000-0000-0000-' || lpad((1 + (n - 1) % 5)::text, 12, '0'))::uuid,
  10 + n % 91,
  'Demo contribution ' || n,
  now() - (n::text || ' days')::interval
from generate_series(1, 50) as g(n)
on conflict do nothing;

-- Resources -------------------------------------------------------------
insert into resources
  (id, club_id, created_by, title, description, category, quantity, unit, storage_location, resource_type, url)
select
  ('d3000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('c1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('a1000000-0000-0000-0000-' || lpad((1 + (n - 1) % 5)::text, 12, '0'))::uuid,
  'Demo resource ' || lpad(n::text, 2, '0'),
  'Sample equipment item ' || n || ' for the club inventory.',
  case n % 3 when 0 then 'Electronics' when 1 then 'Supplies' else 'Equipment' end,
  1 + n % 20,
  'items',
  'Demo storage ' || n,
  'physical_item',
  null
from generate_series(1, 50) as g(n)
on conflict do nothing;

-- Club applications -----------------------------------------------------
insert into club_applications
  (id, club_id, user_id, role_applied, motivation, skills, status, feedback, reviewed_by, reviewed_at)
select
  ('d4000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('c1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('a1000000-0000-0000-0000-' || lpad((6 + n % 45)::text, 12, '0'))::uuid,
  case n % 3 when 0 then 'member' when 1 then 'project volunteer' else 'event helper' end,
  'I would like to join demo club ' || n || ' and contribute to its activities.',
  'Teamwork, research, and project planning',
  case n % 4 when 0 then 'pending' when 1 then 'approved' when 2 then 'rejected' else 'interview' end,
  case when n % 4 = 0 then null else 'Sample review for application ' || n || '.' end,
  case when n % 4 = 0 then null else ('a1000000-0000-0000-0000-' || lpad((1 + (n - 1) % 5)::text, 12, '0'))::uuid end,
  case when n % 4 = 0 then null else now() - (n::text || ' days')::interval end
from generate_series(1, 50) as g(n)
on conflict do nothing;

-- Approved applicants are enrolled in their club.
insert into club_members (club_id, user_id, role)
select
  ('c1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('a1000000-0000-0000-0000-' || lpad((6 + n % 45)::text, 12, '0'))::uuid,
  'member'
from generate_series(1, 50) as g(n)
where n % 4 = 1
on conflict do nothing;

-- Event proposals -------------------------------------------------------
insert into event_proposals
  (id, club_id, author_id, title, description, location, starts_at, ends_at, capacity,
   status, review_note, reviewed_by, reviewed_at, approved_event_id)
select
  ('e2000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('c1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('a1000000-0000-0000-0000-' || lpad((6 + (n - 1) % 45)::text, 12, '0'))::uuid,
  'Demo event proposal ' || lpad(n::text, 2, '0'),
  'A sample proposal for activity ' || n || ' in the demo club.',
  'Demo venue ' || n,
  (current_date + n + time '13:00')::timestamptz,
  (current_date + n + time '15:00')::timestamptz,
  10 + n,
  case n % 3 when 0 then 'pending' when 1 then 'approved' else 'rejected' end,
  case when n % 3 = 0 then null else 'Sample review for proposal ' || n || '.' end,
  case when n % 3 = 0 then null else ('a1000000-0000-0000-0000-' || lpad((1 + (n - 1) % 5)::text, 12, '0'))::uuid end,
  case when n % 3 = 0 then null else now() - (n::text || ' days')::interval end,
  case when n % 3 = 1 then ('e1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid else null end
from generate_series(1, 50) as g(n)
on conflict do nothing;

-- Club meetings ---------------------------------------------------------
insert into club_meetings
  (id, club_id, title, meeting_date, starts_at, ends_at, mode, meeting_url, location, status, created_by)
select
  ('e4000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  ('c1000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid,
  'Demo club meeting ' || lpad(n::text, 2, '0'),
  current_date + n + 10,
  (current_date + n + 10 + time '14:00')::timestamptz,
  (current_date + n + 10 + time '15:00')::timestamptz,
  case when n % 2 = 0 then 'online' else 'offline' end,
  case when n % 2 = 0 then 'https://meet.google.com/abc-defg-hij' else null end,
  case when n % 2 = 0 then null else 'Demo room ' || n end,
  'scheduled',
  ('a1000000-0000-0000-0000-' || lpad((1 + (n - 1) % 5)::text, 12, '0'))::uuid
from generate_series(1, 50) as g(n)
on conflict do nothing;

-- Meeting attendance ----------------------------------------------------
insert into meeting_attendance
  (club_id, user_id, meeting_date, status, attended_at, recorded_at)
select
  m.club_id,
  ('a1000000-0000-0000-0000-' || lpad((6 + (n - 1) % 45)::text, 12, '0'))::uuid,
  m.meeting_date,
  case n % 4 when 0 then 'pending' when 1 then 'present' when 2 then 'late' else 'absent' end,
  case when n % 4 in (1, 2) then now() - interval '1 hour' else null end,
  now() - interval '1 hour'
from generate_series(1, 50) as g(n)
join club_meetings m
  on m.id = ('e4000000-0000-0000-0000-' || lpad(n::text, 12, '0'))::uuid
on conflict do nothing;
