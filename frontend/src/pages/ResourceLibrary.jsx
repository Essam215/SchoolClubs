import { useCallback, useEffect, useMemo, useState } from 'react';
import { Boxes, MapPin, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { api } from '../api';
import { ClubChip, Empty, Loading, Modal, useApp } from '../ui';

export default function ResourceLibrary() {
  const { clubs, manageable, canManage, toast } = useApp();
  const [resources, setResources] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [clubId, setClubId] = useState('');
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
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
    const text = `${resource.title} ${resource.description || ''} ${resource.category} ${resource.storage_location || ''}`.toLowerCase();
    return (!search || text.includes(search.toLowerCase())) && (!category || resource.category === category);
  });
  const totalUnits = (resources || []).reduce((total, resource) => total + resource.quantity, 0);
  const lowStock = (resources || []).filter((resource) => resource.quantity <= 2).length;

  const remove = async (resource) => {
    if (!window.confirm(`Remove "${resource.title}" from club inventory?`)) return;
    try {
      await api.del(`/resources/${resource.id}`);
      toast('Inventory item removed');
      load();
    } catch (error) { toast(error.message, 'error'); }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h2>Club equipment & supplies</h2>
          <p>Keep track of the physical equipment and materials available to each club.</p>
        </div>
      </div>

      <div className="inventory-summary">
        <article><Boxes size={19} /><b>{loadError ? '—' : resources?.length ?? '—'}</b><span>Inventory items</span></article>
        <article><span className="inventory-summary-icon">#</span><b>{loadError ? '—' : totalUnits}</b><span>Total quantity</span></article>
        <article className={lowStock > 0 ? 'low-stock' : ''}><span className="inventory-summary-icon">!</span><b>{loadError ? '—' : lowStock}</b><span>Low stock (2 or fewer)</span></article>
      </div>

      <div className="toolbar resource-toolbar">
        <label className="inventory-search">
          <Search size={16} />
          <input type="search" placeholder="Search equipment…" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search inventory" />
        </label>
        <select className="select" value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
          <option value="">All categories</option>
          {categories.map((item) => <option key={item} value={item}>{item}</option>)}
        </select>
        <select className="select" value={clubId} onChange={(event) => setClubId(event.target.value)} aria-label="Filter by club">
          <option value="">All clubs and school-wide</option>
          {clubs.map((club) => <option key={club.id} value={club.id}>{club.name}</option>)}
        </select>
        <span className="spacer" />
        {canCreate && <button className="btn primary" onClick={() => setForm({ club_id: manageable[0]?.id || '' })}><Plus size={16} /> Add inventory item</button>}
      </div>

      {categories.length > 0 && (
        <div className="resource-categories">
          <span>{shown.length} {shown.length === 1 ? 'item' : 'items'}</span>
          {categories.map((item) => <button type="button" className={`pill category-filter${category === item ? ' selected' : ''}`} key={item} onClick={() => setCategory(category === item ? '' : item)}>{item}</button>)}
        </div>
      )}
      {loadError && <p className="page-error" role="alert">{loadError}</p>}
      {resources === null ? <Loading /> : shown.length === 0 ? (
        <Empty icon={Boxes} title={loadError ? 'Inventory could not be loaded' : 'No equipment found'}
          text={loadError ? 'Check your connection and try again.' : 'Try a different search or add physical supplies for your club.'} />
      ) : (
        <div className="inventory-grid">
          {shown.map((resource) => {
            const canEdit = canManage(resource.club_id);
            return (
              <article className="inventory-card" key={resource.id}>
                <div className="inventory-card-top">
                  <span className="inventory-item-icon"><Boxes size={20} /></span>
                  <span className={`inventory-stock${resource.quantity === 0 ? ' empty' : resource.quantity <= 2 ? ' low' : ''}`}>
                    {resource.quantity === 0 ? 'Out of stock' : resource.quantity <= 2 ? 'Low stock' : 'In stock'}
                  </span>
                  <span className="spacer" />
                  {canEdit && <button className="link-btn" aria-label={`Edit ${resource.title}`} onClick={() => setForm(resource)}><Pencil size={15} /></button>}
                  {canEdit && <button className="link-btn" aria-label={`Delete ${resource.title}`} onClick={() => remove(resource)}><Trash2 size={15} /></button>}
                </div>
                <h3>{resource.title}</h3>
                {resource.description && <p>{resource.description}</p>}
                <div className="inventory-quantity"><strong>{resource.quantity}</strong><span>{resource.unit}</span></div>
                <div className="inventory-meta">
                  <span className="pill">{resource.category}</span>
                  <ClubChip club={resource.clubs} />
                </div>
                {resource.storage_location && <div className="inventory-location"><MapPin size={14} /> {resource.storage_location}</div>}
              </article>
            );
          })}
        </div>
      )}

      {form && <InventoryForm initial={form} onClose={() => setForm(null)} onSaved={() => { setForm(null); load(); }} />}
    </>
  );
}

