import s from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className="mk-container">
        <div className={s.grid}>
          <div className={s.brand}>
            <div className={s.brandName}>
              myKado <span className={s.brandDot} />
            </div>
            <p className={s.tagline}>
              Célébrer les personnes qui comptent, où qu'elles soient.
              Une carte, un mur, un cadeau — trois briques pour toutes les occasions.
            </p>
          </div>
          <div>
            <div className={s.colTitle}>Produit</div>
            <div className={s.links}>
              <a href="#briques">Cartes</a>
              <a href="#briques">Murs</a>
              <a href="#briques">Cadeaux</a>
              <a href="#tarifs">Tarifs</a>
            </div>
          </div>
          <div>
            <div className={s.colTitle}>Entreprise</div>
            <div className={s.links}>
              <a href="#business">Pour les équipes</a>
              <a href="#business">Demander une démo</a>
              <a href="#">À propos</a>
              <a href="#">Contact</a>
            </div>
          </div>
          <div>
            <div className={s.colTitle}>Légal</div>
            <div className={s.links}>
              <a href="/terms">Mentions légales</a>
              <a href="/privacy">Confidentialité</a>
              <a href="#">Cookies</a>
            </div>
          </div>
        </div>
        <div className={s.bar}>
          <div>© 2026 myKado — From Africa to the World</div>
          <div className={s.currency}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            XOF · EUR · USD
          </div>
        </div>
      </div>
    </footer>
  );
}
