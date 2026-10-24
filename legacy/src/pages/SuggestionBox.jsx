import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import {
  Lightbulb, ThumbsUp, Plus, CheckCircle, Clock,
  X, AlertCircle, ChevronDown, ChevronUp, SortAsc,
  Eye, EyeOff, MessageSquare, Edit3, Send, BarChart2
} from 'lucide-react';
import './SuggestionBox.css';

const CATEGORIES = ['All', 'Events', 'Campus', 'Club Tech', 'General'];
const STATUSES   = ['All', 'Under Review', 'Planned', 'Implemented'];

const STATUS_CONFIG = {
  'Implemented': { icon: CheckCircle, color: '#10B981', bg: 'rgba(16,185,129,0.15)' },
  'Planned':     { icon: Clock,       color: '#3B82F6', bg: 'rgba(59,130,246,0.15)' },
  'Under Review':{ icon: AlertCircle, color: '#F59E0B', bg: 'rgba(245,158,11,0.15)' },
};

function StatusPill({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG['Under Review'];
  const Icon = cfg.icon;
  return (
    <span className="status-pill" style={{ background: cfg.bg, color: cfg.color }}>
      <Icon size={11} /> {status}
    </span>
  );
}

export default function SuggestionBox() {
  const { suggestions, user, upvoteSuggestion, addSuggestion, updateSuggestionAdminResponse } = useApp();

  // ── Filters & sort ────────────────────────────────────────────
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter,   setStatusFilter]   = useState('All');
  const [sortBy, setSortBy]                 = useState('votes'); // 'votes' | 'newest'

  // ── UI state ──────────────────────────────────────────────────
  const [showModal,     setShowModal]     = useState(false);
  const [expandedId,    setExpandedId]    = useState(null);
  const [adminEditId,   setAdminEditId]   = useState(null);
  const [adminDraft,    setAdminDraft]    = useState('');
  const [adminStatus,   setAdminStatus]   = useState('');

  // ── Create form ───────────────────────────────────────────────
  const [form, setForm] = useState({
    title: '', category: 'Events', details: '', anonymous: false
  });

  const isAdmin = user.type === 'admin' || user.type === 'superadmin';

  // ── Stats ─────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:       suggestions.length,
    underReview: suggestions.filter(s => s.status === 'Under Review').length,
    planned:     suggestions.filter(s => s.status === 'Planned').length,
    implemented: suggestions.filter(s => s.status === 'Implemented').length,
  }), [suggestions]);

  // ── Filtered & sorted list ────────────────────────────────────
  const displayed = useMemo(() => {
    let list = [...suggestions];
    if (categoryFilter !== 'All') list = list.filter(s => s.category === categoryFilter);
    if (statusFilter   !== 'All') list = list.filter(s => s.status   === statusFilter);
    if (sortBy === 'votes')  list.sort((a,b) => b.votes - a.votes);
    if (sortBy === 'newest') list.reverse();
    return list;
  }, [suggestions, categoryFilter, statusFilter, sortBy]);

  // ── Handlers ──────────────────────────────────────────────────
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addSuggestion({ ...form });
    setShowModal(false);
    setForm({ title: '', category: 'Events', details: '', anonymous: false });
  };

  const handleAdminSave = (id) => {
    if (!adminDraft.trim()) return;
    updateSuggestionAdminResponse(id, adminDraft, adminStatus || undefined);
    setAdminEditId(null);
    setAdminDraft('');
    setAdminStatus('');
  };

  const startAdminEdit = (s) => {
    setAdminEditId(s.id);
    setAdminDraft(s.adminComment || '');
    setAdminStatus(s.status);
    setExpandedId(s.id);
  };

  return (
    <div className="suggestion-box-page">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="suggestion-header glass-panel">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Lightbulb className="text-warning" size={24}/> Student Idea & Suggestion Box
          </h2>
          <p className="text-sm text-secondary mt-1">
            Submit ideas, upvote peer suggestions, and shape club initiatives.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18}/> Propose Idea
        </button>
      </div>

      {/* ── Stats ───────────────────────────────────────────────── */}
      <div className="suggestion-stats-row">
        <div className="sug-stat"><BarChart2 size={16}/><span className="sn">{stats.total}</span><span className="sl">Total</span></div>
        <div className="sug-stat review"><AlertCircle size={16}/><span className="sn">{stats.underReview}</span><span className="sl">Under Review</span></div>
        <div className="sug-stat planned"><Clock size={16}/><span className="sn">{stats.planned}</span><span className="sl">Planned</span></div>
        <div className="sug-stat done"><CheckCircle size={16}/><span className="sn">{stats.implemented}</span><span className="sl">Implemented</span></div>
      </div>

      {/* ── Filter & Sort bar ───────────────────────────────────── */}
      <div className="suggestion-controls glass-panel">
        <div className="filter-tabs">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              className={`filter-tab ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >{cat}</button>
          ))}
        </div>

        <div className="controls-right">
          <div className="filter-group-inline">
            <label>Status:</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="filter-group-inline">
            <SortAsc size={14}/>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="votes">Most Votes</option>
              <option value="newest">Newest</option>
            </select>
          </div>
          <span className="results-count">{displayed.length} proposal{displayed.length !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* ── Suggestions List ────────────────────────────────────── */}
      <div className="suggestions-grid">
        {displayed.length === 0 && (
          <div className="no-suggestions glass-panel">
            <Lightbulb size={36} style={{ opacity: 0.3 }}/>
            <p>No suggestions match your filters.</p>
          </div>
        )}

        {displayed.map(item => {
          const isExpanded = expandedId === item.id;
          const isEditingAdmin = adminEditId === item.id;

          return (
            <div key={item.id} className={`suggestion-card glass-panel ${isExpanded ? 'expanded' : ''}`}>

              {/* Vote column */}
              <div className="vote-column">
                <button
                  className={`vote-btn ${item.votedByMe ? 'voted' : ''}`}
                  onClick={() => upvoteSuggestion(item.id)}
                >
                  <ThumbsUp size={17}/>
                  <span className="vote-count">{item.votes}</span>
                </button>
              </div>

              {/* Content */}
              <div className="suggestion-content">
                <div className="suggestion-top-row">
                  <span className="suggestion-category">{item.category}</span>
                  <StatusPill status={item.status} />
                  {isAdmin && (
                    <button className="admin-edit-btn" title="Edit admin response" onClick={() => startAdminEdit(item)}>
                      <Edit3 size={13}/>
                    </button>
                  )}
                </div>

                <h3 className="suggestion-title">{item.title}</h3>

                {/* Details expand/collapse */}
                {item.details && (
                  <div className="suggestion-details-wrapper">
                    <p className={`suggestion-details-text ${isExpanded ? 'expanded' : ''}`}>
                      {item.details}
                    </p>
                    {item.details.length > 100 && (
                      <button
                        className="expand-btn"
                        onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      >
                        {isExpanded ? <><ChevronUp size={13}/> Less</> : <><ChevronDown size={13}/> More</>}
                      </button>
                    )}
                  </div>
                )}

                {/* Admin response box */}
                {isEditingAdmin ? (
                  <div className="admin-edit-box">
                    <label className="admin-edit-label">Official Response</label>
                    <textarea
                      rows={2}
                      value={adminDraft}
                      onChange={e => setAdminDraft(e.target.value)}
                      placeholder="Type official response here…"
                    />
                    <div className="admin-edit-row">
                      <select value={adminStatus} onChange={e => setAdminStatus(e.target.value)}>
                        <option value="">Keep current status</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Planned">Planned</option>
                        <option value="Implemented">Implemented</option>
                      </select>
                      <div className="admin-edit-actions">
                        <button className="btn btn-sm btn-outline" onClick={() => { setAdminEditId(null); setAdminDraft(''); }}>
                          Cancel
                        </button>
                        <button className="btn btn-sm btn-primary" onClick={() => handleAdminSave(item.id)}>
                          <Send size={12}/> Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : item.adminComment && (
                  <div className="admin-response-box">
                    <span className="admin-response-label">
                      <MessageSquare size={11}/> Official Response
                    </span>
                    <p className="admin-response-text">{item.adminComment}</p>
                  </div>
                )}

                {/* Footer */}
                <div className="suggestion-footer">
                  <span className="author-tag">
                    {item.anonymous ? (
                      <><EyeOff size={11}/> Anonymous</>
                    ) : (
                      <><Eye size={11}/> {item.author}</>
                    )}
                  </span>
                  <span className="date-tag">{item.date}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ══ Propose Idea Modal ════════════════════════════════════ */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Lightbulb size={18}/> Submit Suggestion</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Suggestion Title *</label>
                <input
                  type="text" required
                  placeholder="e.g. Provide free coffee during 24h Hackathons"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Details / Justification</label>
                <textarea
                  rows={3}
                  placeholder="Explain why this suggestion will benefit students…"
                  value={form.details}
                  onChange={e => setForm(f => ({ ...f, details: e.target.value }))}
                />
              </div>

              {/* Anonymous toggle */}
              <div className="anonymous-toggle">
                <label className="toggle-label">
                  <span className="toggle-icon">{form.anonymous ? <EyeOff size={15}/> : <Eye size={15}/>}</span>
                  <span>
                    <strong>Submit anonymously</strong>
                    <span className="toggle-hint"> — your name will be hidden from other students</span>
                  </span>
                  <div
                    className={`toggle-switch ${form.anonymous ? 'on' : ''}`}
                    onClick={() => setForm(f => ({ ...f, anonymous: !f.anonymous }))}
                  >
                    <div className="toggle-thumb" />
                  </div>
                </label>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Proposal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
