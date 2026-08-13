import { motion } from 'framer-motion';
import { Sparkles, Music, Image as ImageIcon, Type, Link2, Users, ArrowRight, Heart, Gift, MessageSquare } from 'lucide-react';
import s from './HowItWorks.module.css';

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] },
  }),
};

const pillFloat = {
  hidden: { opacity: 0, scale: 0.8, y: 10 },
  visible: (i) => ({
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { delay: 0.4 + i * 0.1, duration: 0.4, ease: 'backOut' },
  }),
};

export default function HowItWorks({ onCreate }) {
  return (
    <section id="comment" className={s.section}>
      <div className="mk-container">
        <div className={s.head}>
          <span className="eyebrow">4 étapes, 3 minutes</span>
          <h2 className={s.title}>
            De l'idée au{' '}
            <em className={s.titleAccent}>waouh</em>,<br />
            plus vite qu'un café.
          </h2>
        </div>

        <div className={s.bento}>
          {/* STEP 01 — CHOISIS */}
          <motion.div
            custom={0}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className={`${s.cell} ${s.cellChoose}`}
          >
            <div className={s.cellHeader}>
              <span className={s.step}>01</span>
              <h3 className={s.cellTitle}>Choisis ton format</h3>
            </div>
            <p className={s.cellDesc}>Carte solo, mur collaboratif ou cagnotte. Tu peux mixer.</p>

            <div className={s.formatPicker}>
              <motion.div
                whileHover={{ y: -6, rotate: -2 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`${s.formatCard} ${s.fmtCard}`}
              >
                <Heart size={22} strokeWidth={2.4} />
                <span>Carte</span>
              </motion.div>
              <motion.div
                whileHover={{ y: -6, rotate: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`${s.formatCard} ${s.fmtWall}`}
              >
                <Users size={22} strokeWidth={2.4} />
                <span>Mur</span>
                <div className={s.badge}>Populaire</div>
              </motion.div>
              <motion.div
                whileHover={{ y: -6, rotate: 2 }}
                transition={{ type: 'spring', stiffness: 300 }}
                className={`${s.formatCard} ${s.fmtGift}`}
              >
                <Gift size={22} strokeWidth={2.4} />
                <span>Cagnotte</span>
              </motion.div>
            </div>
          </motion.div>

          {/* STEP 02 — PERSONNALISE */}
          <motion.div
            custom={1}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className={`${s.cell} ${s.cellPerso}`}
          >
            <div className={s.cellHeader}>
              <span className={`${s.step} ${s.stepOnDark}`}>02</span>
              <h3 className={`${s.cellTitle} ${s.onDark}`}>Personnalise</h3>
            </div>
            <p className={`${s.cellDesc} ${s.onDarkMuted}`}>
              Ajoute photos, musique, GIFs. Aucune limite de créativité.
            </p>

            <div className={s.persoStack}>
              <motion.div custom={0} variants={pillFloat} initial="hidden" whileInView="visible" viewport={{ once: true }} className={`${s.persoPill} ${s.pillPhoto}`}>
                <ImageIcon size={14} strokeWidth={2.4} />
                <span>Photos</span>
              </motion.div>
              <motion.div custom={1} variants={pillFloat} initial="hidden" whileInView="visible" viewport={{ once: true }} className={`${s.persoPill} ${s.pillMusic}`}>
                <Music size={14} strokeWidth={2.4} />
                <span>Musique</span>
              </motion.div>
              <motion.div custom={2} variants={pillFloat} initial="hidden" whileInView="visible" viewport={{ once: true }} className={`${s.persoPill} ${s.pillText}`}>
                <Type size={14} strokeWidth={2.4} />
                <span>Texte</span>
              </motion.div>
              <motion.div custom={3} variants={pillFloat} initial="hidden" whileInView="visible" viewport={{ once: true }} className={`${s.persoPill} ${s.pillGif}`}>
                <Sparkles size={14} strokeWidth={2.4} />
                <span>Stickers</span>
              </motion.div>
            </div>

            <div className={s.persoGlow} aria-hidden />
          </motion.div>

          {/* STEP 03 — PARTAGE */}
          <motion.div
            custom={2}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className={`${s.cell} ${s.cellShare}`}
          >
            <div className={s.cellHeader}>
              <span className={s.step}>03</span>
              <h3 className={s.cellTitle}>Partage le lien</h3>
            </div>
            <p className={s.cellDesc}>Un lien unique, WhatsApp, mail. Tes proches contribuent en 1 clic.</p>

            <div className={s.linkBox}>
              <Link2 size={16} strokeWidth={2.4} className={s.linkIcon} />
              <span className={s.linkText}>mykado.co/marie-30</span>
              <div className={s.linkPulse} aria-hidden />
            </div>

            <div className={s.avatarRow}>
              {['#F9EBC7', '#FBEEEE', '#DFE3EE', '#F3EEE1', '#F9EBC7'].map((bg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className={s.avatar}
                  style={{ background: bg, zIndex: 10 - i }}
                >
                  {['A', 'M', 'K', 'S', '+'][i]}
                </motion.div>
              ))}
              <span className={s.avatarLabel}>+12 contributent</span>
            </div>
          </motion.div>

          {/* STEP 04 — CÉLÈBRE */}
          <motion.div
            custom={3}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className={`${s.cell} ${s.cellCelebrate}`}
          >
            <div className={s.celebrateContent}>
              <div className={s.cellHeader}>
                <span className={s.step}>04</span>
                <h3 className={s.cellTitle}>Le grand moment</h3>
              </div>
              <p className={s.cellDesc}>
                Un lien magique arrive au destinataire. Musique, mots, souvenirs — tout défile.
              </p>

              <button className={s.ctaInline} onClick={onCreate}>
                Créer maintenant
                <ArrowRight size={16} strokeWidth={2.4} />
              </button>
            </div>

            <div className={s.celebrateImageWrap}>
              <motion.img
                src="/assets/collaborative_wall.png"
                alt="Mur collaboratif d'anniversaire"
                className={s.celebrateImage}
                initial={{ scale: 1.05 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              />
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
                className={s.floatingMsg}
              >
                <MessageSquare size={14} strokeWidth={2.4} />
                <span>Nouveau mot !</span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
