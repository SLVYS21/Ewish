import { useState, useEffect } from 'react';
import CardsCarousel from './CardsCarousel';
import s from './Hero.module.css';

const PLACEHOLDERS = ['Maman', 'Marie', "l'équipe RH", 'Papa', 'Aminata', 'tes mariés', 'Kofi qui part'];

export default function Hero({ onOrder }) {
  const [name, setName] = useState('');
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);
  const [format, setFormat] = useState('solo');

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      if (name) return;
      i = (i + 1) % PLACEHOLDERS.length;
      setPlaceholder(PLACEHOLDERS[i]);
    }, 2500);
    return () => clearInterval(id);
  }, [name]);

  const submit = (e) => {
    e.preventDefault();
    onOrder?.();
  };

  return (
    <header className={s.hero}>
      <div className={s.heroIn}>

        <span className={s.eyebrow}>
          <span className={s.eyebrowDot} />
          Cartes animées · Murs collectifs · Cagnottes
        </span>

        <h1 className={s.h1}>
          Tu veux faire <em className="it">mieux</em><br/>
          qu'un <span className="strike">"Joyeux anniv 🎂"</span> sur WhatsApp,<br/>
          <em className="it gold">sans te ruiner</em> ?
        </h1>

        <p className={s.sub}>
          Carte animée pour une personne, mur où toute la famille laisse un mot,
          cagnotte pour le cadeau commun. Gratuit jusqu'à la publication.
        </p>

        <form className={s.ctaWrap} onSubmit={submit}>
          <span className={s.ctaLabel}>Pour qui c'est ?</span>
          <input
            type="text"
            className={s.ctaInput}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={placeholder}
            autoComplete="off"
            aria-label="Pour qui c'est ?"
          />
          <button className={s.ctaBtn} type="submit">
            Continuer
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </form>

        <div className={s.formats} role="radiogroup" aria-label="Type de vœu">
          <button
            type="button"
            role="radio"
            aria-checked={format === 'solo'}
            className={`${s.fmt} ${format === 'solo' ? s.fmtActive : ''}`}
            onClick={() => setFormat('solo')}
          >
            <span className={s.fmtIco}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="6" y="3" width="12" height="18" rx="2"/>
                <circle cx="12" cy="17" r="1.2" fill="currentColor"/>
              </svg>
            </span>
            <span>
              <div className={s.fmtT}>Carte animée</div>
              <div className={s.fmtS}>Pour une personne</div>
            </span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={format === 'wall'}
            className={`${s.fmt} ${format === 'wall' ? s.fmtActive : ''}`}
            onClick={() => setFormat('wall')}
          >
            <span className={s.fmtIco}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <rect x="3" y="4" width="7" height="7" rx="1.2"/>
                <rect x="14" y="4" width="7" height="7" rx="1.2"/>
                <rect x="3" y="14" width="7" height="7" rx="1.2"/>
                <rect x="14" y="14" width="7" height="7" rx="1.2"/>
              </svg>
            </span>
            <span>
              <div className={s.fmtT}>Mur collectif</div>
              <div className={s.fmtS}>Tout un groupe participe</div>
            </span>
          </button>
        </div>

        <div className={s.trust}>
          <span className={s.coin} />
          <span>
            <b>1 crédit = 500 FCFA</b>{' '}
            <span className="sep-dot">·</span> sans abonnement{' '}
            <span className="sep-dot">·</span> tu paies seulement pour publier
          </span>
        </div>
      </div>

      <CardsCarousel />
    </header>
  );
}
