-- Sample club meetings for the demo clubs.
-- Requires 02_seed.sql and 09_club_meetings.sql.
-- Safe to rerun: existing sample rows are not overwritten.

insert into club_meetings
  (id, club_id, title, meeting_date, starts_at, ends_at, mode, meeting_url, location, status, created_by)
values
  (
    'e3000000-0000-0000-0000-000000000001',
    'c0000000-0000-0000-0000-000000000001',
    'Robotics build session',
    current_date + 2,
    (current_date + 2 + time '15:00')::timestamptz,
    (current_date + 2 + time '16:30')::timestamptz,
    'offline', null, 'Robotics Lab', 'scheduled',
    'a0000000-0000-0000-0000-000000000004'
  ),
  (
    'e3000000-0000-0000-0000-000000000002',
    'c0000000-0000-0000-0000-000000000002',
    'Coding & AI project check-in',
    current_date + 4,
    (current_date + 4 + time '14:00')::timestamptz,
    (current_date + 4 + time '15:00')::timestamptz,
    'online', 'https://meet.google.com/abc-defg-hij', null, 'scheduled',
    'a0000000-0000-0000-0000-000000000005'
  ),
  (
    'e3000000-0000-0000-0000-000000000003',
    'c0000000-0000-0000-0000-000000000003',
    'Photography planning meeting',
    current_date + 6,
    (current_date + 6 + time '15:30')::timestamptz,
    (current_date + 6 + time '16:30')::timestamptz,
    'offline', null, 'Art Room', 'scheduled',
    'a0000000-0000-0000-0000-000000000006'
  )
on conflict do nothing;
