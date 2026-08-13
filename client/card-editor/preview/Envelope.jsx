import React from 'react';
import Decor from './Decor';

// Subtle multiplicative textures — small SVG data-URIs that tile.
const TEXTURE_BG = {
  smooth: null,
  linen: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect width=%2260%22 height=%2260%22 fill=%22white%22/><g stroke=%22black%22 stroke-width=%220.4%22 opacity=%220.15%22><line x1=%220%22 y1=%2210%22 x2=%2260%22 y2=%2210%22/><line x1=%220%22 y1=%2220%22 x2=%2260%22 y2=%2220%22/><line x1=%220%22 y1=%2230%22 x2=%2260%22 y2=%2230%22/><line x1=%220%22 y1=%2240%22 x2=%2260%22 y2=%2240%22/><line x1=%220%22 y1=%2250%22 x2=%2260%22 y2=%2250%22/><line x1=%2210%22 y1=%220%22 x2=%2210%22 y2=%2260%22/><line x1=%2220%22 y1=%220%22 x2=%2220%22 y2=%2260%22/><line x1=%2230%22 y1=%220%22 x2=%2230%22 y2=%2260%22/><line x1=%2240%22 y1=%220%22 x2=%2240%22 y2=%2260%22/><line x1=%2250%22 y1=%220%22 x2=%2250%22 y2=%2260%22/></g></svg>")',
  kraft: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/><feColorMatrix values=%220 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0.5 0%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%220.7%22/></svg>")',
  satin: null,   // satin uses a sheen gradient overlay instead (see below)
};

const TEXTURE_BLEND = {
  smooth: null,
  linen: 'multiply',
  kraft: 'multiply',
  satin: null,
};

/**
 * Envelope — Realistic 4-flap envelope with animated top flap.
 *
 * Base size 500 x 360. Consumers scale via CSS transform.
 *
 * Props:
 *  - theme
 *  - open      : bool, whether the top flap is rotated back
 *  - showBack  : bool, if true render only the closed *back* face (no flap logic)
 */
