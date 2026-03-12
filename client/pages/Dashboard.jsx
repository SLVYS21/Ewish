import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getPublications, deletePublication } from '../utils/api';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const [pubs, setPubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getPublications()
      .then(r => setPubs(r.data))
      .catch(() => setPubs([]))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Delete this wish?')) return;
    await deletePublication(id);
    setPubs(p => p.filter(x => x._id !== id));
  };

  return (
    <div className={styles.root}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🎂</span>
          <span className={styles.logoText}>eWishWell</span>
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
          <span className={styles.badge}>{pubs.length}</span>
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
                  <span>🎂</span>
                  {pub.published && <span className={styles.publishedBadge}>Live</span>}
                </div>
                <div className={styles.cardBody}>
                  <h3>{pub.title || pub.data?.name || 'Untitled'}</h3>
                  <p className={styles.cardMeta}>
                    /{pub.templateName}/{pub.customName}
                  </p>
                  <p className={styles.cardDate}>
                    {new Date(pub.updatedAt).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' })}
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
                  <button className={styles.btnIcon} onClick={() => navigate(`/ewish-admin/ewish/edit/${pub._id}`)}>✏️</button>
                  <button className={`${styles.btnIcon} ${styles.btnDanger}`} onClick={e => handleDelete(pub._id, e)}>🗑</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}