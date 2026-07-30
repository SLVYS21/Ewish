import { motion } from 'framer-motion';
import s from './Business.module.css';

const FEATURES = [
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: 'Répertoire employés',
    desc: 'Importe tes équipes, active les rappels automatiques.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="12" cy="10" r="3" />
        <path d="M7 21v-2a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
      </svg>
    ),
    title: 'Ton branding',
    desc: 'Logo, couleurs, liens vers tes canaux marketing.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M16 13H8" /><path d="M16 17H8" />
      </svg>
    ),
    title: 'Factures compta',
    desc: 'TVA, mentions légales, export XLSX. Prête pour ton expert-comptable.',
  },
  {
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15 8 22 9 17 14 18 21 12 18 6 21 7 14 2 9 9 8 12 2" />
      </svg>
    ),
    title: 'Reconnaissance employés',
    desc: "Employé du mois, anniversaires d'entreprise, meilleurs projets.",
  },
];

const listVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4 } }
};

export default function Business({ onCreate }) {
  return (
    <section id="business" className="mk-section mk-section-inverted">
      <div className="mk-container">
        <div className={s.biz}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="eyebrow">myKado for Business</span>
            <h2 className="mk-sec-h2">Renforce la culture de ton équipe.</h2>
            <p className="mk-sec-sub">
              Célèbre les anniversaires, naissances, mariages, retraites et fêtes de fin d'année
              avec ton branding, tes équipes, et une facturation propre pour la compta.
            </p>

            <motion.ul 
              className={s.list}
              variants={listVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {FEATURES.map((f) => (
                <motion.li key={f.title} className={s.item} variants={itemVariants}>
                  <div className={s.itemIcon}>{f.icon}</div>
                  <div>
                    <div className={s.itemTitle}>{f.title}</div>
                    <div className={s.itemDesc}>{f.desc}</div>
                  </div>
                </motion.li>
              ))}
            </motion.ul>

            <div className={s.actions}>
              <button className="mk-btn mk-btn-gold" onClick={onCreate}>Demander une démo</button>
              <a href="#tarifs" className={`mk-btn ${s.ghostInverted}`}>Voir les tarifs entreprise</a>
            </div>
          </motion.div>

          <motion.div 
            className={s.visual}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <span className={s.badge}>Depuis l'Afrique de l'Ouest, pour le monde</span>
            <div className={s.visualH}>
              De Dakar à Paris,<br />
              de Cotonou à Montréal.
            </div>
            <div className={s.visualSub}>Multi-devises · Multi-langues · Un seul geste.</div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
