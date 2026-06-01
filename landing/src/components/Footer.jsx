export default function Footer() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          <a href="#" className="logo logo-light">
            <span>my</span><em className="serif italic">Kado</em>
          </a>
          <p>Le studio de vœux animés.<br/>Dakar · Abidjan · partout.</p>
        </div>
        <div className="footer-cols">
          <div>
            <h5>Produit</h5>
            <a href="#templates">Templates</a>
            <a href="#how">Comment ça marche</a>
            <a href="#pricing">Tarifs</a>
            <a href="#cagnotte">Cagnottes (bientôt)</a>
          </div>
          <div>
            <h5>Pour</h5>
            <a href="#usecases">Particuliers</a>
            <a href="#usecases">Équipes RH</a>
            <a href="#usecases">Marques &amp; agences</a>
            <a href="mailto:sylvanusboni21@gmail.com">API · Sur demande</a>
          </div>
          <div>
            <h5>Société</h5>
            <a href="mailto:sylvanusboni21@gmail.com">Contact</a>
            <a href="#faq">FAQ</a>
            <a href="https://app.mykado.store/terms">Mentions légales</a>
            <a href="https://app.mykado.store/privacy">Conditions</a>
          </div>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} myKado · Tous droits réservés</span>
        <span>Conçu avec ♥ pour l'Afrique francophone &amp; la diaspora</span>
      </div>
    </footer>
  );
}
