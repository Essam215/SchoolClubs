import React from 'react';
import { useApp } from '../context/AppContext';
import { Users, Clock, Calendar as CalendarIcon, Activity, BarChart2, PieChart, ArrowUpRight, Zap, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
  const { events, tasks, admissions, user } = useApp();
  const navigate = useNavigate();

  const pendingCount = admissions.filter(a => a.status === 'Pending').length;
  const activeEventsCount = events.filter(e => e.status === 'Upcoming').length;

  return (
    <div className="dashboard">
      {/* Top Metrics Banner */}
      <div className="metrics-grid">
        <div className="metric-card glass-panel cursor-pointer" onClick={() => navigate('/admissions')}>
          <div className="metric-header">
            <h3 className="metric-title">TOTAL CLUBS</h3>
            <Users className="metric-icon text-accent" size={24} />
          </div>
          <div className="metric-value">42</div>
          <div className="metric-subtitle">
            <span className="text-success">+3 New</span> this semester
          </div>
        </div>
        
        <div className="metric-card glass-panel cursor-pointer" onClick={() => navigate('/gamification')}>
          <div className="metric-header">
            <h3 className="metric-title">ACTIVE MEMBERS</h3>
            <Activity className="metric-icon text-accent" size={24} />
          </div>
          <div className="metric-value">1,204</div>
          <div className="metric-subtitle">
            <span className="text-success">98% Engagement</span> rate
          </div>
        </div>
        
        <div className="metric-card glass-panel cursor-pointer" onClick={() => navigate('/events')}>
          <div className="metric-header">
            <h3 className="metric-title">UPCOMING EVENTS</h3>
            <CalendarIcon className="metric-icon text-warning" size={24} />
          </div>
          <div className="metric-value">{activeEventsCount}</div>
          <div className="metric-subtitle">
            <span className="text-warning">2 Ongoing</span> this week
          </div>
        </div>
        
        <div className="metric-card glass-panel cursor-pointer" onClick={() => navigate('/admin')}>
          <div className="metric-header">
            <h3 className="metric-title">PENDING REQUESTS</h3>
            <Clock className="metric-icon text-danger" size={24} />
          </div>
          <div className="metric-value">{pendingCount}</div>
          <div className="metric-subtitle">
            <span className="text-danger">Action Required</span>
          </div>
        </div>
      </div>

      {/* Visual Charts Section (Statistics) */}
      <div className="charts-grid">
        {/* SVG Bar Chart: Monthly Events */}
        <div className="card glass-panel flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="panel-title flex items-center gap-2">
              <BarChart2 className="text-accent" size={20}/> Monthly Event & Activity Distribution
            </h3>
            <span className="text-xs text-muted">Fall Semester 2026</span>
          </div>

          <div className="bar-chart-container">
            <svg className="bar-chart-svg" viewBox="0 0 400 160">
              {/* Grid Lines */}
              <line x1="40" y1="20" x2="380" y2="20" stroke="var(--border-color)" strokeDasharray="3 3"/>
              <line x1="40" y1="60" x2="380" y2="60" stroke="var(--border-color)" strokeDasharray="3 3"/>
              <line x1="40" y1="100" x2="380" y2="100" stroke="var(--border-color)" strokeDasharray="3 3"/>
              <line x1="40" y1="140" x2="380" y2="140" stroke="var(--border-color)"/>

              {/* Bars */}
              {/* Sept */}
              <rect x="65" y="50" width="30" height="90" rx="4" fill="url(#barGrad1)" />
              <text x="80" y="155" fill="var(--text-muted)" fontSize="11" textAnchor="middle">SEP</text>
              <text x="80" y="42" fill="var(--text-primary)" fontSize="11" textAnchor="middle" fontWeight="bold">18</text>

              {/* Oct (Peak) */}
              <rect x="145" y="30" width="30" height="110" rx="4" fill="url(#barGrad2)" />
              <text x="160" y="155" fill="var(--text-muted)" fontSize="11" textAnchor="middle">OCT</text>
              <text x="160" y="22" fill="var(--primary-accent)" fontSize="11" textAnchor="middle" fontWeight="bold">24</text>

              {/* Nov */}
              <rect x="225" y="70" width="30" height="70" rx="4" fill="url(#barGrad1)" />
              <text x="240" y="155" fill="var(--text-muted)" fontSize="11" textAnchor="middle">NOV</text>
              <text x="240" y="62" fill="var(--text-primary)" fontSize="11" textAnchor="middle" fontWeight="bold">14</text>

              {/* Dec */}
              <rect x="305" y="90" width="30" height="50" rx="4" fill="url(#barGrad1)" />
              <text x="320" y="155" fill="var(--text-muted)" fontSize="11" textAnchor="middle">DEC</text>
              <text x="320" y="82" fill="var(--text-primary)" fontSize="11" textAnchor="middle" fontWeight="bold">10</text>

              <defs>
                <linearGradient id="barGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <linearGradient id="barGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#e51e25" />
                  <stop offset="100%" stopColor="#881337" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* SVG Donut Chart: Club Categories */}
        <div className="card glass-panel flex-col gap-4">
          <div className="flex justify-between items-center">
            <h3 className="panel-title flex items-center gap-2">
              <PieChart className="text-warning" size={20}/> Club Category Breakdown
            </h3>
          </div>

          <div className="donut-chart-container">
            <svg className="donut-chart-svg" viewBox="0 0 160 160">
              <circle cx="80" cy="80" r="55" fill="none" stroke="var(--bg-card)" strokeWidth="24" />
              {/* Tech 45% */}
              <circle cx="80" cy="80" r="55" fill="none" stroke="var(--primary-accent)" strokeWidth="24" strokeDasharray="155 345" strokeDashoffset="0" />
              {/* Arts/Design 30% */}
              <circle cx="80" cy="80" r="55" fill="none" stroke="#f59e0b" strokeWidth="24" strokeDasharray="103 345" strokeDashoffset="-155" />
              {/* Debate/Social 25% */}
              <circle cx="80" cy="80" r="55" fill="none" stroke="#10b981" strokeWidth="24" strokeDasharray="86 345" strokeDashoffset="-258" />
              <text x="80" y="85" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold">42 Clubs</text>
            </svg>

            <div className="chart-legend flex-col gap-2">
              <div className="legend-item"><span className="legend-dot bg-accent"></span> Tech & Robotics (45%)</div>
              <div className="legend-item"><span className="legend-dot bg-warning"></span> Arts & Design (30%)</div>
              <div className="legend-item"><span className="legend-dot bg-success"></span> Debate & Governance (25%)</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="dashboard-content">
        <div className="main-panel glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">System Activity Stream</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/events')}>View All Events</button>
          </div>
          <div className="panel-body">
            <div className="activity-list">
              {events.map(ev => (
                <div key={ev.id} className="activity-item">
                  <div className="activity-icon flex items-center justify-center text-accent">
                    <Zap size={16}/>
                  </div>
                  <div className="activity-details flex-1">
                    <p className="activity-text"><strong>{ev.club}</strong> posted event: <strong>{ev.title}</strong></p>
                    <span className="activity-time">{ev.date} | {ev.location}</span>
                  </div>
                  <button className="icon-btn" onClick={() => navigate('/events')}><ArrowUpRight size={16}/></button>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="side-panel glass-panel">
          <div className="panel-header">
            <h3 className="panel-title">Quick Command Actions</h3>
          </div>
          <div className="panel-body flex-col gap-3">
            <button className="btn btn-primary w-full" onClick={() => navigate('/admissions')}>Review Admissions</button>
            <button className="btn btn-outline w-full" onClick={() => navigate('/events')}>Schedule New Event</button>
            <button className="btn btn-outline w-full" onClick={() => navigate('/attendance')}>QR Attendance Scanner</button>
            <button className="btn btn-outline w-full" onClick={() => navigate('/resources')}>Resource Library Drive</button>
          </div>
        </div>
      </div>
    </div>
  );
}
