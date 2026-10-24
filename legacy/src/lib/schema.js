/**
 * schema.js
 * ─────────────────────────────────────────────────────────────────
 * Single source of truth for all enum values, status codes, and
 * typed shapes that mirror the Supabase PostgreSQL schema.
 *
 * When you activate the Supabase client (src/lib/supabase.js),
 * these constants ensure the frontend state matches DB constraints
 * exactly — no magic strings scattered through components.
 * ─────────────────────────────────────────────────────────────────
 */

// ─── users.type ──────────────────────────────────────────────────
export const USER_TYPES = /** @type {const} */ ({
  SUPERADMIN: 'superadmin',
  ADMIN:      'admin',
  TEACHER:    'teacher',
  STUDENT:    'student',
});

// ─── clubs.status ────────────────────────────────────────────────
export const CLUB_STATUS = /** @type {const} */ ({
  PENDING:  'pending',
  ACTIVE:   'active',
  INACTIVE: 'inactive',
  ARCHIVED: 'archived',
});

// ─── club_members.role ───────────────────────────────────────────
export const MEMBER_ROLES = /** @type {const} */ ({
  MEMBER:         'member',
  PRESIDENT:      'president',
  VICE_PRESIDENT: 'vice_president',
  SECRETARY:      'secretary',
  TREASURER:      'treasurer',
  SUPERVISOR:     'supervisor',
});

// ─── club_members.status ─────────────────────────────────────────
export const MEMBER_STATUS = /** @type {const} */ ({
  PENDING:   'pending',
  ACTIVE:    'active',
  REJECTED:  'rejected',
  SUSPENDED: 'suspended',
  LEFT:      'left',
});

// ─── club_applications.status ────────────────────────────────────
export const APPLICATION_STATUS = /** @type {const} */ ({
  PENDING:   'pending',
  APPROVED:  'approved',
  REJECTED:  'rejected',
  WITHDRAWN: 'withdrawn',
});

// ─── posts.visibility ────────────────────────────────────────────
export const POST_VISIBILITY = /** @type {const} */ ({
  PUBLIC:  'public',
  MEMBERS: 'members',
});

// ─── post_media.type ─────────────────────────────────────────────
export const MEDIA_TYPES = /** @type {const} */ ({
  IMAGE: 'image',
  VIDEO: 'video',
  FILE:  'file',
});

// ─── events.status ───────────────────────────────────────────────
export const EVENT_STATUS = /** @type {const} */ ({
  PENDING:   'pending',
  APPROVED:  'approved',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
});

// ─── event_participants.status ───────────────────────────────────
export const PARTICIPANT_STATUS = /** @type {const} */ ({
  REGISTERED: 'registered',
  ATTENDED:   'attended',
  ABSENT:     'absent',
  CANCELLED:  'cancelled',
});

// ─── meeting_attendance.status ───────────────────────────────────
export const ATTENDANCE_STATUS = /** @type {const} */ ({
  PRESENT: 'present',
  ABSENT:  'absent',
  LATE:    'late',
  EXCUSED: 'excused',
});

// ─── tasks.status ────────────────────────────────────────────────
export const TASK_STATUS = /** @type {const} */ ({
  PENDING:     'pending',
  IN_PROGRESS: 'in_progress',
  SUBMITTED:   'submitted',
  APPROVED:    'approved',
  REJECTED:    'rejected',
  COMPLETED:   'completed',
});

// ─── tasks.priority ──────────────────────────────────────────────
export const TASK_PRIORITY = /** @type {const} */ ({
  LOW:    'low',
  MEDIUM: 'medium',
  HIGH:   'high',
  URGENT: 'urgent',
});

// ─── resource_bookings.status ────────────────────────────────────
export const BOOKING_STATUS = /** @type {const} */ ({
  PENDING:   'pending',
  APPROVED:  'approved',
  REJECTED:  'rejected',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
});

// ─── club_expenses.status ────────────────────────────────────────
export const EXPENSE_STATUS = /** @type {const} */ ({
  PENDING:  'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
});

