import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, ExternalLink, FileText, Link2, Pencil, Plus, Trash2, Video } from 'lucide-react';
import { api } from '../api';
import { ClubChip, Empty, Loading, Modal, useApp } from '../ui';

const TYPES = [
  ['article', 'Article'],
  ['video', 'Video'],
  ['document', 'Document'],
  ['website', 'Website'],
];
const TYPE_ICONS = { article: BookOpen, video: Video, document: FileText, website: Link2 };

export default function ResourceLibrary() {
  const { clubs, manageable, canManage, toast } = useApp();
  const [resources, setResources] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [clubId, setClubId] = useState('');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [form, setForm] = useState(null);
  const canCreate = manageable.length > 0 || canManage(null);

  const load = useCallback(() => {
    const query = clubId ? `?club_id=${encodeURIComponent(clubId)}` : '';
    setLoadError('');
    api.get(`/resources${query}`).then(setResources).catch((error) => {
      setResources([]);
      setLoadError(error.message);
    });
  }, [clubId]);
  useEffect(() => { load(); }, [load]);

  const categories = useMemo(() => [...new Set((resources || []).map((resource) => resource.category))].sort(), [resources]);
  const shown = (resources || []).filter((resource) => {
    const text = `${resource.title} ${resource.description || ''} ${resource.category}`.toLowerCase();
    return (!search || text.includes(search.toLowerCase())) && (!type || resource.resource_type === type);
  });

  const remove = async (resource) => {
    if (!window.confirm(`Remove "${resource.title}" from the resource library?`)) return;
    try {
      await api.del(`/resources/${resource.id}`);
      toast('Resource removed');
      load();
    } catch (error) { toast(error.message, 'error'); }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Resource library</h2>
          <p>Find useful guides, videos and references shared by the school clubs.</p>
        </div>
      </div>

      <div className="toolbar resource-toolbar">
        <input className="resource-search" type="search" placeholder="Search resources…" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search resources" />
        <select className="select" value={type} onChange={(event) => setType(event.target.value)} aria-label="Filter by resource type">
          <option value="">All types</option>
          {TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
        <select className="select" value={clubId} onChange={(event) => setClubId(event.target.value)} aria-label="Filter by club">
          <option value="">All clubs and school-wide</option>
          {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
        </select>
        <span className="spacer" />
        {canCreate && <button className="btn primary" onClick={() => setForm({ club_id: manageable[0]?.id || '' })}><Plus size={16} /> Add resource</button>}
      </div>

      {categories.length > 0 && (
        <div className="resource-categories" aria-label="Resource categories">
          <span>{shown.length} {shown.length === 1 ? 'resource' : 'resources'}</span>
          {categories.map((category) => <span className="pill" key={category}>{category}</span>)}
        </div>
      )}
      {loadError && <p className="page-error" role="alert">{loadError}</p>}
      {resources === null ? <Loading /> : shown.length === 0 ? (
        <Empty icon={BookOpen} title={loadError ? 'Resources could not be loaded' : 'No resources found'}
          text={loadError ? 'Check your connection and try again.' : 'Try a different search or add a resource for your club.'} />
      ) : (
        <div className="resource-grid">
          {shown.map((resource) => {
            const Icon = TYPE_ICONS[resource.resource_type] || Link2;
            const canEdit = canManage(resource.club_id);
            return (
              <article className="resource-card" key={resource.id}>
                <div className="resource-card-top">
                  <span className="resource-icon"><Icon size={20} /></span>
                  <span className="pill info">{TYPES.find(([value]) => value === resource.resource_type)?.[1] || resource.resource_type}</span>
                  <span className="spacer" />
                  {canEdit && <button className="link-btn" aria-label={`Edit ${resource.title}`} onClick={() => setForm(resource)}><Pencil size={15} /></button>}
                  {canEdit && <button className="link-btn" aria-label={`Delete ${resource.title}`} onClick={() => remove(resource)}><Trash2 size={15} /></button>}
                </div>
                <h3>{resource.title}</h3>
                {resource.description && <p>{resource.description}</p>}
                <div className="resource-meta">
                  <span className="pill">{resource.category}</span>
                  <ClubChip club={resource.clubs} />
                </div>
                <a className="btn sm resource-link" href={resource.url} target="_blank" rel="noopener noreferrer">
                  Open resource <ExternalLink size={14} />
                </a>
              </article>
            );
          })}
        </div>
      )}

      {form && <ResourceForm initial={form} onClose={() => setForm(null)} onSaved={() => { setForm(null); load(); }} />}
    </>
  );
}

function ResourceForm({ initial, onClose, onSaved }) {
  const { manageable, canManage, toast } = useApp();
  const editing = !!initial.id;
  const options = [...manageable];
  if (canManage(null)) options.unshift({ id: '', name: 'Whole school' });
  const [form, setForm] = useState({
    club_id: initial.club_id || '',
    title: initial.title || '',
    description: initial.description || '',
    category: initial.category || '',
    resource_type: initial.resource_type || 'article',
    url: initial.url || '',
  });
  const [busy, setBusy] = useState(false);
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    const payload = {
      ...form,
      club_id: form.club_id || null,
      description: form.description.trim() || null,
    };
    try {
      if (editing) await api.put(`/resources/${initial.id}`, payload);
      else await api.post('/resources', payload);
      toast(editing ? 'Resource updated' : 'Resource added');
      onSaved();
    } catch (error) {
      toast(error.message, 'error');
      setBusy(false);
    }
  };

  return (
    <Modal title={editing ? 'Edit resource' : 'Add resource'} onClose={onClose}>
      <form onSubmit={save}>
        <div className="field"><label htmlFor="resource-scope">Share with</label>
          <select id="resource-scope" value={form.club_id} onChange={set('club_id')}>
            {options.map((club) => <option key={club.id || 'school'} value={club.id}>{club.name}</option>)}
          </select>
        </div>
        <div className="field"><label htmlFor="resource-title">Title</label>
          <input id="resource-title" value={form.title} onChange={set('title')} maxLength={120} required />
        </div>
        <div className="field"><label htmlFor="resource-description">Description</label>
          <textarea id="resource-description" value={form.description} onChange={set('description')} />
        </div>
        <div className="row2">
          <div className="field"><label htmlFor="resource-category">Category</label>
            <input id="resource-category" value={form.category} onChange={set('category')} maxLength={60} required />
          </div>
          <div className="field"><label htmlFor="resource-type">Type</label>
            <select id="resource-type" value={form.resource_type} onChange={set('resource_type')}>
              {TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>
        <div className="field"><label htmlFor="resource-url">URL</label>
          <input id="resource-url" type="url" value={form.url} onChange={set('url')} placeholder="https://…" required />
        </div>
        <div className="modal-actions"><button type="button" className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add resource'}</button></div>
      </form>
    </Modal>
  );
}
