import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { GitCommit, Calendar, MapPin, CheckCircle, Flag } from 'lucide-react';
import './EventTimeline.css';

export default function EventTimeline() {
  const { events } = useApp();
  const [filter, setFilter] = useState('All');
  const categories = useMemo(() => ['All', ...new Set(events.map(event => event.category).filter(Boolean))], [events]);
  const filteredItems = events.filter(event => filter === 'All' || event.category === filter)
    .slice().sort((a, b) => String(a.event_date ?? a.date ?? '').localeCompare(String(b.event_date ?? b.date ?? '')));

  return (
    <div className="event-timeline-page">
      <div className="timeline-header glass-panel">
        <div><h2 className="flex items-center gap-2 text-xl font-bold"><GitCommit className="text-accent" size={24}/> Event Timeline</h2><p className="text-sm text-secondary mt-1">A chronological view of events saved in your workspace.</p></div>
        <div className="timeline-filter-buttons">{categories.map(category => <button key={category} className={`filter-btn ${filter === category ? 'active' : ''}`} onClick={() => setFilter(category)}>{category}</button>)}</div>
      </div>
      <div className="timeline-container glass-panel">
        {filteredItems.length === 0 ? <p className="text-muted">No events yet. Add an event to see it here.</p> : <>
          <div className="timeline-vertical-line" />
          <div className="timeline-nodes-list">
            {filteredItems.map(event => {
              const status = String(event.status ?? 'Upcoming');
              const complete = status.toLowerCase() === 'completed';
              const date = event.event_date ?? event.date;
              return <div key={event.id} className={`timeline-node ${status.toLowerCase()}`}>
                <div className="node-marker">{complete ? <CheckCircle size={18} className="text-success" /> : <Flag size={18} className="text-accent" />}</div>
                <div className="node-content card">
                  <div className="flex justify-between items-center mb-2"><span className="node-date flex items-center gap-1"><Calendar size={13}/>{date || 'Date not set'}</span><span className={`node-tag tag-${String(event.category || 'event').toLowerCase()}`}>{event.category || 'Event'}</span></div>
                  <h3 className="node-title">{event.title}</h3><span className="node-club text-accent">{event.club || ''}</span><p className="node-desc">{event.description || ''}</p>
                  <div className="node-footer"><span className="node-location"><MapPin size={12}/>{event.location || 'Location not set'}</span><span className={`status-badge ${status.toLowerCase()}`}>{status}</span></div>
                </div>
              </div>;
            })}
          </div>
        </>}
      </div>
    </div>
  );
}
