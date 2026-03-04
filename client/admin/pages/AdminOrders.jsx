import { useState, useEffect, useMemo } from 'react';
import { getOrders, updateOrder } from '../../utils/api';
import PageShell from '../components/PageShell';
import Modal from '../components/Modal';
import s from './AdminOrders.module.css';

function fmtPrice(p) { return new Intl.NumberFormat('fr-FR').format(p || 0) + ' FCFA'; }
function fmtDate(d)  { return d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'; }
function fmtShort(d) { return d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'; }

const STATUS_LABELS = { pending:'En attente', confirmed:'Confirmée', in_progress:'En cours', delivered:'Livrée', cancelled:'Annulée' };
const BADGE_CLS     = { pending:s.badgePending, confirmed:s.badgeConfirmed, in_progress:s.badgeProgress, delivered:s.badgeDelivered, cancelled:s.badgeCancelled };

const PER_PAGE = 15;

export default function AdminOrders() {
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [status, setStatus]   = useState('');
  const [page, setPage]       = useState(1);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving]   = useState(false);
  const [detailStatus, setDetailStatus] = useState('');
  const [detailPubId, setDetailPubId]   = useState('');
  const [toast, setToast]     = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { const r = await getOrders({ limit: 500 }); setOrders(r.data.orders || []); }
    catch { setOrders([]); }
    finally { setLoading(false); }
  };

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return orders.filter(o => {
      const matchQ = !q ||
        `${o.client.firstName} ${o.client.lastName||''}`.toLowerCase().includes(q) ||
        o.client.email.toLowerCase().includes(q) ||
        (o.templateName||'').toLowerCase().includes(q) ||
        (o.recipientName||'').toLowerCase().includes(q);
      return matchQ && (!status || o.status === status);
    });
  }, [orders, search, status]);

  const paged = filtered.slice((page-1)*PER_PAGE, page*PER_PAGE);
  const pages = Math.ceil(filtered.length / PER_PAGE);

  const openDetail = (o) => { setSelected(o); setDetailStatus(o.status); setDetailPubId(o.publicationId || ''); };

  const quickStatus = async (id, newStatus, e) => {
    e.stopPropagation();
    try {
      await updateOrder(id, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: newStatus } : o));
      showToast('Statut mis à jour');
    } catch { showToast('Erreur'); }
  };

  const saveDetail = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const body = { status: detailStatus };
      if (detailPubId) body.publicationId = detailPubId;
      await updateOrder(selected._id, body);
      setOrders(prev => prev.map(o => o._id === selected._id ? { ...o, ...body } : o));
      showToast('Commande mise à jour');
      setSelected(null);
    } catch (e) { showToast('Erreur : ' + e.message); }
    finally { setSaving(false); }
  };

  return (
    <PageShell title="Commandes" subtitle={`${filtered.length} commande${filtered.length > 1 ? 's' : ''}`}>
      {/* ── Toolbar ── */}
      <div className={s.toolbar}>
        <div className={s.searchWrap}>
          <span className={s.searchIcon}>🔍</span>
          <input className={s.searchInput} placeholder="Nom, email, template…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className={s.filter} value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}>
          <option value="">Tous les statuts</option>
          {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>

      {/* ── Table ── */}
      <div className={s.tableWrap}>
        {loading ? (
          <div className={s.loadingWrap}><div className={s.spinner}/></div>
        ) : !paged.length ? (
          <div className={s.emptyWrap}><span className={s.emptyIcon}>📭</span>Aucune commande trouvée</div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr><th>Client</th><th>Template</th><th>Destinataire</th><th>Montant</th><th>Statut</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {paged.map(o => (
                <tr key={o._id} onClick={() => openDetail(o)}>
                  <td>
                    <div className={s.bold}>{o.client.firstName} {o.client.lastName || ''}</div>
                    <div className={s.muted}>{o.client.email}</div>
                  </td>
                  <td>{o.templateLabel || o.templateName}</td>
                  <td>{o.recipientName || '—'}</td>
                  <td className={s.bold}>{fmtPrice(o.finalPrice)}</td>
                  <td><span className={`${s.badge} ${BADGE_CLS[o.status]}`}>{STATUS_LABELS[o.status]}</span></td>
                  <td className={s.muted}>{fmtShort(o.createdAt)}</td>
                  <td onClick={e => e.stopPropagation()}>
                    <select className={s.quickSelect} value="" onChange={e => quickStatus(o._id, e.target.value, e)}>
                      <option value="" disabled>Changer…</option>
                      {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pagination ── */}
      {pages > 1 && (
        <div className={s.pagination}>
          <button className={s.pageBtn} onClick={() => setPage(p => p-1)} disabled={page===1}>‹</button>
          {Array.from({length: pages}, (_, i) => i+1).map(p => (
            <button key={p} className={`${s.pageBtn} ${p===page?s.active:''}`} onClick={() => setPage(p)}>{p}</button>
          ))}
          <button className={s.pageBtn} onClick={() => setPage(p => p+1)} disabled={page===pages}>›</button>
        </div>
      )}

      {/* ── Detail Modal ── */}
      <Modal
        open={!!selected} onClose={() => setSelected(null)}
        title={selected ? `${selected.client.firstName} ${selected.client.lastName||''} — Commande` : ''}
        footer={<>
          <button className={`${s.btn} ${s.btnGhost}`} onClick={() => setSelected(null)}>Fermer</button>
          <button className={`${s.btn} ${s.btnGold}`} onClick={saveDetail} disabled={saving}>{saving ? 'Enregistrement…' : 'Enregistrer'}</button>
        </>}
      >
        {selected && (
          <div className={s.detail}>
            <div className={s.detailGrid}>
              <div><div className={s.dLabel}>Template</div><div className={s.dValue}>{selected.templateLabel||selected.templateName}</div></div>
              <div><div className={s.dLabel}>Prix de base</div><div className={s.dValue}>{fmtPrice(selected.basePrice)}</div></div>
              <div><div className={s.dLabel}>Total</div><div className={`${s.dValue} ${s.gold}`}>{fmtPrice(selected.finalPrice)}</div></div>
              {selected.promoCode && <div><div className={s.dLabel}>Promo</div><div className={s.dValue}>{selected.promoCode} (−{fmtPrice(selected.promoDiscount)})</div></div>}
              <div><div className={s.dLabel}>Date</div><div className={s.dValue}>{fmtDate(selected.createdAt)}</div></div>
            </div>

            <div className={s.detailBlock}>
              <div className={s.detailBlockTitle}>Client</div>
              <div className={s.detailGrid}>
                <div><div className={s.dLabel}>Email</div><div className={s.dValue}>{selected.client.email}</div></div>
                <div><div className={s.dLabel}>Téléphone</div><div className={s.dValue}>{selected.client.phone||'—'}</div></div>
                <div><div className={s.dLabel}>Destinataire</div><div className={s.dValue}>{selected.recipientName||'—'}</div></div>
                <div><div className={s.dLabel}>Occasion</div><div className={s.dValue}>{selected.occasion||'—'}</div></div>
              </div>
            </div>

            {selected.notes && (
              <div className={s.detailBlock}>
                <div className={s.detailBlockTitle}>Instructions</div>
                <p className={s.notes}>{selected.notes}</p>
              </div>
            )}

            <div className={s.detailBlock}>
              <div className={s.detailBlockTitle}>Mise à jour</div>
              <div className={s.formGroup}>
                <label className={s.formLabel}>Statut</label>
                <select className={s.formSelect} value={detailStatus} onChange={e => setDetailStatus(e.target.value)}>
                  {Object.entries(STATUS_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className={s.formGroup} style={{ marginTop: 10 }}>
                <label className={s.formLabel}>ID publication liée</label>
                <input className={s.formInput} value={detailPubId} onChange={e => setDetailPubId(e.target.value)} placeholder="ObjectId MongoDB…" />
              </div>
            </div>
          </div>
        )}
      </Modal>

      {toast && <div className={s.toast}>{toast}</div>}
    </PageShell>
  );
}