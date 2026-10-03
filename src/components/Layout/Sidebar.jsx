import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Calendar, 
  MessageSquare, 
  DoorOpen, 
  CheckSquare, 
  UserPlus, 
  Trophy,
  GitCommit,
  Lightbulb,
  UserCheck,
  FolderGit2,
  Image,
  ShieldAlert,
  User,
  LogOut 
} from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
  const { user } = useApp();
  const navigate = useNavigate();

  const mainNavs = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/events', label: 'Events & Management', icon: Calendar },
    { path: '/timeline', label: 'Event Timeline', icon: GitCommit },
    { path: '/tasks', label: 'Task Management', icon: CheckSquare },
    { path: '/chat', label: 'Group Chat', icon: MessageSquare }
  ];

  const communityNavs = [
    { path: '/admissions', label: 'Club Admissions', icon: UserPlus },
    { path: '/rooms', label: 'Room Scheduling', icon: DoorOpen },
    { path: '/suggestions', label: 'Suggestion Box', icon: Lightbulb },
    { path: '/resources', label: 'Resource Library', icon: FolderGit2 },
    { path: '/gallery', label: 'Event Photo Album', icon: Image }
  ];

  const manageNavs = [
    { path: '/attendance', label: 'Attendance Tracking', icon: UserCheck },
    { path: '/gamification', label: 'Gamification & Badges', icon: Trophy },
    { path: '/profile', label: 'User Profile', icon: User },
    { path: '/admin', label: 'Admin Dashboard', icon: ShieldAlert }
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <div className="logo-icon"></div>
          <span className="logo-text">SCHOOL CLUBS</span>
        </div>
      </div>
      
      <div className="sidebar-scroll-area">
        <div className="sidebar-nav-section">
          <span className="nav-section-title">MAIN HUB</span>
          <nav className="nav-list">
            {mainNavs.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              >
                <item.icon className="nav-icon" size={18} />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-nav-section">
          <span className="nav-section-title">CLUB & COMMUNITY</span>
          <nav className="nav-list">
            {communityNavs.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              >
                <item.icon className="nav-icon" size={18} />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="sidebar-nav-section">
          <span className="nav-section-title">MANAGEMENT & REWARDS</span>
          <nav className="nav-list">
            {manageNavs.map((item) => (
              <NavLink 
                key={item.path} 
                to={item.path} 
                className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              >
                <item.icon className="nav-icon" size={18} />
                <span className="nav-label">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="user-profile" onClick={() => navigate('/profile')} style={{ cursor: 'pointer' }}>
          <img src={user.avatar} alt={user.name} className="user-avatar-img" />
          <div className="user-info">
            <span className="user-name">{user.name}</span>
            <span className="user-role">Lvl {user.level} • {user.xp} XP</span>
          </div>
          <button className="logout-btn" title="View Profile" onClick={(e) => { e.stopPropagation(); navigate('/profile'); }}>
            <User size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
