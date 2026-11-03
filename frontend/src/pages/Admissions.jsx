import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, FileText, Filter, MessageSquare, Plus, Send, Sparkles, UserCheck, UserPlus, Users, XCircle } from 'lucide-react';
import { api } from '../api';
import { Avatar, ClubChip, Empty, Loading, Modal, fmt, useApp } from '../ui';

const STATUS_CONFIG = {
  pending: { label: 'Pending review', pill: 'warn', icon: Clock },
  interview: { label: 'Interview scheduled', pill: 'info', icon: MessageSquare },
  approved: { label: 'Approved', pill: 'ok', icon: CheckCircle2 },
  rejected: { label: 'Not accepted', pill: 'red', icon: XCircle },
};

export default function Admissions() {
  const { user, clubs, manageable, canManage, toast } = useApp();
  const [applications, setApplications] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [tab, setTab] = useState(user.role === 'student' ? 'my' : 'review');
  const [clubFilter, setClubFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reviewingApp, setReviewingApp] = useState(null);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const isStaff = user.role === 'admin' || user.role === 'advisor' || user.role === 'club_leader';

  const load = useCallback(() => {
    const params = new URLSearchParams();
    if (clubFilter) params.set('club_id', clubFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    setLoadError('');

    api.get(`/admissions?${params}`)
      .then(setApplications)
      .catch((err) => {
        setApplications([]);
        setLoadError(err.message);
      });
  }, [clubFilter, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  // Derived stats
  const list = applications || [];
  const myApps = list.filter((a) => a.user_id === user.id);
  const pendingApps = list.filter((a) => a.status === 'pending');
  const approvedApps = list.filter((a) => a.status === 'approved');

  // Clubs the current user is NOT yet a member of
  const availableClubsToApply = useMemo(() => {
    return (clubs || []).filter((c) => {
      const isMember = c.club_members?.some((m) => m.user_id === user.id);
      return !isMember;
    });
  }, [clubs, user.id]);

  const withdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await api.del(`/admissions/${appId}`);
      toast('Application withdrawn successfully');
      load();
    } catch (e) {
      toast(e.message, 'error');
    }
  };

  return (
    <>
      <section className="admissions-hero">
        <div className="admissions-hero-copy">
          <span className="admissions-eyebrow"><Sparkles size={14} /> ADMISSIONS & RECRUITMENT</span>
          <h2>Club Admissions</h2>
          <p>Explore clubs, apply for member and specialist roles, and manage candidate reviews.</p>
        </div>
        <div className="admissions-quick-stat">
          <span className="admissions-stat-icon"><UserPlus size={20} /></span>
          <div>
            <small>{isStaff ? 'Pending reviews' : 'Your applications'}</small>
            <b>{isStaff ? `${pendingApps.length} candidates` : `${myApps.length} active`}</b>
          </div>
        </div>
      </section>

      <div className="stats">
        <div className="stat">
          <b>{myApps.length}</b>
          <span>Your applications</span>
        </div>
        <div className="stat hot">
          <b>{pendingApps.length}</b>
          <span>Pending review</span>
        </div>
        <div className="stat">
          <b>{approvedApps.length}</b>
          <span>Approved applications</span>
        </div>
      </div>

      <div className="toolbar">
        <div className="tabs" role="tablist" aria-label="Admissions views">
          <button
            role="tab"
            aria-selected={tab === 'my'}
            className={tab === 'my' ? 'on' : ''}
            onClick={() => setTab('my')}
          >
            My applications ({myApps.length})
          </button>
          {isStaff && (
            <button
              role="tab"
              aria-selected={tab === 'review'}
              className={tab === 'review' ? 'on' : ''}
              onClick={() => setTab('review')}
            >
              Review candidates {pendingApps.length > 0 && `(${pendingApps.length})`}
            </button>
          )}
        </div>

        {tab === 'review' && (
          <>
            <select
              className="select"
              value={clubFilter}
              onChange={(e) => setClubFilter(e.target.value)}
              aria-label="Filter by club"
            >
              <option value="">All managed clubs</option>
              {(user.role === 'admin' ? clubs : manageable).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              className="select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
            >
              <option value="all">All statuses</option>
              <option value="pending">Pending</option>
              <option value="interview">Interview</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </>
        )}

        <span className="spacer" />
        {availableClubsToApply.length > 0 && (
          <button className="btn primary" onClick={() => setApplyModalOpen(true)}>
            <Plus size={16} /> Apply to a club
          </button>
        )}
      </div>

      {applications === null ? (
        <Loading />
      ) : loadError ? (
        <Empty icon={UserPlus} title="Database migration required" text="Please run database/05_admissions_attendance.sql in your Supabase SQL editor to enable Admissions." />
      ) : tab === 'my' ? (
        myApps.length === 0 ? (
          <Empty
            icon={UserPlus}
            title="No applications submitted yet"
            text="Interested in joining a club? Click 'Apply to a club' to get started."
          />
        ) : (
          <div className="admissions-grid">
            {myApps.map((a) => {
              const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              return (
                <article key={a.id} className="admissions-card">
                  <div className="admissions-card-top">
                    <ClubChip club={a.clubs} />
                    <span className={`pill ${cfg.pill}`}>
                      <StatusIcon size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                      {cfg.label}
                    </span>
                  </div>
                  <h3>Role applied: {a.role_applied}</h3>
                  <p className="admissions-motivation">"{a.motivation}"</p>
                  {a.skills && (
                    <div className="admissions-skills">
                      <b>Skills:</b> {a.skills}
                    </div>
                  )}
                  {a.feedback && (
                    <div className="reply" style={{ marginTop: 12 }}>
                      <small>Feedback from {a.reviewer?.full_name || 'club leadership'}</small>
                      {a.feedback}
                    </div>
                  )}
                  <div className="admissions-card-footer">
                    <span>Applied {fmt.ago(a.created_at)}</span>
                    {a.status === 'pending' && (
                      <button className="btn sm danger" onClick={() => withdraw(a.id)}>
                        Withdraw
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )
      ) : (
        list.length === 0 ? (
          <Empty
            icon={Users}
            title="No applications to review"
            text="There are no applications matching the selected filters."
          />
        ) : (
          <div className="admissions-grid">
            {list.map((a) => {
              const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.pending;
              const StatusIcon = cfg.icon;
              const canReviewThisClub = canManage(a.club_id);
              return (
                <article key={a.id} className="admissions-card">
                  <div className="admissions-card-top">
                    <ClubChip club={a.clubs} />
                    <span className={`pill ${cfg.pill}`}>
                      <StatusIcon size={12} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
                      {cfg.label}
                    </span>
                  </div>
                  <div className="admissions-applicant-info">
                    <Avatar name={a.applicant?.full_name} color={a.applicant?.avatar_color} size={36} />
                    <div>
                      <b>{a.applicant?.full_name || 'Applicant'}</b>
                      <small>{a.applicant?.grade || a.applicant?.email}</small>
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span className="pill info" style={{ fontSize: 11 }}>Applied for: {a.role_applied}</span>
                  </div>
                  <p className="admissions-motivation" style={{ marginTop: 8 }}>"{a.motivation}"</p>
                  {a.skills && (
                    <div className="admissions-skills">
                      <b>Skills:</b> {a.skills}
                    </div>
                  )}
                  {a.feedback && (
                    <div className="reply" style={{ marginTop: 10 }}>
                      <small>Review notes ({a.reviewer?.full_name || 'Staff'}):</small>
                      {a.feedback}
                    </div>
                  )}
                  <div className="admissions-card-footer">
                    <span>Submitted {fmt.ago(a.created_at)}</span>
                    {canReviewThisClub && (
                      <button className="btn sm primary" onClick={() => setReviewingApp(a)}>
                        {a.status === 'pending' ? 'Review & decide' : 'Update decision'}
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )
      )}

      {applyModalOpen && (
        <ApplyModal
          clubs={availableClubsToApply}
          onClose={() => setApplyModalOpen(false)}
          onApplied={() => {
            setApplyModalOpen(false);
            load();
          }}
        />
      )}

      {reviewingApp && (
        <ReviewModal
          app={reviewingApp}
          onClose={() => setReviewingApp(null)}
          onReviewed={() => {
            setReviewingApp(null);
            load();
          }}
        />
      )}
    </>
  );
}

function ApplyModal({ clubs, onClose, onApplied }) {
  const { toast } = useApp();
  const [clubId, setClubId] = useState(clubs[0]?.id || '');
  const [roleApplied, setRoleApplied] = useState('Member');
  const [motivation, setMotivation] = useState('');
  const [skills, setSkills] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!clubId || !motivation.trim()) return;
    setBusy(true);
    try {
      await api.post('/admissions', {
        club_id: clubId,
        role_applied: roleApplied,
        motivation: motivation.trim(),
        skills: skills.trim() || null,
      });
      toast('Application submitted successfully!');
      onApplied();
    } catch (err) {
      toast(err.message, 'error');
    }
    setBusy(false);
  };

  return (
    <Modal title="Apply to join a club" onClose={onClose}>
      <form onSubmit={submit}>
        <div className="field">
          <label>Select Club</label>
          <select value={clubId} onChange={(e) => setClubId(e.target.value)} required>
            {clubs.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Role applied for</label>
          <select value={roleApplied} onChange={(e) => setRoleApplied(e.target.value)}>
            <option value="Member">General Member</option>
            <option value="Project Lead">Project Lead</option>
            <option value="Event Coordinator">Event Coordinator</option>
            <option value="Technical Specialist">Technical Specialist</option>
            <option value="Media & Design">Media & Design</option>
          </select>
        </div>

        <div className="field">
          <label>Why do you want to join? (Motivation)</label>
          <textarea
            required
            rows={3}
            placeholder="Tell the club leaders about your interests and goals..."
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
          />
        </div>

        <div className="field">
          <label>Relevant skills or experience (optional)</label>
          <input
            placeholder="e.g. Python, Graphic Design, Public Speaking, Photography"
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
          />
        </div>

        <div className="modal-actions" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" disabled={busy}>
            <Send size={15} /> Submit application
          </button>
        </div>
      </form>
    </Modal>
  );
}

function ReviewModal({ app, onClose, onReviewed }) {
  const { toast } = useApp();
  const [status, setStatus] = useState(app.status === 'pending' ? 'approved' : app.status);
  const [feedback, setFeedback] = useState(app.feedback || '');
  const [busy, setBusy] = useState(false);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.patch(`/admissions/${app.id}/review`, {
        status,
        feedback: feedback.trim() || null,
      });
      toast(`Application marked as ${status}`);
      onReviewed();
    } catch (err) {
      toast(err.message, 'error');
    }
    setBusy(false);
  };

  return (
    <Modal title={`Review Candidate: ${app.applicant?.full_name || 'Applicant'}`} onClose={onClose}>
      <form onSubmit={save}>
        <div style={{ marginBottom: 14 }}>
          <b>Club:</b> {app.clubs?.name} · <b>Role:</b> {app.role_applied}
          <p style={{ margin: '6px 0', color: 'var(--muted)', fontSize: 13 }}>
            "{app.motivation}"
          </p>
          {app.skills && <small style={{ color: 'var(--muted)' }}><b>Skills:</b> {app.skills}</small>}
        </div>

        <div className="field">
          <label>Decision</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="approved">Approve & Admit to Club</option>
            <option value="interview">Schedule Interview</option>
            <option value="rejected">Decline Application</option>
          </select>
        </div>

        <div className="field">
          <label>Feedback or interview instructions (sent to student)</label>
          <textarea
            rows={3}
            placeholder="e.g. Welcome to the team! Next meeting is on Wednesday..."
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
          />
        </div>

        <div className="modal-actions" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary" disabled={busy}>
            Save decision
          </button>
        </div>
      </form>
    </Modal>
  );
}
