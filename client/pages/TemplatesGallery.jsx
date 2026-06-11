import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, X, Zap, Sparkles, Layers, Gift, Lock, ArrowLeft } from 'lucide-react';
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
  'wall-of-wishes':        'linear-gradient(145deg,#FFB3C1 0%,#E11D48 100%)',
  'wall-of-wishes-3d':     'linear-gradient(145deg,#FFD7C2 0%,#FF9F7A 100%)',
  'wall-of-wishes-modern': 'linear-gradient(145deg,#ccc0f5 0%,#e8b0d8 50%,#f5a8be 100%)',
  'wall-of-wishes-space':  'linear-gradient(145deg,#ff8060 0%,#ff4878 60%,#d83070 100%)',
};
const TEMPLATE_PREVIEW = {
  birthday:           { emoji: '🎂', text: 'Joyeux anniversaire\n__  !' },
  'collective-family':{ emoji: '🎉', text: 'Bon anniversaire\n__  !' },
  forever:            { emoji: '💐', text: 'Le grand jour\nde __' },
  special:            { emoji: '✈️', text: 'Bonne route,\n__ !' },
  'collective-pro':   { emoji: '🥂', text: 'Merci pour tout,\n__  !' },
  'notre-film':       { emoji: '💞', text: 'Notre histoire\n__  ❤️' },
  'wall-of-wishes':        { emoji: '🌟', text: 'Dépose ton vœu\npour __  !' },
  'wall-of-wishes-3d':    { emoji: '🎊', text: 'Vœux pour\n__  !' },
  'wall-of-wishes-modern':{ emoji: '💬', text: 'Vœux modernes\npour __  !' },
  'wall-of-wishes-space': { emoji: '🚀', text: 'Explore les vœux\nde __  !' },
  sanctuary:          { emoji: '🕊️', text: 'En mémoire\nde __' },
};
const TEMPLATE_SUBTITLE = {
  birthday:           '« Confetti Rosé »',
  'collective-family':'« Ballons Magiques »',
  forever:            '« Pétales Poudrés »',
  special:            '« Au revoir & Merci »',
  'collective-pro':   '« Équipe & Fêtes »',
  'notre-film':       '« Notre Amour »',
  'wall-of-wishes':        '« Mur de Vœux »',
  'wall-of-wishes-3d':    '« Vœux 3D »',
  'wall-of-wishes-modern':'« Glassmorphisme »',
  'wall-of-wishes-space': '« Carte Spatiale »',
  sanctuary:          '« Lumière & Paix »',
};
const TEMPLATE_CATEGORY = {
  birthday: 'birthday', forever: 'love', 'notre-film': 'love',
  'collective-pro': 'pro', 'collective-family': 'pro',
  special: 'special', sanctuary: 'special',
  'wall-of-wishes': 'wall', 'wall-of-wishes-3d': 'wall',
  'wall-of-wishes-modern': 'wall', 'wall-of-wishes-space': 'wall',
};

const WALL_TEMPLATES = new Set(['wall-of-wishes','wall-of-wishes-3d','wall-of-wishes-modern','wall-of-wishes-space']);

