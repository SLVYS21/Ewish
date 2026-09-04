import { useEffect, useState } from 'react';
import { ArrowRight, Play } from 'lucide-react';
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
    mobile: { top: '1%',  left: '3%',  size: 34 } },
  /* wrapped-gift & birthday-cake : plus de mobile config → cachés en <768px
     car ils tombaient sur les format badges. Le hero garde deux emojis
     discrets en haut (party-popper + balloon), suffisant pour la touche
     festive sans polluer le contenu. */
  { name: 'wrapped-gift',   top: '58%', left: '14%',  size: 52,  layer: 'fg', anim: 'bob',   delay: 0.9, rotate: 8 },
  { name: 'balloon',        top: '10%', right: '12%', size: 58,  layer: 'fg', anim: 'float', delay: 1.5, rotate: 6,
    mobile: { top: '1%',  right: '3%', size: 36 } },
  { name: 'birthday-cake',  top: '62%', right: '14%', size: 54,  layer: 'fg', anim: 'drift', delay: 0.5, rotate: -6 },
  { name: 'sparkling-heart',top: '32%', left: '5%',   size: 40,  layer: 'fg', anim: 'bob',   delay: 1.8, rotate: 12 },
  { name: 'folded-hands',   top: '40%', right: '4%',  size: 42,  layer: 'fg', anim: 'float', delay: 0.8, rotate: -8 },
];

/* Émotions cyclées après le point de "inoubliable."
   Chaque emoji illustre une émotion qu'on peut faire passer au destinataire. */
const EMOTION_EMOJIS = [
  'partying-face',
  'heart-eyes',
  'star-struck',
  'smiling-face-hearts',
  'grinning-squinting',
  'sparkling-heart',
];

export default function Hero({ onCreate }) {
  const [emotionIdx, setEmotionIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setEmotionIdx((i) => (i + 1) % EMOTION_EMOJIS.length);
    }, 1600);
    return () => clearInterval(id);
  }, []);

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
            '--r': `${e.rotate}deg`,
            '--enter-delay': `${0.4 + i * 0.06}s`,
            '--float-delay': `${e.delay}s`,
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
              className={`${s.floater} ${s[`layer_${e.layer}`]} ${m ? s.hasMobile : ''}`}
              style={style}
            >
              <span className={`${s.floaterInner} ${s[`anim_${e.anim}`]}`}>
                <NotoEmoji name={e.name} size={e.size} />
              </span>
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
            <span className={s.line1}>Faites de chaque occasion un</span>
            <span className={s.line2}>
              souvenir <span className={s.highlightStatic}>inoubliable.</span>
              <span className={s.emotionSlot} aria-hidden="true">
                {EMOTION_EMOJIS.map((name, i) => (
                  <span
                    key={name}
                    className={`${s.emotion} ${i === emotionIdx ? s.emotionActive : ''}`}
                  >
                    <NotoEmoji name={name} size={64} />
                  </span>
                ))}
              </span>
            </span>
          </h1>

          <p className={s.sub}>
            Un <strong>mur collaboratif</strong> où tout le monde dépose mots, photos & vidéos —
            ou une <strong>carte solo animée</strong>, à ouvrir comme un cadeau.
            Un lien, un QR, un souvenir gardé pour toujours.
          </p>

          <div className={s.actions}>
            <button className={s.demoBtn} onClick={onCreate}>
              <span>Créer une carte</span>
              <ArrowRight size={18} strokeWidth={2.4} aria-hidden />
            </button>
            <a href="#inspirations" className={s.secondaryBtn} aria-label="Voir les démos">
              <span className={s.playCircle} aria-hidden>
                <Play size={12} strokeWidth={0} fill="currentColor" />
              </span>
              <span className={s.secondaryLabel}>Voir les démos ↓</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
