import { useState } from 'react';
import s from './ConfettiTab.module.css';

/* ─── Confetti effects catalogue ─────────────────────────────── */
export const CONFETTI_EFFECTS = [
  {
    value: 'default',
    label: 'Classique',
    emoji: '🎊',
    desc: 'Confettis colorés tombant de haut',
  },
  {
    value: 'fireworks',
    label: 'Feux d\'artifice',
    emoji: '🎆',
    desc: 'Explosions de particules dans tous les sens',
  },
  {
    value: 'side_cannons',
    label: 'Canons latéraux',
    emoji: '🎉',
    desc: 'Deux canons tirent depuis les côtés',
  },
  {
    value: 'stars',
    label: 'Étoiles',
    emoji: '⭐',
    desc: 'Pluie d\'étoiles dorées et scintillantes',
  },
  {
    value: 'hearts',
    label: 'Cœurs',
    emoji: '❤️',
    desc: 'Confettis en forme de cœur rose',
  },
  {
    value: 'snow',
    label: 'Neige',
    emoji: '❄️',
    desc: 'Flocons blancs qui tombent doucement',
  },
  {
    value: 'gold_rain',
    label: 'Pluie d\'or',
    emoji: '✨',
    desc: 'Particules or et champagne élégantes',
  },
  {
    value: 'emoji_party',
    label: 'Emojis Fête',
    emoji: '🥳',
    desc: 'Emojis festifs qui volent partout',
  },
  {
    value: 'realistic',
    label: 'Réaliste',
    emoji: '🪄',
    desc: 'Mix dynamique avec gravité naturelle',
  },
  {
    value: 'school_pride',
    label: 'Couleurs d\'équipe',
    emoji: '🏆',
    desc: 'Canons bicolores en continu',
  },
];

export default function ConfettiTab({ confettiType = 'default', onChange, iframeRef }) {
  const [previewing, setPreviewing] = useState(null);

  const handleSelect = (value) => {
    onChange(value);
    // Fire live preview into iframe
    if (iframeRef?.current?.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          { type: 'WW_CONFETTI', effectType: value },
          '*'
        );
      } catch {}
    }
    setPreviewing(value);
    setTimeout(() => setPreviewing(null), 1500);
  };

  return (
    <div className={s.root}>
      <div className={s.header}>
        <div className={s.headerIcon}>🎊</div>
        <div>
          <div className={s.headerTitle}>Effet de confettis</div>
          <div className={s.headerSub}>Cliquez sur un effet pour le prévisualiser en direct</div>
        </div>
      </div>

      <div className={s.grid}>
        {CONFETTI_EFFECTS.map((effect) => {
          const isActive = confettiType === effect.value;
          const isPreviewing = previewing === effect.value;
          return (
            <button
              key={effect.value}
              className={`${s.card} ${isActive ? s.cardActive : ''} ${isPreviewing ? s.cardPreviewing : ''}`}
              onClick={() => handleSelect(effect.value)}
              title={effect.desc}
            >
              <div className={s.cardEmoji}>{effect.emoji}</div>
              <div className={s.cardLabel}>{effect.label}</div>
              {isActive && <div className={s.activeBadge}>✓</div>}
              {isPreviewing && <div className={s.previewingBadge}>▶</div>}
            </button>
          );
        })}
      </div>

      {/* Current selection info */}
      {(() => {
        const current = CONFETTI_EFFECTS.find(e => e.value === confettiType);
        return current ? (
          <div className={s.currentInfo}>
            <span className={s.currentEmoji}>{current.emoji}</span>
            <div>
              <div className={s.currentLabel}>{current.label}</div>
              <div className={s.currentDesc}>{current.desc}</div>
            </div>
          </div>
        ) : null;
      })()}

      <div className={s.hint}>
        💡 L'effet se déclenchera automatiquement lors de la célébration dans l'animation.
      </div>
    </div>
  );
}
