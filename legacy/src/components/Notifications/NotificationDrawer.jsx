import React from 'react';
import { useApp } from '../../context/AppContext';
import { NOTIFICATION_TYPES } from '../../lib/schema';
import {
  X, Bell, Trash2, Calendar, CheckSquare, Trophy,
  UserPlus, User, Lightbulb, MessageCircle, Settings,
  CheckCheck, BookOpen, BellOff
} from 'lucide-react';
import './NotificationDrawer.css';

const TYPE_CONFIG = {
  [NOTIFICATION_TYPES.EVENT]:        { icon: Calendar,       color: '#F59E0B', label: 'Event' },
  [NOTIFICATION_TYPES.TASK]:         { icon: CheckSquare,    color: '#3B82F6', label: 'Task' },
  [NOTIFICATION_TYPES.GAMIFICATION]: { icon: Trophy,         color: '#F59E0B', label: 'XP' },
  [NOTIFICATION_TYPES.ADMISSION]:    { icon: UserPlus,       color: '#10B981', label: 'Admission' },
  [NOTIFICATION_TYPES.CLUB]:         { icon: BookOpen,       color: '#8B5CF6', label: 'Club' },
  [NOTIFICATION_TYPES.PROFILE]:      { icon: User,           color: '#6B7280', label: 'Profile' },
  [NOTIFICATION_TYPES.MEETING]:      { icon: Calendar,       color: '#06B6D4', label: 'Meeting' },
  [NOTIFICATION_TYPES.SUGGESTION]:   { icon: Lightbulb,      color: '#F59E0B', label: 'Idea' },
  [NOTIFICATION_TYPES.SYSTEM]:       { icon: Settings,       color: '#6B7280', label: 'System' },
};

function getTypeConfig(type) {
  return TYPE_CONFIG[type] || TYPE_CONFIG[NOTIFICATION_TYPES.SYSTEM];
}

export default function NotificationDrawer({ isOpen, onClose }) {
  const {
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
    clearNotifications
  } = useApp();

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleItemClick = (item) => {
    markNotificationRead(item.id);
  };

  return (
    <div className="notification-overlay" onClick={onClose}>
      <div className="notification-drawer glass-panel" onClick={e => e.stopPropagation()}>

        {/* ── Header ────────────────────────────────────────── */}
        <div className="drawer-header">
          <div className="drawer-header-left">
            <div className="drawer-bell-icon">
              <Bell size={18} />
              {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
            </div>
            <div>
              <h3 className="drawer-title">Notifications</h3>
              <span className="drawer-subtitle">
                {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
              </span>
            </div>
          </div>

          <div className="drawer-header-actions">
            {unreadCount > 0 && (
              <button
                className="drawer-action-btn"
                title="Mark all as read"
                onClick={markAllNotificationsRead}
              >
                <CheckCheck size={15} /> Mark All Read
              </button>
            )}
            {notifications.length > 0 && (
              <button
                className="icon-btn"
                title="Clear all notifications"
                onClick={clearNotifications}
              >
                <Trash2 size={15} />
              </button>
            )}
            <button className="icon-btn" onClick={onClose}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── Body ──────────────────────────────────────────── */}
        <div className="drawer-content">
          {notifications.length === 0 ? (
            <div className="empty-notifications">
              <BellOff size={42} className="empty-bell-icon" />
              <p className="empty-title">No notifications</p>
              <p className="empty-sub">You're all caught up! New alerts will appear here.</p>
            </div>
          ) : (
            <div className="notifications-list">
              {notifications.map(item => {
                const cfg = getTypeConfig(item.type);
                const Icon = cfg.icon;
                return (
                  <div
                    key={item.id}
                    className={`notification-item ${!item.is_read ? 'unread' : ''}`}
                    onClick={() => handleItemClick(item)}
                  >
                    {/* Unread dot */}
                    {!item.is_read && <span className="unread-dot" />}

                    {/* Icon */}
                    <div className="notif-icon-wrap" style={{ background: cfg.color + '22', color: cfg.color }}>
                      <Icon size={16} />
                    </div>

                    {/* Content */}
                    <div className="notification-details">
                      <div className="notif-top-row">
                        <span className="notif-type-badge" style={{ color: cfg.color }}>
                          {cfg.label}
                        </span>
                        <span className="notification-time">{item.time}</span>
                      </div>
                      <h4 className="notification-item-title">{item.title}</h4>
                      <p className="notification-msg">{item.message}</p>
                    </div>

                    {/* Delete button */}
                    <button
                      className="notif-delete-btn"
                      title="Dismiss"
                      onClick={e => { e.stopPropagation(); deleteNotification(item.id); }}
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Footer ────────────────────────────────────────── */}
        {notifications.length > 0 && (
          <div className="drawer-footer">
            <span className="drawer-footer-text">{notifications.length} total notification{notifications.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>
    </div>
  );
}
