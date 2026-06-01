import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Zap } from 'lucide-react';
import { getTemplates, createPublication, getPremadePublications, duplicatePublication } from '../utils/api';
import styles from './TemplatesGallery.module.css';

/* ── Static per-template data ── */
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
const TEMPLATE_PREVIEW = {
  birthday:           { emoji: '🎂', text: 'Joyeux anniversaire\n__  !' },
  'collective-family':{ emoji: '🎉', text: 'Bon anniversaire\n__  !' },
  forever:            { emoji: '💐', text: 'Le grand jour\nde __' },
  special:            { emoji: '✈️', text: 'Bonne route,\n__ !' },
  'collective-pro':   { emoji: '🥂', text: 'Merci pour tout,\n__  !' },
  'notre-film':       { emoji: '💞', text: 'Notre histoire\n__  ❤️' },
  'wall-of-wishes':   { emoji: '🌟', text: 'Dépose ton vœu\npour __  !' },
  'wall-of-wishes-3d':{ emoji: '🎊', text: 'Vœux pour\n__  !' },
  sanctuary:          { emoji: '🕊️', text: 'En mémoire\nde __' },
};
const TEMPLATE_SUBTITLE = {
  birthday:           '« Confetti Rosé »',
  'collective-family':'« Ballons Magiques »',
  forever:            '« Pétales Poudrés »',
  special:            '« Au revoir & Merci »',
  'collective-pro':   '« Équipe & Fêtes »',
  'notre-film':       '« Notre Amour »',
  'wall-of-wishes':   '« Mur de Vœux »',
  'wall-of-wishes-3d':'« Vœux 3D »',
  sanctuary:          '« Lumière & Paix »',
};
const TEMPLATE_CATEGORY = {
  birthday: 'birthday', forever: 'love', 'notre-film': 'love',
  'collective-pro': 'pro', 'collective-family': 'pro',
  special: 'special', sanctuary: 'special',
  'wall-of-wishes': 'special', 'wall-of-wishes-3d': 'special',
};
const CATEGORIES = [
  { id: 'all',      label: 'Tous',     emoji: '' },
  { id: 'birthday', label: 'Anniv',    emoji: '🎂' },
  { id: 'love',     label: 'Amour',    emoji: '💍' },
  { id: 'pro',      label: 'Pro / RH', emoji: '💼' },
  { id: 'special',  label: 'Spécial',  emoji: '✨' },
];

