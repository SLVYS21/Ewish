import { useEffect, useRef } from 'react';
import s from './Hero.module.css';

export default function Hero({ onOrder }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const items = el.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add(s.revealed); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    items.forEach(item => io.observe(item));
    return () => io.disconnect();
  }, []);

  return (
    <header className={s.hero} ref={sectionRef}>
      {/* Background */}
      <div className={s.heroBg} aria-hidden="true">
        <div className={s.heroGrid}></div>
        <div className={`${s.heroOrb} ${s.o1}`}></div>
        <div className={`${s.heroOrb} ${s.o2}`}></div>
      </div>

      <div className={s.heroInner}>
        {/* Copy — left column */}
        <div className={s.heroCopy}>
          <span className={`${s.eyebrow} ${s.reveal}`} data-reveal>
            <span className={s.dot} aria-hidden="true"></span> Plateforme de vœux animés
          </span>
          <h1 className={`${s.heroHeadline} ${s.reveal}`} data-reveal>
            Des <em>vœux</em> qui&nbsp;<span className={s.underline}>marquent durablement.</span>
          </h1>
          <p className={`${s.heroSub} ${s.reveal}`} data-reveal>
            myKado est la plateforme tout-en-un pour concevoir, personnaliser et partager
            des animations de vœux d'exception — <strong>anniversaires, hommages,
            célébrations d'équipe</strong>. Décors sur-mesure, QR codes stylisés, lien
            promotionnel intégré. Livré en 24h.
          </p>
          <div className={`${s.heroActions} ${s.reveal}`} data-reveal>
            <button className={s.btnPrimary} onClick={onOrder}>
              Commencer à créer <span className={s.arr}>→</span>
            </button>
            <a href="#product" className={s.btnGhost}>Voir le produit</a>
          </div>
          <div className={`${s.heroKpis} ${s.reveal}`} data-reveal>
            <div className={s.k}>
              <span className={s.kv}><em>340+</em></span>
              <span className={s.kl}>vœux créés / mois</span>
            </div>
            <div className={s.k}>
              <span className={s.kv}>4,9<em>/5</em></span>
              <span className={s.kl}>satisfaction client</span>
            </div>
            <div className={s.k}>
              <span className={s.kv}>&lt;24h</span>
              <span className={s.kl}>livraison garantie</span>
            </div>
          </div>
        </div>

        {/* Stage — right column */}
        <div className={`${s.heroStage} ${s.reveal}`} data-reveal>
          {/* Floating cards */}
          <div className={`${s.floatCard} ${s.fc1}`} aria-hidden="true">
            <div className={`${s.fcIcon} ${s.fcIconGold}`}>★</div>
            <div className={s.fcMeta}>
              <div className={s.fcT}>+24 photos</div>
              <div className={s.fcS}>galerie animée</div>
            </div>
          </div>
          <div className={`${s.floatCard} ${s.fc2}`} aria-hidden="true">
            <div className={`${s.fcIcon} ${s.fcIconRose}`}>✓</div>
            <div className={s.fcMeta}>
              <div className={s.fcT}>QR partagé</div>
              <div className={s.fcS}>scan &amp; regarde</div>
            </div>
          </div>

          {/* Phone mockup */}
          <div className={s.phone} aria-hidden="true">
            <div className={s.phoneNotch}></div>
            <div className={s.phoneScreen}>
              <div className={s.phoneConfetti}>
                <i></i><i></i><i></i><i></i><i></i><i></i><i></i>
              </div>
              <div className={s.phoneCake}>
                <div className={s.cakeFlame}></div>
                <div className={s.cakeCandle}></div>
                <div className={s.cakeTop}></div>
                <div className={s.cakeBase}></div>
              </div>
              <div className={s.phoneTitle}>Joyeux <em>Anniversaire</em></div>
              <div className={s.phoneSub}>Aminata · 32 ans</div>
              <div className={s.phonePhotos}>
                <div className={s.phonePhoto}></div>
                <div className={s.phonePhoto}></div>
                <div className={s.phonePhoto}></div>
                <div className={s.phonePhoto}></div>
                <div className={s.phonePhoto}></div>
                <div className={s.phonePhoto}></div>
              </div>
              <div className={s.phoneAction}>REGARDER L'ANIMATION</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
