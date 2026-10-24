import { useCallback, useEffect, useState } from 'react';
import { ListTodo, Pencil, Plus, Trash2 } from 'lucide-react';
import { api } from '../api';
import { Avatar, ClubChip, Empty, Loading, Modal, fmt, useApp } from '../ui';

const COLUMNS = [['todo', 'To do'], ['in_progress', 'In progress'], ['review', 'In review'], ['done', 'Done']];
const PRIORITY = { high: ['High', 'red'], medium: ['Medium', 'warn'], low: ['Low', 'ok'] };

export default function Tasks() {
  const { user, clubs, manageable, canManage, toast } = useApp();
  const [tasks, setTasks] = useState(null);
  const [events, setEvents] = useState([]);
  const [scope, setScope] = useState('mine');
  const [clubId, setClubId] = useState('');
  const [form, setForm] = useState(null);

  const load = useCallback(() => {
    api.get('/tasks' + (clubId ? `?club_id=${clubId}` : '')).then(setTasks).catch((e) => toast(e.message, 'error'));
  }, [clubId, toast]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { api.get('/events').then(setEvents).catch(() => {}); }, []);

  const all = tasks || [];
  const visible = all.filter((t) => scope === 'all' || t.assigned_to === user.id);
  const today = new Date().toISOString().slice(0, 10);
  const overdue = (t) => t.due_date && t.status !== 'done' && t.due_date < today;

  const move = async (task, status) => {
    try { await api.patch(`/tasks/${task.id}`, { status }); load(); } catch (e) { toast(e.message, 'error'); }
  };
  const remove = async (task) => {
    if (!window.confirm(`Delete "${task.title}"?`)) return;
    try { await api.del(`/tasks/${task.id}`); toast('Task deleted'); load(); } catch (e) { toast(e.message, 'error'); }
  };

  return (
    <>
      <div className="stats">
        <div className="stat"><b>{all.filter((t) => t.assigned_to === user.id && t.status !== 'done').length}</b><span>Your open tasks</span></div>
        <div className="stat hot"><b>{all.filter(overdue).length}</b><span>Overdue tasks</span></div>
        <div className="stat"><b>{all.filter((t) => t.status === 'done').length}</b><span>Completed</span></div>
      </div>

      <div className="toolbar">
        <div className="tabs">
          <button className={scope === 'mine' ? 'on' : ''} onClick={() => setScope('mine')}>My tasks</button>
          <button className={scope === 'all' ? 'on' : ''} onClick={() => setScope('all')}>All club tasks</button>
        </div>
        <select className="select" value={clubId} onChange={(e) => setClubId(e.target.value)} aria-label="Filter by club">
          <option value="">All clubs</option>
          {clubs.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <span className="spacer" />
        {manageable.length > 0 && (
          <button className="btn primary" onClick={() => setForm({ club_id: manageable[0].id })}><Plus size={16} /> New task</button>
        )}
      </div>

      {tasks === null ? <Loading /> : visible.length === 0 ? (
        <Empty icon={ListTodo} title="No tasks here"
          text={scope === 'mine' ? 'Nothing is assigned to you. Switch to all club tasks to see the rest.' : 'Create a task to get started.'} />
      ) : (
        <div className="board">
          {COLUMNS.map(([status, label]) => {
            const items = visible.filter((t) => t.status === status);
            return (
              <section key={status} className="col">
                <h3>{label} <span>{items.length}</span></h3>
                {items.map((t) => {
                  const manage = canManage(t.club_id);
                  const canMove = manage || t.assigned_to === user.id;
                  return (
                    <article key={t.id} className={`task ${t.priority}`}>
                      <ClubChip club={t.clubs} />
                      <h4>{t.title}</h4>
                      {t.description && <p>{t.description}</p>}
                      {t.events && <span className="pill info">{t.events.title}</span>}
                      <div className="foot">
                        {t.due_date && <span className={`due ${overdue(t) ? 'late' : ''}`}>{overdue(t) ? 'Overdue: ' : 'Due '}{fmt.date(t.due_date + 'T00:00')}</span>}
                        <span className="spacer" />
                        <span className={`pill ${PRIORITY[t.priority][1]}`}>{PRIORITY[t.priority][0]}</span>
                        {t.assignee && <Avatar name={t.assignee.full_name} color={t.assignee.avatar_color} size={26} />}
                      </div>
                      {canMove && (
                        <select value={t.status} onChange={(e) => move(t, e.target.value)} aria-label={`Status of ${t.title}`}>
                          {COLUMNS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                        </select>
                      )}
                      {manage && (
                        <div className="foot">
                          <span className="spacer" />
                          <button className="link-btn" aria-label="Edit task" onClick={() => setForm(t)}><Pencil size={15} /></button>
                          <button className="link-btn" aria-label="Delete task" onClick={() => remove(t)}><Trash2 size={15} /></button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </section>
            );
          })}
        </div>
      )}

      {form && <TaskForm initial={form} events={events} onClose={() => setForm(null)} onSaved={() => { setForm(null); load(); }} />}
    </>
  );
}

function TaskForm({ initial, events, onClose, onSaved }) {
  const { clubs, manageable, toast } = useApp();
  const editing = !!initial.id;
  const [f, setF] = useState({
    club_id: initial.club_id, title: initial.title || '', description: initial.description || '',
    priority: initial.priority || 'medium', due_date: initial.due_date || '',
    assigned_to: initial.assigned_to || '', event_id: initial.event_id || '',
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const club = clubs.find((c) => c.id === f.club_id);
  const members = club ? club.club_members.map((m) => m.users) : [];
  const clubEvents = events.filter((e) => e.club_id === f.club_id && e.status !== 'cancelled');

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      title: f.title, description: f.description || null, priority: f.priority,
      due_date: f.due_date || null, assigned_to: f.assigned_to || null, event_id: f.event_id || null,
    };
    try {
      if (editing) await api.patch(`/tasks/${initial.id}`, payload);
      else await api.post('/tasks', { ...payload, club_id: f.club_id });
      toast(editing ? 'Task updated' : 'Task created');
      onSaved();
    } catch (err) { toast(err.message, 'error'); setBusy(false); }
  };

  return (
    <Modal title={editing ? 'Edit task' : 'New task'} onClose={onClose}>
      <form onSubmit={save}>
        {!editing && (
          <div className="field"><label>Club</label>
            <select value={f.club_id} onChange={(e) => setF({ ...f, club_id: e.target.value, assigned_to: '', event_id: '' })} required>
              {manageable.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}
        <div className="field"><label>Title</label><input value={f.title} onChange={set('title')} required maxLength={120} /></div>
        <div className="field"><label>Description</label><textarea value={f.description} onChange={set('description')} /></div>
        <div className="row2">
          <div className="field"><label>Assign to</label>
            <select value={f.assigned_to} onChange={set('assigned_to')}>
              <option value="">Unassigned</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.full_name}</option>)}
            </select>
          </div>
          <div className="field"><label>Priority</label>
            <select value={f.priority} onChange={set('priority')}>
              <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
            </select>
          </div>
        </div>
        <div className="row2">
          <div className="field"><label>Due date</label><input type="date" value={f.due_date} onChange={set('due_date')} /></div>
          <div className="field"><label>Related event</label>
            <select value={f.event_id} onChange={set('event_id')}>
              <option value="">None</option>
              {clubEvents.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}
            </select>
          </div>
        </div>
        <div className="foot">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={busy}>{editing ? 'Save changes' : 'Create task'}</button>
        </div>
      </form>
    </Modal>
  );
}
