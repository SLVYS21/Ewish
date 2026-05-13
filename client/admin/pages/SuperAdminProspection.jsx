import { useState, useEffect, useRef } from 'react';
import PageShell from '../components/PageShell';
import { getProspects, createProspect, updateProspect, deleteProspect } from '../../utils/api';
import s from './SuperAdminProspection.module.css';
import { Plus, Search, MessageSquare, CheckCircle, Clock, XCircle, User, Activity, Trash2, Edit2, Send } from 'lucide-react';

const STATUS_OPTIONS = [
  { value: 'new',           label: 'Nouveau',         color: '#3b82f6', icon: <Clock size={14} /> },
  { value: 'contacted',     label: 'Contacté',        color: '#f59e0b', icon: <Send size={14} /> },
  { value: 'interested',    label: 'Intéressé',       color: '#8b5cf6', icon: <Activity size={14} /> },
  { value: 'converted',     label: 'Converti',        color: '#10b981', icon: <CheckCircle size={14} /> },
  { value: 'not_interested',label: 'Pas intéressé',    color: '#ef4444', icon: <XCircle size={14} /> },
];
const STATUS_MAP = Object.fromEntries(STATUS_OPTIONS.map(s => [s.value, s]));

function buildWaLink(phone, msg) {
  const num = phone.replace(/\D/g, '');
  return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
}

