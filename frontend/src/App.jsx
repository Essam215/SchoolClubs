import { useCallback, useEffect, useMemo, useState } from 'react';
import { Award, Bell, BookOpen, CalendarDays, ListTodo, Lightbulb, LogOut, Moon, Sun, Rocket } from 'lucide-react';
import { api, setUserId } from './api';
import { Avatar, Ctx, Loading, roleLabel } from './ui';
import Login from './pages/Login';
import Events from './pages/Events';
import Tasks from './pages/Tasks';
import Notifications from './pages/Notifications';
import Suggestions from './pages/Suggestions';
import Leaderboard from './pages/Leaderboard';
import ResourceLibrary from './pages/ResourceLibrary';

const NAV = [
  { id: 'events', label: 'Events', icon: CalendarDays },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'suggestions', label: 'Suggestion box', icon: Lightbulb },
  { id: 'leaderboard', label: 'Leaderboard', icon: Award },
  { id: 'resources', label: 'Resource library', icon: BookOpen },
];
const PAGES = { events: Events, tasks: Tasks, notifications: Notifications, suggestions: Suggestions, leaderboard: Leaderboard, resources: ResourceLibrary };

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  });
  const [clubs, setClubs] = useState(null);
  const [view, setView] = useState(() => location.hash.slice(1) || 'events');
  const [unread, setUnread] = useState(0);
  const [theme, setTheme] = useState(document.documentElement.dataset.theme);
  const [toastMsg, setToastMsg] = useState(null);

  const toast = useCallback((text, kind = 'ok') => {
    setToastMsg({ text, kind });
    setTimeout(() => setToastMsg(null), 3200);
  }, []);

  const go = (id) => { setView(id); location.hash = id; };

  const signIn = (u) => { setUserId(u.id); localStorage.setItem('user', JSON.stringify(u)); setUser(u); };
  const signOut = () => { setUserId(null); localStorage.removeItem('user'); setUser(null); setClubs(null); };

  const refreshUnread = useCallback(() => {
    api.get('/notifications/unread-count').then((r) => setUnread(r.count)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    api.get('/clubs').then(setClubs).catch((e) => {
      // A stale saved account (e.g. after re-seeding) sends the user back to sign in.
      if (/Sign in|no longer exists/.test(e.message)) signOut(); else toast(e.message, 'error');
    });
    refreshUnread();
    const t = setInterval(refreshUnread, 20000);
    return () => clearInterval(t);
  }, [user, refreshUnread, toast]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    localStorage.setItem('theme', next);
    setTheme(next);
  };

  // Permission helpers mirror the API rules; the API still enforces them.
  const ctx = useMemo(() => {
    const canManage = (clubId) => {
      if (!user) return false;
      if (user.role === 'admin') return true;
      if (!clubId) return user.role === 'advisor';
      const club = (clubs || []).find((c) => c.id === clubId);
      if (!club) return false;
      if (user.role === 'advisor') return club.advisor_id === user.id;
      if (user.role === 'club_leader') return club.club_members.some((m) => m.user_id === user.id && m.role === 'leader');
      return false;
    };
    return { user, clubs: clubs || [], canManage, manageable: (clubs || []).filter((c) => canManage(c.id)), toast, refreshUnread };
  }, [user, clubs, toast, refreshUnread]);

  if (!user) return <Login onSignIn={signIn} />;

  const Page = PAGES[view] || Events;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <Ctx.Provider value={ctx}>
      <div className="shell">
        <aside className="side">
          <div className="brand">
            <span className="logo"><Rocket size={20} /></span>
            <div><b>Clubs Hub</b><small>El Sewedy International School</small></div>
          </div>
          <div className="nav-label">Main menu</div>
          <nav className="nav">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button key={id} className={view === id ? 'on' : ''} onClick={() => go(id)}>
                <Icon size={18} /> <span className="t">{label}</span>
                {id === 'notifications' && unread > 0 && <span className="badge">{unread}</span>}
              </button>
            ))}
          </nav>
          <div className="me">
            <Avatar name={user.full_name} color={user.avatar_color} size={36} />
            <div><b>{user.full_name}</b><small>{roleLabel[user.role]}</small></div>
            <button className="link-btn" onClick={signOut} aria-label="Sign out"><LogOut size={18} /></button>
          </div>
        </aside>

        <main className="main">
          <div className="top">
            <div className="hello">
              <h1>{greeting}, {user.full_name.split(' ')[0]}<span className="role-pill">{roleLabel[user.role]}</span></h1>
              <p>{new Date().toLocaleDateString('en', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <button className="icon-btn" onClick={toggleTheme} aria-label="Toggle dark mode">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="icon-btn" onClick={() => go('notifications')} aria-label={`Notifications, ${unread} unread`}>
              <Bell size={18} />{unread > 0 && <span className="dot">{unread}</span>}
            </button>
          </div>
          {clubs ? <Page onNavigate={go} /> : <Loading />}
        </main>
      </div>
      {toastMsg && <div className={`toast ${toastMsg.kind}`} role="status">{toastMsg.text}</div>}
    </Ctx.Provider>
  );
}
