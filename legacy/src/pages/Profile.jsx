import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Award, 
  BookOpen, 
  Plus, 
  X, 
  Zap, 
  ShieldCheck, 
  Calendar, 
  Mail, 
  Phone, 
  GraduationCap, 
  Edit3, 
  Check, 
  Flame,
  Users,
  Search,
  ExternalLink,
  LogOut,
  MapPin,
  Clock,
  Sparkles,
  Info,
  Layers,
  ArrowRight
} from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { 
    user, 
    updateUserProfile, 
    addSkill, 
    removeSkill, 
    clubs, 
    leaveClub 
  } = useApp();

  const navigate = useNavigate();

  // Tab or view switcher: 'MyProfile' or 'ClubDirectory'
  const [activeProfileTab, setActiveProfileTab] = useState('MyProfile');

  // Edit Profile Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: user.name,
    studentId: user.studentId || '',
    email: user.email,
    phone: user.phone || '',
    major: user.major || '',
    academicYear: user.academicYear || '',
    gpa: user.gpa || '',
    bio: user.bio,
    avatar: user.avatar
  });

  // Skills input & quick add
  const [newSkillInput, setNewSkillInput] = useState('');
  const recommendedSkills = [
    'Python', 'Machine Learning', 'React JS', 'UI/UX Design', 
    'Public Speaking', 'Event Planning', 'Cybersecurity', 'Robotics'
  ];

  // Club & Member Directory Modal State
  const [selectedClubForModal, setSelectedClubForModal] = useState(null);
  const [memberSearchQuery, setMemberSearchQuery] = useState('');
  const [memberRoleFilter, setMemberRoleFilter] = useState('All');

  // Handle Edit Profile submission
  const handleSaveProfile = (e) => {
    e.preventDefault();
    updateUserProfile(editForm);
    setIsEditModalOpen(false);
  };

  // Preset avatar choices
  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80'
  ];

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    addSkill(newSkillInput.trim());
    setNewSkillInput('');
  };

  const xpPercent = Math.min(100, Math.round((user.xp / user.nextLevelXp) * 100));

  // Open club details modal
  const openClubModal = (club) => {
    setSelectedClubForModal(club);
    setMemberSearchQuery('');
    setMemberRoleFilter('All');
  };

  return (
    <div className="profile-page">
      {/* Profile Navigation Bar */}
      <div className="profile-nav-header glass-panel">
        <div className="flex items-center gap-2">
          <div className="profile-nav-icon">
            <User size={22} className="text-accent"/>
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">Student Life & Membership Hub</h2>
            <p className="text-xs text-secondary">Manage personal credentials, skill endorsements, and explore club directories.</p>
          </div>
        </div>

        <div className="profile-tabs">
          <button 
            id="tab-my-profile"
            className={`profile-tab-btn ${activeProfileTab === 'MyProfile' ? 'active' : ''}`}
            onClick={() => setActiveProfileTab('MyProfile')}
          >
            <User size={16}/> Student Profile
          </button>
          <button 
            id="tab-club-directory"
            className={`profile-tab-btn ${activeProfileTab === 'ClubDirectory' ? 'active' : ''}`}
            onClick={() => setActiveProfileTab('ClubDirectory')}
          >
            <Users size={16}/> Club & Member Directory ({clubs.length})
          </button>
        </div>
      </div>

      {activeProfileTab === 'MyProfile' && (
        <>
          {/* Main Hero Banner with Student Information */}
          <div className="profile-banner glass-panel">
            <div className="banner-gradient"></div>
            
            <div className="profile-header-content">
              <div className="avatar-wrapper">
                <img src={user.avatar} alt={user.name} className="profile-avatar" />
                <div className="level-badge" title="Student Level">Lvl {user.level}</div>
              </div>

              <div className="profile-title-area">
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="profile-name text-white">{user.name}</h1>
                  {user.studentId && <span className="student-id-pill">{user.studentId}</span>}
                  <span className="role-tag"><ShieldCheck size={14}/> {user.role}</span>
                </div>

                <div className="student-academic-row">
                  <span className="academic-item">
                    <GraduationCap size={15} className="text-accent" /> 
                    <strong>{user.major}</strong> • {user.academicYear}
                  </span>
                  {user.gpa && <span className="academic-badge">GPA: {user.gpa}</span>}
                </div>
                
                <div className="profile-meta-row">
                  <span className="meta-info"><Mail size={14}/> {user.email}</span>
                  {user.phone && <span className="meta-info"><Phone size={14}/> {user.phone}</span>}
                  <span className="meta-info"><Calendar size={14}/> Enrolled: {user.joinedDate}</span>
                  <span className="meta-info text-warning"><Flame size={14}/> {user.streak} Day Streak</span>
                </div>
              </div>

              {/* Action Button: Edit Student Info */}
              <div className="profile-actions-header ml-auto">
                <button 
                  id="edit-profile-btn"
                  className="btn btn-primary flex items-center gap-2"
                  onClick={() => {
                    setEditForm({
                      name: user.name,
                      studentId: user.studentId || '',
                      email: user.email,
                      phone: user.phone || '',
                      major: user.major || '',
                      academicYear: user.academicYear || '',
                      gpa: user.gpa || '',
                      bio: user.bio,
                      avatar: user.avatar
                    });
                    setIsEditModalOpen(true);
                  }}
                >
                  <Edit3 size={16}/> Edit Student Information
                </button>
              </div>
            </div>

            {/* XP Progress Bar */}
            <div className="xp-bar-container">
              <div className="flex justify-between text-xs mb-1 font-semibold">
                <span className="flex items-center gap-1 text-accent">
                  <Zap size={14}/> Academic & Club XP Progress ({user.xp} / {user.nextLevelXp} XP)
                </span>
                <span className="text-secondary">{xpPercent}% To Level {user.level + 1}</span>
              </div>
              <div className="xp-track">
                <div className="xp-fill" style={{ width: `${xpPercent}%` }}></div>
              </div>
            </div>
          </div>

          {/* Quick Metrics Strip */}
          <div className="student-stats-row">
            <div className="student-stat-card glass-panel">
              <span className="stat-sub">CLUBS ENROLLED</span>
              <span className="stat-main">{user.joinedClubs.length}</span>
              <span className="stat-foot text-accent">Active Membership</span>
            </div>
            <div className="student-stat-card glass-panel">
              <span className="stat-sub">SKILLS RECORDED</span>
              <span className="stat-main">{user.skills.length}</span>
              <span className="stat-foot text-success">Verified Competencies</span>
            </div>
            <div className="student-stat-card glass-panel">
              <span className="stat-sub">LEADERSHIP HONORS</span>
              <span className="stat-main">{user.badges.length}</span>
              <span className="stat-foot text-warning">Badges Earned</span>
            </div>
            <div className="student-stat-card glass-panel">
              <span className="stat-sub">CAMPUS REPUTATION</span>
              <span className="stat-main">Top 5%</span>
              <span className="stat-foot text-accent">Honor Society</span>
            </div>
          </div>

          <div className="profile-grid">
            {/* Left Column: Bio & Skills */}
            <div className="profile-col gap-6">
              {/* About / Bio Panel */}
              <div className="card glass-panel">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="section-title flex items-center gap-2">
                    <User className="text-accent" size={19}/> Student Bio & Statement
                  </h3>
                  <button 
                    className="btn btn-outline btn-sm flex items-center gap-1"
                    onClick={() => {
                      setEditForm(prev => ({ ...prev, bio: user.bio }));
                      setIsEditModalOpen(true);
                    }}
                  >
                    <Edit3 size={13}/> Edit
                  </button>
                </div>
                <p className="bio-text">{user.bio}</p>
              </div>

              {/* Skills Management Panel */}
              <div className="card glass-panel" id="skills-section">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="section-title flex items-center gap-2">
                    <BookOpen className="text-accent" size={19}/> Skills & Competencies ({user.skills.length})
                  </h3>
                  <span className="text-xs text-muted">Click 'X' to remove</span>
                </div>
                
                {/* Add Skill Form */}
                <form onSubmit={handleAddSkill} className="skill-input-form mb-3">
                  <input 
                    id="new-skill-input"
                    type="text" 
                    placeholder="Add a new skill (e.g. Python, UI/UX Design, Leadership)..."
                    value={newSkillInput}
                    onChange={e => setNewSkillInput(e.target.value)}
                    className="skill-input"
                  />
                  <button id="add-skill-btn" type="submit" className="btn btn-primary flex items-center gap-1">
                    <Plus size={16}/> Add Skill
                  </button>
                </form>

                {/* Quick Add Suggestions */}
                <div className="quick-suggestions-box mb-4">
                  <span className="text-xs text-muted block mb-1">Recommended Skill Additions:</span>
                  <div className="flex flex-wrap gap-1">
                    {recommendedSkills
                      .filter(s => !user.skills.includes(s))
                      .slice(0, 5)
                      .map(s => (
                        <button 
                          key={s} 
                          type="button" 
                          className="chip-suggestion"
                          onClick={() => addSkill(s)}
                        >
                          + {s}
                        </button>
                    ))}
                  </div>
                </div>

                {/* Skills Tags List */}
                <div className="skills-tags-grid">
                  {user.skills.map(skill => (
                    <div key={skill} className="skill-tag" id={`skill-tag-${skill.replace(/\s+/g, '-')}`}>
                      <span>{skill}</span>
                      <button 
                        type="button" 
                        className="remove-skill-btn" 
                        title={`Remove ${skill}`}
                        onClick={() => removeSkill(skill)}
                      >
                        <X size={13}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Clubs the Student Belongs To & Achievements */}
            <div className="profile-col gap-6">
              {/* Enrolled Clubs Panel */}
              <div className="card glass-panel" id="enrolled-clubs-section">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="section-title flex items-center gap-2">
                    <Users className="text-accent" size={19}/> Clubs the Student Belongs To ({user.joinedClubs.length})
                  </h3>
                  <button 
                    className="btn btn-outline btn-sm flex items-center gap-1"
                    onClick={() => setActiveProfileTab('ClubDirectory')}
                  >
                    Explore Directory <ArrowRight size={13}/>
                  </button>
                </div>

                <div className="clubs-list">
                  {user.joinedClubs.length === 0 ? (
                    <div className="text-center py-6 text-secondary text-sm">
                      You are not currently enrolled in any clubs.
                      <div className="mt-2">
                        <button 
                          className="btn btn-primary btn-sm"
                          onClick={() => navigate('/admissions')}
                        >
                          Apply to Join a Club
                        </button>
                      </div>
                    </div>
                  ) : (
                    user.joinedClubs.map(club => {
                      const clubDetails = clubs.find(c => c.name.toLowerCase() === club.name.toLowerCase());
                      return (
                        <div key={club.id || club.name} className="club-card-item" id={`joined-club-${club.id}`}>
                          <div className="club-icon-avatar">{club.icon || '🏛️'}</div>
                          
                          <div className="club-info">
                            <h4 className="club-title">{club.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="club-badge-tag">{club.role}</span>
                              <span className="club-members">👥 {club.membersCount || 40} Members</span>
                            </div>
                          </div>

                          <div className="club-item-actions flex items-center gap-2">
                            <button 
                              className="btn btn-outline btn-sm"
                              title="View Club & Member Directory"
                              onClick={() => {
                                if (clubDetails) {
                                  openClubModal(clubDetails);
                                } else {
                                  openClubModal({
                                    id: club.id,
                                    name: club.name,
                                    icon: club.icon || '🏛️',
                                    category: 'Student Organization',
                                    description: `Official school organization: ${club.name}.`,
                                    membersCount: club.membersCount || 50,
                                    president: club.role === 'President' ? user.name : 'Club President',
                                    room: 'Campus Hall 101',
                                    meetingSchedule: 'Weekly Meetings',
                                    members: [
                                      {
                                        id: 'm-curr',
                                        name: user.name,
                                        role: club.role,
                                        avatar: user.avatar,
                                        email: user.email,
                                        major: user.major,
                                        studentId: user.studentId
                                      }
                                    ]
                                  });
                                }
                              }}
                            >
                              <Users size={14}/> Member Roster
                            </button>

                            <button 
                              className="btn btn-outline btn-sm text-danger border-danger"
                              title="Leave this club"
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to leave ${club.name}?`)) {
                                  leaveClub(club.id || club.name);
                                }
                              }}
                            >
                              <LogOut size={14}/>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Achievements & Badges Panel */}
              <div className="card glass-panel">
                <h3 className="section-title flex items-center gap-2 mb-3">
                  <Award className="text-warning" size={19}/> Academic & Leadership Badges
                </h3>

                <div className="badges-grid">
                  {user.badges.map(b => (
                    <div key={b.id} className="badge-card">
                      <div className="badge-icon-box">{b.icon}</div>
                      <div className="badge-details">
                        <h4 className="badge-name">{b.name}</h4>
                        <p className="badge-desc">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: EXPLORE ALL SCHOOL CLUBS & MEMBER ROSTERS */}
      {activeProfileTab === 'ClubDirectory' && (
        <div className="club-directory-section">
          <div className="directory-header-bar glass-panel mb-4">
            <div>
              <h2 className="text-lg font-bold text-white">Official School Clubs & Member Directory</h2>
              <p className="text-xs text-secondary mt-0.5">
                Browse student organizations, view leadership & active member rosters, or apply for admissions.
              </p>
            </div>
            <div>
              <button 
                className="btn btn-primary flex items-center gap-2"
                onClick={() => navigate('/admissions')}
              >
                <Plus size={16}/> Apply for Club Admission
              </button>
            </div>
          </div>

          <div className="directory-grid">
            {clubs.map(club => {
              const isMember = user.joinedClubs.some(
                jc => jc.name.toLowerCase() === club.name.toLowerCase()
              );

              return (
                <div key={club.id} className="directory-club-card glass-panel" id={`directory-club-${club.id}`}>
                  <div className="club-card-banner">
                    <img 
                      src={club.banner || "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80"} 
                      alt={club.name} 
                      className="club-banner-img"
                    />
                    <div className="club-icon-overlay">{club.icon}</div>
                  </div>

                  <div className="club-card-body">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-base font-bold text-white">{club.name}</h3>
                      {isMember && <span className="member-status-pill">Member</span>}
                    </div>

                    <span className="club-category-tag text-xs text-accent font-semibold mb-2 block">
                      {club.category}
                    </span>

                    <p className="club-description-text text-xs text-secondary mb-3">
                      {club.description}
                    </p>

                    <div className="club-meta-specs mb-3">
                      <div className="spec-item">
                        <Users size={13} className="text-muted"/> 
                        <span><strong>{club.membersCount}</strong> Members</span>
                      </div>
                      <div className="spec-item">
                        <MapPin size={13} className="text-muted"/> 
                        <span>{club.room}</span>
                      </div>
                      <div className="spec-item">
                        <Clock size={13} className="text-muted"/> 
                        <span>{club.meetingSchedule}</span>
                      </div>
                    </div>

                    {/* Member Avatars Preview */}
                    <div className="members-preview-bar">
                      <span className="text-xs text-muted">Active Roster:</span>
                      <div className="avatar-stack">
                        {club.members && club.members.slice(0, 4).map((m, idx) => (
                          <img 
                            key={idx} 
                            src={m.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80"} 
                            alt={m.name} 
                            title={`${m.name} (${m.role})`}
                            className="stack-avatar"
                          />
                        ))}
                      </div>
                    </div>

                    <div className="club-card-footer mt-4 pt-3 border-t border-color flex gap-2">
                      <button 
                        className="btn btn-outline btn-sm flex-1 flex justify-center items-center gap-1"
                        onClick={() => openClubModal(club)}
                      >
                        <Users size={14}/> View Full Roster ({club.members ? club.members.length : club.membersCount})
                      </button>

                      {!isMember ? (
                        <button 
                          className="btn btn-primary btn-sm flex-1 flex justify-center items-center gap-1"
                          onClick={() => navigate('/admissions')}
                        >
                          Apply to Join
                        </button>
                      ) : (
                        <button 
                          className="btn btn-outline btn-sm text-danger border-danger"
                          title="Leave club"
                          onClick={() => {
                            if (window.confirm(`Leave ${club.name}?`)) {
                              leaveClub(club.id);
                            }
                          }}
                        >
                          <LogOut size={14}/> Leave
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* EDIT STUDENT INFORMATION MODAL */}
      {isEditModalOpen && (
        <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
          <div className="modal-card glass-panel max-w-xl" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="flex items-center gap-2 text-white font-bold">
                <Edit3 className="text-accent" size={20}/> Edit Student Profile Information
              </h3>
              <button className="icon-btn" onClick={() => setIsEditModalOpen(false)}><X size={18}/></button>
            </div>

            <form onSubmit={handleSaveProfile} className="edit-profile-form my-4">
              {/* Avatar Selector */}
              <div className="avatar-selection-box mb-4">
                <label className="form-label">Profile Avatar</label>
                <div className="flex items-center gap-4 mt-2">
                  <img src={editForm.avatar} alt="Current Avatar" className="w-16 h-16 rounded-full border-2 border-accent object-cover" />
                  <div>
                    <span className="text-xs text-secondary block mb-1">Select Preset or Paste Image URL:</span>
                    <div className="flex gap-2">
                      {presetAvatars.map((url, i) => (
                        <img 
                          key={i} 
                          src={url} 
                          alt={`Preset ${i}`} 
                          className={`w-9 h-9 rounded-full cursor-pointer object-cover border-2 ${editForm.avatar === url ? 'border-accent scale-110' : 'border-transparent opacity-70'}`}
                          onClick={() => setEditForm(prev => ({ ...prev, avatar: url }))}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <input 
                  type="url" 
                  className="text-input mt-2" 
                  placeholder="Or enter custom image URL..."
                  value={editForm.avatar}
                  onChange={e => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input 
                    type="text" 
                    required
                    className="text-input" 
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Student ID</label>
                  <input 
                    type="text" 
                    required
                    className="text-input" 
                    value={editForm.studentId}
                    onChange={e => setEditForm(prev => ({ ...prev, studentId: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">School Email</label>
                  <input 
                    type="email" 
                    required
                    className="text-input" 
                    value={editForm.email}
                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="text" 
                    className="text-input" 
                    value={editForm.phone}
                    onChange={e => setEditForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">Academic Major / Department</label>
                  <input 
                    type="text" 
                    required
                    className="text-input" 
                    value={editForm.major}
                    onChange={e => setEditForm(prev => ({ ...prev, major: e.target.value }))}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Academic Standing / Year</label>
                  <input 
                    type="text" 
                    required
                    className="text-input" 
                    value={editForm.academicYear}
                    onChange={e => setEditForm(prev => ({ ...prev, academicYear: e.target.value }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">GPA / Honors</label>
                <input 
                  type="text" 
                  className="text-input" 
                  value={editForm.gpa}
                  onChange={e => setEditForm(prev => ({ ...prev, gpa: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Personal Statement / Bio</label>
                <textarea 
                  rows={3} 
                  required
                  className="textarea-input"
                  value={editForm.bio}
                  onChange={e => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>

              <div className="modal-actions flex justify-end gap-2 mt-4 pt-3 border-t border-color">
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
                <button 
                  id="save-profile-modal-btn"
                  type="submit" 
                  className="btn btn-primary flex items-center gap-1"
                >
                  <Check size={16}/> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CLUB & MEMBER ROSTER INFORMATION MODAL */}
      {selectedClubForModal && (
        <div className="modal-overlay" onClick={() => setSelectedClubForModal(null)}>
          <div className="modal-card glass-panel max-w-3xl modal-scrollable" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedClubForModal.icon}</span>
                <div>
                  <h3 className="font-bold text-lg text-white">{selectedClubForModal.name}</h3>
                  <span className="text-xs text-accent font-semibold">{selectedClubForModal.category}</span>
                </div>
              </div>
              <button className="icon-btn" onClick={() => setSelectedClubForModal(null)}><X size={18}/></button>
            </div>

            <div className="club-modal-content my-4">
              {/* Club Detailed Info Banner */}
              <div className="club-profile-summary glass-panel p-4 mb-4">
                <p className="text-sm text-secondary mb-3 leading-relaxed">
                  {selectedClubForModal.description}
                </p>

                <div className="club-attributes-grid">
                  <div className="attr-item">
                    <span className="attr-k">President:</span>
                    <span className="attr-v">{selectedClubForModal.president || 'Student Lead'}</span>
                  </div>
                  <div className="attr-item">
                    <span className="attr-k">Faculty Advisor:</span>
                    <span className="attr-v">{selectedClubForModal.advisor || 'Faculty Board'}</span>
                  </div>
                  <div className="attr-item">
                    <span className="attr-k">Room / Lab:</span>
                    <span className="attr-v">{selectedClubForModal.room}</span>
                  </div>
                  <div className="attr-item">
                    <span className="attr-k">Meeting Schedule:</span>
                    <span className="attr-v">{selectedClubForModal.meetingSchedule}</span>
                  </div>
                  <div className="attr-item">
                    <span className="attr-k">Total Enrolled:</span>
                    <span className="attr-v font-bold text-accent">{selectedClubForModal.members ? selectedClubForModal.members.length : selectedClubForModal.membersCount} Members</span>
                  </div>
                </div>
              </div>

              {/* Member Roster Search & Filter */}
              <div className="roster-header-bar flex justify-between items-center flex-wrap gap-2 mb-3">
                <h4 className="font-bold text-base text-white flex items-center gap-2">
                  <Users size={18} className="text-accent" /> Active Member Roster
                </h4>

                <div className="flex items-center gap-2">
                  <div className="search-box-wrap">
                    <Search size={14} className="search-icon"/>
                    <input 
                      type="text" 
                      className="search-filter-input select-sm" 
                      placeholder="Search member name or skill..."
                      value={memberSearchQuery}
                      onChange={e => setMemberSearchQuery(e.target.value)}
                    />
                  </div>

                  <select 
                    className="select-input select-sm"
                    value={memberRoleFilter}
                    onChange={e => setMemberRoleFilter(e.target.value)}
                  >
                    <option value="All">All Roles</option>
                    <option value="President">Leadership</option>
                    <option value="Member">Members</option>
                  </select>
                </div>
              </div>

              {/* Members List */}
              <div className="members-roster-list">
                {(!selectedClubForModal.members || selectedClubForModal.members.length === 0) ? (
                  <div className="text-center py-6 text-muted">No member records found for this club.</div>
                ) : (
                  selectedClubForModal.members
                    .filter(m => {
                      const matchSearch = 
                        m.name.toLowerCase().includes(memberSearchQuery.toLowerCase()) ||
                        (m.skills && m.skills.some(s => s.toLowerCase().includes(memberSearchQuery.toLowerCase())));
                      const matchRole = 
                        memberRoleFilter === 'All' ? true :
                        memberRoleFilter === 'President' ? (m.role.toLowerCase().includes('president') || m.role.toLowerCase().includes('lead')) :
                        (!m.role.toLowerCase().includes('president') && !m.role.toLowerCase().includes('lead'));
                      return matchSearch && matchRole;
                    })
                    .map(m => (
                      <div key={m.id || m.name} className="roster-member-card">
                        <img 
                          src={m.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80"} 
                          alt={m.name} 
                          className="roster-avatar"
                        />
                        <div className="roster-member-info">
                          <div className="flex items-center gap-2">
                            <span className="roster-name">{m.name}</span>
                            <span className="roster-role-tag">{m.role}</span>
                          </div>
                          <span className="roster-sub">
                            {m.major || 'Undergraduate'} • {m.studentId || 'ST-9000'} • {m.email}
                          </span>
                          {m.skills && (
                            <div className="roster-skills-wrap mt-1">
                              {m.skills.map(s => (
                                <span key={s} className="roster-skill-chip">{s}</span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <div className="modal-actions flex justify-end gap-2 pt-3 border-t border-color">
              <button className="btn btn-outline" onClick={() => setSelectedClubForModal(null)}>
                Close
              </button>
              {!user.joinedClubs.some(jc => jc.name.toLowerCase() === selectedClubForModal.name.toLowerCase()) && (
                <button 
                  className="btn btn-primary"
                  onClick={() => {
                    setSelectedClubForModal(null);
                    navigate('/admissions');
                  }}
                >
                  Apply to Join This Club
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
