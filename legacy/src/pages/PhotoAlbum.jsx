import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Image as ImageIcon, Heart, Plus, Eye, X, User, Calendar } from 'lucide-react';
import './PhotoAlbum.css';

export default function PhotoAlbum() {
  const { gallery, clubs, addPhoto, likePhoto } = useApp();
  const [selectedClubFilter, setSelectedClubFilter] = useState('All');
  const [activeLightbox, setActiveLightbox] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [eventName, setEventName] = useState('');
  const [club, setClub] = useState(clubs[0]?.name ?? '');
  const [image, setImage] = useState('');

  const clubFilters = ['All', ...new Set([...clubs.map(item => item.name), ...gallery.map(item => item.club)].filter(Boolean))];

  const filteredGallery = selectedClubFilter === 'All'
    ? gallery
    : gallery.filter(g => g.club === selectedClubFilter);

  const handleUploadPhoto = (e) => {
    e.preventDefault();
    if (!title.trim() || !image.trim()) return;

    addPhoto({
      title,
      eventName,
      club,
      image
    });

    setShowUploadModal(false);
    setTitle('');
  };

  return (
    <div className="photo-album-page">
      <div className="album-header glass-panel">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <ImageIcon className="text-accent" size={24}/> Event Photo Album & Gallery
          </h2>
          <p className="text-sm text-secondary mt-1">High-resolution memories from workshops, hackathons, and campus expos.</p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)} disabled={clubs.length === 0}>
          <Plus size={18}/> Add Event Photo
        </button>
      </div>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        {clubFilters.map(filter => (
          <button
            key={filter}
            className={`filter-chip ${selectedClubFilter === filter ? 'active' : ''}`}
            onClick={() => setSelectedClubFilter(filter)}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="gallery-grid">
        {filteredGallery.map(photo => (
          <div key={photo.id} className="gallery-card glass-panel">
            <div 
              className="gallery-image-wrapper"
              onClick={() => setActiveLightbox(photo)}
            >
              <img src={photo.image} alt={photo.title} className="gallery-img" />
              <div className="gallery-overlay">
                <button className="icon-btn preview-btn"><Eye size={20}/></button>
              </div>
            </div>

            <div className="gallery-card-body">
              <div className="flex justify-between items-start mb-1">
                <h3 className="photo-title">{photo.title}</h3>
                <button 
                  className={`like-btn ${photo.likedByMe ? 'liked' : ''}`}
                  onClick={() => likePhoto(photo.id)}
                >
                  <Heart size={16} fill={photo.likedByMe ? 'var(--primary-accent)' : 'none'} />
                  <span>{photo.likes}</span>
                </button>
              </div>

              <span className="photo-event text-accent text-xs font-semibold">{photo.eventName}</span>

              <div className="photo-meta text-xs text-muted flex justify-between mt-3">
                <span><User size={12}/> {photo.uploader}</span>
                <span><Calendar size={12}/> {photo.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeLightbox && (
        <div className="modal-overlay" onClick={() => setActiveLightbox(null)}>
          <div className="lightbox-card glass-panel" onClick={e => e.stopPropagation()}>
            <button className="lightbox-close icon-btn" onClick={() => setActiveLightbox(null)}>
              <X size={20}/>
            </button>

            <img src={activeLightbox.image} alt={activeLightbox.title} className="lightbox-img" />

            <div className="lightbox-details">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold">{activeLightbox.title}</h2>
                <button 
                  className={`like-btn ${activeLightbox.likedByMe ? 'liked' : ''}`}
                  onClick={() => likePhoto(activeLightbox.id)}
                >
                  <Heart size={18} fill={activeLightbox.likedByMe ? 'var(--primary-accent)' : 'none'} />
                  <span>{activeLightbox.likes} Likes</span>
                </button>
              </div>

              <span className="text-sm text-accent font-semibold">{activeLightbox.eventName} • {activeLightbox.club}</span>
              <p className="text-xs text-muted mt-2">Uploaded by {activeLightbox.uploader} on {activeLightbox.date}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Photo Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add Photo to Gallery</h3>
              <button className="icon-btn" onClick={() => setShowUploadModal(false)}><X size={18}/></button>
            </div>

            <form onSubmit={handleUploadPhoto} className="modal-form">
              <div className="form-group">
                <label>Photo Caption / Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Quadcopter Flight Test Success"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Event Name</label>
                  <input type="text" value={eventName} onChange={e => setEventName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Club Name</label>
                  <select value={club} onChange={e => setClub(e.target.value)} required>
                    {clubs.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Image URL</label>
                <input 
                  type="url" 
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={image}
                  onChange={e => setImage(e.target.value)}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Photo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
