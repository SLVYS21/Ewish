import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, X, MoreHorizontal, Wallet, ChevronDown,
} from 'lucide-react';
import { getPublications, getTemplates } from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';
import Kado from '../components/Kado';
import ConfettiBurst from '../components/ConfettiBurst';
import TileSparkles from '../components/TileSparkles';
import NotoEmoji from '../components/NotoEmoji';
import WallCreateSheet from '../components/WallCreateSheet';
import { WallActivityPreview, WallThemePreview } from '../components/WallPreviews';
import s from './Dashboard.module.css';

/* Template thumbnails — reused across recent + featured */
const TEMPLATE_GRADIENTS = {
  birthday:                'linear-gradient(135deg,#FFB3C1,#FF8DAA)',
  special:                 'linear-gradient(135deg,#D7C5F2,#B59CF0)',
  'collective-family':     'linear-gradient(135deg,#C9EEDF,#9FE3CB)',
  'collective-pro':        'linear-gradient(135deg,#FFE7AD,#FFC95A)',
  forever:                 'linear-gradient(135deg,#F8C8DC,#E8B0CC)',
  sanctuary:               'linear-gradient(135deg,#D7C5F2,#9B7EE2)',
  'notre-film':            'linear-gradient(135deg,#C2D5F0,#8FB0D8)',
  'wall-of-wishes':        'linear-gradient(135deg,#FFB3C0,#FF5470)',
  'wall-of-wishes-3d':     'linear-gradient(135deg,#FFD7C2,#FF9F7A)',
  'wall-of-wishes-modern': 'linear-gradient(135deg,#ccc0f5,#e8b0d8)',
  'wall-of-wishes-space':  'linear-gradient(135deg,#ff8060,#d83070)',
};

const WALL_TEMPLATES = new Set([
  'wall-of-wishes', 'wall-of-wishes-3d', 'wall-of-wishes-modern', 'wall-of-wishes-space',
]);

