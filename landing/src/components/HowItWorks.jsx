import s from './HowItWorks.module.css';
import NotoEmoji from './NotoEmoji';

const STEPS = [
  { n: 1, emoji: 'sparkles',     title: "Choisis l'occasion",  desc: "Anniversaire, mariage, naissance, retraite, fin d'année… Ou une occasion à toi." },
  { n: 2, emoji: 'writing-hand', title: 'Choisis la brique',   desc: 'Carte animée, mur collaboratif, ou cadeau direct. Les trois peuvent se combiner.' },
  { n: 3, emoji: 'star-struck',  title: 'Personnalise',        desc: 'Musique, photos, texte, thème, invités, cagnotte. Tu vois le rendu en temps réel.' },
  { n: 4, emoji: 'rocket',       title: 'Envoie',              desc: "Par lien, QR code, e-mail ou réseaux sociaux. Ton destinataire ouvre — explosion de confettis." },
];

export default function HowItWorks() {
  return (
    <section id="comment" className="mk-section">
      <div className="mk-container">
        <div className="mk-sec-head">
          <span className="eyebrow">En 4 étapes</span>
          <h2 className="mk-sec-h2">Comment ça marche.</h2>
          <p className="mk-sec-sub">
            Deux minutes pour créer, gratuitement. Tu paies uniquement au moment de partager,
            quand tout est prêt.
          </p>
        </div>

        <div className={s.grid}>
          {STEPS.map((step) => (
            <div key={step.n} className={s.step}>
              <div className={s.head}>
                <div className={s.num}>{step.n}</div>
                <NotoEmoji name={step.emoji} size={36} className={s.stepEmoji} />
              </div>
              <div className={s.title}>{step.title}</div>
              <div className={s.desc}>{step.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
