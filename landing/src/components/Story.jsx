import { useRef, useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import s from './Story.module.css';
import NotoEmoji from './NotoEmoji';

/* ══════════════════════════════════════════════════════════════════
   Story — narration "Stella" en 5 slides stacking cards
   ──────────────────────────────────────────────────────────────────
   Section placée juste après le Hero pour capter les visiteurs qui
   se demandent « c'est quoi myKado ? ». On raconte un mini-scénario
   universel : anniversaire → panne d'inspi → carte perso → kado
   → collaboratif → démo.

   Mécanique :
   - Section tall (N * 100vh) + child sticky (100vh)
   - useScroll pilote la position de chaque card via useTransform
   - Desktop : deck fanned (offset + rotation) qui s'ouvre au scroll
   - Mobile  : stacking pur (une card à la fois)
   - Texte : mot par mot, chaque mot bindé à une slice du scroll
   ══════════════════════════════════════════════════════════════════ */

const SLIDES = [
  {
    id: 'context',
    bg: '#E25B45',                         /* coral-500 */
    ink: '#FDFBF7',                        /* paper-noble */
    accent: 'rgba(253, 251, 247, 0.16)',
    ctaBg: '#FDFBF7',
    ctaInk: '#E25B45',
    emoji: 'birthday-cake',
    eyebrow: 'Le jour J',
    title: "C'est l'anniversaire de Stella.",
    text: "Tu veux lui faire un geste qui compte. Un truc à elle. Un truc qu'elle garde.",
  },
  {
    id: 'blocage',
    bg: '#F8BE68',                         /* honey-300 solaire */
    ink: '#201524',                        /* plum-800 */
    accent: 'rgba(32, 21, 36, 0.10)',
    emoji: 'eyes',
    eyebrow: 'Le blocage',
    title: "Mais tu n'as aucune idée.",
    text: "Encore un message WhatsApp. Encore une bougie en story. Chaque année, la même page blanche.",
  },
  {
    id: 'carte',
    bg: '#201524',                         /* plum-800 profond */
    ink: '#FDFBF7',
    accent: 'rgba(253, 251, 247, 0.12)',
    emoji: 'love-letter',
    eyebrow: 'La carte',
    title: "Avec myKado, tu lui fais une carte à son image.",
    text: "Une musique qu'elle aime. Vos photos. Ta voix. Un mot manuscrit. Tout dans un seul lien.",
  },
  {
    id: 'kado',
    bg: '#E9A23B',                         /* honey-500 */
    ink: '#201524',
    accent: 'rgba(32, 21, 36, 0.12)',
    emoji: 'money-bag',
    eyebrow: 'Le kado',
    title: "Tu peux même y glisser un kado.",
    text: "Quelques billets, un lien wishlist, un bon cadeau. La carte devient une vraie enveloppe.",
  },
  {
    id: 'ensemble',
    bg: '#F46A54',                         /* coral-400 punchy */
    ink: '#FDFBF7',
    accent: 'rgba(253, 251, 247, 0.18)',
    ctaBg: '#201524',
    ctaInk: '#FDFBF7',
    emoji: 'sparkling-heart',
    eyebrow: 'À plusieurs',
    title: "Et vous pouvez le faire ensemble.",
    text: "Sa bande, sa famille, ses collègues — chacun dépose son mot. Elle ouvre. Elle en revient pas.",
    cta: 'Passer à la démo',
  },
];

/* ── HOOK · détection mobile (matchMedia) ─────────────────────── */
function useIsMobile(breakpoint = 900) {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const upd = () => setIsMobile(mq.matches);
    upd();
    const on = mq.addEventListener?.bind(mq) || mq.addListener?.bind(mq);
    const off = mq.removeEventListener?.bind(mq) || mq.removeListener?.bind(mq);
    on?.('change', upd);
    return () => off?.('change', upd);
  }, [breakpoint]);
  return isMobile;
}

/* ══════════════════════════════════════════════════════════════════
   RevealWord — un mot dont l'opacité + y + blur suivent le scroll
   ══════════════════════════════════════════════════════════════════ */
function RevealWord({ progress, range, children }) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  const y = useTransform(progress, range, [12, 0]);
  const blur = useTransform(progress, range, ['blur(6px)', 'blur(0px)']);
  return (
    <motion.span className={s.word} style={{ opacity, y, filter: blur }}>
      {children}
    </motion.span>
  );
}

/* ══════════════════════════════════════════════════════════════════
   StoryCard — une slide
   ══════════════════════════════════════════════════════════════════ */