export default function Envelope({ theme, open = false, showBack = false, onSealClick = null }) {
  const env = theme.envelope;
  const color = env.color;
  const linerSpec = env.linerPattern;
  const texture = env.texture || 'smooth';

  // A darker shade for the back panel edges & subtle shadow gradient
  const darker = shade(color, -0.15);
  const lighter = shade(color, 0.08);
  const textureImg = TEXTURE_BG[texture];
  const textureBlend = TEXTURE_BLEND[texture];
  const isSatin = texture === 'satin';

  return (
    <div className="ce-envelope" style={{
      position: 'relative',
      width: '100%',
      height: '100%',
    }}>
      {/* Back panel (the body of the envelope) */}
      <div className="env-back" style={{
        position: 'absolute',
        inset: 0,
        background: `linear-gradient(160deg, ${lighter}, ${darker})`,
        borderRadius: '4px',
        boxShadow: '0 30px 60px -20px rgba(0,0,0,0.35), 0 10px 20px -8px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        {textureImg && <div style={{ position: 'absolute', inset: 0, backgroundImage: textureImg, mixBlendMode: textureBlend, opacity: 0.55 }} />}
        {isSatin && <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(255,255,255,0.28) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.18) 100%)', mixBlendMode: 'overlay' }} />}
      </div>

      {/*
        Interior pocket (subtle backdrop shown once the flap is out of the way).
        The main liner is now painted on the flap's back face, but this thin
        cream layer prevents seeing straight through to the back panel.
      */}
      {open && (
        <div className="env-pocket" style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '58%',
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          overflow: 'hidden',
          background: '#FFFFFF',
        }} />
      )}

      {/* Bottom triangle flap (over the pocket) */}
      <div className="env-bottom-flap" style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '58%',
        background: `linear-gradient(180deg, ${lighter}, ${darker})`,
        clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
        boxShadow: 'inset 0 20px 20px -15px rgba(0,0,0,0.2)',
      }}>
        {textureImg && <div style={{ position: 'absolute', inset: 0, backgroundImage: textureImg, mixBlendMode: textureBlend, opacity: 0.5 }} />}
      </div>

      {/* Left & right side flaps (thin triangles, visible edges) */}
      <div className="env-side-flap" style={{
        position: 'absolute', top: 0, left: 0, bottom: 0, width: '52%',
        background: `linear-gradient(90deg, ${darker}, ${lighter})`,
        clipPath: 'polygon(0 0, 100% 50%, 0 100%)',
        opacity: 0.7,
      }} />
      <div className="env-side-flap" style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, width: '52%',
        background: `linear-gradient(270deg, ${darker}, ${lighter})`,
        clipPath: 'polygon(100% 0, 0 50%, 100% 100%)',
        opacity: 0.7,
      }} />

      {/* Top flap — the animated one */}
      {!showBack && (
        <div className="env-top-flap" style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '58%',
          transformOrigin: 'top center',
          transformStyle: 'preserve-3d',
          transform: open ? 'rotateX(-172deg)' : 'rotateX(0deg)',
          transition: 'transform 900ms cubic-bezier(0.6, 0, 0.3, 1)',
          zIndex: open ? 1 : 6,
        }}>
          {/* Front face */}
          <div style={{
            position: 'absolute', inset: 0,
            background: `linear-gradient(180deg, ${color}, ${darker})`,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            backfaceVisibility: 'hidden',
            boxShadow: '0 6px 8px -4px rgba(0,0,0,0.25)',
          }}>
            {textureImg && <div style={{ position: 'absolute', inset: 0, backgroundImage: textureImg, mixBlendMode: textureBlend, opacity: 0.5 }} />}
          </div>
          {/*
            Back face — this is what shows up when the flap flips up: the
            inside of the flap, which carries the floral liner pattern.
          */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            overflow: 'hidden',
            background: linerSpec.color || '#FFFFFF',
          }}>
            {!linerSpec.color && (
              <Decor spec={{ ...linerSpec, position: 'fill', opacity: 1 }} />
            )}
            {/* Fold shadow along the hinge (top edge) for depth */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, height: '20%',
              background: 'linear-gradient(180deg, rgba(0,0,0,0.15), rgba(0,0,0,0))',
              pointerEvents: 'none',
            }} />
          </div>

          {/* Wax seal */}
          {!open && (
            <div
              className={`env-wax ${onSealClick ? 'is-clickable' : ''}`}
              onClick={onSealClick ? (e) => { e.stopPropagation(); onSealClick(); } : undefined}
              style={{
                position: 'absolute',
                left: '50%',
                top: '85%',
                width: '14%',
                aspectRatio: '1 / 1',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: `radial-gradient(circle at 32% 30%, ${shade(env.waxSeal.color, 0.25)}, ${env.waxSeal.color} 55%, ${shade(env.waxSeal.color, -0.25)})`,
                boxShadow: '0 4px 8px rgba(0,0,0,0.35), inset -2px -3px 5px rgba(0,0,0,0.3), inset 2px 3px 5px rgba(255,255,255,0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'italic',
                fontWeight: 700,
                color: shade(env.waxSeal.color, -0.4),
                fontSize: '18px',
                zIndex: 10,
                cursor: onSealClick ? 'pointer' : 'default',
                animation: onSealClick ? 'ce-seal-pulse 2s ease-in-out infinite' : 'none',
              }}
            >
              {env.waxSeal.letter}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Small helper: lighten/darken a hex color by a percent [-1, 1].
function shade(hex, pct) {
  if (!hex || hex[0] !== '#') return hex;
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  const t = pct < 0 ? 0 : 255;
  const p = Math.abs(pct);
  r = Math.round((t - r) * p) + r;
  g = Math.round((t - g) * p) + g;
  b = Math.round((t - b) * p) + b;
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
