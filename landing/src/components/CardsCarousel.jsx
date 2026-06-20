import s from './CardsCarousel.module.css';

/*
  Auto-scrolling infinite carousel of finished myKado cards.
  Each card is a mini stylized preview by occasion.
  Duplicated 2x for seamless CSS keyframe loop.
*/

const CARDS = [
  {
    tone: 'rose',
    eyebrow: 'Anniversaire',
    title: 'Joyeux anniversaire',
    name: 'Aminata',
    meta: '32 ans · de toute la famille',
    contribs: 24,
  },
  {
    tone: 'peach',
    eyebrow: 'Mariage',
    title: 'Pour toujours',
    name: 'Marie & David',
    meta: '12 oct. 2026 · Dakar',
    contribs: 47,
  },
  {
    tone: 'gold',
    eyebrow: 'Départ',
    title: 'Merci pour tout',
    name: 'Christian',
    meta: '5 ans chez Atlantis · l\'équipe RH',
    contribs: 18,
  },
  {
    tone: 'mint',
    eyebrow: 'Naissance',
    title: 'Bienvenue',
    name: 'Kofi',
    meta: 'né le 3 mars · 3,4 kg',
    contribs: 31,
  },
  {
    tone: 'lilac',
    eyebrow: 'Hommage',
    title: 'On se souvient',
    name: 'Mamadou',
    meta: '1948 — 2024 · une vie pleine',
    contribs: 56,
  },
  {
    tone: 'ink',
    eyebrow: 'Mots d\'équipe',
    title: 'Bravo champion',
    name: 'Toute l\'équipe',
    meta: 'pour 3 ans d\'efforts',
    contribs: 22,
  },
];

function Card({ tone, eyebrow, title, name, meta, contribs }) {
  return (
    <div className={`${s.card} ${s[`tone_${tone}`]}`}>
      <div className={s.cardEyebrow}>
        <span className={s.cardDot} /> {eyebrow}
      </div>
      <div className={s.cardTitle}>{title}</div>
      <div className={s.cardName}>{name}</div>
      <div className={s.cardMeta}>{meta}</div>

      <div className={s.cardPhoto} aria-hidden>
        <div className={s.photoCap}>un moment qui dure</div>
      </div>

      <div className={s.cardFoot}>
        <div className={s.avatars}>
          <span className={s.av1}>A</span>
          <span className={s.av2}>F</span>
          <span className={s.av3}>K</span>
          <span className={s.av4}>+</span>
        </div>
        <div className={s.contribsTxt}><b>{contribs}</b> contributeurs</div>
      </div>
    </div>
  );
}

export default function CardsCarousel() {
  const loop = [...CARDS, ...CARDS];

  return (
    <div className={s.wrap} aria-hidden>
      <div className={s.fadeLeft} />
      <div className={s.fadeRight} />
      <div className={s.track}>
        {loop.map((c, i) => (
          <Card key={i} {...c} />
        ))}
      </div>
    </div>
  );
}
