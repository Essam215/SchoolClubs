import { useState } from 'react';
import { ClipboardCheck, Users } from 'lucide-react';
import EventAttendance from './EventAttendance';
import MeetingAttendance from './MeetingAttendance';

// Unified attendance hub: keep the existing Events and Meetings implementations intact.
export default function AttendanceTracking() {
  const [section, setSection] = useState('events');
  const options = [
    { id: 'events', label: 'Event Attendance', icon: ClipboardCheck },
    { id: 'meetings', label: 'Meeting Attendance', icon: Users },
  ];

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="toolbar" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0 }}>Attendance Tracking</h2>
          <p style={{ color: 'var(--muted)', margin: '6px 0 0' }}>
            Track attendance for club events and meetings.
          </p>
        </div>
      </div>
      <div className="toolbar" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} role="tablist" aria-label="Attendance actions">
        {options.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={section === id}
            className={section === id ? 'btn primary' : 'btn'}
            onClick={() => setSection(id)}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {section === 'events' ? <EventAttendance /> : <MeetingAttendance />}
      </div>
    </div>
  );
}
