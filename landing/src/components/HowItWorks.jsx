import { motion } from 'framer-motion';
import { useInView } from '../hooks/useInView';
import s from './HowItWorks.module.css';

const STEPS = [
  { n: '01', icon: '🎨', title: 'Choisissez votre format', desc: 'Sélectionnez le template qui correspond à votre occasion et renseignez les infos du destinataire.' },
  { n: '02', icon: '📸', title: 'Envoyez vos souvenirs', desc: 'Photos, message personnalisé, musique — tout ce qui rendra ce vœu unique et mémorable.' },
  { n: '03', icon: '✨', title: 'Recevez et partagez', desc: 'Votre animation est prête en 24h. Un lien privé à partager par WhatsApp, email ou réseaux.' },
];

export default function HowItWorks() {
  const [ref, inView] = useInView();

  return (
    <section id="how-it-works" className={s.section} ref={ref}>
      <div className={s.inner}>
        <motion.div
          className={s.header}
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
        >
          <p className={s.eyebrow}>✦ Simple & rapide</p>
          <h2 className={s.title}>En 3 étapes, <em>c'est prêt</em></h2>
        </motion.div>

        <div className={s.steps}>
          {STEPS.map((step, i) => (
            <motion.div
              key={step.n}
              className={s.step}
              initial={{ opacity: 0, y: 40 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.65, delay: 0.15 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className={s.stepNum}>{step.n}</div>
              <div className={s.stepIcon}>{step.icon}</div>
              <h3 className={s.stepTitle}>{step.title}</h3>
              <p className={s.stepDesc}>{step.desc}</p>
              {i < STEPS.length - 1 && <div className={s.connector} />}
            </motion.div>
          ))}
        </div>

        <motion.div
          className={s.bottomCta}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.65 }}
        >
          <p>Livraison garantie en <strong>24 heures</strong> — ou remboursé.</p>
        </motion.div>
      </div>
    </section>
  );
}