function StoryCard({ slide, i, N, progress, isMobile, onCta }) {
  const seg = 1 / N;
  const isLast = i === N - 1;

  /* Fenêtres de transition (en fraction de progress global) */
  const enterStart = Math.max(-0.001, i * seg - seg * 0.45);
  const enterEnd   = i * seg;
  const exitStart  = (i + 1) * seg - seg * 0.4;
  const exitEnd    = (i + 1) * seg;

  /* ── Deck : position de repos derrière la card active ─────────
     Desktop : offset vertical + rotation alternée pour un effet
     "dossiers empilés dans un angle".
     Mobile  : la card est cachée en dessous (100vh), stacking pur. */
  const deckY      = isMobile ? '105vh' : `${18 + i * 16}px`;
  const deckRotate = isMobile ? 0 : (i % 2 === 0 ? -1 : 1) * (2 + i * 0.9);
  const deckScale  = isMobile ? 1 : Math.max(0.96 - i * 0.018, 0.88);

  /* Ranges piecewise. Pour la dernière card, on n'a pas de sortie. */
  const yRange     = isLast ? [enterStart, enterEnd] : [enterStart, enterEnd, exitStart, exitEnd];
  const yValues    = isLast
    ? [deckY, '0px']
    : [deckY, '0px', '0px', '-115vh'];

  const rRange     = isLast ? [enterStart, enterEnd] : [enterStart, enterEnd, exitStart, exitEnd];
  const rValues    = isLast
    ? [deckRotate, 0]
    : [deckRotate, 0, 0, -2];

  const sRange     = isLast ? [enterStart, enterEnd] : [enterStart, enterEnd, exitStart, exitEnd];
  const sValues    = isLast
    ? [deckScale, 1]
    : [deckScale, 1, 1, 0.94];

  const oRange     = isLast ? [enterStart, enterEnd] : [enterStart, enterEnd, exitStart, exitEnd];
  const oValues    = isLast
    ? [isMobile ? 0 : 0.9, 1]
    : [isMobile ? 0 : 0.9, 1, 1, isMobile ? 0 : 0.85];

  const y       = useTransform(progress, yRange, yValues);
  const rotate  = useTransform(progress, rRange, rValues);
  const scale   = useTransform(progress, sRange, sValues);
  const opacity = useTransform(progress, oRange, oValues);

  /* Fenêtre de reveal texte : de -15% du seg avant le centre à +55% après */
  const revealStart = Math.max(0, i * seg - seg * 0.15);
  const revealEnd   = i * seg + seg * 0.6;

  const titleWords = slide.title.split(' ');
  const textWords  = slide.text.split(' ');

  /* Le titre se révèle sur la première moitié du reveal ; le texte suit */
  const titleWindow = [revealStart, revealStart + (revealEnd - revealStart) * 0.45];
  const textWindow  = [revealStart + (revealEnd - revealStart) * 0.3, revealEnd];

  const wordRange = (words, wi, window) => {
    const [ws, we] = window;
    const step = (we - ws) / words.length;
    const start = ws + wi * step;
    const end   = Math.min(ws + (wi + 1.4) * step, 1);
    return [start, end];
  };

  return (
    <motion.article
      className={s.card}
      style={{
        y,
        rotate,
        scale,
        opacity,
        zIndex: N - i,               /* première card sur le dessus */
        background: slide.bg,
        color: slide.ink,
      }}
      aria-label={`Étape ${i + 1} sur ${N}`}
    >
      <div className={s.cardGrid} aria-hidden />

      <div className={s.cardBg} aria-hidden>
        <NotoEmoji name={slide.emoji} size={isMobile ? 240 : 380} static />
      </div>

      <div className={s.cardHead}>
        <span className={s.eyebrow} style={{ background: slide.accent }}>
          <span className={s.eyebrowNum}>{String(i + 1).padStart(2, '0')}</span>
          <span className={s.eyebrowSep} aria-hidden />
          <span className={s.eyebrowLabel}>{slide.eyebrow}</span>
        </span>
        <span className={s.emojiWrap}>
          <NotoEmoji name={slide.emoji} size={isMobile ? 56 : 88} />
        </span>
      </div>

      <div className={s.cardBody}>
        <h2 className={s.title}>
          {titleWords.map((word, wi) => (
            <span key={wi}>
              <RevealWord
                progress={progress}
                range={wordRange(titleWords, wi, titleWindow)}
              >
                {word}
              </RevealWord>
              {wi < titleWords.length - 1 && ' '}
            </span>
          ))}
        </h2>

        <p className={s.text}>
          {textWords.map((word, wi) => (
            <span key={wi}>
              <RevealWord
                progress={progress}
                range={wordRange(textWords, wi, textWindow)}
              >
                {word}
              </RevealWord>
              {wi < textWords.length - 1 && ' '}
            </span>
          ))}
        </p>

        {slide.cta && (
          <motion.button
            type="button"
            className={s.cta}
            onClick={onCta}
            style={{
              background: slide.ctaBg || slide.ink,
              color: slide.ctaInk || slide.bg,
            }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ delay: 0.35, duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          >
            <span>{slide.cta}</span>
            <span className={s.ctaArrow} aria-hidden>
              <ArrowRight size={18} strokeWidth={2.6} />
            </span>
          </motion.button>
        )}
      </div>

      <div className={s.cardFoot}>
        <span className={s.cardIndex}>
          {String(i + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}
        </span>
        <span className={s.cardDots} aria-hidden>
          {Array.from({ length: N }).map((_, di) => (
            <span
              key={di}
              className={`${s.cardDot} ${di === i ? s.cardDotActive : ''}`}
            />
          ))}
        </span>
      </div>
    </motion.article>
  );
}

/* ══════════════════════════════════════════════════════════════════
   Story — orchestrateur : useScroll global + N cards
   ══════════════════════════════════════════════════════════════════ */
export default function Story({ onDemoClick }) {
  const sectionRef = useRef(null);
  const isMobile = useIsMobile();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  });

  const N = SLIDES.length;

  const scrollToDemo = () => {
    if (typeof onDemoClick === 'function') {
      onDemoClick();
      return;
    }
    const el = document.getElementById('inspirations');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section
      ref={sectionRef}
      className={s.section}
      id="story"
      style={{ height: `${N * 100}vh` }}
      aria-label="Comment ça marche — histoire de Stella"
    >
      <div className={s.stage}>
        {SLIDES.map((slide, i) => (
          <StoryCard
            key={slide.id}
            slide={slide}
            i={i}
            N={N}
            progress={scrollYProgress}
            isMobile={isMobile}
            onCta={scrollToDemo}
          />
        ))}
      </div>
    </section>
  );
}
