import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, X, Trash2, Edit2, ExternalLink, CircleOff, Eye, QrCode, Plus,
  ArrowRight, Sparkles, Copy, Star, MonitorPlay,
} from 'lucide-react';
import {
  getPublications, deletePublication, duplicatePublication, unpublishPublication,
  getTemplates, createPublication, updatePublication,
} from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';
import QRCodeModal from '../components/QRCodeModal';
import styles from './Dashboard.module.css';

const TEMPLATE_EMOJIS = {
  birthday: '🎂', special: '✨', 'collective-family': '💝',
  'collective-pro': '🥂', forever: '💍', sanctuary: '🕊️',
  'notre-film': '🎬', 'wall-of-wishes': '🌟', 'wall-of-wishes-3d': '🎊',
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
};

const QUICK_TONES = {
  rose:   { bg: '#FFE0E6', ring: '#FFB3C1', ink: '#9C1632' },
  lilac:  { bg: '#E5D9F5', ring: '#C8B3F0', ink: '#5C3A9D' },
  mint:   { bg: '#D4F1E5', ring: '#A5DEC8', ink: '#1F6E55' },
  butter: { bg: '#FFE7AD', ring: '#F5CC6E', ink: '#8A5800' },
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pubs, setPubs]         = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dupModal, setDupModal] = useState(null);
  const [dupTitle, setDupTitle] = useState('');
  const [dupSlug, setDupSlug]   = useState('');
  const [dupError, setDupError] = useState('');
  const [dupLoading, setDupLoading] = useState(false);
  const [qrModalPub, setQrModalPub] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const isSuperAdmin = user?.role === 'super_admin';

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
    ]).then(([pubRes, tplRes]) => {
      setPubs(pubRes.data || []);
      setTemplates((tplRes.data || []).slice(0, 4));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreateFromTemplate = async (templateName) => {
    try {
      const res = await createPublication({ templateName, customName: `draft-${Date.now()}`, title: 'Nouvelle création' });
      navigate(`/ewish-admin/ewish/edit/${res.data._id}`);
    } catch (e) { alert(e.response?.data?.error || 'Erreur'); }
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
        <div className={styles.mobileTopActions}>
          <button className={styles.mobileCreditsBtn} onClick={() => navigate('/ewish-admin/credits')}>
            <span>💎</span> {user?.credits ?? 0}
          </button>
        </div>
      </div>

      {/* ── Mobile hero ── */}
      <div className={styles.mobileHero}>
        <h1 className={styles.mobileHeroTitle}>
          Qui fait-on sourire<br/>aujourd'hui ? ✨
        </h1>
        <div className={styles.mobileOccasions}>
          {[
            { e: '🎂', t: 'Anniversaire', c: '#FFE0E6', ink: '#9C1632' },
            { e: '💍', t: 'Mariage',       c: '#EADEF8', ink: '#5C3A9D' },
            { e: '🥂', t: 'Pot de départ', c: '#D4F1E5', ink: '#1F6E55' },
            { e: '✨', t: 'Autre',          c: '#FFF0D6', ink: '#8A5800' },
          ].map((q, i) => (
            <button
              key={i}
              className={styles.mobileOccasionChip}
              style={{ background: q.c }}
              onClick={() => navigate('/ewish-admin/ewish/new')}
            >
              <span className={styles.mobileOccasionEmoji}>{q.e}</span>
              <span className={styles.mobileOccasionLabel} style={{ color: q.ink }}>{q.t}</span>
            </button>
          ))}
        </div>
        <button className={styles.mobileCreateCta} onClick={() => navigate('/ewish-admin/ewish/new')}>
          <span className={styles.mobileCtaIcon}><Plus size={22}/></span>
          <div>
            <div className={styles.mobileCtaTitle}>Créer en 3 minutes</div>
            <div className={styles.mobileCtaSub}>3 questions, on s'occupe du reste</div>
          </div>
          <ArrowRight size={18} style={{ flexShrink: 0 }}/>
        </button>
      </div>

      {/* Preview Modal */}
      {previewUrl && (
        <div className={styles.modalOverlay} onClick={() => setPreviewUrl(null)}>
          <div className={styles.previewModalBox} onClick={e => e.stopPropagation()}>
            <div className={styles.previewModalHeader}>
              <span>Aperçu</span>
              <button onClick={() => setPreviewUrl(null)} className={styles.previewClose}><X size={18}/></button>
            </div>
            <iframe src={previewUrl} className={styles.previewIframe} title="Aperçu" />
          </div>
        </div>
      )}

      {/* Dup Modal */}
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

      {/* ── Hero greeting ── */}
      <div className={styles.hero}>
        <div className={styles.heroGreeting}>
          <span className={styles.heroHand}>{greeting},</span>
          {displayName && <span className={styles.heroName}>{displayName}</span>}
          <span className={styles.heroSparkle}>✨</span>
        </div>
        <p className={styles.heroSub}>
          Qui vas-tu faire sourire aujourd'hui ?
          Choisis un moment, on s'occupe du reste — promis, ça prend 3 minutes.
        </p>

        {/* Quick actions */}
        <div className={styles.quickGrid}>
          {[
            { color: 'rose',   emoji: '🎂', title: 'Un anniversaire',  sub: 'à fêter cette semaine',      to: '/ewish-admin/ewish/new' },
            { color: 'lilac',  emoji: '💍', title: 'Un mariage',        sub: 'avec faire-part + RSVP',     to: '/ewish-admin/templates' },
            { color: 'mint',   emoji: '🥂', title: 'Un pot de départ',  sub: 'le service y mettra du sien', to: '/ewish-admin/templates' },
            { color: 'butter', emoji: '✨', title: 'Autre chose',        sub: 'explorer tous les templates', to: '/ewish-admin/templates' },
          ].map((qa, i) => {
            const t = QUICK_TONES[qa.color];
            return (
              <button
                key={i}
                className={styles.quickAction}
                style={{ background: t.bg }}
                onClick={() => navigate(qa.to)}
                onMouseEnter={e => { e.currentTarget.style.borderColor = t.ring; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 14px 28px ${t.bg}`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div className={styles.quickEmoji}>{qa.emoji}</div>
                <div className={styles.quickTitle} style={{ color: t.ink }}>{qa.title}</div>
                <div className={styles.quickSub} style={{ color: t.ink }}>{qa.sub}</div>
                <ArrowRight size={15} style={{ position: 'absolute', right: 16, top: 18, color: t.ink, opacity: .55 }} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Mobile creation rows ── */}
      <div className={styles.mobileSectionHead}>
        <h2 className={styles.mobileSectionTitle}>Sur mon bureau</h2>
        <Link to="/ewish-admin/ewish" className={styles.mobileSectionLink}>Tout voir →</Link>
      </div>
      {!loading && pubs.slice(0, 3).map(pub => {
        const emoji = TEMPLATE_EMOJIS[pub.templateName] || '🎁';
        const bg = TEMPLATE_COLORS[pub.templateName] || 'linear-gradient(135deg,#FFB3C1,#E11D48)';
        const isDraft = !pub.published;
        const hasCagnotte = pub.cagnotte?.goal > 0;
        return (
          <button
            key={pub._id}
            className={styles.mobileCreationRow}
            onClick={() => navigate(`/ewish-admin/ewish/edit/${pub._id}`)}
          >
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

      {/* ── Sur mon bureau ── */}
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
                <div
                  key={pub._id}
                  className={styles.pubCard}
                  onClick={() => navigate(`/ewish-admin/ewish/edit/${pub._id}`)}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--mk-sh-3)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--mk-sh-1)'; }}
                >
                  {/* Thumb */}
                  <div className={styles.pubThumb} style={{ background: bg }}>
                    <span className={styles.pubEmoji}>{emoji}</span>
                    <span className={`${styles.statusBadge} ${isDraft ? styles.statusDraft : styles.statusLive}`}>
                      <span className={styles.statusDot} style={{ background: isDraft ? '#FFC95A' : '#6BCFAF', boxShadow: isDraft ? 'none' : '0 0 0 3px rgba(107,207,175,.3)', animation: isDraft ? 'none' : 'mk-pulse-soft 2s infinite' }}/>
                      {isDraft ? 'BROUILLON' : 'EN LIGNE'}
                    </span>
                    {pub.published && pub.shortCode && (
                      <button
                        className={styles.qrBtn}
                        onClick={e => { e.stopPropagation(); setQrModalPub(pub); }}
                      ><QrCode size={13}/></button>
                    )}
                  </div>
                  {/* Body */}
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
                        <div style={{ fontSize: 10.5, color: 'var(--mk-ink-3)', marginTop: 4 }}>
                          {pub.cagnotte.collected?.toLocaleString('fr-FR')} / {pub.cagnotte.goal?.toLocaleString('fr-FR')} FCFA
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Actions */}
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
                    <button className={styles.actBtn} title="Dupliquer" onClick={e => openDupModal(pub, e)}>
                      <Copy size={13}/>
                    </button>
                    <button className={styles.actBtn} title="Éditer" onClick={() => navigate(`/ewish-admin/ewish/edit/${pub._id}`)}>
                      <Edit2 size={13}/>
                    </button>
                    {pub.published && (pub.merchantId === user?.merchantId || isSuperAdmin) && (
                      <button className={styles.actBtn} title="Dépublier" onClick={e => handleUnpublish(pub._id, e)}>
                        <CircleOff size={13} color="#ef4444"/>
                      </button>
                    )}
                    {(pub.merchantId === user?.merchantId || isSuperAdmin) && (
                      <button className={`${styles.actBtn} ${styles.actBtnDanger}`} title="Supprimer" onClick={e => handleDelete(pub._id, e)}>
                        <Trash2 size={13}/>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {/* New creation card */}
            <button
              className={styles.newCard}
              onClick={() => navigate('/ewish-admin/ewish/new')}
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

      {/* ── Pour toi ── */}
      {templates.length > 0 && (
        <section className={styles.section} style={{ paddingBottom: 80 }}>
          <header className={styles.sectionHead}>
            <div>
              <div className={styles.eyebrow}>POUR TOI</div>
              <h2 className={styles.sectionTitle}>Et si on essayait…</h2>
              <p className={styles.sectionSub}>Petites idées selon tes derniers choix.</p>
            </div>
            <Link to="/ewish-admin/templates" className={styles.sectionAction}>
              Voir tous les templates <ArrowRight size={14}/>
            </Link>
          </header>
          <div className={styles.tplGrid}>
            {templates.map(tpl => (
              <button
                key={tpl._id}
                className={styles.tplCard}
                onClick={() => handleCreateFromTemplate(tpl.name)}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--mk-sh-3)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div className={styles.tplThumb} style={{ background: TEMPLATE_COLORS[tpl.name] || 'linear-gradient(135deg,#FFB3C1,#E11D48)' }}>
                  <span className={styles.tplEmoji}>{TEMPLATE_EMOJIS[tpl.name] || '🎁'}</span>
                  <span className={styles.tplCredit}>💎 {tpl.creditsRequired}</span>
                </div>
                <div className={styles.tplBody}>
                  <div className={styles.tplName}>{tpl.label}</div>
                  <div className={styles.tplDesc}>{tpl.description}</div>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
