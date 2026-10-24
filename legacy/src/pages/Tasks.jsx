import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  TASK_STATUS, TASK_STATUS_LABELS,
  TASK_PRIORITY, TASK_PRIORITY_LABELS
} from '../lib/schema';
import {
  CheckSquare, Plus, Clock, User, Zap, X,
  CheckCircle2, ArrowRight, Filter, Tag,
  Paperclip, Star, MessageCircle, ChevronDown,
  Trash2, Edit3, AlertTriangle, Send, BarChart2
} from 'lucide-react';
import './Tasks.css';

// ─── Column config ─────────────────────────────────────────────
const COLUMNS = [
  { key: TASK_STATUS.PENDING,     label: 'Pending',     color: '#6B7280' },
  { key: TASK_STATUS.IN_PROGRESS, label: 'In Progress', color: '#F59E0B' },
  { key: TASK_STATUS.SUBMITTED,   label: 'Submitted',   color: '#3B82F6' },
  { key: TASK_STATUS.APPROVED,    label: 'Approved',    color: '#8B5CF6' },
  { key: TASK_STATUS.COMPLETED,   label: 'Completed',   color: '#10B981' },
];

const PRIORITY_COLORS = {
  [TASK_PRIORITY.LOW]:    { bg: 'rgba(16,185,129,0.15)', text: '#10B981' },
  [TASK_PRIORITY.MEDIUM]: { bg: 'rgba(245,158,11,0.15)', text: '#F59E0B' },
  [TASK_PRIORITY.HIGH]:   { bg: 'rgba(239,68,68,0.15)',  text: '#EF4444' },
  [TASK_PRIORITY.URGENT]: { bg: 'rgba(220,38,38,0.25)',  text: '#DC2626' },
};

function StarRating({ value }) {
  return (
    <span className="star-rating">
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={12} fill={i <= value ? '#F59E0B' : 'none'} stroke={i <= value ? '#F59E0B' : '#6B7280'} />
      ))}
    </span>
  );
}

