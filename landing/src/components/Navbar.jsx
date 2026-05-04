import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import s from './Navbar.module.css';

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

export default function Navbar({ onOrder }) {
  const [scrolled, setScrolled]     = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const close = () => setMenuOpen(false);

  return (
    <>
      <motion.nav
        className={`${s.nav} ${scrolled ? s.scrolled : ''}`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <a href="/" className={s.logo}>
          <span className={s.logoText}>my<em>Kado</em></span>
        </a>

        {/* Desktop links */}
        <div className={s.links}>
          <a href="#templates"    className={s.link}>Templates</a>
          <a href="#how-it-works" className={s.link}>Comment ça marche</a>
          <a href={`${APP_URL}/ewish-admin/login`} className={s.link}>Se connecter</a>
        </div>

        {/* Desktop CTA */}
        <button className={s.cta} onClick={onOrder}>
          Créer un compte →
        </button>

        {/* Mobile hamburger */}
        <button
          className={s.burger}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Menu"
        >
          <span className={`${s.burgerLine} ${menuOpen ? s.open : ''}`} />
          <span className={`${s.burgerLine} ${menuOpen ? s.open : ''}`} />
          <span className={`${s.burgerLine} ${menuOpen ? s.open : ''}`} />
        </button>
      </motion.nav>

      {/* Mobile menu drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className={s.overlay}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={close}
            />
            <motion.div
              className={s.drawer}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            >
              <div className={s.drawerHead}>
                <span className={s.logoText}>my<em>Kado</em></span>
                <button className={s.closeBtn} onClick={close}>✕</button>
              </div>
              <nav className={s.drawerNav}>
                <a href="#templates"    className={s.drawerLink} onClick={close}>Templates</a>
                <a href="#how-it-works" className={s.drawerLink} onClick={close}>Comment ça marche</a>
                <a href={`${APP_URL}/ewish-admin/login`} className={s.drawerLink} onClick={close}>Se connecter</a>
              </nav>
              <button className={s.drawerCta} onClick={() => { close(); onOrder(); }}>
                Créer un compte →
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}