import { useReveal } from '../hooks/useReveal';

function QRShape({ shape, featured }) {
  const matrix = [];
  for (let y = 0; y < 7; y++) {
    for (let x = 0; x < 7; x++) {
      const on = ((x * 3 + y * 7 + (x*y)) % 4) > 0;
      if (on) matrix.push({ x, y });
    }
  }
  const clipPath = {
    square: 'none',
    round:  'circle(48% at 50% 50%)',
    heart:  "path('M50 90 C 10 60, 10 25, 35 25 C 45 25, 50 35, 50 40 C 50 35, 55 25, 65 25 C 90 25, 90 60, 50 90 Z')",
    petal:  "path('M50 5 C 75 25, 95 50, 50 95 C 5 50, 25 25, 50 5 Z')",
  }[shape];
  return (
    <div className={`qr-shape ${featured ? 'qr-featured' : ''}`}>
      <div className="qr-wrap" style={{ clipPath, WebkitClipPath: clipPath }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {matrix.map((m, i) => (
            <rect key={i} x={10 + m.x*11} y={10 + m.y*11} width="9" height="9"
              fill={featured ? 'var(--rose-d)' : 'var(--ink)'} rx="1.5"/>
          ))}
        </svg>
      </div>
      <span className="qr-label">{shape}</span>
    </div>
  );
}

export default function Features() {
  const [ref, seen] = useReveal();
  return (
    <section className="section section-perso">
      <div className="wrap">
        <div className="section-head">
          <span className="eyebrow"><span className="dot"></span> Personnalisation</span>
          <h2>Vos photos, vos mots,<br/><em>votre signature</em>.</h2>
          <p>
            Chaque vœu se conçoit comme un objet artisanal : choisissez votre template,
            uploadez vos photos, ajoutez votre musique, et habillez le partage à votre image.
          </p>
        </div>

        <div ref={ref} className="perso-grid">
          <div className={`perso-card pc-photos ${seen ? 'revealed' : 'reveal'}`}>
            <div className="perso-visual">
              <div className="perso-photos-stack">
                <div className="pps p0"></div>
                <div className="pps p1"></div>
                <div className="pps p2"></div>
                <div className="pps p3"></div>
              </div>
              <div className="perso-music">
                <div className="perso-music-bars">
                  <span/><span/><span/><span/><span/><span/><span/>
                </div>
                <div className="perso-music-meta">
                  <div className="pmm-t">Sénégal mon rythme</div>
                  <div className="pmm-s">Youssou N'Dour · 2:14</div>
                </div>
              </div>
            </div>
            <div className="perso-body">
              <span className="pill pill-rose">Photos &amp; musique</span>
              <h3 className="serif italic">Jusqu'à 24 photos, votre bande-son.</h3>
              <p>
                Importez vos clichés et choisissez une musique dans la bibliothèque,
                ou uploadez un MP3 perso. Pas de durée imposée.
              </p>
            </div>
          </div>

          <div className={`perso-card pc-qr ${seen ? 'revealed' : 'reveal'}`} style={{ transitionDelay: '.1s' }}>
            <div className="perso-visual">
              <div className="qr-row">
                <QRShape shape="square"/>
                <QRShape shape="round"/>
                <QRShape shape="heart" featured/>
                <QRShape shape="petal"/>
              </div>
            </div>
            <div className="perso-body">
              <span className="pill pill-gold">QR code stylisé</span>
              <h3 className="serif italic">Carré, rond, cœur, pétale  à vos couleurs.</h3>
              <p>
                Le QR n'a plus à être laid. Choisissez la forme, l'accent, et même un logo
                au centre. Imprimable sur invitation papier.
              </p>
            </div>
          </div>

          <div className={`perso-card pc-cta ${seen ? 'revealed' : 'reveal'}`} style={{ transitionDelay: '.2s' }}>
            <div className="perso-visual">
              <div className="cta-wish">
                <div className="cw-h">Joyeux anniversaire,<br/>Aminata.</div>
                <div className="cw-sub"> De toute l'équipe</div>
                <div className="cw-buttons">
                  <span className="cw-btn cw-btn-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12c0 2.1.5 4.1 1.5 5.9L0 24l6.3-1.6c1.7 1 3.7 1.5 5.7 1.5 6.6 0 12-5.4 12-12S18.6 0 12 0z"/></svg>
                    WhatsApp Atelier YALA
                  </span>
                  <span className="cw-btn cw-btn-2">Voir notre catalogue</span>
                </div>
              </div>
            </div>
            <div className="perso-body">
              <span className="pill pill-em">Bouton CTA personnalisé</span>
              <h3 className="serif italic">Un lien vers vous : site, WhatsApp, offre.</h3>
              <p>
                Si vous êtes une marque, chaque vœu envoyé devient un point de contact.
                Ajoutez le bouton de votre choix  discret, mais présent.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
