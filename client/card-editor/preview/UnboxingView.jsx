import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useCardState } from '../hooks/useCardState';
import Envelope from './Envelope';
import CoverPage from './pages/CoverPage';
import InsideLeftPage from './pages/InsideLeftPage';
import InsideRightPage from './pages/InsideRightPage';
import BackPage from './pages/BackPage';
import { fireConfetti } from '../data/confetti';
import { UNBOXING_BG_MAP } from '../data/backgrounds';
import { LucideArrowLeft, LucideRotateCcw } from 'lucide-react';

/*
 * Interaction model:
 *
 *   Phase 1 — Envelope
 *     step 0 : sealed. User clicks the wax seal to open.
 *     step 1 : seal breaks, confetti fires, flap rotates.
 *     step 2 : card slides up out of the pocket.
 *     step 3 : envelope tucks aside, card centered as closed card.
 *
 *   Phase 2 — Card (interactive at step >= 3)
 *     openState = 'front' | 'back' | 'open'
 *     - Click cover (P1)        → 'open'
 *     - Click LEFT page (image) → 'front'  (close the card)
 *     - Click RIGHT page area   → 'back'   (flip to see P4)
 *     - Click on message text   → nothing  (protected for scroll / future audio)
 *     - Click on back page (P4) → 'front'
 *
 * Rendering trick:
 *   The cover leaf rotates around its LEFT (spine) edge. We can't rely on
 *   backface-visibility alone because framer-motion + preserve-3d chains are
 *   inconsistent across browsers → we use an opacity crossfade timed to the
 *   rotation (front content hides at rotation start, back content appears
 *   halfway through the animation).
 */

const CARD_W = 340;
const CARD_H = 476;
const ENV_W  = 520;
const ENV_H  = 372;

const COVER_ROT_MS = 900;      // duration of the cover open/close animation
const FLIP_MS      = 800;      // duration of the front/back flip
const CROSSFADE_DELAY = 0.40;  // seconds into rotation before we swap faces

