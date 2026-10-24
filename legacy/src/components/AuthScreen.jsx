import { ArrowRight, GraduationCap, LockKeyhole, Mail } from 'lucide-react';
import './AuthScreen.css';

export default function AuthScreen({
  authMode,
  authEmail,
  authPassword,
  authMessage,
  authBusy,
  configured,
  onEmailChange,
  onPasswordChange,
  onModeChange,
  onSubmit,
}) {
  const signingUp = authMode === 'signup';

  return (
    <main className="auth-page">
      <header className="auth-header">
        <a className="auth-brand" href="/" aria-label="School Clubs home">
          <span className="auth-brand-mark"><GraduationCap size={19} /></span>
          <span>School<span>Clubs</span></span>
        </a>
        <span className="auth-header-note">CAMPUS COMMUNITY</span>
      </header>

      <div className="auth-content">
        <section className="auth-intro" aria-labelledby="auth-title">
          <span className="auth-kicker">SCHOOL CLUBS</span>
          <h1 id="auth-title">Campus life,<br /><span>in good company.</span></h1>
          <p>Sign in to pick up where your community left off.</p>
          <div className="auth-intro-rule" />
          <span className="auth-intro-caption">YOUR CLUBS. YOUR PEOPLE. YOUR NEXT IDEA.</span>
        </section>

        <section className="auth-panel" aria-labelledby="auth-form-title">
          <div className="auth-panel-heading">
            <span className="auth-kicker">{signingUp ? 'GET STARTED' : 'WELCOME BACK'}</span>
            <h2 id="auth-form-title">{signingUp ? 'Create your account' : 'Sign in'}</h2>
            <p>{signingUp ? 'Start with a fresh school clubs workspace.' : 'Use your account email and password.'}</p>
          </div>

          <form className="auth-form" onSubmit={onSubmit}>
            <label htmlFor="auth-email">Email address</label>
            <div className="auth-input-wrap">
              <Mail size={17} aria-hidden="true" />
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@school.edu"
                value={authEmail}
                onChange={onEmailChange}
              />
            </div>

            <div className="auth-password-label">
              <label htmlFor="auth-password">Password</label>
              {signingUp && <span>At least 6 characters</span>}
            </div>
            <div className="auth-input-wrap">
              <LockKeyhole size={17} aria-hidden="true" />
              <input
                id="auth-password"
                type="password"
                required
                minLength={6}
                autoComplete={signingUp ? 'new-password' : 'current-password'}
                placeholder="Enter your password"
                value={authPassword}
                onChange={onPasswordChange}
              />
            </div>

            {authMessage && <p className="auth-message" role="alert">{authMessage}</p>}
            {!configured && <p className="auth-message" role="alert">Supabase is not configured. Add the project URL and publishable key to `.env`, then restart the app.</p>}

            <button className="auth-submit" type="submit" disabled={!configured || authBusy}>
              <span>{authBusy ? 'Please wait…' : signingUp ? 'Create account' : 'Sign in'}</span>
              {!authBusy && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="auth-mode-switch">
            <span>{signingUp ? 'Already have an account?' : 'New to School Clubs?'}</span>
            <button type="button" onClick={onModeChange}>
              {signingUp ? 'Sign in' : 'Create an account'}
            </button>
          </div>
          <div className="auth-panel-footer"><span />SECURE SCHOOL CLUBS ACCESS<span /></div>
        </section>
      </div>
      <footer className="auth-footer">SCHOOL CLUBS <span>•</span> A PLACE TO BELONG</footer>
    </main>
  );
}