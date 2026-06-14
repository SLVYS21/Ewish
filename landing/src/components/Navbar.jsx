import { useState, useEffect } from 'react';

export default function Navbar({ onOrder }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <>
      <div className="announce">
        <div className="wrap announce-inner">
          <span className="announce-badge">Bientôt</span>
          <span className="announce-text">
            Les <em>cagnottes cadeaux collectives</em> arrivent sur myKado  vœu + cadeau commun, dans la même page.
          </span>
          <a href="#cagnotte" className="announce-link">Lire le teaser <span>→</span></a>
        </div>
      </div>

      <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
        <div className="wrap nav-inner">
          <a href="#" className="logo">
            <span>my</span><em className="serif italic">Kado</em>
          </a>

          <div className="nav-links">
            <a href="#templates">Templates</a>
            <a href="#how">Comment ça marche</a>
            <a href="#usecases">Pour qui</a>
            <a href="#pricing">Tarifs</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className="nav-actions">
            <a href="#" className="nav-login">Se connecter</a>
            <button className="btn btn-primary" onClick={onOrder}>
              Créer mon vœu <span className="arr">→</span>
            </button>
          </div>

          <button
            className={`burger ${menuOpen ? 'burger-open' : ''}`}
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            <span/><span/><span/>
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="drawer" onClick={close}>
          <div className="drawer-card" onClick={(e) => e.stopPropagation()}>
            <a href="#templates"  onClick={close}>Templates</a>
            <a href="#how"        onClick={close}>Comment ça marche</a>
            <a href="#usecases"   onClick={close}>Pour qui</a>
            <a href="#pricing"    onClick={close}>Tarifs</a>
            <a href="#faq"        onClick={close}>FAQ</a>
            <button className="btn btn-primary" onClick={() => { close(); onOrder(); }}>
              Créer mon vœu <span className="arr">→</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
