import { motion } from 'framer-motion';
import s from './HowItWorks.module.css';
import NotoEmoji from './NotoEmoji';

const STEPS = [
  { 
    n: 1, 
    emoji: 'artist-palette', 
    title: "Personnalisez",  
    desc: "Choisissez le format (carte, vidéo, cagnotte)." 
  },
  { 
    n: 2, 
    emoji: 'handshake', 
    title: 'Invitez',   
    desc: "Partagez le lien pour que d'autres contribuent." 
  },
  { 
    n: 3, 
    emoji: 'rocket',  
    title: 'Surprenez',        
    desc: "Le destinataire reçoit son expérience instantanément." 
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function HowItWorks() {
  return (
    <section id="comment" className="mk-section">
      <div className="mk-container">
        <div className="mk-sec-head">
          <span className="eyebrow">En toute simplicité</span>
          <h2 className="mk-sec-h2">Comment ça marche ?</h2>
          <p className="mk-sec-sub">
            Créez des émotions en quelques minutes. La création est gratuite, vous ne payez qu'au moment de l'envoi final.
          </p>
        </div>

        <motion.div 
          className={s.grid}
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {STEPS.map((step) => (
            <motion.div key={step.n} className={s.step} variants={itemVariants}>
              <div className={s.head}>
                <div className={s.num}>{step.n}</div>
                <motion.div whileHover={{ scale: 1.1, rotate: 10 }}>
                  <NotoEmoji name={step.emoji} size={48} className={s.stepEmoji} />
                </motion.div>
              </div>
              <h3 className={s.title}>{step.title}</h3>
              <p className={s.desc}>{step.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
