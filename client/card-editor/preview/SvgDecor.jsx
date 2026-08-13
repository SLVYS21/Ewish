import React from 'react';

/* -------------------------------------------------------------------------- */
/*  SvgDecor — inline SVG decor library                                       */
/*                                                                             */
/*  Every decor in themes.js may declare `svg: '<kind>'`. This registry       */
/*  resolves the kind to a scalable SVG placeholder. Themes may override      */
/*  with `imageUrl: '<path>'` (e.g. user-uploaded PNGs) — in that case this   */
/*  component is not called.                                                  */
/* -------------------------------------------------------------------------- */

// A single 5-petal watercolour-ish flower centred at (cx, cy) with radius r.
const Flower = ({ cx, cy, r, petal, center, leaf }) => (
  <g transform={`translate(${cx} ${cy})`}>
    {[0, 72, 144, 216, 288].map((a, i) => (
      <ellipse
        key={i}
        cx={0} cy={-r * 0.55}
        rx={r * 0.45} ry={r * 0.7}
        fill={petal}
        opacity="0.9"
        transform={`rotate(${a})`}
      />
    ))}
    <circle cx={0} cy={0} r={r * 0.28} fill={center} />
    {leaf && (
      <>
        <ellipse cx={-r * 0.95} cy={r * 0.6} rx={r * 0.55} ry={r * 0.18} fill={leaf} opacity="0.75" transform={`rotate(-35 ${-r * 0.95} ${r * 0.6})`} />
        <ellipse cx={r * 0.95}  cy={r * 0.6} rx={r * 0.55} ry={r * 0.18} fill={leaf} opacity="0.75" transform={`rotate(35 ${r * 0.95} ${r * 0.6})`} />
      </>
    )}
  </g>
);

const LeafSprig = ({ x, y, rotate = 0, scale = 1, color = '#7A8B5C' }) => (
  <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}>
    <path d="M 0 0 Q 15 -20 30 0 Q 15 -8 0 0 Z" fill={color} opacity="0.8" />
    <path d="M 0 0 Q -5 -25 5 -45 Q 8 -30 0 0 Z" fill={color} opacity="0.6" />
    <ellipse cx="0" cy="-20" rx="6" ry="12" fill={color} opacity="0.7" transform="rotate(-25)" />
    <ellipse cx="0" cy="-20" rx="6" ry="12" fill={color} opacity="0.7" transform="rotate(25)" />
  </g>
);

// -------------------------------------------------------------------------- //
//  Floral theme                                                              //
// -------------------------------------------------------------------------- //

const FLORAL_PALETTE = {
  rose:   '#E8A0A8',
  peach:  '#F0BC94',
  yellow: '#F5D982',
  blue:   '#A8C4D8',
  center: '#D8964F',
  leaf:   '#9BAE73',
};

