import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, Search, UserCheck, Users } from 'lucide-react';
import { api } from '../api';
import { Avatar, Empty, Loading, useApp } from '../ui';

function localDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const STATUSES = ['all', 'present', 'late', 'absent', 'pending'];

// Only show a saved server timestamp; never substitute the current time.
function attendanceTimestamp(member) {
  if (member.status === 'pending') return null;
  return member.recorded_at || member.attended_at || null;
}

function formatAttendanceTimestamp(value) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true,
  }).format(date);
}

export default function MeetingAttendance() {
  const { clubs = [], canManage, toast } = useApp();
  const managedClubs = useMemo(() => (clubs || []).filter((club) => canManage(club.id)), [clubs, canManage]);
  const [clubId, setClubId] = useState('');
  const [meetingDate, setMeetingDate] = useState(localDate);
  const [meetings, setMeetings] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingUserId, setSavingUserId] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!managedClubs.some((club) => club.id === clubId)) {
      setClubId(managedClubs[0]?.id || '');
    }
  }, [managedClubs, clubId]);

    useEffect(() => {
    let alive = true;
    setMeetings([]);
    if (!clubId) return;
    api.get(`/club-meetings?club_id=${encodeURIComponent(clubId)}`)
      .then(rows => {
        if (!alive) return;
        const upcoming = (Array.isArray(rows) ? rows : []).filter(m => m.status === 'scheduled');
        setMeetings(upcoming);
        setMeetingDate(upcoming[0]?.meeting_date || '');
      })
      .catch(e => { if (alive) toast(e.message, 'error'); });
    return () => { alive = false; };
  }, [clubId, toast]);
  const load = useCallback(async () => {
    if (!clubId || !meetingDate) {
      setMembers([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api.get(`/meetings/attendance?club_id=${encodeURIComponent(clubId)}&meeting_date=${meetingDate}`);
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      setMembers([]);
      toast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [clubId, meetingDate, toast]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { setFilter('all'); setSearch(''); }, [clubId, meetingDate]);

  const present = members.filter((m) => m.status === 'present').length;
  const late = members.filter((m) => m.status === 'late').length;
  const absent = members.filter((m) => m.status === 'absent').length;
  const pending = members.filter((m) => m.status === 'pending').length;
  const attended = present + late;
  const rate = members.length ? Math.round(attended / members.length * 100) : 0;
  const counts = { all: members.length, present, late, absent, pending };

  const displayed = useMemo(() => members.filter((m) => {
    const q = search.trim().toLowerCase();
    const name = m.user?.full_name?.toLowerCase() || '';
    const email = m.user?.email?.toLowerCase() || '';
    return (filter === 'all' || m.status === filter) && (!q || name.includes(q) || email.includes(q));
  }), [members, search, filter]);

  async function mark(userId, status) {
    if (!clubId || !meetingDate || savingUserId) return;
    setSavingUserId(userId);
    try {
      await api.put('/meetings/attendance', {
        club_id: clubId,
        user_id: userId,
        meeting_date: meetingDate,
        status,
      });
      toast(`Attendance marked: ${status}`);
      await load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSavingUserId(null);
    }
  }

  return (
    <>
      <section className="attendance-hero">
        <div className="attendance-hero-copy">
          <span className="attendance-eyebrow"><Users size={14} /> CLUB MEETING TRACKING</span>
          <h2>Meeting Attendance</h2>
          <p>Track attendance for club members by meeting date.</p>
        </div>
        <div className="attendance-quick-stat">
          <span className="attendance-stat-icon"><UserCheck size={20} /></span>
          <div><small>Meeting Turnout</small><b>{attended} / {members.length} ({rate}%)</b></div>
        </div>
      </section>

      <div className="toolbar" style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
        <label htmlFor="meeting-club" style={{ fontWeight: 600, fontSize: 13 }}>SELECT CLUB:</label>
        <select className="select" id="meeting-club" value={clubId} onChange={(e) => setClubId(e.target.value)}>
          {managedClubs.length === 0 && <option value="">No managed clubs</option>}
          {managedClubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
        </select>
        <label htmlFor="meeting-date" style={{ fontWeight: 600, fontSize: 13 }}>MEETING DATE:</label>
        <select id="meeting-date" className="select" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)}><option value="">Select a created meeting</option>{meetings.map(m => <option key={m.id} value={m.meeting_date}>{m.title} ({m.meeting_date})</option>)}</select>
        <button className="btn sm" onClick={load} disabled={!clubId || loading}>Refresh</button>
      </div>

      <div className="stats">
        <div className="stat"><b>{rate}%</b><span>Attendance Turnout</span></div>
        <div className="stat hot"><b>{attended}</b><span>Attended (Present + Late)</span></div>
        <div className="stat"><b>{late}</b><span>Late Arrivals</span></div>
        <div className="stat"><b>{absent}</b><span>Absent Â· {pending} Pending</span></div>
      </div>

      <div className="toolbar" style={{ flexWrap: 'wrap' }}>
        <div className="tabs" role="tablist" aria-label="Filter attendance">
          {STATUSES.map((status) => (
            <button key={status} role="tab" aria-selected={filter === status} className={filter === status ? 'on' : ''} onClick={() => setFilter(status)}>
              {status[0].toUpperCase() + status.slice(1)} ({counts[status]})
            </button>
          ))}
        </div>
        <div className="search-field" style={{ position: 'relative', minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--muted)' }} />
          <input className="select" style={{ paddingLeft: 32 }} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search club member..." />
        </div>
      </div>

      {!clubId ? (
        <Empty icon={Users} title="No clubs to manage" text="Only authorized club leaders, advisors, and admins can manage meeting attendance." />
      ) : loading ? <Loading /> : displayed.length === 0 ? (
        <Empty icon={Users} title="No members found" text={members.length ? 'No members match your filters.' : 'This club has no members.'} />
      ) : (
        <div className="attendance-roster-list">
          {displayed.map((member) => {
            const checked = member.status === 'present' || member.status === 'late';
            const busy = savingUserId === member.user_id;
            return (
              <div key={member.user_id} className={`attendance-row ${checked ? 'checked-in' : ''}`}>
                <div className="attendance-student-col">
                  <Avatar name={member.user?.full_name} color={member.user?.avatar_color} size={36} />
                  <div><b>{member.user?.full_name || 'Member'}</b><small>{member.user?.email} Â· {member.user?.grade || member.role}</small></div>
                </div>
                <div className="attendance-time-col">
                  {checked ? <span style={{ color: 'var(--ok)', fontSize: 13 }}><CheckCircle2 size={14} style={{ display: 'inline', verticalAlign: -2 }} /> Checked in</span>
                    : <span style={{ color: 'var(--muted)', fontSize: 13 }}><Clock size={14} style={{ display: 'inline', verticalAlign: -2 }} /> {member.status === 'absent' ? 'Marked absent' : 'Awaiting attendance'}</span>}
                  <small style={{ display: 'block', marginTop: 5, color: 'var(--muted)', fontSize: 12 }}>
                    {member.status === 'pending'
                      ? 'Not recorded yet'
                      : `Recorded at: ${formatAttendanceTimestamp(attendanceTimestamp(member)) || 'Not available'}`}
                  </small>
                </div>
                <div className="attendance-status-col">
                  <span className={`pill ${member.status === 'present' ? 'ok' : member.status === 'late' ? 'warn' : ''}`}>{member.status}</span>
                </div>
                <div className="attendance-actions-col">
                  {[
                    ['present', 'Present'], ['late', 'Late'], ['absent', 'Absent'], ['pending', 'Undo'],
                  ].map(([status, label]) => (
                    <button key={status} className={`btn sm ${member.status === status ? 'primary' : ''}`}
                      disabled={Boolean(savingUserId) || member.status === status} onClick={() => mark(member.user_id, status)}>
                      {busy ? 'Saving...' : label}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

