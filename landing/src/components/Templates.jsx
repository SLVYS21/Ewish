import { useState, useEffect } from 'react';
import { useInView } from '../hooks/useInView';
import s from './Templates.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Descriptions et inclusions pour chaque template (fallback si le serveur ne les retourne pas)
const TEMPLATE_INFO = {
  'birthday': {
    cat: 'Anniversaire', credits: 8,
    name: 'Joyeux Anniversaire',
    desc: "Animation complète avec photos, musique et vœux personnalisés. L'incontournable.",
    includes: ["Jusqu'à 24 photos animées", "Musique de bibliothèque ou MP3 perso", "3 styles de typographie", "Lien privé + QR code stylisé"],
  },
  'wall-of-wishes': {
    cat: 'Collectif', credits: 10,
    name: 'Mur de vœux',
    desc: 'Un mur interactif où chacun colle son message — comme des post-its numériques.',
    includes: ["Jusqu'à 30 contributeurs", "Modération avant publication", "6 couleurs de post-it", "Partage par lien d'invitation"],
  },
  'special': {
    cat: 'Premium', credits: 12,
    name: 'Vœu Spécial',
    desc: 'Pour les occasions uniques. Effets premium, thème sur-mesure, vidéo HD.',
    includes: ["Thème sur-mesure (couleurs, logo)", "Particules & transitions premium", "Export vidéo MP4 HD", "Photos & vidéos illimitées"],
  },
  'forever': {
    cat: 'Hommage', credits: 10,
    name: 'Hommage',
    desc: 'Sobre, digne, intemporel. Cadres dorés et typographie élégante pour rendre hommage.',
    includes: ["Cadres & typographie classiques", "Citation ou poème central", "Galerie chronologique", "Lien privé non-indexé"],
  },
  'collective-family': {
    cat: 'Collectif famille', credits: 20,
    name: 'Collectif Famille',
    desc: "Chaque proche ajoute son message et sa photo — un souvenir partagé jusqu'à 50 contributeurs.",
    includes: ["Jusqu'à 50 contributeurs", "Messages texte, audio ou vidéo", "Galerie photos partagée", "Album téléchargeable PDF"],
  },
  'collective-pro': {
    cat: 'Collectif Pro', credits: 30,
    name: 'Collectif Pro',
    desc: 'Pour célébrer vos équipes avec classe : branding entreprise, signatures et export HD.',
    includes: ["Logo & couleurs entreprise", "Sous-domaine personnalisé", "Contributions illimitées", "Statistiques d'engagement"],
  },
  'sanctuary': {
    cat: 'Élégant', credits: 12,
    name: 'Sanctuary',
    desc: 'Un cadre serein et minimaliste pour les moments qui comptent vraiment.',
    includes: ["Mise en page apaisante", "Photos & texte animés", "Musique d'ambiance", "Lien privé"],
  },
  'notre-film': {
    cat: 'Cinématique', credits: 15,
    name: 'Notre Film',
    desc: 'Un slideshow cinématique pour raconter votre histoire en images.',
    includes: ["Transitions cinématiques", "Photos & vidéos mixées", "Bande-son personnalisée", "Format 16:9 HD"],
  },
};

// Thumbnail CSS variant par nom de template
const THUMB_KEY = {
  'birthday': 'birthday',
  'wall-of-wishes': 'wall',
  'special': 'special',
  'forever': 'hommage',
  'notre-film': 'hommage',
  'sanctuary': 'special',
  'collective-family': 'family',
  'collective-pro': 'pro',
};

const DEFAULT_LIST = Object.entries(TEMPLATE_INFO).map(([apiName, info]) => ({
  apiName,
  thumbKey: THUMB_KEY[apiName] || 'birthday',
  equiv: `${info.credits * 500} XOF`,
  ...info,
}));

const PREFAITS = [
  { thumbCls: s.t1, label: '30 ans · Rétro',    apiName: 'birthday',          name: 'Anniversaire — 30 ans rétro',     meta: '8 crédits · style vintage' },
  { thumbCls: s.t2, label: 'Mariage · floral',   apiName: 'collective-family', name: 'Vœux de mariage — floral pastel', meta: '20 crédits · musique douce' },
  { thumbCls: s.t3, label: 'Naissance · pastel', apiName: 'birthday',          name: 'Bienvenue bébé — pastel',         meta: '8 crédits · galerie ronde' },
  { thumbCls: s.t4, label: 'Retraite · 25 ans',  apiName: 'collective-pro',    name: 'Départ en retraite — 25 ans',     meta: '30 crédits · signatures illimitées' },
];

