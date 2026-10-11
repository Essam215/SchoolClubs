import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export function AppProvider({ children }) {
  // 1. User Profile State
  const [user, setUser] = useState({
    name: 'Alex Johnson',
    role: 'Club President & Student',
    studentId: 'STU-2024-8891',
    email: 'alex.j@school.edu',
    phone: '+1 (555) 382-9012',
    major: 'Computer Science & AI',
    academicYear: 'Junior • Year 3',
    gpa: '3.88 / 4.0',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Passionate about AI, Robotics, and building collaborative student tech communities. Interested in autonomous systems and user experience design.',
    joinedDate: 'Sept 2025',
    level: 7,
    xp: 3450,
    nextLevelXp: 5000,
    streak: 12,
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

  // 1.5 Official School Clubs State with Member Rosters
  const [clubs, setClubs] = useState([
    {
      id: 'c1',
      name: 'Robotics & Tech Club',
      category: 'Engineering & Robotics',
      icon: '🤖',
      banner: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=80',
      description: 'Premier student robotics laboratory specializing in autonomous rovers, drone avionics, and micro-controller hardware prototypes.',
      president: 'Alex Johnson',
      advisor: 'Dr. Robert Martinez (Dept of Robotics)',
      meetingSchedule: 'Every Tuesday & Thursday • 16:30 - 18:30',
      room: 'Engineering Lab 204',
      membersCount: 142,
      tags: ['Robotics', 'Hardware', 'Arduino', 'Autonomous Systems'],
      members: [
        { id: 'm-1', name: 'Alex Johnson', email: 'alex.j@school.edu', role: 'President', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', major: 'Computer Science & AI', studentId: 'STU-2024-8891', joinedDate: 'Sept 2025', skills: ['React JS', 'Robotics', 'Leadership'] },
        { id: 'm-2', name: 'Sarah Chen', email: 'sarah.c@school.edu', role: 'Vice President', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', major: 'Electrical Engineering', studentId: 'ST-9022', joinedDate: 'Oct 2025', skills: ['PCB Design', 'Embedded C'] },
        { id: 'm-3', name: 'Daniel Miller', email: 'daniel.m@school.edu', role: 'Hardware Specialist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', major: 'Mechanical Engineering', studentId: 'ST-9034', joinedDate: 'Jan 2026', skills: ['Arduino', 'CAD'] },
        { id: 'm-4', name: 'Elena Rostova', email: 'elena.r@school.edu', role: 'Sensor Integration Lead', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80', major: 'Robotics Engineering', studentId: 'ST-9045', joinedDate: 'Nov 2025', skills: ['LiDAR', 'ROS2'] }
      ]
    },
    {
      id: 'c2',
      name: 'AI Research Group',
      category: 'Computer Science & AI',
      icon: '🧠',
      banner: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
      description: 'Student-led research lab focusing on deep learning, generative AI, natural language processing, and ethical machine intelligence.',
      president: 'Elena Rostova',
      advisor: 'Prof. Katherine Hughes (AI Institute)',
      meetingSchedule: 'Wednesdays • 15:00 - 17:00',
      room: 'Auditorium B & Turing Lab',
      membersCount: 88,
      tags: ['Machine Learning', 'PyTorch', 'NLP', 'Computer Vision'],
      members: [
        { id: 'm-1', name: 'Alex Johnson', email: 'alex.j@school.edu', role: 'Lead Developer', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', major: 'Computer Science & AI', studentId: 'STU-2024-8891', joinedDate: 'Sept 2025', skills: ['Python', 'Deep Learning'] },
        { id: 'm-5', name: 'Elena Rostova', email: 'elena.r@school.edu', role: 'President & Founder', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80', major: 'Data Science', studentId: 'ST-9011', joinedDate: 'Aug 2025', skills: ['PyTorch', 'Transformers'] },
        { id: 'm-6', name: 'Chloe Zhang', email: 'chloe.z@school.edu', role: 'NLP Researcher', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', major: 'Linguistics & CS', studentId: 'ST-9088', joinedDate: 'Feb 2026', skills: ['LLMs', 'Tokenization'] }
      ]
    },
    {
      id: 'c3',
      name: 'Debate Society',
      category: 'Public Speaking & Humanities',
      icon: '🗣️',
      banner: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
      description: 'Fostering critical discourse, parliamentary debate excellence, and persuasive public communication across university tournaments.',
      president: 'Liam Vance',
      advisor: 'Dr. Gregory House (Communications)',
      meetingSchedule: 'Mondays & Fridays • 17:00 - 19:00',
      room: 'Grand Hall & Room 301',
      membersCount: 64,
      tags: ['Debate', 'Rhetoric', 'Policy', 'Public Speaking'],
      members: [
        { id: 'm-1', name: 'Alex Johnson', email: 'alex.j@school.edu', role: 'Active Member', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', major: 'Computer Science & AI', studentId: 'STU-2024-8891', joinedDate: 'Oct 2025', skills: ['Public Speaking', 'Rebuttal'] },
        { id: 'm-7', name: 'Liam Vance', email: 'liam.v@school.edu', role: 'President', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', major: 'Political Science', studentId: 'ST-9023', joinedDate: 'Sept 2025', skills: ['Parliamentary Rules', 'Oratory'] },
        { id: 'm-8', name: 'Michael Scott', email: 'm.scott@school.edu', role: 'Treasurer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', major: 'Business Administration', studentId: 'ST-9024', joinedDate: 'Oct 2025', skills: ['Budgeting', 'Negotiation'] }
      ]
    },
    {
      id: 'c4',
      name: 'Design Guild',
      category: 'Creative Arts & UI/UX',
      icon: '🎨',
      banner: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?w=800&auto=format&fit=crop&q=80',
      description: 'Empowering digital artists, interaction designers, and product creators through design sprints, Figma critiques, and brand identity projects.',
      president: 'Sophia Patel',
      advisor: 'Prof. Miriam Vance (Design School)',
      meetingSchedule: 'Wednesdays • 16:00 - 18:00',
      room: 'Design Studio 402',
      membersCount: 52,
      tags: ['UI/UX', 'Figma', 'Product Design', 'Visual Arts'],
      members: [
        { id: 'm-9', name: 'Sophia Patel', email: 'sophia.p@school.edu', role: 'President & Creative Director', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80', major: 'Interactive Media Design', studentId: 'ST-9055', joinedDate: 'Sept 2025', skills: ['Figma', 'Design Systems', '3D Blender'] },
        { id: 'm-10', name: 'Leo Chen', email: 'leo.c@school.edu', role: 'Design Systems Architect', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', major: 'HCI & Cognitive Science', studentId: 'ST-9059', joinedDate: 'Nov 2025', skills: ['Design Tokens', 'Prototyping'] }
      ]
    },
    {
      id: 'c5',
      name: 'Cybersecurity Club',
      category: 'Information Security & Networks',
      icon: '🛡️',
      banner: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80',
      description: 'Hands-on ethical hacking, Capture The Flag (CTF) competitions, reverse engineering, defensive cybersecurity, and cryptography workshops.',
      president: 'Marcus Brody',
      advisor: 'Dr. Wallace Thorne (Cyber Lab)',
      meetingSchedule: 'Thursdays • 17:30 - 19:30',
      room: 'Cyber Range Lab 110',
      membersCount: 76,
      tags: ['Cybersecurity', 'CTF', 'Ethical Hacking', 'Cryptography', 'Networks'],
      members: [
        { id: 'm-11', name: 'Marcus Brody', email: 'marcus.b@school.edu', role: 'President & CTF Captain', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', major: 'Cybersecurity & Networks', studentId: 'ST-9071', joinedDate: 'Aug 2025', skills: ['Pen Testing', 'Wireshark', 'Linux'] },
        { id: 'm-12', name: 'Zack Taylor', email: 'zack.t@school.edu', role: 'Defensive Ops Lead', avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80', major: 'Computer Networks', studentId: 'ST-9072', joinedDate: 'Oct 2025', skills: ['SIEM', 'Firewalls'] }
      ]
    }
  ]);

  // 2. Events State
  const [events, setEvents] = useState([
    {
      id: 101,
      title: 'Annual Robotics Hackathon 2026',
      club: 'Robotics & Tech Club',
      date: '2026-10-15',
      time: '09:00 - 18:00',
      location: 'Main Engineering Lab',
      category: 'Competition',
      status: 'Upcoming',
      description: 'Build autonomous mini-rovers in 8 hours! Hardware kits provided.',
      capacity: 100,
      rsvpCount: 78,
      isRsvped: true,
      image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=600&auto=format&fit=crop&q=80',
      milestone: 'Semester Flagship Event'
    },
    {
      id: 102,
      title: 'AI & Neural Networks Intro',
      club: 'AI Research Group',
      date: '2026-10-18',
      time: '14:30 - 16:30',
      location: 'Auditorium B',
      category: 'Workshop',
      status: 'Upcoming',
      description: 'Hands-on training session on PyTorch and Py-ML models.',
      capacity: 60,
      rsvpCount: 52,
      isRsvped: false,
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      milestone: 'Technical Deep Dive'
    },
    {
      id: 103,
      title: 'Inter-School Debate Championship',
      club: 'Debate Society',
      date: '2026-10-22',
      time: '11:00 - 15:00',
      location: 'Grand Hall',
      category: 'Social',
      status: 'Upcoming',
      description: 'Public speaking competition on global climate tech policies.',
      capacity: 150,
      rsvpCount: 110,
      isRsvped: true,
      image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80',
      milestone: 'Inter-School League'
    },
    {
      id: 104,
      title: 'UI/UX Design Systems Workshop',
      club: 'Design Guild',
      date: '2026-09-28',
      time: '16:00 - 18:00',
      location: 'Design Studio 402',
      category: 'Workshop',
      status: 'Completed',
      description: 'Learned tokenization and dark mode theme building in Figma.',
      capacity: 40,
      rsvpCount: 40,
      isRsvped: true,
      image: 'https://images.unsplash.com/photo-1542744094-3a31b272c490?w=600&auto=format&fit=crop&q=80',
      milestone: 'Skill Sprint'
    }
  ]);

  // 3. Tasks State
  const [tasks, setTasks] = useState([
    { id: 't1', title: 'Prepare Hackathon Sponsor Deck', club: 'Robotics & Tech', status: 'To Do', priority: 'High', dueDate: '2026-10-10', assignee: 'Alex Johnson', xp: 150 },
    { id: 't2', title: 'Book Auditorium B Microphones', club: 'AI Research Group', status: 'In Progress', priority: 'Medium', dueDate: '2026-10-12', assignee: 'Sarah Chen', xp: 80 },
    { id: 't3', title: 'Design Debate Event Flyer', club: 'Debate Society', status: 'Review', priority: 'High', dueDate: '2026-10-14', assignee: 'Michael Scott', xp: 100 },
    { id: 't4', title: 'Upload Design Workshop Slides', club: 'Design Guild', status: 'Completed', priority: 'Low', dueDate: '2026-09-29', assignee: 'Alex Johnson', xp: 50 },
    { id: 't5', title: 'Review Club Admission Requests', club: 'Robotics & Tech', status: 'In Progress', priority: 'High', dueDate: '2026-10-08', assignee: 'Alex Johnson', xp: 120 }
  ]);

  // 4. Gamification State
  const [gamification, setGamification] = useState({
    leaderboard: [
      { rank: 1, name: 'Alex Johnson', xp: 3450, level: 7, club: 'Robotics & Tech', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80' },
      { rank: 2, name: 'Elena Rostova', xp: 3120, level: 6, club: 'AI Research Group', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80' },
      { rank: 3, name: 'Liam Vance', xp: 2890, level: 6, club: 'Debate Society', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80' },
      { rank: 4, name: 'Sophia Patel', xp: 2450, level: 5, club: 'Design Guild', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80' },
      { rank: 5, name: 'Marcus Brody', xp: 2100, level: 5, club: 'Cybersecurity Club', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80' }
    ],
    rewards: [
      { id: 'r1', title: 'VIP Front Row Seats at Hackathon', cost: 500, category: 'Pass', claimed: false },
      { id: 'r2', title: 'Official Robotics Club Hoodie', cost: 1200, category: 'Merch', claimed: false },
      { id: 'r3', title: 'Priority Room Scheduling Key', cost: 800, category: 'Perk', claimed: true },
      { id: 'r4', title: 'Featured Student Spot on Portal', cost: 1500, category: 'Recognition', claimed: false }
    ]
  });

  // 5. Suggestions State
  const [suggestions, setSuggestions] = useState([
    {
      id: 's1',
      title: 'Host an 24-Hour Outdoor Game Jam',
      author: 'Marcus B.',
      category: 'Events',
      votes: 38,
      votedByMe: true,
      status: 'Planned',
      adminComment: 'Approved by Student Affairs! Scheduled for November.',
      date: '3 days ago'
    },
    {
      id: 's2',
      title: 'Install 3D Printers in Student Lounge',
      author: 'Alex Johnson',
      category: 'Campus',
      votes: 54,
      votedByMe: false,
      status: 'Under Review',
      adminComment: 'Evaluating budget allocation for Q4.',
      date: '1 week ago'
    },
    {
      id: 's3',
      title: 'Automate QR Code Attendance Check-ins',
      author: 'Elena R.',
      category: 'Club Tech',
      votes: 42,
      votedByMe: false,
      status: 'Implemented',
      adminComment: 'Feature live in the Attendance tab!',
      date: '2 weeks ago'
    }
  ]);

  // 6. Club Admission Applications
  const [admissions, setAdmissions] = useState([
    {
      id: 'adm-101',
      applicant: 'Daniel Miller',
      applicantEmail: 'daniel.m@school.edu',
      applicantAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
      applicantStudentId: 'ST-9034',
      applicantMajor: 'Mechanical Engineering',
      club: 'Robotics & Tech Club',
      appliedRole: 'Hardware Specialist',
      experience: 'Intermediate Arduino & C++',
      skills: 'Arduino, Soldering, 3D CAD',
      motivation: 'Want to build autonomous solar quadcopters and join the engineering competition team.',
      appliedDate: '2026-10-01',
      status: 'Approved',
      feedbackNotes: 'Strong hands-on fabrication experience. Welcome to the team!'
    },
    {
      id: 'adm-102',
      applicant: 'Chloe Zhang',
      applicantEmail: 'chloe.z@school.edu',
      applicantAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
      applicantStudentId: 'ST-9088',
      applicantMajor: 'Linguistics & CS',
      club: 'AI Research Group',
      appliedRole: 'NLP Data Researcher',
      experience: 'Advanced Python, Bootcamp Graduate',
      skills: 'Python, PyTorch, Tokenization, HuggingFace',
      motivation: 'Eager to work on Large Language Model fine-tuning and sentiment pipelines.',
      appliedDate: '2026-09-29',
      status: 'Interview Scheduled',
      feedbackNotes: 'Interview scheduled for Oct 14 at 15:00 in Auditorium B.'
    },
    {
      id: 'adm-103',
      applicant: 'Alex Johnson',
      applicantEmail: 'alex.j@school.edu',
      applicantAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      applicantStudentId: 'STU-2024-8891',
      applicantMajor: 'Computer Science & AI',
      club: 'Cybersecurity Club',
      appliedRole: 'Ethical Hacker & CTF Analyst',
      experience: 'Intermediate Security Enthusiast',
      skills: 'Linux, Wireshark, Python Scripting',
      motivation: 'Exploring network penetration testing, defensive cryptography, and participating in regional CTF cups.',
      appliedDate: '2026-10-02',
      status: 'Pending',
      feedbackNotes: 'Under preliminary review by club leadership.'
    }
  ]);

  // 7. Attendance Records State
  const [attendance, setAttendance] = useState([
    { id: 'att-1', studentName: 'Alex Johnson', studentId: 'ST-9021', eventTitle: 'UI/UX Design Systems Workshop', checkInTime: '16:05 PM', status: 'Present' },
    { id: 'att-2', studentName: 'Sarah Chen', studentId: 'ST-9022', eventTitle: 'UI/UX Design Systems Workshop', checkInTime: '16:12 PM', status: 'Present' },
    { id: 'att-3', studentName: 'Liam Vance', studentId: 'ST-9023', eventTitle: 'UI/UX Design Systems Workshop', checkInTime: '16:25 PM', status: 'Late' },
    { id: 'att-4', studentName: 'Michael Scott', studentId: 'ST-9024', eventTitle: 'UI/UX Design Systems Workshop', checkInTime: '--', status: 'Absent' }
  ]);

  // 8. Resource Library State
  const [resources, setResources] = useState([
    { id: 'res-1', title: 'School Club Constitution Template 2026', club: 'General Admin', category: 'Templates', fileType: 'PDF', size: '2.4 MB', date: '2026-09-01', downloads: 142 },
    { id: 'res-2', title: 'Robotics Hackathon Rules & Safety Guide', club: 'Robotics & Tech', category: 'Guidelines', fileType: 'PDF', size: '1.8 MB', date: '2026-09-20', downloads: 89 },
    { id: 'res-3', title: 'High-Res School Logos & Vector Badges', club: 'Design Guild', category: 'Graphics & Media', fileType: 'ZIP', size: '14.5 MB', date: '2026-08-15', downloads: 230 },
    { id: 'res-4', title: 'Semester Budget & Sponsorship Request Form', club: 'General Admin', category: 'Financial Forms', fileType: 'XLSX', size: '512 KB', date: '2026-09-10', downloads: 115 }
  ]);

  // 9. Photo Album State
  const [gallery, setGallery] = useState([
    {
      id: 'ph-1',
      title: 'Robotics Quadcopter Flight Test',
      eventName: 'Spring Tech Expo',
      club: 'Robotics & Tech',
      image: 'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&auto=format&fit=crop&q=80',
      likes: 34,
      likedByMe: true,
      uploader: 'Alex Johnson',
      date: 'Oct 2, 2026'
    },
    {
      id: 'ph-2',
      title: 'Debate Finals Award Ceremony',
      eventName: 'State Debate League',
      club: 'Debate Society',
      image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
      likes: 48,
      likedByMe: false,
      uploader: 'Liam Vance',
      date: 'Sep 25, 2026'
    },
    {
      id: 'ph-3',
      title: 'Figma UI Prototyping Jam Session',
      eventName: 'UI/UX Design Systems Workshop',
      club: 'Design Guild',
      image: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80',
      likes: 29,
      likedByMe: true,
      uploader: 'Sophia Patel',
      date: 'Sep 28, 2026'
    }
  ]);

  // 10. Notifications State
  const [notifications, setNotifications] = useState([
    { id: 'n1', title: 'Event Reminder', message: 'Annual Robotics Hackathon is in 12 days!', time: '10 mins ago', read: false, type: 'Event' },
    { id: 'n2', title: 'Task Review', message: 'Design Debate Event Flyer is ready for review.', time: '1 hour ago', read: false, type: 'Task' },
    { id: 'n3', title: 'Gamification Level Up!', message: 'Congrats! You reached Level 7 and earned 150 XP.', time: '1 day ago', read: true, type: 'Gamification' },
    { id: 'n4', title: 'New Admission Request', message: 'Daniel Miller applied for Robotics & Tech Club.', time: '2 days ago', read: true, type: 'Admission' }
  ]);

  // Action Handlers
  const updateUserProfile = (updatedFields) => {
    setUser(prev => {
      const newUser = { ...prev, ...updatedFields };
      return newUser;
    });

    // Also update student's profile information across clubs member roster
    if (updatedFields.name || updatedFields.avatar || updatedFields.major || updatedFields.email) {
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
    }

    setNotifications(prev => [{
      id: Date.now(),
      title: 'Profile Updated',
      message: 'Your student information has been successfully saved.',
      time: 'Just now',
      read: false,
      type: 'Profile'
    }, ...prev]);
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

    // 1. Remove from user.joinedClubs
    setUser(prev => ({
      ...prev,
      joinedClubs: prev.joinedClubs.filter(c => c.id !== clubIdOrName && c.name !== clubIdOrName)
    }));

    // 2. Remove user from club members and decrement count
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

    setNotifications(prev => [{
      id: Date.now(),
      title: 'Club Left',
      message: `You have left ${clubName}.`,
      time: 'Just now',
      read: false,
      type: 'Club'
    }, ...prev]);
  };

  const toggleRsvp = (eventId) => {
    setEvents(prev => prev.map(ev => {
      if (ev.id === eventId) {
        const isRsvped = !ev.isRsvped;
        const rsvpCount = isRsvped ? ev.rsvpCount + 1 : ev.rsvpCount - 1;
        return { ...ev, isRsvped, rsvpCount };
      }
      return ev;
    }));
  };

  const addEvent = (newEventData) => {
    const createdEvent = {
      id: Date.now(),
      rsvpCount: 1,
      isRsvped: true,
      status: 'Upcoming',
      image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
      ...newEventData
    };
    setEvents(prev => [createdEvent, ...prev]);
    // Award XP
    setUser(prev => ({ ...prev, xp: prev.xp + 100 }));
    // Add Notification
    setNotifications(prev => [{
      id: Date.now(),
      title: 'New Event Created',
      message: `Event "${createdEvent.title}" has been published.`,
      time: 'Just now',
      read: false,
      type: 'Event'
    }, ...prev]);
  };

  const addTask = (newTaskData) => {
    const createdTask = {
      id: 't-' + Date.now(),
      status: 'To Do',
      xp: 100,
      ...newTaskData
    };
    setTasks(prev => [createdTask, ...prev]);
  };

  const moveTask = (taskId, newStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        if (newStatus === 'Completed' && t.status !== 'Completed') {
          // Award XP on task completion
          setUser(u => ({ ...u, xp: u.xp + t.xp }));
          setNotifications(n => [{
            id: Date.now(),
            title: 'Task Completed!',
            message: `Completed "${t.title}" and earned +${t.xp} XP.`,
            time: 'Just now',
            read: false,
            type: 'Task'
          }, ...n]);
        }
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  const upvoteSuggestion = (suggestionId) => {
    setSuggestions(prev => prev.map(s => {
      if (s.id === suggestionId) {
        const votedByMe = !s.votedByMe;
        const votes = votedByMe ? s.votes + 1 : s.votes - 1;
        return { ...s, votedByMe, votes };
      }
      return s;
    }));
  };

  const addSuggestion = (newSuggestion) => {
    const item = {
      id: 's-' + Date.now(),
      author: user.name,
      votes: 1,
      votedByMe: true,
      status: 'Under Review',
      adminComment: 'Received! Under evaluation.',
      date: 'Just now',
      ...newSuggestion
    };
    setSuggestions(prev => [item, ...prev]);
  };

  // Club Admission Workflow
  const applyForClub = (admissionData) => {
    const newAdm = {
      id: 'adm-' + Date.now(),
      applicant: admissionData.applicant || user.name,
      applicantEmail: admissionData.applicantEmail || user.email,
      applicantAvatar: admissionData.applicantAvatar || user.avatar,
      applicantStudentId: admissionData.applicantStudentId || user.studentId,
      applicantMajor: admissionData.applicantMajor || user.major,
      appliedDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      feedbackNotes: 'Application submitted and awaiting leader review.',
      skills: admissionData.skills || user.skills.slice(0, 4).join(', '),
      ...admissionData
    };

    setAdmissions(prev => [newAdm, ...prev]);

    // Award student XP for being engaged
    setUser(prev => ({ ...prev, xp: prev.xp + 50 }));

    // Notification
    setNotifications(prev => [{
      id: Date.now(),
      title: 'Application Submitted',
      message: `Your application to join ${newAdm.club} as ${newAdm.appliedRole} has been queued for review. (+50 XP)`,
      time: 'Just now',
      read: false,
      type: 'Admission'
    }, ...prev]);

    return newAdm;
  };

  const withdrawApplication = (admissionId) => {
    const adm = admissions.find(a => a.id === admissionId);
    setAdmissions(prev => prev.filter(a => a.id !== admissionId));
    if (adm) {
      setNotifications(prev => [{
        id: Date.now(),
        title: 'Application Withdrawn',
        message: `Your application to ${adm.club} was successfully cancelled.`,
        time: 'Just now',
        read: false,
        type: 'Admission'
      }, ...prev]);
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
            newStatus === 'Approved' ? 'Application officially accepted! Welcome to the club.' :
            newStatus === 'Rejected' ? 'Application not selected for this cohort.' :
            newStatus === 'Interview Scheduled' ? 'Interview scheduled. Please check your school email for details.' :
            a.feedbackNotes
          )
        };
      }
      return a;
    }));

    // If Approved/Accepted, sync membership with club rosters and user profile!
    if (newStatus === 'Approved') {
      const targetClub = clubs.find(c => c.name.toLowerCase() === targetAdm.club.toLowerCase());
      
      // 1. Add to Club Members Roster if not already there
      setClubs(prevClubs => prevClubs.map(c => {
        if (c.name.toLowerCase() === targetAdm.club.toLowerCase()) {
          const alreadyMember = c.members.some(m => m.name.toLowerCase() === targetAdm.applicant.toLowerCase());
          if (!alreadyMember) {
            const newMember = {
              id: 'm-' + Date.now(),
              name: targetAdm.applicant,
              email: targetAdm.applicantEmail || `${targetAdm.applicant.toLowerCase().replace(/\s+/g, '.')}@school.edu`,
              role: targetAdm.appliedRole || 'Member',
              avatar: targetAdm.applicantAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
              major: targetAdm.applicantMajor || 'Undergraduate',
              studentId: targetAdm.applicantStudentId || 'ST-' + Math.floor(1000 + Math.random() * 9000),
              joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
              skills: targetAdm.skills ? targetAdm.skills.split(',').map(s => s.trim()) : ['Teamwork']
            };
            return {
              ...c,
              membersCount: c.membersCount + 1,
              members: [newMember, ...c.members]
            };
          }
        }
        return c;
      }));

      // 2. If applicant is the current user, add club to user.joinedClubs!
      if (targetAdm.applicant.toLowerCase() === user.name.toLowerCase()) {
        const clubInfo = targetClub || { id: 'c-' + Date.now(), icon: '🌟', membersCount: 20 };
        const alreadyJoined = user.joinedClubs.some(jc => jc.name.toLowerCase() === targetAdm.club.toLowerCase());
        
        if (!alreadyJoined) {
          setUser(prevUser => ({
            ...prevUser,
            xp: prevUser.xp + 150, // Reward XP for being accepted
            joinedClubs: [
              ...prevUser.joinedClubs,
              {
                id: clubInfo.id || 'c-' + Date.now(),
                name: targetAdm.club,
                role: targetAdm.appliedRole || 'Active Member',
                badge: 'Member',
                membersCount: (clubInfo.membersCount || 50) + 1,
                icon: clubInfo.icon || '🎯'
              }
            ]
          }));
        }
      }

      setNotifications(prev => [{
        id: Date.now(),
        title: '🎉 Admission Approved!',
        message: `${targetAdm.applicant} was accepted into ${targetAdm.club} as ${targetAdm.appliedRole}.`,
        time: 'Just now',
        read: false,
        type: 'Admission'
      }, ...prev]);
    } else if (newStatus === 'Rejected') {
      setNotifications(prev => [{
        id: Date.now(),
        title: 'Admission Status Update',
        message: `Application for ${targetAdm.applicant} (${targetAdm.club}) marked as Rejected.`,
        time: 'Just now',
        read: false,
        type: 'Admission'
      }, ...prev]);
    } else if (newStatus === 'Interview Scheduled') {
      setNotifications(prev => [{
        id: Date.now(),
        title: 'Interview Scheduled',
        message: `Interview arranged for ${targetAdm.applicant} with ${targetAdm.club}.`,
        time: 'Just now',
        read: false,
        type: 'Admission'
      }, ...prev]);
    }
  };

  const markAttendance = (studentName, eventTitle, status) => {
    const newRecord = {
      id: 'att-' + Date.now(),
      studentName,
      studentId: 'ST-' + Math.floor(1000 + Math.random() * 9000),
      eventTitle,
      checkInTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status
    };
    setAttendance(prev => [newRecord, ...prev]);
  };

  const addResource = (res) => {
    setResources(prev => [{ id: 'res-' + Date.now(), downloads: 0, date: new Date().toISOString().split('T')[0], ...res }, ...prev]);
  };

  const addPhoto = (photo) => {
    setGallery(prev => [{ id: 'ph-' + Date.now(), likes: 0, likedByMe: false, uploader: user.name, date: 'Just now', ...photo }, ...prev]);
  };

  const likePhoto = (id) => {
    setGallery(prev => prev.map(p => {
      if (p.id === id) {
        const likedByMe = !p.likedByMe;
        const likes = likedByMe ? p.likes + 1 : p.likes - 1;
        return { ...p, likedByMe, likes };
      }
      return p;
    }));
  };

  const claimReward = (rewardId) => {
    const targetReward = gamification.rewards.find(r => r.id === rewardId);
    if (!targetReward || targetReward.claimed || user.xp < targetReward.cost) return;
    
    setUser(prev => ({ ...prev, xp: prev.xp - targetReward.cost }));
    setGamification(prev => ({
      ...prev,
      rewards: prev.rewards.map(r => r.id === rewardId ? { ...r, claimed: true } : r)
    }));
  };

  const markNotificationRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      updateUserProfile,
      clubs,
      setClubs,
      leaveClub,
      events,
      tasks,
      gamification,
      suggestions,
      admissions,
      attendance,
      resources,
      gallery,
      notifications,
      addSkill,
      removeSkill,
      toggleRsvp,
      addEvent,
      addTask,
      moveTask,
      upvoteSuggestion,
      addSuggestion,
      applyForClub,
      withdrawApplication,
      reviewAdmission,
      markAttendance,
      addResource,
      addPhoto,
      likePhoto,
      claimReward,
      markNotificationRead,
      clearNotifications
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  return useContext(AppContext);
}
