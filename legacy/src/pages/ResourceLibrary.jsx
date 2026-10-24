import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FolderGit2, Download, Search, Plus, FileText, Image, FileSpreadsheet, Archive, X } from 'lucide-react';
import './ResourceLibrary.css';

export default function ResourceLibrary() {
  const { resources, clubs, addResource } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [club, setClub] = useState(clubs[0]?.name ?? '');
  const [category, setCategory] = useState('Templates');
  const [fileType, setFileType] = useState('PDF');
  const [size, setSize] = useState('');

  const categories = ['All', 'Templates', 'Guidelines', 'Graphics & Media', 'Financial Forms'];

  const filteredResources = resources.filter(res => {
    const matchesCategory = selectedCategory === 'All' || res.category === selectedCategory;
    const matchesSearch = res.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          res.club.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getFileIcon = (type) => {
    switch (type) {
      case 'PDF': return <FileText className="text-danger" size={24} />;
      case 'ZIP': return <Archive className="text-warning" size={24} />;
      case 'XLSX': return <FileSpreadsheet className="text-success" size={24} />;
      default: return <Image className="text-accent" size={24} />;
    }
  };

  const handleUploadSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    addResource({
      title,
      club,
      category,
      fileType,
      size
    });

    setShowUploadModal(false);
    setTitle('');
  };

  return (
    <div className="resource-library-page">
      <div className="resource-header glass-panel">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <FolderGit2 className="text-accent" size={24}/> School Clubs Shared Resource Repository
          </h2>
          <p className="text-sm text-secondary mt-1">Official club handbooks, presentation templates, logos, and financial grant forms.</p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowUploadModal(true)} disabled={clubs.length === 0}>
          <Plus size={18}/> Upload Resource
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex justify-between items-center flex-wrap gap-4">
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

        <div className="search-bar search-resource">
          <Search size={16} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search documents or templates..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Resources Cards Grid */}
      <div className="resources-grid">
        {filteredResources.map(res => (
          <div key={res.id} className="resource-card glass-panel">
            <div className="flex items-start gap-3">
              <div className="file-icon-box">
                {getFileIcon(res.fileType)}
              </div>

              <div className="resource-info flex-1">
                <div className="flex justify-between items-start">
                  <span className="res-cat-tag">{res.category}</span>
                  <span className="res-size">{res.size}</span>
                </div>

                <h3 className="res-title">{res.title}</h3>
                <span className="res-club-tag">{res.club}</span>
              </div>
            </div>

            <div className="res-footer mt-4">
              <span className="res-meta text-xs text-muted">{res.downloads} Downloads • {res.date}</span>
              <button 
                className="btn btn-outline btn-sm"
                onClick={() => alert(`Downloading "${res.title}"...`)}
              >
                <Download size={14}/> Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => setShowUploadModal(false)}>
          <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Document to Library</h3>
              <button className="icon-btn" onClick={() => setShowUploadModal(false)}><X size={18}/></button>
            </div>

            <form onSubmit={handleUploadSubmit} className="modal-form">
              <div className="form-group">
                <label>Document Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Robotics Sponsorship Proposal 2026"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Club / Publisher</label>
                  <select value={club} onChange={e => setClub(e.target.value)} required>
                    {clubs.map(item => <option key={item.id} value={item.name}>{item.name}</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label>Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}>
                    <option>Templates</option>
                    <option>Guidelines</option>
                    <option>Graphics & Media</option>
                    <option>Financial Forms</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>File Format</label>
                  <select value={fileType} onChange={e => setFileType(e.target.value)}>
                    <option>PDF</option>
                    <option>ZIP</option>
                    <option>XLSX</option>
                    <option>PNG/SVG</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>File Size</label>
                  <input type="text" value={size} onChange={e => setSize(e.target.value)} required />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowUploadModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Upload File</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
