import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Send, 
  ShieldCheck, 
  AlertCircle, 
  Search, 
  Filter, 
  Sparkles, 
  Calendar, 
  Briefcase, 
  FileText, 
  ChevronRight, 
  Trash2, 
  MessageSquare, 
  Users,
  Check,
  X,
  ExternalLink
} from 'lucide-react';
import './Admissions.css';

export default function Admissions() {
  const { 
    user, 
    clubs, 
    admissions, 
    applyForClub, 
    withdrawApplication, 
    reviewAdmission 
  } = useApp();

  const navigate = useNavigate();

  // Tab State: 'Apply', 'Status', 'Review'
  const [activeTab, setActiveTab] = useState('Status');

  // Apply Form State
  const defaultClub = clubs.length > 0 ? clubs[0].name : 'Robotics & Tech Club';
  const [selectedClub, setSelectedClub] = useState(defaultClub);
  const [appliedRole, setAppliedRole] = useState('Member');
  const [customRole, setCustomRole] = useState('');
  const [experience, setExperience] = useState('Intermediate');
  const [motivation, setMotivation] = useState('');
  const [skillsInput, setSkillsInput] = useState(user.skills.slice(0, 3).join(', '));
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [showSubmitSuccess, setShowSubmitSuccess] = useState(false);

  // Status Filter State
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Review (Admin/Leader) Filter State
  const [reviewClubFilter, setReviewClubFilter] = useState('All');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('All');
  const [reviewSearchQuery, setReviewSearchQuery] = useState('');

  // Review Feedback Modal State
  const [decisionModal, setDecisionModal] = useState({
    isOpen: false,
    admissionId: null,
    applicantName: '',
    clubName: '',
    actionType: 'Approved', // 'Approved', 'Rejected', 'Interview Scheduled'
    feedbackNotes: ''
  });

  // Calculate stats
  const myApplications = admissions.filter(
    a => a.applicant.toLowerCase() === user.name.toLowerCase()
  );

  const pendingCount = myApplications.filter(a => a.status === 'Pending').length;
  const approvedCount = myApplications.filter(a => a.status === 'Approved').length;
  const interviewCount = myApplications.filter(a => a.status === 'Interview Scheduled').length;
  const rejectedCount = myApplications.filter(a => a.status === 'Rejected').length;

  const totalAdminPending = admissions.filter(a => a.status === 'Pending').length;

  // Check if currently selected club in Apply form is already joined
  const isAlreadyMember = user.joinedClubs.some(
    jc => jc.name.toLowerCase() === selectedClub.toLowerCase()
  );
  const hasPendingApp = myApplications.some(
    a => a.club.toLowerCase() === selectedClub.toLowerCase() && a.status === 'Pending'
  );

  const targetClubObj = clubs.find(c => c.name.toLowerCase() === selectedClub.toLowerCase());

  // Handle Submit Application
  const handleApplySubmit = (e) => {
    e.preventDefault();
    if (!motivation.trim() || isAlreadyMember || hasPendingApp) return;

    const finalRole = appliedRole === 'Custom' ? (customRole || 'Member') : appliedRole;

    applyForClub({
      club: selectedClub,
      appliedRole: finalRole,
      experience,
      skills: skillsInput,
      portfolioUrl: portfolioUrl.trim(),
      motivation: motivation.trim()
    });

    setShowSubmitSuccess(true);
    setMotivation('');
    setTimeout(() => {
      setShowSubmitSuccess(false);
      setActiveTab('Status');
    }, 1200);
  };

  // Open Decision Modal for Leader
  const openDecisionModal = (admission, actionType) => {
    const defaultFeedback = 
      actionType === 'Approved' ? 'Application officially accepted! Welcome aboard.' :
      actionType === 'Rejected' ? 'We were unable to offer a position in this cohort due to limited slots.' :
      'Interview scheduled. We will send a calendar invitation to your email.';

    setDecisionModal({
      isOpen: true,
      admissionId: admission.id,
      applicantName: admission.applicant,
      clubName: admission.club,
      actionType,
      feedbackNotes: defaultFeedback
    });
  };

  const confirmDecision = () => {
    if (!decisionModal.admissionId) return;
    reviewAdmission(
      decisionModal.admissionId,
      decisionModal.actionType,
      decisionModal.feedbackNotes
    );
    setDecisionModal({ isOpen: false, admissionId: null, applicantName: '', clubName: '', actionType: 'Approved', feedbackNotes: '' });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="status-badge approved"><CheckCircle size={14}/> Approved / Accepted</span>;
      case 'Rejected':
        return <span className="status-badge rejected"><XCircle size={14}/> Rejected</span>;
      case 'Interview Scheduled':
        return <span className="status-badge interview"><Clock size={14}/> Interview Scheduled</span>;
      default:
        return <span className="status-badge pending"><AlertCircle size={14}/> Pending Review</span>;
    }
  };

  // Filtered lists
  const filteredMyApplications = myApplications.filter(app => {
    const matchStatus = statusFilter === 'All' || app.status === statusFilter;
    const matchSearch = 
      app.club.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.appliedRole.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const filteredReviewAdmissions = admissions.filter(app => {
    const matchClub = reviewClubFilter === 'All' || app.club === reviewClubFilter;
    const matchStatus = reviewStatusFilter === 'All' || app.status === reviewStatusFilter;
    const matchSearch = 
      app.applicant.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
      app.appliedRole.toLowerCase().includes(reviewSearchQuery.toLowerCase()) ||
      (app.skills && app.skills.toLowerCase().includes(reviewSearchQuery.toLowerCase()));
    return matchClub && matchStatus && matchSearch;
  });

  return (
    <div className="admissions-page">
      {/* Admissions Header */}
      <div className="admissions-header glass-panel">
        <div className="header-info">
          <div className="flex items-center gap-2">
            <div className="header-icon-wrap">
              <UserPlus size={22} className="text-accent" />
            </div>
            <div>
              <h1 className="header-title">Club Admissions & Recruitment Portal</h1>
              <p className="header-subtitle">
                Apply for club positions, track application statuses, and manage recruit reviews.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="admissions-tabs-nav">
          <button 
            id="tab-apply"
            className={`tab-btn ${activeTab === 'Apply' ? 'active' : ''}`}
            onClick={() => setActiveTab('Apply')}
          >
            <Sparkles size={16}/> Apply to Join a Club
          </button>
          
          <button 
            id="tab-status"
            className={`tab-btn ${activeTab === 'Status' ? 'active' : ''}`}
            onClick={() => setActiveTab('Status')}
          >
            <Clock size={16}/> Application Status ({myApplications.length})
          </button>

          <button 
            id="tab-review"
            className={`tab-btn ${activeTab === 'Review' ? 'active' : ''}`}
            onClick={() => setActiveTab('Review')}
          >
            <ShieldCheck size={16}/> Accept / Reject Applicants 
            {totalAdminPending > 0 && <span className="tab-counter">{totalAdminPending}</span>}
          </button>
        </div>
      </div>

      {/* TAB 1: APPLY TO JOIN A CLUB */}
      {activeTab === 'Apply' && (
        <div className="apply-section max-w-4xl mx-auto">
          <div className="card glass-panel">
            <div className="form-header-bar">
              <div>
                <h2 className="section-title flex items-center gap-2">
                  <UserPlus className="text-accent" size={20} />
                  Submit New Club Membership Application
                </h2>
                <p className="text-sm text-secondary mt-1">
                  Connect with student organizations, expand your portfolio, and gain practical leadership.
                </p>
              </div>
              <div className="xp-reward-pill">
                <Sparkles size={14}/> +50 XP Reward on Submission
              </div>
            </div>

            {/* Applicant Profile Summary Box */}
            <div className="applicant-profile-strip">
              <img src={user.avatar} alt={user.name} className="applicant-thumb" />
              <div className="applicant-text">
                <div className="font-semibold text-white">{user.name} <span className="text-xs text-secondary font-normal">({user.studentId || 'STU-2024'})</span></div>
                <div className="text-xs text-secondary">{user.email} • {user.major}</div>
              </div>
              <div className="applicant-status-note">
                <CheckCircle size={14} className="text-success" /> Auto-verified Student Credentials
              </div>
            </div>

            {showSubmitSuccess && (
              <div className="alert-success-banner">
                <CheckCircle size={20}/>
                <div>
                  <strong>Application Submitted Successfully!</strong>
                  <p className="text-xs">Your request has been queued for review by the club committee. (+50 XP awarded)</p>
                </div>
              </div>
            )}

            <form onSubmit={handleApplySubmit} className="admissions-form">
              {/* Club Selector & Status Warning */}
              <div className="form-group">
                <label className="form-label">Select School Club</label>
                <div className="club-picker-row">
                  <select 
                    id="club-select"
                    className="select-input"
                    value={selectedClub} 
                    onChange={e => setSelectedClub(e.target.value)}
                  >
                    {clubs.map(c => (
                      <option key={c.id} value={c.name}>
                        {c.icon} {c.name} ({c.category})
                      </option>
                    ))}
                  </select>
                </div>

                {targetClubObj && (
                  <div className="club-preview-meta">
                    <span className="meta-pill">👥 {targetClubObj.membersCount} Members</span>
                    <span className="meta-pill">📍 {targetClubObj.room}</span>
                    <span className="meta-pill">🕒 {targetClubObj.meetingSchedule}</span>
                  </div>
                )}

                {isAlreadyMember && (
                  <div className="warning-box">
                    <AlertCircle size={16}/> You are already an enrolled member of <strong>{selectedClub}</strong>.
                  </div>
                )}

                {hasPendingApp && (
                  <div className="warning-box">
                    <Clock size={16}/> You already have a pending application for <strong>{selectedClub}</strong>.
                  </div>
                )}
              </div>

              {/* Desired Role */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Desired Role / Position</label>
                  <select 
                    id="role-select"
                    className="select-input"
                    value={appliedRole} 
                    onChange={e => setAppliedRole(e.target.value)}
                  >
                    <option value="Active Member">Active Member</option>
                    <option value="Lead Developer">Lead Developer</option>
                    <option value="Hardware Specialist">Hardware Specialist</option>
                    <option value="Event Coordinator">Event Coordinator</option>
                    <option value="Marketing & Outreach">Marketing & Outreach</option>
                    <option value="Design & Media Lead">Design & Media Lead</option>
                    <option value="Custom">Custom Role...</option>
                  </select>

                  {appliedRole === 'Custom' && (
                    <input 
                      type="text" 
                      className="text-input mt-2" 
                      placeholder="Enter custom role title..." 
                      value={customRole}
                      onChange={e => setCustomRole(e.target.value)}
                      required
                    />
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">Prior Experience Level</label>
                  <select 
                    id="experience-select"
                    className="select-input"
                    value={experience} 
                    onChange={e => setExperience(e.target.value)}
                  >
                    <option value="Beginner">Beginner (Enthusiastic to learn)</option>
                    <option value="Intermediate">Intermediate (Project experience)</option>
                    <option value="Advanced">Advanced (Proven track record)</option>
                    <option value="Leadership">Prior Club Leadership Experience</option>
                  </select>
                </div>
              </div>

              {/* Skills relevant */}
              <div className="form-group">
                <label className="form-label">Relevant Skills & Technologies</label>
                <input 
                  id="skills-input"
                  type="text" 
                  className="text-input"
                  placeholder="e.g. Python, UI Design, Public Speaking, Circuitry..."
                  value={skillsInput}
                  onChange={e => setSkillsInput(e.target.value)}
                />
                <span className="text-xs text-muted mt-1 block">
                  Click your profile skills to add:
                </span>
                <div className="quick-skills-bar">
                  {user.skills.map(skill => (
                    <button 
                      type="button" 
                      key={skill} 
                      className="chip-btn"
                      onClick={() => {
                        if (!skillsInput.includes(skill)) {
                          setSkillsInput(prev => prev ? `${prev}, ${skill}` : skill);
                        }
                      }}
                    >
                      + {skill}
                    </button>
                  ))}
                </div>
              </div>

              {/* Portfolio Link */}
              <div className="form-group">
                <label className="form-label">Portfolio, GitHub, or LinkedIn URL (Optional)</label>
                <input 
                  type="url" 
                  className="text-input"
                  placeholder="https://github.com/yourhandle or portfolio link"
                  value={portfolioUrl}
                  onChange={e => setPortfolioUrl(e.target.value)}
                />
              </div>

              {/* Motivation Statement */}
              <div className="form-group">
                <div className="flex justify-between items-center mb-1">
                  <label className="form-label mb-0">Motivation Statement & Goals</label>
                  <span className="text-xs text-muted">{motivation.length}/500 chars</span>
                </div>
                <textarea 
                  id="motivation-input"
                  rows={4}
                  required
                  maxLength={500}
                  className="textarea-input"
                  placeholder="Describe why you want to join this club, what projects you hope to work on, and how you will contribute..."
                  value={motivation}
                  onChange={e => setMotivation(e.target.value)}
                />
              </div>

              <div className="form-actions">
                <button 
                  id="submit-application-btn"
                  type="submit" 
                  className="btn btn-primary w-full py-3 text-base flex justify-center items-center gap-2"
                  disabled={isAlreadyMember || hasPendingApp || !motivation.trim()}
                >
                  <Send size={18}/> Submit Club Application (+50 XP)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB 2: APPLICATION STATUS (STUDENT VIEW) */}
      {activeTab === 'Status' && (
        <div className="status-section">
          {/* Status Metrics Bar */}
          <div className="status-stats-grid">
            <div className="stat-card glass-panel" onClick={() => setStatusFilter('All')}>
              <div className="stat-label">TOTAL APPLICATIONS</div>
              <div className="stat-val">{myApplications.length}</div>
            </div>
            <div className="stat-card glass-panel warning" onClick={() => setStatusFilter('Pending')}>
              <div className="stat-label">PENDING REVIEW</div>
              <div className="stat-val text-warning">{pendingCount}</div>
            </div>
            <div className="stat-card glass-panel primary" onClick={() => setStatusFilter('Interview Scheduled')}>
              <div className="stat-label">INTERVIEWS</div>
              <div className="stat-val text-accent">{interviewCount}</div>
            </div>
            <div className="stat-card glass-panel success" onClick={() => setStatusFilter('Approved')}>
              <div className="stat-label">ACCEPTED</div>
              <div className="stat-val text-success">{approvedCount}</div>
            </div>
          </div>

          {/* Filter & Search Bar */}
          <div className="filter-controls-bar glass-panel">
            <div className="status-filter-pills">
              {['All', 'Pending', 'Interview Scheduled', 'Approved', 'Rejected'].map(s => (
                <button 
                  key={s}
                  className={`filter-pill ${statusFilter === s ? 'active' : ''}`}
                  onClick={() => setStatusFilter(s)}
                >
                  {s === 'All' ? 'All Applications' : s}
                </button>
              ))}
            </div>

            <div className="search-box-wrap">
              <Search size={16} className="search-icon"/>
              <input 
                type="text" 
                className="search-filter-input"
                placeholder="Search club or role..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Applications Grid */}
          {filteredMyApplications.length === 0 ? (
            <div className="empty-state-card glass-panel">
              <FileText size={48} className="text-muted mb-2"/>
              <h3 className="text-lg font-bold">No applications found</h3>
              <p className="text-sm text-secondary mt-1">
                {myApplications.length === 0 
                  ? "You haven't submitted any club applications yet." 
                  : "No applications match your selected filter."}
              </p>
              {myApplications.length === 0 && (
                <button 
                  className="btn btn-primary mt-4"
                  onClick={() => setActiveTab('Apply')}
                >
                  <Sparkles size={16}/> Apply for a Club Now
                </button>
              )}
            </div>
          ) : (
            <div className="status-grid">
              {filteredMyApplications.map(app => {
                const clubObj = clubs.find(c => c.name.toLowerCase() === app.club.toLowerCase());
                
                // Stepper index
                const stepIndex = 
                  app.status === 'Pending' ? 1 :
                  app.status === 'Interview Scheduled' ? 2 :
                  3;

                return (
                  <div key={app.id} className="status-card glass-panel" id={`app-card-${app.id}`}>
                    <div className="status-card-header">
                      <div className="flex items-center gap-3">
                        <div className="club-avatar-circle">
                          {clubObj ? clubObj.icon : '🏛️'}
                        </div>
                        <div>
                          <h3 className="status-club-title">{app.club}</h3>
                          <span className="status-role-title text-accent font-semibold text-sm">
                            Role: {app.appliedRole}
                          </span>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(app.status)}
                      </div>
                    </div>

                    {/* Status Progress Stepper */}
                    <div className="stepper-wrap">
                      <div className="stepper-track">
                        <div 
                          className="stepper-progress"
                          style={{
                            width: 
                              app.status === 'Pending' ? '33%' :
                              app.status === 'Interview Scheduled' ? '66%' :
                              '100%'
                          }}
                        ></div>
                      </div>
                      <div className="stepper-steps">
                        <div className={`step-item ${stepIndex >= 0 ? 'completed' : ''}`}>
                          <div className="step-dot"><Check size={10}/></div>
                          <span className="step-label">Submitted</span>
                        </div>
                        <div className={`step-item ${stepIndex >= 1 ? 'completed active-glow' : ''}`}>
                          <div className="step-dot">2</div>
                          <span className="step-label">Review</span>
                        </div>
                        <div className={`step-item ${stepIndex >= 2 ? 'completed active-glow' : ''}`}>
                          <div className="step-dot">3</div>
                          <span className="step-label">Interview</span>
                        </div>
                        <div className={`step-item ${stepIndex >= 3 ? (app.status === 'Approved' ? 'completed success-step' : 'completed rejected-step') : ''}`}>
                          <div className="step-dot">{app.status === 'Approved' ? <Check size={10}/> : '4'}</div>
                          <span className="step-label">Decision</span>
                        </div>
                      </div>
                    </div>

                    {/* Details Box */}
                    <div className="app-info-grid">
                      <div className="info-row">
                        <span className="info-key">Date Applied:</span>
                        <span className="info-val">{app.appliedDate}</span>
                      </div>
                      <div className="info-row">
                        <span className="info-key">Experience Level:</span>
                        <span className="info-val">{app.experience}</span>
                      </div>
                      {app.skills && (
                        <div className="info-row">
                          <span className="info-key">Skills Listed:</span>
                          <span className="info-val">{app.skills}</span>
                        </div>
                      )}
                    </div>

                    {/* Motivation Statement */}
                    <div className="motivation-quote-box">
                      <span className="quote-label">MOTIVATION:</span>
                      <p className="quote-text">"{app.motivation}"</p>
                    </div>

                    {/* Official Reviewer Feedback */}
                    <div className={`feedback-banner ${app.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      <div className="flex items-start gap-2">
                        <MessageSquare size={14} className="mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="text-xs font-bold block uppercase tracking-wide">
                            {app.status === 'Approved' ? 'Admission Acceptance Note:' : 
                             app.status === 'Interview Scheduled' ? 'Interview Details:' : 
                             app.status === 'Rejected' ? 'Review Decision Note:' : 
                             'Review Status Note:'}
                          </span>
                          <p className="text-xs mt-0.5">
                            {app.feedbackNotes || 'Your application is actively under review by club directors.'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="status-card-actions">
                      {app.status === 'Pending' && (
                        <button 
                          className="btn btn-outline btn-sm text-danger border-danger flex items-center gap-1"
                          onClick={() => {
                            if (window.confirm(`Withdraw application to ${app.club}?`)) {
                              withdrawApplication(app.id);
                            }
                          }}
                        >
                          <Trash2 size={14}/> Withdraw Application
                        </button>
                      )}

                      {app.status === 'Approved' && (
                        <button 
                          className="btn btn-primary btn-sm flex items-center gap-1"
                          onClick={() => navigate('/profile')}
                        >
                          <Users size={14}/> View Enrolled Club in Profile
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ACCEPT / REJECT APPLICANTS (LEADER / ADMIN VIEW) */}
      {activeTab === 'Review' && (
        <div className="review-section">
          <div className="review-filter-header glass-panel">
            <div className="flex items-center gap-2">
              <ShieldCheck className="text-accent" size={20} />
              <div>
                <h3 className="font-bold text-base text-white">Club Applicant Review & Decision Portal</h3>
                <p className="text-xs text-secondary">Accept, reject, or schedule interviews for prospective members.</p>
              </div>
            </div>

            <div className="review-filters-row">
              {/* Club Filter */}
              <div className="filter-select-group">
                <label className="text-xs text-muted">Filter by Club:</label>
                <select 
                  id="review-club-filter"
                  className="select-input select-sm"
                  value={reviewClubFilter}
                  onChange={e => setReviewClubFilter(e.target.value)}
                >
                  <option value="All">All Clubs ({admissions.length})</option>
                  {clubs.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div className="filter-select-group">
                <label className="text-xs text-muted">Filter by Status:</label>
                <select 
                  id="review-status-filter"
                  className="select-input select-sm"
                  value={reviewStatusFilter}
                  onChange={e => setReviewStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Interview Scheduled">Interview Scheduled</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>

              {/* Search */}
              <div className="search-box-wrap mt-auto">
                <Search size={14} className="search-icon"/>
                <input 
                  type="text" 
                  className="search-filter-input"
                  placeholder="Search applicant name..."
                  value={reviewSearchQuery}
                  onChange={e => setReviewSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Applicants Review Grid */}
          {filteredReviewAdmissions.length === 0 ? (
            <div className="empty-state-card glass-panel">
              <Users size={48} className="text-muted mb-2"/>
              <h3 className="text-lg font-bold">No applicants found</h3>
              <p className="text-sm text-secondary mt-1">No applications match your selected criteria.</p>
            </div>
          ) : (
            <div className="review-applicants-grid">
              {filteredReviewAdmissions.map(adm => {
                return (
                  <div key={adm.id} className="applicant-review-card glass-panel" id={`review-card-${adm.id}`}>
                    <div className="review-card-top">
                      <div className="flex items-center gap-3">
                        <img 
                          src={adm.applicantAvatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"} 
                          alt={adm.applicant} 
                          className="applicant-avatar-lg"
                        />
                        <div>
                          <h4 className="applicant-name-text">{adm.applicant}</h4>
                          <span className="applicant-major-text">{adm.applicantMajor || 'Student'} • {adm.applicantStudentId || 'ST-9000'}</span>
                        </div>
                      </div>
                      <div>
                        {getStatusBadge(adm.status)}
                      </div>
                    </div>

                    <div className="applied-for-banner">
                      <span className="text-muted text-xs">Applying to:</span>
                      <strong className="text-accent text-sm ml-1">{adm.club}</strong>
                      <span className="mx-2">•</span>
                      <span className="text-xs text-white">Role: <strong>{adm.appliedRole}</strong></span>
                    </div>

                    <div className="review-meta-list">
                      <div className="meta-row">
                        <span className="meta-k">Experience:</span>
                        <span className="meta-v">{adm.experience}</span>
                      </div>
                      <div className="meta-row">
                        <span className="meta-k">Date Applied:</span>
                        <span className="meta-v">{adm.appliedDate}</span>
                      </div>
                      {adm.skills && (
                        <div className="meta-row">
                          <span className="meta-k">Skills:</span>
                          <span className="meta-v text-accent">{adm.skills}</span>
                        </div>
                      )}
                    </div>

                    <div className="motivation-statement-box">
                      <span className="text-xs font-bold text-muted block mb-1">CANDIDATE MOTIVATION:</span>
                      <p className="text-xs text-secondary leading-relaxed">"{adm.motivation}"</p>
                    </div>

                    {adm.feedbackNotes && (
                      <div className="existing-feedback-box">
                        <span className="text-xs font-bold block mb-0.5">CURRENT NOTES:</span>
                        <p className="text-xs">{adm.feedbackNotes}</p>
                      </div>
                    )}

                    {/* Action Decision Buttons */}
                    <div className="review-actions-bar">
                      <button 
                        id={`btn-approve-${adm.id}`}
                        className={`btn btn-sm flex-1 ${adm.status === 'Approved' ? 'btn-success-filled' : 'btn-outline text-success border-success'}`}
                        onClick={() => openDecisionModal(adm, 'Approved')}
                        title="Accept applicant into club"
                      >
                        <CheckCircle size={14}/> {adm.status === 'Approved' ? 'Accepted' : 'Accept / Approve'}
                      </button>

                      <button 
                        id={`btn-interview-${adm.id}`}
                        className={`btn btn-sm flex-1 ${adm.status === 'Interview Scheduled' ? 'btn-warning-filled' : 'btn-outline text-warning border-warning'}`}
                        onClick={() => openDecisionModal(adm, 'Interview Scheduled')}
                        title="Schedule interview"
                      >
                        <Clock size={14}/> Interview
                      </button>

                      <button 
                        id={`btn-reject-${adm.id}`}
                        className={`btn btn-sm flex-1 ${adm.status === 'Rejected' ? 'btn-danger-filled' : 'btn-outline text-danger border-danger'}`}
                        onClick={() => openDecisionModal(adm, 'Rejected')}
                        title="Reject applicant"
                      >
                        <XCircle size={14}/> {adm.status === 'Rejected' ? 'Rejected' : 'Reject'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Decision Confirmation & Feedback Modal */}
      {decisionModal.isOpen && (
        <div className="modal-overlay" onClick={() => setDecisionModal({ ...decisionModal, isOpen: false })}>
          <div className="modal-card glass-panel max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="flex items-center gap-2">
                {decisionModal.actionType === 'Approved' && <CheckCircle className="text-success" size={20} />}
                {decisionModal.actionType === 'Rejected' && <XCircle className="text-danger" size={20} />}
                {decisionModal.actionType === 'Interview Scheduled' && <Clock className="text-warning" size={20} />}
                Confirm Decision: {decisionModal.actionType}
              </h3>
              <button 
                className="icon-btn"
                onClick={() => setDecisionModal({ ...decisionModal, isOpen: false })}
              >
                <X size={18}/>
              </button>
            </div>

            <div className="modal-body my-4">
              <p className="text-sm text-secondary">
                You are marking candidate <strong>{decisionModal.applicantName}</strong> for <strong>{decisionModal.clubName}</strong> as:
              </p>
              <div className="my-2">
                {getStatusBadge(decisionModal.actionType)}
              </div>

              {decisionModal.actionType === 'Approved' && (
                <div className="alert-box-info my-3">
                  <CheckCircle size={16} className="text-success flex-shrink-0" />
                  <span className="text-xs">
                    Approving this applicant will automatically add them to <strong>{decisionModal.clubName}'s</strong> member roster, increment club size, and notify the student!
                  </span>
                </div>
              )}

              <div className="form-group mt-3">
                <label className="form-label">Feedback / Decision Notes to Applicant</label>
                <textarea 
                  rows={3}
                  className="textarea-input"
                  placeholder="Provide feedback, welcome message, or interview instructions..."
                  value={decisionModal.feedbackNotes}
                  onChange={e => setDecisionModal({ ...decisionModal, feedbackNotes: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-actions flex justify-end gap-2">
              <button 
                className="btn btn-outline"
                onClick={() => setDecisionModal({ ...decisionModal, isOpen: false })}
              >
                Cancel
              </button>
              <button 
                id="modal-confirm-decision-btn"
                className={`btn ${
                  decisionModal.actionType === 'Approved' ? 'btn-primary' : 
                  decisionModal.actionType === 'Rejected' ? 'btn-danger' : 
                  'btn-warning'
                }`}
                onClick={confirmDecision}
              >
                Confirm {decisionModal.actionType}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
