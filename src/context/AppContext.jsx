import React, { createContext, useContext, useState } from 'react';
import {
  TASK_STATUS, TASK_PRIORITY,
  NOTIFICATION_TYPES,
  DEFAULT_TASK, DEFAULT_NOTIFICATION, DEFAULT_SUGGESTION
} from '../lib/schema';

const AppContext = createContext();

export function AppProvider({ children }) {
  // ─── 1. User Profile ───────────────────────────────────────────
  const [user, setUser] = useState({
    id: 1,
    school_id: 1,
    type: 'student',
    name: 'Alex Johnson',
    role: 'Club President & Student',
    studentId: 'STU-2024-8891',
    email: 'alex.j@school.edu',
    phone: '+1 (555) 382-9012',
    major: 'Computer Science & AI',
    academicYear: 'Junior • Year 3',
    gpa: '3.88 / 4.0',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Passionate about AI, Robotics, and building collaborative student tech communities.',
    joinedDate: 'Sept 2025',
    level: 7,
    xp: 3450,
    points: 3450,
    nextLevelXp: 5000,
    streak: 12,
    tags: ['React JS', 'Robotics', 'AI', 'Leadership'],
    skills: ['React JS', 'Event Planning', 'Public Speaking', 'UI/UX Design', 'Python', 'Leadership'],
    joinedClubs: [
      { id: 'c1', name: 'Robotics & Tech Club', role: 'President', badge: 'Leader', membersCount: 142, icon: '🤖' },
      { id: 'c2', name: 'AI Research Group', role: 'Lead Developer', badge: 'Core', membersCount: 88, icon: '🧠' },
      { id: 'c3', name: 'Debate Society', role: 'Active Member', badge: 'Member', membersCount: 64, icon: '🗣️' }
    ],
    badges: [
      { id: 'b1', name: 'Pioneer Leader', icon: '👑', desc: 'Founded or led a top 3 school club' },
      { id: 'b2', name: 'Event Master', icon: '🎯', desc: 'Organized 10+ successful events' },
      { id: 'b3', name: 'Task Crusher', icon: '⚡', desc: 'Completed over 25 club assignments' },
      { id: 'b4', name: '10-Day Streak', icon: '🔥', desc: 'Logged in consecutively for 10 days' }
    ]
  });

  // ─── 2. Clubs ──────────────────────────────────────────────────
  const [clubs, setClubs] = useState([
    {
      id: 'c1', school_id: 1, name: 'Robotics & Tech Club',
      category: 'Engineering & Robotics', icon: '🤖',
      description: 'Premier student robotics laboratory specializing in autonomous rovers, drone avionics, and micro-controller hardware prototypes.',
      president: 'Alex Johnson', advisor: 'Dr. Robert Martinez (Dept of Robotics)',
      meetingSchedule: 'Every Tuesday & Thursday • 16:30 - 18:30',
      room: 'Engineering Lab 204',
      status: 'active', color: '#E53935',
      banner: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80',
      membersCount: 142,
      tags: ['Robotics', 'Hardware', 'Arduino', 'Autonomous Systems'],
      members: [
        { id: 'm-1', name: 'Alex Johnson', email: 'alex.j@school.edu', role: 'president', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', major: 'Computer Science & AI', studentId: 'STU-2024-8891', joinedDate: 'Sept 2025', skills: ['React JS', 'Robotics', 'Leadership'] },
        { id: 'm-2', name: 'Sarah Chen', email: 'sarah.c@school.edu', role: 'vice_president', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', major: 'Electrical Engineering', studentId: 'ST-9022', joinedDate: 'Oct 2025', skills: ['PCB Design', 'Embedded C'] },
        { id: 'm-3', name: 'Daniel Miller', email: 'daniel.m@school.edu', role: 'member', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', major: 'Mechanical Engineering', studentId: 'ST-9034', joinedDate: 'Jan 2026', skills: ['Arduino', 'CAD'] },
        { id: 'm-4', name: 'Elena Rostova', email: 'elena.r@school.edu', role: 'secretary', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', major: 'Robotics Engineering', studentId: 'ST-9045', joinedDate: 'Nov 2025', skills: ['LiDAR', 'ROS2'] }
      ]
    },
    {
      id: 'c2', school_id: 1, name: 'AI Research Group',
      category: 'Computer Science & AI', icon: '🧠',
      description: 'Student-led research lab focusing on deep learning, generative AI, natural language processing, and ethical machine intelligence.',
      president: 'Elena Rostova', advisor: 'Prof. Katherine Hughes (AI Institute)',
      meetingSchedule: 'Wednesdays • 15:00 - 17:00',
      room: 'Auditorium B & Turing Lab',
      status: 'active', color: '#8E24AA',
      banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      membersCount: 88,
      tags: ['Machine Learning', 'PyTorch', 'NLP', 'Computer Vision'],
      members: [
        { id: 'm-1', name: 'Alex Johnson', email: 'alex.j@school.edu', role: 'member', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', major: 'Computer Science & AI', studentId: 'STU-2024-8891', joinedDate: 'Sept 2025', skills: ['Python', 'Deep Learning'] },
        { id: 'm-5', name: 'Elena Rostova', email: 'elena.r@school.edu', role: 'president', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', major: 'Data Science', studentId: 'ST-9011', joinedDate: 'Aug 2025', skills: ['PyTorch', 'Transformers'] },
        { id: 'm-6', name: 'Chloe Zhang', email: 'chloe.z@school.edu', role: 'member', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', major: 'Linguistics & CS', studentId: 'ST-9088', joinedDate: 'Feb 2026', skills: ['LLMs', 'Tokenization'] }
      ]
    },
    {
      id: 'c3', school_id: 1, name: 'Debate Society',
      category: 'Public Speaking & Humanities', icon: '🗣️',
      description: 'Fostering critical discourse, parliamentary debate excellence, and persuasive public communication across university tournaments.',
      president: 'Liam Vance', advisor: 'Dr. Gregory House (Communications)',
      meetingSchedule: 'Mondays & Fridays • 17:00 - 19:00',
      room: 'Grand Hall & Room 301',
      status: 'active', color: '#00897B',
      banner: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
      membersCount: 64,
      tags: ['Debate', 'Rhetoric', 'Policy', 'Public Speaking'],
      members: [
        { id: 'm-1', name: 'Alex Johnson', email: 'alex.j@school.edu', role: 'member', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', major: 'Computer Science & AI', studentId: 'STU-2024-8891', joinedDate: 'Oct 2025', skills: ['Public Speaking', 'Rebuttal'] },
        { id: 'm-7', name: 'Liam Vance', email: 'liam.v@school.edu', role: 'president', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', major: 'Political Science', studentId: 'ST-9023', joinedDate: 'Sept 2025', skills: ['Parliamentary Rules', 'Oratory'] },
        { id: 'm-8', name: 'Michael Scott', email: 'm.scott@school.edu', role: 'treasurer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', major: 'Business Administration', studentId: 'ST-9024', joinedDate: 'Oct 2025', skills: ['Budgeting', 'Negotiation'] }
      ]
    },
    {
      id: 'c4', school_id: 1, name: 'Design Guild',
      category: 'Creative Arts & UI/UX', icon: '🎨',
      description: 'Empowering digital artists, interaction designers, and product creators through design sprints, Figma critiques, and brand identity projects.',
      president: 'Sophia Patel', advisor: 'Prof. Miriam Vance (Design School)',
      meetingSchedule: 'Wednesdays • 16:00 - 18:00',
      room: 'Design Studio 402',
      status: 'active', color: '#F4511E',
      banner: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?w=800&auto=format&fit=crop&q=80',
      membersCount: 52,
      tags: ['UI/UX', 'Figma', 'Product Design', 'Visual Arts'],
      members: [
        { id: 'm-9', name: 'Sophia Patel', email: 'sophia.p@school.edu', role: 'president', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80', major: 'Interactive Media Design', studentId: 'ST-9055', joinedDate: 'Sept 2025', skills: ['Figma', 'Design Systems', '3D Blender'] },
        { id: 'm-10', name: 'Leo Chen', email: 'leo.c@school.edu', role: 'member', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', major: 'HCI & Cognitive Science', studentId: 'ST-9059', joinedDate: 'Nov 2025', skills: ['Design Tokens', 'Prototyping'] }
      ]
    },
    {
      id: 'c5', school_id: 1, name: 'Cybersecurity Club',
      category: 'Information Security & Networks', icon: '🛡️',
      description: 'Hands-on ethical hacking, Capture The Flag (CTF) competitions, reverse engineering, defensive cybersecurity, and cryptography workshops.',
      president: 'Marcus Brody', advisor: 'Dr. Wallace Thorne (Cyber Lab)',
      meetingSchedule: 'Thursdays • 17:30 - 19:30',
      room: 'Cyber Range Lab 110',
      status: 'active', color: '#1E88E5',
      banner: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
      membersCount: 76,
      tags: ['Cybersecurity', 'CTF', 'Ethical Hacking', 'Cryptography', 'Networks'],
      members: [
        { id: 'm-11', name: 'Marcus Brody', email: 'marcus.b@school.edu', role: 'president', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', major: 'Cybersecurity & Networks', studentId: 'ST-9071', joinedDate: 'Aug 2025', skills: ['Pen Testing', 'Wireshark', 'Linux'] },
        { id: 'm-12', name: 'Zack Taylor', email: 'zack.t@school.edu', role: 'member', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80', major: 'Computer Networks', studentId: 'ST-9072', joinedDate: 'Oct 2025', skills: ['SIEM', 'Firewalls'] }
      ]
    }
  ]);

  // ─── 3. Events (aligned to DB events table) ────────────────────
  const [events, setEvents] = useState([
    {
      id: 101, club_id: 'c1',
      title: 'Annual Robotics Hackathon 2026', club: 'Robotics & Tech Club',
      event_date: '2026-10-15', date: '2026-10-15',
      start_time: '09:00', end_time: '18:00', time: '09:00 - 18:00',
      location: 'Main Engineering Lab', category: 'Competition',
      status: 'approved', description: 'Build autonomous mini-rovers in 8 hours! Hardware kits provided.',
      max_slots: 100, capacity: 100, rsvpCount: 78, isRsvped: true,
      color: '#E53935',
      image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80',
      milestone: 'Semester Flagship Event'
    },
    {
      id: 102, club_id: 'c2',
      title: 'AI & Neural Networks Intro', club: 'AI Research Group',
      event_date: '2026-10-18', date: '2026-10-18',
      start_time: '14:30', end_time: '16:30', time: '14:30 - 16:30',
      location: 'Auditorium B', category: 'Workshop',
      status: 'approved', description: 'Hands-on training session on PyTorch and Py-ML models.',
      max_slots: 60, capacity: 60, rsvpCount: 52, isRsvped: false,
      color: '#8E24AA',
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      milestone: 'Technical Deep Dive'
    },
    {
      id: 103, club_id: 'c3',
      title: 'Inter-School Debate Championship', club: 'Debate Society',
      event_date: '2026-10-22', date: '2026-10-22',
      start_time: '11:00', end_time: '15:00', time: '11:00 - 15:00',
      location: 'Grand Hall', category: 'Social',
      status: 'approved', description: 'Public speaking competition on global climate tech policies.',
      max_slots: 150, capacity: 150, rsvpCount: 110, isRsvped: true,
      color: '#00897B',
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80',
      milestone: 'Inter-School League'
    },
    {
      id: 104, club_id: 'c4',
      title: 'UI/UX Design Systems Workshop', club: 'Design Guild',
      event_date: '2026-09-28', date: '2026-09-28',
      start_time: '16:00', end_time: '18:00', time: '16:00 - 18:00',
      location: 'Design Studio 402', category: 'Workshop',
      status: 'completed', description: 'Learned tokenization and dark mode theme building in Figma.',
      max_slots: 40, capacity: 40, rsvpCount: 40, isRsvped: true,
      color: '#F4511E',
      image: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?w=600&auto=format&fit=crop&q=80',
      milestone: 'Skill Sprint'
    }
  ]);

  // ─── 4. Tasks (fully DB-aligned) ───────────────────────────────
  const [tasks, setTasks] = useState([
    {
      ...DEFAULT_TASK,
      id: 't1', club_id: 'c1', club: 'Robotics & Tech',
      title: 'Prepare Hackathon Sponsor Deck',
      description: 'Create a professional sponsorship deck with club statistics, past achievements, and event plan for the Annual Robotics Hackathon 2026.',
      assigned_to: 1, assignee: 'Alex Johnson',
      created_by: 1,
      status: TASK_STATUS.IN_PROGRESS,
      priority: TASK_PRIORITY.HIGH,
      due_date: '2026-10-10', points_awarded: 150, xp: 150,
      tags: ['Sponsorship', 'Presentation'],
      comments: [
        { id: 'tc-1', author: 'Sarah Chen', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=50&auto=format&fit=crop&q=80', content: 'Make sure to include last year\'s turnout numbers!', created_at: '2 hours ago' }
      ]
    },
    {
      ...DEFAULT_TASK,
      id: 't2', club_id: 'c2', club: 'AI Research Group',
      title: 'Book Auditorium B Microphones',
      description: 'Coordinate with facilities to reserve 4 wireless microphones and 1 lapel mic for the Neural Networks workshop.',
      assigned_to: 2, assignee: 'Sarah Chen',
      created_by: 1,
      status: TASK_STATUS.PENDING,
      priority: TASK_PRIORITY.MEDIUM,
      due_date: '2026-10-12', points_awarded: 80, xp: 80,
      tags: ['Logistics', 'Equipment'],
      comments: []
    },
    {
      ...DEFAULT_TASK,
      id: 't3', club_id: 'c3', club: 'Debate Society',
      title: 'Design Debate Event Flyer',
      description: 'Design a vibrant, eye-catching flyer for the Inter-School Debate Championship. Must include date, venue, and contact info.',
      assigned_to: 3, assignee: 'Michael Scott',
      created_by: 1,
      status: TASK_STATUS.SUBMITTED,
      priority: TASK_PRIORITY.HIGH,
      due_date: '2026-10-14', points_awarded: 100, xp: 100,
      tags: ['Design', 'Marketing'],
      file_url: '#', file_name: 'debate-flyer-v2.png',
      comments: [
        { id: 'tc-2', author: 'Alex Johnson', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50&auto=format&fit=crop&q=80', content: 'Looks great! Just needs the new logo.', created_at: '1 day ago' }
      ]
    },
    {
      ...DEFAULT_TASK,
      id: 't4', club_id: 'c4', club: 'Design Guild',
      title: 'Upload Design Workshop Slides',
      description: 'Export and upload the Figma workshop slides to the resource library under "Design Guild" category.',
      assigned_to: 1, assignee: 'Alex Johnson',
      created_by: 5,
      status: TASK_STATUS.COMPLETED,
      priority: TASK_PRIORITY.LOW,
      due_date: '2026-09-29', points_awarded: 50, xp: 50,
      completed_at: '2026-09-28T14:00:00Z',
      rating: 5, feedback: 'Great work! Slides were perfectly organized and uploaded on time.',
      tags: ['Documentation', 'Resources'],
      comments: []
    },
    {
      ...DEFAULT_TASK,
      id: 't5', club_id: 'c1', club: 'Robotics & Tech',
      title: 'Review Club Admission Requests',
      description: 'Go through the 3 pending admission applications in the Admissions portal. Approve, reject, or schedule interviews for each.',
      assigned_to: 1, assignee: 'Alex Johnson',
      created_by: 1,
      status: TASK_STATUS.IN_PROGRESS,
      priority: TASK_PRIORITY.URGENT,
      due_date: '2026-10-08', points_awarded: 120, xp: 120,
      tags: ['Admin', 'Admissions'],
      comments: []
    },
    {
      ...DEFAULT_TASK,
      id: 't6', club_id: 'c5', club: 'Cybersecurity Club',
      title: 'Set Up CTF Practice Server',
      description: 'Deploy a local CTF challenge environment on the club\'s server. Install at least 5 beginner-level challenges using PicoCTF framework.',
      assigned_to: 11, assignee: 'Marcus Brody',
      created_by: 11,
      status: TASK_STATUS.APPROVED,
      priority: TASK_PRIORITY.HIGH,
      due_date: '2026-10-20', points_awarded: 200, xp: 200,
      rating: 4, feedback: 'Excellent setup. Add one more network forensics challenge.',
      tags: ['Infrastructure', 'CTF'],
      comments: []
    }
  ]);

  // ─── 5. Task Comments (denormalized into tasks above, but also ─
  //        tracked separately for quick lookup) ───────────────────
  const [taskComments, setTaskComments] = useState({});

  // ─── 6. Gamification ───────────────────────────────────────────
  const [gamification, setGamification] = useState({
    leaderboard: [
      { rank: 1, name: 'Alex Johnson', xp: 3450, points: 3450, level: 7, club: 'Robotics & Tech', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
      { rank: 2, name: 'Elena Rostova', xp: 3120, points: 3120, level: 6, club: 'AI Research Group', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
      { rank: 3, name: 'Liam Vance', xp: 2890, points: 2890, level: 6, club: 'Debate Society', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
      { rank: 4, name: 'Sophia Patel', xp: 2450, points: 2450, level: 5, club: 'Design Guild', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80' },
      { rank: 5, name: 'Marcus Brody', xp: 2100, points: 2100, level: 5, club: 'Cybersecurity Club', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' }
    ],
    rewards: [
      { id: 'r1', title: 'VIP Front Row Seats at Hackathon', cost: 500, category: 'Pass', claimed: false },
      { id: 'r2', title: 'Official Robotics Club Hoodie', cost: 1200, category: 'Merch', claimed: false },
      { id: 'r3', title: 'Priority Room Scheduling Key', cost: 800, category: 'Perk', claimed: true },
      { id: 'r4', title: 'Featured Student Spot on Portal', cost: 1500, category: 'Recognition', claimed: false }
    ]
  });

  // ─── 7. Suggestions (DB-aligned) ───────────────────────────────
  const [suggestions, setSuggestions] = useState([
    {
      ...DEFAULT_SUGGESTION,
      id: 's1', title: 'Host a 24-Hour Outdoor Game Jam',
      author: 'Marcus B.', anonymous: false,
      category: 'Events', votes: 38, votedByMe: true,
      status: 'Planned',
      adminComment: 'Approved by Student Affairs! Scheduled for November.',
      details: 'A full-day outdoor game design marathon with prizes for top 3 teams.',
      date: '3 days ago'
    },
    {
      ...DEFAULT_SUGGESTION,
      id: 's2', title: 'Install 3D Printers in Student Lounge',
      author: 'Alex Johnson', anonymous: false,
      category: 'Campus', votes: 54, votedByMe: false,
      status: 'Under Review',
      adminComment: 'Evaluating budget allocation for Q4.',
      details: 'At least 2 FDM printers with filament provided for club use.',
      date: '1 week ago'
    },
    {
      ...DEFAULT_SUGGESTION,
      id: 's3', title: 'Automate QR Code Attendance Check-ins',
      author: 'Elena R.', anonymous: false,
      category: 'Club Tech', votes: 42, votedByMe: false,
      status: 'Implemented',
      adminComment: 'Feature live in the Attendance tab!',
      details: 'Generate a unique QR per event; students scan on arrival.',
      date: '2 weeks ago'
    }
  ]);

  // ─── 8. Admissions (aligned to club_applications table) ────────
  const [admissions, setAdmissions] = useState([
    {
      id: 'adm-101', club_id: 'c1',
      applicant: 'Daniel Miller', applicantEmail: 'daniel.m@school.edu',
      applicantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      applicantStudentId: 'ST-9034', applicantMajor: 'Mechanical Engineering',
      club: 'Robotics & Tech Club', appliedRole: 'Hardware Specialist',
      experience: 'Intermediate Arduino & C++', skills: 'Arduino, Soldering, 3D CAD',
      motivation: 'Want to build autonomous solar quadcopters and join the engineering competition team.',
      appliedDate: '2026-10-01', status: 'approved',
      feedbackNotes: 'Strong hands-on fabrication experience. Welcome to the team!'
    },
    {
      id: 'adm-102', club_id: 'c2',
      applicant: 'Chloe Zhang', applicantEmail: 'chloe.z@school.edu',
      applicantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      applicantStudentId: 'ST-9088', applicantMajor: 'Linguistics & CS',
      club: 'AI Research Group', appliedRole: 'NLP Data Researcher',
      experience: 'Advanced Python, Bootcamp Graduate', skills: 'Python, PyTorch, Tokenization, HuggingFace',
      motivation: 'Eager to work on Large Language Model fine-tuning and sentiment pipelines.',
      appliedDate: '2026-09-29', status: 'pending',
      feedbackNotes: 'Interview scheduled for Oct 14 at 15:00 in Auditorium B.'
    },
    {
      id: 'adm-103', club_id: 'c5',
      applicant: 'Alex Johnson', applicantEmail: 'alex.j@school.edu',
      applicantAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      applicantStudentId: 'STU-2024-8891', applicantMajor: 'Computer Science & AI',
      club: 'Cybersecurity Club', appliedRole: 'Ethical Hacker & CTF Analyst',
      experience: 'Intermediate Security Enthusiast', skills: 'Linux, Wireshark, Python Scripting',
      motivation: 'Exploring network penetration testing, defensive cryptography, and participating in regional CTF cups.',
      appliedDate: '2026-10-02', status: 'pending',
      feedbackNotes: 'Under preliminary review by club leadership.'
    }
  ]);

  // ─── 9. Attendance (meeting_attendance) ────────────────────────
  const [attendance, setAttendance] = useState([
    { id: 'att-1', studentName: 'Alex Johnson', studentId: 'ST-9021', eventTitle: 'UI/UX Design Systems Workshop', checkInTime: '16:05 PM', status: 'present' },
    { id: 'att-2', studentName: 'Sarah Chen', studentId: 'ST-9022', eventTitle: 'UI/UX Design Systems Workshop', checkInTime: '16:12 PM', status: 'present' },
    { id: 'att-3', studentName: 'Liam Vance', studentId: 'ST-9023', eventTitle: 'UI/UX Design Systems Workshop', checkInTime: '16:25 PM', status: 'late' },
    { id: 'att-4', studentName: 'Michael Scott', studentId: 'ST-9024', eventTitle: 'UI/UX Design Systems Workshop', checkInTime: '--', status: 'absent' }
  ]);

  // ─── 10. Resources (club_documents) ────────────────────────────
  const [resources, setResources] = useState([
    { id: 'res-1', title: 'School Club Constitution Template 2026', club: 'General Admin', category: 'Templates', fileType: 'PDF', size: '2.4 MB', date: '2026-09-01', downloads: 142 },
    { id: 'res-2', title: 'Robotics Hackathon Rules & Safety Guide', club: 'Robotics & Tech', category: 'Guidelines', fileType: 'PDF', size: '1.8 MB', date: '2026-09-20', downloads: 89 },
    { id: 'res-3', title: 'High-Res School Logos & Vector Badges', club: 'Design Guild', category: 'Graphics & Media', fileType: 'ZIP', size: '14.5 MB', date: '2026-08-15', downloads: 230 },
    { id: 'res-4', title: 'Semester Budget & Sponsorship Request Form', club: 'General Admin', category: 'Financial Forms', fileType: 'XLSX', size: '512 KB', date: '2026-09-10', downloads: 115 }
  ]);

  // ─── 11. Photo Gallery ─────────────────────────────────────────
  const [gallery, setGallery] = useState([
    { id: 'ph-1', title: 'Robotics Quadcopter Flight Test', eventName: 'Spring Tech Expo', club: 'Robotics & Tech', image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80', likes: 34, likedByMe: true, uploader: 'Alex Johnson', date: 'Oct 2, 2026' },
    { id: 'ph-2', title: 'Debate Finals Award Ceremony', eventName: 'State Debate League', club: 'Debate Society', image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80', likes: 48, likedByMe: false, uploader: 'Liam Vance', date: 'Sep 25, 2026' },
    { id: 'ph-3', title: 'Figma UI Prototyping Jam Session', eventName: 'UI/UX Design Systems Workshop', club: 'Design Guild', image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80', likes: 29, likedByMe: true, uploader: 'Sophia Patel', date: 'Sep 28, 2026' }
  ]);

  // ─── 12. Notifications (DB-aligned) ────────────────────────────
  const [notifications, setNotifications] = useState([
    {
      ...DEFAULT_NOTIFICATION,
      id: 'n1', type: NOTIFICATION_TYPES.EVENT,
      title: 'Event Reminder',
      message: 'Annual Robotics Hackathon is in 12 days!',
      related_event_id: 101, time: '10 mins ago', is_read: false
    },
    {
      ...DEFAULT_NOTIFICATION,
      id: 'n2', type: NOTIFICATION_TYPES.TASK,
      title: 'Task Ready for Review',
      message: 'Design Debate Event Flyer has been submitted for review.',
      related_task_id: 't3', time: '1 hour ago', is_read: false
    },
    {
      ...DEFAULT_NOTIFICATION,
      id: 'n3', type: NOTIFICATION_TYPES.GAMIFICATION,
      title: 'Gamification Level Up!',
      message: 'Congrats! You reached Level 7 and earned 150 XP.',
      time: '1 day ago', is_read: true
    },
    {
      ...DEFAULT_NOTIFICATION,
      id: 'n4', type: NOTIFICATION_TYPES.ADMISSION,
      title: 'New Admission Request',
      message: 'Daniel Miller applied for Robotics & Tech Club.',
      related_club_id: 'c1', time: '2 days ago', is_read: true
    }
  ]);

  // ═══════════════════════════════════════════════════════════════
  //  ACTION HANDLERS
  // ═══════════════════════════════════════════════════════════════

  // ── User ───────────────────────────────────────────────────────
  const updateUserProfile = (updatedFields) => {
    setUser(prev => ({ ...prev, ...updatedFields }));
    setClubs(prevClubs => prevClubs.map(c => ({
      ...c,
      members: c.members.map(m => {
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
          members: c.members.filter(m => m.name !== user.name && m.email !== user.email)
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
          const alreadyMember = c.members.some(m => m.name.toLowerCase() === targetAdm.applicant.toLowerCase());
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
      // User actions
      updateUserProfile, addSkill, removeSkill, leaveClub,
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
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
