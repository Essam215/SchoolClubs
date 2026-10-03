import React from 'react';
import { useApp } from '../../context/AppContext';
import { X, Bell, Check, Trash2, Calendar, CheckSquare, Trophy, UserPlus } from 'lucide-react';
import './NotificationDrawer.css';

export default function NotificationDrawer({ isOpen, onClose }) {
  const { notifications, markNotificationRead, clearNotifications } = useApp();

  if (!isOpen) return null;

  const getIcon = (type) => {
    switch (type) {
      case 'Event': return <Calendar className="text-warning" size={18} />;
      case 'Task': return <CheckSquare className="text-accent" size={18} />;
      case 'Gamification': return <Trophy className="text-warning" size={18} />;
      case 'Admission': return <UserPlus className="text-success" size={18} />;
      default: return <Bell className="text-secondary" size={18} />;
    }
  };

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-drawer glass-panel" onClick={e => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="flex items-center gap-2">
            <Bell size={20} className="text-accent" />
            <h3 className="drawer-title">Notifications</h3>
            <span className="badge">{notifications.filter(n => !n.read).length} Unread</span>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <button className="icon-btn" title="Clear all" onClick={clearNotifications}>
                <Trash2 size={16} />
              </button>
            )}
            <button className="icon-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="drawer-content">
          {notifications.length === 0 ? (
            <div className="empty-notifications">
              <Bell size={40} className="text-muted" />
              <p>No new notifications right now!</p>
            </div>
          ) : (
            notifications.map(item => (
              <div 
                key={item.id} 
                className={`notification-item ${!item.read ? 'unread' : ''}`}
                onClick={() => markNotificationRead(item.id)}
              >
                <div className="notification-icon-wrapper">
                  {getIcon(item.type)}
                </div>
                <div className="notification-details">
                  <div className="flex items-center justify-between">
                    <h4 className="notification-item-title">{item.title}</h4>
                    <span className="notification-time">{item.time}</span>
                  </div>
                  <p className="notification-msg">{item.message}</p>
                </div>
                {!item.read && <div className="unread-indicator" title="Click to mark read"></div>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
