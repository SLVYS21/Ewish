import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight, X, MoreHorizontal, ChevronDown,
} from 'lucide-react';
import { getPublications, getTemplates, patchOnboarding } from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';
import Kado from '../components/Kado';
import ConfettiBurst from '../components/ConfettiBurst';
import TileSparkles from '../components/TileSparkles';
import NotoEmoji from '../components/NotoEmoji';
import { WallActivityPreview, WallThemePreview } from '../components/WallPreviews';
import { TemplateIllustration, hasTemplateIllustration } from '../create-flow/templateIllustrations';
import { MYENVELOPE_TEMPLATE, isEnvelopeTemplate } from '../create-flow/syntheticTemplates';
import TemplatePickerFullscreen from '../components/TemplatePickerFullscreen';
import TemplateInfoModal from '../components/TemplateInfoModal';
import OnboardingTour from '../components/OnboardingTour';
import WelcomeOnboardingModal from '../components/WelcomeOnboardingModal';
import s from './Dashboard.module.css';

/* Template thumbnails  reused across recent + featured */
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
  'wall-of-wishes', 'wall-of-wishes-3d', 'wall-of-wishes-modern', 'wall-of-wishes-craft', 'wall-of-wishes-space',
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
  const isWall     = WALL_TEMPLATES.has(pub.templateName);
  const isEnvelope = pub.templateName === 'myenvelope';
  const editPath = isWall
    ? `/ewish-admin/wall/${pub._id}`
    : isEnvelope
      ? `/card-editor?id=${pub._id}`
      : `/ewish-admin/ewish/edit/${pub._id}`;

  const thumbBg = pub.thumbnail
    ? { backgroundImage: `url(${pub.thumbnail})` }
    : null;

  const fallbackGradient = TEMPLATE_GRADIENTS[pub.templateName]
    || 'linear-gradient(135deg,#FFB3C1,#E11D48)';

  // Pour les murs : on affiche le nom du destinataire centré
  const recipientName = pub.data?.titleName || pub.data?.recipient || pub.title?.split(' ')[0] || pub.title || 'Sans titre';

  /* Fallback illustration : SVG dédié quand pub.thumbnail est absent et
     que le template a une représentation graphique connue. */
  const showTemplateIllu = !thumbBg && !isWall && hasTemplateIllustration(pub.templateName);

  return (
    <button className={s.recentCard} onClick={() => navigate(editPath)}>
      <div className={s.recentThumb} style={{ background: fallbackGradient }}>
        {isWall ? (
          <WallActivityPreview pub={pub} style={{ width: '100%', height: '100%' }} />
        ) : (
          <>
            {thumbBg && <div className={s.recentThumbImg} style={thumbBg} />}
            {showTemplateIllu && (
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '10%',
              }}>
                <TemplateIllustration name={pub.templateName} />
              </div>
            )}
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

/* ── Featured theme card ──
   Priorité au SVG dédié quand il existe (préférence utilisateur, v10).
   Fallback : image thumbnail si présente, sinon gradient nu. */
function ThemeTile({ tpl, onSelect }) {
  const isWall = WALL_TEMPLATES.has(tpl.name);
  const gradient = TEMPLATE_GRADIENTS[tpl.name] || 'linear-gradient(135deg,#FFB3C1,#E11D48)';
  const showIllu = hasTemplateIllustration(tpl.name);
  const thumb = !showIllu && tpl.thumbnail ? { backgroundImage: `url(${tpl.thumbnail})` } : null;

  if (isWall) {
    return (
      <button className={s.themeCardWall} onClick={() => onSelect(tpl)}>
        <div style={{ position: 'relative', aspectRatio: '1.14', background: gradient, overflow: 'hidden' }}>
          {thumb && <div className={s.themeThumbImg} style={thumb} />}
          {showIllu && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '10%',
            }}>
              <TemplateIllustration name={tpl.name} />
            </div>
          )}
        </div>
        <div style={{ padding: '11px 12px' }}>
          <div style={{ fontWeight: 700, fontSize: '13px' }}>{tpl.label || tpl.name}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
            <span style={{ font: '800 10px Inter, sans-serif', background: '#EDE7FF', color: '#5B6994', padding: '3px 8px', borderRadius: '999px' }}>
              {(tpl.priceFCFA ?? 500).toLocaleString('fr-FR')} FCFA
            </span>
            <span style={{ font: '700 11px Inter, sans-serif', color: '#9F6D22' }}>Créer ›</span>
          </div>
        </div>
      </button>
    );
  }

  return (
    <button className={s.themeCard} style={{ background: gradient, position: 'relative' }} onClick={() => onSelect(tpl)}>
      {thumb && <div className={s.themeThumbImg} style={thumb} />}
      {showIllu && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '10%',
        }}>
          <TemplateIllustration name={tpl.name} />
        </div>
      )}
      <span className={s.themeLabel}>{tpl.label || tpl.name}</span>
    </button>
  );
}

