export default function FinalCTA({ onOrder }) {
  return (
    <section className="section section-cta">
      <div className="wrap cta-inner">
        <div className="cta-deco" aria-hidden>
          <span className="cd cd1">✦</span>
          <span className="cd cd2">·</span>
          <span className="cd cd3">✿</span>
          <span className="cd cd4">·</span>
          <span className="cd cd5">♥</span>
        </div>
        <span className="eyebrow"><span className="dot"></span> À vous de jouer</span>
        <h2 className="serif italic">
          Et si votre prochain <em className="serif italic">vœu</em> se gardait<br/>
          pour <em className="serif italic">toujours</em> ?
        </h2>
        <p>
          Créez votre compte gratuitement, essayez un template, voyez ce que ça donne
          avec vos photos. Vous ne payez que si vous publiez.
        </p>
        <div className="cta-actions">
          <button className="btn btn-primary" onClick={onOrder}>
            Créer mon vœu gratuitement <span className="arr">→</span>
          </button>
          <a href="#templates" className="btn btn-ghost">Revoir les templates</a>
        </div>
        <div className="cta-fine">
          <span className="coin"/> Aucune carte requise. Pas d'abonnement. Crédits sans expiration.
        </div>
      </div>
    </section>
  );
}
