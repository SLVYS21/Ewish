import { motion } from 'framer-motion';
import s from './Hero.module.css';

const WORDS = ['touchent', 'émeuvent', 'restent'];

const sentence = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.04, delayChildren: 0.3 } },
};
const letter = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { ease: [0.22, 1, 0.36, 1], duration: 0.5 } },
};

function AnimatedWord({ word, delay = 0 }) {
  return (
    <motion.span
      className={s.animWord}
      initial="hidden"
      animate="visible"
      variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.035, delayChildren: delay } } }}
    >
      {word.split('').map((c, i) => (
        <motion.span key={i} variants={letter} className={s.char}>
          {c === ' ' ? '\u00A0' : c}
        </motion.span>
      ))}
    </motion.span>
  );
}

export default function Hero({ onOrder }) {
  return (
    <section className={s.hero}>
      {/* Background orbs */}
      <div className={s.orb1} />
      <div className={s.orb2} />
      <div className={s.grain} />

      <div className={s.inner}>
        {/* Eyebrow */}
        <motion.p
          className={s.eyebrow}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          ✦ Vœux animés personnalisés
        </motion.p>

        {/* Headline */}
        <h1 className={s.headline}>
          <span className={s.line}>
            <AnimatedWord word="Des" delay={0.2} />
            {' '}
            <AnimatedWord word="vœux" delay={0.35} />
            {' '}
            <em className={s.italic}>
              <AnimatedWord word="qui" delay={0.5} />
            </em>
          </span>
          <span className={s.line}>
            <motion.span
              className={s.rotating}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              <AnimatedWord word="touchent" delay={0.9} />
            </motion.span>
            {' '}
            <AnimatedWord word="vraiment" delay={1.1} />
          </span>
        </h1>

        {/* Sub */}
        <motion.p
          className={s.sub}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
        >
          Anniversaires, fêtes d'équipe, hommages collectifs —<br />
          des animations sur-mesure livrées en 24h.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className={s.actions}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <button className={s.btnPrimary} onClick={onOrder}>
            Créer mon vœu
          </button>
          <a href="#templates" className={s.btnSecondary}>
            Voir les templates
          </a>
        </motion.div>

        {/* Social proof pill */}
        <motion.div
          className={s.proof}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.3, duration: 0.6 }}
        >
          <div className={s.proofAvatars}>
            {['🎂','🎉','🏆','💌'].map((e, i) => (
              <div key={i} className={s.proofAvatar} style={{ zIndex: 4 - i }}>{e}</div>
            ))}
          </div>
          <span>+340 vœux créés ce mois</span>
        </motion.div>
      </div>

      {/* Floating preview card */}
      <motion.div
        className={s.previewCard}
        initial={{ opacity: 0, x: 60, rotate: 4 }}
        animate={{ opacity: 1, x: 0,  rotate: 2 }}
        transition={{ duration: 1, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className={s.cardInner}>
          <div className={s.cardFilm}>
            <div className={s.filmHole} /><div className={s.filmHole} />
          </div>
          <div className={s.cardEmoji}>🎂</div>
          <div className={s.cardTitle}>Joyeux Anniversaire</div>
          <div className={s.cardSub}>Animation · 24 photos · Musique</div>
          <div className={s.cardBadge}>DEMO</div>
        </div>
      </motion.div>

      {/* Scroll hint */}
      <motion.div
        className={s.scrollHint}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5, duration: 0.8 }}
      >
        <motion.div
          className={s.scrollDot}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        />
      </motion.div>
    </section>
  );
}