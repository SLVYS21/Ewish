import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Plus, MessageCircle, Gift, Smartphone, ArrowRight } from 'lucide-react';
import s from './Briques.module.css';
import NotoEmoji from './NotoEmoji';

const InteractiveBoard = () => {
  const [postIts, setPostIts] = useState([]);
  
  const addPostIt = () => {
    if (postIts.length >= 4) {
      setPostIts([]);
      return;
    }
    const colors = ['#F9EBC7', '#E5DDC9', '#DFE3EE', '#FBEEEE'];
    setPostIts([...postIts, { id: Date.now(), color: colors[postIts.length] }]);
  };

  return (
    <div className={s.miniBoardContainer} style={{ backgroundImage: "url('/assets/collaborative_wall.png')" }}>
      <div className={s.imageOverlay} />
      <div className={s.miniBoard}>
        <AnimatePresence>
          {postIts.map((p, i) => (
            <motion.div
              key={p.id}
              className={s.postIt}
              style={{ backgroundColor: p.color }}
              initial={{ scale: 0, opacity: 0, rotate: (i % 2 === 0 ? -10 : 10) }}
              animate={{ scale: 1, opacity: 1, rotate: (i % 2 === 0 ? -3 : 3) }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <div className={s.postItLine} style={{ width: '80%' }} />
              <div className={s.postItLine} style={{ width: '60%' }} />
              <div className={s.postItLine} style={{ width: '40%', marginTop: '8px' }} />
            </motion.div>
          ))}
        </AnimatePresence>
        
        <motion.button 
          className={s.addPostItBtn}
          onClick={addPostIt}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Plus size={20} />
        </motion.button>
      </div>
    </div>
  );
};

const InteractivePot = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) return 0;
        return p + 25;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={s.miniPotContainer}>
      <div className={s.potUi}>
        <div className={s.potHeader}>
          <Gift size={16} className={s.potIcon} />
          <span>Cagnotte de Koffi</span>
        </div>
        <div className={s.potAmount}>
          <motion.span
            key={progress}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {progress * 150} XOF
          </motion.span>
        </div>
        <div className={s.progressBarBg}>
          <motion.div 
            className={s.progressBarFill}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        <div className={s.momoIntegration}>
          <Smartphone size={14} />
          <span>MTN, Moov, Orange</span>
        </div>
      </div>
    </div>
  );
};

const InteractiveCardPreview = () => {
  return (
    <div className={s.miniCardPreviewContainer} style={{ backgroundImage: "url('/assets/happy_family_card.png')" }}>
      <div className={s.imageOverlay} />
      <motion.div 
        className={s.hoverCard}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      >
        <div className={s.hcImage} />
        <div className={s.hcTitle}>Bon anniv !</div>
        <div className={s.hcLines}>
          <div className={s.hcLine} style={{ width: '90%' }} />
          <div className={s.hcLine} style={{ width: '70%' }} />
        </div>
      </motion.div>
      <motion.div 
        className={s.floatingEmoji}
        animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 15, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
      >
        <NotoEmoji name="sparkling-heart" size={32} />
      </motion.div>
    </div>
  );
};

export default function Briques() {
  return (
    <section id="briques" className={`mk-section mk-section-elevated ${s.wrap}`}>
      <div className="mk-container">
        <div className="mk-sec-head">
          <span className="eyebrow">Les 3 briques myKado</span>
          <h2 className="mk-sec-h2">Des outils simples, des émotions fortes.</h2>
          <p className="mk-sec-sub">
            Découvrez nos 3 solutions pensées pour toutes les occasions, du simple message intime au grand cadeau collectif de bureau.
          </p>
        </div>

        <div className={s.grid}>
          {/* Carte Animée */}
          <article className={`${s.card} ${s.carteCard}`}>
            <InteractiveCardPreview />
            <div className={s.content}>
              <h3 className={s.title}>1. Cartes Animées</h3>
              <div className={s.tag}>L'émotion à l'état pur</div>
              <p className={s.desc}>Un véritable déballage digital encapsulé dans un lien unique. Plus qu'une carte, une expérience.</p>
              <ul className={s.list}>
                <li><Check className="mk-check"/> Musique, textes et médias combinés</li>
                <li><Check className="mk-check"/> Effet de surprise avec ouverture 3D</li>
                <li><Check className="mk-check"/> Livraison instantanée par WhatsApp ou SMS</li>
              </ul>
            </div>
          </article>

          {/* Mur Collaboratif */}
          <article className={`${s.card} ${s.murCard}`}>
            <InteractiveBoard />
            <div className={s.content}>
              <h3 className={s.title}>2. Murs de Mots</h3>
              <div className={s.tag}>Ensemble, même de loin</div>
              <p className={s.desc}>Centralisez les vœux de tous vos proches sur un mur interactif, où qu'ils soient dans le monde.</p>
              <ul className={s.list}>
                <li><Check className="mk-check"/> Contribution facile sans créer de compte</li>
                <li><Check className="mk-check"/> Ajout de photos, mémos vocaux et GIFs</li>
                <li><Check className="mk-check"/> Idéal pour les pots de départ et mariages</li>
              </ul>
            </div>
          </article>

          {/* Cadeau Direct */}
          <article className={`${s.card} ${s.cadeauCard}`}>
            <InteractivePot />
            <div className={s.content}>
              <h3 className={s.title}>3. Cagnottes Partagées</h3>
              <div className={s.tag}>Le cadeau commun, sans friction</div>
              <p className={s.desc}>Créez un pool de cadeaux fluide et sécurisé pour rassembler l'argent en toute simplicité.</p>
              <ul className={s.list}>
                <li><Check className="mk-check"/> Mobile Money local et cartes bancaires</li>
                <li><Check className="mk-check"/> Participation sans inscription préalable</li>
                <li><Check className="mk-check"/> Retrait instantané et transparent</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