/* ── SVG waving hand icon (remplace l'emoji 👋) ── */
function WavingHand({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <path
        d="M7.5 14.5V8.2c0-.7.6-1.2 1.3-1.2s1.2.5 1.2 1.2v4.3M10 12.5V5.8c0-.7.6-1.3 1.3-1.3s1.2.6 1.2 1.3v6.7M12.5 12.5V6.8c0-.7.6-1.3 1.3-1.3s1.2.6 1.2 1.3v6M15 12.5V9.3c0-.7.6-1.3 1.3-1.3s1.2.6 1.2 1.3v7.9c0 3.5-2.8 6.3-6.3 6.3-2.4 0-4.5-1.3-5.6-3.3l-2.3-4.2c-.4-.7-.1-1.6.7-1.9.6-.2 1.3.1 1.6.7l1.4 2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


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
  return `il y a ${Math.floor(days / 30)} mois`;
}

/* ── Recent creation tile ── */
function RecentTile({ pub }) {
  const navigate = useNavigate();
  const isWall   = WALL_TEMPLATES.has(pub.templateName);
  const editPath = isWall
    ? `/ewish-admin/wall/${pub._id}`
    : `/ewish-admin/ewish/edit/${pub._id}`;

  const thumbBg = pub.thumbnail
    ? { backgroundImage: `url(${pub.thumbnail})` }
    : null;

  const fallbackGradient = TEMPLATE_GRADIENTS[pub.templateName]
    || 'linear-gradient(135deg,#FFB3C1,#E11D48)';

  // Pour les murs : on affiche le nom du destinataire centré
  const recipientName = pub.data?.titleName || pub.data?.recipient || pub.title?.split(' ')[0] || pub.title || 'Sans titre';

  return (
    <button className={s.recentCard} onClick={() => navigate(editPath)}>
      <div className={s.recentThumb} style={{ background: fallbackGradient }}>
        {isWall ? (
          <WallActivityPreview pub={pub} style={{ width: '100%', height: '100%' }} />
        ) : (
          <>
            {thumbBg && <div className={s.recentThumbImg} style={thumbBg} />}
          </>
        )}
        
        <span className={`${s.recentBadge} ${pub.published ? s.recentBadgeLive : s.recentBadgeDraft}`}>
          {pub.published ? 'EN LIGNE' : 'BROUILLON'}
        </span>
      </div>
      <div className={s.recentTitle}>{pub.title || 'Sans titre'}</div>
      <div className={s.recentFor}>
        {pub.updatedAt ? timeAgo(pub.updatedAt) : (pub.customName ? `${DISPLAY_DOMAIN}/${pub.customName}` : '')}
      </div>
    </button>
  );
}

/* ── Featured theme card ── */
function ThemeTile({ tpl, onSelect }) {
  const isWall = WALL_TEMPLATES.has(tpl.name);
  const gradient = TEMPLATE_GRADIENTS[tpl.name] || 'linear-gradient(135deg,#FFB3C1,#E11D48)';
  const thumb = tpl.thumbnail ? { backgroundImage: `url(${tpl.thumbnail})` } : null;
  
  if (isWall) {
    return (
      <button className={s.themeCardWall} onClick={() => onSelect(tpl)}>
        <div style={{ position: 'relative', aspectRatio: '1.14', background: gradient, overflow: 'hidden' }}>
          {thumb && <div className={s.themeThumbImg} style={thumb} />}
        </div>
        <div style={{ padding: '11px 12px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px' }}>{tpl.label || tpl.name}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ font: '800 10px Inter, sans-serif', background: '#EDE7FF', color: '#5B6994', padding: '3px 8px', borderRadius: '999px' }}>
              {tpl.creditsRequired ?? 1} crédit{(tpl.creditsRequired ?? 1) > 1 ? 's' : ''}
            </span>
            <span style={{ font: '700 11px Inter, sans-serif', color: '#9F6D22' }}>Aperçu ›</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button className={s.themeCard} style={{ background: gradient }} onClick={() => onSelect(tpl)}>
      {thumb && <div className={s.themeThumbImg} style={thumb} />}
      <span className={s.themeLabel}>{tpl.label || tpl.name}</span>
    </button>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Dashboard
   ══════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [pubs,      setPubs]      = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [themesTab, setThemesTab] = useState('walls'); // 'walls' | 'cards'
  const [announceOpen, setAnnounceOpen] = useState(true);
  const [promoOpen, setPromoOpen] = useState(true);

  /* Name modal (création carte) */
  const [nameModal,   setNameModal]   = useState(null);
  const [nameInput,   setNameInput]   = useState('');
  const [nameError,   setNameError]   = useState('');
  const [nameLoading, setNameLoading] = useState(false);
  const nameRef = useRef(null);

  /* Wall create sheet */
  const [wallSheetOpen, setWallSheetOpen] = useState(false);

  const firstName = (user?.name || '').split(' ')[0] || 'ami';

  useEffect(() => {
    getPublications({ mine: 'true', limit: 8 })
      .then(r => setPubs(r.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    getTemplates().then(r => setTemplates(r.data || [])).catch(() => {});
  }, []);

  const featuredThemes = useMemo(() => {
    if (themesTab === 'walls') {
      return templates.filter(t => WALL_TEMPLATES.has(t.name)).slice(0, 4);
    }
    return templates.filter(t => !WALL_TEMPLATES.has(t.name)).slice(0, 4);
  }, [templates, themesTab]);

  const openNameModal = () => {
    setNameModal({});
    setNameInput(''); setNameError('');
    setTimeout(() => nameRef.current?.focus(), 80);
  };

  const confirmCreate = async () => {
    const title = nameInput.trim();
    if (!title) { setNameError('Donne un nom à ta création'); return; }
    setNameLoading(true); setNameError('');
    try {
      /* Redirige vers la galerie carte avec le titre pré-rempli */
      setNameModal(null);
      navigate(`/ewish-admin/templates?mode=wish&title=${encodeURIComponent(title)}`);
    } catch (e) { setNameError(e.response?.data?.error || 'Erreur'); }
    finally { setNameLoading(false); }
  };

  const goToTheme = (tpl) => {
    const isWall = WALL_TEMPLATES.has(tpl.name);
    navigate(`/ewish-admin/templates?mode=${isWall ? 'wall' : 'wish'}`);
  };

  return (
    <div className={s.wrap}>

      {/* ══ Indigo Hero ════════════════════════════════════════════ */}
      <div className={s.indigoHero}>
        <div className={s.heroTop}>
          <div className={s.heroEyebrow}>
            {`${new Date().toLocaleDateString('fr-FR', { weekday: 'long' })} ${new Date().getDate()} ${new Date().toLocaleDateString('fr-FR', { month: 'long' })} • RAVI DE TE REVOIR`.toUpperCase()}
          </div>
          <button className={s.heroCredits} onClick={() => navigate('/ewish-admin/credits')}>
            <Wallet size={14} />
            {user?.credits ?? 0} crédits
          </button>
        </div>
        
        <div className={s.heroContent}>
          <div className={s.heroTitle}>Bonsoir, {firstName}</div>
          <div className={s.heroSub}>Célèbre les gens qui comptent — une carte animée, un mur collectif, un cadeau.</div>
        </div>
        
        {/* Decorative elements */}
        <div className={s.heroCircle1}></div>
        <div className={s.heroDot}></div>
      </div>

      {/* ══ What are we creating? ════════════════════════════════ */}
      <div className={s.section} id="tour-create" style={{ marginTop: '16px' }}>
        <div className={s.sectionTitle} style={{ fontSize: '20px', fontFamily: '"Fraunces", serif', fontWeight: 400, color: '#161311', marginBottom: '8px' }}>Qu'est-ce qu'on crée ?</div>
        <div className={s.quickGrid}>
          <button className={s.cardMain} onClick={openNameModal}>
            <div className={s.cardMainBg}></div>
            <NotoEmoji name="love-letter" size={46} className={s.cardIconAnim} />
            <div className={s.cardMainText}>
              <div className={s.cardMainTitle}>Créer une carte</div>
              <div className={s.cardMainSub}>Une expérience animée à envoyer<br/>en solo.</div>
            </div>
          </button>
          
          <button className={s.cardWall} onClick={() => setWallSheetOpen(true)}>
            <NotoEmoji name="speech-balloon" size={42} className={s.cardIconAnimAlt} />
            <div className={s.cardSecondaryText}>
              <div className={s.cardSecondaryTitle}>Un mur</div>
              <div className={s.cardSecondarySub}>À plusieurs mains</div>
            </div>
          </button>
          
          <button className={s.cardGift} onClick={() => navigate('/ewish-admin/templates')}>
            <NotoEmoji name="gift" size={42} className={s.cardIconAnimAlt2} />
            <div className={s.cardSecondaryText}>
              <div className={s.cardSecondaryTitle}>Un cadeau</div>
              <div className={s.cardSecondarySub}>Offrir un présent</div>
            </div>
          </button>
        </div>
      </div>

      {/* ══ Recent ════════════════════════════════════════════════ */}
      {loading && (
        <div className={s.loading}><div className={s.spinner} /></div>
      )}

      {!loading && pubs.length > 0 && (
        <div className={s.section} id="tour-recent">
          <div className={s.sectionHead}>
            <div className={s.sectionTitle} style={{ fontSize: '20px', fontFamily: '"Fraunces", serif', fontWeight: 400, color: '#161311' }}>Récents</div>
            <button className={s.seeAll} onClick={() => navigate('/ewish-admin/ewish')}>
              Tout voir
            </button>
          </div>
          <div className={s.recentScroll}>
            {pubs.slice(0, 6).map((pub, idx) => (
              <RecentTile key={pub._id} pub={pub} index={idx} />
            ))}
            {pubs.length > 6 && (
              <button
                className={s.recentSeeAll}
                onClick={() => navigate('/ewish-admin/ewish')}
                aria-label="Tout voir"
              >
                <span className={s.recentSeeAllIcon}>
                  <ArrowRight size={20} />
                </span>
                <span className={s.recentSeeAllLabel}>Tout voir</span>
                <span className={s.recentSeeAllSub}>Toutes tes créations</span>
              </button>
            )}
          </div>
        </div>
      )}

      {!loading && pubs.length === 0 && (
        <div className={s.empty}>
          <NotoEmoji name="sparkles" size={64} style={{ marginBottom: 12 }} />
          <div className={s.emptyTitle}>Rien encore par ici</div>
          <p className={s.emptySub}>Crée ta première carte ou ton premier mur depuis les actions ci-dessus.</p>
        </div>
      )}

      {/* ══ Promo card ════════════════════════════════════════════ */}
      {/* {promoOpen && (
        <div className={s.promo} onClick={() => navigate('/ewish-admin/templates')}>
          <button
            className={s.promoClose}
            onClick={(e) => { e.stopPropagation(); setPromoOpen(false); }}
            aria-label="Fermer"
          >
            <X size={16} />
          </button>
          <div className={s.promoEyebrow}>Nouveau</div>
          <div className={s.promoTitle}>Ton flux d'activité est en ligne</div>
        </div>
      )} */}

      {/* ══ Featured themes ═══════════════════════════════════════ */}
      {templates.length > 0 && (
        <div className={s.section} id="tour-themes">
          <div className={s.themesHead}>
            <div className={s.sectionTitle}>Thèmes en vedette</div>
            <button className={s.seeAll} onClick={() => navigate('/ewish-admin/templates')}>
              Tout voir
            </button>
          </div>
          <div className={s.tabs}>
            <button
              className={`${s.tab} ${themesTab === 'walls' ? s.tabActive : ''}`}
              onClick={() => setThemesTab('walls')}
            >
              Murs
            </button>
            <button
              className={`${s.tab} ${themesTab === 'cards' ? s.tabActive : ''}`}
              onClick={() => setThemesTab('cards')}
            >
              Cartes
            </button>
          </div>
          <div className={s.themesScroll}>
            {featuredThemes.map(tpl => (
              <ThemeTile key={tpl.name} tpl={tpl} onSelect={goToTheme} />
            ))}
          </div>
        </div>
      )}

      {/* ══ Discover more ═════════════════════════════════════════ */}
      <div className={s.discoverHead}>
        <div className={s.discoverTitle}>Découvre d'autres façons d'utiliser myKado</div>
      </div>
      <div className={s.discoverCta} onClick={() => navigate('/ewish-admin/templates')}>
        <div className={s.discoverCtaTitle}>Cadeaux d'entreprise, touche personnelle</div>
        <div className={s.discoverCtaSub}>
          Simplifie tes cadeaux pro : catalogue mondial, options personnalisées, et une reconnaissance qui marque tes équipes.
        </div>
      </div>

      {/* ══ Wall create sheet ═════════════════════════════════════ */}
      <WallCreateSheet
        open={wallSheetOpen}
        onClose={() => setWallSheetOpen(false)}
        onCreated={(pub) => {
          setWallSheetOpen(false);
          navigate(`/ewish-admin/wall/${pub._id}`);
        }}
      />

      {/* ══ Name modal ════════════════════════════════════════════ */}
      {nameModal && (
        <div className={s.modalVeil} onMouseDown={e => { if (e.target === e.currentTarget) setNameModal(null); }}>
          <div className={s.modal}>
            <div className={s.modalHead}>
              <div>
                <div className={s.modalTitle}>Qui est le destinataire ?</div>
                <div className={s.modalSub}>Pour la retrouver facilement.</div>
              </div>
              <button className={s.modalClose} onClick={() => setNameModal(null)}>
                <X size={18} />
              </button>
            </div>
            <div className={s.modalField}>
              <label className={s.modalLabel}>Titre</label>
              <input
                ref={nameRef}
                className={s.modalInput}
                value={nameInput}
                onChange={e => { setNameInput(e.target.value); setNameError(''); }}
                onKeyDown={e => e.key === 'Enter' && !nameLoading && confirmCreate()}
                placeholder="ex : Anniversaire de Sarah, Pot de départ Alex…"
              />
              {nameError && <div className={s.modalError}>{nameError}</div>}
            </div>
            <div className={s.modalActions}>
              <button className={s.btnGhost} onClick={() => setNameModal(null)}>Annuler</button>
              <button className={s.btnPrimary} onClick={confirmCreate} disabled={nameLoading}>
                {nameLoading ? 'Chargement…' : <>Choisir un thème <ArrowRight size={15} /></>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
