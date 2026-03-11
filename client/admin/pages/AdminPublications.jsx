// ── AdminPublications.jsx ──────────────────────────────────────────────────
import { useState, useEffect, useMemo } from 'react';
import { getPublications, deletePublication } from '../../utils/api';
import PageShell from '../components/PageShell';
import s from './AdminPublications.module.css';

const THUMB_BG = {
  birthday:'linear-gradient(135deg,#ff69b4,#ffb347)',
  special:'linear-gradient(135deg,#4285F4,#34A853)',
  'collective-family':'linear-gradient(135deg,#ff69b4,#a78bfa)',
  'collective-pro':'linear-gradient(135deg,#1e3a5f,#c9a84c)',
};
const THUMB_EMOJI = { birthday:'🎂', special:'🔍', 'collective-family':'🎉', 'collective-pro':'🏆' };

export function AdminPublications() {
  const [pubs, setPubs]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [toast, setToast]   = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => {
    setLoading(true);
    try { const r = await getPublications(); setPubs(r.data || []); }
    catch { setPubs([]); }
    finally { setLoading(false); }
  };

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Supprimer cette publication définitivement ?')) return;
    try { await deletePublication(id); setPubs(p => p.filter(x => x._id !== id)); showToast('Publication supprimée'); }
    catch { showToast('Erreur'); }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return pubs.filter(p => !q || (p.title||'').toLowerCase().includes(q) || (p.templateName||'').toLowerCase().includes(q) || (p.customName||'').toLowerCase().includes(q));
  }, [pubs, search]);

  return (
    <PageShell title="Publications" subtitle={`${filtered.length} site${filtered.length > 1 ? 's' : ''} créé${filtered.length > 1 ? 's' : ''}`}>
      <div className={s.toolbar}>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}>🔍</span>
          <input className={s.searchInput} placeholder="Titre, template…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      {loading ? <div className={s.loadingWrap}><div className={s.spinner}/></div>
       : !filtered.length ? <div className={s.emptyWrap}><span>🎬</span><p>Aucune publication</p></div>
       : (
        <div className={s.list}>
          {filtered.map(p => {
            const bg    = THUMB_BG[p.templateName]    || 'linear-gradient(135deg,#333,#444)';
            const emoji = THUMB_EMOJI[p.templateName] || '🎁';
            const url   = `/site/${p.templateName}/${p.customName}`;
            return (
              <div key={p._id} className={s.card}>
                <div className={s.thumb} style={{ background: bg }}>{emoji}</div>
                <div className={s.info}>
                  <div className={s.title}>{p.title || 'Sans titre'}</div>
                  <div className={s.meta}>
                    <span>{p.templateName}</span>
                    <span className={s.dot}>·</span>
                    <span className={p.published ? s.published : s.draft}>{p.published ? 'Publié' : 'Brouillon'}</span>
                    <span className={s.dot}>·</span>
                    <span>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}) : ''}</span>
                  </div>
                  {p.published && <div className={s.url}>{url}</div>}
                </div>
                <div className={s.actions}>
                  {p.published && <a href={url} target="_blank" rel="noreferrer" className={`${s.btn} ${s.btnGhost}`} onClick={e=>e.stopPropagation()}>↗ Voir</a>}
                  <a href={`/admin/ewish/edit/${p._id}`} className={`${s.btn} ${s.btnGhost}`} onClick={e=>e.stopPropagation()}>✏ Éditer</a>
                  <button className={`${s.btn} ${s.btnDanger}`} onClick={e=>handleDelete(p._id,e)}>🗑</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {toast && <div className={s.toast}>{toast}</div>}
    </PageShell>
  );
}

export default AdminPublications;