const WALL_DESCS = {
  'wall-of-wishes': 'Les vœux apparaissent comme de petites cartes pastel. Chaleureux et festif.',
  'wall-of-wishes-3d': 'Les vœux flottent en profondeur dans un espace 3D spectaculaire.',
  'wall-of-wishes-modern': 'Glassmorphisme épuré : cartes translucides. Élégant et contemporain.',
  'wall-of-wishes-space': 'Chaque vœu est une étoile dans une galaxie que l\'on explore.',
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
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'wall' ? 'wall' : 'wish';
  const [mode, setMode]           = useState(initialMode);
  const [templates, setTemplates] = useState([]);
  const [premades, setPremades]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [cat, setCat]             = useState('all');
  const [previewUrl, setPreviewUrl] = useState(null);

  const switchMode = (m) => { setMode(m); setCat('all'); setSearch(''); setSearchParams(m === 'wall' ? { mode: 'wall' } : {}, { replace: true }); };

  /* ── Variations sheet ── */
  const [selectedTpl, setSelectedTpl] = useState(null);

  /* ── Wall creation modal ── */
  const [wallModal, setWallModal]         = useState(null); // { tplName, label }
  const [wallRecipient, setWallRecipient] = useState('');
  const [wallTitle, setWallTitle]         = useState('');
  const [wallPrivate, setWallPrivate]     = useState(false);
  const [wallCode, setWallCode]           = useState('');
  const [wallError, setWallError]         = useState('');
  const [wallLoading, setWallLoading]     = useState(false);
  const wallRecipientRef = useRef(null);

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
    const matchMode = mode === 'wall' ? WALL_TEMPLATES.has(p.templateName) : !WALL_TEMPLATES.has(p.templateName);
    return matchSearch && matchCat && matchMode;
  });
  const filteredTemplates = templates.filter(t => {
    const matchSearch = !search ||
      (t.label || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = cat === 'all' || TEMPLATE_CATEGORY[t.name] === cat;
    const matchMode = mode === 'wall' ? WALL_TEMPLATES.has(t.name) : !WALL_TEMPLATES.has(t.name);
    return matchSearch && matchCat && matchMode;
  });

  /* ── Wall creation handlers ── */
  const openWallModal = (item, isTemplate) => {
    const tplName = isTemplate ? item.name : item.templateName;
    const label   = item.label || item.premadeLabel || item.title || tplName;
    setWallModal({ tplName, label });
    setWallRecipient('');
    setWallTitle('');
    setWallPrivate(false);
    setWallCode('');
    setWallError('');
    setTimeout(() => wallRecipientRef.current?.focus(), 80);
  };

  const confirmWall = async () => {
    const recipient = wallRecipient.trim();
    if (!recipient) { setWallError('Indique le prénom ou le nom de la personne 👆'); return; }
    const finalTitle = wallTitle.trim() || `Mur pour ${recipient}`;
    setWallLoading(true);
    setWallError('');
    try {
      const res = await createPublication({
        templateName: wallModal.tplName,
        customName:   `wall-${Date.now()}`,
        title:        finalTitle,
        data: {
          titleName:     recipient,
          eyebrow:       '✦ Mur de vœux',
          subtitle:      'Partagez ce lien — chacun peut laisser son mot.',
          isPrivate:     wallPrivate,
          accessCode:    wallPrivate ? wallCode.trim() : '',
          wishesEnabled: true,
        },
      });
      navigate(`/ewish-admin/ewish/edit/${res.data._id}`);
    } catch (err) {
      setWallError(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setWallLoading(false);
    }
  };

  /* ── Variations sheet handler ── */
  const handleTplClick = (e, tpl) => {
    const tplPremades = premades.filter(p => p.templateName === tpl.name && !WALL_TEMPLATES.has(p.templateName));
    if (tplPremades.length > 0) {
      e.stopPropagation();
      setSelectedTpl(tpl);
    } else {
      openNameModal(e, 'template', tpl);
    }
  };

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

  const wishCategories = CATEGORIES.filter(c => c.id !== 'all' ? c.id !== 'wall' : true);

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

      {/* Wall creation modal */}
      {wallModal && (
        <div className={styles.nameOverlay} onClick={() => setWallModal(null)}>
          <div className={styles.wallBox} onClick={e => e.stopPropagation()}>
            <div className={styles.varSheetHandle} />

            {/* Header */}
            <div className={styles.wallBoxHead}>
              <div
                className={styles.varSheetThumb}
                style={{ background: TEMPLATE_COLORS[wallModal.tplName] || 'linear-gradient(135deg,#9B7EE2,#C9A0E0)' }}
              >
                <span style={{ fontSize: 22 }}>{TEMPLATE_PREVIEW[wallModal.tplName]?.emoji || '🌟'}</span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className={styles.wallBoxTitle}>{wallModal.label}</div>
                <div className={styles.wallBoxSub}>Mur de vœux interactif</div>
              </div>
              <button className={styles.varCloseBtn} onClick={() => setWallModal(null)}><X size={18}/></button>
            </div>

            {/* Form */}
            <div className={styles.wallBoxBody}>
              <div className={styles.wallFieldLabel}>Pour qui ? <span style={{ color: 'var(--mk-rose,#E11D48)' }}>*</span></div>
              <input
                ref={wallRecipientRef}
                className={styles.nameInput}
                value={wallRecipient}
                onChange={e => { setWallRecipient(e.target.value); setWallError(''); }}
                onKeyDown={e => e.key === 'Enter' && !wallLoading && confirmWall()}
                placeholder="ex : Sarah, l'équipe RH, Léa & Karim…"
              />

              <div className={styles.wallFieldLabel} style={{ marginTop: 16 }}>Titre de la publication</div>
              <input
                className={styles.nameInput}
                value={wallTitle}
                onChange={e => setWallTitle(e.target.value)}
                placeholder={wallRecipient.trim() ? `Mur pour ${wallRecipient.trim()}` : 'Mur pour…'}
              />
              <div className={styles.wallFieldHint}>Pour retrouver cette création dans ton tableau de bord.</div>

              {/* Privacy toggle */}
              <div className={styles.wallPrivacyRow}>
                <div>
                  <div className={styles.wallPrivacyLabel}><Lock size={13}/> Mur privé</div>
                  <div className={styles.wallPrivacyHint}>Protège l'accès avec un code secret</div>
                </div>
                <button
                  className={`${styles.toggle} ${wallPrivate ? styles.toggleOn : ''}`}
                  onClick={() => setWallPrivate(p => !p)}
                  type="button"
                >
                  <span className={styles.toggleThumb} />
                </button>
              </div>

              {wallPrivate && (
                <input
                  className={styles.nameInput}
                  style={{ marginTop: 10 }}
                  value={wallCode}
                  onChange={e => setWallCode(e.target.value)}
                  placeholder="Code d'accès (ex : anniv2025)"
                  maxLength={50}
                />
              )}

              {wallError && <p className={styles.nameError}>{wallError}</p>}

              <div className={styles.nameActions}>
                <button className={styles.nameCancel} onClick={() => setWallModal(null)}>Annuler</button>
                <button
                  className={`${styles.nameConfirm} ${styles.nameConfirmWall}`}
                  onClick={confirmWall}
                  disabled={wallLoading}
                >
                  {wallLoading ? 'Création…' : 'Créer le mur →'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variations — full-page overlay (design: "Choisis ta version") */}
      {selectedTpl && (() => {
        const tplPremades = premades.filter(p => p.templateName === selectedTpl.name && !WALL_TEMPLATES.has(p.templateName));
        return (
          <div className={styles.varOverlay}>
            {/* App bar */}
            <div className={styles.varAppbar}>
              <button className={styles.varBackBtn} onClick={() => setSelectedTpl(null)}>
                <ArrowLeft size={18}/>
              </button>
              <span className={styles.varAppbarTitle}>Choisis ta version</span>
            </div>

            <div className={styles.varBody}>
              <div className={styles.varEyebrow}>
                <Zap size={10}/> {(selectedTpl.label || selectedTpl.name).toUpperCase()}
              </div>
              <h1 className={styles.varTitle}>Une déco déjà prête,<br/>ou la tienne ?</h1>
              <p className={styles.varSub}>
                {tplPremades.length} décoration{tplPremades.length > 1 ? 's sont' : ' est'} déjà conçue{tplPremades.length > 1 ? 's' : ''} — touche, c'est créé. Ou pars d'une page blanche en bas à droite.
              </p>

              <div className={styles.varGrid}>
                {tplPremades.map((p, i) => {
                  const bg = p.thumbnail
                    ? `url(${p.thumbnail}) center/cover no-repeat`
                    : (TEMPLATE_COLORS[p.templateName] || 'linear-gradient(145deg,#FFB3C1,#E11D48)');
                  const preview = TEMPLATE_PREVIEW[p.templateName] || { emoji: '🎁', text: 'Pour\n__ !' };
                  return (
                    <button
                      key={p._id}
                      className={styles.varCell}
                      onClick={e => { setSelectedTpl(null); openNameModal(e, 'premade', p); }}
                    >
                      <div className={styles.varCellThumb} style={{ background: bg }}>
                        <div className={styles.dotOverlay} />
                        {!p.thumbnail && (
                          <div className={styles.miniCard}>
                            <span className={styles.miniEmoji}>{preview.emoji}</span>
                            <p className={styles.miniText}>{preview.text}</p>
                          </div>
                        )}
                        {p.creditsRequired > 1 && (
                          <span className={styles.premiumBadge}>PREMIUM</span>
                        )}
                      </div>
                      <div className={styles.varCellLabel}>
                        <span className={styles.varCellNumber}>{String(i + 1).padStart(2, '0')}</span>
                        <span className={styles.varCellName}>{p.premadeLabel || p.title || 'Édition prête'}</span>
                      </div>
                    </button>
                  );
                })}

                {/* Partir de zéro */}
                <button
                  className={`${styles.varCell} ${styles.varCellScratch}`}
                  onClick={e => { const tpl = selectedTpl; setSelectedTpl(null); openNameModal(e, 'template', tpl); }}
                >
                  <div className={styles.varCellThumb}>
                    <span className={styles.scratchPlus}>+</span>
                  </div>
                  <div className={styles.varCellLabel}>
                    <span className={`${styles.varCellNumber} ${styles.varCellNumberScratch}`}>+</span>
                    <span className={`${styles.varCellName} ${styles.varCellNameScratch}`}>Partir de zéro</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

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
        <div className={styles.headerEyebrow}>Choisis l'ambiance</div>
        <h1 className={styles.headerTitle}>La galerie</h1>
        <p className={styles.headerSub}>Choisis un design qui te parle. Chaque template peut être personnalisé en quelques minutes.</p>
      </div>

      {/* Mode switch */}
      <div className={styles.modeSwitch}>
        <button
          className={`${styles.modeSwitchBtn} ${mode === 'wish' ? styles.modeSwitchBtnOn : ''}`}
          onClick={() => switchMode('wish')}
        >
          <Sparkles size={15}/> Vœux animés
        </button>
        <button
          className={`${styles.modeSwitchBtn} ${mode === 'wall' ? `${styles.modeSwitchBtnOn} ${styles.modeSwitchBtnWall}` : ''}`}
          onClick={() => switchMode('wall')}
        >
          <Layers size={15}/> Murs de vœux
        </button>
      </div>

      {mode === 'wall' ? (
        /* ── WALL MODE ── */
        <div style={{ padding: '0 16px' }}>
          <div className={styles.freeBanner}>
            <span className={styles.freeBannerIcon}><Gift size={16}/></span>
            <div><strong>Gratuit jusqu'à 10 vœux.</strong> Au-delà, ajoutez des places avec des crédits.</div>
          </div>

          {loading ? (
            <div className={styles.loadingRow}><div className={styles.spinner}/></div>
          ) : (
            <div className={styles.wallList}>
              {filteredTemplates.map(tpl => {
                const preview = TEMPLATE_PREVIEW[tpl.name] || { emoji: '🌟', text: 'Vœux\npour __ !' };
                const bg = tpl.thumbnail ? `url(${tpl.thumbnail}) center/cover no-repeat` : (TEMPLATE_COLORS[tpl.name] || 'linear-gradient(135deg,#FFB3C1,#E11D48)');
                const desc = WALL_DESCS[tpl.name] || tpl.description || '';
                return (
                  <button key={tpl._id} className={styles.wallCard} onClick={() => openWallModal(tpl, true)}>
                    <div className={styles.wallCardArt} style={{ background: bg }}>
                      {!tpl.thumbnail && <span style={{ fontSize: 28 }}>{preview.emoji}</span>}
                    </div>
                    <div className={styles.wallCardBody}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className={styles.wallCardName}>{tpl.label || tpl.name}</div>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mk-lilac)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                      <div className={styles.wallCardDesc}>{desc}</div>
                    </div>
                  </button>
                );
              })}
              {filteredPremades.map(p => {
                const preview = TEMPLATE_PREVIEW[p.templateName] || { emoji: '🌟', text: 'Vœux\npour __ !' };
                const bg = p.thumbnail ? `url(${p.thumbnail}) center/cover no-repeat` : (TEMPLATE_COLORS[p.templateName] || 'linear-gradient(135deg,#FFB3C1,#E11D48)');
                const desc = WALL_DESCS[p.templateName] || '';
                return (
                  <button key={p._id} className={styles.wallCard} onClick={() => openWallModal(p, false)}>
                    <div className={styles.wallCardArt} style={{ background: bg }}>
                      {!p.thumbnail && <span style={{ fontSize: 28 }}>{preview.emoji}</span>}
                    </div>
                    <div className={styles.wallCardBody}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div className={styles.wallCardName}>{p.premadeLabel || p.title || p.templateName}</div>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--mk-lilac)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </div>
                      <div className={styles.wallCardDesc}>{desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ── WISH MODE ── */
        <>
          {/* Premades banner */}
          {/* {premades.filter(p => !WALL_TEMPLATES.has(p.templateName)).length > 0 && (
            <a href="#premades" className={styles.premadesBanner}>
              <div className={styles.premadesBannerContent}>
                <span className={styles.premadesBannerBadge}><Zap size={10} style={{ marginRight: 3 }}/>PRÊT-À-OFFRIR · 1MIN</span>
                <span className={styles.premadesBannerTitle}>Prêt-à-offrir · publie en 1 min</span>
                <span className={styles.premadesBannerSub}>Des éditions déjà designées et rédigées</span>
              </div>
              <span className={styles.premadesBannerArrow}>→</span>
            </a>
          )} */}

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
            {wishCategories.map(c => (
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

          {loading ? (
            <div className={styles.loadingRow}><div className={styles.spinner}/></div>
          ) : isEmpty ? (
            <div className={styles.empty}><span>🔍</span><p>Aucun template trouvé.</p></div>
          ) : (
            <>
              {filteredTemplates.length > 0 && (
                <section className={styles.gallerySection}>
                  <div className={styles.grid}>
                    {filteredTemplates.map(tpl => (
                      <TemplateCard
                        key={tpl._id}
                        tpl={tpl}
                        onUse={e => handleTplClick(e, tpl)}
                        onPreview={e => { e.stopPropagation(); setPreviewUrl(`${VITE_API}/preview/${tpl.name}`); }}
                      />
                    ))}
                  </div>
                </section>
              )}

              {/* {filteredPremades.length > 0 && (
                <section className={styles.gallerySection} id="premades">
                  <div className={styles.gallerySectionHead}>
                    <span className={styles.eyebrow}><Zap size={10} style={{ marginRight: 4 }}/>PRÊT-À-OFFRIR · 1MIN</span>
                  </div>
                  <div className={styles.premadesSectionTitle}>Éditions prêtes à offrir</div>
                  <div className={styles.premadesSectionSub}>Tout est designé et rédigé. Change le prénom, publie.</div>
                  <div className={styles.grid} style={{ marginTop: 16 }}>
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
              )} */}
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ── Premade card ── */
export function PremadeCard({ premade, onUse, onPreview }) {
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
