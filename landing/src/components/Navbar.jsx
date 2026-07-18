import { useState } from 'react';
import s from './Navbar.module.css';
import Kado from './Kado/Kado';

export default function Navbar({ onCreate, onLogin }) {
  const [open, setOpen] = useState(false);

  return (
    <nav className={s.nav}>
      <div className="mk-container">
        <div className={s.in}>
          <a href="#" className={s.brand} aria-label="myKado accueil">
            <Kado
              mode="logo"
              size={40}
              cycle={['jump', 'wink', 'confetti', 'love', 'drop']}
              cycleInterval={4200}
              className={s.brandKado}
            />
            <span>myKado</span>
          </a>
          <div className={s.links}>
            <a href="#briques">Ce qu'on fait</a>
            <a href="#comment">Comment ça marche</a>
            <a href="#tarifs">Tarifs</a>
            <a href="#business">Entreprise</a>
          </div>
          <div className={s.actions}>
            <button className="mk-btn mk-btn-ghost" onClick={onLogin}>Se connecter</button>
            <button className="mk-btn mk-btn-primary" onClick={onCreate}>Créer</button>
          </div>
          <button
            className={s.burger}
            aria-label="Menu"
            aria-expanded={open}
            onClick={() => setOpen(v => !v)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open
                ? <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>
                : <><path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/></>}
            </svg>
          </button>
        </div>
        {open && (
          <div className={s.mobileMenu}>
            <a href="#briques" onClick={() => setOpen(false)}>Ce qu'on fait</a>
            <a href="#comment" onClick={() => setOpen(false)}>Comment ça marche</a>
            <a href="#tarifs" onClick={() => setOpen(false)}>Tarifs</a>
            <a href="#business" onClick={() => setOpen(false)}>Entreprise</a>
            <button className="mk-btn mk-btn-ghost" onClick={onLogin} style={{ justifyContent: 'flex-start' }}>Se connecter</button>
            <button className="mk-btn mk-btn-primary" onClick={onCreate}>Créer</button>
          </div>
        )}
      </div>
    </nav>
  );
}
