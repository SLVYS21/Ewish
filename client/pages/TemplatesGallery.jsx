import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Eye } from 'lucide-react';
import { getTemplates, createPublication } from '../utils/api';
import styles from './TemplatesGallery.module.css';

const TEMPLATE_EMOJIS = {
  birthday: '🎉',
  special: '✨',
  'collective-family': '💝',
  'collective-pro': '🥂',
  forever: '💐',
  sanctuary: '🕊️',
  'notre-film': '💞',
  'wall-of-wishes': '🌟',
  'wall-of-wishes-3d': '🎊',
};

const TEMPLATE_COLORS = {
  birthday:           'linear-gradient(145deg,#FFB3C1 0%,#FF8DAA 100%)',
  special:            'linear-gradient(145deg,#D7C5F2 0%,#B59CF0 100%)',
  'collective-family':'linear-gradient(145deg,#C9EEDF 0%,#9FE3CB 100%)',
  'collective-pro':   'linear-gradient(145deg,#FFE7AD 0%,#FFC95A 100%)',
  forever:            'linear-gradient(145deg,#EDD5F5 0%,#C9A0E0 100%)',
  sanctuary:          'linear-gradient(145deg,#D7C5F2 0%,#9B7EE2 100%)',
  'notre-film':       'linear-gradient(145deg,#FDBCCA 0%,#E88FA8 100%)',
  'wall-of-wishes':   'linear-gradient(145deg,#FFB3C1 0%,#E11D48 100%)',
  'wall-of-wishes-3d':'linear-gradient(145deg,#FFD7C2 0%,#FF9F7A 100%)',
};

const TEMPLATE_CAT_LABEL = {
  birthday:           'Anniversaire',
  special:            'Occasion spéciale',
  'collective-family':'Famille',
  'collective-pro':   'Pro & RH',
  forever:            'Mariage',
  sanctuary:          'Spirituel',
  'notre-film':       'Couple',
  'wall-of-wishes':   'Mur de vœux',
  'wall-of-wishes-3d':'Mur de vœux',
};

const CATEGORIES = [
  { id: 'all',      label: 'Tous',      emoji: '' },
  { id: 'birthday', label: 'Anniv',     emoji: '🎂' },
  { id: 'love',     label: 'Amour',     emoji: '💍' },
  { id: 'pro',      label: 'Pro / RH',  emoji: '💼' },
  { id: 'special',  label: 'Spécial',   emoji: '✨' },
];

const TEMPLATE_CATEGORY = {
  birthday: 'birthday', forever: 'love', 'notre-film': 'love',
  'collective-pro': 'pro', 'collective-family': 'pro',
  special: 'special', sanctuary: 'special',
  'wall-of-wishes': 'special', 'wall-of-wishes-3d': 'special',
};

export default function TemplatesGallery() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [cat, setCat]             = useState('all');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [creating, setCreating]   = useState('');

  const VITE_API = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    getTemplates().then(r => setTemplates(r.data || [])).finally(() => setLoading(false));
  }, []);

  const filtered = templates.filter(t => {
    const matchSearch = !search ||
      (t.label || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === 'all' || TEMPLATE_CATEGORY[t.name] === cat;
    return matchSearch && matchCat;
  });

  const handleUse = async (e, templateName) => {
    e.stopPropagation();
    if (creating) return;
    setCreating(templateName);
    try {
      const res = await createPublication({ templateName, customName: `draft-${Date.now()}`, title: 'Nouvelle création' });
      navigate(`/ewish-admin/ewish/edit/${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur');
    } finally {
      setCreating('');
    }
  };

  return (
    <div className={styles.root}>

      {/* Preview modal */}
      {previewUrl && (
        <div className={styles.previewOverlay} onClick={() => setPreviewUrl(null)}>
          <div className={styles.previewBox} onClick={e => e.stopPropagation()}>
            <div className={styles.previewHead}>
              <span>Aperçu</span>
              <button onClick={() => setPreviewUrl(null)} className={styles.closeBtn}><X size={18}/></button>
            </div>
            <iframe src={previewUrl} className={styles.previewFrame} title="Aperçu" />
          </div>
        </div>
      )}

      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerHand}>Choisis l'ambiance</div>
        <h1 className={styles.headerTitle}>Galerie de templates</h1>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <Search size={16} className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Cherche une ambiance..."
        />
        {search && (
          <button className={styles.searchClear} onClick={() => setSearch('')}><X size={14}/></button>
        )}
      </div>

      {/* Category pills — horizontally scrollable */}
      <div className={styles.catRow}>
        {CATEGORIES.map(c => {
          const count = c.id === 'all'
            ? templates.length
            : templates.filter(t => TEMPLATE_CATEGORY[t.name] === c.id).length;
          return (
            <button
              key={c.id}
              className={`${styles.catPill} ${cat === c.id ? styles.catPillActive : ''}`}
              onClick={() => setCat(c.id)}
            >
              {c.emoji && <span>{c.emoji}</span>}
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <div className={styles.loadingRow}><div className={styles.spinner}/></div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <span>🔍</span>
          <p>Aucun template trouvé.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(tpl => (
            <div
              key={tpl._id}
              className={styles.card}
              onClick={e => handleUse(e, tpl.name)}
            >
              {/* Thumbnail */}
              <div
                className={styles.cardThumb}
                style={{
                  background: tpl.thumbnail
                    ? `url(${tpl.thumbnail}) center/cover no-repeat`
                    : (TEMPLATE_COLORS[tpl.name] || 'linear-gradient(145deg,#FFB3C1,#E11D48)'),
                }}
              >
                <div className={styles.dotOverlay} />

                {/* Emoji */}
                {!tpl.thumbnail && (
                  <span className={styles.cardEmoji}>{TEMPLATE_EMOJIS[tpl.name] || '🎁'}</span>
                )}

                {/* Badges row */}
                <div className={styles.badgesRow}>
                  {(tpl.popular || tpl.name === 'birthday') && (
                    <span className={styles.popularBadge}>Populaire</span>
                  )}
                  <div style={{ flex: 1 }} />
                  <span className={styles.heartBadge}>
                    💙 {tpl.creditsRequired ?? 1}
                  </span>
                </div>

                {/* Preview eye */}
                <button
                  className={styles.eyeBtn}
                  onClick={e => { e.stopPropagation(); setPreviewUrl(`${VITE_API}/preview/${tpl.name}`); }}
                  title="Aperçu"
                >
                  <Eye size={14} />
                </button>

                {/* Loading overlay */}
                {creating === tpl.name && (
                  <div className={styles.loadingOverlay}>
                    <div className={styles.spinnerSm} />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className={styles.cardInfo}>
                <div className={styles.cardName}>{tpl.label}</div>
                <div className={styles.cardCat}>{tpl.description || TEMPLATE_CAT_LABEL[tpl.name] || tpl.name}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
