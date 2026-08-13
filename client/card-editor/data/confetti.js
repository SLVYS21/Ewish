import confetti from 'canvas-confetti';

// --------------------------------------------------------------------------
// Confetti styles offered in the wizard.
//
//   - `preview` : hex used in the tiny swatch inside the picker UI
//   - `fire`    : function launching the confetti at a given viewport origin
//                 (0 to 1 in both x and y). Called both by the Test button
//                 in the sidebar and by the unboxing scene when the seal breaks.
// --------------------------------------------------------------------------

const heartPath = 'M 12 3 C 12 3 15 -1 20 -1 C 27 -1 30 6 30 12 C 30 22 20 30 12 34 C 4 30 -6 22 -6 12 C -6 6 -3 -1 4 -1 C 9 -1 12 3 12 3 Z';
const starPath  = 'M 0 -12 L 3 -4 L 12 -3 L 5 3 L 7 12 L 0 7 L -7 12 L -5 3 L -12 -3 L -3 -4 Z';
const petalPath = 'M 0 0 C -4 -8 -8 -12 0 -20 C 8 -12 4 -8 0 0 Z';

// Cached shapes (created lazily so canvas-confetti's shapeFromPath is safe
// under SSR / test envs where document may not exist).
let _shapes = null;
function shapes() {
  if (_shapes) return _shapes;
  try {
    _shapes = {
      heart: confetti.shapeFromPath({ path: heartPath }),
      star:  confetti.shapeFromPath({ path: starPath  }),
      petal: confetti.shapeFromPath({ path: petalPath }),
    };
  } catch {
    _shapes = { heart: 'circle', star: 'square', petal: 'circle' };
  }
  return _shapes;
}

const burst = (opts, origin = { x: 0.5, y: 0.55 }) => {
  const common = { spread: 70, startVelocity: 45, ticks: 220, disableForReducedMotion: true, ...opts };
  confetti({ ...common, origin: { x: origin.x - 0.2, y: origin.y }, angle: 60 });
  confetti({ ...common, origin: { x: origin.x + 0.2, y: origin.y }, angle: 120 });
  setTimeout(() => confetti({ ...common, particleCount: Math.round((common.particleCount || 80) * 0.6), origin }), 220);
};

export const CONFETTI_STYLES = [
  {
    key: 'none', label: 'Aucun', preview: '#E5DED3',
    fire: () => {},
  },
  {
    key: 'classic', label: 'Classique', preview: '#FF5470',
    fire: (origin) => burst({
      particleCount: 90,
      colors: ['#FF5470', '#FFC145', '#3EC5FF', '#7DD956', '#B168F5', '#FF8A5C'],
      shapes: ['square', 'circle'],
      scalar: 1.1,
    }, origin),
  },
  {
    key: 'gold', label: 'Doré', preview: '#C9A961',
    fire: (origin) => burst({
      particleCount: 120,
      colors: ['#C9A961', '#E6C88E', '#FFD700', '#FFF5DC', '#8C6F2E'],
      shapes: ['square'],
      scalar: 0.85,
    }, origin),
  },
  {
    key: 'petals', label: 'Pétales', preview: '#FBCFE0',
    fire: (origin) => burst({
      particleCount: 70,
      colors: ['#FFB3C1', '#FBCFE0', '#F8C8DC', '#FFE4E6', '#F9A8D4'],
      shapes: [shapes().petal],
      scalar: 1.3,
      gravity: 0.6,   // pétales flottent plus lentement
      drift: 1.2,
    }, origin),
  },
  {
    key: 'hearts', label: 'Cœurs', preview: '#E11D48',
    fire: (origin) => burst({
      particleCount: 55,
      colors: ['#FF3E88', '#E11D48', '#FF5470', '#FBB6CE'],
      shapes: [shapes().heart],
      scalar: 1.4,
    }, origin),
  },
  {
    key: 'stars', label: 'Étoiles', preview: '#FFD700',
    fire: (origin) => burst({
      particleCount: 70,
      colors: ['#FFD700', '#FFA500', '#FF6B35', '#FFEA80'],
      shapes: [shapes().star],
      scalar: 1.2,
    }, origin),
  },
];

export const CONFETTI_MAP = Object.fromEntries(CONFETTI_STYLES.map(s => [s.key, s]));

export function fireConfetti(styleKey, origin) {
  const preset = CONFETTI_MAP[styleKey] || CONFETTI_MAP.classic;
  preset.fire(origin);
}