const FloralFrame = () => (
  <svg viewBox="0 0 500 700" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
    {/* top border */}
    {[
      [55, 55, 26, 'rose'], [110, 42, 20, 'yellow'], [165, 60, 22, 'peach'],
      [220, 40, 18, 'blue'], [275, 55, 24, 'rose'], [330, 45, 20, 'yellow'],
      [385, 62, 22, 'peach'], [440, 48, 20, 'blue']
    ].map(([x, y, r, k], i) => (
      <Flower key={`t-${i}`} cx={x} cy={y} r={r} petal={FLORAL_PALETTE[k]} center={FLORAL_PALETTE.center} leaf={FLORAL_PALETTE.leaf} />
    ))}
    {/* bottom border */}
    {[
      [55, 645, 26, 'peach'], [110, 655, 20, 'blue'], [165, 640, 22, 'rose'],
      [220, 660, 18, 'yellow'], [275, 645, 24, 'blue'], [330, 655, 20, 'peach'],
      [385, 638, 22, 'rose'], [440, 655, 20, 'yellow']
    ].map(([x, y, r, k], i) => (
      <Flower key={`b-${i}`} cx={x} cy={y} r={r} petal={FLORAL_PALETTE[k]} center={FLORAL_PALETTE.center} leaf={FLORAL_PALETTE.leaf} />
    ))}
    {/* left border */}
    {[
      [50, 120, 20, 'yellow'], [42, 180, 18, 'rose'], [55, 240, 22, 'peach'],
      [45, 300, 20, 'blue'], [50, 360, 18, 'rose'], [42, 420, 22, 'yellow'],
      [55, 480, 20, 'peach'], [45, 550, 20, 'blue']
    ].map(([x, y, r, k], i) => (
      <Flower key={`l-${i}`} cx={x} cy={y} r={r} petal={FLORAL_PALETTE[k]} center={FLORAL_PALETTE.center} leaf={FLORAL_PALETTE.leaf} />
    ))}
    {/* right border */}
    {[
      [450, 120, 20, 'peach'], [458, 180, 18, 'blue'], [445, 240, 22, 'rose'],
      [455, 300, 20, 'yellow'], [450, 360, 18, 'peach'], [458, 420, 22, 'rose'],
      [445, 480, 20, 'blue'], [455, 550, 20, 'yellow']
    ].map(([x, y, r, k], i) => (
      <Flower key={`r-${i}`} cx={x} cy={y} r={r} petal={FLORAL_PALETTE[k]} center={FLORAL_PALETTE.center} leaf={FLORAL_PALETTE.leaf} />
    ))}
    {/* leaves scattered between flowers */}
    {[
      [82, 55, 15], [140, 70, -20], [195, 45, 30], [250, 65, -10], [300, 40, 20], [360, 68, -25],
      [412, 45, 15], [82, 645, 165], [140, 630, 200], [195, 660, 150], [250, 640, 180],
      [22, 200, 90], [22, 380, 90], [478, 200, -90], [478, 380, -90]
    ].map(([x, y, r], i) => (
      <LeafSprig key={`lf-${i}`} x={x} y={y} rotate={r} scale={0.6} color={FLORAL_PALETTE.leaf} />
    ))}
  </svg>
);

const FloralCorner = () => (
  <svg viewBox="0 0 200 200" preserveAspectRatio="xMidYMid meet" width="100%" height="100%">
    <Flower cx={45} cy={45} r={28} petal={FLORAL_PALETTE.rose} center={FLORAL_PALETTE.center} leaf={FLORAL_PALETTE.leaf} />
    <Flower cx={95} cy={30} r={20} petal={FLORAL_PALETTE.yellow} center={FLORAL_PALETTE.center} />
    <Flower cx={35} cy={100} r={18} petal={FLORAL_PALETTE.peach} center={FLORAL_PALETTE.center} />
    <Flower cx={130} cy={60} r={16} petal={FLORAL_PALETTE.blue} center={FLORAL_PALETTE.center} />
    <Flower cx={80} cy={80} r={14} petal={FLORAL_PALETTE.rose} center={FLORAL_PALETTE.center} />
    <LeafSprig x={70} y={110} rotate={30} scale={0.8} color={FLORAL_PALETTE.leaf} />
    <LeafSprig x={120} y={95} rotate={90} scale={0.7} color={FLORAL_PALETTE.leaf} />
    <LeafSprig x={20} y={65} rotate={-45} scale={0.6} color={FLORAL_PALETTE.leaf} />
  </svg>
);

const FloralBottom = () => (
  <svg viewBox="0 0 500 200" preserveAspectRatio="xMidYMax meet" width="100%" height="100%">
    {[
      [80, 150, 24, 'rose'], [140, 165, 20, 'yellow'], [200, 145, 22, 'peach'],
      [260, 160, 20, 'blue'], [320, 145, 24, 'rose'], [380, 155, 20, 'yellow'],
      [430, 165, 18, 'peach']
    ].map(([x, y, r, k], i) => (
      <Flower key={`fb-${i}`} cx={x} cy={y} r={r} petal={FLORAL_PALETTE[k]} center={FLORAL_PALETTE.center} leaf={FLORAL_PALETTE.leaf} />
    ))}
    {[[110, 170, 45], [170, 185, -30], [230, 175, 60], [290, 180, -45], [350, 180, 20], [400, 175, -60]].map(([x, y, r], i) => (
      <LeafSprig key={`lb-${i}`} x={x} y={y} rotate={r} scale={0.7} color={FLORAL_PALETTE.leaf} />
    ))}
  </svg>
);

const FloralStamp = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <circle cx="50" cy="50" r="42" fill="none" stroke={FLORAL_PALETTE.center} strokeWidth="1" opacity="0.6" />
    <Flower cx={50} cy={50} r={22} petal={FLORAL_PALETTE.rose} center={FLORAL_PALETTE.center} leaf={FLORAL_PALETTE.leaf} />
  </svg>
);

