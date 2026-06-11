import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, X, Plus, Edit2, Copy, Trash2, ExternalLink, CircleOff, Eye,
  QrCode, ChevronDown, Filter, Star, ArrowLeft,
} from 'lucide-react';
import {
  getPublications, deletePublication, duplicatePublication, unpublishPublication,
  updatePublication, getTemplates,
} from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';
import QRCodeModal from '../components/QRCodeModal';
import styles from './MyCreations.module.css';

const TEMPLATE_COLORS = {
  birthday:               'linear-gradient(135deg,#FFB3C1,#FF8DAA)',
  special:                'linear-gradient(135deg,#D7C5F2,#B59CF0)',
  'collective-family':    'linear-gradient(135deg,#C9EEDF,#9FE3CB)',
  'collective-pro':       'linear-gradient(135deg,#FFE7AD,#FFC95A)',
  forever:                'linear-gradient(135deg,#F8C8DC,#E8B0CC)',
  sanctuary:              'linear-gradient(135deg,#D7C5F2,#9B7EE2)',
  'notre-film':           'linear-gradient(135deg,#C2D5F0,#8FB0D8)',
  'wall-of-wishes':       'linear-gradient(135deg,#FFB3C1,#E11D48)',
  'wall-of-wishes-3d':    'linear-gradient(135deg,#FFD7C2,#FF9F7A)',
  'wall-of-wishes-modern':'linear-gradient(135deg,#ccc0f5,#e8b0d8)',
  'wall-of-wishes-space': 'linear-gradient(135deg,#ff8060,#d83070)',
};
const TEMPLATE_EMOJIS = {
  birthday: '🎂', special: '✨', 'collective-family': '💝',
  'collective-pro': '🥂', forever: '💍', sanctuary: '🕊️',
  'notre-film': '🎬', 'wall-of-wishes': '🌟', 'wall-of-wishes-3d': '🎊',
  'wall-of-wishes-modern': '💬', 'wall-of-wishes-space': '🚀',
};

const STATUS_OPTIONS = [
  { value: '', label: 'Tous' },
  { value: 'true', label: 'En ligne' },
  { value: 'false', label: 'Brouillons' },
];

