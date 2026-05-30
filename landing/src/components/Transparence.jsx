export default function Transparence() {
  return (
    <section className="section section-trans">
      <div className="wrap">
        <div className="trans-card">
          <div className="trans-left">
            <span className="pill pill-em">⊘ &nbsp;Aucun frais caché</span>
            <h2 className="serif italic">Ce que vous voyez,<br/>c'est ce que vous payez.</h2>
            <p>
              Nous croyons à la transparence radicale. Voici, ligne par ligne,
              à quoi correspond votre crédit.
            </p>
          </div>

          <div className="trans-right">
            <div className="trans-row">
              <span className="tr-l">1 crédit</span>
              <span className="tr-v">500 FCFA · ≈ 0,76 €</span>
            </div>
            <div className="trans-row">
              <span className="tr-l">Frais d'inscription</span>
              <span className="tr-v tr-zero">0 FCFA</span>
            </div>
            <div className="trans-row">
              <span className="tr-l">Frais de personnalisation</span>
              <span className="tr-v tr-zero">0 FCFA</span>
            </div>
            <div className="trans-row">
              <span className="tr-l">Frais de partage / QR</span>
              <span className="tr-v tr-zero">0 FCFA</span>
            </div>
            <div className="trans-row">
              <span className="tr-l">Frais de paiement</span>
              <span className="tr-v">À notre charge</span>
            </div>
            <div className="trans-row trans-row-em">
              <span className="tr-l">Coût total d'un vœu</span>
              <span className="tr-v">5–12 crédits · 2 500–6 000 FCFA</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