const FloralLiner = () => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <defs>
      <pattern id="floral-tile" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <Flower cx={20} cy={20} r={11} petal={FLORAL_PALETTE.rose} center={FLORAL_PALETTE.center} />
        <Flower cx={60} cy={45} r={9}  petal={FLORAL_PALETTE.yellow} center={FLORAL_PALETTE.center} />
        <Flower cx={30} cy={60} r={8}  petal={FLORAL_PALETTE.blue} center={FLORAL_PALETTE.center} />
        <LeafSprig x={50} y={15} rotate={20} scale={0.4} color={FLORAL_PALETTE.leaf} />
        <LeafSprig x={10} y={45} rotate={-30} scale={0.35} color={FLORAL_PALETTE.leaf} />
      </pattern>
    </defs>
    <rect width="200" height="200" fill="url(#floral-tile)" />
  </svg>
);

// -------------------------------------------------------------------------- //
//  Confetti / Pop theme                                                       //
// -------------------------------------------------------------------------- //

const CONFETTI = ['#FF3E88', '#FFC145', '#3EC5FF', '#7DD956', '#B168F5', '#FF8A5C'];

const ConfettiPiece = ({ x, y, rot, color, shape = 'rect' }) => {
  if (shape === 'rect') {
    return <rect x={x} y={y} width="10" height="4" fill={color} transform={`rotate(${rot} ${x + 5} ${y + 2})`} rx="1" />;
  }
  if (shape === 'circle') return <circle cx={x} cy={y} r="3" fill={color} />;
  if (shape === 'squiggle') {
    return (
      <path
        d={`M ${x} ${y} q 4 -6 8 0 t 8 0`}
        fill="none" stroke={color} strokeWidth="2" strokeLinecap="round"
        transform={`rotate(${rot} ${x + 8} ${y})`}
      />
    );
  }
  return null;
};

const Balloon = ({ x, y, size, color, string = 40 }) => (
  <g transform={`translate(${x} ${y})`}>
    <path d={`M 0 ${size} Q -2 ${size + string} 0 ${size + string}`} stroke="#666" strokeWidth="0.8" fill="none" />
    <ellipse cx="0" cy="0" rx={size * 0.55} ry={size * 0.7} fill={color} />
    <ellipse cx={-size * 0.2} cy={-size * 0.25} rx={size * 0.12} ry={size * 0.18} fill="rgba(255,255,255,0.55)" />
    <path d={`M -3 ${size * 0.68} L 0 ${size * 0.85} L 3 ${size * 0.68} Z`} fill={color} opacity="0.8" />
  </g>
);

const ConfettiBurst = () => {
  // deterministic scatter of 60 pieces across the whole page
  const pieces = [];
  let seed = 12345;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < 60; i++) {
    const shape = ['rect', 'circle', 'squiggle'][i % 3];
    pieces.push({
      x: rand() * 480 + 10,
      y: rand() * 680 + 10,
      rot: rand() * 360,
      color: CONFETTI[i % CONFETTI.length],
      shape,
    });
  }
  return (
    <svg viewBox="0 0 500 700" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
      {pieces.map((p, i) => <ConfettiPiece key={i} {...p} />)}
    </svg>
  );
};

const BalloonsBunch = () => (
  <svg viewBox="0 0 400 320" preserveAspectRatio="xMidYMax meet" width="100%" height="100%">
    <Balloon x={100} y={60}  size={45} color="#FF3E88" string={200} />
    <Balloon x={200} y={40}  size={50} color="#FFC145" string={220} />
    <Balloon x={300} y={65}  size={45} color="#3EC5FF" string={195} />
    <Balloon x={155} y={100} size={38} color="#7DD956" string={155} />
    <Balloon x={250} y={95}  size={40} color="#B168F5" string={165} />
    {/* Bunch knot */}
    <circle cx="200" cy="290" r="6" fill="#2B2440" />
  </svg>
);

