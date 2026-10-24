import React from 'react';
import { DoorOpen, CalendarDays, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './RoomScheduling.css';

export default function RoomScheduling() {
  const { events } = useApp();
  const locations = [...new Set(events.map(event => event.location).filter(Boolean))];

  return (
    <div className="room-scheduling">
      <div className="scheduling-header glass-panel"><div><h2 className="panel-title" style={{ borderBottom: 'none', marginBottom: 0 }}>Room Scheduling & Allocation</h2><p className="text-muted" style={{ fontSize: '0.875rem' }}>Locations are shown from events saved in your workspace.</p></div></div>
      {locations.length === 0 ? <div className="glass-panel" style={{ padding: 24 }}><DoorOpen size={24} className="text-accent"/><p className="text-muted">No locations yet. Add an event with a location to see it here.</p></div> :
        <div className="rooms-grid">{locations.map(location => {
          const locationEvents = events.filter(event => event.location === location);
          return <article key={location} className="room-card glass-panel"><div className="room-card-header"><DoorOpen size={24} className="text-accent"/><span className="status-badge">In use</span></div><h3 className="room-name">{location}</h3><div className="room-details"><span className="detail-item"><CalendarDays size={14}/>{locationEvents.length} event{locationEvents.length === 1 ? '' : 's'}</span><span className="detail-item"><MapPin size={14}/>{location}</span></div></article>;
        })}</div>}
    </div>
  );
}
