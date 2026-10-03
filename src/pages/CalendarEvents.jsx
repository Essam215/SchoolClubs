import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Clock, 
  Users, 
  Plus, 
  Check, 
  Filter, 
  X,
  Calendar as CalendarIcon
} from 'lucide-react';
import './CalendarEvents.css';

export default function CalendarEvents() {
  const { events, toggleRsvp, addEvent } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [club, setClub] = useState('Robotics & Tech Club');
  const [date, setDate] = useState('2026-10-25');
  const [time, setTime] = useState('15:00 - 17:00');
  const [location, setLocation] = useState('Auditorium A');
  const [category, setCategory] = useState('Workshop');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(80);

  const categories = ['All', 'Workshop', 'Competition', 'Social', 'Meeting'];

  const filteredEvents = selectedCategory === 'All' 
    ? events 
    : events.filter(e => e.category === selectedCategory);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    addEvent({
      title,
      club,
      date,
      time,
      location,
      category,
      description,
      capacity: Number(capacity)
    });

    setShowCreateModal(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="calendar-events">
      {/* Calendar Bar */}
      <div className="calendar-header glass-panel">
        <div className="month-selector">
          <button className="icon-btn"><ChevronLeft size={20} /></button>
          <h2 className="current-month">October 2026</h2>
          <button className="icon-btn"><ChevronRight size={20} /></button>
        </div>
        <div className="calendar-actions">
          <div className="category-filters">
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} /> Create Event
          </button>
        </div>
      </div>

      <div className="content-grid">
        {/* Calendar Grid View */}
        <div className="calendar-view glass-panel">
          <div className="weekdays">
            <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
          </div>
          <div className="days-grid">
            {Array.from({ length: 31 }).map((_, i) => {
              const dayNum = i + 1;
              const hasEvents = events.some(e => Number(e.date.split('-')[2]) === dayNum);
              const isToday = dayNum === 3;
              return (
                <div key={i} className={`day-cell ${isToday ? 'today' : ''} ${hasEvents ? 'has-event' : ''}`}>
                  <span className="day-number">{dayNum}</span>
                  {hasEvents && <div className="event-dot"></div>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Upcoming Events List Panel */}
        <div className="upcoming-events glass-panel">
          <div className="flex justify-between items-center mb-4">
            <h3 className="panel-title flex items-center gap-2">
              <CalendarIcon size={18} className="text-accent" /> Active Events ({filteredEvents.length})
            </h3>
          </div>

          <div className="events-list">
            {filteredEvents.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-image-header" style={{ backgroundImage: `url(${event.image})` }}>
                  <span className={`category-tag ${event.category.toLowerCase()}`}>{event.category}</span>
                </div>
                
                <div className="event-body">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="event-title">{event.title}</h4>
                    <span className="club-tag-sm">{event.club}</span>
                  </div>

                  <p className="event-desc">{event.description}</p>

                  <div className="event-meta-grid">
                    <span className="meta-item"><Clock size={13}/> {event.date} | {event.time}</span>
                    <span className="meta-item"><MapPin size={13}/> {event.location}</span>
                    <span className="meta-item"><Users size={13}/> {event.rsvpCount} / {event.capacity} Attending</span>
                  </div>

                  <div className="event-footer">
                    <div className="rsvp-progress-bar">
                      <div 
                        className="rsvp-fill" 
                        style={{ width: `${Math.min(100, (event.rsvpCount / event.capacity) * 100)}%` }}
                      ></div>
                    </div>
                    
                    <button 
                      className={`btn ${event.isRsvped ? 'btn-outline rsvped' : 'btn-primary'} btn-sm`}
                      onClick={() => toggleRsvp(event.id)}
                    >
                      {event.isRsvped ? (
                        <> <Check size={14} /> Attending </>
                      ) : (
                        'RSVP Now'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Club Event</h3>
              <button className="icon-btn" onClick={() => setShowCreateModal(false)}><X size={18}/></button>
            </div>

            <form onSubmit={handleFormSubmit} className="modal-form">
              <div className="form-group">
                <label>Event Title</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. AI Prompt Engineering Hackathon"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Host Club</label>
                  <select value={club} onChange={e => setClub(e.target.value)}>
                    <option>Robotics & Tech Club</option>
                    <option>AI Research Group</option>
                    <option>Debate Society</option>
                    <option>Design Guild</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option>Workshop</option>
                    <option>Competition</option>
                    <option>Social</option>
                    <option>Meeting</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input type="text" placeholder="14:00 - 16:00" value={time} onChange={e => setTime(e.target.value)} required />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Location / Room</label>
                  <input type="text" placeholder="e.g. Lab 301" value={location} onChange={e => setLocation(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Max Capacity</label>
                  <input type="number" value={capacity} onChange={e => setCapacity(e.target.value)} required />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  rows={3}
                  placeholder="Event objective, prerequisites, and gear needed..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Event (+100 XP)</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
