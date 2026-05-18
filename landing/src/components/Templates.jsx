import { useState, useEffect } from 'react';
import { useInView } from '../hooks/useInView';
import s from './Templates.module.css';

const TEMPLATES = {
  birthday: {
    key: 'birthday', cat: 'Anniversaire', credits: 8, equiv: '4 000 XOF',
    name: 'Joyeux Anniversaire',
    desc: "Animation complète avec photos, musique et vœux personnalisés. L'incontournable.",
    modalDesc: "Une animation complète qui démarre par une bougie qui s'allume, dévoile vos photos en cascade et joue la musique de votre choix.",
    includes: ["Jusqu'à 24 photos animées", "Musique de bibliothèque ou MP3 perso", "3 styles de typographie au choix", "Lien privé + QR code stylisé"],
    equivNote: '≈ 4 000 XOF — inclus dans le pack Essentiel',
  },
  wall: {
    key: 'wall', cat: 'Collectif', credits: 10, equiv: '5 000 XOF',
    name: 'Mur de vœux',
    desc: 'Un mur interactif où chacun colle son message — comme des post-its numériques.',
    modalDesc: "Invitez vos proches ou collègues à coller un message sur un mur interactif. Chaque contribution s'affiche en post-it animé, daté et signé.",
    includes: ["Jusqu'à 30 contributeurs", "Modération avant publication", "6 couleurs de post-it", "Partage par lien d'invitation"],
    equivNote: '≈ 5 000 XOF',
  },
  special: {
    key: 'special', cat: 'Premium', credits: 12, equiv: '6 000 XOF',
    name: 'Vœu Spécial',
    desc: 'Pour les occasions uniques. Effets premium, thème sur-mesure, vidéo HD.',
    modalDesc: "Pour les occasions qui méritent un traitement d'exception. Effets de particules avancés, transitions cinématographiques, fond personnalisable.",
    includes: ["Thème sur-mesure (couleurs, logo)", "Particules & transitions premium", "Export vidéo MP4 HD", "Photos & vidéos illimitées"],
    equivNote: '≈ 6 000 XOF',
  },
  hommage: {
    key: 'hommage', cat: 'Hommage', credits: 10, equiv: '5 000 XOF',
    name: 'Hommage',
    desc: 'Sobre, digne, intemporel. Cadres dorés et typographie élégante pour rendre hommage.',
    modalDesc: "Une mise en page sobre et intemporelle pour rendre hommage à un être cher. Cadres dorés, typographie sérieuse, musique d'ambiance discrète.",
    includes: ["Cadres & typographie classiques", "Citation ou poème central", "Galerie chronologique", "Lien privé non-indexé"],
    equivNote: '≈ 5 000 XOF',
  },
  family: {
    key: 'family', cat: 'Collectif famille', credits: 20, equiv: '10 000 XOF',
    name: 'Collectif Famille',
    desc: "Chaque proche ajoute son message et sa photo — un souvenir partagé jusqu'à 50 contributeurs.",
    modalDesc: "Rassemblez jusqu'à 50 proches autour d'un même souvenir. Chacun ajoute son message vidéo, vocal ou texte avec sa photo.",
    includes: ["Jusqu'à 50 contributeurs", "Messages texte, audio ou vidéo", "Galerie photos partagée", "Album téléchargeable PDF"],
    equivNote: '≈ 10 000 XOF',
  },
  pro: {
    key: 'pro', cat: 'Collectif Pro', credits: 30, equiv: '15 000 XOF',
    name: 'Collectif Pro',
    desc: 'Pour célébrer vos équipes avec classe : branding entreprise, signatures et export HD.',
    modalDesc: "Pour les départs en retraite, anniversaires de service ou fêtes d'entreprise. Branding complet, sous-domaine personnalisé.",
    includes: ["Logo & couleurs entreprise", "Sous-domaine personnalisé", "Contributions illimitées", "Statistiques d'engagement", "Export pour intranet"],
    equivNote: '≈ 15 000 XOF — inclus dans le pack Pro',
  },
};

const TEMPLATE_LIST = Object.values(TEMPLATES);

const PREFAITS = [
  { thumb: s.t1, label: '30 ans · Rétro',     name: 'Anniversaire — 30 ans rétro',     meta: '8 crédits · 12 photos · style vintage' },
  { thumb: s.t2, label: 'Mariage · floral',    name: 'Vœux de mariage — floral pastel', meta: '12 crédits · 20 photos · musique douce' },
  { thumb: s.t3, label: 'Naissance · pastel',  name: 'Bienvenue bébé — pastel',         meta: '8 crédits · 10 photos · galerie ronde' },
  { thumb: s.t4, label: 'Retraite · 25 ans',   name: 'Départ en retraite — service 25 ans', meta: '30 crédits · jusqu\'à 100 signatures' },
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
  return null;
}