function TemplateThumbnail({ tplKey }) {
  if (tplKey === 'birthday') return (
    <div className={`${s.tplThumb} ${s.vBirthday}`}>
      <div className={s.scene}>
        <div className={s.c}></div>
        <div className={s.t}></div>
        <div className={s.b}></div>
      </div>
      <span className={`${s.dot} ${s.d1}`}></span>
      <span className={`${s.dot} ${s.d2}`}></span>
      <span className={`${s.dot} ${s.d3}`}></span>
      <span className={`${s.dot} ${s.d4}`}></span>
    </div>
  );
  if (tplKey === 'wall') return (
    <div className={`${s.tplThumb} ${s.vWall}`}>
      <div className={s.wallGrid}>
        <div className={s.note}>♥</div>
        <div className={s.note}>✦</div>
        <div className={s.note}>★</div>
        <div className={s.note}>✿</div>
        <div className={s.note}>♪</div>
        <div className={s.note}>●</div>
      </div>
    </div>
  );
  if (tplKey === 'special') return (
    <div className={`${s.tplThumb} ${s.vSpecial}`}>
      <span className={`${s.star} ${s.starBig}`}>✦</span>
      <span className={`${s.star} ${s.s1}`}>✦</span>
      <span className={`${s.star} ${s.s2}`}>✦</span>
      <span className={`${s.star} ${s.s3}`}>✦</span>
      <span className={`${s.star} ${s.s4}`}>✦</span>
    </div>
  );
  if (tplKey === 'hommage') return (
    <div className={`${s.tplThumb} ${s.vHommage}`}>
      <div className={s.frame}></div>
      <div className={s.ribbon}>In Memoriam</div>
    </div>
  );
  if (tplKey === 'family') return (
    <div className={`${s.tplThumb} ${s.vFamily}`}>
      <div className={s.photos}>
        <div className={s.ph}>👤</div>
        <div className={s.ph}>👤</div>
        <div className={s.ph}>👤</div>
        <div className={s.ph}>👤</div>
        <div className={s.ph}>♥</div>
        <div className={s.ph}>👤</div>
      </div>
    </div>
  );
  if (tplKey === 'pro') return (
    <div className={`${s.tplThumb} ${s.vPro}`}>
      <div className={s.proCard}>
        <div className={s.proLogo}>M</div>
        <div className={s.proH}>Notre équipe</div>
        <div className={s.proS}>Hommage collectif</div>
        <div className={s.proRow}>
          <span className={s.pip}></span>
          <span className={s.pip}></span>
          <span className={s.pip}></span>
          <span className={s.pip}></span>
          <span className={s.pip}></span>
        </div>
      </div>
    </div>
  );
  // Generic fallback
  return <div className={`${s.tplThumb} ${s.vBirthday}`}></div>;
}

