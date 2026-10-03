import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { GitCommit, Calendar, Clock, MapPin, CheckCircle, Sparkles, Flag } from 'lucide-react';
import './EventTimeline.css';

export default function EventTimeline() {
  const { events } = useApp();
  const [filter, setFilter] = useState('All');

  const timelineItems = [
    {
      id: 't-1',
      date: 'Sept 15, 2026',
      title: 'Fall Semester Clubs Expo & Orientation',
      club: 'School Governance',
      location: 'Campus Quadrangle',
      status: 'Completed',
      desc: 'Annual showcase of over 40 active student clubs with 1,200+ student attendees.',
      tag: 'Milestone'
    },
    {
      id: 't-2',
      date: 'Sept 28, 2026',
      title: 'UI/UX Design Systems Workshop',
      club: 'Design Guild',
      location: 'Design Studio 402',
      status: 'Completed',
      desc: 'Figma tokenization and modern UI design sprint.',
      tag: 'Workshop'
    },
    {
      id: 't-3',
      date: 'Oct 15, 2026',
      title: 'Annual Robotics Hackathon 2026',
      club: 'Robotics & Tech Club',
      location: 'Main Engineering Lab',
      status: 'Upcoming',
      desc: 'Flagship 8-hour hardware challenge for autonomous mini-rovers.',
      tag: 'Flagship'
    },
    {
      id: 't-4',
      date: 'Oct 18, 2026',
      title: 'AI & Neural Networks Intro',
      club: 'AI Research Group',
      location: 'Auditorium B',
      status: 'Upcoming',
      desc: 'Deep dive into PyTorch models and neural network fine-tuning.',
      tag: 'Workshop'
    },
    {
      id: 't-5',
      date: 'Nov 05, 2026',
      title: 'Inter-School Debate Championship Finals',
      club: 'Debate Society',
      location: 'Grand Hall',
      status: 'Upcoming',
      desc: 'National qualifiers debate competition.',
      tag: 'Competition'
    }
  ];

  const filteredItems = filter === 'All' ? timelineItems : timelineItems.filter(i => i.tag === filter);

  return (
    <div className="event-timeline-page">
      <div className="timeline-header glass-panel">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <GitCommit className="text-accent" size={24}/> Semester Event Timeline Roadmap
          </h2>
          <p className="text-sm text-secondary mt-1">Chronological overview of key school club milestones, hackathons, and competitions.</p>
        </div>

        <div className="timeline-filter-buttons">
          {['All', 'Milestone', 'Flagship', 'Workshop', 'Competition'].map(tag => (
            <button 
              key={tag} 
              className={`filter-btn ${filter === tag ? 'active' : ''}`}
              onClick={() => setFilter(tag)}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      <div className="timeline-container glass-panel">
        <div className="timeline-vertical-line"></div>

        <div className="timeline-nodes-list">
          {filteredItems.map((item, index) => (
            <div key={item.id} className={`timeline-node ${item.status.toLowerCase()}`}>
              <div className="node-marker">
                {item.status === 'Completed' ? (
                  <CheckCircle size={18} className="text-success" />
                ) : (
                  <Flag size={18} className="text-accent" />
                )}
              </div>

              <div className="node-content card">
                <div className="flex justify-between items-center mb-2">
                  <span className="node-date flex items-center gap-1">
                    <Calendar size={13}/> {item.date}
                  </span>
                  <span className={`node-tag tag-${item.tag.toLowerCase()}`}>{item.tag}</span>
                </div>

                <h3 className="node-title">{item.title}</h3>
                <span className="node-club text-accent">{item.club}</span>
                <p className="node-desc">{item.desc}</p>

                <div className="node-footer">
                  <span className="node-location"><MapPin size={12}/> {item.location}</span>
                  <span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
