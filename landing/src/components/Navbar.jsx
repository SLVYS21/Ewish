import { useState, useEffect } from 'react';
import s from './Navbar.module.css';

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

export default function Navbar({ onOrder }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <>
      {/* Announce bar */}
      <div className={s.announce} role="region" aria-label="Annonce">
        <span><strong>Nouveau ·</strong> Tarification en crédits — 1 crédit = 500 XOF, bonus jusqu'à +25%</span>
        <span className={s.sep} aria-hidden="true">·</span>
        <a href="#pricing">Voir les formules →</a>
      </div>

      {/* Nav */}
      <nav className={`${s.nav} ${scrolled ? s.scrolled : ''}`} id="nav">
        <div className={s.navInner}>
          <a href="/" className={s.logo}>my<em>Kado</em></a>

          <div className={s.navLinks}>
            <a href="#product">Produit</a>
            <a href="#templates">Templates</a>
            <a href="#usecases">Cas d'usage</a>
            <a href="#pricing">Tarifs</a>
            <a href="#faq">FAQ</a>
          </div>

          <div className={s.navActions}>
            <a href={`${APP_URL}/ewish-admin/login`} className={s.navLogin}>Se connecter</a>
            <button className={s.navCta} onClick={onOrder}>
              Créer un compte <span className={s.arr}>→</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className={s.burger}
            onClick={() => setMenuOpen(o => !o)}
            aria-label={menuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={menuOpen}
          >
            <span className={`${s.burgerLine} ${menuOpen ? s.open : ''}`} />
            <span className={`${s.burgerLine} ${menuOpen ? s.open : ''}`} />
            <span className={`${s.burgerLine} ${menuOpen ? s.open : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {menuOpen && (
        <>
          <div className={s.overlay} onClick={close} />
          <div className={s.drawer}>
            <div className={s.drawerHead}>
              <a href="/" className={s.logo} onClick={close}>my<em>Kado</em></a>
              <button className={s.closeBtn} onClick={close} aria-label="Fermer">×</button>
            </div>
            <nav className={s.drawerNav}>
              <a href="#product"    onClick={close}>Produit</a>
              <a href="#templates"  onClick={close}>Templates</a>
              <a href="#usecases"   onClick={close}>Cas d'usage</a>
              <a href="#pricing"    onClick={close}>Tarifs</a>
              <a href="#faq"        onClick={close}>FAQ</a>
              <a href={`${APP_URL}/ewish-admin/login`} onClick={close}>Se connecter</a>
            </nav>
            <button className={s.drawerCta} onClick={() => { close(); onOrder(); }}>
              Créer un compte →
            </button>
          </div>
        </>
      )}
    </>
  );
}