export default function Templates({ onOrder }) {
  const [ref, inView] = useInView();
  const [templates, setTemplates] = useState(DEFAULT_LIST);
  const [preview, setPreview] = useState(null); // { apiName, info } or null
  const [iframeReady, setIframeReady] = useState(false);

  // Fetch real template list from server
  useEffect(() => {
    fetch(`${API_BASE}/api/templates`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (!Array.isArray(data) || data.length === 0) return;
        const mapped = data
          .filter(t => t.active !== false)
          .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
          .map(t => {
            const info = TEMPLATE_INFO[t.name] || {};
            return {
              apiName: t.name,
              thumbKey: THUMB_KEY[t.name] || 'birthday',
              cat:     info.cat     || t.category || t.name,
              credits: t.creditsRequired || info.credits || 5,
              equiv:   `${(t.creditsRequired || info.credits || 5) * 500} XOF`,
              name:    t.label      || info.name  || t.name,
              desc:    info.desc    || t.shortDescription || '',
              includes: info.includes || t.highlights || [],
            };
          });
        setTemplates(mapped);
      })
      .catch(() => {}); // keep default list on failure
  }, []);

  const openPreview = (tpl) => {
    setPreview(tpl);
    setIframeReady(false);
    document.body.style.overflow = 'hidden';
  };
  const closePreview = () => {
    setPreview(null);
    document.body.style.overflow = '';
  };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closePreview(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section className={s.templates} id="templates" ref={ref}>
      <div className={s.wrap}>
        {/* Header */}
        <div className={s.secHead}>
          <span className={`${s.eyebrow} ${inView ? s.revealed : s.reveal}`}>
            <span className={s.dot}></span> Templates &amp; bibliothèque
          </span>
          <h2 className={`${s.title} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.08s' }}>
            Personnalisez <em>gratuitement</em>, publiez avec vos crédits.
          </h2>
          <p className={`${s.sub} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.16s' }}>
            L'éditeur est accessible sans payer. Vous achetez vos crédits uniquement au moment de publier — pas avant.
          </p>
        </div>

        {/* Flow correct */}
        <div className={`${s.tplFlow} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.2s' }}>
          <div className={`${s.step} ${s.s1}`}>
            <div className={s.ic}>①</div>
            <div className={s.lab}>Choisissez un template</div>
            <div className={s.desc}>Aperçu live gratuit</div>
          </div>
          <div className={`${s.step} ${s.s2}`}>
            <div className={s.ic}>②</div>
            <div className={s.lab}>Personnalisez</div>
            <div className={s.desc}>Photos, musique, QR… sans payer</div>
          </div>
          <div className={`${s.step} ${s.s3}`}>
            <div className={s.ic}>③</div>
            <div className={s.lab}>Achetez vos crédits</div>
            <div className={s.desc}>Seulement pour publier</div>
          </div>
          <div className={`${s.step} ${s.s4}`}>
            <div className={s.ic}>④</div>
            <div className={s.lab}>Publiez &amp; partagez</div>
            <div className={s.desc}>Lien privé, WhatsApp</div>
          </div>
        </div>

        {/* Templates grid */}
        <div className={s.templatesGrid}>
          {templates.map((tpl, i) => (
            <article
              key={tpl.apiName}
              className={`${s.tplCard} ${inView ? s.revealed : s.reveal}`}
              style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
            >
              <div className={s.tplCat}>{tpl.cat}</div>
              <div className={s.tplCost}>
                <span className={s.coin} aria-hidden="true"></span>
                {tpl.credits} crédits
              </div>
              <TemplateThumbnail tplKey={tpl.thumbKey} />
              <div className={s.tplBody}>
                <h3 className={s.tplName}>{tpl.name}</h3>
                <p className={s.tplDesc}>{tpl.desc}</p>
                <div className={s.tplActions}>
                  <button className={s.btnPreview} onClick={() => openPreview(tpl)}>Aperçu live</button>
                  <button className={s.btnUnlock} onClick={onOrder}>Commencer</button>
                </div>
                <div className={s.tplEquiv}>≈ <strong>{tpl.equiv}</strong></div>
              </div>
            </article>
          ))}
        </div>

        {/* Préfaits */}
        <div className={`${s.prefaits} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.3s' }}>
          <div className={s.prefaitsHead}>
            <div className={s.copy}>
              <span className={s.tag}><span aria-hidden="true">⚡</span> Préfaits prêts à dupliquer</span>
              <h3>Pressé ? Partez d'un <em>préfait</em>, déjà configuré.</h3>
              <p>Une bibliothèque de vœux pré-configurés — changez les noms, les photos et publiez. Idéal quand le temps presse.</p>
            </div>
            <button className={s.btnLink} onClick={onOrder}>Voir toute la bibliothèque →</button>
          </div>
          <div className={s.prefaitsScroll}>
            {PREFAITS.map((p, i) => (
              <div key={i} className={s.prefait}>
                <div className={`${s.prefaitThumb} ${p.thumbCls}`}>
                  <span className={s.prefaitLabel}>{p.label}</span>
                </div>
                <div className={s.prefaitName}>{p.name}</div>
                <div className={s.prefaitMeta}>{p.meta}</div>
                <div className={s.prefaitActions}>
                  <button className={s.prefaitPreview} onClick={() => openPreview({ apiName: p.apiName, name: p.name, cat: '', credits: 0, includes: [] })}>
                    👁 Aperçu
                  </button>
                  <button className={s.dup} onClick={onOrder}>
                    Dupliquer <span className={s.arr}>→</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Preview modal with iframe */}
      {preview && (
        <div
          className={s.modal}
          onClick={(e) => { if (e.target === e.currentTarget) closePreview(); }}
          role="dialog"
          aria-modal="true"
          aria-label={`Aperçu — ${preview.name}`}
        >
          <div className={s.modalCard}>
            <button className={s.modalClose} onClick={closePreview} aria-label="Fermer l'aperçu">×</button>

            {/* Iframe preview */}
            <div className={s.modalPreview}>
              {!iframeReady && (
                <div className={s.iframeLoader}>
                  <div className={s.iframeSpinner}></div>
                  <span className={s.iframeLoaderText}>Chargement de l'aperçu…</span>
                </div>
              )}
              <iframe
                key={preview.apiName}
                src={`${API_BASE}/preview/${preview.apiName}`}
                className={s.previewFrame}
                title={`Aperçu — ${preview.name}`}
                sandbox="allow-scripts allow-same-origin"
                onLoad={() => setIframeReady(true)}
              />
            </div>

            {/* Info panel */}
            <div className={s.modalBody}>
              <span className={s.modalCat}>{preview.cat}</span>
              <h3 className={s.modalTitle} id="modalTitle">{preview.name}</h3>
              {preview.desc && <p className={s.modalDesc}>{preview.desc}</p>}
              {preview.includes?.length > 0 && (
                <ul className={s.modalIncludes}>
                  {preview.includes.map((inc, i) => (
                    <li key={i}>
                      <span className={s.ck}>✓</span>
                      <span>{inc}</span>
                    </li>
                  ))}
                </ul>
              )}
              {preview.credits > 0 && (
                <div className={s.modalCost}>
                  <div>
                    <div className={s.costLabel}>Coût à la publication</div>
                    <div className={s.costV}><span className={s.coinLg}></span>{preview.credits} crédits</div>
                    <div className={s.costEq}>≈ {preview.equiv || `${preview.credits * 500} XOF`}</div>
                  </div>
                </div>
              )}
              <div className={s.modalNote}>
                💡 La personnalisation est <strong>100% gratuite</strong>. Vous payez uniquement pour publier.
              </div>
              <div className={s.modalActions}>
                <a href="#pricing" className={s.btnGhost} onClick={closePreview}>Voir les packs</a>
                <button className={s.btnPrimary} onClick={() => { closePreview(); onOrder(); }}>
                  Commencer gratuitement <span className={s.arr}>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
