import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserPlus, Clock, CheckCircle, XCircle, Send, ShieldCheck, AlertCircle } from 'lucide-react';
import './Admissions.css';

export default function Admissions() {
  const { admissions, applyForClub, reviewAdmission } = useApp();
  const [activeTab, setActiveTab] = useState('MyApplications');

  // Form state for student applicant
  const [club, setClub] = useState('Cybersecurity Club');
  const [appliedRole, setAppliedRole] = useState('Ethical Hacker');
  const [experience, setExperience] = useState('Intermediate');
  const [motivation, setMotivation] = useState('');

  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!motivation.trim()) return;

    applyForClub({
      club,
      appliedRole,
      experience,
      motivation
    });

    setMotivation('');
    setActiveTab('MyApplications');
  };

  const getStatusPill = (status) => {
    switch (status) {
      case 'Approved': return <span className="status-pill status-implemented"><CheckCircle size={13}/> Approved</span>;
      case 'Rejected': return <span className="status-pill status-review"><XCircle size={13}/> Rejected</span>;
      case 'Interview Scheduled': return <span className="status-pill status-planned"><Clock size={13}/> Interview Scheduled</span>;
      default: return <span className="status-pill status-review"><AlertCircle size={13}/> Pending Review</span>;
    }
  };

  return (
    <div className="admissions-page">
      <div className="admissions-header glass-panel">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <UserPlus className="text-accent" size={24}/> Club Admissions & Membership Portal
          </h2>
          <p className="text-sm text-secondary mt-1">Apply for executive roles, track membership applications, and evaluate new recruits.</p>
        </div>

        <div className="tab-buttons">
          <button 
            className={`btn ${activeTab === 'Apply' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('Apply')}
          >
            Submit Application
          </button>
          <button 
            className={`btn ${activeTab === 'MyApplications' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('MyApplications')}
          >
            My Applications ({admissions.length})
          </button>
        </div>
      </div>

      {activeTab === 'Apply' && (
        <div className="card glass-panel max-w-2xl mx-auto">
          <h3 className="section-title mb-4">New Club Membership Application</h3>

          <form onSubmit={handleApplySubmit} className="modal-form">
            <div className="form-row">
              <div className="form-group">
                <label>Target Club</label>
                <select value={club} onChange={e => setClub(e.target.value)}>
                  <option>Cybersecurity Club</option>
                  <option>Robotics & Tech Club</option>
                  <option>AI Research Group</option>
                  <option>Debate Society</option>
                  <option>Design Guild</option>
                </select>
              </div>

              <div className="form-group">
                <label>Desired Role / Position</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Lead Developer, Marketing Officer"
                  value={appliedRole}
                  onChange={e => setAppliedRole(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Prior Experience Level</label>
              <select value={experience} onChange={e => setExperience(e.target.value)}>
                <option>Beginner (Enthusiast)</option>
                <option>Intermediate (Some Projects)</option>
                <option>Advanced (Proven Track Record)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Motivation Statement</label>
              <textarea 
                rows={4}
                required
                placeholder="Describe why you want to join this club and what skills you bring..."
                value={motivation}
                onChange={e => setMotivation(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary w-full mt-2">
              <Send size={16}/> Submit Application
            </button>
          </form>
        </div>
      )}

      {activeTab === 'MyApplications' && (
        <div className="admissions-grid">
          {admissions.map(app => (
            <div key={app.id} className="app-card glass-panel">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="app-applicant">{app.applicant}</h3>
                  <span className="app-club text-accent font-semibold text-sm">{app.club}</span>
                </div>
                {getStatusPill(app.status)}
              </div>

              <div className="app-details-grid my-3">
                <div className="detail-item">
                  <span className="detail-label">Role Applied:</span>
                  <span className="detail-val">{app.appliedRole}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Experience:</span>
                  <span className="detail-val">{app.experience}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Applied Date:</span>
                  <span className="detail-val">{app.appliedDate}</span>
                </div>
              </div>

              <div className="motivation-box">
                <span className="text-xs text-muted font-bold block mb-1">MOTIVATION:</span>
                <p className="text-xs text-secondary">"{app.motivation}"</p>
              </div>

              {app.status === 'Pending' && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-color">
                  <button 
                    className="btn btn-outline btn-sm w-full text-success"
                    onClick={() => reviewAdmission(app.id, 'Approved')}
                  >
                    Approve
                  </button>
                  <button 
                    className="btn btn-outline btn-sm w-full text-warning"
                    onClick={() => reviewAdmission(app.id, 'Interview Scheduled')}
                  >
                    Interview
                  </button>
                  <button 
                    className="btn btn-outline btn-sm w-full text-danger"
                    onClick={() => reviewAdmission(app.id, 'Rejected')}
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
