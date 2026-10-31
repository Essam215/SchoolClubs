import { useCallback, useEffect, useMemo, useState } from 'react';
import { Award, BarChart2, Calendar, Check, CheckCircle2, Clock, MapPin, QrCode, Search, Sparkles, UserCheck, Users, X } from 'lucide-react';
import { api } from '../api';
import { Avatar, ClubChip, Empty, Loading, Modal, fmt, useApp } from '../ui';

export default function AttendanceTracking() {
  const { user, clubs, manageable, canManage, toast } = useApp();
  const [events, setEvents] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [attendance, setAttendance] = useState(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [usersList, setUsersList] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [checkInModalOpen, setCheckInModalOpen] = useState(false);

  // Load events
  useEffect(() => {
    api.get('/events')
      .then((data) => {
        setEvents(data);
        if (data && data.length > 0 && !selectedEventId) {
          // Default to the first upcoming or recent event
          setSelectedEventId(data[0].id);
        }
      })
      .catch((e) => toast(e.message, 'error'));
  }, [selectedEventId, toast]);

  // Load school users (for quick check-in / walk-in)
  useEffect(() => {
    api.get('/users').then(setUsersList).catch(() => {});
  }, []);

  // Load attendance for currently selected event
  const loadAttendance = useCallback(() => {
    if (!selectedEventId) {
      setAttendance([]);
      return;
    }
    setLoadingAttendance(true);
    api.get(`/events/${selectedEventId}/attendance`)
      .then((res) => {
        setAttendance(res || []);
      })
      .catch((err) => {
        setAttendance([]);
        toast(err.message, 'error');
      })
      .finally(() => setLoadingAttendance(false));
  }, [selectedEventId, toast]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance]);

  const currentEvent = useMemo(() => {
    return (events || []).find((e) => e.id === selectedEventId) || null;
  }, [events, selectedEventId]);

  const canManageCurrentEvent = currentEvent ? canManage(currentEvent.club_id) : false;

  // Metrics
  const list = attendance || [];
  const totalRegistered = list.length;
  const attendedCount = list.filter((r) => r.status === 'attended' || r.status === 'late').length;
  const lateCount = list.filter((r) => r.status === 'late').length;
  const rate = totalRegistered > 0 ? Math.round((attendedCount / totalRegistered) * 100) : 0;

  // Filtered roster
  const displayedRoster = useMemo(() => {
    return list.filter((r) => {
      const name = r.user?.full_name?.toLowerCase() || '';
      const email = r.user?.email?.toLowerCase() || '';
      const matchSearch = !searchQuery || name.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' ? true : r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [list, searchQuery, statusFilter]);

  // Mark student status
  const updateStatus = async (studentUserId, newStatus) => {
    if (!selectedEventId) return;
    try {
      await api.patch(`/events/${selectedEventId}/attendance/${studentUserId}`, { status: newStatus });
      toast(newStatus === 'attended' ? 'Marked as attended' : newStatus === 'late' ? 'Marked as late' : 'Status reset');
      loadAttendance();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <>
      <section className="attendance-hero">
        <div className="attendance-hero-copy">
          <span className="attendance-eyebrow"><Sparkles size={14} /> LIVE EVENT TRACKING</span>
          <h2>Attendance Tracking</h2>
          <p>Verify check-ins, record session attendance, and view real-time participation metrics.</p>
        </div>
        <div className="attendance-quick-stat">
          <span className="attendance-stat-icon"><UserCheck size={20} /></span>
          <div>
            <small>Session Turnout</small>
            <b>{attendedCount} / {totalRegistered} Verified ({rate}%)</b>
          </div>
        </div>
      </section>

      {/* Event Selector & Toolbar */}
      <div className="toolbar" style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={{ fontWeight: 600, fontSize: 13, color: 'var(--muted)' }}>SELECT EVENT:</label>
          <select
            className="select"
            style={{ fontWeight: 600, minWidth: 260 }}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            aria-label="Select event"
          >
            {(events || []).map((ev) => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({fmt.date(ev.starts_at)}) - {ev.clubs?.name}
              </option>
            ))}
          </select>
        </div>

        <span className="spacer" />

        {canManageCurrentEvent && (
          <button className="btn primary" onClick={() => setCheckInModalOpen(true)}>
            <QrCode size={16} /> QR / Student Check-in
          </button>
        )}
      </div>

      {currentEvent && (
        <div className="attendance-event-card">
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
            <ClubChip club={currentEvent.clubs} />
            <span className={`pill ${currentEvent.status === 'completed' ? 'ok' : 'info'}`}>
              {currentEvent.status}
            </span>
          </div>
          <h3 style={{ fontSize: 18, marginBottom: 4 }}>{currentEvent.title}</h3>
          <div className="meta" style={{ display: 'flex', gap: 16, color: 'var(--muted)', fontSize: 13 }}>
            <span><Clock size={14} style={{ verticalAlign: -2 }} /> {fmt.date(currentEvent.starts_at)}, {fmt.time(currentEvent.starts_at)}</span>
            {currentEvent.location && <span><MapPin size={14} style={{ verticalAlign: -2 }} /> {currentEvent.location}</span>}
            <span><Users size={14} style={{ verticalAlign: -2 }} /> {totalRegistered} registered {currentEvent.capacity ? `(Cap: ${currentEvent.capacity})` : ''}</span>
          </div>
        </div>
      )}

      {/* Metrics Row */}
      <div className="stats">
        <div className="stat">
          <b>{rate}%</b>
          <span>Attendance Turnout</span>
        </div>
        <div className="stat hot">
          <b>{attendedCount}</b>
          <span>Present Students</span>
        </div>
        <div className="stat">
          <b>{lateCount}</b>
          <span>Late Arrivals</span>
        </div>
        <div className="stat">
          <b>{Math.max(0, totalRegistered - attendedCount)}</b>
          <span>Awaiting Check-in</span>
        </div>
      </div>

      {/* Roster Controls */}
      <div className="toolbar">
        <div className="tabs" role="tablist">
          {[
            ['all', `All (${totalRegistered})`],
            ['attended', `Attended (${list.filter((r) => r.status === 'attended').length})`],
            ['late', `Late (${lateCount})`],
            ['registered', `Awaiting (${list.filter((r) => r.status === 'registered').length})`],
          ].map(([st, label]) => (
            <button
              key={st}
              role="tab"
              aria-selected={statusFilter === st}
              className={statusFilter === st ? 'on' : ''}
              onClick={() => setStatusFilter(st)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="search-field" style={{ position: 'relative', minWidth: 220 }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: 12, color: 'var(--muted)' }} />
          <input
            style={{ paddingLeft: 32 }}
            className="select"
            placeholder="Search student by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Roster List */}
      {events === null || loadingAttendance ? (
        <Loading />
      ) : displayedRoster.length === 0 ? (
        <Empty
          icon={UserCheck}
          title="No registrations found"
          text={totalRegistered === 0 ? 'No students have registered for this event yet.' : 'No students match your filter criteria.'}
        />
      ) : (
        <div className="attendance-roster-list">
          {displayedRoster.map((r) => {
            const isAttended = r.status === 'attended';
            const isLate = r.status === 'late';
            const isCheckedIn = isAttended || isLate;
            return (
              <div key={r.user_id} className={`attendance-row ${isCheckedIn ? 'checked-in' : ''}`}>
                <div className="attendance-student-col">
                  <Avatar name={r.user?.full_name} color={r.user?.avatar_color} size={36} />
                  <div>
                    <b>{r.user?.full_name || 'Student'}</b>
                    <small>{r.user?.email} · {r.user?.grade || 'Grade 10'}</small>
                  </div>
                </div>

                <div className="attendance-time-col">
                  {isCheckedIn ? (
                    <span style={{ fontSize: 13, color: 'var(--ok)' }}>
                      <CheckCircle2 size={14} style={{ display: 'inline', verticalAlign: -2, marginRight: 4 }} />
                      Checked-in {r.attended_at ? fmt.ago(r.attended_at) : 'recently'}
                    </span>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--muted)' }}>
                      Registered {fmt.ago(r.registered_at)}
                    </span>
                  )}
                </div>

                <div className="attendance-status-col">
                  {isAttended && <span className="pill ok">Present</span>}
                  {isLate && <span className="pill warn">Late Arrival</span>}
                  {!isCheckedIn && <span className="pill">Registered</span>}
                </div>

                {canManageCurrentEvent && (
                  <div className="attendance-actions-col">
                    {!isAttended ? (
                      <button
                        className="btn sm primary"
                        onClick={() => updateStatus(r.user_id, 'attended')}
                      >
                        <Check size={14} /> Mark Present
                      </button>
                    ) : (
                      <button
                        className="btn sm"
                        onClick={() => updateStatus(r.user_id, 'registered')}
                      >
                        Undo
                      </button>
                    )}

                    {!isLate ? (
                      <button
                        className="btn sm"
                        onClick={() => updateStatus(r.user_id, 'late')}
                      >
                        Mark Late
                      </button>
                    ) : (
                      <button
                        className="btn sm"
                        onClick={() => updateStatus(r.user_id, 'attended')}
                      >
                        Mark On-Time
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* QR & Quick Check-in Modal */}
      {checkInModalOpen && (
        <CheckInModal
          event={currentEvent}
          users={usersList}
          onClose={() => setCheckInModalOpen(false)}
          onCheckInSuccess={() => {
            loadAttendance();
          }}
        />
      )}
    </>
  );
}

function CheckInModal({ event, users, onClose, onCheckInSuccess }) {
  const { toast } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState(users[0]?.id || '');
  const [scanning, setScanning] = useState(false);
  const [isLate, setIsLate] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleCheckIn = async (userIdToMark) => {
    if (!event || !userIdToMark) return;
    setBusy(true);
    try {
      await api.post(`/events/${event.id}/attendance/check-in`, {
        user_id: userIdToMark,
        status: isLate ? 'late' : 'attended',
      });
      const studentObj = users.find((u) => u.id === userIdToMark);
      toast(`Checked in: ${studentObj?.full_name || 'Student'}`);
      onCheckInSuccess();
    } catch (e) {
      toast(e.message, 'error');
    }
    setBusy(false);
  };

  const simulateQrScan = () => {
    setScanning(true);
    setTimeout(() => {
      // Pick a student from users
      const randomUser = users[Math.floor(Math.random() * users.length)];
      if (randomUser) {
        handleCheckIn(randomUser.id);
      }
      setScanning(false);
    }, 1200);
  };

  return (
    <Modal title={`Quick Check-in: ${event?.title}`} onClose={onClose}>
      <div style={{ display: 'grid', gap: 16 }}>
        {/* QR Scanner Simulation Box */}
        <div className="attendance-qr-box">
          <QrCode size={48} style={{ color: 'var(--red)' }} />
          <h4>Badge & QR Check-in Station</h4>
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: '4px 0 14px' }}>
            Scan a student’s digital club badge or simulated attendee token to record immediate check-in.
          </p>
          <button
            className="btn primary"
            disabled={scanning || busy}
            onClick={simulateQrScan}
          >
            {scanning ? 'Scanning digital badge…' : 'Simulate Scanner Check-in'}
          </button>
        </div>

        <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: 13, fontWeight: 600 }}>
          ── OR MANUAL STUDENT LOOKUP ──
        </div>

        {/* Manual Lookup */}
        <div className="field">
          <label>Select Student to Check In</label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
          >
            {users.map((u) => (
              <option key={u.id} value={u.id}>
                {u.full_name} ({u.email}) - {u.role}
              </option>
            ))}
          </select>
        </div>

        <label className="check">
          <input
            type="checkbox"
            checked={isLate}
            onChange={(e) => setIsLate(e.target.checked)}
          />
          Mark as Late Arrival (checked in after 15 minutes)
        </label>

        <div className="modal-actions" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 10 }}>
          <button type="button" className="btn" onClick={onClose}>Done</button>
          <button
            type="button"
            className="btn primary"
            disabled={busy || !selectedStudentId}
            onClick={() => handleCheckIn(selectedStudentId)}
          >
            <UserCheck size={16} /> Confirm Check-in
          </button>
        </div>
      </div>
    </Modal>
  );
}
