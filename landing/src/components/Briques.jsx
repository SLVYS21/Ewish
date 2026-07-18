import s from './Briques.module.css';

const Check = () => (
  <svg className="mk-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const BRIQUES = [
  {
    id: 'carte',
    variant: s.carte,
    title: 'Une carte animée',
    tag: 'Un moment intense, un destinataire.',
    desc: "Belle carte animée avec musique, photos et texte personnalisé. Idéale pour un anniversaire, une déclaration, un message qui marque.",
    features: [
      'Musique YouTube ou Spotify',
      'Jusqu\'à 3 photos du destinataire',
      'Confettis, pétales, ballons animés',
    ],
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
        <path d="M5 3v4" /><path d="M19 17v4" /><path d="M3 5h4" /><path d="M17 19h4" />
      </svg>
    ),
  },
  {
    id: 'mur',
    variant: s.mur,
    title: 'Un mur collaboratif',
    tag: 'Plusieurs voix, une personne célébrée.',
    desc: "Invite tes proches à laisser un mot, une photo, un GIF ou un audio. Le destinataire reçoit l'ensemble comme un cadeau collectif.",
    features: [
      'Contribution sans compte',
      'Cagnotte collective en option',
      'Mode projection pour la fête',
    ],
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </svg>
    ),
  },
  {
    id: 'cadeau',
    variant: s.cadeau,
    title: 'Un cadeau direct',
    tag: 'Le geste qui accompagne le mot.',
    desc: "Envoie une carte cadeau chez un partenaire ou un montant en Mobile Money, avec un petit message personnalisé.",
    features: [
      'Mobile Money local (Bénin, CI, Sénégal…)',
      'Partenaires internationaux (Netflix, Amazon…)',
      'Attaché à une carte ou à un mur',
    ],
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="8" width="18" height="4" rx="1" />
        <path d="M12 8v13" /><path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7" />
        <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5" />
      </svg>
    ),
  },
];

export default function Briques() {
  return (
    <section id="briques" className={`mk-section mk-section-muted ${s.wrap}`}>
      <div className="mk-container">
        <div className="mk-sec-head">
          <span className="eyebrow">Trois façons de célébrer</span>
          <h2 className="mk-sec-h2">Choisis ce qui parle à ton moment.</h2>
          <p className="mk-sec-sub">
            Chaque brique raconte quelque chose de différent — de la déclaration intime au
            cadeau collectif d'une équipe entière.
          </p>
        </div>

        <div className={s.grid}>
          {BRIQUES.map((b) => (
            <article key={b.id} className={`${s.card} ${b.variant}`}>
              <div className={s.icon}>{b.icon}</div>
              <div>
                <h3 className={s.title}>{b.title}</h3>
                <div className={s.tag}>{b.tag}</div>
              </div>
              <p className={s.desc}>{b.desc}</p>
              <ul className={s.list}>
                {b.features.map((f) => (
                  <li key={f}><Check />{f}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
