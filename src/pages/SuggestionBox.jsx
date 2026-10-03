import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Lightbulb, ThumbsUp, MessageSquare, Plus, CheckCircle, Clock, X, AlertCircle } from 'lucide-react';
import './SuggestionBox.css';

export default function SuggestionBox() {
  const { suggestions, upvoteSuggestion, addSuggestion } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Events');
  const [details, setDetails] = useState('');

  const categories = ['All', 'Events', 'Campus', 'Club Tech', 'General'];

  const filteredSuggestions = selectedCategory === 'All'
    ? suggestions
    : suggestions.filter(s => s.category === selectedCategory);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addSuggestion({
      title,
      category,
      details
    });

    setShowModal(false);
    setTitle('');
    setDetails('');
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Implemented': return <span className="status-pill status-implemented"><CheckCircle size={12}/> Implemented</span>;
      case 'Planned': return <span className="status-pill status-planned"><Clock size={12}/> Planned</span>;
      default: return <span className="status-pill status-review"><AlertCircle size={12}/> Under Review</span>;
    }
  };

  return (
    <div className="suggestion-box-page">
      <div className="suggestion-header glass-panel">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <Lightbulb className="text-warning" size={24}/> Student Idea & Suggestion Box
          </h2>
          <p className="text-sm text-secondary mt-1">Submit proposal ideas, upvote peer feedback, and shape school club initiatives.</p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18}/> Propose Idea
        </button>
      </div>

      {/* Category Filter */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-2">
        <div className="filter-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-tab ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="text-sm text-muted">{filteredSuggestions.length} Proposals Submitted</span>
      </div>

      {/* Suggestions List */}
      <div className="suggestions-grid">
        {filteredSuggestions.map(item => (
          <div key={item.id} className="suggestion-card glass-panel">
            <div className="vote-column">
              <button 
                className={`vote-btn ${item.votedByMe ? 'voted' : ''}`}
                onClick={() => upvoteSuggestion(item.id)}
              >
                <ThumbsUp size={18}/>
                <span className="vote-count">{item.votes}</span>
              </button>
            </div>

            <div className="suggestion-content">
              <div className="flex justify-between items-start mb-2">
                <span className="suggestion-category">{item.category}</span>
                {getStatusBadge(item.status)}
              </div>

              <h3 className="suggestion-title">{item.title}</h3>
              {item.details && <p className="suggestion-details-text">{item.details}</p>}

              <div className="admin-response-box">
                <span className="admin-response-label">Official Response:</span>
                <p className="admin-response-text">{item.adminComment}</p>
              </div>

              <div className="suggestion-footer">
                <span className="author-tag">Proposed by {item.author}</span>
                <span className="date-tag">{item.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Propose Idea Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Submit New Suggestion</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><X size={18}/></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Suggestion Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Provide free coffee during 24h Hackathons"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select value={category} onChange={e => setCategory(e.target.value)}>
                  <option>Events</option>
                  <option>Campus</option>
                  <option>Club Tech</option>
                  <option>General</option>
                </select>
              </div>

              <div className="form-group">
                <label>Details / Justification</label>
                <textarea 
                  rows={3}
                  placeholder="Explain why this suggestion will benefit students..."
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit Proposal</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
