import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublications, deletePublication, duplicatePublication, unpublishPublication } from '../utils/api'
import styles from './Dashboard.module.css';

const LIMIT = 20;

export default function Dashboard() {
  const [pubs, setPubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const navigate = useNavigate();

  const [dupModal,  setDupModal]  = useState(null);
  const [dupTitle,  setDupTitle]  = useState('');
  const [dupSlug,   setDupSlug]   = useState('');
  const [dupError,  setDupError]  = useState('');
  const [dupLoading,setDupLoading]= useState(false);

  const searchTimer = useRef(null);

  const fetchPubs = useCallback((p, s) => {
    setLoading(true);
    getPublications({ page: p, limit: LIMIT, search: s || undefined })
      .then(r => {
        setPubs(r.data);
        setHasNext(r.data.length === LIMIT);
      })
      .catch(() => { setPubs([]); setHasNext(false); })
      .finally(() => setLoading(false));
  }, []);

  // Initial load
  useEffect(() => { fetchPubs(1, ''); }, [fetchPubs]);

  // Debounced search
  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => fetchPubs(1, val), 350);
  };

  const goToPage = (p) => {
    setPage(p);
    fetchPubs(p, search);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this wish?')) return;
    await deletePublication(id);
    fetchPubs(page, search);
  };

  const openDupModal = (pub, e) => {
    e.stopPropagation();
    setDupModal(pub);
    setDupTitle(pub.title + ' (copie)');
    setDupSlug(pub.customName + '-copie');
    setDupError('');
  };
 
  const closeDupModal = () => {
    setDupModal(null); setDupTitle(''); setDupSlug(''); setDupError('');
  };
 
  const handleDuplicate = async () => {
    if (!dupTitle.trim() || !dupSlug.trim()) { setDupError('Titre et nom requis'); return; }
    setDupLoading(true); setDupError('');
    try {
      const r = await duplicatePublication(dupModal._id, { title: dupTitle.trim(), customName: dupSlug.trim() });
      setPubs(p => [r.data, ...p]);
      closeDupModal();
      navigate(`/ewish-admin/ewish/edit/${r.data._id}`);
    } catch (e) {
      setDupError(e.response?.data?.error || 'Erreur lors de la duplication');
    } finally { setDupLoading(false); }
  };

  const handleUnpublish = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Dépublier cette publication ? Elle ne sera plus accessible en ligne.')) return;
    await unpublishPublication(id);
    setPubs(p => p.map(x => x._id === id ? { ...x, published: false } : x));
    fetchPubs(page, search);
  };
 
  const TEMPLATE_ICONS = {
    birthday: '🎂', special: '🔍', 'collective-family': '👨‍👩‍👧', 'collective-pro': '🏢',
    forever: '♥', sanctuary: '✦', 'notre-film': '🎬',
  };

  return (
    <div className={styles.root}>

      {/* -Duplication modal */}
      {dupModal && (
        <div className={styles.modalOverlay} onClick={closeDupModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalIcon}>⎘</span>
              <h2>Dupliquer la publication</h2>
              <p>Le template <strong>{dupModal.templateName}</strong> sera conservé avec toutes ses données.</p>
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Titre</label>
              <input
                className={styles.modalInput}
                value={dupTitle}
                onChange={e => setDupTitle(e.target.value)}
                placeholder="ex: Anniversaire Sophie"
                autoFocus
              />
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Nom dans l'URL</label>
              <div className={styles.modalSlugWrap}>
                <span className={styles.modalSlugPre}>/{dupModal.templateName}/</span>
                <input
                  className={styles.modalSlugInput}
                  value={dupSlug}
                  onChange={e => setDupSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  placeholder="mon-nom"
                />
              </div>
            </div>
            {dupError && <p className={styles.modalError}>{dupError}</p>}
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={closeDupModal}>Annuler</button>
              <button className={styles.modalConfirm} onClick={handleDuplicate} disabled={dupLoading}>
                {dupLoading ? '⏳ Duplication…' : '⎘ Dupliquer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎂</span>
          <span className={styles.logoText}>myKado</span>
        </div>
        <Link to="/ewish-admin/ewish/new" className={styles.btnPrimary}>
          <span>+</span> New Wish
        </Link>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <h1>Create magical<br /><span>birthday wishes</span></h1>
        <p>Animated, personalized, unforgettable.</p>
        <Link to="/ewish-admin/ewish/new" className={styles.heroCta}>Get started →</Link>
      </section>

      {/* My Wishes */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>My Wishes</h2>
          <span className={styles.badge}>{pubs.length}{hasNext ? '+' : ''}</span>
        </div>

        {/* Search bar */}
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Rechercher par titre, nom, destinataire…"
            value={search}
            onChange={handleSearchChange}
          />
          {search && (
            <button className={styles.searchClear} onClick={() => { setSearch(''); setPage(1); fetchPubs(1, ''); }}>✕</button>
          )}
        </div>

        {loading ? (
          <div className={styles.empty}>
            <div className={styles.spinner} />
          </div>
        ) : pubs.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>✨</span>
            <p>No wishes yet — create your first one!</p>
            <Link to="/ewish-admin/ewish/new" className={styles.btnPrimary}>Create a wish</Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {pubs.map(pub => (
              <div key={pub._id} className={styles.card} onClick={() => navigate(`/ewish-admin/ewish/edit/${pub._id}`)}>
                <div className={styles.cardThumb}>
                  <span>{TEMPLATE_ICONS[pub.templateName] || '✨'}</span>
                  {pub.published && <span className={styles.publishedBadge}>Live</span>}
                </div>
                <div className={styles.cardBody}>
                  <h3>{pub.title || pub.data?.name || 'Untitled'}</h3>
                  <p className={styles.cardMeta}>
                    {pub.shortCode
                      ? <span
                          className={styles.shortLink}
                          title="Copier le lien court"
                          onClick={e => {
                            e.stopPropagation();
                            const origin = import.meta.env.VITE_API_URL || window.location.origin;
                            navigator.clipboard.writeText(`${origin}/s/${pub.shortCode}`);
                            e.currentTarget.textContent = '✓ Copié!';
                            setTimeout(() => e.currentTarget.textContent = `/s/${pub.shortCode} 📋`, 1500);
                          }}
                        >/s/{pub.shortCode} 📋</span>
                      : `/${pub.templateName}/${pub.customName}`
                    }
                  </p>
                  <p className={styles.cardDate}>
                    {new Date(pub.updatedAt).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })}
                    {new Date(pub.updatedAt).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })}
                    {pub.views > 0 && (
                      <span className={styles.viewCount} title="Vues">
                        · 👁 {pub.views.toLocaleString('fr-FR')}
                      </span>
                    )}
                  </p>
                </div>
                <div className={styles.cardActions}>
                  {pub.published && (
                    <a
                      href={`${import.meta.env.VITE_API_URL || ''}/site/${pub.templateName}/${pub.customName}`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={e => e.stopPropagation()}
                      className={styles.btnIcon}
                      title="View live"
                    >↗</a>
                  )}
                  {pub.published && (
                    <button
                      className={styles.btnIcon}
                      title="Dépublier"
                      onClick={e => handleUnpublish(pub._id, e)}
                    >🔴</button>
                  )}
                  <button
                    className={styles.btnIcon}
                    title="Dupliquer"
                    onClick={e => openDupModal(pub, e)}
                  >⎘</button>
                  <button className={styles.btnIcon} onClick={() => navigate(`/ewish-admin/ewish/edit/${pub._id}`)}>✏️</button>
                  <button className={`${styles.btnIcon} ${styles.btnDanger}`} onClick={e => handleDelete(pub._id, e)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(page > 1 || hasNext) && (
          <div className={styles.pagination}>
            <button
              className={styles.pageBtn}
              disabled={page === 1 || loading}
              onClick={() => goToPage(page - 1)}
            >
              ← Précédente
            </button>
            <span className={styles.pageInfo}>Page {page}</span>
            <button
              className={styles.pageBtn}
              disabled={!hasNext || loading}
              onClick={() => goToPage(page + 1)}
            >
              Suivante →
            </button>
          </div>
        )}
      </section>
    </div>
  );
}