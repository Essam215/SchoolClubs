import { useState } from 'react';
import { ArrowRight, CalendarDays, Check, LockKeyhole, Mail, Rocket, Sparkles, Users } from 'lucide-react';
import { api } from '../api';

export default function Login({ onSignIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);


  const login = async (address) => {
    setBusy(true); setError('');
    try { onSignIn(await api.post('/auth/login', { email: address, password })); }
    catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="login">
      <section className="hero">
        <div className="brand">
          <span className="logo"><Rocket size={20} /></span>
          <div><b>Clubs Hub</b><small>El Sewedy International School</small></div>
        </div>
        <div className="hero-content">
          <span className="eyebrow"><Sparkles size={14} /> YOUR SCHOOL, IN FULL COLOR</span>
          <h1>Find your people. <em>Make it happen.</em></h1>
          <p>From first ideas to big school moments, everything your club makes possible starts here.</p>
          <div className="club-preview" aria-label="Club Hub features">
            <div className="preview-top">
              <span className="preview-icon"><CalendarDays size={17} /></span>
              <span><small>UP NEXT</small><b>More moments to make</b></span>
              <span className="preview-check"><Check size={15} /></span>
            </div>
            <div className="preview-bottom">
              <span><Users size={15} /> Clubs, people & ideas</span>
              <span className="preview-dots"><i /><i /><i /><i /></span>
            </div>
          </div>
        </div>
        <small className="hero-footnote">A home for every club at El Sewedy International School</small>
      </section>

      <section className="form">
        <div className="form-heading">
          <span className="form-kicker">WELCOME TO CLUBS HUB</span>
          <h2>Let’s get you in.</h2>
          <p>Sign in with your school email and password.</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); login(email); }}>
          <div className="field auth-field">
            <label htmlFor="email">School email</label>
            <span className="auth-input-wrap">
              <Mail size={17} aria-hidden="true" />
              <input id="email" type="email" required placeholder="name@elsewedy-schools.edu.eg" value={email} onChange={(e) => setEmail(e.target.value)} />
            </span>
          </div>
          <div className="field auth-field">
            <label htmlFor="password">Password</label>
            <span className="auth-input-wrap">
              <LockKeyhole size={17} aria-hidden="true" />
              <input id="password" type="password" required minLength={6} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </span>
          </div>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <button className="btn primary auth-submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Continue with email'} <ArrowRight size={17} />
          </button>
        </form>

        <p className="auth-note">Use your individual Supabase Auth account credentials. Demo shortcuts have been removed.</p>
      </section>
    </div>
  );
}
