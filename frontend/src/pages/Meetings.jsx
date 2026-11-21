import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, MapPin, Video, Plus, XCircle } from 'lucide-react';
import { api } from '../api';
import { Loading, Empty, useApp } from '../ui';

const localNow = () => {
  const d = new Date();
  const offset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - offset).toISOString().slice(0, 16);
};
const blank = () => ({ club_id: '', title: '', mode: 'online', starts_at: localNow(), ends_at: '', meeting_url: '', location: '' });

export default function Meetings() {
  const { clubs = [], canManage, toast } = useApp();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const manageable = useMemo(() => (clubs || []).filter(c => canManage(c.id)), [clubs, canManage]);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/club-meetings');
      setItems(Array.isArray(data) ? data : []);
    } catch (err) { toast(err.message, 'error'); }
    finally { setLoading(false); }
  }, [toast]);
  useEffect(() => { load(); }, [load]);

  const set = (key, value) => setForm(f => ({ ...f, [key]: value }));
  const create = async (event) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await api.post('/club-meetings', {
        club_id: form.club_id,
        title: form.title.trim(), mode: form.mode,
        meeting_date: form.starts_at.slice(0, 10),
        starts_at: new Date(form.starts_at).toISOString(),
        ends_at: new Date(form.ends_at).toISOString(),
        meeting_url: form.mode === 'online' ? form.meeting_url : null,
        location: form.mode === 'offline' ? form.location : null,
      });
      toast('Meeting created and members notified');
      setShowForm(false); setForm(blank()); await load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setBusy(false); }
  };
  const cancel = async (item) => {
    if (!window.confirm(`Cancel ${item.title}? Club members will be notified.`)) return;
    try { await api.patch(`/club-meetings/${item.id}/cancel`, {}); toast('Meeting cancelled'); await load(); }
    catch (err) { toast(err.message, 'error'); }
  };
  return (
    <div style={{ display: 'grid', gap: 22 }}>
      <div className="toolbar" style={{ display: 'flex', gap: 12, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <div><h2 style={{ margin: 0 }}>Meetings</h2><p style={{ color: 'var(--muted)', margin: '6px 0' }}>Create online or offline club meetings. Members get an automatic notification.</p></div>
        {manageable.length > 0 && <button className="btn primary" onClick={() => { setForm({ ...blank(), club_id: manageable[0]?.id || '' }); setShowForm(!showForm); }}><Plus size={16}/> Create Meeting</button>}
      </div>
      {showForm && <form onSubmit={create} className="attendance-event-card" style={{ display: 'grid', gap: 14 }}>
        <h3>Create Meeting</h3>
        <label className="field">Club<select className="select" required value={form.club_id} onChange={e => set('club_id', e.target.value)}>{manageable.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
        <label className="field">Title<input className="select" required maxLength={160} value={form.title} onChange={e => set('title', e.target.value)} placeholder="Weekly club meeting" /></label>
        <label className="field">Meeting Type<select className="select" value={form.mode} onChange={e => set('mode', e.target.value)}><option value="online">Online</option><option value="offline">Offline</option></select></label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
          <label className="field">Starts<input className="select" type="datetime-local" required value={form.starts_at} onChange={e => set('starts_at', e.target.value)} /></label>
          <label className="field">Ends<input className="select" type="datetime-local" required min={form.starts_at} value={form.ends_at} onChange={e => set('ends_at', e.target.value)} /></label>
        </div>
        {form.mode === 'online' ? <label className="field">Meeting Link<input className="select" type="url" pattern="https://.*" placeholder="https://meet.google.com/..." required value={form.meeting_url} onChange={e => set('meeting_url', e.target.value)} /></label> : <label className="field">Location<input className="select" maxLength={250} placeholder="Lab 3 / Room B" required value={form.location} onChange={e => set('location', e.target.value)} /></label>}
        <p style={{ color: 'var(--muted)', fontSize: 13 }}>Creating this meeting sends an announcement-style notification to club members.</p>
        <div style={{ display: 'flex', gap: 8 }}><button className="btn primary" type="submit" disabled={busy || !form.club_id}>{busy ? 'Saving...' : 'Save & Notify'}</button><button className="btn" type="button" onClick={() => setShowForm(false)}>Cancel</button></div>
      </form>}
      {loading ? <Loading/> : items.length === 0 ? <Empty icon={CalendarDays} title="No meetings yet" text="Club leaders can create meetings here."/> : <div style={{ display: 'grid', gap: 12 }}>
        {items.map(m => <div key={m.id} className="attendance-event-card" style={{ display: 'grid', gap: 8 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}><strong>{m.title}</strong><span className={`pill ${m.status === 'cancelled' ? 'warn' : 'ok'}`}>{m.status}</span></div>
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>{m.clubs?.name || 'Club'} · {new Date(m.starts_at).toLocaleString()} – {new Date(m.ends_at).toLocaleTimeString()}</div>
          {m.mode === 'online' ? <div><Video size={15} style={{ verticalAlign: -3 }} /> <a href={m.meeting_url} target="_blank" rel="noreferrer">Join online meeting</a></div> : <div><MapPin size={15} style={{ verticalAlign: -3 }} /> {m.location}</div>}
          {m.status !== 'cancelled' && canManage(m.club_id) && <div><button className="btn sm" onClick={() => cancel(m)}><XCircle size={14}/> Cancel Meeting</button></div>}
        </div>)}
      </div>}
    </div>
  );
}
