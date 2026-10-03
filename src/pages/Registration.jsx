import React from 'react';
import { Upload, CheckCircle } from 'lucide-react';
import './Registration.css';

export default function Registration() {
  return (
    <div className="registration-page">
      <div className="registration-container glass-panel">
        <div className="form-header">
          <h2 className="panel-title" style={{ borderBottom: 'none', marginBottom: '0.5rem', fontSize: '1.5rem' }}>
            New Club Registration
          </h2>
          <p className="text-muted">Submit an application to form a new student club</p>
        </div>
        
        <form className="registration-form" onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label>Club Name <span className="text-danger">*</span></label>
            <input type="text" placeholder="e.g. Quantum Computing Society" className="form-input" required />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select className="form-input">
              <option>Academic</option>
              <option>Arts & Culture</option>
              <option>Sports & Recreation</option>
              <option>Technology</option>
              <option>Other</option>
            </select>
          </div>
          
          <div className="form-group full-width">
            <label>Club Description <span className="text-danger">*</span></label>
            <textarea placeholder="Describe the mission and activities of your club..." className="form-input" rows="4" required></textarea>
          </div>
          
          <div className="form-group">
            <label>Faculty Advisor</label>
            <input type="text" placeholder="Dr. Jane Smith" className="form-input" />
          </div>
          
          <div className="form-group">
            <label>Meeting Frequency</label>
            <select className="form-input">
              <option>Weekly</option>
              <option>Bi-weekly</option>
              <option>Monthly</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Upload Member Signatures (PDF)</label>
            <div className="file-upload-area">
              <Upload className="text-muted mb-2" size={32} />
              <p className="text-secondary">Drag and drop file here or click to browse</p>
              <button type="button" className="btn btn-outline mt-2">Select File</button>
            </div>
          </div>
          
          <div className="form-actions full-width">
            <button type="submit" className="btn btn-primary"><CheckCircle size={16} /> Submit Application</button>
            <button type="button" className="btn btn-outline">Save Draft</button>
          </div>
        </form>
      </div>
    </div>
  );
}
