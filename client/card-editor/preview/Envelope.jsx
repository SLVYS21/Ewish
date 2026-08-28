import React from 'react';
import Decor from './Decor';

// Subtle multiplicative textures — small SVG data-URIs that tile.
const TEXTURE_BG = {
  smooth: null,
  linen: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22><rect width=%2260%22 height=%2260%22 fill=%22white%22/><g stroke=%22black%22 stroke-width=%220.4%22 opacity=%220.15%22><line x1=%220%22 y1=%2210%22 x2=%2260%22 y2=%2210%22/><line x1=%220%22 y1=%2220%22 x2=%2260%22 y2=%2220%22/><line x1=%220%22 y1=%2230%22 x2=%2260%22 y2=%2230%22/><line x1=%220%22 y1=%2240%22 x2=%2260%22 y2=%2240%22/><line x1=%220%22 y1=%2250%22 x2=%2260%22 y2=%2250%22/><line x1=%2210%22 y1=%220%22 x2=%2210%22 y2=%2260%22/><line x1=%2220%22 y1=%220%22 x2=%2220%22 y2=%2260%22/><line x1=%2230%22 y1=%220%22 x2=%2230%22 y2=%2260%22/><line x1=%2240%22 y1=%220%22 x2=%2240%22 y2=%2260%22/><line x1=%2250%22 y1=%220%22 x2=%2250%22 y2=%2260%22/></g></svg>")',
  kraft: 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 200 200%22><filter id=%22n%22><feTurbulence baseFrequency=%220.9%22 numOctaves=%223%22 stitchTiles=%22stitch%22/><feColorMatrix values=%220 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.15  0 0 0 0.5 0%22/></filter><rect width=%22200%22 height=%22200%22 filter=%22url(%23n)%22 opacity=%220.7%22/></svg>")',
  satin: null,
};
const TEXTURE_BLEND = { smooth: null, linen: 'multiply', kraft: 'multiply', satin: null };

// Crumpled foil noise — SVG turbulence gives the metallic paper look.
const FOIL_CRUMPLE = 'url("data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 300 300%22><filter id=%22c%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/><feDiffuseLighting lighting-color=%22white%22 surfaceScale=%222%22><feDistantLight azimuth=%22135%22 elevation=%2260%22/></feDiffuseLighting></filter><rect width=%22300%22 height=%22300%22 filter=%22url(%23c)%22/></svg>")';

// Decide the foil tone from the envelope color (dark → gold; else → silver-pearl).
function foilTone(envColor) {
  const num = parseInt((envColor || '#FFFFFF').slice(1), 16);
  const r = (num >> 16) & 0xff, g = (num >> 8) & 0xff, b = num & 0xff;
  const luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  if (luma < 0.35) {
    // Dark envelope → warm gold foil
    return { hi: '#FFECA8', mid: '#E8CB78', lo: '#B8944A', name: 'gold' };
  }
  // Light or vivid envelope → cool silver/pearl foil
  return { hi: '#FFFFFF', mid: '#D8DDE4', lo: '#A5ADBA', name: 'silver' };
}

