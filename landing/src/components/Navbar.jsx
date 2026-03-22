import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import s from './Navbar.module.css';

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

export default function Navbar({ onOrder }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <motion.nav
      className={`${s.nav} ${scrolled ? s.scrolled : ''}`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0,   opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      <a href="/" className={s.logo}>
        <span className={s.logoText}>my<em>Kado</em></span>
      </a>

      <div className={s.links}>
        <a href="#templates"   className={s.link}>Templates</a>
        <a href="#how-it-works" className={s.link}>Comment ça marche</a>
        <a href={APP_URL}      className={s.link} target="_blank" rel="noreferrer">Mon espace</a>
      </div>

      <button className={s.cta} onClick={onOrder}>
        Commander →
      </button>
    </motion.nav>
  );
}