import s from './Briques.module.css';
import NotoEmoji from './NotoEmoji';

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
    emoji: 'love-letter',
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
    emoji: 'party-popper',
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
    emoji: 'wrapped-gift',
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
              <div className={s.icon}>
                <NotoEmoji name={b.emoji} size={56} />
              </div>
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
