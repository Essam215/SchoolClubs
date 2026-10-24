import { createContext, useContext, useEffect } from 'react';
import { X } from 'lucide-react';

export const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);

export const fmt = {
  day: (d) => new Date(d).getDate(),
  mon: (d) => new Date(d).toLocaleString('en', { month: 'short' }),
  time: (d) => new Date(d).toLocaleTimeString('en', { hour: 'numeric', minute: '2-digit' }),
  date: (d) => new Date(d).toLocaleDateString('en', { weekday: 'short', day: 'numeric', month: 'short' }),
  ago(d) {
    const s = Math.max(1, (Date.now() - new Date(d)) / 1000);
    if (s < 3600) return `${Math.floor(s / 60) || 1}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    if (s < 86400 * 7) return `${Math.floor(s / 86400)}d ago`;
    return fmt.date(d);
  },
  toInput(iso) {
    if (!iso) return '';
    const d = new Date(iso);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().slice(0, 16);
  },
};

export const roleLabel = { student: 'Student', club_leader: 'Club leader', advisor: 'Advisor', admin: 'Administrator' };

export function Avatar({ name = '?', color = '#D91E2E', size = 32 }) {
  const initials = name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
  return (
    <span className="avatar" title={name} style={{ background: color, width: size, height: size, fontSize: size * 0.38 }}>
      {initials}
    </span>
  );
}

export function ClubChip({ club }) {
  if (!club) return <span className="chip">Whole school</span>;
  return (
    <span className="chip" style={{ '--c': club.color }}>
      <i /> {club.name}
    </span>
  );
}

export function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
        <header>
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </header>
        {children}
      </div>
    </div>
  );
}

export function Empty({ icon: Icon, title, text }) {
  return (
    <div className="empty">
      <Icon size={28} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

export const Loading = () => <div className="loading">Loading…</div>;
