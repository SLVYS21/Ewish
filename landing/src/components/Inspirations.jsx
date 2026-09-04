import { useState, useEffect, useRef } from 'react';
import s from './Inspirations.module.css';
import NotoEmoji from './NotoEmoji';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

/* ── Cartes de Groupes (Murs collaboratifs) ─────────────────────
   Chaque catégorie pointe vers une Publication de mur seedée via
   server/seeds/seedDemoLanding.js. L'iframe charge le mur en mode
   ?demo=1 (lecture seule : pas d'ajout de mot, pas de collecte). */
const TABS_GROUP = [
  { id: 'birthday_group',    label: 'Anniversaire',      icon: 'birthday-cake' },
  { id: 'wedding_group',     label: 'Mariage',           icon: 'sparkling-heart' },
  { id: 'birth_group',       label: 'Baptême',           icon: 'ribbon' },
  { id: 'party_group',       label: 'Soirée / Fête',     icon: 'party-popper' },
  { id: 'congrats_group',    label: 'Félicitations',     icon: 'trophy' },
  { id: 'memorial_group',    label: 'Hommage',           icon: 'folded-hands' },
  { id: 'vision_group',      label: 'Vision Board',      icon: 'sparkles' },
];

const DEMOS_GROUP = {
  birthday_group:  { templateName: 'wall-of-wishes',        customName: 'demo-anniversaire-groupe' },
  wedding_group:   { templateName: 'wall-of-wishes-modern', customName: 'demo-mariage-groupe' },
  birth_group:     { templateName: 'wall-of-wishes-modern', customName: 'demo-naissance-groupe' },
  party_group:     { templateName: 'wall-of-wishes-craft',  customName: 'demo-soiree-groupe' },
  congrats_group:  { templateName: 'wall-of-wishes',        customName: 'demo-felicitations-groupe' },
  memorial_group:  { templateName: 'wall-of-wishes-modern', customName: 'demo-deces-groupe' },
  vision_group:    { templateName: 'wall-of-wishes-craft',  customName: 'demo-vision-board' },
};

/* ── Cartes Perso (solo) ─────────────────────────────────────── */
const TABS_PERSONAL = [
  { id: 'wedding_perso',        label: 'Mariage',           icon: 'sparkling-heart' },
  { id: 'birthday_perso',       label: 'Anniversaire',      icon: 'birthday-cake' },
  { id: 'birth_perso',          label: 'Baptême',           icon: 'ribbon' },
  { id: 'love_perso',           label: 'Forever',           icon: 'two-hearts' },
  { id: 'congrats_perso',       label: 'Félicitations',     icon: 'trophy' },
  { id: 'memorial_perso',       label: 'Hommage',           icon: 'folded-hands' },
  { id: 'birthday_perso_env',   label: 'Anniv · enveloppe', icon: 'wrapped-gift' },
];

const DEMOS_PERSONAL = {
  wedding_perso:      { templateName: 'myenvelope', customName: 'demo-mariage-solo' },
  birthday_perso:     { templateName: 'birthday',   customName: 'demo-anniversaire-solo' },
  birth_perso:        { templateName: 'myenvelope', customName: 'demo-naissance-solo' },
  love_perso:         { templateName: 'forever',    customName: 'demo-amour-solo' },
  congrats_perso:     { templateName: 'myenvelope', customName: 'demo-felicitations-solo' },
  memorial_perso:     { templateName: 'myenvelope', customName: 'demo-deces-solo' },
  birthday_perso_env: { templateName: 'myenvelope', customName: 'demo-anniversaire-solo-env' },
};

function buildDemoUrl(demo) {
  if (!demo) return '';
  const { templateName, customName } = demo;
  /* myenvelope est rendu par la SPA React (route /c/:slug), pas par le
     serveur Express (canonical.js:17 SPA_TEMPLATES). On pointe donc sur
     APP_URL au lieu de API_URL pour ces démos. */
  if (templateName === 'myenvelope') {
    return `${APP_URL}/c/${customName}?demo=1&noanim=1`;
  }
  return `${API_URL}/site/${templateName}/${customName}?demo=1&noanim=1`;
}

/* Poster path convention: /posters/{tabId}.webp — see scripts/generate-landing-posters.js */
function buildPosterUrl(tabId) {
  return `/posters/${tabId}.webp`;
}

const MODE_HELPERS = {
  group:    'Un mur collaboratif — vos proches y déposent messages, photos & vidéos, tous ensemble.',
  personal: 'Une carte solo — un message unique de vous, animé et partagé par lien.',
};