export default function TemplatesGallery() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [premades, setPremades]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [cat, setCat]             = useState('all');
  const [previewUrl, setPreviewUrl] = useState(null);

  /* ── Name modal ── */
  const [nameModal, setNameModal]   = useState(null); // { type:'premade'|'template', data:{} }
  const [nameInput, setNameInput]   = useState('');
  const [nameError, setNameError]   = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const nameRef = useRef(null);

  const VITE_API = import.meta.env.VITE_API_URL || '';

  useEffect(() => {
    Promise.all([getTemplates(), getPremadePublications()])
      .then(([tplRes, premadeRes]) => {
        setTemplates(tplRes.data || []);
        setPremades(premadeRes.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ── Filters ── */
  const filteredPremades = premades.filter(p => {
    const lbl = (p.premadeLabel || p.title || '').toLowerCase();
    const matchSearch = !search || lbl.includes(search.toLowerCase());
    const matchCat = cat === 'all' || TEMPLATE_CATEGORY[p.templateName] === cat;
    return matchSearch && matchCat;
  });
  const filteredTemplates = templates.filter(t => {
    const matchSearch = !search ||
      (t.label || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === 'all' || TEMPLATE_CATEGORY[t.name] === cat;
    return matchSearch && matchCat;
  });

  /* ── Name modal handlers ── */
  const openNameModal = (e, type, data) => {
    e.stopPropagation();
    setNameModal({ type, data });
    setNameInput('');
    setNameError('');
    setTimeout(() => nameRef.current?.focus(), 80);
  };
  const closeNameModal = () => setNameModal(null);

  const confirmCreate = async () => {
    const title = nameInput.trim();
    if (!title) { setNameError('Donne un nom à ta création 👆'); return; }
    setNameLoading(true);
    setNameError('');
    try {
      let pub;
      if (nameModal.type === 'premade') {
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) + '-' + Date.now();
        const res = await duplicatePublication(nameModal.data._id, { title, customName: slug });
        pub = res.data;
      } else {
        const res = await createPublication({
          templateName: nameModal.data.name,
          customName: `draft-${Date.now()}`,
          title,
        });
        pub = res.data;
      }
      navigate(`/ewish-admin/ewish/edit/${pub._id}`);
    } catch (err) {
      setNameError(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setNameLoading(false);
    }
  };

  const isEmpty = filteredPremades.length === 0 && filteredTemplates.length === 0;

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

      {/* Name modal */}
      {nameModal && (
        <div className={styles.nameOverlay} onClick={closeNameModal}>
          <div className={styles.nameBox} onClick={e => e.stopPropagation()}>
            <div className={styles.nameBoxHead}>
              <span className={styles.nameBoxEmoji}>✨</span>
              <h2 className={styles.nameBoxTitle}>Nomme ta création</h2>
              <p className={styles.nameBoxSub}>Pour la retrouver facilement dans ton tableau de bord.</p>
            </div>
            <input
              ref={nameRef}
              className={styles.nameInput}
              value={nameInput}
              onChange={e => { setNameInput(e.target.value); setNameError(''); }}
              onKeyDown={e => e.key === 'Enter' && !nameLoading && confirmCreate()}
              placeholder="ex : Anniversaire de Sarah, Pot de départ Alex…"
            />
            {nameError && <p className={styles.nameError}>{nameError}</p>}
            <div className={styles.nameActions}>
              <button className={styles.nameCancel} onClick={closeNameModal}>Annuler</button>
              <button className={styles.nameConfirm} onClick={confirmCreate} disabled={nameLoading}>
                {nameLoading ? 'Création…' : 'Commencer →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.eyebrow}>
          <Zap size={11} style={{ marginRight: 4 }} />PRÊT-À-OFFRIR · 1MIN
        </div>
        <h1 className={styles.headerTitle}>Éditions prêtes<br/>à offrir</h1>
        <p className={styles.headerSub}>Tout est designé et rédigé. Change le prénom, publie.</p>
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

      {/* Category pills */}
      <div className={styles.catRow}>
        {CATEGORIES.map(c => (
          <button
            key={c.id}
            className={`${styles.catPill} ${cat === c.id ? styles.catPillActive : ''}`}
            onClick={() => setCat(c.id)}
          >
            {c.emoji && <span>{c.emoji}</span>}
            {c.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className={styles.loadingRow}><div className={styles.spinner}/></div>
      ) : isEmpty ? (
        <div className={styles.empty}><span>🔍</span><p>Aucun template trouvé.</p></div>
      ) : (
        <>
          {/* Premade publications section */}
          {filteredPremades.length > 0 && (
            <section className={styles.gallerySection}>
              <div className={styles.gallerySectionHead}>
                <span className={styles.gallerySectionLabel}><Zap size={10}/> Éditions complètes · dupliquer et personnaliser</span>
              </div>
              <div className={styles.grid}>
                {filteredPremades.map(p => (
                  <PremadeCard
                    key={p._id}
                    premade={p}
                    onUse={e => openNameModal(e, 'premade', p)}
                    onPreview={e => { e.stopPropagation(); setPreviewUrl(`${VITE_API}/preview/${p.templateName}`); }}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Base templates section */}
          {filteredTemplates.length > 0 && (
            <section className={styles.gallerySection}>
              {filteredPremades.length > 0 && (
                <div className={styles.gallerySectionHead}>
                  <span className={styles.gallerySectionLabel}>Templates de base · créer de zéro</span>
                </div>
              )}
              <div className={styles.grid}>
                {filteredTemplates.map(tpl => (
                  <TemplateCard
                    key={tpl._id}
                    tpl={tpl}
                    onUse={e => openNameModal(e, 'template', tpl)}
                    onPreview={e => { e.stopPropagation(); setPreviewUrl(`${VITE_API}/preview/${tpl.name}`); }}
                  />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

/* ── Premade card ── */
function PremadeCard({ premade, onUse, onPreview }) {
  const preview  = TEMPLATE_PREVIEW[premade.templateName] || { emoji: '🎁', text: 'Pour\n__ !' };
  const bg       = premade.thumbnail
    ? `url(${premade.thumbnail}) center/cover no-repeat`
    : (TEMPLATE_COLORS[premade.templateName] || 'linear-gradient(145deg,#FFB3C1,#E11D48)');
  const label    = premade.premadeLabel || premade.title || 'Édition prête';
  const subtitle = TEMPLATE_SUBTITLE[premade.templateName] || '';

  return (
    <div className={styles.card} onClick={onUse}>
      <div className={styles.cardThumb} style={{ background: bg }}>
        <div className={styles.dotOverlay} />
        {!premade.thumbnail && (
          <div className={styles.miniCard}>
            <span className={styles.miniEmoji}>{preview.emoji}</span>
            <p className={styles.miniText}>{preview.text}</p>
          </div>
        )}
        <div className={styles.badgesRow}>
          <span className={styles.pretBadge}><Zap size={9}/>PRÊT</span>
          <div style={{ flex: 1 }} />
          <span className={styles.heartBadge}>💙 {premade.creditsRequired ?? 1}</span>
        </div>
        {onPreview && (
          <button className={styles.eyeBtn} onClick={onPreview} title="Aperçu">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        )}
      </div>
      <div className={styles.cardInfo}>
        <div className={styles.cardName}>{label}</div>
        {subtitle && <div className={styles.cardSubtitle}>{subtitle}</div>}
      </div>
    </div>
  );
}

/* ── Base template card (also exported for Dashboard) ── */
export function TemplateCard({ tpl, creating, onUse, onPreview, compact = false }) {
  const preview = TEMPLATE_PREVIEW[tpl.name] || { emoji: '🎁', text: 'Pour\n__ !' };
  const bg      = tpl.thumbnail
    ? `url(${tpl.thumbnail}) center/cover no-repeat`
    : (TEMPLATE_COLORS[tpl.name] || 'linear-gradient(145deg,#FFB3C1,#E11D48)');
  const subtitle = TEMPLATE_SUBTITLE[tpl.name] || '';

  return (
    <div className={`${styles.card} ${compact ? styles.cardCompact : ''}`} onClick={onUse}>
      <div className={styles.cardThumb} style={{ background: bg }}>
        <div className={styles.dotOverlay} />
        {!tpl.thumbnail && (
          <div className={styles.miniCard}>
            <span className={styles.miniEmoji}>{preview.emoji}</span>
            <p className={styles.miniText}>{preview.text}</p>
          </div>
        )}
        <div className={styles.badgesRow}>
          <span className={styles.pretBadge}><Zap size={9}/>PRÊT</span>
          <div style={{ flex: 1 }} />
          <span className={styles.heartBadge}>💙 {tpl.creditsRequired ?? 1}</span>
        </div>
        {onPreview && (
          <button className={styles.eyeBtn} onClick={onPreview} title="Aperçu">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        )}
        {creating && (
          <div className={styles.loadingOverlay}><div className={styles.spinnerSm}/></div>
        )}
      </div>
      <div className={styles.cardInfo}>
        <div className={styles.cardName}>{tpl.label}</div>
        {subtitle && <div className={styles.cardSubtitle}>{subtitle}</div>}
      </div>
    </div>
  );
}
