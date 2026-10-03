import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ShieldAlert, 
  Users, 
  CheckCircle, 
  XCircle, 
  Radio, 
  Settings, 
  Clock, 
  Activity, 
  DollarSign, 
  Send,
  X
} from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { admissions, reviewAdmission } = useApp();
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const pendingAdmissions = admissions.filter(a => a.status === 'Pending' || a.status === 'Interview Scheduled');

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    alert(`📢 Broadcast sent to all students: "${broadcastMessage}"`);
    setShowBroadcastModal(false);
    setBroadcastMessage('');
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header glass-panel">
        <div>
          <h2 className="flex items-center gap-2 text-white text-xl font-bold">
            <ShieldAlert className="text-accent" size={24}/> System Admin Command Center
          </h2>
          <p className="text-sm text-secondary mt-1">Platform management, club registration audit, and security controls.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            className={`btn ${maintenanceMode ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setMaintenanceMode(!maintenanceMode)}
          >
            <Settings size={16}/> {maintenanceMode ? 'Maintenance Mode ACTIVE' : 'System Normal'}
          </button>

          <button className="btn btn-primary" onClick={() => setShowBroadcastModal(true)}>
            <Radio size={16}/> Broadcast Notice
          </button>
        </div>
      </div>

      {/* Overview Cards Grid */}
      <div className="admin-metrics-grid">
        <div className="admin-metric-card glass-panel">
          <div className="flex justify-between items-center mb-2">
            <span className="metric-label">TOTAL SCHOOL CLUBS</span>
            <Users className="text-accent" size={20} />
          </div>
          <div className="metric-num">42</div>
          <span className="metric-note text-success">+3 Active this month</span>
        </div>

        <div className="admin-metric-card glass-panel">
          <div className="flex justify-between items-center mb-2">
            <span className="metric-label">PENDING ADMISSIONS</span>
            <Clock className="text-warning" size={20} />
          </div>
          <div className="metric-num">{pendingAdmissions.length}</div>
          <span className="metric-note text-warning">Requires Leader Review</span>
        </div>

        <div className="admin-metric-card glass-panel">
          <div className="flex justify-between items-center mb-2">
            <span className="metric-label">SYSTEM UPTIME</span>
            <Activity className="text-success" size={20} />
          </div>
          <div className="metric-num">99.9%</div>
          <span className="metric-note text-success">Optimal Performance</span>
        </div>

        <div className="admin-metric-card glass-panel">
          <div className="flex justify-between items-center mb-2">
            <span className="metric-label">SEMESTER CLUB BUDGET</span>
            <DollarSign className="text-warning" size={20} />
          </div>
          <div className="metric-num">$18,400</div>
          <span className="metric-note text-secondary">68% Allocated</span>
        </div>
      </div>

      <div className="admin-grid">
        {/* Pending Club Applications Audit */}
        <div className="card glass-panel flex-col gap-4">
          <h3 className="section-title flex items-center justify-between">
            <span>Pending Club Admission Applications</span>
            <span className="badge">{pendingAdmissions.length} Pending</span>
          </h3>

          <div className="admissions-audit-list">
            {pendingAdmissions.length === 0 ? (
              <div className="empty-notice">No pending application requests to review.</div>
            ) : (
              pendingAdmissions.map(adm => (
                <div key={adm.id} className="audit-item">
                  <div className="audit-details">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="applicant-name">{adm.applicant}</h4>
                      <span className="applied-club-tag">{adm.club}</span>
                    </div>
                    <p className="applied-role-text">Applying for: <strong>{adm.appliedRole}</strong></p>
                    <p className="motivation-preview">"{adm.motivation}"</p>
                  </div>

                  <div className="audit-actions">
                    <button 
                      className="btn btn-outline btn-sm text-success border-success"
                      onClick={() => reviewAdmission(adm.id, 'Approved')}
                    >
                      <CheckCircle size={14}/> Approve
                    </button>
                    <button 
                      className="btn btn-outline btn-sm text-danger border-danger"
                      onClick={() => reviewAdmission(adm.id, 'Rejected')}
                    >
                      <XCircle size={14}/> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* System Activity & Logs Panel */}
        <div className="card glass-panel flex-col gap-4">
          <h3 className="section-title">System Audit Log & Quick Tools</h3>

          <div className="logs-list">
            <div className="log-entry">
              <span className="log-time">10:42 AM</span>
              <span className="log-text">Admin updated permissions for <strong>Robotics Club</strong>.</span>
            </div>
            <div className="log-entry">
              <span className="log-time">09:15 AM</span>
              <span className="log-text">Room 101 auto-scheduled for <strong>AI Workshop</strong>.</span>
            </div>
            <div className="log-entry">
              <span className="log-time">Yesterday</span>
              <span className="log-text">Budget request of $450 approved for <strong>Debate League</strong>.</span>
            </div>
          </div>

          <div className="quick-admin-actions mt-4">
            <button className="btn btn-outline w-full" onClick={() => alert('Exporting system report CSV...')}>
              Download Semester Audit Report (.CSV)
            </button>
          </div>
        </div>
      </div>

      {/* Broadcast Modal */}
      {showBroadcastModal && (
        <div className="modal-overlay" onClick={() => setShowBroadcastModal(false)}>
          <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Broadcast System Announcement</h3>
              <button className="icon-btn" onClick={() => setShowBroadcastModal(false)}><X size={18}/></button>
            </div>

            <form onSubmit={handleBroadcast} className="modal-form">
              <div className="form-group">
                <label>Announcement Message</label>
                <textarea 
                  rows={4}
                  required
                  placeholder="e.g. Midterm Club Registration closes this Friday at 5:00 PM!"
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowBroadcastModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><Send size={16}/> Send Broadcast</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
