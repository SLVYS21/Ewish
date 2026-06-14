import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, ChevronRight, Trash2, Coins, X, Check, User } from 'lucide-react';
import { getSuperAdminUsers, getSuperAdminUser, updateSuperAdminUser, deleteSuperAdminUser } from '../../utils/api';
import PageShell from '../components/PageShell';
import s from './SuperAdminUsers.module.css';

function fmt(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

/* ── Detail Drawer ── */
function UserDrawer({ userId, onClose, onUpdated }) {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState('');
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    getSuperAdminUser(userId)
      .then(r => { setData(r.data); setCredits(r.data.user.credits ?? 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [userId]);

  const saveCredits = async () => {
    setSaving(true); setMsg('');
    try {
      await updateSuperAdminUser(userId, { credits: parseInt(credits) });
      setMsg('Crédits mis à jour');
      onUpdated();
    } catch (e) {
      setMsg(e.response?.data?.error || 'Erreur');
    }
    setSaving(false);
  };

  return (
    <div className={s.drawerOverlay} onClick={onClose}>
      <div className={s.drawer} onClick={e => e.stopPropagation()}>
        <div className={s.drawerHead}>
          <div className={s.drawerTitle}>Détail marchand</div>
          <button className={s.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        {loading ? (
          <div className={s.drawerLoading}>Chargement…</div>
        ) : !data ? (
          <div className={s.drawerError}>Erreur de chargement</div>
        ) : (
          <>
            {/* User info */}
            <div className={s.drawerSection}>
              <div className={s.userAvatar}>{(data.user.name || data.user.email || 'U')[0].toUpperCase()}</div>
              <div className={s.drawerUserName}>{data.user.name || ''}</div>
              <div className={s.drawerUserEmail}>{data.user.email}</div>
              <div className={s.drawerMeta}>
                <span className={s.roleBadge}>{data.user.role}</span>
                <span>Inscrit le {fmt(data.user.createdAt)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className={s.drawerStats}>
              <div className={s.dStat}>
                <div className={s.dStatVal}>{data.publications.length}</div>
                <div className={s.dStatLabel}>Publications</div>
              </div>
              <div className={s.dStat}>
                <div className={s.dStatVal}>{data.publications.filter(p => p.published).length}</div>
                <div className={s.dStatLabel}>Publiées</div>
              </div>
              <div className={s.dStat}>
                <div className={s.dStatVal}>{data.user.credits}</div>
                <div className={s.dStatLabel}>Crédits</div>
              </div>
            </div>

            {/* Credits editor */}
            <div className={s.drawerSection}>
              <div className={s.fieldLabel}>Modifier les crédits</div>
              <div className={s.creditRow}>
                <input
                  className={s.creditInput}
                  type="number"
                  min="0"
                  value={credits}
                  onChange={e => setCredits(e.target.value)}
                />
                <button className={s.saveBtn} onClick={saveCredits} disabled={saving}>
                  {saving ? '…' : <><Check size={15} /> Sauvegarder</>}
                </button>
              </div>
              <div className={s.quickAdd}>
                <button onClick={() => setCredits(prev => (parseInt(prev) || 0) + 10)}>+10</button>
                <button onClick={() => setCredits(prev => (parseInt(prev) || 0) + 50)}>+50</button>
                <button onClick={() => setCredits(prev => (parseInt(prev) || 0) + 100)}>+100</button>
              </div>
              {msg && <div className={s.msg}>{msg}</div>}
            </div>

            {/* Publications list */}
            {data.publications.length > 0 && (
              <div className={s.drawerSection}>
                <div className={s.fieldLabel}>Dernières publications</div>
                <div className={s.pubList}>
                  {data.publications.slice(0, 10).map(p => (
                    <div key={p._id} className={s.pubItem}>
                      <span className={`${s.pubDot} ${p.published ? s.green : ''}`} />
                      <span className={s.pubTitle}>{p.title || p.customName}</span>
                      <span className={s.pubDate}>{fmt(p.createdAt)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main Page ── */
export default function SuperAdminUsers() {
  const [users, setUsers]         = useState([]);
  const [total, setTotal]         = useState(0);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [page, setPage]           = useState(1);
  const [selectedId, setSelected] = useState(null);
  const [deleting, setDeleting]   = useState(null);
  const timer = useRef(null);

  const load = useCallback((p, s) => {
    setLoading(true);
    getSuperAdminUsers({ page: p, limit: 20, search: s || undefined })
      .then(r => { setUsers(r.data.users); setTotal(r.data.total); })
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(1, ''); }, [load]);

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v); setPage(1);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => load(1, v), 350);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce marchand ?')) return;
    setDeleting(id);
    try { await deleteSuperAdminUser(id); load(page, search); }
    catch (e) { alert(e.response?.data?.error || 'Erreur'); }
    setDeleting(null);
  };

  return (
    <PageShell title={`Marchands (${total})`}>
      {/* Search */}
      <div className={s.toolbar}>
        <div className={s.searchWrap}>
          <Search size={16} className={s.searchIcon} />
          <input
            className={s.searchInput}
            placeholder="Rechercher par nom ou email…"
            value={search}
            onChange={handleSearch}
          />
        </div>
      </div>

      {/* Table */}
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              <th>Marchand</th>
              <th>Rôle</th>
              <th>Publications</th>
              <th>Crédits</th>
              <th>Inscrit le</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className={s.empty}>Chargement…</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={6} className={s.empty}>Aucun marchand trouvé</td></tr>
            ) : users.map(u => (
              <tr key={u._id} className={s.row} onClick={() => setSelected(u._id)}>
                <td data-label="Marchand">
                  <div className={s.userCell}>
                    <div className={s.avatar}>{(u.name || u.email || 'U')[0].toUpperCase()}</div>
                    <div>
                      <div className={s.userName}>{u.name || ''}</div>
                      <div className={s.userEmail}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td data-label="Rôle"><span className={s.roleBadge}>{u.role}</span></td>
                <td data-label="Publications">
                  <span className={s.pubStats}>
                    {u.pubStats.total} <span>({u.pubStats.published} pub.)</span>
                  </span>
                </td>
                <td data-label="Crédits">
                  <span className={s.creditBadge}>
                    <Coins size={13} /> {u.credits}
                  </span>
                </td>
                <td data-label="Inscrit le" className={s.dateCell}>{fmt(u.createdAt)}</td>
                <td onClick={e => e.stopPropagation()}>
                  <div className={s.actions}>
                    <button className={s.btnDetail} onClick={() => setSelected(u._id)}>
                      <ChevronRight size={16} />
                    </button>
                    <button
                      className={s.btnDelete}
                      onClick={() => handleDelete(u._id)}
                      disabled={deleting === u._id}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className={s.pagination}>
          <button disabled={page === 1} onClick={() => { setPage(p => p - 1); load(page - 1, search); }}>←</button>
          <span>Page {page} · {total} résultats</span>
          <button disabled={users.length < 20} onClick={() => { setPage(p => p + 1); load(page + 1, search); }}>→</button>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedId && (
        <UserDrawer
          userId={selectedId}
          onClose={() => setSelected(null)}
          onUpdated={() => load(page, search)}
        />
      )}
    </PageShell>
  );
}
