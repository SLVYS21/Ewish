import { motion } from 'framer-motion';
import { Gift, Users, Globe2, Sparkles } from 'lucide-react';
import s from './WhyMyKado.module.css';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

export default function WhyMyKado() {
  return (
    <section className={s.section}>
      <div className="mk-container">
        <motion.div 
          className={s.header}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={fadeIn}
        >
          <span className="eyebrow">Pourquoi myKado ?</span>
          <h2 className="mk-sec-h2">Parce qu'un "Joyeux Anniversaire" sur WhatsApp ne suffit plus.</h2>
          <p className="mk-sec-sub">
            Organiser un cadeau commun ou surprendre un proche à distance est souvent un casse-tête. 
            Entre les cagnottes compliquées, la distance et le manque d'idées, on finit souvent par la solution de facilité.
          </p>
        </motion.div>

        <div className={s.grid}>
          <motion.div 
            className={s.card}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
          >
            <div className={s.iconWrapper}><Users className={s.icon} /></div>
            <h3>Réunissez tout le monde</h3>
            <p>Plus besoin de courir après les participations. Famille, amis, collègues... tout le monde peut laisser un mot et contribuer en un clic.</p>
          </motion.div>

          <motion.div 
            className={s.card}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.2 }}
          >
            <div className={s.iconWrapper}><Globe2 className={s.icon} /></div>
            <h3>La distance n'existe plus</h3>
            <p>Que vous soyez à Dakar, Paris ou Abidjan, célébrez ensemble. Les paiements Mobile Money et cartes bancaires rendent cela universel.</p>
          </motion.div>

          <motion.div 
            className={s.card}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ delay: 0.4 }}
          >
            <div className={s.iconWrapper}><Sparkles className={s.icon} /></div>
            <h3>L'émotion garantie</h3>
            <p>Oubliez les cadeaux sans âme. Une belle carte animée ou un mur rempli de souvenirs a souvent plus de valeur que le cadeau lui-même.</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
