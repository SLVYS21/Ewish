import { useReveal } from '../hooks/useReveal';

const steps = [
  { n: '01', t: 'Créez votre compte',     d: "Inscription en 2 minutes. Accès immédiat à l'éditeur.", icon: '👤' },
  { n: '02', t: 'Personnalisez librement', d: "Photos, musique, textes, QR code, bouton CTA  gratuit.", icon: '✎' },
  { n: '03', t: 'Achetez vos crédits',     d: "Uniquement quand vous publiez. À la carte ou en pack.", icon: '◉' },
  { n: '04', t: 'Partagez par lien ou QR', d: "WhatsApp, email, QR personnalisé. Vu, rejoué, conservé.", icon: '↗' },
];

export default function HowItWorks() {
  const [ref, seen] = useReveal();
  return (
    <section className="section section-how" id="how" ref={ref}>
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow"><span className="dot"></span> Comment ça marche</span>
          <h2>Personnalisez d'abord,<br/><em>payez ensuite</em>.</h2>
          <p>
            Pas d'abonnement, pas de mauvaise surprise. Vous voyez exactement ce que
            coûte votre vœu avant d'engager un centime.
          </p>
        </div>

        <div className="how-steps">
          {steps.map((s, i) => (
            <div key={s.n} className={`how-step ${seen ? 'revealed' : 'reveal'}`} style={{ transitionDelay: `${i*0.08}s` }}>
              <div className="how-num serif italic">{s.n}</div>
              <div className="how-icon">{s.icon}</div>
              <h3>{s.t}</h3>
              <p>{s.d}</p>
              {i === 2 && <span className="how-mark"><span className="coin"/> Le seul moment où vous payez</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