function InventoryForm({ initial, onClose, onSaved }) {
  const { manageable, canManage, toast } = useApp();
  const editing = !!initial.id;
  const options = [...manageable];
  if (canManage(null)) options.unshift({ id: '', name: 'School-wide inventory' });
  const [form, setForm] = useState({
    club_id: initial.club_id || '',
    title: initial.title || '',
    description: initial.description || '',
    category: initial.category || '',
    quantity: initial.quantity ?? 1,
    unit: initial.unit || 'items',
    storage_location: initial.storage_location || '',
  });
  const [busy, setBusy] = useState(false);
  const set = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.value }));

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    const payload = {
      ...form,
      club_id: form.club_id || null,
      quantity: Number(form.quantity),
      description: form.description.trim() || null,
      storage_location: form.storage_location.trim() || null,
    };
    try {
      if (editing) await api.put(`/resources/${initial.id}`, payload);
      else await api.post('/resources', payload);
      toast(editing ? 'Inventory item updated' : 'Inventory item added');
      onSaved();
    } catch (error) {
      toast(error.message, 'error');
      setBusy(false);
    }
  };

  return (
    <Modal title={editing ? 'Edit inventory item' : 'Add inventory item'} onClose={onClose}>
      <form onSubmit={save}>
        <div className="field"><label htmlFor="inventory-scope">Belongs to</label>
          <select id="inventory-scope" value={form.club_id} onChange={set('club_id')} required={options.every((item) => item.id !== '')}>
            {options.map((club) => <option key={club.id || 'school'} value={club.id}>{club.name}</option>)}
          </select>
        </div>
        <div className="field"><label htmlFor="inventory-title">Item name</label>
          <input id="inventory-title" value={form.title} onChange={set('title')} maxLength={120} placeholder="e.g. Footballs, training cones" required />
        </div>
        <div className="field"><label htmlFor="inventory-description">Notes (optional)</label>
          <textarea id="inventory-description" value={form.description} onChange={set('description')} placeholder="Size, condition, or other useful details" />
        </div>
        <div className="row2">
          <div className="field"><label htmlFor="inventory-quantity">Quantity</label>
            <input id="inventory-quantity" type="number" min="0" step="1" value={form.quantity} onChange={set('quantity')} required />
          </div>
          <div className="field"><label htmlFor="inventory-unit">Unit</label>
            <input id="inventory-unit" value={form.unit} onChange={set('unit')} maxLength={30} placeholder="e.g. balls, cones, sets" required />
          </div>
        </div>
        <div className="row2">
          <div className="field"><label htmlFor="inventory-category">Category</label>
            <input id="inventory-category" value={form.category} onChange={set('category')} maxLength={60} placeholder="e.g. Training equipment" required />
          </div>
          <div className="field"><label htmlFor="inventory-location">Storage location (optional)</label>
            <input id="inventory-location" value={form.storage_location} onChange={set('storage_location')} maxLength={120} placeholder="e.g. Sports cupboard" />
          </div>
        </div>
        <div className="modal-actions"><button type="button" className="btn" onClick={onClose}>Cancel</button><button className="btn primary" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Add item'}</button></div>
      </form>
    </Modal>
  );
}
