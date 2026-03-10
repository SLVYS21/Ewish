import { useState, useEffect } from 'react';
import styles from './WishesManager.module.css';
const BACKEND_LINK = 'http://localhost:5000'; //http://localhost:3000/collect/69ade570ab269a9ece198141

export default function WishesManager({ publicationId, templateName }) {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [collectLink, setCollectLink] = useState('');

  const isCollective = templateName?.startsWith('collective');

  useEffect(() => {
    if (!publicationId || !isCollective) return;
    setCollectLink(`${BACKEND_LINK}/collect/${publicationId}`);
    loadWishes();
  }, [publicationId]);

  const loadWishes = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/wishes/${publicationId}`);
      setWishes(await r.json());
    } catch { setWishes([]); }
    finally { setLoading(false); }
  };

  const toggle = async (wish, field) => {
    try {
      const r = await fetch(`/api/wishes/${wish._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !wish[field] }),
      });
      const updated = await r.json();
      setWishes(w => w.map(x => x._id === updated._id ? updated : x));
    } catch {}
  };

  const deleteWish = async (id) => {
    if (!confirm('Supprimer ce message ?')) return;
    await fetch(`/api/wishes/${id}`, { method: 'DELETE' });
    setWishes(w => w.filter(x => x._id !== id));
  };

  const copyLink = () => {
    navigator.clipboard.writeText(collectLink);
  };

  if (!isCollective) return null;

  const approved = wishes.filter(w => w.approved && !w.hidden).length;
  const pending  = wishes.filter(w => !w.approved).length;

  return (
    <div className={styles.root}>
      {/* Collect link */}
      <div className={styles.linkCard}>
        <div className={styles.linkHeader}>
          <span className={styles.linkIcon}>🔗</span>
          <div>
            <div className={styles.linkTitle}>Lien de collecte</div>
            <div className={styles.linkSub}>Partage ce lien pour récolter les vœux</div>
          </div>
        </div>
        <div className={styles.linkRow}>
          <div className={styles.linkUrl}>{collectLink}</div>
          <button className={styles.copyBtn} onClick={copyLink}>Copier</button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{wishes.length}</span>
          <span className={styles.statLabel}>Reçus</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum} style={{color:'var(--green)'}}>{approved}</span>
          <span className={styles.statLabel}>Approuvés</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum} style={{color:'var(--accent)'}}>{pending}</span>
          <span className={styles.statLabel}>En attente</span>
        </div>
      </div>

      {/* Refresh */}
      <button className={styles.refreshBtn} onClick={loadWishes}>↻ Actualiser</button>

      {/* Wishes list */}
      {loading ? (
        <div className={styles.loading}><div className={styles.spinner}/></div>
      ) : wishes.length === 0 ? (
        <div className={styles.empty}>
          <span>💌</span>
          <p>Aucun message encore.<br/>Partagez le lien de collecte !</p>
        </div>
      ) : (
        <div className={styles.list}>
          {wishes.map(w => (
            <div key={w._id} className={`${styles.wishCard} ${w.approved && !w.hidden ? styles.wishApproved : ''} ${w.hidden ? styles.wishHidden : ''}`}>
              <div className={styles.wishHeader}>
                <div className={styles.wishAvatar}>
                  {w.photoUrl
                    ? <img src={w.photoUrl} alt="" />
                    : w.firstName.charAt(0).toUpperCase()
                  }
                </div>
                <div className={styles.wishMeta}>
                  <div className={styles.wishName}>{w.firstName}</div>
                  {w.role && <div className={styles.wishRole}>{w.role}</div>}
                  <div className={styles.wishDate}>
                    {new Date(w.createdAt).toLocaleDateString('fr-FR', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' })}
                  </div>
                </div>
                <div className={styles.wishStatus}>
                  {w.approved && !w.hidden
                    ? <span className={styles.badgeApproved}>✓ Visible</span>
                    : w.hidden
                    ? <span className={styles.badgeHidden}>Masqué</span>
                    : <span className={styles.badgePending}>En attente</span>
                  }
                </div>
              </div>
              <p className={styles.wishMessage}>"{w.message}"</p>
              <div className={styles.wishActions}>
                <button
                  className={`${styles.actionBtn} ${w.approved ? styles.actionBtnActive : ''}`}
                  onClick={() => toggle(w, 'approved')}
                  title={w.approved ? 'Retirer l\'approbation' : 'Approuver'}
                >
                  {w.approved ? '✓ Approuvé' : '+ Approuver'}
                </button>
                <button
                  className={`${styles.actionBtn} ${w.hidden ? styles.actionBtnWarn : ''}`}
                  onClick={() => toggle(w, 'hidden')}
                  title={w.hidden ? 'Afficher' : 'Masquer'}
                >
                  {w.hidden ? '👁 Afficher' : '🙈 Masquer'}
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                  onClick={() => deleteWish(w._id)}
                  title="Supprimer"
                >🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}