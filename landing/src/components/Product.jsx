import { useEffect, useRef } from 'react';
import s from './Product.module.css';

export default function Product() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const items = el.querySelectorAll('[data-reveal]');
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add(s.revealed); io.unobserve(e.target); } });
    }, { threshold: 0.1 });
    items.forEach(item => io.observe(item));
    return () => io.disconnect();
  }, []);

  return (
    <section className={s.product} id="product" ref={ref}>
      <div className={s.productGrid}>
        {/* Copy */}
        <div className={s.productCopy}>
          <span className={`${s.eyebrow} ${s.reveal}`} data-reveal>
            <span className={s.dot}></span> Qu'est-ce que myKado ?
          </span>
          <h2 className={`${s.title} ${s.reveal}`} data-reveal>
            Bien plus qu'une carte <br />
            <em>une expérience</em> à offrir.
          </h2>
          <p className={`${s.reveal}`} data-reveal style={{ transitionDelay: '.16s' }}>
            myKado est un <strong>studio de création en ligne</strong> qui transforme un message
            de vœux en mini-site animé : photos, musique, décors thématiques, QR code stylisé
            et lien promotionnel personnalisable. En quelques minutes, vous publiez une page
            mémorable que vos destinataires reçoivent et conservent.
          </p>
          <p className={`${s.reveal}`} data-reveal style={{ transitionDelay: '.22s' }}>
            Particuliers, équipes RH ou agences évènementielles  myKado s'adapte au moment,
            à votre budget et à votre charte graphique.
          </p>
          <ul className={s.productList}>
            {[
              { d: '.28s', strong: 'Éditeur intuitif', desc: ' pas besoin de compétences techniques, glissez-déposez vos photos.' },
              { d: '.34s', strong: 'Partage instantané', desc: ' un lien privé, un QR code, ou diffusion par WhatsApp et email.' },
              { d: '.40s', strong: 'Contributions collectives', desc: ' invitez famille ou collègues à ajouter leurs messages.' },
              { d: '.46s', strong: 'Branding entreprise', desc: " logos, couleurs et liens promo intégrés à l'animation." },
            ].map((item, i) => (
              <li key={i} className={`${s.reveal}`} data-reveal style={{ transitionDelay: item.d }}>
                <span className={s.tick}>✓</span>
                <span><strong>{item.strong}</strong> {item.desc}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Visual */}
        <div className={`${s.productVisual} ${s.reveal}`} data-reveal style={{ transitionDelay: '.2s' }}>
          <div className={s.browser}>
            <div className={s.browserBar}>
              <span className={`${s.browserDot} ${s.r}`}></span>
              <span className={`${s.browserDot} ${s.y}`}></span>
              <span className={`${s.browserDot} ${s.g}`}></span>
              <span className={s.browserUrl}>
                <span className={s.lock}>●</span> studio.mykado.app/edit/aminata-32
              </span>
            </div>
            <div className={s.browserBody}>
              <aside className={s.editorSide}>
                <span className={s.esLabel}>Édition</span>
                <div className={`${s.esItem} ${s.active}`}><span className={s.ic}>★</span> Template</div>
                <div className={s.esItem}><span className={s.ic}>▣</span> Photos</div>
                <div className={s.esItem}><span className={s.ic}>♪</span> Musique</div>
                <div className={s.esItem}><span className={s.ic}>◉</span> Décors</div>
                <div className={s.esItem}><span className={s.ic}>▦</span> QR code</div>
                <div className={s.esItem}><span className={s.ic}>↗</span> Lien promo</div>
              </aside>
              <div className={s.editorMain}>
                <div className={`${s.editorTool} ${s.t1}`}>
                  <span className={s.swatch} style={{ background: 'linear-gradient(135deg,#c9a84c,#e05574)' }}></span>
                  Thème · Rose &amp; or
                </div>
                <div className={s.editorCanvas}>
                  <div className={s.ecH}>Joyeux <em>Anniversaire</em></div>
                  <div className={s.ecS}>Aminata K.</div>
                  <div className={s.ecPhoto}></div>
                  <div className={s.ecQr}></div>
                </div>
                <div className={`${s.editorTool} ${s.t2}`}>
                  <span className={s.swatch} style={{ background: '#25d366' }}></span>
                  Partager via WhatsApp
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
