import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
  Edit3, 
  Check, 
  Flame,
  Users
} from 'lucide-react';
import './Profile.css';

export default function Profile() {
  const { user, setUser, addSkill, removeSkill } = useApp();
  const [newSkillInput, setNewSkillInput] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState(user.bio);

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillInput.trim()) return;
    addSkill(newSkillInput.trim());
    setNewSkillInput('');
  };

  const handleSaveBio = () => {
    setUser(prev => ({ ...prev, bio: bioInput }));
    setIsEditingBio(false);
  };

  const xpPercent = Math.min(100, Math.round((user.xp / user.nextLevelXp) * 100));

  return (
    <div className="profile-page">
      {/* Header Banner */}
      <div className="profile-banner glass-panel">
        <div className="banner-gradient"></div>
        <div className="profile-header-content">
          <div className="avatar-wrapper">
            <img src={user.avatar} alt={user.name} className="profile-avatar" />
            <div className="level-badge" title="User Level">Lvl {user.level}</div>
          </div>

          <div className="profile-title-area">
            <div className="flex items-center gap-3">
              <h1 className="profile-name">{user.name}</h1>
              <span className="role-tag"><ShieldCheck size={14}/> {user.role}</span>
            </div>
            
            <div className="profile-meta-row">
              <span className="meta-info"><Mail size={14}/> {user.email}</span>
              <span className="meta-info"><Calendar size={14}/> Joined {user.joinedDate}</span>
              <span className="meta-info text-warning"><Flame size={14}/> {user.streak} Day Streak!</span>
            </div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="xp-bar-container">
          <div className="flex justify-between text-sm mb-1">
            <span className="flex items-center gap-1 font-semibold text-accent">
              <Zap size={14}/> Level Progress ({user.xp} / {user.nextLevelXp} XP)
            </span>
            <span className="text-secondary">{xpPercent}%</span>
          </div>
          <div className="xp-track">
            <div className="xp-fill" style={{ width: `${xpPercent}%` }}></div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        {/* Left Column: Bio & Skills */}
        <div className="profile-col gap-6">
          {/* About / Bio Panel */}
          <div className="card glass-panel">
            <div className="flex justify-between items-center mb-4">
              <h3 className="section-title flex items-center gap-2">
                <User className="text-accent" size={20}/> About Me
              </h3>
              {!isEditingBio ? (
                <button className="btn btn-outline btn-sm" onClick={() => setIsEditingBio(true)}>
                  <Edit3 size={14}/> Edit Bio
                </button>
              ) : (
                <button className="btn btn-primary btn-sm" onClick={handleSaveBio}>
                  <Check size={14}/> Save
                </button>
              )}
            </div>

            {!isEditingBio ? (
              <p className="bio-text">{user.bio}</p>
            ) : (
              <textarea 
                className="bio-textarea"
                rows={4}
                value={bioInput}
                onChange={e => setBioInput(e.target.value)}
              />
            )}
          </div>

          {/* Skills Management Panel */}
          <div className="card glass-panel">
            <h3 className="section-title flex items-center gap-2 mb-4">
              <BookOpen className="text-accent" size={20}/> Skills & Competencies
            </h3>
            
            <form onSubmit={handleAddSkill} className="skill-input-form mb-4">
              <input 
                type="text" 
                placeholder="Add a new skill (e.g. Python, Public Speaking)..."
                value={newSkillInput}
                onChange={e => setNewSkillInput(e.target.value)}
                className="skill-input"
              />
              <button type="submit" className="btn btn-primary">
                <Plus size={16}/> Add Skill
              </button>
            </form>

            <div className="skills-tags-grid">
              {user.skills.map(skill => (
                <div key={skill} className="skill-tag">
                  <span>{skill}</span>
                  <button type="button" className="remove-skill-btn" onClick={() => removeSkill(skill)}>
                    <X size={14}/>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Clubs & Badges */}
        <div className="profile-col gap-6">
          {/* Enrolled Clubs Panel */}
          <div className="card glass-panel">
            <h3 className="section-title flex items-center gap-2 mb-4">
              <Users className="text-accent" size={20}/> Enrolled School Clubs
            </h3>

            <div className="clubs-list">
              {user.joinedClubs.map(club => (
                <div key={club.id} className="club-card-item">
                  <div className="club-icon-avatar">{club.icon}</div>
                  <div className="club-info">
                    <h4 className="club-title">{club.name}</h4>
                    <span className="club-members">{club.membersCount} Active Members</span>
                  </div>
                  <div className="club-badge-tag">{club.role}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements & Badges Panel */}
          <div className="card glass-panel">
            <h3 className="section-title flex items-center gap-2 mb-4">
              <Award className="text-warning" size={20}/> Achievements & Badges
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
    </div>
  );
}
