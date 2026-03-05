import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import s from './Testimonials.module.css';

const TESTIMONIALS = [
  { initial: 'A', name: 'Aminata K.', role: 'Pour son mari', text: 'J\'ai commandé pour l\'anniversaire de mon mari. Il a fondu en larmes. Les photos, la musique, tout était parfait. Merci !', stars: 5 },
  { initial: 'C', name: 'Christian M.', role: 'DRH, entreprise de 80 pers.', text: 'On a fait le collectif pro pour le départ à la retraite de notre directeur. 40 collègues ont participé. Une expérience inoubliable.', stars: 5 },
  { initial: 'F', name: 'Fatou D.', role: 'Pour sa mère', text: 'Simple à commander, livré en moins de 24h, et vraiment beau. Ma mère l\'a regardé trois fois de suite !', stars: 5 },
  { initial: 'J', name: 'Jean-Pierre T.', role: 'Pour une surprise d\'équipe', text: 'Le lien de partage a été envoyé à toute l\'équipe, tout le monde a ajouté son mot. Le résultat était magique.', stars: 5 },
];

export default function Testimonials() {
  const [ref, inView] = useInView();

  return (
    <section className={s.section} ref={ref}>
      <div className={s.container}>
        <motion.div
          className={s.header}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className={s.eyebrow}>✦ Ils nous font confiance</p>
          <h2 className={s.title}>Des vœux qui <em>restent</em></h2>
        </motion.div>

        <div className={s.grid}>
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={i}
              className={s.card}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4 }}
            >
              <div className={s.stars}>{Array(t.stars).fill('★').join('')}</div>
              <blockquote className={s.quote}>"{t.text}"</blockquote>
              <div className={s.author}>
                <div className={s.avatar}>{t.initial}</div>
                <div>
                  <div className={s.name}>{t.name}</div>
                  <div className={s.role}>{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}