import { useCallback, useEffect, useState } from 'react';
import { Award, Crown, Medal, Plus, Sparkles, Trophy } from 'lucide-react';
import { api } from '../api';
import { Avatar, Empty, Loading, Modal, useApp } from '../ui';

export default function Leaderboard() {
  const { user, clubs, manageable, toast } = useApp();
  const [entries, setEntries] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [clubId, setClubId] = useState('');
  const [period, setPeriod] = useState('all');
  const [awardForm, setAwardForm] = useState(null);

  const load = useCallback(() => {
    const query = new URLSearchParams({ period });
    if (clubId) query.set('club_id', clubId);
    setLoadError('');
    api.get(`/leaderboard?${query}`).then(setEntries).catch((error) => {
      setEntries([]);
      setLoadError(error.message);
    });
  }, [clubId, period]);
  useEffect(() => { load(); }, [load]);

  const myEntry = (entries || []).find((entry) => entry.user.id === user.id);
  const podium = [entries?.[1], entries?.[0], entries?.[2]];
  const remaining = (entries || []).slice(3);
  const topPoints = entries?.[0]?.points || 0;
  return (
    <>
      <section className="leaderboard-hero">
        <div className="leaderboard-hero-copy">
          <span className="leaderboard-eyebrow"><Sparkles size={14} /> CLUB COMMUNITY</span>
          <h2>Leaderboard</h2>
          <p>Big contributions deserve a little recognition. See who’s making an impact across our clubs.</p>
        </div>
        <div className="leaderboard-your-rank">
          <span className="leaderboard-your-icon"><Award size={20} /></span>
          <div>
            <small>Your standing</small>
            <b>{myEntry ? `#${myEntry.rank} · ${myEntry.points} pts` : 'Earn your first points'}</b>
          </div>
        </div>
      </section>

      <div className="toolbar leaderboard-toolbar">
        <div className="tabs" role="tablist" aria-label="Leaderboard period">
          <button role="tab" aria-selected={period === 'all'} className={period === 'all' ? 'on' : ''} onClick={() => setPeriod('all')}>All time</button>
          <button role="tab" aria-selected={period === 'month'} className={period === 'month' ? 'on' : ''} onClick={() => setPeriod('month')}>Last 30 days</button>
        </div>
        <select className="select" value={clubId} onChange={(event) => setClubId(event.target.value)} aria-label="Filter by club">
          <option value="">All clubs</option>
          {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
        </select>
        <span className="spacer" />
        {manageable.length > 0 && (
          <button className="btn primary" onClick={() => setAwardForm({ club_id: manageable[0].id })}>
            <Plus size={16} /> Award points
          </button>
        )}
        {entries && <span className="leaderboard-count">{entries.length} {entries.length === 1 ? 'student' : 'students'}</span>}
      </div>

      {loadError && <p className="page-error" role="alert">{loadError}</p>}
      {entries === null ? <Loading /> : entries.length === 0 ? (
        <Empty icon={Trophy} title="No points yet" text="Points awarded by club staff will appear here." />
      ) : (
        <>
          <section className="leaderboard-podium" aria-label="Top three students">
            {podium.map((entry) => entry && (
              <article key={entry.user.id} className={`podium-card podium-place-${entry.rank}${entry.user.id === user.id ? ' is-you' : ''}`}>
                <span className="podium-medal">{entry.rank === 1 ? <Crown size={19} /> : <Medal size={19} />}</span>
                <Avatar name={entry.user.full_name} color={entry.user.avatar_color} size={entry.rank === 1 ? 64 : 54} />
                <strong>{entry.user.full_name}{entry.user.id === user.id && <span className="you-tag">YOU</span>}</strong>
                <small>{entry.user.grade || 'School community'}</small>
                <b className="podium-points">{entry.points}<span>pts</span></b>
                <div className="podium-base"><span>{entry.rank}</span></div>
              </article>
            ))}
          </section>

          {remaining.length > 0 && (
            <section className="leaderboard-list-section">
              <div className="leaderboard-list-heading">
                <div><h3>All rankings</h3><p>Every point counts. Keep showing up for your club.</p></div>
                <span>POINTS</span>
              </div>
              <div className="leaderboard-list">
                {remaining.map((entry) => (
                  <article key={entry.user.id} className={`leaderboard-row${entry.user.id === user.id ? ' is-you' : ''}`}>
                    <span className="leaderboard-rank">{String(entry.rank).padStart(2, '0')}</span>
                    <Avatar name={entry.user.full_name} color={entry.user.avatar_color} size={42} />
                    <div className="leaderboard-person">
                      <b>{entry.user.full_name}{entry.user.id === user.id && <span className="you-tag">YOU</span>}</b>
                      <small>{entry.user.grade || 'School community'} · {entry.award_count} {entry.award_count === 1 ? 'award' : 'awards'}</small>
                    </div>
                    <div className="leaderboard-progress" aria-label={`${Math.round((entry.points / topPoints) * 100)} percent of top score`}>
                      <i style={{ width: `${Math.max(4, (entry.points / topPoints) * 100)}%` }} />
                    </div>
                    <span className="leaderboard-score">{entry.points}<small>pts</small></span>
                  </article>
                ))}
              </div>
            </section>
          )}
        </>
      )}

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
      await api.post('/leaderboard/awards', {
        club_id: form.club_id,
        user_id: form.user_id,
        points: Number(form.points),
        reason: form.reason.trim(),
      });
      toast('Points awarded');
      onSaved();
    } catch (error) {
      toast(error.message, 'error');
      setBusy(false);
    }
  };

  return (
    <Modal title="Award leaderboard points" onClose={onClose}>
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
