import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Edit2, Copy, Trash2, Share2, MoreHorizontal, X, Gift, Inbox, ChevronLeft, ChevronRight } from 'lucide-react';
import { WallActivityPreview } from '../components/WallPreviews';
import { TemplateIllustration, hasTemplateIllustration } from '../create-flow/templateIllustrations';
import {
  getPublications, deletePublication, duplicatePublication, unpublishPublication,
  getTemplates,
} from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';

const PAGE_SIZE = 10;

/* Les WallActivityPreview* sont dessinees en pixels absolus pour un canvas
   ~200-240px (voir Dashboard.recentThumb=220). Sur crea-thumb (~100px), les
   post-its 52px + paddings 20px debordaient et rendaient la preview illisible.
   On rend a taille de reference puis on scale-down pour un aspect complet. */
const WALL_THUMB_REF_PX = 240;

function ScaledWallPreview({ pub, sizePx }) {
  const scale = sizePx / WALL_THUMB_REF_PX;
  return (
    <div style={{
      position: 'relative', width: sizePx, height: sizePx,
      borderRadius: 'inherit', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: WALL_THUMB_REF_PX, height: WALL_THUMB_REF_PX,
        transform: `scale(${scale})`, transformOrigin: '0 0',
      }}>
        <WallActivityPreview pub={pub} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
}

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

/* Murs actifs. Les variantes 3d/space ont été retirées.
   Voir memory/project_walls_flow.md */
const WALL_TEMPLATES = new Set([
  'wall-of-wishes', 'wall-of-wishes-modern', 'wall-of-wishes-craft',
]);

const DISPLAY_DOMAIN = (import.meta.env.VITE_API_URL || 'mykado.store')
  .replace(/^https?:\/\//, '')
  .replace(/:\d+.*$/, '') || 'mykado.store';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 2)   return "à l'instant";
  if (mins  < 60)  return `il y a ${mins}min`;
  if (hours < 24)  return `il y a ${hours}h`;
  if (days  === 1) return 'hier';
  if (days  < 30)  return `il y a ${days}j`;
  if (days  < 365) return `il y a ${Math.floor(days / 30)} mois`;
  return `il y a ${Math.floor(days / 365)} an${Math.floor(days / 365) > 1 ? 's' : ''}`;
}

