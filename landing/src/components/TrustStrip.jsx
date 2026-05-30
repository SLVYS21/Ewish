export default function TrustStrip() {
  return (
    <section className="trust">
      <div className="wrap trust-inner">
        <span className="trust-lab">Paiement</span>
        <div className="trust-logos">
          <span className="logo-pill">Wave</span>
          <span className="logo-pill">Orange Money</span>
          <span className="logo-pill">MTN Money</span>
          <span className="logo-pill">Visa</span>
          <span className="logo-pill">Mastercard</span>
        </div>
        <span className="trust-fees">
          <span className="trust-fees-mark">⊘</span> Aucun frais caché · le prix affiché est le prix payé
        </span>
      </div>
    </section>
  );
}
