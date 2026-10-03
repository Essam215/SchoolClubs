import React from 'react';
import { DoorOpen, Users, Clock, CalendarCheck } from 'lucide-react';
import './RoomScheduling.css';

export default function RoomScheduling() {
  const rooms = [
    { id: 1, name: 'Main Auditorium', capacity: 300, status: 'Available', type: 'Hall' },
    { id: 2, name: 'Lab 3', capacity: 30, status: 'Occupied', type: 'Laboratory' },
    { id: 3, name: 'Room 102', capacity: 40, status: 'Available', type: 'Classroom' },
    { id: 4, name: 'Conference Room B', capacity: 15, status: 'Maintenance', type: 'Meeting' },
  ];

  return (
    <div className="room-scheduling">
      <div className="scheduling-header glass-panel">
        <div>
          <h2 className="panel-title" style={{ borderBottom: 'none', marginBottom: 0 }}>Room Scheduling & Allocation</h2>
          <p className="text-muted" style={{ fontSize: '0.875rem' }}>Manage and book spaces for club activities</p>
        </div>
        <button className="btn btn-primary"><CalendarCheck size={16} /> Book a Room</button>
      </div>

      <div className="rooms-grid">
        {rooms.map(room => (
          <div key={room.id} className="room-card glass-panel">
            <div className="room-card-header">
              <DoorOpen size={24} className="text-accent" />
              <span className={`status-badge ${room.status.toLowerCase()}`}>{room.status}</span>
            </div>
            <h3 className="room-name">{room.name}</h3>
            <div className="room-details">
              <span className="detail-item"><Users size={14} /> {room.capacity} Seats</span>
              <span className="detail-item"><Clock size={14} /> {room.type}</span>
            </div>
            <button className="btn btn-outline reserve-btn" disabled={room.status !== 'Available'}>
              {room.status === 'Available' ? 'Reserve Now' : 'Unavailable'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
