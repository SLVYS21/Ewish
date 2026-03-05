import s from './Footer.module.css';

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000';

export default function Footer() {
  return (
    <footer className={s.footer}>
      <div className={s.inner}>
        <div className={s.brand}>
          <div className={s.logo}>e<em>Wishes</em></div>
          <p className={s.tagline}>Des vœux qui touchent vraiment.</p>
        </div>
        <nav className={s.nav}>
          <a href="#templates">Templates</a>
          <a href="#how-it-works">Comment ça marche</a>
          <a href={APP_URL} target="_blank" rel="noreferrer">Mon espace créateur</a>
        </nav>
        <div className={s.legal}>
          © {new Date().getFullYear()} eWishes · Tous droits réservés
        </div>
      </div>
    </footer>
  );
}