// ─── club_goals.status ───────────────────────────────────────────
export const GOAL_STATUS = /** @type {const} */ ({
  ACTIVE:    'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
});

// ─── Notification types (not a DB enum, used in notifications.type) ──
export const NOTIFICATION_TYPES = /** @type {const} */ ({
  EVENT:       'event',
  TASK:        'task',
  ADMISSION:   'admission',
  GAMIFICATION:'gamification',
  CLUB:        'club',
  PROFILE:     'profile',
  MEETING:     'meeting',
  SUGGESTION:  'suggestion',
  SYSTEM:      'system',
});

// ─── Helper: human-readable labels ───────────────────────────────

export const TASK_STATUS_LABELS = {
  [TASK_STATUS.PENDING]:     'Pending',
  [TASK_STATUS.IN_PROGRESS]: 'In Progress',
  [TASK_STATUS.SUBMITTED]:   'Submitted',
  [TASK_STATUS.APPROVED]:    'Approved',
  [TASK_STATUS.REJECTED]:    'Rejected',
  [TASK_STATUS.COMPLETED]:   'Completed',
};

export const TASK_PRIORITY_LABELS = {
  [TASK_PRIORITY.LOW]:    'Low',
  [TASK_PRIORITY.MEDIUM]: 'Medium',
  [TASK_PRIORITY.HIGH]:   'High',
  [TASK_PRIORITY.URGENT]: 'Urgent',
};

export const MEMBER_ROLE_LABELS = {
  [MEMBER_ROLES.MEMBER]:         'Member',
  [MEMBER_ROLES.PRESIDENT]:      'President',
  [MEMBER_ROLES.VICE_PRESIDENT]: 'Vice President',
  [MEMBER_ROLES.SECRETARY]:      'Secretary',
  [MEMBER_ROLES.TREASURER]:      'Treasurer',
  [MEMBER_ROLES.SUPERVISOR]:     'Supervisor',
};

export const APPLICATION_STATUS_LABELS = {
  [APPLICATION_STATUS.PENDING]:   'Pending',
  [APPLICATION_STATUS.APPROVED]:  'Approved',
  [APPLICATION_STATUS.REJECTED]:  'Rejected',
  [APPLICATION_STATUS.WITHDRAWN]: 'Withdrawn',
};

export const EVENT_STATUS_LABELS = {
  [EVENT_STATUS.PENDING]:   'Pending',
  [EVENT_STATUS.APPROVED]:  'Approved',
  [EVENT_STATUS.CANCELLED]: 'Cancelled',
  [EVENT_STATUS.COMPLETED]: 'Completed',
};

/**
 * Default "empty" shapes that match DB table columns.
 * Use these as templates when constructing new records in state.
 */
export const DEFAULT_TASK = {
  id:             null,
  club_id:        null,
  title:          '',
  description:    null,
  assigned_to:    null,
  created_by:     null,
  status:         TASK_STATUS.PENDING,
  priority:       TASK_PRIORITY.MEDIUM,
  due_date:       null,
  points_awarded: 0,
  rating:         null,   // 0-5
  feedback:       null,
  tags:           [],
  file_url:       null,
  file_name:      null,
  created_at:     null,
  completed_at:   null,
  // Frontend-only helpers (denormalized for display)
  club:           '',
  assignee:       '',
  xp:             100,
  comments:       [],
};

export const DEFAULT_NOTIFICATION = {
  id:               null,
  user_id:          null,
  type:             NOTIFICATION_TYPES.SYSTEM,
  title:            '',
  message:          '',
  related_club_id:  null,
  related_event_id: null,
  related_task_id:  null,
  is_read:          false,
  created_at:       null,
  // Frontend alias
  time:             'Just now',
};

export const DEFAULT_SUGGESTION = {
  id:          null,
  title:       '',
  author:      '',
  anonymous:   false,
  category:    'General',
  votes:       0,
  votedByMe:   false,
  status:      'Under Review',
  adminComment:'Received! Under evaluation.',
  details:     '',
  date:        'Just now',
};
