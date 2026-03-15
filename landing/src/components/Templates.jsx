import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import { getTemplates } from '../utils/api';
import s from './Templates.module.css';

const FALLBACK = [
  { name: 'birthday',          label: 'Birthday Wish',      emoji: '🎂', price: 5000,  description: 'Animation complète avec photos, musique et vœux personnalisés.',      gradient: 'linear-gradient(135deg,#ff9a9e,#fecfef,#ffecd2)', highlights: ['Jusqu\'à 24 photos','Musique au choix','Livraison en 24h'] },
  { name: 'special',           label: 'Vœu Spécial',        emoji: '✨', price: 6000,  description: 'Pour les occasions uniques qui méritent un traitement d\'exception.',   gradient: 'linear-gradient(135deg,#a18cd1,#fbc2eb)',            highlights: ['Thème personnalisé','Effets premium','Vidéo HD'] },
  { name: 'collective-family', label: 'Collectif Famille',  emoji: '🎉', price: 8000,  description: 'Chaque proche ajoute son message et sa photo — un souvenir partagé.',  gradient: 'linear-gradient(135deg,#f093fb,#f5576c)',            highlights: ['Vœux collectifs','Galerie photos','Lien de partage'] },
  { name: 'collective-pro',    label: 'Collectif Pro',      emoji: '🏆', price: 10000, description: 'Pour célébrer vos équipes avec classe et professionnalisme.',           gradient: 'linear-gradient(135deg,#1e3a5f,#c9a84c)',            highlights: ['Branding entreprise','Signatures collègues','Export HD'] },
];

function fmtPrice(p) { return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'; }

const cardVariants = {
  hidden:  { opacity: 0, y: 40 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] } }),
};

export default function Templates({ onSelectTemplate }) {
  const [templates, setTemplates] = useState(FALLBACK);
  const [hovered, setHovered]     = useState(null);
  const [ref, inView]             = useInView();

  useEffect(() => {
    getTemplates()
      .then(data => { if (data?.length) setTemplates(data); })
      .catch(() => {}); // use fallback silently
  }, []);

  return (
    <section id="templates" className={s.section} ref={ref}>
      <div className={s.container}>

        {/* Header */}
        <motion.div
          className={s.header}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={s.eyebrow}>✦ Nos formats</p>
          <h2 className={s.title}>Choisissez votre <em>format</em></h2>
          <p className={s.sub}>Chaque template est une expérience complète — pas un simple diaporama.</p>
        </motion.div>

        {/* Grid */}
        <div className={s.grid}>
          {templates.map((t, i) => (
            <motion.div
              key={t.name}
              className={`${s.card} ${hovered === t.name ? s.hovered : ''}`}
              custom={i}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              variants={cardVariants}
              onHoverStart={() => setHovered(t.name)}
              onHoverEnd={() => setHovered(null)}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 300, damping: 24 }}
            >
              {/* Gradient thumb */}
              <div className={s.thumb} style={{ background: t.gradient || FALLBACK.find(f=>f.name===t.name)?.gradient }}>
                <motion.span
                  className={s.thumbEmoji}
                  animate={hovered === t.name ? { scale: 1.15, rotate: [0, -8, 8, 0] } : { scale: 1 }}
                  transition={{ duration: 0.4 }}
                >
                  {t.emoji || FALLBACK.find(f=>f.name===t.name)?.emoji || '🎁'}
                </motion.span>
                {/* Film strip top */}
                <div className={s.filmStrip}>
                  {[...Array(8)].map((_, j) => <div key={j} className={s.filmHole} />)}
                </div>
              </div>

              {/* Body */}
              <div className={s.body}>
                <div className={s.cardTop}>
                  <h3 className={s.name}>{t.label}</h3>
                  <div className={s.price}>{fmtPrice(t.price)}</div>
                </div>
                <p className={s.desc}>{t.description || FALLBACK.find(f=>f.name===t.name)?.description}</p>

                {/* Highlights */}
                <ul className={s.highlights}>
                  {(t.highlights || FALLBACK.find(f=>f.name===t.name)?.highlights || []).map((h, j) => (
                    <li key={j} className={s.highlight}>
                      <span className={s.dot}>◆</span> {h}
                    </li>
                  ))}
                </ul>

                {/* Actions */}
                <div className={s.actions}>
                  <button className={s.btnOrder} onClick={() => onSelectTemplate(t.name)}>
                    Commander
                  </button>
                  <a href={`${import.meta.env.VITE_API_URL}/preview/${t.name}`} target="_blank" rel="noreferrer" className={s.btnPreview}>
                    Aperçu →
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}