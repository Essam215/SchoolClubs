import React, { useState } from 'react';
import { Bell, Moon, Search, Sun } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import NotificationDrawer from '../Notifications/NotificationDrawer';
import './Topbar.css';

export default function Topbar() {
  const { notifications, user } = useApp();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <header className="topbar">
      <div className="topbar-left">
        <h2 className="page-title">School Clubs Hub</h2>
        <span className="page-subtitle">Welcome back, {user.name}</span>
      </div>
      
      <div className="topbar-right">
        <div className="search-bar">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="Search events, clubs, tasks..." className="search-input" />
        </div>
        
        <button className="icon-btn" onClick={() => setIsDark(!isDark)} title="Toggle Mode">
          {isDark ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        
        <button className="icon-btn notification-btn" onClick={() => setIsDrawerOpen(true)} title="Notifications">
          <Bell size={20} />
          {unreadCount > 0 && <span className="notification-dot">{unreadCount}</span>}
        </button>
      </div>

      <NotificationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </header>
  );
}