export default function UnboxingView({ onBack }) {
  const { theme, texts, photo, confettiStyle, unboxingBg } = useCardState();
  const [step, setStep] = useState(0);                 // 0..3
  const [openState, setOpenState] = useState('front'); // 'front' | 'back' | 'open'
  const [scale, setScale] = useState(1);
  const stageRef = useRef(null);

  const bg = (UNBOXING_BG_MAP[unboxingBg] || UNBOXING_BG_MAP.default).bg;

  // The envelope opens on wax-seal click (step 0 -> 1). Everything from 1
  // onwards is auto-progressed with short delays.
  const openEnvelope = useCallback(() => {
    if (step !== 0) return;
    fireConfetti(confettiStyle, { x: 0.5, y: 0.55 });
    setStep(1);
    setTimeout(() => setStep(2), 700);
    setTimeout(() => setStep(3), 1600);
  }, [step, confettiStyle]);

  const restart = () => {
    setStep(0);
    setOpenState('front');
  };

  // Scale-to-fit. Two strategies:
  //   Desktop: fit the OPEN spread (2×CARD_W) inside the stage
  //   Mobile:  fit the CLOSED card (CARD_W) — the spread may overflow when
  //            opened, but the closed cover stays big and readable
  useEffect(() => {
    const measure = () => {
      const el = stageRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      const isMobile = w < 640;
      const availW = w - (isMobile ? 16 : 60);
      const availH = h - (isMobile ? 140 : 180);
      const baseW = isMobile ? CARD_W + 16 : CARD_W * 2 + 40;
      const baseH = CARD_H + 20;
      setScale(Math.min(availW / baseW, availH / baseH, 2));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const interactive = step >= 3;
  const isOpen = openState === 'open';
  const isBack = openState === 'back';

  // Container X shift keeps the visible face centered on-stage.
  //   front → cover on right half  → shift -CARD_W/2
  //   back  → cover flipped to left → shift +CARD_W/2
  //   open  → full spread visible   → shift 0
  const containerX = isOpen ? 0 : (isBack ? CARD_W / 2 : -CARD_W / 2);
  const coverRotY  = isOpen ? -168 : (isBack ? 180 : 0);

  // ----- Interactions on the open spread -----

  const openCard = (e) => {
    e?.stopPropagation();
    if (!interactive) return;
    setOpenState('open');
  };
  const closeToFront = (e) => {
    e?.stopPropagation();
    if (!interactive) return;
    setOpenState('front');
  };
  const flipToBack = (e) => {
    e?.stopPropagation();
    if (!interactive) return;
    setOpenState('back');
  };

  return (
    <div className="ce-unboxing" ref={stageRef} style={{ background: bg }}>
      <button onClick={onBack} className="ce-back-btn">
        <LucideArrowLeft size={16} />
        <span>Retour à l'édition</span>
      </button>

      {interactive && (
        <button onClick={restart} className="ce-restart-btn">
          <LucideRotateCcw size={16} />
          <span>Rejouer</span>
        </button>
      )}

      <div className="ce-unboxing-stage" style={{ transform: `scale(${scale})` }}>

        {/* ---- Envelope ---- */}
        <motion.div
          className="ce-unbox-envelope"
          style={{ width: ENV_W, height: ENV_H, zIndex: 1 }}
          initial={{ x: 0, y: 0, rotateX: 12, opacity: 1, scale: 1 }}
          animate={{
            x:       step >= 3 ? -ENV_W * 0.95 : 0,
            y:       step >= 3 ? 80 : 0,
            rotateX: step >= 3 ? 6 : 12,
            opacity: step >= 3 ? 0.35 : 1,
            scale:   step >= 3 ? 0.5 : 1,
          }}
          transition={{ duration: 0.9, ease: [0.6, 0, 0.3, 1] }}
        >
          <Envelope
            theme={theme}
            open={step >= 1}
            onSealClick={step === 0 ? openEnvelope : null}
          />
        </motion.div>

        {/* ---- Card holder ---- */}
        <motion.div
          className="ce-unbox-card-holder"
          style={{ zIndex: 10 }}
          initial={{ y: 40, opacity: 0, scale: 0.85 }}
          animate={{
            y:      step >= 3 ? 0 : (step >= 2 ? -CARD_H * 0.42 : 40),
            opacity: step >= 2 ? 1 : 0,
            scale:  step >= 3 ? 1 : 0.85,
          }}
          transition={{ duration: 0.9, ease: [0.6, 0, 0.3, 1] }}
        >
          <motion.div
            className="ce-card-book"
            style={{
              width: CARD_W * 2,
              height: CARD_H,
              position: 'relative',
              transformStyle: 'preserve-3d',
            }}
            animate={{ x: containerX }}
            transition={{ duration: COVER_ROT_MS / 1000, ease: [0.5, 0, 0.2, 1] }}
          >
            {/*
              Inside spread (only visible when open).
              - LEFT page (image + caption): clicking closes the card.
              - RIGHT page (message): clicking outside the message flips to the back.
                The message itself is a scroll zone (see InsideRightPage — stopPropagation).
            */}
            <motion.div
              style={{
                position: 'absolute', left: 0, top: 0,
                width: CARD_W * 2, height: CARD_H,
                pointerEvents: isOpen ? 'auto' : 'none',
              }}
              animate={{ opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.4, delay: isOpen ? CROSSFADE_DELAY : 0 }}
            >
              <div
                onClick={closeToFront}
                style={{
                  position: 'absolute', left: 0, top: 0,
                  width: CARD_W, height: CARD_H,
                  cursor: 'pointer',
                }}
                title="Refermer la carte"
              >
                <InsideLeftPage theme={theme} texts={texts} photo={photo} />
              </div>
              <div
                onClick={flipToBack}
                style={{
                  position: 'absolute', left: CARD_W, top: 0,
                  width: CARD_W, height: CARD_H,
                  cursor: 'pointer',
                }}
                title="Voir le dos"
              >
                <InsideRightPage theme={theme} texts={texts} />
              </div>
              <div className="ce-book-crease" />
            </motion.div>

            {/*
              Cover leaf. Rotates around its left edge (the spine).
              We swap the visible face via opacity crossfade, not backface-visibility.
            */}
            <motion.div
              className="ce-book-cover"
              style={{
                position: 'absolute',
                left: CARD_W, top: 0,
                width: CARD_W, height: CARD_H,
                transformOrigin: 'left center',
                transformStyle: 'preserve-3d',
                cursor: interactive && openState === 'front' ? 'pointer' : 'default',
              }}
              animate={{ rotateY: coverRotY }}
              transition={{ duration: COVER_ROT_MS / 1000, ease: [0.5, 0, 0.2, 1] }}
              onClick={interactive && openState === 'front' ? openCard : (openState === 'back' ? closeToFront : undefined)}
            >
              {/* Front face — hidden when we transition to back or open */}
              <motion.div
                style={{
                  position: 'absolute', inset: 0,
                  borderRadius: 2, overflow: 'hidden',
                  background: '#fff',
                  boxShadow: '0 20px 40px -12px rgba(0,0,0,0.35)',
                }}
                animate={{ opacity: (isOpen || isBack) ? 0 : 1 }}
                transition={{
                  duration: 0.25,
                  delay: (isOpen || isBack) ? CROSSFADE_DELAY : 0,
                }}
              >
                <CoverPage theme={theme} texts={texts} />
              </motion.div>

              {/* Back-side wrapper — flipped 180° so it faces forward when the leaf is flipped */}
              <div style={{
                position: 'absolute', inset: 0,
                transform: 'rotateY(180deg)',
                borderRadius: 2, overflow: 'hidden',
                background: '#fff',
                boxShadow: '-20px 20px 40px -12px rgba(0,0,0,0.25)',
              }}>
                {/* P2 (Inside Left) — visible when the card is opened as a spread */}
                <motion.div
                  style={{ position: 'absolute', inset: 0 }}
                  animate={{ opacity: isOpen ? 1 : 0 }}
                  transition={{
                    duration: 0.25,
                    delay: isOpen ? CROSSFADE_DELAY : 0,
                  }}
                >
                  <InsideLeftPage theme={theme} texts={texts} photo={photo} />
                </motion.div>
                {/* P4 (Back cover) — visible when the user flips the card to see the back */}
                <motion.div
                  style={{ position: 'absolute', inset: 0, cursor: 'pointer' }}
                  animate={{ opacity: isBack ? 1 : 0 }}
                  transition={{
                    duration: 0.25,
                    delay: isBack ? CROSSFADE_DELAY : 0,
                  }}
                >
                  <BackPage theme={theme} texts={texts} />
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Contextual hint under the card */}
      {interactive && (
        <div className="ce-unbox-hint">
          {openState === 'front' && "Cliquez sur la carte pour l'ouvrir"}
          {openState === 'open'  && "Clic à gauche pour refermer · Clic à droite pour voir le dos"}
          {openState === 'back'  && "Cliquez sur le dos pour revenir à la couverture"}
        </div>
      )}
    </div>
  );
}