export default function SuperAdminProspection() {
  const [items,    setItems]    = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [msgModal, setMsgModal] = useState(null); // prospect whose message we're editing
  const searchTimer = useRef(null);

  const [form, setForm] = useState({
    companyName:'', contactName:'', activity:'', phone:'', instagram:'', facebook:'', source:'', notes:'', messageTemplate:'',
  });
  const [saving, setSaving] = useState(false);

  const load = async (q = search, st = statusFilter) => {
    setLoading(true);
    try {
      const r = await getProspects({ search: q||undefined, status: st||undefined, limit: 100 });
      setItems(r.data.items); setTotal(r.data.total);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSearch = e => {
    const v = e.target.value; setSearch(v);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => load(v, statusFilter), 350);
  };

  const openCreate = () => {
    setForm({ companyName:'', contactName:'', activity:'', phone:'', instagram:'', facebook:'', source:'', notes:'', messageTemplate:'' });
    setEditItem(null); setShowForm(true);
  };
  const openEdit = p => {
    setForm({ companyName: p.companyName, contactName: p.contactName, activity: p.activity, phone: p.phone, instagram: p.instagram, facebook: p.facebook, source: p.source, notes: p.notes, messageTemplate: p.messageTemplate });
    setEditItem(p); setShowForm(true);
  };

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editItem) {
        const r = await updateProspect(editItem._id, form);
        setItems(prev => prev.map(x => x._id === editItem._id ? r.data : x));
      } else {
        const r = await createProspect(form);
        setItems(prev => [r.data, ...prev]); setTotal(t => t + 1);
      }
      setShowForm(false);
    } catch (err) { alert(err.response?.data?.error || 'Erreur'); }
    finally { setSaving(false); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      const r = await updateProspect(id, { status });
      setItems(prev => prev.map(x => x._id === id ? r.data : x));
    } catch {}
  };

  const handleDelete = async id => {
    if (!confirm('Supprimer ce prospect ?')) return;
    await deleteProspect(id);
    setItems(prev => prev.filter(x => x._id !== id)); setTotal(t => t-1);
  };

  const handleContact = async p => {
    // Open WA with the pre-filled message, then mark as contacted
    window.open(buildWaLink(p.phone, p.messageTemplate), '_blank');
    if (p.status === 'new') await handleStatusChange(p._id, 'contacted');
  };

  const COUNTS = STATUS_OPTIONS.reduce((acc, o) => {
    acc[o.value] = items.filter(x => x.status === o.value).length;
    return acc;
  }, {});

  return (
    <PageShell title="Prospection" subtitle={`${total} prospect${total !== 1 ? 's' : ''} au total`}>

      {/* ── Form Modal ── */}
      {showForm && (
        <div className={s.overlay} onClick={() => setShowForm(false)}>
          <form className={s.formModal} onSubmit={handleSave} onClick={e => e.stopPropagation()}>
            <h2>{editItem ? 'Modifier prospect' : 'Nouveau prospect'}</h2>
            <div className={s.formGrid}>
              {[
                { key:'companyName', label:'Nom entreprise *', placeholder:'Salon Grâce Divine', required:true },
                { key:'contactName', label:'Nom contact',       placeholder:'Mme Chantal' },
                { key:'activity',    label:'Activité',          placeholder:'Salon de coiffure' },
                { key:'phone',       label:'WhatsApp',          placeholder:'+22901XXXXXXXX' },
                { key:'instagram',   label:'Instagram',         placeholder:'@salon_grace' },
                { key:'facebook',    label:'Facebook',          placeholder:'facebook.com/...' },
                { key:'source',      label:'Source',            placeholder:'Instagram story' },
              ].map(f => (
                <div key={f.key} className={s.formField}>
                  <label>{f.label}</label>
                  <input value={form[f.key]} required={f.required} placeholder={f.placeholder}
                    onChange={e => setForm(prev => ({...prev, [f.key]: e.target.value}))} />
                </div>
              ))}
            </div>
            <div className={s.formField}>
              <label>Message WhatsApp personnalisé</label>
              <textarea rows={5} value={form.messageTemplate} placeholder="Votre message pré-rempli…"
                onChange={e => setForm(prev => ({...prev, messageTemplate: e.target.value}))} />
            </div>
            <div className={s.formField}>
              <label>Notes internes</label>
              <textarea rows={3} value={form.notes} placeholder="Informations complémentaires…"
                onChange={e => setForm(prev => ({...prev, notes: e.target.value}))} />
            </div>
            <div className={s.formActions}>
              <button type="button" className={s.btnCancel} onClick={() => setShowForm(false)}>Annuler</button>
              <button type="submit" className={s.btnSave} disabled={saving}>{saving ? 'Enregistrement…' : '💾 Enregistrer'}</button>
            </div>
          </form>
        </div>
      )}

      {/* ── Message Modal ── */}
      {msgModal && (
        <div className={s.overlay} onClick={() => setMsgModal(null)}>
          <div className={s.msgModal} onClick={e => e.stopPropagation()}>
            <h3>💬 Message pour {msgModal.companyName}</h3>
            <textarea className={s.msgTextarea} rows={8} value={msgModal.messageTemplate}
              onChange={e => setMsgModal(m => ({...m, messageTemplate: e.target.value}))} />
            <div className={s.formActions}>
              <button className={s.btnCancel} onClick={() => setMsgModal(null)}>Annuler</button>
              <button className={s.btnSave} onClick={async () => {
                await updateProspect(msgModal._id, { messageTemplate: msgModal.messageTemplate });
                setItems(prev => prev.map(x => x._id === msgModal._id ? {...x, messageTemplate: msgModal.messageTemplate} : x));
                setMsgModal(null);
              }}>💾 Sauvegarder</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toolbar ── */}
      <div className={s.toolbar}>
        <div className={s.searchBar}>
          <span>🔍</span>
          <input placeholder="Rechercher entreprise, activité…" value={search} onChange={handleSearch} />
        </div>
        <select className={s.statusSelect} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); load(search, e.target.value); }}>
          <option value="">Tous les statuts</option>
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label} ({COUNTS[o.value] || 0})</option>)}
        </select>
        <button className={s.btnAdd} onClick={openCreate}>➕ Ajouter</button>
      </div>

      {/* ── Status summary ── */}
      <div className={s.statusBar}>
        {STATUS_OPTIONS.map(o => (
          <button key={o.value} className={`${s.statusPill} ${statusFilter===o.value?s.statusPillActive:''}`}
            style={{'--pill-color': o.color}} onClick={() => { const v = statusFilter===o.value?'':o.value; setStatusFilter(v); load(search,v); }}>
            {o.icon} {o.label} <span className={s.pillCount}>{COUNTS[o.value]||0}</span>
          </button>
        ))}
      </div>

      {/* ── Table ── */}
      {loading ? <div className={s.loading}><div className={s.spinner}/></div> : (
        <div className={s.tableWrap}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Entreprise</th><th>Activité</th><th>Source</th>
                <th>Statut</th><th>Dernier contact</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={6} className={s.emptyRow}>Aucun prospect trouvé</td></tr>}
              {items.map(p => (
                <tr key={p._id} className={s.row}>
                  <td>
                    <div className={s.companyName}>{p.companyName}</div>
                    {p.contactName && <div className={s.contactName}>👤 {p.contactName}</div>}
                  </td>
                  <td><span className={s.activityTag}>{p.activity || '—'}</span></td>
                  <td className={s.muted}>{p.source || '—'}</td>
                  <td>
                    <select
                      className={s.statusDropdown}
                      value={p.status}
                      style={{color: STATUS_MAP[p.status]?.color || '#94a3b8'}}
                      onChange={e => handleStatusChange(p._id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  </td>
                  <td className={s.muted}>{p.lastContactedAt ? new Date(p.lastContactedAt).toLocaleDateString('fr-FR') : '—'}</td>
                  <td>
                    <div className={s.rowActions}>
                      {p.phone && (
                        <button className={s.btnWa} onClick={() => handleContact(p)} title="Contacter sur WhatsApp">
                          <svg viewBox="0 0 24 24" fill="currentColor" width="15" height="15"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                          Contacter
                        </button>
                      )}
                      <button className={s.btnMsg} onClick={() => setMsgModal({...p})} title="Éditer le message">✏️</button>
                      <button className={s.btnEdit} onClick={() => openEdit(p)} title="Modifier">⚙️</button>
                      <button className={s.btnDel} onClick={() => handleDelete(p._id)} title="Supprimer">🗑️</button>
                    </div>
                    {p.notes && <div className={s.notes}>{p.notes}</div>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
