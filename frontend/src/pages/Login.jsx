import { useEffect, useState } from 'react';
import { ArrowRight, Rocket } from 'lucide-react';
import { api } from '../api';
import { Avatar, Loading, roleLabel } from '../ui';

export default function Login({ onSignIn }) {
  const [users, setUsers] = useState(null);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/users').then(setUsers).catch((e) => { setUsers([]); setError(e.message); });
  }, []);

  const login = async (address) => {
    setBusy(true); setError('');
    try { onSignIn(await api.post('/auth/login', { email: address })); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="login">
      <section className="hero">
        <div className="brand">
          <span className="logo"><Rocket size={20} /></span>
          <div><b>Clubs Hub</b><small style={{ color: '#b7b7bf' }}>El Sewedy International School</small></div>
        </div>
        <div>
          <h1>Every club, event and idea in one place.</h1>
          <p>Plan events, track club tasks, get notified when something changes, and tell your club leaders what you want next.</p>
        </div>
        <small style={{ color: '#7d7d86' }}>Demo sign-in: pick an account from the school database.</small>
      </section>

      <section className="form">
        <h2 style={{ fontSize: 28 }}>Sign in</h2>
        <p style={{ color: 'var(--muted)', marginTop: 4 }}>Use your school email, or pick an account below.</p>
        <form onSubmit={(e) => { e.preventDefault(); login(email); }}>
          <div className="field" style={{ marginTop: 16 }}>
            <label htmlFor="email">School email</label>
            <input id="email" type="email" required placeholder="name@elsewedy-schools.edu.eg" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <p style={{ color: 'var(--red)', margin: '0 0 12px' }} role="alert">{error}</p>}
          <button className="btn primary" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>
            Sign in <ArrowRight size={16} />
          </button>
        </form>

        <h3 style={{ fontSize: 15, marginTop: 28 }}>Accounts in this school</h3>
        {users === null ? <Loading /> : (
          <div className="accounts">
            {users.map((u) => (
              <button key={u.id} className="account" disabled={busy} onClick={() => login(u.email)}>
                <Avatar name={u.full_name} color={u.avatar_color} size={34} />
                <span><b>{u.full_name}</b><small>{roleLabel[u.role]}{u.grade ? ` · ${u.grade}` : ''}</small></span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
