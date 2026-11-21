import { useCallback, useEffect, useState } from 'react';
import { Ban, CalendarDays, Clock, MapPin, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { api } from '../api';
import { ClubChip, Empty, Loading, Modal, fmt, useApp } from '../ui';

const TABS = [['upcoming', 'Upcoming'], ['mine', 'My registrations'], ['past', 'Past and cancelled']];

export default function Events() {
  const { user, clubs, manageable, canManage, toast } = useApp();
  const [events, setEvents] = useState(null);
  const [proposals, setProposals] = useState(null);
  const [proposalError, setProposalError] = useState('');
  const [tab, setTab] = useState(() => location.hash === '#event-proposals' && user.role === 'admin' ? 'proposals' : 'upcoming');
  const [clubId, setClubId] = useState('');
  const [form, setForm] = useState(null);

  const load = useCallback(() => {
    api.get('/events' + (clubId ? `?club_id=${clubId}` : '')).then(setEvents).catch((e) => toast(e.message, 'error'));
    setProposals(null);
    setProposalError('');
    api.get('/event-proposals').then(setProposals).catch((e) => setProposalError(e.message));
  }, [clubId, toast]);
  useEffect(() => { load(); }, [load]);

  const now = Date.now();
  const isPast = (e) => e.status === 'completed' || new Date(e.ends_at) < now;
  const isMine = (e) => e.event_registrations.some((r) => r.user_id === user.id);
  const live = (e) => !isPast(e) && e.status !== 'cancelled';

  const all = events || [];
  const shown = all.filter((e) => (tab === 'upcoming' ? live(e) : tab === 'mine' ? isMine(e) && live(e) : !live(e)));
  const weekAhead = all.filter((e) => live(e) && new Date(e.starts_at) - now < 7 * 864e5).length;

  const act = async (fn, okText) => {
    try { await fn(); if (okText) toast(okText); load(); } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <>
      <div className="stats">
        <div className="stat"><b>{all.filter(live).length}</b><span>Upcoming events</span></div>
        <div className="stat hot"><b>{weekAhead}</b><span>Happening in the next 7 days</span></div>
        <div className="stat"><b>{all.filter((e) => live(e) && isMine(e)).length}</b><span>Events you're registered for</span></div>
      </div>

      <div className="toolbar">
        <div className="tabs" role="tablist">
          {[...TABS, [user.role === 'admin' ? 'proposals' : 'my-proposals', user.role === 'admin' ? 'Event proposals' : 'My proposals']].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
        <select className="select" value={clubId} onChange={(e) => setClubId(e.target.value)} aria-label="Filter by club">
          <option value="">All clubs</option>
          {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span className="spacer" />
        {manageable.length > 0 && (
          <button className="btn primary" onClick={() => setForm({ club_id: manageable[0].id })}><Plus size={16} /> New event</button>
        )}
        {user.role !== 'admin' && clubs.length > 0 && (
          <button className="btn primary" onClick={() => setForm({ proposal: true, club_id: clubs[0].id })}><Plus size={16} /> Propose event</button>
        )}
      </div>

      {tab === 'proposals' || tab === 'my-proposals' ? proposalError ? <p className="page-error" role="alert">{proposalError}</p> : proposals === null ? <Loading /> : proposals.length === 0 ? (
        <Empty icon={CalendarDays} title={tab === 'proposals' ? 'No pending event proposals' : 'No event proposals yet'}
          text={tab === 'proposals' ? 'New member proposals will appear here for review.' : 'Propose an event and track its review here.'} />
      ) : (
        <div className="proposal-list">
          {proposals.map((proposal) => (
            <article key={proposal.id} className="proposal-card">
              <div className="proposal-card-heading">
                <ClubChip club={proposal.clubs} />
                <span className={`pill ${proposal.status === 'approved' ? 'ok' : proposal.status === 'rejected' ? 'red' : ''}`}>{proposal.status}</span>
              </div>
              <h3>{proposal.title}</h3>
              {proposal.description && <p className="desc">{proposal.description}</p>}
              <div className="meta">
                <span><Clock size={14} /> {fmt.date(proposal.starts_at)}, {fmt.time(proposal.starts_at)} to {fmt.time(proposal.ends_at)}</span>
                {proposal.location && <span><MapPin size={14} /> {proposal.location}</span>}
                {user.role === 'admin' && <span>Proposed by {proposal.author?.full_name || 'Member'}</span>}
              </div>
              {proposal.review_note && <p className="proposal-note">Review note: {proposal.review_note}</p>}
              {user.role === 'admin' && (
                <div className="proposal-actions">
                  <button className="btn sm primary" onClick={() => act(() => api.post(`/event-proposals/${proposal.id}/review`, { status: 'approved' }), 'Proposal approved and event published')}>Approve</button>
                  <button className="btn sm" onClick={() => act(() => api.post(`/event-proposals/${proposal.id}/review`, { status: 'rejected' }), 'Proposal declined')}>Decline</button>
                </div>
              )}
            </article>
          ))}
        </div>
      ) : events === null ? <Loading /> : shown.length === 0 ? (
        <Empty icon={CalendarDays} title="No events here"
          text={tab === 'mine' ? 'Register for an event and it will show up here.' : 'Try another tab or club.'} />
      ) : (
        <div className="event-grid">
          {shown.map((e) => {
            const taken = e.event_registrations.length;
            const full = e.capacity != null && taken >= e.capacity;
            const mine = isMine(e);
            const manage = canManage(e.club_id);
            return (
              <article key={e.id} className={`event ${e.status === 'cancelled' ? 'cancelled' : isPast(e) ? 'past' : ''}`}>
                <div className="date-tile"><b>{fmt.day(e.starts_at)}</b><span>{fmt.mon(e.starts_at)}</span></div>
                <div>
                  <ClubChip club={e.clubs} />
                  <h3>{e.title}</h3>
                  {e.description && <p className="desc">{e.description}</p>}
                  <div className="meta">
                    <span><Clock size={14} /> {fmt.date(e.starts_at)}, {fmt.time(e.starts_at)} to {fmt.time(e.ends_at)}</span>
                    {e.location && <span><MapPin size={14} /> {e.location}</span>}
                    <span><Users size={14} /> {taken} registered{e.capacity ? ` of ${e.capacity}` : ''}</span>
                  </div>
                  {e.capacity && <div className="bar" aria-hidden><i style={{ width: `${Math.min(100, (taken / e.capacity) * 100)}%` }} /></div>}
                  <div className="actions">
                    {e.status === 'cancelled' ? <span className="pill red">Cancelled</span>
                      : isPast(e) ? <span className="pill">Finished</span>
                      : mine ? <button className="btn sm" onClick={() => act(() => api.del(`/events/${e.id}/register`), 'Registration cancelled')}>Cancel registration</button>
                      : <button className="btn sm primary" disabled={full} onClick={() => act(() => api.post(`/events/${e.id}/register`), "You're registered")}>{full ? 'Event is full' : 'Register'}</button>}
                    {mine && live(e) && <span className="pill ok">Registered</span>}
                    <span className="spacer" />
                    {manage && (
                      <>
                        <button className="link-btn" aria-label="Edit event" onClick={() => setForm({ ...e, starts_at: fmt.toInput(e.starts_at), ends_at: fmt.toInput(e.ends_at) })}><Pencil size={16} /></button>
                        {e.status !== 'cancelled' && live(e) && (
                          <button className="link-btn" aria-label="Cancel event" onClick={() => window.confirm(`Cancel "${e.title}"? Registered students will be notified.`) && act(() => api.put(`/events/${e.id}`, { status: 'cancelled' }), 'Event cancelled')}><Ban size={16} /></button>
                        )}
                        <button className="link-btn" aria-label="Delete event" onClick={() => window.confirm(`Delete "${e.title}" permanently?`) && act(() => api.del(`/events/${e.id}`), 'Event deleted')}><Trash2 size={16} /></button>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {form && <EventForm initial={form} onClose={() => setForm(null)} onSaved={() => { setForm(null); load(); }} />}
    </>
  );
}

function EventForm({ initial, onClose, onSaved }) {
  const { clubs, manageable, toast } = useApp();
  const editing = !!initial.id;
  const isProposal = !!initial.proposal;
  const [f, setF] = useState({
    club_id: initial.club_id, title: initial.title || '', description: initial.description || '',
    location: initial.location || '', starts_at: initial.starts_at || '', ends_at: initial.ends_at || '',
    capacity: initial.capacity ?? '',
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      club_id: f.club_id,
      title: f.title, description: f.description || null, location: f.location || null,
      starts_at: new Date(f.starts_at).toISOString(), ends_at: new Date(f.ends_at).toISOString(),
      capacity: f.capacity ? Number(f.capacity) : null,
    };
    try {
      if (editing) await api.put(`/events/${initial.id}`, payload);
      else if (isProposal) await api.post('/event-proposals', payload);
      else await api.post('/events', payload);
      toast(editing ? 'Event updated' : isProposal ? 'Proposal submitted for administrator review.' : 'Event created. Club members were notified.');
      onSaved();
    } catch (err) { toast(err.message, 'error'); setBusy(false); }
  };

  return (
    <Modal title={editing ? 'Edit event' : isProposal ? 'Propose an event' : 'New event'} onClose={onClose}>
      <form onSubmit={save}>
        {!editing && (
          <div className="field"><label>Club</label>
            <select value={f.club_id} onChange={set('club_id')} required>
              {(isProposal ? clubs : manageable).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        <div className="field"><label>Title</label><input value={f.title} onChange={set('title')} required maxLength={120} /></div>
        <div className="field"><label>Description</label><textarea value={f.description || ''} onChange={set('description')} /></div>
        <div className="row2">
          <div className="field"><label>Starts</label><input type="datetime-local" value={f.starts_at} onChange={set('starts_at')} required /></div>
          <div className="field"><label>Ends</label><input type="datetime-local" value={f.ends_at} onChange={set('ends_at')} required /></div>
        </div>
        <div className="row2">
          <div className="field"><label>Location</label><input value={f.location || ''} onChange={set('location')} /></div>
          <div className="field"><label>Capacity (optional)</label><input type="number" min="1" value={f.capacity} onChange={set('capacity')} /></div>
        </div>
        <div className="foot">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{editing ? 'Save changes' : isProposal ? 'Submit proposal' : 'Create event'}</button>
        </div>
      </form>
    </Modal>
  );
}