export default function Inspirations() {
  const [mode, setMode] = useState('group');
  const [activeTabGroup, setActiveTabGroup] = useState('birthday_group');
  const [activeTabPerso, setActiveTabPerso] = useState('wedding_perso');
  const [iframeReady, setIframeReady] = useState(false);
  const [posterOk, setPosterOk] = useState(true);
  const iframeRef = useRef(null);
  const tabsScrollRef = useRef(null);

  const TABS = mode === 'group' ? TABS_GROUP : TABS_PERSONAL;
  const DEMOS_DATA = mode === 'group' ? DEMOS_GROUP : DEMOS_PERSONAL;
  const activeTab = mode === 'group' ? activeTabGroup : activeTabPerso;
  const activeDemo = DEMOS_DATA[activeTab];
  const src = buildDemoUrl(activeDemo);
  const poster = buildPosterUrl(activeTab);

  useEffect(() => {
    setIframeReady(false);
    setPosterOk(true);
  }, [src]);

  /* Auto-centre le tab actif dans le carrousel mobile pour que la sélection
     reste visible sans que l'utilisateur ait à scroller manuellement.
     rAF garantit que le layout est calculé (sinon getBoundingClientRect
     peut renvoyer des dimensions nulles au premier render, ce qui empêche
     le centrage et laisse le tab actif hors écran à gauche). */
  useEffect(() => {
    const scroller = tabsScrollRef.current;
    if (!scroller) return;
    const raf = requestAnimationFrame(() => {
      const activeEl = scroller.querySelector(`[data-tab-id="${activeTab}"]`);
      if (!activeEl) return;
      const targetLeft = activeEl.offsetLeft - (scroller.clientWidth / 2) + (activeEl.clientWidth / 2);
      scroller.scrollTo({ left: Math.max(0, targetLeft), behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(raf);
  }, [activeTab, mode]);

  return (
    <section className={s.section} id="inspirations">
      <div className={`mk-container ${s.container}`}>

        {/* Toggle — plum active pill (Warm Celebration) */}
        <div className={s.toggleWrapper}>
          <div className={s.toggleContainer}>
            <div
              className={s.togglePill}
              style={{ transform: mode === 'group' ? 'translateX(0)' : 'translateX(100%)' }}
            />
            <button
              className={`${s.toggleBtn} ${mode === 'group' ? s.toggleBtnActive : ''}`}
              onClick={() => setMode('group')}
            >
              Démo Mur
            </button>
            <button
              className={`${s.toggleBtn} ${mode === 'personal' ? s.toggleBtnActive : ''}`}
              onClick={() => setMode('personal')}
            >
              Démo eCard
            </button>
          </div>
        </div>

        {/* Explication du mode — indispensable pour un marché qui découvre.
            Répond au feedback "les gens ne comprennent pas tout de suite". */}
        <p className={s.modeHelper}>{MODE_HELPERS[mode]}</p>

        {/* Category pills — desktop: wrap ; mobile: scroll-snap horizontal
            avec fades sur les bords, pour ne pas empiler et laisser voir la
            démo au-dessus du fold. */}
        <div className={s.tabsScrollWrap}>
          <div className={s.tabsScroller} ref={tabsScrollRef}>
            <div className={s.tabsContainer}>
              {TABS.map((tab) => (
                <button
                  key={tab.id}
                  data-tab-id={tab.id}
                  className={`${s.tabBtn} ${activeTab === tab.id ? s.tabActive : ''}`}
                  onClick={() => mode === 'group' ? setActiveTabGroup(tab.id) : setActiveTabPerso(tab.id)}
                >
                  {tab.icon && (
                    <span className={s.tabIcon} aria-hidden>
                      <NotoEmoji name={tab.icon} size={18} static />
                    </span>
                  )}
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className={`${s.tabsFade} ${s.tabsFadeLeft}`} aria-hidden />
          <div className={`${s.tabsFade} ${s.tabsFadeRight}`} aria-hidden />
        </div>

        {/* Live preview : poster instantané + iframe fade-in derrière + skeleton fallback */}
        <div className={`${s.demoBoard} ${mode === 'group' ? s.boardGroup : s.boardPerso}`}>
          {/* Skeleton branded (mode-tinted) — visible tant que ni poster ni iframe ne sont prêts */}
          {!iframeReady && !posterOk && (
            <div className={s.skeleton} aria-hidden="true">
              <div className={s.skelHeader} />
              <div className={s.skelGrid}>
                <div className={s.skelCard} />
                <div className={s.skelCard} />
                <div className={s.skelCard} />
                <div className={s.skelCard} />
                <div className={s.skelCard} />
                <div className={s.skelCard} />
              </div>
              <div className={s.skelShimmer} />
            </div>
          )}

          {/* Poster statique — masqué dès que l'iframe est prête */}
          {posterOk && (
            <img
              src={poster}
              alt=""
              className={`${s.poster} ${iframeReady ? s.posterHidden : ''}`}
              onError={() => setPosterOk(false)}
              loading="eager"
              decoding="async"
            />
          )}

          <iframe
            ref={iframeRef}
            key={src}
            src={src}
            className={`${s.demoIframe} ${iframeReady ? s.iframeReady : ''}`}
            title={`Démo ${activeTab}`}
            onLoad={() => setIframeReady(true)}
            allow="autoplay; fullscreen"
            loading="lazy"
          />

          {/* Click-shield : bloque tout tap/click qui atteindrait les boutons
              "Ajouter"/"Participer" du mur. Le mur a déjà un demoMode côté
              serveur mais les CTA restent visuellement tapables — cet overlay
              évite le doute "je clique et rien ne se passe". Sur desktop on
              autorise l'interaction (hover, scroll interne). */}
          <div className={s.demoShield} aria-hidden />
        </div>

      </div>
    </section>
  );
}