const ConfettiScatter = () => {
  const pieces = [];
  let seed = 7331;
  const rand = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  for (let i = 0; i < 25; i++) {
    pieces.push({
      x: rand() * 180 + 10, y: rand() * 180 + 10,
      rot: rand() * 360, color: CONFETTI[i % CONFETTI.length],
      shape: ['rect', 'circle', 'squiggle'][i % 3],
    });
  }
  return (
    <svg viewBox="0 0 200 200" width="100%" height="100%">
      {pieces.map((p, i) => <ConfettiPiece key={i} {...p} />)}
    </svg>
  );
};

const BalloonSmall = () => (
  <svg viewBox="0 0 100 100" width="100%" height="100%">
    <Balloon x={50} y={40} size={22} color="#FF3E88" string={40} />
  </svg>
);

const ConfettiLiner = () => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <defs>
      <pattern id="confetti-tile" width="60" height="60" patternUnits="userSpaceOnUse">
        <ConfettiPiece x={10} y={15} rot={30} color="#FFC145" shape="rect" />
        <ConfettiPiece x={30} y={40} rot={-20} color="#FFFFFF" shape="rect" />
        <ConfettiPiece x={45} y={10} rot={0} color="#3EC5FF" shape="circle" />
        <ConfettiPiece x={5} y={45} rot={60} color="#7DD956" shape="squiggle" />
      </pattern>
    </defs>
    <rect width="200" height="200" fill="url(#confetti-tile)" />
  </svg>
);

// -------------------------------------------------------------------------- //
//  Gold theme                                                                 //
// -------------------------------------------------------------------------- //

const GoldFrame = () => (
  <svg viewBox="0 0 500 700" preserveAspectRatio="none" width="100%" height="100%">
    <rect x="18" y="18" width="464" height="664" fill="none" stroke="#C9A961" strokeWidth="0.6" />
    <rect x="26" y="26" width="448" height="648" fill="none" stroke="#C9A961" strokeWidth="1.6" />
    {/* corner ornaments */}
    {[[26, 26], [474, 26], [26, 674], [474, 674]].map(([x, y], i) => (
      <g key={i} transform={`translate(${x} ${y})`}>
        <circle cx="0" cy="0" r="4" fill="#C9A961" />
      </g>
    ))}
  </svg>
);

const GoldOrnament = () => (
  <svg viewBox="0 0 200 60" width="100%" height="100%">
    <g stroke="#C9A961" fill="none" strokeWidth="1.2">
      <line x1="30" y1="30" x2="80" y2="30" />
      <line x1="120" y1="30" x2="170" y2="30" />
      <circle cx="100" cy="30" r="8" />
      <circle cx="100" cy="30" r="3" fill="#C9A961" />
      <path d="M 85 25 Q 100 15 115 25" />
      <path d="M 85 35 Q 100 45 115 35" />
    </g>
  </svg>
);

const GoldLineThin = () => (
  <svg viewBox="0 0 200 40" width="100%" height="100%">
    <line x1="20" y1="20" x2="80" y2="20" stroke="#C9A961" strokeWidth="0.8" />
    <line x1="120" y1="20" x2="180" y2="20" stroke="#C9A961" strokeWidth="0.8" />
    <circle cx="100" cy="20" r="3" fill="none" stroke="#C9A961" strokeWidth="1" />
    <circle cx="100" cy="20" r="1" fill="#C9A961" />
  </svg>
);

const GoldLiner = () => (
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <defs>
      <pattern id="gold-tile" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="15" cy="15" r="1.5" fill="#C9A961" opacity="0.9" />
      </pattern>
    </defs>
    <rect width="200" height="200" fill="url(#gold-tile)" opacity="0.8" />
  </svg>
);

// -------------------------------------------------------------------------- //

const REGISTRY = {
  floral_frame:    FloralFrame,
  floral_corner:   FloralCorner,
  floral_bottom:   FloralBottom,
  floral_stamp:    FloralStamp,
  floral_liner:    FloralLiner,

  confetti_burst:  ConfettiBurst,
  balloons_bunch:  BalloonsBunch,
  confetti_scatter: ConfettiScatter,
  balloon_small:   BalloonSmall,
  confetti_liner:  ConfettiLiner,

  gold_frame:      GoldFrame,
  gold_ornament:   GoldOrnament,
  gold_line_thin:  GoldLineThin,
  gold_liner:      GoldLiner,
};

export default function SvgDecor({ kind }) {
  const Cmp = REGISTRY[kind];
  if (!Cmp) return null;
  return <Cmp />;
}
