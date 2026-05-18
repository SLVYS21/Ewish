import { useState, useEffect } from 'react';
import styles from './WishesManager.module.css';
const BACKEND_LINK = import.meta.env.VITE_API_URL;

export default function WishesManager({ publicationId, templateName, customName }) {
  const [wishes, setWishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const isWallOfWishes = templateName === 'wall-of-wishes';
  const isCollective   = templateName?.startsWith('collective');
  const isActive       = isCollective || isWallOfWishes;

  // Wall-of-wishes: the site itself is the collect page
  // Collective: dedicated /collect/ form
  const collectLink = isWallOfWishes
    ? `${BACKEND_LINK}/site/wall-of-wishes/${customName}`
    : `${BACKEND_LINK}/collect/${publicationId}`;

  useEffect(() => {
    if (!publicationId || !isActive) return;
    loadWishes();
  }, [publicationId]);

  const loadWishes = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BACKEND_LINK}/api/wishes/${publicationId}`);
      setWishes(await r.json());
    } catch { setWishes([]); }
    finally { setLoading(false); }
  };

  const toggle = async (wish, field) => {
    try {
      const r = await fetch(`${BACKEND_LINK}/api/wishes/${wish._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [field]: !wish[field] }),
      });
      const updated = await r.json();
      setWishes(w => w.map(x => x._id === updated._id ? updated : x));
    } catch { }
  };

  const deleteWish = async (id) => {
    if (!confirm('Supprimer ce message ?')) return;
    await fetch(`${BACKEND_LINK}/api/wishes/${id}`, { method: 'DELETE' });
    setWishes(w => w.filter(x => x._id !== id));
  };

  const copyLink = () => {
    navigator.clipboard.writeText(collectLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isActive) return null;

  const visible  = wishes.filter(w => w.approved && !w.hidden).length;
  const hidden   = wishes.filter(w => w.hidden).length;
  const pending  = wishes.filter(w => !w.approved).length;

  return (
    <div className={styles.root}>

      {/* Wall-of-wishes info banner */}
      {isWallOfWishes && (
        <div style={{
          background: 'rgba(225,29,72,0.06)', border: '1px solid rgba(225,29,72,0.15)',
          borderRadius: '10px', padding: '10px 14px', marginBottom: '4px',
          fontSize: '0.75rem', color: '#52525b', lineHeight: '1.5',
          display: 'flex', gap: '8px', alignItems: 'flex-start',
        }}>
          <span style={{ fontSize: '1rem', flexShrink: 0 }}>💡</span>
          <span>Les vœux sont publiés <strong style={{ color: '#e11d48' }}>automatiquement</strong> dès qu'ils sont soumis. Tu peux les masquer ou les supprimer ci-dessous.</span>
        </div>
      )}

      {/* Share link */}
      <div className={styles.linkCard}>
        <div className={styles.linkHeader}>
          <span className={styles.linkIcon}>{isWallOfWishes ? '🖼️' : '🔗'}</span>
          <div>
            <div className={styles.linkTitle}>
              {isWallOfWishes ? 'Lien du mur à partager' : 'Lien de collecte'}
            </div>
            <div className={styles.linkSub}>
              {isWallOfWishes
                ? 'Chacun visite cette page pour laisser son message'
                : 'Partage ce lien pour récolter les vœux'}
            </div>
          </div>
        </div>
        <div className={styles.linkRow}>
          <div className={styles.linkUrl}>{collectLink}</div>
          <button className={styles.copyBtn} onClick={copyLink}>
            {copied ? '✓ Copié' : 'Copier'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{wishes.length}</span>
          <span className={styles.statLabel}>Reçus</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statNum} style={{ color: 'var(--green)' }}>{visible}</span>
          <span className={styles.statLabel}>Visibles</span>
        </div>
        {isWallOfWishes ? (
          <div className={styles.stat}>
            <span className={styles.statNum} style={{ color: 'rgba(255,255,255,0.35)' }}>{hidden}</span>
            <span className={styles.statLabel}>Masqués</span>
          </div>
        ) : (
          <div className={styles.stat}>
            <span className={styles.statNum} style={{ color: 'var(--accent)' }}>{pending}</span>
            <span className={styles.statLabel}>En attente</span>
          </div>
        )}
      </div>

      {/* Refresh */}
      <button className={styles.refreshBtn} onClick={loadWishes}>↻ Actualiser</button>

      {/* Wishes list */}
      {loading ? (
        <div className={styles.loading}><div className={styles.spinner} /></div>
      ) : wishes.length === 0 ? (
        <div className={styles.empty}>
          <span>💌</span>
          <p>Aucun message encore.<br />Partagez le lien !</p>
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
                    {new Date(w.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                <div className={styles.wishStatus}>
                  {w.hidden
                    ? <span className={styles.badgeHidden}>Masqué</span>
                    : w.approved
                      ? <span className={styles.badgeApproved}>✓ Visible</span>
                      : <span className={styles.badgePending}>En attente</span>
                  }
                </div>
              </div>
              <p className={styles.wishMessage}>"{w.message}"</p>

              {w.audioUrl && (
                <div style={{ marginTop: '12px', padding: '10px', background: 'var(--surface2)', borderRadius: '10px' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text2)', marginBottom: '6px' }}>🎤 Message vocal</div>
                  <audio controls src={w.audioUrl} style={{ width: '100%', height: '36px', borderRadius: '18px' }}></audio>
                </div>
              )}

              {w.photoUrl && (w.mediaType === 'photo' || w.mediaType === 'gif') && (
                <div style={{ marginTop: '10px' }}>
                  <img src={w.photoUrl} alt="" style={{ width: '100%', maxHeight: '120px', objectFit: 'cover', borderRadius: '8px' }} />
                </div>
              )}

              <div className={styles.wishActions}>
                {/* Approve button only for non-wall-of-wishes (collective flow) */}
                {!isWallOfWishes && (
                  <button
                    className={`${styles.actionBtn} ${w.approved ? styles.actionBtnActive : ''}`}
                    onClick={() => toggle(w, 'approved')}
                    title={w.approved ? 'Retirer l\'approbation' : 'Approuver'}
                  >
                    {w.approved ? '✓ Approuvé' : '+ Approuver'}
                  </button>
                )}
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