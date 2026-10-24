-- SchoolClubs ERD schema adapted for Supabase Auth and RLS.

CREATE TABLE IF NOT EXISTS public.schools (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  name character varying NOT NULL,
  motto text,
  logo_url text,
  accent_color character varying NOT NULL DEFAULT '#C62828'::character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT schools_pkey PRIMARY KEY (id)
);
CREATE TABLE IF NOT EXISTS public.users (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  auth_user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  school_id bigint,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['superadmin'::character varying, 'admin'::character varying, 'teacher'::character varying, 'student'::character varying]::text[])),
  full_name character varying NOT NULL,
  username character varying NOT NULL UNIQUE,
  email character varying NOT NULL UNIQUE,
  avatar_url text,
  color character varying,
  bio text,
  grade character varying,
  phone character varying UNIQUE,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  points integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id)
);
CREATE TABLE IF NOT EXISTS public.clubs (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  school_id bigint NOT NULL,
  name character varying NOT NULL,
  description text,
  category character varying,
  logo_url text,
  cover_url text,
  color character varying NOT NULL DEFAULT '#C62828'::character varying,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'active'::character varying, 'inactive'::character varying, 'archived'::character varying]::text[])),
  created_by bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT clubs_pkey PRIMARY KEY (id),
  CONSTRAINT clubs_school_id_fkey FOREIGN KEY (school_id) REFERENCES public.schools(id),
  CONSTRAINT clubs_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE IF NOT EXISTS public.club_members (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  club_id bigint NOT NULL,
  user_id bigint NOT NULL,
  role character varying NOT NULL DEFAULT 'member'::character varying CHECK (role::text = ANY (ARRAY['member'::character varying, 'president'::character varying, 'vice_president'::character varying, 'secretary'::character varying, 'treasurer'::character varying, 'supervisor'::character varying]::text[])),
  status character varying NOT NULL DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'active'::character varying, 'rejected'::character varying, 'suspended'::character varying, 'left'::character varying]::text[])),
  joined_at timestamp with time zone NOT NULL DEFAULT now(),
  left_at timestamp with time zone,
  CONSTRAINT club_members_pkey PRIMARY KEY (id),
  CONSTRAINT club_members_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id),
  CONSTRAINT club_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE IF NOT EXISTS public.club_applications (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  club_id bigint NOT NULL,
  user_id bigint NOT NULL,
  motivation text,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'withdrawn'::character varying]::text[])),
  reviewed_by bigint,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT club_applications_pkey PRIMARY KEY (id),
  CONSTRAINT club_applications_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id),
  CONSTRAINT club_applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT club_applications_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id)
);
CREATE TABLE IF NOT EXISTS public.posts (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  club_id bigint NOT NULL,
  author_id bigint NOT NULL,
  content text NOT NULL,
  is_announcement boolean NOT NULL DEFAULT false,
  pinned boolean NOT NULL DEFAULT false,
  visibility character varying NOT NULL DEFAULT 'members'::character varying CHECK (visibility::text = ANY (ARRAY['public'::character varying, 'members'::character varying]::text[])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT posts_pkey PRIMARY KEY (id),
  CONSTRAINT posts_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id),
  CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
);
CREATE TABLE IF NOT EXISTS public.post_media (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  post_id bigint NOT NULL,
  type character varying NOT NULL CHECK (type::text = ANY (ARRAY['image'::character varying, 'video'::character varying, 'file'::character varying]::text[])),
  url text NOT NULL,
  name character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_media_pkey PRIMARY KEY (id),
  CONSTRAINT post_media_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE IF NOT EXISTS public.post_likes (
  user_id bigint NOT NULL,
  post_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_likes_pkey PRIMARY KEY (user_id, post_id),
  CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id)
);
CREATE TABLE IF NOT EXISTS public.post_comments (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  post_id bigint NOT NULL,
  author_id bigint NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT post_comments_pkey PRIMARY KEY (id),
  CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id),
  CONSTRAINT post_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
);
CREATE TABLE IF NOT EXISTS public.events (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  club_id bigint NOT NULL,
  title character varying NOT NULL,
  description text,
  event_date date NOT NULL,
  start_time time without time zone,
  end_time time without time zone,
  location character varying,
  category character varying,
  max_slots integer CHECK (max_slots IS NULL OR max_slots > 0),
  color character varying NOT NULL DEFAULT '#C62828'::character varying,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'cancelled'::character varying, 'completed'::character varying]::text[])),
  created_by bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT events_pkey PRIMARY KEY (id),
  CONSTRAINT events_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id),
  CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE IF NOT EXISTS public.event_participants (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  event_id bigint NOT NULL,
  user_id bigint NOT NULL,
  status character varying NOT NULL DEFAULT 'registered'::character varying CHECK (status::text = ANY (ARRAY['registered'::character varying, 'attended'::character varying, 'absent'::character varying, 'cancelled'::character varying]::text[])),
  registered_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT event_participants_pkey PRIMARY KEY (id),
  CONSTRAINT event_participants_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT event_participants_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE IF NOT EXISTS public.meetings (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  club_id bigint NOT NULL,
  title character varying NOT NULL,
  description text,
  meeting_date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone,
  location character varying,
  created_by bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT meetings_pkey PRIMARY KEY (id),
  CONSTRAINT meetings_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id),
  CONSTRAINT meetings_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE IF NOT EXISTS public.meeting_attendance (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  meeting_id bigint NOT NULL,
  user_id bigint NOT NULL,
  status character varying NOT NULL DEFAULT 'present'::character varying CHECK (status::text = ANY (ARRAY['present'::character varying, 'absent'::character varying, 'late'::character varying, 'excused'::character varying]::text[])),
  checked_at timestamp with time zone,
  CONSTRAINT meeting_attendance_pkey PRIMARY KEY (id),
  CONSTRAINT meeting_attendance_meeting_id_fkey FOREIGN KEY (meeting_id) REFERENCES public.meetings(id),
  CONSTRAINT meeting_attendance_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);
CREATE TABLE IF NOT EXISTS public.tasks (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  club_id bigint NOT NULL,
  title character varying NOT NULL,
  description text,
  assigned_to bigint,
  created_by bigint,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'in_progress'::character varying, 'submitted'::character varying, 'approved'::character varying, 'rejected'::character varying, 'completed'::character varying]::text[])),
  priority character varying NOT NULL DEFAULT 'medium'::character varying CHECK (priority::text = ANY (ARRAY['low'::character varying, 'medium'::character varying, 'high'::character varying, 'urgent'::character varying]::text[])),
  due_date timestamp with time zone,
  points_awarded integer NOT NULL DEFAULT 0 CHECK (points_awarded >= 0),
  rating smallint CHECK (rating IS NULL OR rating >= 0 AND rating <= 5),
  feedback text,
  tags jsonb NOT NULL DEFAULT '[]'::jsonb,
  file_url text,
  file_name text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT tasks_pkey PRIMARY KEY (id),
  CONSTRAINT tasks_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id),
  CONSTRAINT tasks_assigned_to_fkey FOREIGN KEY (assigned_to) REFERENCES public.users(id),
  CONSTRAINT tasks_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE IF NOT EXISTS public.task_comments (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  task_id bigint NOT NULL,
  author_id bigint NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT task_comments_pkey PRIMARY KEY (id),
  CONSTRAINT task_comments_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id),
  CONSTRAINT task_comments_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id)
);
CREATE TABLE IF NOT EXISTS public.task_likes (
  user_id bigint NOT NULL,
  task_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT task_likes_pkey PRIMARY KEY (user_id, task_id),
  CONSTRAINT task_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT task_likes_task_id_fkey FOREIGN KEY (task_id) REFERENCES public.tasks(id)
);
CREATE TABLE IF NOT EXISTS public.club_documents (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  club_id bigint NOT NULL,
  uploaded_by bigint,
  name character varying NOT NULL,
  file_url text NOT NULL,
  file_type character varying,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT club_documents_pkey PRIMARY KEY (id),
  CONSTRAINT club_documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id),
  CONSTRAINT club_documents_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id)
);
CREATE TABLE IF NOT EXISTS public.club_achievements (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  club_id bigint NOT NULL,
  title character varying NOT NULL,
  description text,
  achievement_date date,
  image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT club_achievements_pkey PRIMARY KEY (id),
  CONSTRAINT club_achievements_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id)
);
CREATE TABLE IF NOT EXISTS public.club_resources (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  club_id bigint NOT NULL,
  name character varying NOT NULL,
  description text,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  available_quantity integer NOT NULL DEFAULT 1 CHECK (available_quantity >= 0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT club_resources_pkey PRIMARY KEY (id),
  CONSTRAINT club_resources_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id)
);
CREATE TABLE IF NOT EXISTS public.resource_bookings (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  resource_id bigint NOT NULL,
  club_id bigint NOT NULL,
  requested_by bigint NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  start_time timestamp with time zone NOT NULL,
  end_time timestamp with time zone NOT NULL,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying, 'cancelled'::character varying, 'completed'::character varying]::text[])),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT resource_bookings_pkey PRIMARY KEY (id),
  CONSTRAINT resource_bookings_resource_id_fkey FOREIGN KEY (resource_id) REFERENCES public.club_resources(id),
  CONSTRAINT resource_bookings_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id),
  CONSTRAINT resource_bookings_requested_by_fkey FOREIGN KEY (requested_by) REFERENCES public.users(id)
);
CREATE TABLE IF NOT EXISTS public.club_expenses (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  club_id bigint NOT NULL,
  submitted_by bigint NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0::numeric),
  description text NOT NULL,
  category character varying,
  receipt_url text,
  status character varying NOT NULL DEFAULT 'pending'::character varying CHECK (status::text = ANY (ARRAY['pending'::character varying, 'approved'::character varying, 'rejected'::character varying]::text[])),
  approved_by bigint,
  approved_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT club_expenses_pkey PRIMARY KEY (id),
  CONSTRAINT club_expenses_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id),
  CONSTRAINT club_expenses_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES public.users(id),
  CONSTRAINT club_expenses_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users(id)
);
CREATE TABLE IF NOT EXISTS public.club_budgets (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  club_id bigint NOT NULL,
  academic_year character varying NOT NULL,
  allocated_amount numeric NOT NULL DEFAULT 0 CHECK (allocated_amount >= 0::numeric),
  spent_amount numeric NOT NULL DEFAULT 0 CHECK (spent_amount >= 0::numeric),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT club_budgets_pkey PRIMARY KEY (id),
  CONSTRAINT club_budgets_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id)
);
CREATE TABLE IF NOT EXISTS public.club_goals (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  club_id bigint NOT NULL,
  title character varying NOT NULL,
  description text,
  target_date date,
  status character varying NOT NULL DEFAULT 'active'::character varying CHECK (status::text = ANY (ARRAY['active'::character varying, 'completed'::character varying, 'cancelled'::character varying]::text[])),
  created_by bigint,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone,
  CONSTRAINT club_goals_pkey PRIMARY KEY (id),
  CONSTRAINT club_goals_club_id_fkey FOREIGN KEY (club_id) REFERENCES public.clubs(id),
  CONSTRAINT club_goals_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);
