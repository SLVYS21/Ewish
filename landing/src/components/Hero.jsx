import s from './Hero.module.css';
import NotoEmoji from './NotoEmoji';
import { QrCode, Play } from 'lucide-react';

const VideoPlaceholder = () => (
  <div className={s.videoWrapper}>
    <div className={s.videoPlaceholder}>
      <div className={s.playBtn}>
        <Play size={32} fill="currentColor" />
      </div>
      <div className={s.qrOverlay}>
        <QrCode size={24} />
        <span>Scannez pour découvrir</span>
      </div>
    </div>
  </div>
);

export default function Hero({ onCreate }) {
  return (
    <section className={s.hero}>
      <div className="mk-container">
        <div className={s.grid}>
          <div>
            <span className={`eyebrow ${s.eyebrow}`}>
              <NotoEmoji name="love-letter"  size={18} />
              <span>Cartes</span>
              <span className={s.eyebrowDot}>·</span>
              <NotoEmoji name="party-popper" size={18} />
              <span>Murs</span>
              <span className={s.eyebrowDot}>·</span>
              <NotoEmoji name="wrapped-gift" size={18} />
              <span>Cadeaux</span>
            </span>
            <h1 className={s.h1}>
              Rendez chaque célébration <em className={`serif ${s.gold}`}>inoubliable</em>,
              <NotoEmoji name="sparkles" size={44} className={s.h1Sparkle} />
              <br />
              même à distance.
            </h1>
            <p className={s.sub}>
              Rassemblez vos proches autour d'une cagnotte partagée, centralisez vos vœux sur un mur de messages interactif, et créez une surprise sur mesure.
            </p>
            <div className={s.actions}>
              <button className="mk-btn mk-btn-primary mk-btn-lg" onClick={onCreate}>
                Créer une surprise
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                </svg>
              </button>
              <a href="#briques" className="mk-btn mk-btn-ghost mk-btn-lg">Lancer un cadeau commun</a>
            </div>
            <div className={s.trust}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--mk-forest-700)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 6 9 17l-5-5" />
              </svg>
              Gratuit jusqu'à la publication · Sans création de compte
            </div>
          </div>

          <div className={s.cluster}>
            <VideoPlaceholder />
          </div>
        </div>
      </div>
    </section>
  );
}