export default function Templates({ onOrder }) {
  const [ref, inView] = useInView();
  const [modal, setModal] = useState(null); // tplKey or null

  const openModal = (key) => { setModal(key); document.body.style.overflow = 'hidden'; };
  const closeModal = () => { setModal(null); document.body.style.overflow = ''; };

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeModal(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const tpl = modal ? TEMPLATES[modal] : null;

  return (
    <section className={s.templates} id="templates" ref={ref}>
      <div className={s.wrap}>
        {/* Header */}
        <div className={s.secHead}>
          <span className={`${s.eyebrow} ${inView ? s.revealed : s.reveal}`}>
            <span className={s.dot}></span> Templates &amp; bibliothèque
          </span>
          <h2 className={`${s.title} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.08s' }}>
            Débloquez, <em>personnalisez</em>, publiez.
          </h2>
          <p className={`${s.sub} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.16s' }}>
            Chaque template a un coût en crédits. Une fois débloqué, il est à vous — personnalisez, dupliquez, republiez sans limite.
          </p>
        </div>

        {/* SaaS flow */}
        <div className={`${s.tplFlow} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.2s' }}>
          <div className={`${s.step} ${s.s1}`}>
            <div className={s.ic}>①</div>
            <div className={s.lab}>Achetez des crédits</div>
            <div className={s.desc}>Pack ou à la carte</div>
          </div>
          <div className={`${s.step} ${s.s2}`}>
            <div className={s.ic}>②</div>
            <div className={s.lab}>Choisissez un template</div>
            <div className={s.desc}>Débloqué d'un clic</div>
          </div>
          <div className={`${s.step} ${s.s3}`}>
            <div className={s.ic}>③</div>
            <div className={s.lab}>Personnalisez</div>
            <div className={s.desc}>Photos, musique, QR…</div>
          </div>
          <div className={`${s.step} ${s.s4}`}>
            <div className={s.ic}>④</div>
            <div className={s.lab}>Publiez &amp; partagez</div>
            <div className={s.desc}>Lien privé, WhatsApp</div>
          </div>
        </div>

        {/* Templates grid */}
        <div className={s.templatesGrid}>
          {TEMPLATE_LIST.map((tplItem, i) => (
            <article
              key={tplItem.key}
              className={`${s.tplCard} ${inView ? s.revealed : s.reveal}`}
              style={{ transitionDelay: `${(i % 3) * 0.08}s` }}
            >
              <div className={s.tplCat}>{tplItem.cat}</div>
              <div className={s.tplCost}>
                <span className={s.coin} aria-hidden="true"></span>
                {tplItem.credits} crédits
              </div>
              <TemplateThumbnail tplKey={tplItem.key} />
              <div className={s.tplBody}>
                <h3 className={s.tplName}>{tplItem.name}</h3>
                <p className={s.tplDesc}>{tplItem.desc}</p>
                <div className={s.tplActions}>
                  <button className={s.btnPreview} onClick={() => openModal(tplItem.key)}>Aperçu</button>
                  <button className={s.btnUnlock} onClick={onOrder}>Débloquer</button>
                </div>
                <div className={s.tplEquiv}>≈ <strong>{tplItem.equiv}</strong></div>
              </div>
            </article>
          ))}
        </div>

        {/* Préfaits */}
        <div className={`${s.prefaits} ${inView ? s.revealed : s.reveal}`} style={{ transitionDelay: '.3s' }}>
          <div className={s.prefaitsHead}>
            <div className={s.copy}>
              <span className={s.tag}><span aria-hidden="true">⚡</span> Préfaits prêts à dupliquer</span>
              <h3>Pressé ? Partez d'un <em>préfait</em>, déjà personnalisé.</h3>
              <p>Une bibliothèque de vœux pré-configurés — il ne vous reste qu'à changer les noms, les photos et publier. Idéal quand le temps presse.</p>
            </div>
            <button className={s.btnLink} onClick={onOrder}>Voir toute la bibliothèque →</button>
          </div>
          <div className={s.prefaitsScroll}>
            {PREFAITS.map((p, i) => (
              <button key={i} className={s.prefait} onClick={onOrder}>
                <div className={`${s.prefaitThumb} ${p.thumb}`}>
                  <span className={s.prefaitLabel}>{p.label}</span>
                </div>
                <div className={s.prefaitName}>{p.name}</div>
                <div className={s.prefaitMeta}>{p.meta}</div>
                <div className={s.dup}>Dupliquer en 1 clic <span className={s.arr}>→</span></div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {modal && tpl && (
        <div className={s.modal} onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }} role="dialog" aria-modal="true" aria-labelledby="modalTitle">
          <div className={s.modalCard}>
            <button className={s.modalClose} onClick={closeModal} aria-label="Fermer l'aperçu">×</button>
            <div className={s.modalPreview}>
              <TemplateThumbnail tplKey={tpl.key} />
            </div>
            <div className={s.modalBody}>
              <span className={s.modalCat}>{tpl.cat}</span>
              <h3 className={s.modalTitle} id="modalTitle">{tpl.name}</h3>
              <p className={s.modalDesc}>{tpl.modalDesc}</p>
              <ul className={s.modalIncludes}>
                {tpl.includes.map((inc, i) => (
                  <li key={i}>
                    <span className={s.ck}>✓</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
              <div className={s.modalCost}>
                <div>
                  <div className={s.costLabel}>Coût pour débloquer</div>
                  <div className={s.costV}><span className={s.coinLg}></span>{tpl.credits} crédits</div>
                  <div className={s.costEq}>≈ {tpl.equiv}</div>
                </div>
              </div>
              <div className={s.modalActions}>
                <a href="#pricing" className={s.btnGhost} onClick={closeModal}>Voir les packs</a>
                <button className={s.btnPrimary} onClick={() => { closeModal(); onOrder(); }}>
                  Débloquer maintenant <span className={s.arr}>→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