CREATE TABLE IF NOT EXISTS public.notifications (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  user_id bigint NOT NULL,
  type character varying,
  title character varying,
  message text,
  related_club_id bigint,
  related_event_id bigint,
  related_task_id bigint,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT notifications_related_club_id_fkey FOREIGN KEY (related_club_id) REFERENCES public.clubs(id),
  CONSTRAINT notifications_related_event_id_fkey FOREIGN KEY (related_event_id) REFERENCES public.events(id),
  CONSTRAINT notifications_related_task_id_fkey FOREIGN KEY (related_task_id) REFERENCES public.tasks(id)
);

-- Supabase Auth owns credentials. Mirror only basic profile fields here.
create or replace function public.handle_schoolclubs_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.users (auth_user_id, school_id, type, full_name, username, email, avatar_url)
  values (
    new.id,
    null,
    'student',
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), nullif(new.raw_user_meta_data ->> 'name', ''), split_part(new.email, '@', 1)),
    left(split_part(new.email, '@', 1), 40) || '_' || left(replace(new.id::text, '-', ''), 8),
    new.email,
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (auth_user_id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        avatar_url = coalesce(excluded.avatar_url, public.users.avatar_url);
  return new;
end;
$$;

drop trigger if exists on_schoolclubs_auth_user_created on auth.users;
create trigger on_schoolclubs_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_schoolclubs_auth_user();


-- Enable RLS on every ERD table. No broad/public data policies are added;
-- access stays denied until narrowly scoped school/membership policies are defined.
do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'schools', 'users', 'clubs', 'club_members', 'club_applications',
    'posts', 'post_media', 'post_likes', 'post_comments', 'events',
    'event_participants', 'meetings', 'meeting_attendance', 'tasks',
    'task_comments', 'task_likes', 'club_documents', 'club_achievements',
    'club_resources', 'resource_bookings', 'club_expenses', 'club_budgets',
    'club_goals', 'notifications'
  ] loop
    execute format('alter table public.%I enable row level security', table_name);
  end loop;
end;
$$;

grant select on public.users to authenticated;
drop policy if exists "Users can read their own profile" on public.users;
create policy "Users can read their own profile" on public.users
  for select to authenticated
  using ((select auth.uid()) = auth_user_id);
drop policy if exists "Users can update their own profile" on public.users;

-- Existing app persistence remains private per Supabase Auth user.
create table if not exists public.user_app_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  snapshot jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_app_data enable row level security;
grant select, insert, update on public.user_app_data to authenticated;
drop policy if exists "Users can read their own SchoolClubs data" on public.user_app_data;
create policy "Users can read their own SchoolClubs data" on public.user_app_data
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users can create their own SchoolClubs data" on public.user_app_data;
create policy "Users can create their own SchoolClubs data" on public.user_app_data
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users can update their own SchoolClubs data" on public.user_app_data;
create policy "Users can update their own SchoolClubs data" on public.user_app_data
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
