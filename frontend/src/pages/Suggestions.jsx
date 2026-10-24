import { useCallback, useEffect, useState } from 'react';
import { EyeOff, Lightbulb, MessageSquareReply, ThumbsUp } from 'lucide-react';
import { api } from '../api';
import { Avatar, ClubChip, Empty, Loading, fmt, useApp } from '../ui';

const STATUS = {
  new: ['New', ''], under_review: ['Under review', 'warn'], accepted: ['Accepted', 'ok'],
  rejected: ['Not planned', 'red'], implemented: ['Done', 'info'],
};
const CATEGORY = { event_idea: 'Event idea', activity: 'Club activity', facilities: 'Facilities', other: 'Other' };

export default function Suggestions() {
  const { clubs, canManage, toast } = useApp();
  const [items, setItems] = useState(null);
  const [filter, setFilter] = useState('all');
  const [replying, setReplying] = useState(null);

  const load = useCallback(() => {
    api.get('/suggestions').then(setItems).catch((e) => toast(e.message, 'error'));
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const vote = async (s) => {
    try { await api.post(`/suggestions/${s.id}/vote`); load(); } catch (e) { toast(e.message, 'error'); }
  };

  const shown = (items || []).filter((s) =>
    filter === 'all' ? true : filter === 'mine' ? s.is_mine : filter === 'open' ? ['new', 'under_review'].includes(s.status) : s.status === filter);

  return (
    <div className="split">
      <NewSuggestion clubs={clubs} onSent={load} />

      <div>
        <div className="toolbar">
          <div className="tabs">
            {[['all', 'All'], ['open', 'Open'], ['accepted', 'Accepted'], ['mine', 'Mine']].map(([id, label]) => (
              <button key={id} className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>{label}</button>
            ))}
          </div>
        </div>

        {items === null ? <Loading /> : shown.length === 0 ? (
          <Empty icon={Lightbulb} title="No suggestions yet" text="Share an idea using the form and others can vote on it." />
        ) : shown.map((s) => (
          <article key={s.id} className="sugg">
            <button className={`vote ${s.voted ? 'on' : ''}`} onClick={() => vote(s)} aria-pressed={s.voted} aria-label="Vote for this suggestion">
              <ThumbsUp size={16} /> {s.vote_count}
            </button>
            <div>
              <div className="top-line">
                <ClubChip club={s.clubs} />
                <span className="pill">{CATEGORY[s.category]}</span>
                <span className={`pill ${STATUS[s.status][1]}`}>{STATUS[s.status][0]}</span>
              </div>
              <h3>{s.title}</h3>
              <p style={{ margin: 0 }}>{s.body}</p>
              <div className="by" style={{ marginTop: 8 }}>
                {s.author ? <><Avatar name={s.author.full_name} color={s.author.avatar_color} size={20} /> {s.author.full_name}</>
                  : <><EyeOff size={14} /> Anonymous</>}
                {s.is_anonymous && s.is_mine && <span>(only you can see it's yours)</span>}
                <span>· {fmt.ago(s.created_at)}</span>
              </div>
              {s.response && <div className="reply"><small>Response from the club team</small>{s.response}</div>}
              {canManage(s.club_id) && (
                replying === s.id
                  ? <Respond s={s} onDone={() => { setReplying(null); load(); }} />
                  : <button className="btn sm" style={{ marginTop: 10 }} onClick={() => setReplying(s.id)}>
                      <MessageSquareReply size={14} /> {s.response ? 'Update response' : 'Respond'}
                    </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function NewSuggestion({ clubs, onSent }) {
  const { toast } = useApp();
  const blank = { club_id: '', category: 'event_idea', title: '', body: '', is_anonymous: false };
  const [f, setF] = useState(blank);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const send = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/suggestions', { ...f, club_id: f.club_id || null });
      toast('Thanks! Your suggestion was sent.');
      setF(blank); onSent();
    } catch (err) { toast(err.message, 'error'); }
    setBusy(false);
  };

  return (
    <form className="panel" onSubmit={send}>
      <h3>Share an idea</h3>
      <div className="field"><label>Who should see it?</label>
        <select value={f.club_id} onChange={set('club_id')}>
          <option value="">Whole school</option>
          {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>
      <div className="field"><label>Type</label>
        <select value={f.category} onChange={set('category')}>
          {Object.entries(CATEGORY).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div className="field"><label>Title</label><input value={f.title} onChange={set('title')} required maxLength={100} /></div>
      <div className="field"><label>Details</label><textarea value={f.body} onChange={set('body')} required placeholder="What would you like to see, and why?" /></div>
      <label className="check"><input type="checkbox" checked={f.is_anonymous} onChange={(e) => setF({ ...f, is_anonymous: e.target.checked })} /> Send anonymously</label>
      <button className="btn primary" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>Send suggestion</button>
    </form>
  );
}

function Respond({ s, onDone }) {
  const { toast } = useApp();
  const [status, setStatus] = useState(s.status === 'new' ? 'under_review' : s.status);
  const [response, setResponse] = useState(s.response || '');

  const save = async () => {
    try { await api.patch(`/suggestions/${s.id}/respond`, { status, response }); toast('Response sent'); onDone(); }
    catch (e) { toast(e.message, 'error'); }
  };

  return (
    <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
      <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Suggestion status">
        {Object.entries(STATUS).map(([v, [l]]) => <option key={v} value={v}>{l}</option>)}
      </select>
      <textarea className="select" style={{ width: '100%', minHeight: 70 }} placeholder="Write a response (optional)" value={response} onChange={(e) => setResponse(e.target.value)} />
      <div className="actions">
        <button className="btn sm primary" onClick={save}>Send response</button>
        <button className="btn sm" onClick={onDone}>Cancel</button>
      </div>
    </div>
  );
}
