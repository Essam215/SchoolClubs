import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { QrCode, CheckCircle, Clock, XCircle, Search, UserCheck, BarChart2, Plus } from 'lucide-react';
import './AttendanceTracking.css';

export default function AttendanceTracking() {
  const { events, attendance, markAttendance } = useApp();
  const [selectedEventId, setSelectedEventId] = useState(events[0]?.id || 101);
  const [studentNameInput, setStudentNameInput] = useState('');
  const [qrSimulating, setQrSimulating] = useState(false);

  const currentEvent = events.find(e => e.id === Number(selectedEventId)) || events[0];

  if (!currentEvent) {
    return <div className="attendance-page"><div className="attendance-header glass-panel"><div><h2>Event Attendance</h2><p className="text-secondary">Create an event before recording attendance.</p></div></div></div>;
  }

  const currentAttendance = attendance.filter(a => a.eventTitle === currentEvent.title);
  const presentCount = currentAttendance.filter(a => a.status === 'Present').length;
  const lateCount = currentAttendance.filter(a => a.status === 'Late').length;
  const totalChecked = presentCount + lateCount;
  const attendancePercent = currentEvent.capacity ? Math.round((totalChecked / currentEvent.capacity) * 100) : 0;

  const handleManualCheckIn = (e) => {
    e.preventDefault();
    if (!studentNameInput.trim()) return;

    markAttendance(studentNameInput.trim(), currentEvent.title, 'Present');
    setStudentNameInput('');
  };

  const handleSimulateQr = () => {
    setQrSimulating(true);
    setTimeout(() => {
      markAttendance('Simulated QR Student #' + Math.floor(Math.random() * 100), currentEvent.title, 'Present');
      setQrSimulating(false);
    }, 1000);
  };

  return (
    <div className="attendance-page">
      <div className="attendance-header glass-panel">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <UserCheck className="text-success" size={24}/> Event Attendance & QR Check-in System
          </h2>
          <p className="text-sm text-secondary mt-1">Scan student event badges, record attendance rates, and manage session logs.</p>
        </div>

        <div className="event-selector-box">
          <label className="text-xs text-muted font-bold block mb-1">SELECT EVENT</label>
          <select 
            className="event-select"
            value={selectedEventId}
            onChange={e => setSelectedEventId(e.target.value)}
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>{ev.title} ({ev.date})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="attendance-metrics-grid">
        <div className="att-card glass-panel">
          <div className="flex justify-between items-center mb-1">
            <span className="att-title">ATTENDANCE RATE</span>
            <BarChart2 className="text-success" size={20}/>
          </div>
          <div className="att-val">{attendancePercent}%</div>
          <span className="att-sub text-success">{totalChecked} / {currentEvent.capacity} Checked-in</span>
        </div>

        <div className="att-card glass-panel">
          <div className="flex justify-between items-center mb-1">
            <span className="att-title">PRESENT STUDENTS</span>
            <CheckCircle className="text-success" size={20}/>
          </div>
          <div className="att-val">{presentCount}</div>
          <span className="att-sub text-secondary">Verified On Time</span>
        </div>

        <div className="att-card glass-panel">
          <div className="flex justify-between items-center mb-1">
            <span className="att-title">LATE ARRIVALS</span>
            <Clock className="text-warning" size={20}/>
          </div>
          <div className="att-val">{lateCount}</div>
          <span className="att-sub text-warning">Checked after 15 mins</span>
        </div>
      </div>

      <div className="attendance-grid">
        {/* Left Column: QR Simulator & Quick Manual Check-In */}
        <div className="card glass-panel flex-col gap-4">
          <h3 className="section-title flex items-center gap-2">
            <QrCode className="text-accent" size={20}/> QR Scanner & Quick Check-in
          </h3>

          <div className="qr-scanner-box">
            <div className="qr-viewfinder">
              <QrCode size={64} className="qr-icon" />
              <div className="scan-line"></div>
            </div>

            <button 
              className={`btn ${qrSimulating ? 'btn-outline' : 'btn-primary'} w-full mt-3`}
              onClick={handleSimulateQr}
              disabled={qrSimulating}
            >
              {qrSimulating ? 'Scanning QR Code...' : 'Simulate QR Code Scan'}
            </button>
          </div>

          <div className="divider-or">OR MANUAL CHECK-IN</div>

          <form onSubmit={handleManualCheckIn} className="manual-check-in-form">
            <input 
              type="text" 
              placeholder="Enter Student Name or ID..."
              value={studentNameInput}
              onChange={e => setStudentNameInput(e.target.value)}
              className="check-in-input"
            />
            <button type="submit" className="btn btn-outline">
              <Plus size={16}/> Record
            </button>
          </form>
        </div>

        {/* Right Column: Attendance Log Table */}
        <div className="card glass-panel flex-col gap-4">
          <h3 className="section-title">Live Attendance Log ({currentAttendance.length})</h3>

          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>ID</th>
                  <th>Check-In Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {currentAttendance.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-muted">No attendance logs yet for this event.</td>
                  </tr>
                ) : (
                  currentAttendance.map(log => (
                    <tr key={log.id}>
                      <td className="font-semibold">{log.studentName}</td>
                      <td className="text-muted text-xs">{log.studentId}</td>
                      <td className="text-secondary text-sm">{log.checkInTime}</td>
                      <td>
                        <span className={`status-tag status-${log.status.toLowerCase()}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