export default function Tasks() {
  const { tasks, clubs, user, moveTask, addTask, updateTask, deleteTask, addTaskComment } = useApp();

  // ── UI state ──────────────────────────────────────────────────
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask]       = useState(null);
  const [filterClub, setFilterClub]           = useState('All');
  const [filterPriority, setFilterPriority]   = useState('All');
  const [commentDraft, setCommentDraft]       = useState('');

  // ── Create form state ─────────────────────────────────────────
  const [form, setForm] = useState({
    title: '', description: '', club: clubs[0]?.name || '',
    priority: TASK_PRIORITY.MEDIUM, due_date: '',
    assignee: user.name, xp: 100, tags: ''
  });

  const uniqueClubs = useMemo(() => ['All', ...new Set(tasks.map(t => t.club))], [tasks]);

  const filteredTasks = useMemo(() => tasks.filter(t => {
    const clubOk     = filterClub     === 'All' || t.club === filterClub;
    const priorityOk = filterPriority === 'All' || t.priority === filterPriority;
    return clubOk && priorityOk;
  }), [tasks, filterClub, filterPriority]);

  // ── Stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:      tasks.length,
    pending:    tasks.filter(t => t.status === TASK_STATUS.PENDING).length,
    inProgress: tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length,
    submitted:  tasks.filter(t => t.status === TASK_STATUS.SUBMITTED).length,
    completed:  tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length,
  }), [tasks]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleCreate = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addTask({
      title:       form.title,
      description: form.description,
      club:        form.club,
      priority:    form.priority,
      due_date:    form.due_date,
      assignee:    form.assignee,
      xp:          Number(form.xp),
      points_awarded: Number(form.xp),
      tags:        form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
    });
    setShowCreateModal(false);
    setForm({ title: '', description: '', club: clubs[0]?.name || '', priority: TASK_PRIORITY.MEDIUM, due_date: '', assignee: user.name, xp: 100, tags: '' });
  };

  const handlePostComment = () => {
    if (!commentDraft.trim() || !selectedTask) return;
    addTaskComment(selectedTask.id, commentDraft);
    setCommentDraft('');
    // refresh selected task from updated tasks list
    setSelectedTask(prev => ({
      ...prev,
      comments: [...(prev.comments || []), {
        id: 'tc-' + Date.now(), author: user.name,
        avatar: user.avatar, content: commentDraft, created_at: 'Just now'
      }]
    }));
  };

  const getNextStatus = (currentStatus) => {
    const idx = COLUMNS.findIndex(c => c.key === currentStatus);
    return idx < COLUMNS.length - 1 ? COLUMNS[idx + 1].key : null;
  };

  const priorityBadge = (priority) => {
    const p = priority?.toLowerCase() || 'medium';
    const colors = PRIORITY_COLORS[p] || PRIORITY_COLORS[TASK_PRIORITY.MEDIUM];
    return (
      <span className="priority-badge" style={{ background: colors.bg, color: colors.text }}>
        {p === TASK_PRIORITY.URGENT && <AlertTriangle size={10} />}
        {TASK_PRIORITY_LABELS[p] || p}
      </span>
    );
  };

  return (
    <div className="tasks-page">
      {/* ── Header ─────────────────────────────────────────────── */}
      <div className="tasks-header glass-panel">
        <div>
          <h2 className="page-heading flex items-center gap-2">
            <CheckSquare className="text-accent" size={24} /> Task Management
          </h2>
          <p className="page-subtext">Track assignments across all clubs. Earn XP upon completion.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={18} /> New Task
        </button>
      </div>

      {/* ── Stats Row ──────────────────────────────────────────── */}
      <div className="tasks-stats-row">
        <div className="task-stat-card"><BarChart2 size={18} /><div><span className="stat-num">{stats.total}</span><span className="stat-label">Total</span></div></div>
        <div className="task-stat-card pending"><Clock size={18} /><div><span className="stat-num">{stats.pending}</span><span className="stat-label">Pending</span></div></div>
        <div className="task-stat-card in-progress"><Zap size={18} /><div><span className="stat-num">{stats.inProgress}</span><span className="stat-label">In Progress</span></div></div>
        <div className="task-stat-card submitted"><ArrowRight size={18} /><div><span className="stat-num">{stats.submitted}</span><span className="stat-label">Submitted</span></div></div>
        <div className="task-stat-card completed"><CheckCircle2 size={18} /><div><span className="stat-num">{stats.completed}</span><span className="stat-label">Completed</span></div></div>
      </div>

      {/* ── Filters ────────────────────────────────────────────── */}
      <div className="tasks-filter-bar glass-panel">
        <Filter size={16} className="text-muted" />
        <div className="filter-group">
          <label>Club</label>
          <select value={filterClub} onChange={e => setFilterClub(e.target.value)}>
            {uniqueClubs.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Priority</label>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="All">All Priorities</option>
            {Object.entries(TASK_PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <span className="tasks-filter-count">{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</span>
      </div>

      {/* ── Kanban Board ──────────────────────────────────────── */}
      <div className="kanban-board">
        {COLUMNS.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.key);
          return (
            <div key={col.key} className="kanban-column glass-panel">
              <div className="column-header" style={{ borderTopColor: col.color }}>
                <div className="column-header-left">
                  <span className="column-dot" style={{ background: col.color }} />
                  <span className="column-title">{col.label}</span>
                </div>
                <span className="column-count" style={{ background: col.color + '22', color: col.color }}>
                  {colTasks.length}
                </span>
              </div>

              <div className="column-tasks-list">
                {colTasks.length === 0 ? (
                  <div className="empty-col">No tasks here</div>
                ) : colTasks.map(task => (
                  <div
                    key={task.id}
                    className="task-card"
                    onClick={() => setSelectedTask(task)}
                  >
                    <div className="task-card-top">
                      {priorityBadge(task.priority)}
                      <span className="task-xp"><Zap size={11}/> +{task.xp} XP</span>
                    </div>

                    <h4 className="task-title">{task.title}</h4>

                    {task.description && (
                      <p className="task-desc-preview">{task.description.slice(0, 80)}{task.description.length > 80 ? '…' : ''}</p>
                    )}

                    {task.tags?.length > 0 && (
                      <div className="task-tags">
                        {task.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="task-tag"><Tag size={9}/> {tag}</span>
                        ))}
                      </div>
                    )}

                    <div className="task-meta">
                      <span className="meta-tag"><User size={11}/> {task.assignee}</span>
                      {task.due_date && <span className="meta-tag"><Clock size={11}/> {task.due_date}</span>}
                      {task.file_name && <span className="meta-tag file-badge"><Paperclip size={11}/> {task.file_name}</span>}
                    </div>

                    {task.rating && (
                      <div className="task-rating-row">
                        <StarRating value={task.rating} />
                        <span className="rating-label">Rated</span>
                      </div>
                    )}

                    <div className="task-footer">
                      <span className="club-tag">{task.club}</span>
                      <div className="task-actions">
                        {task.comments?.length > 0 && (
                          <span className="comment-count"><MessageCircle size={11}/> {task.comments.length}</span>
                        )}
                        {col.key !== TASK_STATUS.COMPLETED && (
                          <button
                            className="move-btn"
                            title={`Move to ${TASK_STATUS_LABELS[getNextStatus(col.key)]}`}
                            onClick={e => { e.stopPropagation(); moveTask(task.id, getNextStatus(col.key)); }}
                          >
                            <ArrowRight size={13}/>
                          </button>
                        )}
                        {col.key === TASK_STATUS.COMPLETED && (
                          <CheckCircle2 size={15} className="text-success"/>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* ══ Create Task Modal ════════════════════════════════════ */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Plus size={18}/> New Task</h3>
              <button className="icon-btn" onClick={() => setShowCreateModal(false)}><X size={18}/></button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-group">
                <label>Task Title *</label>
                <input type="text" required placeholder="e.g. Draft Budget Proposal for Q4"
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} placeholder="Describe what needs to be done..."
                  value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Club</label>
                  <select value={form.club} onChange={e => setForm(f => ({ ...f, club: e.target.value }))}>
                    {clubs.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                    {Object.entries(TASK_PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Assignee</label>
                  <input type="text" value={form.assignee} onChange={e => setForm(f => ({ ...f, assignee: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Tags (comma-separated)</label>
                  <input type="text" placeholder="e.g. Design, Marketing" value={form.tags}
                    onChange={e => setForm(f => ({ ...f, tags: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>XP Reward</label>
                  <input type="number" min={0} value={form.xp}
                    onChange={e => setForm(f => ({ ...f, xp: e.target.value }))} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ Task Detail Modal ════════════════════════════════════ */}
      {selectedTask && (() => {
        // Always get the latest version from tasks state
        const liveTask = tasks.find(t => t.id === selectedTask.id) || selectedTask;
        const nextStatus = getNextStatus(liveTask.status);
        return (
          <div className="modal-overlay" onClick={() => { setSelectedTask(null); setCommentDraft(''); }}>
            <div className="modal-card task-detail-modal glass-panel" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <div className="task-detail-heading">
                  {priorityBadge(liveTask.priority)}
                  <h3>{liveTask.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button className="icon-btn danger-btn" title="Delete task"
                    onClick={() => { deleteTask(liveTask.id); setSelectedTask(null); }}>
                    <Trash2 size={15}/>
                  </button>
                  <button className="icon-btn" onClick={() => { setSelectedTask(null); setCommentDraft(''); }}>
                    <X size={18}/>
                  </button>
                </div>
              </div>

              <div className="task-detail-body">
                {/* Meta row */}
                <div className="detail-meta-row">
                  <span className="detail-meta-pill"><User size={13}/> {liveTask.assignee}</span>
                  <span className="detail-meta-pill"><Clock size={13}/> {liveTask.due_date || 'No due date'}</span>
                  <span className="detail-meta-pill club-color"><CheckSquare size={13}/> {liveTask.club}</span>
                  <span className="detail-meta-pill xp-pill"><Zap size={13}/> {liveTask.xp} XP</span>
                </div>

                {/* Status + progress */}
                <div className="detail-status-row">
                  <span className="status-badge-detail"
                    style={{ background: COLUMNS.find(c=>c.key===liveTask.status)?.color + '22', color: COLUMNS.find(c=>c.key===liveTask.status)?.color }}>
                    {TASK_STATUS_LABELS[liveTask.status]}
                  </span>
                  {nextStatus && (
                    <button className="btn btn-sm btn-primary" onClick={() => { moveTask(liveTask.id, nextStatus); setSelectedTask(null); }}>
                      Move to {TASK_STATUS_LABELS[nextStatus]} <ArrowRight size={13}/>
                    </button>
                  )}
                </div>

                {/* Description */}
                {liveTask.description && (
                  <div className="detail-section">
                    <h4 className="detail-section-title">Description</h4>
                    <p className="task-full-description">{liveTask.description}</p>
                  </div>
                )}

                {/* Tags */}
                {liveTask.tags?.length > 0 && (
                  <div className="detail-section">
                    <h4 className="detail-section-title"><Tag size={13}/> Tags</h4>
                    <div className="task-tags">
                      {liveTask.tags.map(tag => (
                        <span key={tag} className="task-tag">{tag}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* File attachment */}
                {liveTask.file_name && (
                  <div className="detail-section">
                    <h4 className="detail-section-title"><Paperclip size={13}/> Attached File</h4>
                    <a href={liveTask.file_url || '#'} className="file-attachment-link" target="_blank" rel="noreferrer">
                      <Paperclip size={14}/> {liveTask.file_name}
                    </a>
                  </div>
                )}

                {/* Rating & Feedback */}
                {(liveTask.rating || liveTask.feedback) && (
                  <div className="detail-section feedback-section">
                    <h4 className="detail-section-title"><Star size={13}/> Review</h4>
                    {liveTask.rating && <StarRating value={liveTask.rating} />}
                    {liveTask.feedback && <p className="feedback-text">"{liveTask.feedback}"</p>}
                  </div>
                )}

                {/* Completed at */}
                {liveTask.completed_at && (
                  <div className="detail-section">
                    <span className="detail-meta-pill success-pill">
                      <CheckCircle2 size={13}/> Completed {new Date(liveTask.completed_at).toLocaleDateString()}
                    </span>
                  </div>
                )}

                {/* Comments */}
                <div className="detail-section comments-section">
                  <h4 className="detail-section-title">
                    <MessageCircle size={13}/> Comments ({liveTask.comments?.length || 0})
                  </h4>
                  <div className="comments-list">
                    {liveTask.comments?.length === 0 && (
                      <p className="no-comments">No comments yet. Be the first!</p>
                    )}
                    {liveTask.comments?.map(c => (
                      <div key={c.id} className="comment-item">
                        <img src={c.avatar} alt={c.author} className="comment-avatar" />
                        <div className="comment-body">
                          <div className="comment-header">
                            <strong>{c.author}</strong>
                            <span className="comment-time">{c.created_at}</span>
                          </div>
                          <p>{c.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="comment-input-row">
                    <img src={user.avatar} alt="You" className="comment-avatar" />
                    <input
                      type="text"
                      placeholder="Add a comment…"
                      value={commentDraft}
                      onChange={e => setCommentDraft(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                    />
                    <button className="send-comment-btn" onClick={handlePostComment} disabled={!commentDraft.trim()}>
                      <Send size={15}/>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
