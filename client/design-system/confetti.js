/* ================================================================
   myKado — Confetti presets + engine wrapper
   Palettes et presets alignés sur les tokens brand.
   L'implémentation particules sera branchée sur canvas-confetti
   ou GSAP quand l'un des deux sera installé (voir TODO en bas).
   ================================================================ */

export const CONFETTI_PALETTES = {
  brand:       ['#1E2952', '#E8A33D', '#C13B3B', '#FAF7F0'],
  gold:        ['#E8A33D', '#F2D68A', '#C88B2D', '#FDF7EA'],
  celebration: ['#E8A33D', '#C13B3B', '#2E4A3B', '#1E2952'],
  soft:        ['#F9EBC7', '#F5D5D5', '#DFE3EE', '#EDF3EF'],
  monogold:    ['#E8A33D'],
};

export const CONFETTI_SHAPES = [
  'circle',
  'circle-outline',
  'square',
  'diamond',
  'star-4pt',
  'line',
  'petal',
  'triangle-fine',
];

/**
 * Presets d'événements — chaque moment de célébration a son signature confetti.
 * Utilisation : celebrate('card-open')
 */
export const CONFETTI_PRESETS = {
  'card-open': {
    count: 60,
    palette: 'brand',
    shapes: ['diamond', 'star-4pt', 'line'],
    duration: 1600,
    spread: 70,
    origin: { y: 0.6 },
  },
  'wall-open': {
    count: 120,
    palette: 'celebration',
    shapes: CONFETTI_SHAPES,
    duration: 2400,
    spread: 100,
    origin: { y: 0.7 },
  },
  'gift-received': {
    count: 40,
    palette: 'gold',
    shapes: ['star-4pt', 'circle'],
    duration: 1200,
    spread: 60,
    origin: { y: 0.65 },
  },
  'form-success': {
    count: 20,
    palette: 'monogold',
    shapes: ['diamond'],
    duration: 800,
    spread: 40,
    origin: { y: 0.5 },
  },
  'projection-loop': {
    count: 8,
    palette: 'brand',
    shapes: ['diamond'],
    duration: 400,
    loop: true,
  },
};

/**
 * Résout un preset (ou objet custom) en config prête pour l'engine.
 */
export function resolvePreset(preset, overrides = {}) {
  const base = typeof preset === 'string' ? CONFETTI_PRESETS[preset] : preset;
  if (!base) {
    console.warn(`[confetti] Unknown preset: ${preset}`);
    return null;
  }
  return {
    ...base,
    colors: CONFETTI_PALETTES[base.palette] ?? base.colors ?? CONFETTI_PALETTES.brand,
    ...overrides,
  };
}

/**
 * API publique — à brancher sur canvas-confetti quand installé.
 * En attendant : no-op qui log en dev.
 *
 * Usage :
 *   celebrate('card-open')
 *   celebrate('gift-received', { origin: { y: 0.4 } })
 *   celebrate({ count: 10, palette: 'gold', shapes: ['star-4pt'] })
 */
export function celebrate(preset, overrides) {
  const config = resolvePreset(preset, overrides);
  if (!config) return;

  if (typeof window === 'undefined') return; // SSR safety

  // Respect prefers-reduced-motion
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // TODO(design-system): brancher canvas-confetti ici.
  // import confetti from 'canvas-confetti';
  // confetti({
  //   particleCount: config.count,
  //   spread: config.spread,
  //   origin: config.origin,
  //   colors: config.colors,
  //   ticks: Math.round(config.duration / 16),
  //   shapes: mapShapes(config.shapes),
  // });

  if (import.meta.env?.DEV) {
    console.log('[confetti] celebrate', config);
  }
}

export default celebrate;