function RotatingEmoji({ emojis, interval = 2000, size = 18, className }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % emojis.length);
    }, interval);
    return () => clearInterval(timer);
  }, [emojis, interval]);

  return <NotoEmoji name={emojis[index]} size={size} className={className} />;
}

/* ══════════════════════════════════════════════════════════════════
   Dashboard
   ══════════════════════════════════════════════════════════════════ */
export default function Dashboard() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [pubs,      setPubs]      = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [themesTab, setThemesTab] = useState('walls'); // 'walls' | 'cards'
  const [announceOpen, setAnnounceOpen] = useState(true);
  const [promoOpen, setPromoOpen] = useState(true);

  /* Picker fullscreen (preview + swipe) + modale d'infos (occasion/destinataire/titre)
     — même flow qu'à la galerie de templates. Envelope shunte le picker. */
  const [pickerState, setPickerState] = useState(null); // { templates, initialIndex } | null
  const [infoTpl,     setInfoTpl]     = useState(null); // Template | null

  /* Onboarding first-visit : modale d'accueil + tour react-joyride guidé.
     Ne se déclenche que si le user est chargé ET n'a pas déjà vu le tour Home. */
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  const [tourRun,     setTourRun]     = useState(false);

  useEffect(() => {
    /* Truthy check : couvre à la fois false (défaut mongoose) et undefined
       (utilisateurs existants avant l'ajout du champ). */
    if (user && !user.onboardingHome) setWelcomeOpen(true);
  }, [user]);

  /* Marque le tour Home comme vu côté serveur et met à jour le user local
     pour ne pas re-déclencher la modale au prochain re-render. */
  const markOnboardingDone = async () => {
    try {
      const res = await patchOnboarding({ home: true });
      if (res?.data?.user) setUser(res.data.user);
    } catch {
      /* silent : si le PATCH échoue, on retentera au prochain login */
    }
  };

  const handleWelcomeStart = () => {
    setWelcomeOpen(false);
    /* Petit délai pour laisser la modale se démonter avant de spotlight
       le premier élément — évite un flash visuel. */
    setTimeout(() => setTourRun(true), 200);
  };

  const handleWelcomeSkip = () => {
    setWelcomeOpen(false);
    markOnboardingDone();
  };

  const handleTourClose = () => {
    setTourRun(false);
    markOnboardingDone();
  };

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
    /* Cartes : on épingle myenvelope en tête comme dans TemplatesGallery. */
    return [
      MYENVELOPE_TEMPLATE,
      ...templates.filter(t => !WALL_TEMPLATES.has(t.name)),
    ].slice(0, 4);
  }, [templates, themesTab]);

  /* Clic sur un template → picker preview (avec swipe entre les featured)
     puis modale d'infos → createPublication → éditeur. Envelope skip le
     picker (pas de preview iframe pour l'éditeur de cartes). */
  const goToTheme = (tpl) => {
    const idx = Math.max(0, featuredThemes.findIndex((t) => t.name === tpl.name));
    setPickerState({ templates: featuredThemes, initialIndex: idx });
  };

  const handlePickerPick = (tpl) => {
    setPickerState(null);
    setInfoTpl(tpl);
  };

  return (
    <div className={s.wrap}>

      {/* Onboarding : modale d'accueil + tour react-joyride guidé */}
      <WelcomeOnboardingModal
        open={welcomeOpen}
        title={`Bienvenue${user?.name ? `, ${user.name.split(' ')[0]}` : ''} !`}
        subtitle="En 30 secondes, on te fait découvrir l'essentiel : créer, retrouver tes créations, gérer tes crédits."
        noto="party-popper"
        onStart={handleWelcomeStart}
        onSkip={handleWelcomeSkip}
      />
      <OnboardingTour run={tourRun} onClose={handleTourClose} />

      {/* Preview fullscreen avec swipe entre templates featured */}
      {pickerState && (
        <TemplatePickerFullscreen
          templates={pickerState.templates}
          initialIndex={pickerState.initialIndex}
          onClose={() => setPickerState(null)}
          onPick={handlePickerPick}
        />
      )}

      {/* Modale d'infos (occasion + destinataire + titre) → createPublication → éditeur */}
      <TemplateInfoModal
        open={!!infoTpl}
        template={infoTpl}
        onClose={() => setInfoTpl(null)}
      />

      {/* ══ Indigo Hero ════════════════════════════════════════════ */}
      <div className={s.indigoHero}>
        <div className={s.heroTop}>
          <div className={s.heroEyebrow}>
            <span className={s.welcomeBadge}>
              RAVI DE TE REVOIR
            </span>
          </div>
        </div>
        
        <div className={s.heroContent}>
          <div className={s.heroTitle}>
            Bonsoir, <strong>{firstName}</strong> <RotatingEmoji emojis={['waving-hand', 'sparkles', 'party-popper', 'star-struck', 'growing-heart']} size={36} className={s.heroEmojiAnim} />
          </div>
          <div className={s.heroSub}>Célèbre les gens qui comptent  une carte animée, un mur collectif, un cadeau.</div>
        </div>
        
        {/* Decorative elements */}
        <div className={s.heroCircle1}></div>
        <div className={s.heroDot}></div>
      </div>

      {/* ══ What are we creating? ════════════════════════════════ */}
      <div className={s.section} id="tour-create" style={{ marginTop: '16px' }}>
        <div className={s.sectionTitle} style={{ fontSize: '22px', fontFamily: 'var(--mk-font-display)', fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--mk-text-primary)', marginBottom: '8px' }}>Qu'est-ce qu'on crée ?</div>
        <div className={s.quickGrid}>
          <button className={s.cardMain} onClick={() => navigate('/ewish-admin/templates?mode=wish')}>
            <div className={s.cardMainBg}></div>
            <NotoEmoji name="love-letter" size={46} className={s.cardIconAnim} />
            <div className={s.cardMainText}>
              <div className={s.cardMainTitle}>Créer une carte</div>
              <div className={s.cardMainSub}>Une expérience animée à envoyer<br/>en solo.</div>
            </div>
          </button>

          <button className={s.cardWall} onClick={() => navigate('/ewish-admin/templates?mode=wall')}>
            <NotoEmoji name="speech-balloon" size={42} className={s.cardIconAnimAlt} />
            <div className={s.cardSecondaryText}>
              <div className={s.cardSecondaryTitle}>Un mur</div>
              <div className={s.cardSecondarySub}>À plusieurs mains</div>
            </div>
          </button>

          <button className={s.cardGift} onClick={() => navigate('/ewish-admin/templates?mode=wish')}>
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
            <div className={s.sectionTitle} style={{ fontSize: '22px', fontFamily: 'var(--mk-font-display)', fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--mk-text-primary)' }}>Récents</div>
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

    </div>
  );
}
