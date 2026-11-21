import { useCallback, useEffect, useState } from 'react';
import { Award, CalendarCheck, Check, LockKeyhole, Sparkles, Trophy } from 'lucide-react';
import { api } from '../api';
import { Empty, Loading, Modal, useApp } from '../ui';

const BADGE_ICONS = {
  sparkles: Sparkles,
  check: Check,
  calendar: CalendarCheck,
  trophy: Trophy,
  award: Award,
};

export default function Gamification() {
  const { user, manageable, toast } = useApp();
  const [progress, setProgress] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [awardForm, setAwardForm] = useState(null);

  const load = useCallback(() => {
    setLoadError('');
    api.get('/gamification').then(setProgress).catch((error) => {
      setProgress(null);
      setLoadError(error.message);
    });
  }, []);
  useEffect(() => { load(); }, [load]);

  if (loadError) return <p className="page-error" role="alert">{loadError}</p>;
  if (!progress) return <Loading />;

  const unlocked = progress.badges.filter((badge) => badge.unlocked).length;
  const nextLevelXp = progress.next_level_xp - progress.xp;

  return (
    <>
      <section className="gamification-hero">
        <div className="gamification-hero-copy">
          <span className="gamification-eyebrow"><Sparkles size={14} /> YOUR CLUB JOURNEY</span>
          <h2>Keep growing, {user.full_name.split(' ')[0]}</h2>
          <p>Every task completed, event attended, and contribution recognized moves you forward.</p>
        </div>
        <div className="level-card">
          <span className="level-icon"><Trophy size={21} /></span>
          <div><small>Current level</small><b>Level {progress.level}</b></div>
          <strong>{progress.xp}<small> XP</small></strong>
        </div>
      </section>

      <section className="progress-card">
        <div className="progress-heading">
          <div><h3>Level {progress.level} progress</h3><p>{nextLevelXp} XP to your next level</p></div>
          <span>{progress.xp} / {progress.next_level_xp} XP</span>
        </div>
        <div className="gamification-progress" role="progressbar" aria-valuenow={progress.level_progress} aria-valuemin="0" aria-valuemax="100">
          <i style={{ width: `${progress.level_progress}%` }} />
        </div>
      </section>

      <div className="gamification-stats">
        <article className="gamification-stat"><Check size={19} /><b>{progress.completed_tasks}</b><span>Tasks completed</span></article>
        <article className="gamification-stat"><CalendarCheck size={19} /><b>{progress.attended_events}</b><span>Events attended</span></article>
        <article className="gamification-stat"><Award size={19} /><b>{unlocked} / {progress.badges.length}</b><span>Badges earned</span></article>
      </div>

      <section className="badges-section">
        <div className="section-heading">
          <div><h3>Your achievements</h3><p>Unlock badges by taking part in club activities.</p></div>
          {manageable.length > 0 && <button className="btn primary" onClick={() => setAwardForm({ club_id: manageable[0].id })}>Recognize a member</button>}
        </div>
        {progress.badges.length === 0 ? (
          <Empty icon={Award} title="No achievements yet" text="Get involved in club activities to start earning badges." />
        ) : (
          <div className="badge-grid">
            {progress.badges.map((badge) => {
              const Icon = BADGE_ICONS[badge.icon] || Award;
              return (
                <article key={badge.id} className={`achievement-card${badge.unlocked ? ' unlocked' : ''}`}>
                  <span className="achievement-icon">{badge.unlocked ? <Icon size={21} /> : <LockKeyhole size={19} />}</span>
                  <div className="achievement-copy">
                    <h4>{badge.title}</h4>
                    <p>{badge.description}</p>
                    <div className="achievement-progress"><i style={{ width: `${Math.min(100, badge.progress / badge.goal * 100)}%` }} /></div>
                    <small>{badge.unlocked ? 'Earned' : `${badge.progress} / ${badge.goal}`}</small>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="recent-awards">
        <div className="section-heading"><div><h3>Recent recognition</h3><p>Points awarded by your club staff.</p></div></div>
        {progress.recent_awards.length === 0 ? (
          <p className="muted">No points have been awarded yet. Keep contributing to your club.</p>
        ) : (
          <div className="recognition-list">
            {progress.recent_awards.map((award, index) => (
              <article key={`${award.created_at}-${index}`}>
                <span className="recognition-points">+{award.points} XP</span>
                <div><b>{award.reason}</b><small>{award.club_name} · {new Date(award.created_at).toLocaleDateString()}</small></div>
              </article>
            ))}
          </div>
        )}
      </section>

      {awardForm && <AwardForm initial={awardForm} onClose={() => setAwardForm(null)} onSaved={() => { setAwardForm(null); load(); }} />}
    </>
  );
}

function AwardForm({ initial, onClose, onSaved }) {
  const { clubs, manageable, toast } = useApp();
  const [form, setForm] = useState({ club_id: initial.club_id, user_id: '', points: '10', reason: '' });
  const [busy, setBusy] = useState(false);
  const club = clubs.find((item) => item.id === form.club_id);
  const members = club?.club_members.map((member) => member.users) || [];
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api.post('/gamification/awards', {
        club_id: form.club_id,
        user_id: form.user_id,
        points: Number(form.points),
        reason: form.reason.trim(),
      });
      toast('Recognition points awarded');
      onSaved();
    } catch (error) {
      toast(error.message, 'error');
      setBusy(false);
    }
  };

  return (
    <Modal title="Recognize a member" onClose={onClose}>
      <form onSubmit={save}>
        <div className="field"><label htmlFor="award-club">Club</label>
          <select id="award-club" value={form.club_id} onChange={(event) => setForm((current) => ({ ...current, club_id: event.target.value, user_id: '' }))} required>
            {manageable.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
        </div>
        <div className="field"><label htmlFor="award-member">Student</label>
          <select id="award-member" value={form.user_id} onChange={set('user_id')} required>
            <option value="">Choose a club member</option>
            {members.map((member) => <option key={member.id} value={member.id}>{member.full_name}</option>)}
          </select>
        </div>
        <div className="row2">
          <div className="field"><label htmlFor="award-points">Points (1–100)</label>
            <input id="award-points" type="number" min="1" max="100" value={form.points} onChange={set('points')} required />
          </div>
          <div className="field"><label htmlFor="award-reason">Reason</label>
            <input id="award-reason" value={form.reason} onChange={set('reason')} maxLength={160} required />
          </div>
        </div>
        <div className="modal-actions"><button type="button" className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={busy || members.length === 0}>{busy ? 'Saving…' : 'Award points'}</button></div>
      </form>
    </Modal>
  );
}