export default function MyCreations() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const isSuperAdmin = user?.role === 'super_admin';
  const VITE_API = import.meta.env.VITE_API_URL || '';

  const [pubs, setPubs]               = useState([]);
  const [templates, setTemplates]     = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tplFilter, setTplFilter]     = useState('');
  const [showTplDropdown, setShowTplDropdown] = useState(false);
  const [page, setPage]               = useState(1);
  const [hasMore, setHasMore]         = useState(false);
  const searchRef = useRef(null);

  /* ── Dup modal ── */
  const [dupModal, setDupModal]   = useState(null);
  const [dupTitle, setDupTitle]   = useState('');
  const [dupSlug, setDupSlug]     = useState('');
  const [dupError, setDupError]   = useState('');
  const [dupLoading, setDupLoading] = useState(false);

  /* ── QR modal ── */
  const [qrPub, setQrPub] = useState(null);

  /* ── Share sheet ── */
  const [sharePub, setSharePub] = useState(null);

  const LIMIT = 60;

  const fetchPubs = useCallback(async (reset = false) => {
    const p = reset ? 1 : page;
    setLoading(true);
    try {
      const params = { mine: 'true', limit: LIMIT, page: p };
      if (search.trim())   params.search = search.trim();
      if (statusFilter)    params.published = statusFilter;
      if (tplFilter)       params.templateName = tplFilter;
      const res = await getPublications(params);
      const data = res.data || [];
      if (reset) {
        setPubs(data);
        setPage(1);
      } else {
        setPubs(prev => p === 1 ? data : [...prev, ...data]);
      }
      setHasMore(data.length === LIMIT);
    } catch (_) {}
    setLoading(false);
  }, [search, statusFilter, tplFilter, page]);

  useEffect(() => { fetchPubs(true); }, [search, statusFilter, tplFilter]);

  useEffect(() => {
    getTemplates().then(r => setTemplates(r.data || [])).catch(() => {});
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Supprimer cette création définitivement ?')) return;
    await deletePublication(id);
    setPubs(p => p.filter(x => x._id !== id));
  };

  const handleUnpublish = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Dépublier cette création ?')) return;
    await unpublishPublication(id);
    setPubs(p => p.map(x => x._id === id ? { ...x, published: false } : x));
  };

  const openDup = (pub, e) => {
    e.stopPropagation();
    setDupModal(pub);
    setDupTitle(pub.title + ' (copie)');
    setDupSlug((pub.customName || 'copie') + '-2');
    setDupError('');
  };

  const confirmDup = async () => {
    if (!dupTitle.trim() || !dupSlug.trim()) { setDupError('Titre et nom requis'); return; }
    setDupLoading(true); setDupError('');
    try {
      const r = await duplicatePublication(dupModal._id, { title: dupTitle.trim(), customName: dupSlug.trim() });
      setPubs(p => [r.data, ...p]);
      setDupModal(null);
      navigate(`/ewish-admin/ewish/edit/${r.data._id}`);
    } catch (e) { setDupError(e.response?.data?.error || 'Erreur'); }
    finally { setDupLoading(false); }
  };

  const handleTogglePremade = async (id, val, e) => {
    e.stopPropagation();
    try {
      await updatePublication(id, { isPremade: val });
      setPubs(prev => prev.map(p => p._id === id ? { ...p, isPremade: val } : p));
    } catch (err) { alert(err.response?.data?.error || 'Erreur'); }
  };

  const tplLabel = tplFilter
    ? (templates.find(t => t.name === tplFilter)?.label || tplFilter)
    : 'Tous les templates';

  return (
    <div className={styles.root}>
      {/* ── Dup modal ── */}
      {dupModal && (
        <div className={styles.overlay} onClick={() => setDupModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <span className={styles.modalIcon}>📋</span>
              <h2>Dupliquer la création</h2>
              <p>Template <strong>{dupModal.templateName}</strong> conservé.</p>
            </div>
            <label className={styles.field}>
              <span className={styles.fieldLabel}>Titre</span>
              <input className={styles.input} value={dupTitle} onChange={e => setDupTitle(e.target.value)} autoFocus />
            </label>
            <label className={styles.field} style={{ marginTop: 12 }}>
              <span className={styles.fieldLabel}>Nom dans l'URL</span>
              <div className={styles.slugWrap}>
                <span className={styles.slugPre}>/{dupModal.templateName}/</span>
                <input className={styles.slugInput} value={dupSlug} onChange={e => setDupSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
              </div>
            </label>
            {dupError && <p className={styles.modalError}>{dupError}</p>}
            <div className={styles.modalActions}>
              <button className={styles.btnGhost} onClick={() => setDupModal(null)}>Annuler</button>
              <button className={styles.btnPrimary} onClick={confirmDup} disabled={dupLoading}>
                {dupLoading ? '⏳ Duplication…' : <><Copy size={14}/> Dupliquer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── QR modal ── */}
      {qrPub?.shortCode && (
        <QRCodeModal url={`${VITE_API}/s/${qrPub.shortCode}`} onClose={() => setQrPub(null)} />
      )}

      {/* ── Share sheet ── */}
      {sharePub && (
        <div className={styles.overlay} onClick={() => setSharePub(null)}>
          <div className={styles.sheet} onClick={e => e.stopPropagation()}>
            <div className={styles.sheetGrip} />
            <h2 className={styles.sheetTitle}>Partager « {sharePub.title} »</h2>
            {sharePub.published && sharePub.shortCode ? (
              <>
                <div className={styles.linkRow}>
                  <span className={styles.linkBase}>mykado.store/s/</span>
                  <strong className={styles.linkCode}>{sharePub.shortCode}</strong>
                </div>
                <button className={styles.btnPrimary} style={{ marginTop: 14, width: '100%' }}
                  onClick={() => { navigator.clipboard?.writeText(`${VITE_API}/s/${sharePub.shortCode}`); }}>
                  Copier le lien
                </button>
                {sharePub.templateName?.startsWith('wall-of-wishes') && (
                  <button className={styles.btnGhost} style={{ marginTop: 10, width: '100%' }}
                    onClick={() => { window.open(`${VITE_API}/s/${sharePub.shortCode}`, '_blank'); }}>
                    <ExternalLink size={14}/> Voir le mur
                  </button>
                )}
              </>
            ) : (
              <p className={styles.sheetNote}>Cette création n'est pas encore publiée. Publiez-la d'abord pour obtenir un lien de partage.</p>
            )}
            <button className={styles.btnGhost} style={{ marginTop: 12, width: '100%' }} onClick={() => setSharePub(null)}>Fermer</button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/ewish-admin')}>
          <ArrowLeft size={18} />
        </button>
        <div>
          <div className={styles.eyebrow}>MES CRÉATIONS</div>
          <h1 className={styles.title}>Sur mon bureau</h1>
        </div>
        <button className={styles.newBtn} onClick={() => navigate('/ewish-admin/ewish/new')}>
          <Plus size={16}/> Nouvelle création
        </button>
      </div>

      {/* ── Filters bar ── */}
      <div className={styles.filtersBar}>
        {/* Search */}
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            ref={searchRef}
            className={styles.searchInput}
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Chercher par titre, URL ou code court…"
          />
          {search && <button className={styles.searchClear} onClick={() => setSearch('')}><X size={13}/></button>}
        </div>

        {/* Status pills */}
        <div className={styles.statusPills}>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              className={`${styles.pill} ${statusFilter === s.value ? styles.pillActive : ''}`}
              onClick={() => setStatusFilter(s.value)}
            >
              {s.value === 'true' && <span className={styles.dotLive} />}
              {s.value === 'false' && <span className={styles.dotDraft} />}
              {s.label}
            </button>
          ))}
        </div>

        {/* Template dropdown */}
        <div className={styles.dropdownWrap}>
          <button className={`${styles.pill} ${tplFilter ? styles.pillActive : ''}`} onClick={() => setShowTplDropdown(v => !v)}>
            <Filter size={13}/> {tplLabel} <ChevronDown size={12}/>
          </button>
          {showTplDropdown && (
            <div className={styles.dropdown} onClick={e => e.stopPropagation()}>
              <button className={styles.dropdownItem} onClick={() => { setTplFilter(''); setShowTplDropdown(false); }}>
                Tous les templates
              </button>
              {templates.map(t => (
                <button key={t.name} className={`${styles.dropdownItem} ${tplFilter === t.name ? styles.dropdownItemActive : ''}`}
                  onClick={() => { setTplFilter(t.name); setShowTplDropdown(false); }}>
                  {TEMPLATE_EMOJIS[t.name] || '🎁'} {t.label || t.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Grid ── */}
      {loading && pubs.length === 0 ? (
        <div className={styles.loadingRow}><div className={styles.spinner}/></div>
      ) : pubs.length === 0 ? (
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>🔍</span>
          <p>Aucune création trouvée.</p>
          <button className={styles.btnPrimary} onClick={() => navigate('/ewish-admin/ewish/new')}>
            <Plus size={15}/> Créer maintenant
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {pubs.map(pub => {
            const bg = TEMPLATE_COLORS[pub.templateName] || 'linear-gradient(135deg,#FFB3C1,#E11D48)';
            const emoji = TEMPLATE_EMOJIS[pub.templateName] || '🎁';
            const isDraft = !pub.published;
            const hasCagnotte = pub.cagnotte?.goal > 0 || pub.cagnotteConfig?.goal > 0;
            const cagGoal = pub.cagnotte?.goal || pub.cagnotteConfig?.goal || 0;
            const cagCollected = pub.cagnotte?.collected || 0;
            const cagPct = cagGoal > 0 ? Math.round(cagCollected / cagGoal * 100) : 0;
            const isWall = pub.templateName?.startsWith('wall-of-wishes');
            const isMine = pub.merchantId === user?.merchantId || isSuperAdmin;
            return (
              <div key={pub._id} className={styles.card} onClick={() => navigate(`/ewish-admin/ewish/edit/${pub._id}`)}>
                <div className={styles.cardThumb} style={{ background: bg }}>
                  <span className={styles.cardEmoji}>{emoji}</span>
                  <span className={`${styles.statusBadge} ${isDraft ? styles.statusDraft : styles.statusLive}`}>
                    <i className={styles.statusDot} style={{ background: isDraft ? '#FFC95A' : '#6BCFAF', boxShadow: isDraft ? 'none' : '0 0 0 3px rgba(107,207,175,.3)', animation: isDraft ? 'none' : 'mk-pulse-soft 2s infinite' }} />
                    {isDraft ? 'BROUILLON' : 'EN LIGNE'}
                  </span>
                  {pub.published && pub.shortCode && (
                    <button className={styles.qrBtn} onClick={e => { e.stopPropagation(); setQrPub(pub); }}><QrCode size={12}/></button>
                  )}
                  {isWall && (
                    <span className={styles.wallBadge}>MUR</span>
                  )}
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardTitle}>{pub.title || pub.data?.name || 'Sans titre'}</div>
                  <div className={styles.cardMeta}>
                    <span>{pub.templateName}</span>
                    {pub.customName && <><span>·</span><span className={styles.metaCode}>{pub.customName}</span></>}
                    {pub.shortCode && <><span>·</span><span className={styles.metaShort}>#{pub.shortCode}</span></>}
                  </div>
                  <div className={styles.cardDate}>
                    {new Date(pub.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: '2-digit' })}
                    {pub.published && pub.views != null && (
                      <><span> · </span><Eye size={10} style={{ verticalAlign: -1, marginRight: 2 }}/>{pub.views || 0} vues</>
                    )}
                  </div>
                  {hasCagnotte && (
                    <div className={styles.cagBar}>
                      <div className={styles.cagFill} style={{ width: Math.min(100, cagPct) + '%' }}/>
                      <div className={styles.cagLabel}>🎁 {cagPct}% collecté</div>
                    </div>
                  )}
                </div>

                <div className={styles.cardActions} onClick={e => e.stopPropagation()}>
                  {pub.published && pub.shortCode && (
                    <button className={styles.actBtn} title="Partager" onClick={() => setSharePub(pub)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                    </button>
                  )}
                  {pub.published && (
                    <a href={`${VITE_API}/site/${pub.templateName}/${pub.customName}`} target="_blank" rel="noreferrer" className={styles.actBtn} title="Voir en ligne" onClick={e => e.stopPropagation()}>
                      <ExternalLink size={13}/>
                    </a>
                  )}
                  {isSuperAdmin && (
                    <button className={styles.actBtn} title="Modèle prêt-à-offrir" onClick={e => handleTogglePremade(pub._id, !pub.isPremade, e)}>
                      <Star size={13} fill={pub.isPremade ? '#E11D48' : 'none'} color={pub.isPremade ? '#E11D48' : 'currentColor'}/>
                    </button>
                  )}
                  <button className={styles.actBtn} title="Dupliquer" onClick={e => openDup(pub, e)}>
                    <Copy size={13}/>
                  </button>
                  <button className={styles.actBtn} title="Éditer" onClick={() => navigate(`/ewish-admin/ewish/edit/${pub._id}`)}>
                    <Edit2 size={13}/>
                  </button>
                  {pub.published && isMine && (
                    <button className={styles.actBtn} title="Dépublier" onClick={e => handleUnpublish(pub._id, e)}>
                      <CircleOff size={13} color="#ef4444"/>
                    </button>
                  )}
                  {isMine && (
                    <button className={`${styles.actBtn} ${styles.actBtnDanger}`} title="Supprimer" onClick={e => handleDelete(pub._id, e)}>
                      <Trash2 size={13}/>
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {/* New card */}
          <button className={styles.newCard} onClick={() => navigate('/ewish-admin/ewish/new')}>
            <Plus size={28} />
            <div className={styles.newCardTitle}>Nouvelle création</div>
            <div className={styles.newCardSub}>Choisir un template</div>
          </button>
        </div>
      )}

      {/* ── Load more ── */}
      {hasMore && !loading && (
        <div className={styles.loadMoreRow}>
          <button className={styles.btnGhost} onClick={() => { setPage(p => p + 1); fetchPubs(false); }}>
            Charger plus
          </button>
        </div>
      )}
    </div>
  );
}
