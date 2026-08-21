import s from './Hero.module.css';
import NotoEmoji from './NotoEmoji';

/* Emojis flottants autour du hero.
   layer=bg  → flou + opacity basse + plus grand + z-index derrière
   layer=fg  → net + z-index devant, tailles variables
   anim=float|drift|bob → keyframes différentes pour éviter le mouvement uniforme
   mobile   → position/taille alternative pour < 640px (sinon caché) */
const FLOATING_EMOJIS = [
  // BACKGROUND (blurred, subtle, oversized) — hidden on mobile
  { name: 'sparkles',       top: '8%',  left: '4%',   size: 90,  layer: 'bg', anim: 'float', delay: 0,   rotate: -8 },
  { name: 'rainbow',        top: '68%', right: '6%',  size: 110, layer: 'bg', anim: 'drift', delay: 1.2, rotate: 6 },
  { name: 'confetti-ball',  top: '52%', left: '8%',   size: 78,  layer: 'bg', anim: 'bob',   delay: 0.6, rotate: 10 },
  { name: 'star',           top: '18%', right: '3%',  size: 72,  layer: 'bg', anim: 'float', delay: 2.0, rotate: -12 },

  // FOREGROUND (sharp, punchy)
  { name: 'party-popper',   top: '14%', left: '10%',  size: 56,  layer: 'fg', anim: 'drift', delay: 0.3, rotate: -14,
    mobile: { top: '2%',  left: '4%',  size: 40 } },
  { name: 'wrapped-gift',   top: '58%', left: '14%',  size: 52,  layer: 'fg', anim: 'bob',   delay: 0.9, rotate: 8,
    mobile: { top: 'auto', bottom: '4%', left: '4%',  size: 38 } },
  { name: 'balloon',        top: '10%', right: '12%', size: 58,  layer: 'fg', anim: 'float', delay: 1.5, rotate: 6,
    mobile: { top: '2%',  right: '4%', size: 42 } },
  { name: 'birthday-cake',  top: '62%', right: '14%', size: 54,  layer: 'fg', anim: 'drift', delay: 0.5, rotate: -6,
    mobile: { top: 'auto', bottom: '4%', right: '4%', size: 40 } },
  { name: 'sparkling-heart',top: '32%', left: '5%',   size: 40,  layer: 'fg', anim: 'bob',   delay: 1.8, rotate: 12 },
  { name: 'folded-hands',   top: '40%', right: '4%',  size: 42,  layer: 'fg', anim: 'float', delay: 0.8, rotate: -8 },
];

export default function Hero({ onCreate }) {
  return (
    <section className={s.hero}>
      <div className={s.floatingLayer} aria-hidden="true">
        {FLOATING_EMOJIS.map((e, i) => {
          const m = e.mobile;
          const style = {
            top: e.top,
            left: e.left,
            right: e.right,
            width: e.size,
            height: e.size,
            animationDelay: `${e.delay}s`,
            '--r': `${e.rotate}deg`,
          };
          if (m) {
            if (m.top !== undefined)    style['--m-top']    = m.top;
            if (m.bottom !== undefined) style['--m-bottom'] = m.bottom;
            if (m.left !== undefined)   style['--m-left']   = m.left;
            if (m.right !== undefined)  style['--m-right']  = m.right;
            if (m.size !== undefined)   style['--m-size']   = `${m.size}px`;
          }
          return (
            <span
              key={i}
              className={`${s.floater} ${s[`layer_${e.layer}`]} ${s[`anim_${e.anim}`]} ${m ? s.hasMobile : ''}`}
              style={style}
            >
              <NotoEmoji name={e.name} size={e.size} />
            </span>
          );
        })}
      </div>

      <div className={`mk-container ${s.container}`}>
        <div className={s.content}>
          <div className={s.dealBadge}>
            {/* <span role="img" aria-label="rainbow">🌈</span>
            <span>OFFRE À VIE À PARTIR DE 59$</span> */}
          </div>

          <h1 className={s.h1}>
            Faites de chaque occasion un<br />
            souvenir <span className={s.highlightStatic}>inoubliable.</span>
          </h1>

          <p className={s.sub}>
            Anniversaires, déclarations, départs... Envoyez seul ou ensemble une attention magique.
          </p>

          <div className={s.actions}>
            <button className={s.demoBtn} onClick={onCreate}>
              Créer une carte
            </button>
            <a href="#inspirations" className={s.secondaryBtn}>
              Explorer les démos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
