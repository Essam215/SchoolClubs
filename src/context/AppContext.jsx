import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import {
  TASK_STATUS, TASK_PRIORITY,
  NOTIFICATION_TYPES,
  DEFAULT_TASK, DEFAULT_NOTIFICATION, DEFAULT_SUGGESTION
} from '../lib/schema';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { loadAppSnapshot, saveAppSnapshot } from '../lib/persist';
import AuthScreen from '../components/AuthScreen';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [saveError, setSaveError] = useState('');
  const saveTimer = useRef(null);

  const [user, setUser] = useState(null);
  const [clubs, setClubs] = useState([]);
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [taskComments, setTaskComments] = useState({});
  const [gamification, setGamification] = useState({ leaderboard: [], rewards: [] });
  const [suggestions, setSuggestions] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [resources, setResources] = useState([]);
  const [gallery, setGallery] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [authMode, setAuthMode] = useState('signin');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authMessage, setAuthMessage] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured()) {
      setAuthLoading(false);
      setAuthMessage('Supabase is not configured. Add the project URL and publishable key to .env.');
      return undefined;
    }

    let active = true;
    supabase.auth.getSession().then(({ data, error }) => {
      if (!active) return;
      if (error) setAuthMessage(error.message);
      setSession(data?.session ?? null);
      setAuthLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthMessage('');
    });
    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session?.user) {
      setUser(null);
      return undefined;
    }

    let active = true;
    setDataLoading(true);
    setSaveError('');
    setUser(null);
    setClubs([]);
    setEvents([]);
    setTasks([]);
    setTaskComments({});
    setGamification({ leaderboard: [], rewards: [] });
    setSuggestions([]);
    setAdmissions([]);
    setAttendance([]);
    setResources([]);
    setGallery([]);
    setNotifications([]);
    setChatMessages([]);
    loadAppSnapshot(session.user.id).then(({ snapshot, error }) => {
      if (!active) return;
      if (error) {
        setSaveError(`Could not load your Supabase data: ${error.message}`);
      } else if (snapshot) {
        setUser(snapshot.user);
        setClubs(snapshot.clubs ?? []);
        setEvents(snapshot.events ?? []);
        setTasks(snapshot.tasks ?? []);
        setTaskComments(snapshot.taskComments ?? {});
        setGamification(snapshot.gamification ?? { leaderboard: [], rewards: [] });
        setSuggestions(snapshot.suggestions ?? []);
        setAdmissions(snapshot.admissions ?? []);
        setAttendance(snapshot.attendance ?? []);
        setResources(snapshot.resources ?? []);
        setGallery(snapshot.gallery ?? []);
        setNotifications(snapshot.notifications ?? []);
        setChatMessages(snapshot.chatMessages ?? []);
      } else {
        const email = session.user.email ?? '';
        const name = session.user.user_metadata?.name || email.split('@')[0] || 'Student';
        setUser({
          id: session.user.id, school_id: null, type: 'student', name,
          role: 'Student', studentId: '', email, phone: '', major: '',
          academicYear: '', gpa: '', avatar: '', bio: '',
          joinedDate: new Date().toISOString().slice(0, 10),
          level: 1, xp: 0, points: 0, nextLevelXp: 500,
          streak: 0, tags: [], skills: [], joinedClubs: [], badges: [],
        });
      }
      setDataLoading(false);
    }).catch((error) => {
      if (active) {
        setSaveError(`Could not load your Supabase data: ${error.message}`);
        setDataLoading(false);
      }
    });
    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    if (!session?.user || dataLoading || !user) return undefined;
    window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(async () => {
      const snapshot = {
        user, clubs, events, tasks, taskComments, gamification,
        suggestions, admissions, attendance, resources, gallery, notifications, chatMessages,
      };
      const { error } = await saveAppSnapshot(session.user.id, snapshot);
      setSaveError(error ? `Supabase save failed: ${error.message}` : '');
    }, 450);
    return () => window.clearTimeout(saveTimer.current);
  }, [session, dataLoading, user, clubs, events, tasks, taskComments, gamification,
    suggestions, admissions, attendance, resources, gallery, notifications, chatMessages]);

  const submitAuth = async (event) => {
    event.preventDefault();
    if (!isSupabaseConfigured() || authBusy) return;
    setAuthBusy(true);
    setAuthMessage('');
    try {
      const result = authMode === 'signup'
        ? await supabase.auth.signUp({ email: authEmail.trim(), password: authPassword, options: { data: { name: authEmail.trim().split('@')[0] } } })
        : await supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPassword });
      if (result.error) {
        const rateLimited = result.error.status === 429 || result.error.code === 'over_email_send_rate_limit';
        const errorCode = result.error.code;
        if (rateLimited) {
          setAuthMessage('Supabase is temporarily limiting signup emails. If you already have an account, switch to Sign in. Otherwise, wait before trying again.');
        } else if (errorCode === 'invalid_credentials') {
          setAuthMessage('That email and password do not match. Check them and try again.');
        } else if (errorCode === 'email_not_confirmed') {
          setAuthMessage('Confirm your email using the link Supabase sent you, then sign in.');
        } else {
          setAuthMessage(result.error.message);
        }
      } else if (authMode === 'signup' && !result.data.session) {
        setAuthMessage('Check your email to confirm the new account, then sign in.');
      }
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : 'Unable to connect to Supabase. Check your connection and try again.');
    } finally {
      setAuthBusy(false);
    }
  };

  if (authLoading || (session && dataLoading)) {
    return <div className="auth-loading">Connecting to Supabase…</div>;
  }
  if (!session) {
    return <AuthScreen
      authMode={authMode}
      authEmail={authEmail}
      authPassword={authPassword}
      authMessage={authMessage}
      authBusy={authBusy}
      configured={isSupabaseConfigured()}
      onEmailChange={event => setAuthEmail(event.target.value)}
      onPasswordChange={event => setAuthPassword(event.target.value)}
      onModeChange={() => { setAuthMode(authMode === 'signup' ? 'signin' : 'signup'); setAuthMessage(''); }}
      onSubmit={submitAuth}
    />;
  }

  if (session && !user && !dataLoading) {
    return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b1020', color: '#fff', fontFamily: 'sans-serif' }}><div role="alert" style={{ maxWidth: 520, padding: 28, borderRadius: 16, background: '#151d31' }}><h2>Could not load your Supabase workspace</h2><p>{saveError || 'The database request failed.'}</p><button onClick={() => supabase.auth.signOut()}>Sign out</button></div></main>;
  }

  //  ACTION HANDLERS
  // ═══════════════════════════════════════════════════════════════

  // ── User ───────────────────────────────────────────────────────
  const updateUserProfile = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
    setClubs(prevClubs => prevClubs.map(c => ({
      ...c,
      members: (c.members ?? []).map(m => {
        if (m.name === user.name || m.email === user.email) {
          return {
            ...m,
            name: updatedFields.name || m.name,
            avatar: updatedFields.avatar || m.avatar,
            major: updatedFields.major || m.major,
            email: updatedFields.email || m.email,
            studentId: updatedFields.studentId || m.studentId
          };
        }
        return m;
      })
    })));
    pushNotification({
      type: NOTIFICATION_TYPES.PROFILE,
      title: 'Profile Updated',
      message: 'Your student information has been successfully saved.'
    });
  };

  const addClub = (clubData) => {
    const id = crypto.randomUUID();
    const club = {
      id, school_id: null, ...clubData, icon: '🎓', status: 'active',
      color: '#6366f1', president: user.name, membersCount: 1, tags: [],
      members: [{ id: user.id, name: user.name, email: user.email, role: 'president', avatar: user.avatar, major: user.major, studentId: user.studentId, joinedDate: new Date().toISOString().slice(0, 10), skills: user.skills }],
    };
    setClubs(previous => [club, ...previous]);
    setUser(previous => ({ ...previous, joinedClubs: [...previous.joinedClubs, { id, name: club.name, role: 'President', badge: 'Founder', membersCount: 1, icon: club.icon }] }));
    pushNotification({ type: NOTIFICATION_TYPES.CLUB, title: 'Club created', message: `${club.name} was added to your workspace.` });
    return club;
  };

  const addSkill = (newSkill) => {
    if (!newSkill || user.skills.includes(newSkill)) return;
    setUser(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
  };

  const removeSkill = (skillToRemove) => {
    setUser(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skillToRemove) }));
  };

  const leaveClub = (clubIdOrName) => {
    const targetClub = clubs.find(c => c.id === clubIdOrName || c.name === clubIdOrName);
    const clubName = targetClub ? targetClub.name : clubIdOrName;
    setUser(prev => ({
      ...prev,
      joinedClubs: prev.joinedClubs.filter(c => c.id !== clubIdOrName && c.name !== clubIdOrName)
    }));
    setClubs(prevClubs => prevClubs.map(c => {
      if (c.id === clubIdOrName || c.name === clubIdOrName) {
        return {
          ...c,
          membersCount: Math.max(0, c.membersCount - 1),
          members: (c.members ?? []).filter(m => m.name !== user.name && m.email !== user.email)
        };
      }
      return c;
    }));
    pushNotification({ type: NOTIFICATION_TYPES.CLUB, title: 'Club Left', message: `You have left ${clubName}.` });
  };

  // ── Events ─────────────────────────────────────────────────────
  const toggleRsvp = (eventId) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        const isRsvped = !ev.isRsvped;
        return { ...ev, isRsvped, rsvpCount: isRsvped ? ev.rsvpCount + 1 : ev.rsvpCount - 1 };
      }
      return ev;
    }));
  };

  const addEvent = (newEventData) => {
    const created = {
      id: Date.now(), rsvpCount: 1, isRsvped: true, status: 'approved',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
      color: '#C62828',
      ...newEventData
    };
    setEvents(prev => [created, ...prev]);
    setUser(prev => ({ ...prev, xp: prev.xp + 100, points: prev.points + 100 }));
    pushNotification({
      type: NOTIFICATION_TYPES.EVENT,
      title: 'New Event Created',
      message: `Event "${created.title}" has been published.`,
      related_event_id: created.id
    });
  };

  // ── Tasks ──────────────────────────────────────────────────────
  const addTask = (newTaskData) => {
    const created = {
      ...DEFAULT_TASK,
      id: 't-' + Date.now(),
      status: TASK_STATUS.PENDING,
      xp: 100,
      points_awarded: 100,
      comments: [],
      ...newTaskData
    };
    setTasks(prev => [created, ...prev]);
    pushNotification({
      type: NOTIFICATION_TYPES.TASK,
      title: 'Task Created',
      message: `New task "${created.title}" has been assigned.`,
      related_task_id: created.id
    });
  };

  const updateTask = (taskId, updatedFields) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, ...updatedFields } : t));
  };

  const deleteTask = (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const moveTask = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const awardXp = newStatus === TASK_STATUS.COMPLETED && t.status !== TASK_STATUS.COMPLETED;
        if (awardXp) {
          setUser(u => ({ ...u, xp: u.xp + t.xp, points: u.points + t.xp }));
          pushNotification({
            type: NOTIFICATION_TYPES.TASK,
            title: 'Task Completed! 🎉',
            message: `Completed "${t.title}" and earned +${t.xp} XP.`,
            related_task_id: t.id
          });
        }
        return {
          ...t,
          status: newStatus,
          completed_at: newStatus === TASK_STATUS.COMPLETED ? new Date().toISOString() : t.completed_at
        };
      }
      return t;
    }));
  };

  const addTaskComment = (taskId, content) => {
    if (!content?.trim()) return;
    const newComment = {
      id: 'tc-' + Date.now(),
      author: user.name,
      avatar: user.avatar,
      content,
      created_at: 'Just now'
    };
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, comments: [...(t.comments || []), newComment] } : t
    ));
  };

  // ── Suggestions ────────────────────────────────────────────────
  const upvoteSuggestion = (id) => {
    setSuggestions(prev => prev.map(s => {
      if (s.id === id) {
        const votedByMe = !s.votedByMe;
        return { ...s, votedByMe, votes: votedByMe ? s.votes + 1 : s.votes - 1 };
      }
      return s;
    }));
  };

  const addSuggestion = (newSuggestion) => {
    const item = {
      ...DEFAULT_SUGGESTION,
      id: 's-' + Date.now(),
      author: newSuggestion.anonymous ? 'Anonymous' : user.name,
      votes: 1, votedByMe: true,
      status: 'Under Review',
      adminComment: 'Received! Under evaluation.',
      date: 'Just now',
      ...newSuggestion
    };
    setSuggestions(prev => [item, ...prev]);
    pushNotification({
      type: NOTIFICATION_TYPES.SUGGESTION,
      title: 'Suggestion Submitted',
      message: `Your idea "${item.title}" is now live and open for votes!`
    });
  };

  const updateSuggestionAdminResponse = (id, adminComment, status) => {
    setSuggestions(prev => prev.map(s =>
      s.id === id ? { ...s, adminComment, status: status || s.status } : s
    ));
  };

  // ── Admissions ─────────────────────────────────────────────────
  const applyForClub = (admissionData) => {
    const newAdm = {
      id: 'adm-' + Date.now(),
      applicant: admissionData.applicant || user.name,
      applicantEmail: admissionData.applicantEmail || user.email,
      applicantAvatar: admissionData.applicantAvatar || user.avatar,
      applicantStudentId: admissionData.applicantStudentId || user.studentId,
      applicantMajor: admissionData.applicantMajor || user.major,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      feedbackNotes: 'Application submitted and awaiting leader review.',
      skills: admissionData.skills || user.skills.slice(0, 4).join(', '),
      ...admissionData
    };
    setAdmissions(prev => [newAdm, ...prev]);
    setUser(prev => ({ ...prev, xp: prev.xp + 50, points: prev.points + 50 }));
    pushNotification({
      type: NOTIFICATION_TYPES.ADMISSION,
      title: 'Application Submitted',
      message: `Your application to join ${newAdm.club} as ${newAdm.appliedRole} has been queued for review. (+50 XP)`,
      related_club_id: newAdm.club_id
    });
    return newAdm;
  };

  const withdrawApplication = (admissionId) => {
    const adm = admissions.find(a => a.id === admissionId);
    setAdmissions(prev => prev.filter(a => a.id !== admissionId));
    if (adm) {
      pushNotification({
        type: NOTIFICATION_TYPES.ADMISSION,
        title: 'Application Withdrawn',
        message: `Your application to ${adm.club} was successfully cancelled.`
      });
    }
  };

  const reviewAdmission = (id, newStatus, feedbackNotes = '') => {
    const targetAdm = admissions.find(a => a.id === id);
    if (!targetAdm) return;
    setAdmissions(prev => prev.map(a => {
      if (a.id === id) {
        return {
          ...a,
          status: newStatus,
          feedbackNotes: feedbackNotes || (
            newStatus === 'approved' ? 'Application officially accepted! Welcome to the club.' :
            newStatus === 'rejected' ? 'Application not selected for this cohort.' :
            newStatus === 'Interview Scheduled' ? 'Interview scheduled. Please check your school email.' :
            a.feedbackNotes
          )
        };
      }
      return a;
    }));

    if (newStatus === 'approved') {
      setClubs(prevClubs => prevClubs.map(c => {
        if (c.name.toLowerCase() === targetAdm.club.toLowerCase()) {
          const alreadyMember = (c.members ?? []).some(m => m.name.toLowerCase() === targetAdm.applicant.toLowerCase());
          if (!alreadyMember) {
            const newMember = {
              id: 'm-' + Date.now(),
              name: targetAdm.applicant, email: targetAdm.applicantEmail,
              role: 'member',
              avatar: targetAdm.applicantAvatar,
              major: targetAdm.applicantMajor,
              studentId: targetAdm.applicantStudentId,
              joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              skills: targetAdm.skills ? targetAdm.skills.split(',').map(s => s.trim()) : ['Teamwork']
            };
            return { ...c, membersCount: c.membersCount + 1, members: [newMember, ...c.members] };
          }
        }
        return c;
      }));
      if (targetAdm.applicant.toLowerCase() === user.name.toLowerCase()) {
        const clubInfo = clubs.find(c => c.name.toLowerCase() === targetAdm.club.toLowerCase()) || {};
        if (!user.joinedClubs.some(jc => jc.name.toLowerCase() === targetAdm.club.toLowerCase())) {
          setUser(prev => ({
            ...prev, xp: prev.xp + 150, points: prev.points + 150,
            joinedClubs: [...prev.joinedClubs, {
              id: clubInfo.id || 'c-' + Date.now(),
              name: targetAdm.club, role: targetAdm.appliedRole || 'Active Member',
              badge: 'Member', membersCount: (clubInfo.membersCount || 50) + 1,
              icon: clubInfo.icon || '🎯'
            }]
          }));
        }
      }
      pushNotification({
        type: NOTIFICATION_TYPES.ADMISSION,
        title: '🎉 Admission Approved!',
        message: `${targetAdm.applicant} was accepted into ${targetAdm.club}.`,
        related_club_id: targetAdm.club_id
      });
    } else if (newStatus === 'rejected') {
      pushNotification({
        type: NOTIFICATION_TYPES.ADMISSION,
        title: 'Admission Status Update',
        message: `Application for ${targetAdm.applicant} (${targetAdm.club}) marked as Rejected.`
      });
    }
  };

  // ── Attendance ─────────────────────────────────────────────────
  const markAttendance = (studentName, eventTitle, status) => {
    setAttendance(prev => [{
      id: 'att-' + Date.now(),
      studentName, eventTitle, status,
      studentId: 'ST-' + Math.floor(1000 + Math.random() * 9000),
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }, ...prev]);
  };

  // ── Resources ──────────────────────────────────────────────────
  const addResource = (res) => {
    setResources(prev => [{
      id: 'res-' + Date.now(), downloads: 0,
      date: new Date().toISOString().split('T')[0], ...res
    }, ...prev]);
  };

  // ── Gallery ────────────────────────────────────────────────────
  const addPhoto = (photo) => {
    setGallery(prev => [{
      id: 'ph-' + Date.now(), likes: 0, likedByMe: false,
      uploader: user.name, date: 'Just now', ...photo
    }, ...prev]);
  };

  const likePhoto = (id) => {
    setGallery(prev => prev.map(p => {
      if (p.id === id) {
        const likedByMe = !p.likedByMe;
        return { ...p, likedByMe, likes: likedByMe ? p.likes + 1 : p.likes - 1 };
      }
      return p;
    }));
  };

  // ── Gamification ───────────────────────────────────────────────
  const claimReward = (rewardId) => {
    const target = gamification.rewards.find(r => r.id === rewardId);
    if (!target || target.claimed || user.xp < target.cost) return;
    setUser(prev => ({ ...prev, xp: prev.xp - target.cost, points: prev.points - target.cost }));
    setGamification(prev => ({
      ...prev,
      rewards: prev.rewards.map(r => r.id === rewardId ? { ...r, claimed: true } : r)
    }));
    pushNotification({
      type: NOTIFICATION_TYPES.GAMIFICATION,
      title: 'Reward Claimed!',
      message: `You claimed "${target.title}" for ${target.cost} XP.`
    });
  };

  // ── Notifications ──────────────────────────────────────────────
  /** Internal helper: push a new notification to the top of the list */
  const pushNotification = (data) => {
    setNotifications(prev => [{
      ...DEFAULT_NOTIFICATION,
      id: Date.now(),
      time: 'Just now',
      is_read: false,
      ...data
    }, ...prev]);
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // ═══════════════════════════════════════════════════════════════
  return (
    <AppContext.Provider value={{
      // State
      user, setUser,
      signOut: async () => {
        window.clearTimeout(saveTimer.current);
        const { error } = await saveAppSnapshot(session.user.id, {
          user, clubs, events, tasks, taskComments, gamification,
          suggestions, admissions, attendance, resources, gallery, notifications, chatMessages,
        });
        if (error) {
          setSaveError(`Could not save before signing out: ${error.message}`);
          return;
        }
        await supabase.auth.signOut();
      },
      saveError,
      clubs, setClubs,
      events,
      tasks,
      taskComments,
      gamification,
      suggestions,
      admissions,
      attendance,
      resources,
      gallery,
      notifications,
      chatMessages, setChatMessages,
      // User actions
      updateUserProfile, addSkill, removeSkill, leaveClub, addClub,
      // Event actions
      toggleRsvp, addEvent,
      // Task actions
      addTask, updateTask, deleteTask, moveTask, addTaskComment,
      // Suggestion actions
      upvoteSuggestion, addSuggestion, updateSuggestionAdminResponse,
      // Admission actions
      applyForClub, withdrawApplication, reviewAdmission,
      // Attendance
      markAttendance,
      // Resources & Gallery
      addResource, addPhoto, likePhoto,
      // Gamification
      claimReward,
      // Notification actions
      pushNotification,
      markNotificationRead, markAllNotificationsRead,
      deleteNotification, clearNotifications
    }}>
      <>
        {saveError && <div role="status" style={{ position: 'fixed', bottom: 12, left: 12, zIndex: 9999, padding: '10px 14px', borderRadius: 8, background: '#5b2028', color: '#fff' }}>{saveError}</div>}
        {children}
      </>
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
