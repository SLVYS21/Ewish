import { useState, useEffect } from 'react';
import { getPublications } from '../../utils/api';
import api from '../../utils/api';
import PageShell from '../components/PageShell';
import s from './AdminWishes.module.css';

function fmtDate(d) { return d ? new Date(d).toLocaleDateString('fr-FR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : '—'; }

export default function AdminWishes() {
  const [pubs, setPubs]         = useState([]);
  const [pubId, setPubId]       = useState('');
  const [wishes, setWishes]     = useState([]);
  const [filter, setFilter]     = useState('all');   // all | pending | approved
  const [loadingP, setLoadingP] = useState(true);
  const [loadingW, setLoadingW] = useState(false);
  const [toast, setToast]       = useState('');

  // Load collective publications
  useEffect(() => {
    getPublications()
      .then(r => {
        const collective = (r.data || []).filter(p => p.templateName?.startsWith('collective'));
        setPubs(collective);
        if (collective.length === 1) { setPubId(collective[0]._id); }
      })
      .catch(() => setPubs([]))
      .finally(() => setLoadingP(false));
  }, []);

  // Load wishes when pub selected
  useEffect(() => { if (pubId) loadWishes(); }, [pubId]);

  const loadWishes = async () => {
    if (!pubId) return;
    setLoadingW(true);
    try { const r = await api.get(`/wishes/${pubId}`, { withCredentials: true }); setWishes(r.data || []); }
    catch { setWishes([]); }
    finally { setLoadingW(false); }
  };

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const toggle = async (id, field, value) => {
    try {
      const r = await api.patch(`/wishes/${id}`, { [field]: value }, { withCredentials: true });
      setWishes(prev => prev.map(w => w._id === id ? r.data : w));
    } catch { showToast('Erreur'); }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce message ?')) return;
    try {
      await api.delete(`/wishes/${id}`, { withCredentials: true });
      setWishes(prev => prev.filter(w => w._id !== id));
      showToast('Message supprimé');
    } catch { showToast('Erreur'); }
  };

  const displayed = wishes.filter(w => {
    if (filter === 'pending')  return !w.approved && !w.hidden;
    if (filter === 'approved') return  w.approved && !w.hidden;
    return true;
  });

  const pendingCount  = wishes.filter(w => !w.approved && !w.hidden).length;
  const approvedCount = wishes.filter(w =>  w.approved && !w.hidden).length;

  return (
    <PageShell title="Vœux collectifs" subtitle="Modérer les messages reçus">
      {/* ── Publication selector ── */}
      <div className={s.toolbar}>
        {loadingP ? <div className={s.spinner} style={{ width:20, height:20 }} /> : (
          <select className={s.pubSelect} value={pubId} onChange={e => setPubId(e.target.value)}>
            <option value="">Sélectionner une publication…</option>
            {pubs.map(p => <option key={p._id} value={p._id}>{p.title || p.customName} — {p.templateName}</option>)}
          </select>
        )}
        {pubId && (
          <div className={s.filterTabs}>
            <button className={`${s.filterBtn} ${filter==='all'?s.active:''}`}      onClick={()=>setFilter('all')}>Tous ({wishes.length})</button>
            <button className={`${s.filterBtn} ${filter==='pending'?s.active:''}`}  onClick={()=>setFilter('pending')}>En attente ({pendingCount})</button>
            <button className={`${s.filterBtn} ${filter==='approved'?s.active:''}`} onClick={()=>setFilter('approved')}>Approuvés ({approvedCount})</button>
          </div>
        )}
        {pubId && (
          <button className={`${s.btn} ${s.btnGhost} ${s.btnSm}`} onClick={loadWishes}>↻ Rafraîchir</button>
        )}
      </div>

      {/* ── Empty / loading states ── */}
      {!pubId && (
        <div className={s.emptyWrap}><span className={s.emptyIcon}>💌</span><p>Sélectionnez une publication collective pour modérer les vœux</p></div>
      )}
      {pubId && loadingW && (
        <div className={s.loadingWrap}><div className={s.spinner} /></div>
      )}
      {pubId && !loadingW && !displayed.length && (
        <div className={s.emptyWrap}><span className={s.emptyIcon}>💌</span><p>Aucun message dans cette catégorie</p></div>
      )}

      {/* ── Wish grid ── */}
      {pubId && !loadingW && displayed.length > 0 && (
        <div className={s.grid}>
          {displayed.map(w => (
            <div key={w._id} className={`${s.card} ${w.approved && !w.hidden ? s.cardApproved : ''} ${w.hidden ? s.cardHidden : ''}`}>
              {/* Header */}
              <div className={s.cardHead}>
                <div className={s.avatar}>
                  {w.photoUrl
                    ? <img src={w.photoUrl} alt="" className={s.avatarImg} />
                    : <span>{(w.firstName||'?')[0].toUpperCase()}</span>
                  }
                </div>
                <div className={s.authorInfo}>
                  <div className={s.authorName}>{w.firstName}</div>
                  {w.role && <div className={s.authorRole}>{w.role}</div>}
                  <div className={s.authorDate}>{fmtDate(w.createdAt)}</div>
                </div>
                <div className={s.statusDot}>
                  {w.hidden
                    ? <span className={`${s.badge} ${s.badgeHidden}`}>Masqué</span>
                    : w.approved
                    ? <span className={`${s.badge} ${s.badgeApproved}`}>Visible</span>
                    : <span className={`${s.badge} ${s.badgePending}`}>En attente</span>
                  }
                </div>
              </div>

              {/* Message */}
              <blockquote className={s.message}>"{w.message}"</blockquote>

              {/* Photo if any */}
              {w.photoUrl && <img src={w.photoUrl} alt="" className={s.photoPreview} />}

              {/* Actions */}
              <div className={s.actions}>
                <button
                  className={`${s.btn} ${w.approved ? s.btnGhost : s.btnGold} ${s.btnSm}`}
                  onClick={() => toggle(w._id, 'approved', !w.approved)}
                >
                  {w.approved ? '✓ Approuvé' : '+ Approuver'}
                </button>
                <button
                  className={`${s.btn} ${s.btnGhost} ${s.btnSm}`}
                  onClick={() => toggle(w._id, 'hidden', !w.hidden)}
                >
                  {w.hidden ? '👁 Afficher' : '🙈 Masquer'}
                </button>
                <button className={`${s.btn} ${s.btnDanger} ${s.btnSm} ${s.btnIcon}`} onClick={() => remove(w._id)}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div className={s.toast}>{toast}</div>}
    </PageShell>
  );
}