import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './Registration.css';

export default function Registration() {
  const { addClub } = useApp();
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Academic');
  const [description, setDescription] = useState('');
  const [advisor, setAdvisor] = useState('');
  const [meetingSchedule, setMeetingSchedule] = useState('Weekly');
  const [saved, setSaved] = useState(false);

  const submit = (event) => {
    event.preventDefault();
    if (!name.trim() || !description.trim()) return;
    addClub({ name: name.trim(), category, description: description.trim(), advisor, meetingSchedule, room: '', banner: '' });
    setSaved(true);
    setName('');
    setDescription('');
    setAdvisor('');
  };

  return (
    <div className="registration-page">
      <div className="registration-container glass-panel">
        <div className="form-header"><h2 className="panel-title" style={{ borderBottom: 'none', marginBottom: '0.5rem', fontSize: '1.5rem' }}>Create a Club</h2><p className="text-muted">Create a club in your Supabase workspace. You will be its first president.</p></div>
        <form className="registration-form" onSubmit={submit}>
          <div className="form-group"><label>Club Name <span className="text-danger">*</span></label><input type="text" value={name} onChange={event => setName(event.target.value)} placeholder="Club name" className="form-input" required /></div>
          <div className="form-group"><label>Category</label><select className="form-input" value={category} onChange={event => setCategory(event.target.value)}><option>Academic</option><option>Arts & Culture</option><option>Sports & Recreation</option><option>Technology</option><option>Other</option></select></div>
          <div className="form-group full-width"><label>Club Description <span className="text-danger">*</span></label><textarea value={description} onChange={event => setDescription(event.target.value)} placeholder="Describe the club's mission and activities" className="form-input" rows="4" required /></div>
          <div className="form-group"><label>Faculty Advisor</label><input type="text" value={advisor} onChange={event => setAdvisor(event.target.value)} placeholder="Optional" className="form-input" /></div>
          <div className="form-group"><label>Meeting Frequency</label><select className="form-input" value={meetingSchedule} onChange={event => setMeetingSchedule(event.target.value)}><option>Weekly</option><option>Bi-weekly</option><option>Monthly</option></select></div>
          {saved && <p className="text-success" role="status">Club saved to Supabase.</p>}
          <div className="form-actions full-width"><button type="submit" className="btn btn-primary"><CheckCircle size={16} /> Create Club</button></div>
        </form>
      </div>
    </div>
  );
}
