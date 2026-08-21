import { useState, useEffect, useRef } from 'react';
import s from './Inspirations.module.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/* ── Cartes de Groupes (Murs collaboratifs) ─────────────────────
   Chaque catégorie pointe vers une Publication de mur seedée via
   server/seeds/seedDemoLanding.js. L'iframe charge le mur en mode
   ?demo=1 (lecture seule : pas d'ajout de mot, pas de collecte). */
const TABS_GROUP = [
  { id: 'birthday_group',    label: 'Anniversaire' },
  { id: 'wedding_group',     label: 'Mariage' },
  { id: 'birth_group',       label: 'Baptême' },
  { id: 'party_group',       label: 'Soirées / Fête' },
  { id: 'congrats_group',    label: 'Félicitations' },
  { id: 'memorial_group',    label: 'Hommage' },
  { id: 'vision_group',      label: 'Vision Board' },
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
  { id: 'birthday_perso',    label: 'Anniversaire' },
  { id: 'wedding_perso',     label: 'Mariage' },
  { id: 'love_perso',        label: "Lettre d'Amour" },
  { id: 'birth_perso',       label: 'Baptême' },
  { id: 'congrats_perso',    label: 'Félicitations' },
  { id: 'memorial_perso',    label: 'Hommage' },
];

const DEMOS_PERSONAL = {
  birthday_perso:  { templateName: 'birthday',   customName: 'demo-anniversaire-solo' },
  wedding_perso:   { templateName: 'forever',    customName: 'demo-mariage-solo' },
  love_perso:      { templateName: 'notre-film', customName: 'demo-amour-solo' },
  birth_perso:     { templateName: 'birthday',   customName: 'demo-naissance-solo' },
  congrats_perso:  { templateName: 'notre-film', customName: 'demo-felicitations-solo' },
  memorial_perso:  { templateName: 'sanctuary',  customName: 'demo-deces-solo' },
};

function buildDemoUrl(demo) {
  if (!demo) return '';
  const { templateName, customName } = demo;
  return `${API_URL}/site/${templateName}/${customName}?demo=1&noanim=1`;
}

/* Poster path convention: /posters/{tabId}.webp — see scripts/generate-landing-posters.js */
function buildPosterUrl(tabId) {
  return `/posters/${tabId}.webp`;
}

export default function Inspirations() {
  const [mode, setMode] = useState('group');
  const [activeTabGroup, setActiveTabGroup] = useState('birthday_group');
  const [activeTabPerso, setActiveTabPerso] = useState('birthday_perso');
  const [iframeReady, setIframeReady] = useState(false);
  const [posterOk, setPosterOk] = useState(true);
  const iframeRef = useRef(null);

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

  return (
    <section className={s.section} id="inspirations">
      <div className={`mk-container ${s.container}`}>

        {/* Stylish Toggle — pill color shifts based on mode */}
        <div className={s.toggleWrapper}>
          <div className={`${s.toggleContainer} ${mode === 'group' ? s.modeGroup : s.modePerso}`}>
            <div
              className={s.togglePill}
              style={{ transform: mode === 'group' ? 'translateX(0)' : 'translateX(100%)' }}
            />
            <button
              className={`${s.toggleBtn} ${mode === 'group' ? s.toggleBtnActive : ''}`}
              onClick={() => setMode('group')}
            >
              Cartes de Groupes
            </button>
            <button
              className={`${s.toggleBtn} ${mode === 'personal' ? s.toggleBtnActive : ''}`}
              onClick={() => setMode('personal')}
            >
              Cartes Perso
            </button>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className={`${s.tabsContainer} ${mode === 'group' ? s.tabsGroup : s.tabsPerso}`}>
          {TABS.map((tab) => (
            <button
              key={tab.id}
              className={`${s.tabBtn} ${activeTab === tab.id ? s.tabActive : ''}`}
              onClick={() => mode === 'group' ? setActiveTabGroup(tab.id) : setActiveTabPerso(tab.id)}
            >
              {tab.label}
            </button>
          ))}
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
        </div>

      </div>
    </section>
  );
}
