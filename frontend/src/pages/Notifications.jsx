import { useCallback, useEffect, useState } from 'react';
import { Bell, CalendarDays, CheckCheck, Info, Lightbulb, ListTodo, Trash2 } from 'lucide-react';
import { api } from '../api';
import { Empty, Loading, fmt, useApp } from '../ui';

const ICONS = { event: CalendarDays, task: ListTodo, suggestion: Lightbulb, system: Info };

export default function Notifications({ onNavigate }) {
  const { toast, refreshUnread } = useApp();
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('all');

  const load = useCallback(() => {
    api.get('/notifications').then(setItems).catch((e) => toast(e.message, 'error'));
    refreshUnread();
  }, [toast, refreshUnread]);
  useEffect(() => { load(); }, [load]);

  const guard = async (fn) => { try { await fn(); load(); } catch (e) { toast(e.message, 'error'); } };

  const open = (n) => {
    if (!n.is_read) guard(() => api.post(`/notifications/${n.id}/read`));
    if (n.link) onNavigate(n.link);
  };

  const unread = (items || []).filter((n) => !n.is_read).length;
  const shown = (items || []).filter((n) => filter === 'all' || !n.is_read);

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Notifications</h2>
          <p>{unread ? `${unread} unread` : "You're all caught up"}</p>
        </div>
        <div className="tabs">
          <button className={filter === 'all' ? 'on' : ''} onClick={() => setFilter('all')}>All</button>
          <button className={filter === 'unread' ? 'on' : ''} onClick={() => setFilter('unread')}>Unread</button>
        </div>
        <button className="btn" disabled={!unread} onClick={() => guard(() => api.post('/notifications/read-all'))}>
          <CheckCheck size={16} /> Mark all as read
        </button>
      </div>

      {items === null ? <Loading /> : shown.length === 0 ? (
        <Empty icon={Bell} title="No notifications" text="New events, tasks and responses will show up here." />
      ) : (
        <div className="list">
          {shown.map((n) => {
            const Icon = ICONS[n.type] || Info;
            return (
              <div key={n.id} className={`note ${n.is_read ? '' : 'unread'}`}>
                <span className="ico"><Icon size={18} /></span>
                <button className="body" style={{ border: 0, background: 'none', padding: 0, textAlign: 'left' }} onClick={() => open(n)}>
                  <b>{n.title}</b>
                  {n.message && <p>{n.message}</p>}
                  <small>{fmt.ago(n.created_at)}</small>
                </button>
                <button className="link-btn" aria-label="Delete notification" onClick={() => guard(() => api.del(`/notifications/${n.id}`))}>
                  <Trash2 size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