/**
 * Envelope — realistic paper envelope with foil interior.
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

  const edge = shade(color, -0.22);
  const seam = shade(color, -0.14);
  const hinge = shade(color, -0.10);
  const textureImg = TEXTURE_BG[texture];
  const textureBlend = TEXTURE_BLEND[texture];
  const isSatin = texture === 'satin';

  const foil = foilTone(color);

  // Photo paper texture (WebP, scanné). Deux modes :
  //   - direct   : la texture EST le fond de l'enveloppe (couleur intégrée dans l'image)
  //   - multiply : la texture est posée en overlay grain sur env.color (garde la teinte du thème)
  // background-position: center 8% pousse le watermark d'origine hors zone visible.
  const paperUrl     = env.paperUrl || null;
  const paperBlend   = env.paperBlend || 'normal';
  const paperOpacity = env.paperOpacity ?? 1;
  const hasPaperImg  = Boolean(paperUrl);
  const paperIsDirect = hasPaperImg && paperBlend === 'normal';

  return (
    <div className="ce-envelope" style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* -----  BODY (back panel) — flat matte paper with edge shading  ----- */}
      <div className="env-back" style={{
        position: 'absolute',
        inset: 0,
        background: color,
        borderRadius: '3px',
        boxShadow: [
          '0 30px 60px -20px rgba(0,0,0,0.45)',        // drop shadow under envelope
          '0 10px 20px -8px rgba(0,0,0,0.25)',
          `inset 0 0 0 1px ${edge}`,                    // paper edge outline
          `inset 0 -2px 6px ${shade(color, -0.18)}`,   // bottom edge shading
        ].join(', '),
        overflow: 'hidden',
      }}>
        {hasPaperImg && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${paperUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 8%',
            mixBlendMode: paperIsDirect ? 'normal' : 'multiply',
            opacity: paperOpacity,
          }} />
        )}
        {!hasPaperImg && textureImg && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: textureImg,
            mixBlendMode: textureBlend,
            opacity: 0.55,
          }} />
        )}
        {isSatin && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(105deg, rgba(255,255,255,0.24) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.16) 100%)',
            mixBlendMode: 'overlay',
          }} />
        )}

        {/* Construction seams — the diagonals of the four folded back flaps.
            Rendered as an SVG on top of the body, showing where the paper meets. */}
        <svg
          viewBox="0 0 500 360"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
        >
          {/* Two long diagonals from top corners meeting near the bottom-center */}
          <line x1="0"   y1="0"   x2="250" y2="220" stroke={seam} strokeWidth="0.8" opacity="0.55" />
          <line x1="500" y1="0"   x2="250" y2="220" stroke={seam} strokeWidth="0.8" opacity="0.55" />
          {/* Two shorter diagonals from bottom corners meeting at the tip of the bottom flap */}
          <line x1="0"   y1="360" x2="250" y2="220" stroke={seam} strokeWidth="0.8" opacity="0.55" />
          <line x1="500" y1="360" x2="250" y2="220" stroke={seam} strokeWidth="0.8" opacity="0.55" />
          {/* Very faint horizontal fold at the mid-line where flaps meet */}
          <line x1="0"   y1="220" x2="500" y2="220" stroke={seam} strokeWidth="0.4" opacity="0.25" />
        </svg>
      </div>

      {/* -----  INTERIOR pocket — soft cream layer under the flap when open ----- */}
      {open && (
        <div className="env-pocket" style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '58%',
          clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
          overflow: 'hidden',
          background: '#FDFCFA',
          boxShadow: 'inset 0 12px 20px -12px rgba(0,0,0,0.35)',
        }} />
      )}

      {/* -----  BOTTOM FLAP — clean triangle with fold crease  --------------- */}
      <div className="env-bottom-flap" style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '58%',
        background: color,
        clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
      }}>
        {hasPaperImg && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `url(${paperUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 8%',
            mixBlendMode: paperIsDirect ? 'normal' : 'multiply',
            opacity: paperOpacity,
          }} />
        )}
        {/* Subtle top-edge fold shadow (crease at the apex) */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(180deg, ${hinge} 0%, transparent 12%)`,
          clipPath: 'polygon(0 100%, 50% 0, 100% 100%)',
          opacity: 0.5,
          pointerEvents: 'none',
        }} />
        {!hasPaperImg && textureImg && (
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: textureImg,
            mixBlendMode: textureBlend,
            opacity: 0.45,
          }} />
        )}
      </div>

      {/* -----  TOP FLAP — animated open/close, foil interior  --------------- */}
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
          {/* FRONT face — flat colored paper with subtle hinge shadow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: color,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            backfaceVisibility: 'hidden',
            filter: `drop-shadow(0 4px 6px rgba(0,0,0,0.20))`,
            overflow: 'hidden',
          }}>
            {hasPaperImg && (
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${paperUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 8%',
                mixBlendMode: paperIsDirect ? 'normal' : 'multiply',
                opacity: paperOpacity,
              }} />
            )}
            {/* Fold-line shadow near the hinge (top) for depth */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '18%',
              background: `linear-gradient(180deg, ${hinge}, transparent)`,
              opacity: 0.35,
              pointerEvents: 'none',
            }} />
            {!hasPaperImg && textureImg && (
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: textureImg,
                mixBlendMode: textureBlend,
                opacity: 0.45,
              }} />
            )}
          </div>

          {/* BACK face — this is the INSIDE of the flap, i.e. the foil liner */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            overflow: 'hidden',
            // Base metallic gradient (silver by default, gold on dark envelopes)
            background: `
              radial-gradient(ellipse at 30% 20%, ${foil.hi} 0%, transparent 55%),
              radial-gradient(ellipse at 70% 80%, ${foil.hi} 0%, transparent 45%),
              linear-gradient(160deg, ${foil.hi} 0%, ${foil.mid} 45%, ${foil.lo} 100%)
            `,
          }}>
            {/* Crumpled foil texture — SVG turbulence bake-in */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: FOIL_CRUMPLE,
              backgroundSize: '160px 160px',
              mixBlendMode: 'overlay',
              opacity: 0.55,
              pointerEvents: 'none',
            }} />
            {/* Wide diagonal sheen sweep */}
            <div style={{
              position: 'absolute', inset: 0,
              background: `linear-gradient(115deg,
                rgba(255,255,255,0.55) 0%,
                rgba(255,255,255,0.15) 22%,
                rgba(255,255,255,0.00) 45%,
                rgba(255,255,255,0.10) 65%,
                rgba(255,255,255,0.35) 100%)`,
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }} />

            {/* Optional decor image/SVG overlaid on the foil */}
            {linerSpec.imageUrl && (
              <div style={{
                position: 'absolute', inset: 0,
                backgroundImage: `url(${linerSpec.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                mixBlendMode: 'multiply',
                opacity: 0.85,
              }} />
            )}
            {!linerSpec.imageUrl && !linerSpec.color && (
              <div style={{ position: 'absolute', inset: 0, opacity: 0.75, mixBlendMode: 'multiply' }}>
                <Decor spec={{ ...linerSpec, position: 'fill', opacity: 1 }} />
              </div>
            )}

            {/* Hinge shadow along the fold (top edge) for depth */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, height: '22%',
              background: 'linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0))',
              pointerEvents: 'none',
            }} />

            {/* Bottom V-tip shadow (converging fold shadow along the two edges) */}
            <div style={{
              position: 'absolute',
              inset: 0,
              background: `
                linear-gradient(60deg,  transparent 48%, rgba(0,0,0,0.10) 50%, transparent 52%),
                linear-gradient(-60deg, transparent 48%, rgba(0,0,0,0.10) 50%, transparent 52%)
              `,
              mixBlendMode: 'multiply',
              opacity: 0.6,
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
                width: '13%',
                aspectRatio: '1 / 1',
                transform: 'translate(-50%, -50%)',
                borderRadius: '50%',
                background: `radial-gradient(circle at 32% 30%, ${shade(env.waxSeal.color, 0.25)}, ${env.waxSeal.color} 55%, ${shade(env.waxSeal.color, -0.28)})`,
                boxShadow: '0 4px 10px rgba(0,0,0,0.4), inset -2px -3px 5px rgba(0,0,0,0.35), inset 2px 3px 5px rgba(255,255,255,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Playfair Display', serif",
                fontStyle: 'italic',
                fontWeight: 700,
                color: shade(env.waxSeal.color, -0.42),
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
