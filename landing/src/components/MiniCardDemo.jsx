import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Music, Heart } from 'lucide-react';
import s from './Hero.module.css';

export default function MiniCardDemo() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const toggleOpen = () => {
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => setIsPlaying(true), 1000); // Auto play music shortly after opening
    } else {
      setIsOpen(false);
      setIsPlaying(false);
    }
  };

  const togglePlay = (e) => {
    e.stopPropagation(); // Prevent closing the card
    setIsPlaying(!isPlaying);
  };

  return (
    <div className={s.miniCardContainer} onClick={toggleOpen}>
      <motion.div 
        className={s.envelope}
        animate={isOpen ? { y: 100, opacity: 0, scale: 0.8 } : { y: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
      >
        <div className={s.envelopeFlap} />
        <div className={s.envelopeBody}>
          <span>Cliquez pour ouvrir</span>
        </div>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            className={s.openedCard}
            initial={{ y: 20, opacity: 0, scale: 0.9, rotate: -5 }}
            animate={{ y: -30, opacity: 1, scale: 1.05, rotate: 2 }}
            exit={{ y: 20, opacity: 0, scale: 0.9, rotate: -5 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
          >
            <div className={s.cardImage}>
              <Heart className={s.floatingHeart} size={48} />
            </div>
            <div className={s.cardContent}>
              <h3 className="serif">Joyeux Anniversaire !</h3>
              <p>Que cette journée soit remplie de joie et de bonheur.</p>
              
              <div className={s.musicPlayer} onClick={togglePlay}>
                <div className={s.musicIcon}>
                  {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                </div>
                <div className={s.musicTrack}>
                  <span className={s.trackName}>Magic in the Air</span>
                  <div className={s.equalizer}>
                    <motion.div animate={isPlaying ? { height: ["4px", "12px", "4px"] } : { height: "4px" }} transition={{ repeat: Infinity, duration: 0.8 }} className={s.bar} />
                    <motion.div animate={isPlaying ? { height: ["12px", "4px", "12px"] } : { height: "4px" }} transition={{ repeat: Infinity, duration: 0.9 }} className={s.bar} />
                    <motion.div animate={isPlaying ? { height: ["6px", "14px", "6px"] } : { height: "4px" }} transition={{ repeat: Infinity, duration: 0.7 }} className={s.bar} />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Confetti particles */}
            {isOpen && [...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className={s.confetti}
                initial={{ x: 0, y: 0, opacity: 1 }}
                animate={{ 
                  x: (Math.random() - 0.5) * 300, 
                  y: (Math.random() - 1) * 300,
                  opacity: 0,
                  rotate: Math.random() * 360 
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                style={{
                  backgroundColor: ['#E8A33D', '#C13B3B', '#354270', '#DFE3EE'][Math.floor(Math.random() * 4)]
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
