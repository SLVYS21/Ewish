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
 * Envelope — realistic 3D paper envelope with foil interior and animated flap.
 *
 * Props:
 *  - theme
 *  - open      : bool, whether the top flap is rotated open
 *  - showBack  : bool, if true render only the closed back face (no flap logic)
 *  - onSealClick : callback when the wax seal is clicked
 */
export default function Envelope({ theme, open = false, showBack = false, onSealClick = null }) {
  const env = theme.envelope;
  const color = env.color;
  const linerSpec = env.linerPattern || {};
  const texture = env.texture || 'smooth';

  const edge = shade(color, -0.22);
  const seam = shade(color, -0.14);
  const hinge = shade(color, -0.10);
  const textureImg = TEXTURE_BG[texture];
  const textureBlend = TEXTURE_BLEND[texture];
  const isSatin = texture === 'satin';

  const foil = foilTone(color);

  const paperUrl     = env.paperUrl || null;
  const paperBlend   = env.paperBlend || 'normal';
  const paperOpacity = env.paperOpacity ?? 1;
  const hasPaperImg  = Boolean(paperUrl);
  const paperIsDirect = hasPaperImg && paperBlend === 'normal';

  return (
    <div className="ce-envelope" style={{ position: 'relative', width: '100%', height: '100%', transformStyle: 'preserve-3d' }}>
      
      {/* ===== 1. BODY (Back Panel) — sturdy back plate with soft depth shadows ===== */}
      <div className="env-back" style={{
        position: 'absolute',
        inset: 0,
        background: color,
        borderRadius: '4px',
        boxShadow: [
          '0 35px 70px -20px rgba(0,0,0,0.48)',
          '0 15px 30px -10px rgba(0,0,0,0.28)',
          '0 4px 10px rgba(0,0,0,0.14)',
          `inset 0 0 0 1px ${edge}`,
          `inset 0 1px 0 0 ${shade(color, 0.15)}`,
          `inset 0 -3px 8px ${shade(color, -0.20)}`,
        ].join(', '),
        overflow: 'hidden',
        zIndex: 0,
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
        {/* Subtle realistic paper curvature vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 60%, rgba(0,0,0,0.10) 100%)',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ===== 2. INTERIOR LINER — luxurious foil / pattern seen inside the throat ===== */}
      <div className="env-interior-liner" style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '62%',
        clipPath: 'polygon(0 0, 100% 0, 50% 88%)',
        overflow: 'hidden',
        zIndex: 1,
        background: `
          radial-gradient(ellipse at 30% 20%, ${foil.hi} 0%, transparent 55%),
          radial-gradient(ellipse at 70% 80%, ${foil.hi} 0%, transparent 45%),
          linear-gradient(160deg, ${foil.hi} 0%, ${foil.mid} 45%, ${foil.lo} 100%)
        `,
      }}>
        {/* Crumpled foil texture */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: FOIL_CRUMPLE,
          backgroundSize: '160px 160px',
          mixBlendMode: 'overlay',
          opacity: 0.55,
          pointerEvents: 'none',
        }} />
        {/* Sheen sweep */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(115deg,
            rgba(255,255,255,0.50) 0%,
            rgba(255,255,255,0.12) 25%,
            rgba(255,255,255,0.00) 45%,
            rgba(255,255,255,0.10) 65%,
            rgba(255,255,255,0.30) 100%)`,
          mixBlendMode: 'screen',
          pointerEvents: 'none',
        }} />
        {/* Pattern / Decor overlay */}
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
        {/* Deep throat shadow — gives realistic cavity depth */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.35) 90%, rgba(0,0,0,0.55) 100%)',
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }} />
      </div>

      {/* ===== 3. LEFT FLAP — folding in over the interior ===== */}
      <div className="env-left-flap" style={{
        position: 'absolute',
        top: 0, bottom: 0, left: 0,
        width: '52%',
        background: color,
        clipPath: 'polygon(0 0, 100% 55%, 0 100%)',
        filter: 'drop-shadow(4px 2px 9px rgba(0,0,0,0.22))',
        zIndex: 2,
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
        {/* Crease shadow & bevel highlight */}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(135deg, transparent 82%, ${shade(color, -0.18)} 100%)`, opacity: 0.6, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${shade(color, 0.12)} 0%, transparent 4%)`, opacity: 0.7, pointerEvents: 'none' }} />
      </div>

      {/* ===== 4. RIGHT FLAP — folding in over the interior ===== */}
      <div className="env-right-flap" style={{
        position: 'absolute',
        top: 0, bottom: 0, right: 0,
        width: '52%',
        background: color,
        clipPath: 'polygon(100% 0, 0 55%, 100% 100%)',
        filter: 'drop-shadow(-4px 2px 9px rgba(0,0,0,0.22))',
        zIndex: 2,
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
        {/* Crease shadow & bevel highlight */}
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(-135deg, transparent 82%, ${shade(color, -0.18)} 100%)`, opacity: 0.6, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, ${shade(color, 0.12)} 0%, transparent 4%)`, opacity: 0.7, pointerEvents: 'none' }} />
      </div>

      {/* ===== 5. BOTTOM FLAP — overlapping bottom pouch ===== */}
      <div className="env-bottom-flap" style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '58%',
        background: color,
        clipPath: 'polygon(0 100%, 50% 46%, 100% 100%)',
        filter: 'drop-shadow(0 -5px 12px rgba(0,0,0,0.25))',
        zIndex: 3,
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
        {/* Top-edge fold crease & apex shadow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `linear-gradient(180deg, ${hinge} 0%, transparent 14%)`,
          clipPath: 'polygon(0 100%, 50% 46%, 100% 100%)',
          opacity: 0.55,
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

      {/* ===== 6. TOP FLAP — flips open/closed with 3D double-sided rendering ===== */}
      {!showBack && (
        <div className="env-top-flap" style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: '58%',
          transformOrigin: 'top center',
          transformStyle: 'preserve-3d',
          transform: open ? 'rotateX(180deg)' : 'rotateX(0deg)',
          transition: 'transform 850ms cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: open ? 1 : 6,
        }}>
          {/* ----- A. FRONT FACE (Outer paper, seen when CLOSED) ----- */}
          <div style={{
            position: 'absolute', inset: 0,
            background: color,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'translateZ(1px)',
            filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.24))',
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
            {/* Fold crease shadow at top hinge */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '18%',
              background: `linear-gradient(180deg, ${hinge}, transparent)`,
              opacity: 0.4,
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

          {/* ----- B. BACK FACE (Interior foil liner, seen when OPEN) ----- */}
          <div style={{
            position: 'absolute', inset: 0,
            clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateX(180deg) translateZ(1px)',
            overflow: 'hidden',
            filter: 'drop-shadow(0 -8px 16px rgba(0,0,0,0.26))',
            background: `
              radial-gradient(ellipse at 30% 20%, ${foil.hi} 0%, transparent 55%),
              radial-gradient(ellipse at 70% 80%, ${foil.hi} 0%, transparent 45%),
              linear-gradient(160deg, ${foil.hi} 0%, ${foil.mid} 45%, ${foil.lo} 100%)
            `,
          }}>
            {/* Crumpled foil texture */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: FOIL_CRUMPLE,
              backgroundSize: '160px 160px',
              mixBlendMode: 'overlay',
              opacity: 0.55,
              pointerEvents: 'none',
            }} />
            {/* Wide diagonal sheen */}
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

            {/* Pattern / Decor overlay */}
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

            {/* Hinge shadow along fold */}
            <div style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, height: '22%',
              background: 'linear-gradient(180deg, rgba(0,0,0,0.30), rgba(0,0,0,0))',
              pointerEvents: 'none',
            }} />
          </div>

          {/* ----- C. WAX SEAL — affixed to the apex when closed ----- */}
          {!open && (
            <div
              className={`env-wax ${onSealClick ? 'is-clickable' : ''}`}
              onClick={onSealClick ? (e) => { e.stopPropagation(); onSealClick(); } : undefined}
              style={{
                position: 'absolute',
                left: '50%',
                top: '86%',
                width: '18%',
                aspectRatio: '1 / 1',
                transform: 'translate(-50%, -50%) translateZ(3px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                cursor: onSealClick ? 'pointer' : 'default',
                animation: onSealClick ? 'ce-seal-pulse 2s ease-in-out infinite' : 'none',
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.42))',
              }}
            >
              <WaxSealSVG color={env.waxSeal.color} letter={env.waxSeal.letter} seed={1701} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * WaxSealSVG — ultra-realistic glossy blood-red wax seal with molten organic rim,
 * specular highlights, and crisp letter deboss/emboss.
 */
function WaxSealSVG({ color, letter, seed = 1701 }) {
  // Pure deep crimson/blood-red color palette
  const pureBlood = saturateBloodRed(color);
  const bloodLight = shade(pureBlood, 0.28);    // Bright crimson highlight
  const bloodShadow = shade(pureBlood, -0.65);   // Dark deep blood cavity
  const bloodMid = pureBlood;

  const waxId = 'wax-blob-' + seed;
  const debossId = 'wax-deboss-' + seed;
  const embossId = 'wax-emboss-' + seed;
  const gradId = 'wax-grad-' + seed;
  const specGradId = 'wax-spec-' + seed;

  return (
    <svg viewBox="0 0 40 40" width="100%" height="100%" style={{ overflow: 'visible' }}>
      <defs>
        {/* Rich blood-red radial gradient with glossy specular hot spot */}
        <radialGradient id={gradId} cx="36%" cy="30%" r="68%">
          <stop offset="0%" stopColor="#FF4D4D" />
          <stop offset="22%" stopColor={bloodLight} />
          <stop offset="55%" stopColor={bloodMid} />
          <stop offset="85%" stopColor={shade(pureBlood, -0.38)} />
          <stop offset="100%" stopColor={bloodShadow} />
        </radialGradient>

        {/* Specular gloss crescent on top-left edge */}
        <linearGradient id={specGradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(255, 255, 255, 0.85)" />
          <stop offset="25%" stopColor="rgba(255, 180, 180, 0.45)" />
          <stop offset="55%" stopColor="rgba(255, 255, 255, 0.00)" />
        </linearGradient>

        {/* Organic wax displacement filter */}
        <filter id={waxId} x="-25%" y="-25%" width="150%" height="150%">
          <feTurbulence type="turbulence" baseFrequency="0.18" numOctaves="3" result="turb" seed={seed} />
          <feGaussianBlur in="turb" stdDeviation="0.8" result="blurTurb" />
          <feDisplacementMap in="SourceGraphic" in2="blurTurb" scale="4.5" xChannelSelector="R" yChannelSelector="G" result="displaced" />
          
          {/* Bevel lighting on displaced wax edges */}
          <feDropShadow in="displaced" dx="-0.6" dy="-0.6" stdDeviation="0.4" floodColor="#FFA0A0" floodOpacity="0.85" result="hi" />
          <feDropShadow in="displaced" dx="0.8" dy="0.9" stdDeviation="0.6" floodColor={bloodShadow} floodOpacity="0.95" result="sh" />
          <feMerge>
            <feMergeNode in="sh" />
            <feMergeNode in="hi" />
            <feMergeNode in="displaced" />
          </feMerge>
        </filter>

        {/* Deboss stamp filter */}
        <filter id={debossId}>
          <feDropShadow dx="-0.4" dy="-0.4" stdDeviation="0.2" floodColor={bloodShadow} floodOpacity="0.9" />
          <feDropShadow dx="0.4" dy="0.4" stdDeviation="0.2" floodColor="#FFA0A0" floodOpacity="0.6" />
        </filter>

        {/* Emboss letter filter */}
        <filter id={embossId}>
          <feDropShadow dx="0.3" dy="0.3" stdDeviation="0.2" floodColor={bloodShadow} floodOpacity="0.95" />
          <feDropShadow dx="-0.3" dy="-0.3" stdDeviation="0.2" floodColor="#FFBABA" floodOpacity="0.75" />
        </filter>
      </defs>

      {/* 1. Molten organic wax pool (base body) */}
      <circle cx="20" cy="20" r="16.5" fill={`url(#${gradId})`} filter={`url(#${waxId})`} />

      {/* 2. Top-left glossy specular highlight rim */}
      <path
        d="M 10 13 A 14 14 0 0 1 28 9"
        fill="none"
        stroke="rgba(255, 255, 255, 0.75)"
        strokeWidth="1.8"
        strokeLinecap="round"
        style={{ filter: 'blur(0.6px)' }}
      />

      {/* 3. Bottom-right subtle rim light */}
      <path
        d="M 14 31 A 14 14 0 0 0 31 16"
        fill="none"
        stroke="rgba(255, 120, 120, 0.35)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* 4. Stamped inner groove ring */}
      <circle cx="20" cy="20" r="11.5" fill="none" stroke={shade(pureBlood, -0.25)} strokeWidth="1.2" filter={`url(#${debossId})`} />
      <circle cx="20" cy="20" r="10.4" fill="none" stroke={shade(pureBlood, 0.15)} strokeWidth="0.6" filter={`url(#${embossId})`} />

      {/* 5. Center Seal Monogram / Letter */}
      <text
        x="20"
        y="21.5"
        dominantBaseline="middle"
        textAnchor="middle"
        fill={shade(pureBlood, -0.15)}
        fontFamily="'Playfair Display', 'Cinzel', Georgia, serif"
        fontSize="11"
        fontWeight="bold"
        filter={`url(#${embossId})`}
        style={{ letterSpacing: '0px' }}
      >
        {letter || '✦'}
      </text>
    </svg>
  );
}

// Convert any hex color into a rich, pure blood-red crimson
function saturateBloodRed(hex) {
  if (!hex || hex[0] !== '#') return '#96111B';
  const num = parseInt(hex.slice(1), 16);
  let r = (num >> 16) & 0xff;
  let g = (num >> 8) & 0xff;
  let b = num & 0xff;
  // Boost red strongly, push green and blue into deep velvet blood tones
  r = Math.min(255, Math.max(145, Math.round(r * 1.25 + 30)));
  g = Math.max(8, Math.min(30, Math.round(g * 0.18)));
  b = Math.max(12, Math.min(38, Math.round(b * 0.22)));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0');
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
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).padStart(6, '0');
}
