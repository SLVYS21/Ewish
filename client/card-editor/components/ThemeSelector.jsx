import React from 'react';
import { useCardState } from '../hooks/useCardState';
import { THEMES } from '../data/themes';
import { CONFETTI_STYLES, fireConfetti } from '../data/confetti';
import { UNBOXING_BACKGROUNDS } from '../data/backgrounds';
import { LucideCheck, LucidePlay, LucideBan } from 'lucide-react';

const MiniPreview = ({ theme }) => (
  <div style={{
    width: '100%',
    height: '84px',
    borderRadius: '10px',
    background: theme.palette.paper,
    border: `1px solid ${theme.palette.soft}55`,
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'stretch',
  }}>
    <div style={{ width: '38%', background: theme.envelope.color }} />
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      paddingLeft: '10px',
    }}>
      <div style={{
        fontFamily: theme.fonts.display,
        color: theme.palette.ink,
        fontSize: '12px',
        letterSpacing: '1.5px',
        textTransform: 'uppercase',
      }}>
        Aa Bb Cc
      </div>
      <div style={{
        fontFamily: theme.fonts.script,
        color: theme.palette.accent,
        fontSize: '18px',
        lineHeight: 1,
      }}>
        Sarah
      </div>
    </div>
    <div style={{
      position: 'absolute',
      bottom: '6px',
      right: '8px',
      display: 'flex',
      gap: '3px',
    }}>
      {theme.swatches.slice(0, 5).map((c, i) => (
        <span key={i} style={{
          width: '10px', height: '10px', borderRadius: '50%', background: c,
          border: '1px solid rgba(0,0,0,0.05)',
        }} />
      ))}
    </div>
  </div>
);

export default function ThemeSelector() {
  const {
    themeId, changeTheme, focusPreview,
    confettiStyle, setConfettiStyle,
    unboxingBg, setUnboxingBg,
  } = useCardState();

  const testConfetti = (key) => {
    setConfettiStyle(key);
    // Fire near the preview area (right-center on desktop, center on mobile)
    const origin = window.innerWidth > 900
      ? { x: 0.66, y: 0.5 }
      : { x: 0.5, y: 0.65 };
    fireConfetti(key, origin);
  };

  return (
    <div className="mk-anim-fade-in">
      {/* -------- Style visuel -------- */}
      <h2 className="ce-section-title">Choisissez un style</h2>
      <p className="ce-section-desc">Le design s'applique à l'enveloppe et aux 4 pages.</p>

      <div className="ce-theme-list">
        {Object.values(THEMES).map(t => {
          const selected = t.id === themeId;
          return (
            <button
              key={t.id}
              onClick={() => { changeTheme(t.id); focusPreview('cover'); }}
              className={`ce-theme-card ${selected ? 'selected' : ''}`}
              type="button"
            >
              {selected && <span className="ce-theme-check"><LucideCheck size={14} strokeWidth={3} /></span>}
              <MiniPreview theme={t} />
              <div className="ce-theme-meta">
                <div className="ce-theme-name">{t.name}</div>
                <div className="ce-theme-tag">{t.tagline}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* -------- Confettis à l'ouverture -------- */}
      <div className="ce-block">
        <div className="ce-block-hd">
          <span>Confettis à l'ouverture</span>
        </div>
        <p className="ce-block-desc">Effet joué quand on brise le cachet.</p>
        <div className="ce-confetti-grid">
          {CONFETTI_STYLES.map(s => {
            const isNone = s.key === 'none';
            const isSelected = confettiStyle === s.key;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => (isNone ? setConfettiStyle('none') : testConfetti(s.key))}
                className={`ce-confetti-btn ${isSelected ? 'selected' : ''}`}
              >
                <div className="ce-confetti-swatch" style={{ background: s.preview }}>
                  {isNone
                    ? <LucideBan size={16} />
                    : (isSelected ? <LucidePlay size={12} fill="currentColor" /> : null)}
                </div>
                <div className="ce-confetti-label">{s.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* -------- Fond du rendu final -------- */}
      <div className="ce-block">
        <div className="ce-block-hd">
          <span>Fond du rendu final</span>
        </div>
        <p className="ce-block-desc">Ambiance derrière l'enveloppe lors de l'ouverture.</p>
        <div className="ce-bg-grid">
          {UNBOXING_BACKGROUNDS.map(b => {
            const isSelected = unboxingBg === b.key;
            return (
              <button
                key={b.key}
                type="button"
                onClick={() => setUnboxingBg(b.key)}
                className={`ce-bg-btn ${isSelected ? 'selected' : ''}`}
                title={b.label}
              >
                <div className="ce-bg-swatch" style={{ background: b.swatch }}>
                  {isSelected && (
                    <span className="ce-bg-check"><LucideCheck size={14} strokeWidth={3} /></span>
                  )}
                </div>
                <div className="ce-bg-label">{b.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="ce-hint-card">
        Personnaliser l'enveloppe et les textures — <em>bientôt</em>.
      </div>
    </div>
  );
}
