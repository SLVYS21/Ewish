import { useState, useEffect } from 'react';
import s from './FinalCTA.module.css';

const PLACEHOLDERS = ['Maman', 'Marie', "l'équipe RH", 'Aminata', 'tes mariés'];

export default function FinalCTA({ onOrder }) {
  const [name, setName] = useState('');
  const [placeholder, setPlaceholder] = useState(PLACEHOLDERS[0]);

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
    <section className={s.section} id="final">
      <div className={s.wrap}>
        <div className={s.bgOrbs} aria-hidden>
          <div className={`${s.orb} ${s.o1}`} />
          <div className={`${s.orb} ${s.o2}`} />
        </div>

        <div className={s.card}>
          <span className={s.eyebrow}>
            <span className={s.dot} /> Dernière question
          </span>

          <h2 className={s.title}>
            Alors,<br/>
            <em className="it rose">pour qui</em> c'est ?
          </h2>

          <p className={s.sub}>
            Tape un prénom, on t'ouvre l'éditeur avec déjà tout pré-rempli.
            Gratuit jusqu'à la publication.
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
              C'est parti
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden>
                <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </form>

          <div className={s.fine}>
            <span className={s.coin} />
            <span><b>1 crédit = 500 FCFA</b> · sans abonnement · crédits sans expiration</span>
          </div>

          <div className={s.assurances}>
            <div className={s.assure}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Aucune carte requise</span>
            </div>
            <div className={s.assure}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Personnalisation gratuite</span>
            </div>
            <div className={s.assure}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Tu paies seulement pour publier</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
