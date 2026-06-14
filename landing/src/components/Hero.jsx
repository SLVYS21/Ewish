import { useReveal } from '../hooks/useReveal';

function HeroStage() {
  return (
    <div className="stage">
      <div className="float-card fc-qr">
        <div className="fc-qr-glyph">
          <svg viewBox="0 0 24 24" width="42" height="42">
            <defs>
              <clipPath id="heart-clip">
                <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z"/>
              </clipPath>
            </defs>
            <g clipPath="url(#heart-clip)">
              <rect width="24" height="24" fill="#1c1611"/>
              {[...Array(6)].map((_, y) => [...Array(6)].map((_, x) => {
                const on = (x*y + x + y) % 3 === 0;
                return on ? <rect key={`${x}-${y}`} x={2+x*3.4} y={3+y*3} width="2.6" height="2.6" fill="#f5ead0"/> : null;
              }))}
            </g>
            <path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.5-7 10-7 10z" fill="none" stroke="#d6557a" strokeWidth="0.8"/>
          </svg>
        </div>
        <div className="fc-qr-meta">
          <div className="fc-qr-t">QR personnalisé</div>
          <div className="fc-qr-s">en forme de cœur</div>
        </div>
      </div>

      <div className="float-card fc-eng">
        <div className="fc-eng-num serif italic">+24</div>
        <div className="fc-eng-meta">
          <div className="fc-eng-t">Contributeurs</div>
          <div className="fc-eng-s">ont laissé un mot</div>
        </div>
      </div>

      <div className="phone" aria-hidden>
        <div className="phone-notch"></div>
        <div className="phone-screen">
          <div className="ps-confetti">
            {[...Array(8)].map((_, i) => <i key={i} style={{ left: (i*12+4)+'%', animationDelay: (i*0.5)+'s' }}/>)}
          </div>
          <div className="ps-cake">
            <div className="ps-flame"></div>
            <div className="ps-candle"></div>
            <div className="ps-top"></div>
            <div className="ps-base"></div>
          </div>
          <div className="ps-title serif italic">Joyeux<br/>Anniversaire</div>
          <div className="ps-sub">Aminata · 32 ans</div>
          <div className="ps-photos">
            {[...Array(6)].map((_, i) => <div key={i} className={`ps-photo p${i}`}/>)}
          </div>
          <div className="ps-cta">Regarder l'animation</div>
        </div>
      </div>
    </div>
  );
}

export default function Hero({ onOrder }) {
  const [ref, seen] = useReveal();
  return (
    <header className="hero" ref={ref}>
      <div className="hero-bg" aria-hidden>
        <div className="hero-orb o1"></div>
        <div className="hero-orb o2"></div>
        <div className="hero-grid"></div>
      </div>

      <div className="wrap hero-inner">
        <div className={`hero-copy ${seen ? 'revealed' : 'reveal'}`}>
          <span className="eyebrow"><span className="dot"></span> Le studio de vœux animés</span>
          <h1 className="hero-h">
            Des <em className="serif italic">vœux</em><br/>
            qui se <em className="serif italic">gardent.</em>
          </h1>
          <p className="hero-sub">
            myKado est une plateforme pour concevoir, personnaliser et partager des
            vœux animés  anniversaires, mariages, hommages, célébrations d'équipe.
            <strong> Personnalisation gratuite</strong>, paiement en crédits uniquement
            pour publier.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary" onClick={onOrder}>
              Créer mon vœu gratuitement <span className="arr">→</span>
            </button>
            <a href="#templates" className="btn btn-ghost">Voir les templates</a>
          </div>

          <div className="hero-trust">
            <span className="coin"/>
            <span><strong>1 crédit = 500 FCFA</strong> (≈ 0,76 €) · Sans abonnement · Sans frais cachés</span>
          </div>
        </div>

        <div className={`hero-stage ${seen ? 'revealed' : 'reveal'}`} style={{ transitionDelay: '.15s' }}>
          <HeroStage/>
        </div>
      </div>
    </header>
  );
}