function CreationRow({ pub, tplLabel, onDelete, onDup, mode = 'mine' }) {
  const navigate  = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef   = useRef(null);

  const isWall  = WALL_TEMPLATES.has(pub.templateName);
  const fallbackBg = TEMPLATE_COLORS[pub.templateName] || 'linear-gradient(135deg,#FFB3C1,#E11D48)';
  const thumbBg = pub.thumbnail
    ? `url(${pub.thumbnail}) center/cover no-repeat`
    : fallbackBg;
  /* SVG dédié comme fallback quand pub.thumbnail est absent. */
  const showTemplateIllu = !isWall && !pub.thumbnail && hasTemplateIllustration(pub.templateName);

  const isDraft = !pub.published;
  const isReceived = mode === 'received';
  const editPath = isWall
    ? `/ewish-admin/wall/${pub._id}`
    : `/ewish-admin/ewish/edit/${pub._id}`;

  // Row 3 URL: show domain/customName (readable slug)
  const displayUrl = pub.customName
    ? `${DISPLAY_DOMAIN}/${pub.customName}`
    : null;

  useEffect(() => {
    if (!menuOpen) return;
    const handle = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [menuOpen]);

  const recipientName = pub.data?.titleName || pub.data?.recipient || pub.title?.split(' ')[0] || pub.title || 'Mur';

  return (
    <div className="crea-row" onClick={() => navigate(editPath)}>

      {/* Thumbnail - plus grande + preview mur non tronquee */}
      {isWall ? (
        <div className="crea-thumb crea-thumb-lg">
          <ScaledWallPreview pub={pub} sizePx={104} />
        </div>
      ) : (
        <div className="crea-thumb crea-thumb-lg" style={{ background: thumbBg, position: 'relative', overflow: 'hidden' }}>
          {showTemplateIllu && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '10%',
            }}>
              <TemplateIllustration name={pub.templateName} />
            </div>
          )}
        </div>
      )}

      {/* Main: 4 stacked rows */}
      <div className="crea-main">

        {/* Row 1  title + status badge */}
        <div className="crea-r1">
          <span className="crea-title">{pub.title || 'Sans titre'}</span>
          <div className="crea-badges">
            {isReceived
              ? <span className="badge badge-wall" style={{ background: '#F1EAFB', color: '#5B3FAA' }}>
                  <Gift size={11} style={{ marginRight: 4 }} /> Reçu
                </span>
              : (isDraft
                  ? <span className="badge badge-draft">Brouillon</span>
                  : <span className="badge badge-live">✓ En ligne</span>)}
            {isWall && <span className="badge badge-wall">Mur</span>}
          </div>
        </div>

        {/* Row 2  template label + shortcode chip */}
        <div className="crea-r2">
          <span className="crea-tpl-name">{tplLabel}</span>
          {pub.shortCode && (
            <span className="crea-code">{pub.shortCode.toUpperCase()}</span>
          )}
        </div>

        {/* Row 3  URL + relative time */}
        {(displayUrl || pub.updatedAt) && (
          <div className="crea-r3">
            {displayUrl && <span className="crea-url">{displayUrl}</span>}
            {displayUrl && pub.updatedAt && <span className="crea-dot">·</span>}
            {pub.updatedAt && <span className="crea-time">{timeAgo(pub.updatedAt)}</span>}
          </div>
        )}

        {/* Row 4  action buttons  les créations reçues n'ont que "Ouvrir".
            Delete/Dup/Dépublier appartiennent au créateur, pas au destinataire. */}
        <div className="crea-r4" onClick={e => e.stopPropagation()}>
          {isReceived ? (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => navigate(editPath)}
              style={{ background: '#7C5CC9' }}
            >
              <Gift size={13} /> Ouvrir mon mur
            </button>
          ) : (
            <>
              {pub.published && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => navigate(`/ewish-admin/share/${pub._id}`)}
                >
                  <Share2 size={13} /> Partager
                </button>
              )}
              <button className="btn-icon" title="Modifier" onClick={() => navigate(editPath)}>
                <Edit2 size={15} />
              </button>
              <div style={{ position: 'relative' }} ref={menuRef}>
                <button className="btn-icon" title="Plus" onClick={() => setMenuOpen(o => !o)}>
                  <MoreHorizontal size={16} />
                </button>
                {menuOpen && (
                  <div className="crea-menu">
                    <button className="sb-item" onClick={() => { setMenuOpen(false); onDup(pub); }}>
                      <Copy size={14} /> Dupliquer
                    </button>
                    {pub.published && (
                      <button
                        className="sb-item"
                        style={{ color: 'var(--mk-butter)' }}
                        onClick={async () => {
                          setMenuOpen(false);
                          if (!confirm('Dépublier cette création ?')) return;
                          await unpublishPublication(pub._id);
                        }}
                      >
                        <X size={14} /> Dépublier
                      </button>
                    )}
                    <button
                      className="sb-item"
                      style={{ color: 'var(--mk-accent)' }}
                      onClick={() => { setMenuOpen(false); onDelete(pub._id); }}
                    >
                      <Trash2 size={14} /> Supprimer
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MyCreations() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [pubs,      setPubs]      = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [type,      setType]      = useState('all');
  const [tplFilter, setTplFilter] = useState('all');
  /* Étape 8 flow murs  tab "reçues" pour voir les murs offerts. */
  const [tab,       setTab]       = useState('mine'); // 'mine' | 'received'
  const [receivedCount, setReceivedCount] = useState(0);
  /* Pagination server-side. Total vient du header X-Total-Count. Toute
     modification de filtre (search/type/tpl/tab) reset la page a 1. */
  const [page,       setPage]       = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const [dupModal,   setDupModal]   = useState(null);
  const [dupTitle,   setDupTitle]   = useState('');
  const [dupError,   setDupError]   = useState('');
  const [dupLoading, setDupLoading] = useState(false);

  const fetchPubs = useCallback(async () => {
    setLoading(true);
    try {
      const params = { limit: PAGE_SIZE, page };
      if (tab === 'received') params.received = 'true';
      else params.mine = 'true';
      if (search.trim())        params.search       = search.trim();
      if (type !== 'all')       params.type         = type;
      if (tplFilter !== 'all')  params.templateName = tplFilter;
      const res = await getPublications(params);
      setPubs(res.data || []);
      const raw = res.headers?.['x-total-count'] ?? res.headers?.['X-Total-Count'];
      const n = parseInt(raw ?? '0', 10);
      setTotalCount(Number.isFinite(n) ? n : 0);
    } catch (_) {}
    setLoading(false);
  }, [tab, page, search, type, tplFilter]);

  useEffect(() => { fetchPubs(); }, [fetchPubs]);

  /* Debounce du champ recherche (300ms). Isole la frappe du fetch pour ne
     pas spammer le serveur ni faire clignoter la liste a chaque touche. */
  useEffect(() => {
    const id = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(id);
  }, [searchInput]);
  useEffect(() => {
    getTemplates().then(r => setTemplates(r.data || [])).catch(() => {});
  }, []);

  /* Compteur des créations reçues  affiché sur l'onglet même quand
     l'utilisateur est sur "Mes créations". Refresh à chaque activation.
     On lit X-Total-Count au lieu de (data.length) pour avoir le vrai total
     (data etait borne a limit=1 donc plafonnait a 1). */
  useEffect(() => {
    getPublications({ received: 'true', limit: 1 })
      .then(r => {
        const raw = r.headers?.['x-total-count'] ?? r.headers?.['X-Total-Count'];
        const n = parseInt(raw ?? '0', 10);
        setReceivedCount(Number.isFinite(n) && n >= 0 ? n : (r.data || []).length);
      })
      .catch(() => {});
  }, [tab]);

  // Build name → label map for human-readable template names in cards
  const tplMap = useMemo(() => {
    const m = {};
    templates.forEach(t => { m[t.name] = t.label || t.name; });
    return m;
  }, [templates]);

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette création définitivement ?')) return;
    await deletePublication(id);
    setPubs(p => p.filter(x => x._id !== id));
    setTotalCount(n => Math.max(0, n - 1));
    /* Ajustement de page :
       - page vide apres suppression + on n'est pas en page 1 -> remonter d'une page (fetch auto)
       - sinon, refetch pour "combler" avec l'element suivant de la BDD */
    if (pubs.length === 1 && page > 1) setPage(p => p - 1);
    else fetchPubs();
  };

  const openDup = (pub) => {
    setDupModal(pub);
    setDupTitle(pub.title + ' (copie)');
    setDupError('');
  };

  const confirmDup = async () => {
    if (!dupTitle.trim()) { setDupError('Titre requis'); return; }
    setDupLoading(true); setDupError('');
    try {
      const slug = dupTitle.trim().toLowerCase()
        .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) + '-' + Date.now();
      const r = await duplicatePublication(dupModal._id, { title: dupTitle.trim(), customName: slug });
      setPubs(p => [r.data, ...p]);
      setDupModal(null);
      navigate(`/ewish-admin/ewish/edit/${r.data._id}`);
    } catch (e) { setDupError(e.response?.data?.error || 'Erreur'); }
    finally { setDupLoading(false); }
  };

  /* Le filtrage (search/type/tpl) est cote serveur maintenant : `pubs` contient
     deja exactement ce qu'il faut afficher pour la page courante. */

  const wishTemplates = templates.filter(t => !WALL_TEMPLATES.has(t.name));
  const wallTemplates = templates.filter(t =>  WALL_TEMPLATES.has(t.name));

  /* Genere une liste compacte de pages a afficher (avec ellipsis) pour la pagination.
     Exemples : total=3 -> [1,2,3] | total=10 current=5 -> [1,'…',4,5,6,'…',10]. */
  const pageItems = (() => {
    const items = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) items.push(i);
      return items;
    }
    const add = (v) => items.push(v);
    add(1);
    if (page > 3) add('…');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) add(i);
    if (page < totalPages - 2) add('…');
    add(totalPages);
    return items;
  })();

  return (
    <div className="page">

      {/* Dup modal */}
      {dupModal && (
        <div className="modal-veil" onMouseDown={e => { if (e.target === e.currentTarget) setDupModal(null); }}>
          <div className="mk-modal">
            <div className="mk-modal-head">
              <div>
                <div className="mk-modal-title">Dupliquer</div>
                <div className="mk-modal-sub">
                  Une copie de «&nbsp;{dupModal.title}&nbsp;» sera créée en brouillon.
                </div>
              </div>
              <button className="btn-icon" onClick={() => setDupModal(null)}><X size={18} /></button>
            </div>
            <div className="mk-modal-body">
              <div className="field">
                <label className="field-label">Nom de la copie</label>
                <input
                  className="mk-input"
                  value={dupTitle}
                  onChange={e => setDupTitle(e.target.value)}
                  autoFocus
                  onKeyDown={e => e.key === 'Enter' && !dupLoading && confirmDup()}
                />
                {dupError && <div className="field-error">{dupError}</div>}
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button className="btn btn-ghost" onClick={() => setDupModal(null)}>Annuler</button>
                <button className="btn btn-primary" onClick={confirmDup} disabled={dupLoading}>
                  {dupLoading ? 'Duplication…' : <><Copy size={14} /> Dupliquer</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="ph">
        <div>
          <h1 className="ph-title">
            {tab === 'received' ? 'Créations reçues' : 'Mes créations'}
          </h1>
          <p className="ph-sub">
            {tab === 'received'
              ? 'Les murs et cadeaux que tes proches ont préparés pour toi.'
              : 'Retrouve, partage ou duplique tout ce que tu as créé.'}
          </p>
        </div>
        {/* {tab === 'mine' && (
          <button className="btn btn-primary" onClick={() => navigate('/ewish-admin/templates')}>
            <Plus size={15} /> Nouvelle
          </button>
        )} */}
      </div>

      {/* Tabs Mine / Received  étape 8 flow murs Nouvelle*/}
      <div /*style={{
        display: 'inline-flex', gap: 4,
        background: '#F4F1F9', padding: 4, borderRadius: 12,
        marginBottom: 18,
      }}*/>
        
        {/* <button
          type="button"
          onClick={() => { setTab('mine'); setPage(1); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 9, border: 'none',
            background: tab === 'mine' ? '#fff' : 'transparent',
            color: tab === 'mine' ? '#2B1A2D' : '#7A748F',
            fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
            cursor: 'pointer',
            boxShadow: tab === 'mine' ? '0 2px 6px -2px rgba(43,26,45,.12)' : 'none',
          }}
        >
          Mes créations
        </button>
        <button
          type="button"
          onClick={() => { setTab('received'); setPage(1); }}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            padding: '9px 16px', borderRadius: 9, border: 'none',
            background: tab === 'received' ? '#fff' : 'transparent',
            color: tab === 'received' ? '#2B1A2D' : '#7A748F',
            fontFamily: 'inherit', fontWeight: 700, fontSize: 13,
            cursor: 'pointer',
            boxShadow: tab === 'received' ? '0 2px 6px -2px rgba(43,26,45,.12)' : 'none',
          }}
        >
          <Inbox size={13} />
          Reçues
          {receivedCount > 0 && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              minWidth: 20, height: 20, padding: '0 6px',
              borderRadius: 999, background: '#7C5CC9', color: '#fff',
              fontSize: 11, fontWeight: 700, marginLeft: 2,
            }}>
              {receivedCount}
            </span>
          )}
        </button> */}
      </div>

      {/* Toolbar */}
      <div className="crea-toolbar">
        <div className="mk-input-wrap" style={{ flex: 1, minWidth: 200 }}>
          <span className="lead"><Search size={15} /></span>
          <input
            className="mk-input"
            placeholder="Rechercher par nom, lien ou code court…"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </div>

        <div className="mk-seg">
          {[
            { value: 'all',  label: 'Tout' },
            { value: 'wish', label: 'Cartes' },
            { value: 'wall', label: 'Murs' },
          ].map(o => (
            <button key={o.value} className={type === o.value ? 'on' : ''} onClick={() => { setType(o.value); setPage(1); }}>
              {o.label}
            </button>
          ))}
        </div>

        <select
          className="mk-select"
          style={{ minWidth: 170 }}
          value={tplFilter}
          onChange={e => { setTplFilter(e.target.value); setPage(1); }}
        >
          {/* <option value="all">Tous les templates</option> */}
          {wishTemplates.length > 0 && (
            <optgroup label="Vœux animés">
              {wishTemplates.map(t => <option key={t.name} value={t.name}>{t.label || t.name}</option>)}
            </optgroup>
          )}
          {wallTemplates.length > 0 && (
            <optgroup label="Murs de mots">
              {wallTemplates.map(t => <option key={t.name} value={t.name}>{t.label || t.name}</option>)}
            </optgroup>
          )}
        </select>
      </div>

      {/* List */}
      {loading && pubs.length === 0 ? (
        <div style={{ padding: '40px 0', textAlign: 'center' }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            border: '2.5px solid var(--mk-line)', borderTopColor: 'var(--mk-accent)',
            animation: 'mk-spin .75s linear infinite', margin: '0 auto',
          }} />
        </div>
      ) : pubs.length === 0 ? (
        <div className="empty-state">
          <div className="e-title">
            {tab === 'received' ? 'Aucun cadeau pour le moment' : 'Rien par ici'}
          </div>
          <p style={{ fontSize: 13 }}>
            {tab === 'received'
              ? 'Quand tes proches créeront un mur pour toi et t\'enverront le lien personnalisé, il apparaîtra ici.'
              : (search
                  ? `Aucune création ne correspond à « ${search} ».`
                  : "Crée ton premier vœu ou ton premier mur depuis l'accueil.")}
          </p>
        </div>
      ) : (
        <>
          <div className="crea-list">
            {pubs.map(pub => (
              <CreationRow
                key={pub._id}
                pub={pub}
                tplLabel={tplMap[pub.templateName] || pub.templateName}
                onDelete={handleDelete}
                onDup={openDup}
                mode={tab}
              />
            ))}
          </div>

          {/* Pagination : cachee si tout tient sur une page */}
          {totalPages > 1 && (
            <nav className="crea-pagination" aria-label="Pagination des créations">
              <span className="crea-pagination-info">
                {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, totalCount)} sur {totalCount}
              </span>
              <div className="crea-pagination-controls">
                <button
                  type="button"
                  className="crea-page-btn"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1 || loading}
                  aria-label="Page précédente"
                >
                  <ChevronLeft size={14} />
                </button>
                {pageItems.map((it, i) => (
                  it === '…'
                    ? <span key={`e-${i}`} className="crea-page-ellipsis">…</span>
                    : (
                      <button
                        key={it}
                        type="button"
                        className={`crea-page-btn ${it === page ? 'on' : ''}`}
                        onClick={() => setPage(it)}
                        disabled={loading}
                        aria-current={it === page ? 'page' : undefined}
                      >
                        {it}
                      </button>
                    )
                ))}
                <button
                  type="button"
                  className="crea-page-btn"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages || loading}
                  aria-label="Page suivante"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
}
