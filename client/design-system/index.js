/* myKado Design System — public entry point */

// Tokens are CSS-imported via ./tokens.css (in index.css)
// Import components/utilities from here.

export { Icon, BRIQUE_ICONS } from './Icon.jsx';
export { Motif, motifBackground, AVAILABLE_MOTIFS } from './motifs/Motif.jsx';
export { celebrate, CONFETTI_PALETTES, CONFETTI_SHAPES, CONFETTI_PRESETS, resolvePreset } from './confetti.js';

// Primitives
export * from './primitives/index.js';

// Composed
export * from './composed/index.js';

// Layout
export * from './layout/index.jsx';
