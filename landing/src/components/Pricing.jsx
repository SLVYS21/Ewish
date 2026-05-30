import { useReveal } from '../hooks/useReveal';
import { PLANS, fmtFCFA, fmtEUR } from '../data';

export default function Pricing({ onOrder }) {
  const [ref, seen] = useReveal();
  return (
    <section className="section section-pricing" id="pricing" ref={ref}>
      <div className="wrap">
        <div className="section-head section-head-c">
          <span className="eyebrow"><span className="dot"></span> Tarifs</span>
          <h2>Payez en <em>crédits</em>.<br/>Économisez avec les packs.</h2>
          <p>
            Une unité simple. Des bonus dégressifs. Aucun abonnement. Vos crédits
            ne s'expirent jamais.
          </p>
        </div>

        <div className="pricing-explain">
          <div className="pe-coin">
            <span className="coin coin-lg"/>
            <span className="serif italic pe-eq">1 crédit = 500 FCFA</span>
            <span className="pe-eur">≈ 0,76 €</span>
          </div>
          <p>
            Une animation personnelle coûte de 5 à 12 crédits. Un projet collectif d'équipe
            entre 20 et 30 crédits. Achetez à la carte, sans surprise.
          </p>
        </div>

        <div className="plans">
          {PLANS.map((p, i) => (
            <article key={p.name} className={`plan ${p.featured ? 'featured' : ''} ${seen ? 'revealed' : 'reveal'}`} style={{ transitionDelay: `${i*0.08}s` }}>
              {p.featured && <span className="plan-badge">★ Plus populaire</span>}
              <div className="plan-name serif italic">{p.name}</div>
              <div className="plan-pitch">{p.pitch}</div>

              <div className="plan-credits">
                <span className="pc-num serif italic">{p.credits}</span>
                <span className="pc-lab">crédits</span>
                {p.bonus > 0 && <span className="pc-bonus">+ {p.bonus} offerts</span>}
              </div>

              <div className="plan-price">
                <strong>{fmtFCFA(p.priceXOF)}</strong>
                <span className="plan-eur">{fmtEUR(p.priceXOF)}</span>
              </div>

              <div className="plan-divider"></div>

              <ul className="plan-perks">
                {p.perks.map((perk, j) => (
                  <li key={j}><span className="ck">✓</span> {perk}</li>
                ))}
              </ul>

              <button className={`btn ${p.featured ? 'btn-primary' : 'btn-ghost'} plan-cta`} onClick={onOrder}>
                Acheter {p.credits}{p.bonus > 0 ? `+${p.bonus}` : ''} crédits <span className="arr">→</span>
              </button>
            </article>
          ))}
        </div>

        <p className="pricing-foot">
          Achat groupé pour un événement ou une campagne ?{' '}
          <a href="mailto:contact@mykado.app">Demandez un devis sur mesure.</a>
        </p>
      </div>
    </section>
  );
}
