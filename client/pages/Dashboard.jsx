import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, X, Trash2, Edit2, ExternalLink, CircleOff, Eye, QrCode, Plus,
  ArrowRight, Sparkles, Copy, Star, Zap, Layers,
} from 'lucide-react';
import {
  getPublications, deletePublication, duplicatePublication, unpublishPublication,
  getTemplates, createPublication, updatePublication, getPremadePublications,
} from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';
import QRCodeModal from '../components/QRCodeModal';
import { TemplateCard, PremadeCard } from './TemplatesGallery';
import styles from './Dashboard.module.css';

const TEMPLATE_EMOJIS = {
  birthday: '🎂', special: '✨', 'collective-family': '💝',
  'collective-pro': '🥂', forever: '💍', sanctuary: '🕊️',
  'notre-film': '🎬', 'wall-of-wishes': '🌟', 'wall-of-wishes-3d': '🎊',
  'wall-of-wishes-modern': '💬', 'wall-of-wishes-space': '🚀',
};
const TEMPLATE_COLORS = {
  birthday: 'linear-gradient(135deg,#FFB3C1,#FF8DAA)',
  special: 'linear-gradient(135deg,#D7C5F2,#B59CF0)',
  'collective-family': 'linear-gradient(135deg,#C9EEDF,#9FE3CB)',
  'collective-pro': 'linear-gradient(135deg,#FFE7AD,#FFC95A)',
  forever: 'linear-gradient(135deg,#F8C8DC,#E8B0CC)',
  sanctuary: 'linear-gradient(135deg,#D7C5F2,#9B7EE2)',
  'notre-film': 'linear-gradient(135deg,#C2D5F0,#8FB0D8)',
  'wall-of-wishes': 'linear-gradient(135deg,#FFB3C1,#E11D48)',
  'wall-of-wishes-3d': 'linear-gradient(135deg,#FFD7C2,#FF9F7A)',
  'wall-of-wishes-modern': 'linear-gradient(135deg,#ccc0f5,#e8b0d8)',
  'wall-of-wishes-space': 'linear-gradient(135deg,#ff8060,#d83070)',
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pubs, setPubs]             = useState([]);
  const [templates, setTemplates]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [dupModal, setDupModal]     = useState(null);
  const [dupTitle, setDupTitle]     = useState('');
  const [dupSlug, setDupSlug]       = useState('');
  const [dupError, setDupError]     = useState('');
  const [dupLoading, setDupLoading] = useState(false);
  const [qrModalPub, setQrModalPub] = useState(null);
  const [creating, setCreating]     = useState('');
  const [premades, setPremades]     = useState([]);
  const isSuperAdmin = user?.role === 'super_admin';

  const [nameModal, setNameModal]     = useState(null);
  const [nameInput, setNameInput]     = useState('');
  const [nameError, setNameError]     = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const nameRef = useRef(null);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bel après-midi';
    return 'Bonsoir';
  }, []);

  const VITE_API = import.meta.env.VITE_API_URL || '';
  const displayName = user?.name || '';

  useEffect(() => {
    Promise.all([
      getPublications({ mine: 'true', limit: 8 }),
      getTemplates(),
      getPremadePublications(),
    ]).then(([pubRes, tplRes, premadeRes]) => {
      setPubs(pubRes.data || []);
      setTemplates((tplRes.data || []).slice(0, 4));
      setPremades(premadeRes.data || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreateFromTemplate = (templateName) => {
    if (creating) return;
    setNameModal({ type: 'template', data: { name: templateName } });
    setNameInput(''); setNameError('');
    setTimeout(() => nameRef.current?.focus(), 80);
  };

  const handleUsePremade = (premade) => {
    setNameModal({ type: 'premade', data: premade });
    setNameInput(''); setNameError('');
    setTimeout(() => nameRef.current?.focus(), 80);
  };

  const confirmCreate = async () => {
    const title = nameInput.trim();
    if (!title) { setNameError('Donne un nom à ta création 👆'); return; }
    setNameLoading(true); setNameError('');
    try {
      let pub;
      if (nameModal.type === 'premade') {
        const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) + '-' + Date.now();
        const res = await duplicatePublication(nameModal.data._id, { title, customName: slug });
        pub = res.data;
      } else {
        const res = await createPublication({ templateName: nameModal.data.name, customName: `draft-${Date.now()}`, title });
        pub = res.data;
      }
      setNameModal(null);
      navigate(`/ewish-admin/ewish/edit/${pub._id}`);
    } catch (e) { setNameError(e.response?.data?.error || 'Erreur'); }
    finally { setNameLoading(false); }
  };

  const openDupModal = (pub, e) => {
    e.stopPropagation();
    setDupModal(pub); setDupTitle(pub.title + ' (copie)');
    setDupSlug(pub.customName + '-copie'); setDupError('');
  };
  const closeDupModal = () => { setDupModal(null); setDupTitle(''); setDupSlug(''); setDupError(''); };
  const handleDuplicate = async () => {
    if (!dupTitle.trim() || !dupSlug.trim()) { setDupError('Titre et nom requis'); return; }
    setDupLoading(true); setDupError('');
    try {
      const r = await duplicatePublication(dupModal._id, { title: dupTitle.trim(), customName: dupSlug.trim() });
      setPubs(p => [r.data, ...p]); closeDupModal();
      navigate(`/ewish-admin/ewish/edit/${r.data._id}`);
    } catch (e) { setDupError(e.response?.data?.error || 'Erreur'); }
    finally { setDupLoading(false); }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Supprimer cette création ?')) return;
    await deletePublication(id);
    setPubs(p => p.filter(x => x._id !== id));
  };

  const handleUnpublish = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Dépublier ?')) return;
    await unpublishPublication(id);
    setPubs(p => p.map(x => x._id === id ? { ...x, published: false } : x));
  };

  const handleTogglePremade = async (id, val, e) => {
    e.stopPropagation();
    try {
      await updatePublication(id, { isPremade: val });
      setPubs(prev => prev.map(p => p._id === id ? { ...p, isPremade: val } : p));
    } catch (err) { alert(err.response?.data?.error || 'Erreur'); }
  };

  return (
    <div className={styles.root}>
      {/* ── Modals ── */}
      {dupModal && (
        <div className={styles.modalOverlay} onClick={closeDupModal}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalIcon}>📋</span>
              <h2>Dupliquer la création</h2>
              <p>Template <strong>{dupModal.templateName}</strong> conservé.</p>
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Titre</label>
              <input className={styles.modalInput} value={dupTitle} onChange={e => setDupTitle(e.target.value)} autoFocus />
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Nom dans l'URL</label>
              <div className={styles.modalSlugWrap}>
                <span className={styles.modalSlugPre}>/{dupModal.templateName}/</span>
                <input className={styles.modalSlugInput} value={dupSlug} onChange={e => setDupSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} />
              </div>
            </div>
            {dupError && <p className={styles.modalError}>{dupError}</p>}
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={closeDupModal}>Annuler</button>
              <button className={styles.modalConfirm} onClick={handleDuplicate} disabled={dupLoading}>
                {dupLoading ? '⏳ Duplication…' : <><Copy size={14}/> Dupliquer</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {qrModalPub?.shortCode && (
        <QRCodeModal url={`${VITE_API}/s/${qrModalPub.shortCode}`} onClose={() => setQrModalPub(null)} />
      )}

      {nameModal && (
        <div className={styles.modalOverlay} onClick={() => setNameModal(null)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span className={styles.modalIcon}>✨</span>
              <h2>Nomme ta création</h2>
              <p>Pour la retrouver facilement dans ton tableau de bord.</p>
            </div>
            <div className={styles.modalField}>
              <label className={styles.modalLabel}>Titre</label>
              <input
                ref={nameRef}
                className={styles.modalInput}
                value={nameInput}
                onChange={e => { setNameInput(e.target.value); setNameError(''); }}
                onKeyDown={e => e.key === 'Enter' && !nameLoading && confirmCreate()}
                placeholder="ex : Anniversaire de Sarah, Pot de départ Alex…"
                autoFocus
              />
            </div>
            {nameError && <p className={styles.modalError}>{nameError}</p>}
            <div className={styles.modalActions}>
              <button className={styles.modalCancel} onClick={() => setNameModal(null)}>Annuler</button>
              <button className={styles.modalConfirm} onClick={confirmCreate} disabled={nameLoading}>
                {nameLoading ? '⏳ Création…' : 'Commencer →'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Desktop topbar ── */}
      <header className={styles.homeTopbar}>
        <button className={styles.homeTopbarBell} title="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className={styles.homeTopbarDot} />
        </button>
        <button className={styles.homeTopbarCredits} onClick={() => navigate('/ewish-admin/credits')}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          <span>{user?.credits ?? 0}</span>
        </button>
      </header>

      {/* ── Mobile top bar ── */}
      <div className={styles.mobileTopBar}>
        <div className={styles.mobileUserRow}>
          <div className={styles.mobileAvatar} style={{ background: '#FFE0E6', color: '#9C1632' }}>
            {(displayName[0] || 'A').toUpperCase()}
          </div>
          <div>
            <div className={styles.mobileGreeting}>{greeting},</div>
            <div className={styles.mobileName}>{displayName || 'Utilisateur'}</div>
          </div>
        </div>
        <button className={styles.mobileCreditsBtn} onClick={() => navigate('/ewish-admin/credits')}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
          {user?.credits ?? 0}
        </button>
      </div>

      {/* ── Desktop hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroGreeting}>
          <span className={styles.heroHand}>{greeting},</span>
          {displayName && <span className={styles.heroName}>{displayName}</span>}
        </div>
        <p className={styles.heroSub}>Qui vas-tu faire sourire aujourd'hui ?</p>

        {/* Two pillars */}
        <div className={styles.pillarsGrid}>
          <button className={`${styles.pillar} ${styles.pillarWish}`} onClick={() => navigate('/ewish-admin/templates?mode=wish')}>
            <div className={styles.pillarArt}>
              <span className={styles.pillarEmoji}>🎂</span>
            </div>
            <div className={styles.pillarBody}>
              <div className={styles.pillarKicker}><Sparkles size={11}/> VŒU ANIMÉ</div>
              <div className={styles.pillarTitle}>Une carte qui prend vie</div>
              <div className={styles.pillarSub}>Choisissez un modèle, personnalisez, partagez.</div>
            </div>
            <span className={styles.pillarGo}><ArrowRight size={16}/></span>
          </button>

          <button className={`${styles.pillar} ${styles.pillarWall}`} onClick={() => navigate('/ewish-admin/templates?mode=wall')}>
            <div className={styles.pillarArt} style={{ background: 'linear-gradient(135deg,#E5D9F5,#C5A9E8)' }}>
              <span className={styles.pillarEmoji}>🌟</span>
            </div>
            <div className={styles.pillarBody}>
              <div className={styles.pillarKicker} style={{ color: 'var(--mk-lilac)' }}><Layers size={11}/> MUR DE VŒUX</div>
              <div className={styles.pillarTitle}>Un mur que chacun remplit</div>
              <div className={styles.pillarSub}>Chacun dépose son mot · gratuit jusqu'à 10 vœux.</div>
            </div>
            <span className={`${styles.pillarGo} ${styles.pillarGoLilac}`}><ArrowRight size={16}/></span>
          </button>
        </div>
      </div>

      {/* ── Mobile hero ── */}
      <div className={styles.mobileHero}>
        <div className={styles.mobileHand}>Qui fait-on sourire ?</div>
        <h1 className={styles.mobileHeroTitle}>Créez un moment<br/>inoubliable</h1>

        <div className={styles.mobilePillars}>
          <button className={`${styles.mobilePillar} ${styles.mobilePillarWish}`} onClick={() => navigate('/ewish-admin/templates?mode=wish')}>
            <div className={styles.mobilePillarThumb}>
              <span style={{ fontSize: 28, filter: 'drop-shadow(0 3px 8px rgba(0,0,0,.18))' }}>🎂</span>
            </div>
            <div className={styles.mobilePillarBody}>
              <div className={styles.mobilePillarKicker}><Sparkles size={10}/> VŒU ANIMÉ</div>
              <div className={styles.mobilePillarTitle}>Une carte qui prend vie</div>
              <div className={styles.mobilePillarSub}>Choisis un modèle, personnalise, partage.</div>
            </div>
            <span className={styles.mobilePillarGo}><ArrowRight size={15}/></span>
          </button>

          <button className={`${styles.mobilePillar} ${styles.mobilePillarWall}`} onClick={() => navigate('/ewish-admin/templates?mode=wall')}>
            <div className={styles.mobilePillarThumb} style={{ background: 'linear-gradient(135deg,#E5D9F5,#C5A9E8)' }}>
              <span style={{ fontSize: 28, filter: 'drop-shadow(0 3px 8px rgba(0,0,0,.18))' }}>✦</span>
            </div>
            <div className={styles.mobilePillarBody}>
              <div className={styles.mobilePillarKicker} style={{ color: 'var(--mk-lilac)' }}><Layers size={10}/> MUR DE VŒUX</div>
              <div className={styles.mobilePillarTitle}>Un mur que chacun remplit</div>
              <div className={styles.mobilePillarSub}>Chacun dépose son mot · gratuit jusqu'à 10 vœux.</div>
            </div>
            <span className={`${styles.mobilePillarGo} ${styles.mobilePillarGoLilac}`}><ArrowRight size={15}/></span>
          </button>
        </div>
      </div>

      {/* ── Mobile: mes créations ── */}
      <div className={styles.mobileSectionHead}>
        <div>
          <div className={styles.eyebrow}>MES CRÉATIONS</div>
          <h2 className={styles.mobileSectionTitle}>Sur mon bureau</h2>
        </div>
        <Link to="/ewish-admin/ewish" className={styles.mobileSectionLink}>Tout voir →</Link>
      </div>
      {!loading && pubs.slice(0, 3).map(pub => {
        const emoji = TEMPLATE_EMOJIS[pub.templateName] || '🎁';
        const bg = TEMPLATE_COLORS[pub.templateName] || 'linear-gradient(135deg,#FFB3C1,#E11D48)';
        const isDraft = !pub.published;
        const hasCagnotte = pub.cagnotte?.goal > 0;
        return (
          <button key={pub._id} className={styles.mobileCreationRow} onClick={() => navigate(`/ewish-admin/ewish/edit/${pub._id}`)}>
            <span className={styles.mobileRowThumb} style={{ background: bg }}>
              <span className={styles.mobileRowEmoji}>{emoji}</span>
            </span>
            <div className={styles.mobileRowBody}>
              <div className={styles.mobileRowTitle}>{pub.title || pub.data?.name || 'Sans titre'}</div>
              {hasCagnotte ? (
                <div>
                  <div className={styles.mobileRowCagnotteBar}>
                    <div className={styles.mobileRowCagnotteFill} style={{ width: Math.min(100, pub.cagnotte.collected / pub.cagnotte.goal * 100) + '%' }}/>
                  </div>
                  <div className={styles.mobileRowCagnotteLabel}>🎁 {pub.cagnotte.name || 'Cagnotte'} · {Math.round(pub.cagnotte.collected / pub.cagnotte.goal * 100)}%</div>
                </div>
              ) : (
                <div className={styles.mobileRowSub}>{pub.templateName}</div>
              )}
            </div>
            <div className={styles.mobileRowStatus}>
              <span className={`${styles.mobileStatusBadge} ${isDraft ? styles.mobileStatusDraft : styles.mobileStatusLive}`}>
                <span className={styles.mobileStatusDot} style={{ background: isDraft ? '#FFC95A' : '#6BCFAF' }}/>
                {isDraft ? 'BROUILLON' : 'EN LIGNE'}
              </span>
            </div>
          </button>
        );
      })}

      {/* ── Mobile: Prêt-à-offrir ── */}
      {/* {premades.length > 0 && (
        <div className={styles.mobilePretSection}>
          <div className={styles.mobilePretHead}>
            <div className={styles.mobilePretTitle}>
              <Zap size={12} style={{ color: 'var(--mk-rose)' }} />
              PRÊT-À-OFFRIR · 1MIN
            </div>
            <Link to="/ewish-admin/templates#premades" className={styles.mobileSectionLink}>Tout voir →</Link>
          </div>
          <h3 className={styles.mobilePretSubtitle}>Déjà tout prêt, change le prénom</h3>
          <div className={styles.mobilePretRow}>
            {premades.map(p => (
              <div key={p._id} className={styles.mobilePretCardWrap}>
                <PremadeCard premade={p} onUse={() => handleUsePremade(p)} />
              </div>
            ))}
          </div>
        </div>
      )} */}

      {/* ── Mobile: Templates ── */}
      {templates.length > 0 && (
        <div className={styles.mobilePretSection}>
          <div className={styles.mobilePretHead}>
            <div className={styles.mobilePretTitle} style={{ color: 'var(--mk-lilac)' }}>POUR TOI</div>
            <Link to="/ewish-admin/templates" className={styles.mobileSectionLink}>Tout voir →</Link>
          </div>
          <h3 className={styles.mobilePretSubtitle}>Si on essayait…</h3>
          <div className={styles.mobilePretRow}>
            {templates.map(tpl => (
              <div key={tpl._id} className={styles.mobilePretCardWrap}>
                <TemplateCard tpl={tpl} creating={creating === tpl.name} onUse={e => { e.stopPropagation(); handleCreateFromTemplate(tpl.name); }} compact={true} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Desktop: Prêt-à-offrir ── */}
      {/* {premades.length > 0 && (
        <section className={styles.section}>
          <header className={styles.sectionHead}>
            <div>
              <div className={styles.eyebrow}><Zap size={10} style={{ marginRight: 4, verticalAlign: -1 }}/>PRÊT-À-OFFRIR · 1MIN</div>
              <h2 className={styles.sectionTitle}>Déjà tout prêt, change le prénom</h2>
            </div>
            <Link to="/ewish-admin/templates#premades" className={styles.sectionAction}>
              Tout voir <ArrowRight size={14}/>
            </Link>
          </header>
          <div className={styles.tplGrid}>
            {premades.map(p => (
              <PremadeCard key={p._id} premade={p} onUse={() => handleUsePremade(p)} />
            ))}
          </div>
        </section>
      )} */}

      {/* ── Desktop: Sur mon bureau ── */}
      <section className={styles.section}>
        <header className={styles.sectionHead}>
          <div>
            <div className={styles.eyebrow}>MES CRÉATIONS</div>
            <h2 className={styles.sectionTitle}>Sur mon bureau</h2>
            <p className={styles.sectionSub}>Reprends là où tu t'es arrêté(e).</p>
          </div>
          <Link to="/ewish-admin/ewish" className={styles.sectionAction}>
            Toutes mes créations <ArrowRight size={14}/>
          </Link>
        </header>

        {loading ? (
          <div className={styles.loadingRow}><div className={styles.spinner}/></div>
        ) : (
          <div className={styles.cardGrid}>
            {pubs.map(pub => {
              const emoji = TEMPLATE_EMOJIS[pub.templateName] || '🎁';
              const bg = TEMPLATE_COLORS[pub.templateName] || 'linear-gradient(135deg,#FFB3C1,#E11D48)';
              const isDraft = !pub.published;
              const hasCagnotte = pub.cagnotte?.goal > 0;
              return (
                <div key={pub._id} className={styles.pubCard}
                  onClick={() => navigate(`/ewish-admin/ewish/edit/${pub._id}`)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--mk-sh-3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--mk-sh-1)'; }}
                >
                  <div className={styles.pubThumb} style={{ background: bg }}>
                    <span className={styles.pubEmoji}>{emoji}</span>
                    <span className={`${styles.statusBadge} ${isDraft ? styles.statusDraft : styles.statusLive}`}>
                      <span className={styles.statusDot} style={{ background: isDraft ? '#FFC95A' : '#6BCFAF', boxShadow: isDraft ? 'none' : '0 0 0 3px rgba(107,207,175,.3)', animation: isDraft ? 'none' : 'mk-pulse-soft 2s infinite' }}/>
                      {isDraft ? 'BROUILLON' : 'EN LIGNE'}
                    </span>
                    {pub.published && pub.shortCode && (
                      <button className={styles.qrBtn} onClick={e => { e.stopPropagation(); setQrModalPub(pub); }}><QrCode size={13}/></button>
                    )}
                  </div>
                  <div className={styles.pubBody}>
                    <h3 className={styles.pubTitle}>{pub.title || pub.data?.name || 'Sans titre'}</h3>
                    <div className={styles.pubMeta}>
                      <span>{new Date(pub.updatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                      {pub.published && pub.views != null && (
                        <><span>·</span><span><Eye size={11} style={{ verticalAlign: -1, marginRight: 3 }}/>{pub.views || 0}</span></>
                      )}
                    </div>
                    {hasCagnotte && (
                      <div className={styles.cagnotteBar}>
                        <div className={styles.cagnotteBarHead}>
                          <span style={{ color: 'var(--mk-lilac)', fontWeight: 700 }}>🎁 {pub.cagnotte.name || 'Cagnotte'}</span>
                          <span style={{ color: 'var(--mk-ink-2)', fontWeight: 700 }}>{Math.round(pub.cagnotte.collected / pub.cagnotte.goal * 100)}%</span>
                        </div>
                        <div className={styles.cagnotteTrack}>
                          <div className={styles.cagnotteFill} style={{ width: Math.min(100, pub.cagnotte.collected / pub.cagnotte.goal * 100) + '%' }}/>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className={styles.pubActions} onClick={e => e.stopPropagation()}>
                    {pub.published && (
                      <a href={`${VITE_API}/site/${pub.templateName}/${pub.customName}`} target="_blank" rel="noreferrer" className={styles.actBtn} title="Voir en ligne">
                        <ExternalLink size={13}/>
                      </a>
                    )}
                    {isSuperAdmin && (
                      <button className={styles.actBtn} title="Modèle" onClick={e => handleTogglePremade(pub._id, !pub.isPremade, e)}>
                        <Star size={13} fill={pub.isPremade ? "#E11D48" : "none"} color={pub.isPremade ? "#E11D48" : "currentColor"}/>
                      </button>
                    )}
                    <button className={styles.actBtn} title="Dupliquer" onClick={e => openDupModal(pub, e)}><Copy size={13}/></button>
                    <button className={styles.actBtn} title="Éditer" onClick={() => navigate(`/ewish-admin/ewish/edit/${pub._id}`)}><Edit2 size={13}/></button>
                    {pub.published && (pub.merchantId === user?.merchantId || isSuperAdmin) && (
                      <button className={styles.actBtn} title="Dépublier" onClick={e => handleUnpublish(pub._id, e)}><CircleOff size={13} color="#ef4444"/></button>
                    )}
                    {(pub.merchantId === user?.merchantId || isSuperAdmin) && (
                      <button className={`${styles.actBtn} ${styles.actBtnDanger}`} title="Supprimer" onClick={e => handleDelete(pub._id, e)}><Trash2 size={13}/></button>
                    )}
                  </div>
                </div>
              );
            })}

            <button className={styles.newCard} onClick={() => navigate('/ewish-admin/ewish/new')}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--mk-blush)'; e.currentTarget.style.borderColor = 'var(--mk-rose-soft)'; e.currentTarget.style.color = 'var(--mk-rose)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--mk-line-strong)'; e.currentTarget.style.color = 'var(--mk-ink-2)'; }}
            >
              <div className={styles.newCardIcon}><Plus size={26}/></div>
              <div className={styles.newCardTitle}>Nouvelle création</div>
              <div className={styles.newCardSub}>Choisir un template ou démarrer rapide</div>
            </button>
          </div>
        )}
      </section>

      {/* ── Desktop: Pour toi ── */}
      {templates.length > 0 && (
        <section className={styles.section} style={{ paddingBottom: 80 }}>
          <header className={styles.sectionHead}>
            <div>
              <div className={styles.eyebrow}>POUR TOI</div>
              <h2 className={styles.sectionTitle}>Si on essayait…</h2>
            </div>
            <Link to="/ewish-admin/templates" className={styles.sectionAction}>
              Voir tous les templates <ArrowRight size={14}/>
            </Link>
          </header>
          <div className={styles.tplGrid}>
            {templates.map(tpl => (
              <TemplateCard key={tpl._id} tpl={tpl} creating={creating === tpl.name} onUse={e => { e.stopPropagation(); handleCreateFromTemplate(tpl.name); }} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
