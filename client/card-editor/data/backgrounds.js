// --------------------------------------------------------------------------
// Backgrounds available for the unboxing scene.
// Sources: client/public/backgrounds/*  (already used by other templates).
//
// The `default` option matches the beige radial gradient used in the wizard
// preview area, so switching from wizard → unboxing feels seamless.
// --------------------------------------------------------------------------

export const UNBOXING_BACKGROUNDS = [
  {
    key: 'default',
    label: 'Beige',
    bg:   'radial-gradient(ellipse at center, #F8EDDD 0%, #E5D5BC 100%)',
    swatch: 'linear-gradient(135deg, #F8EDDD, #E5D5BC)',
  },
  {
    key: 'paper',
    label: 'Papier',
    bg:   "url('/backgrounds/Paper.jpg') center/cover",
    swatch: "url('/backgrounds/Paper.jpg') center/cover",
  },
  {
    key: 'luxury_paper',
    label: 'Papier luxe',
    bg:   "url('/backgrounds/luxury_paper.jpg') center/cover",
    swatch: "url('/backgrounds/luxury_paper.jpg') center/cover",
  },
  {
    key: 'elegant_dark',
    label: 'Élégant sombre',
    bg:   "url('/backgrounds/elegant_dark.jpg') center/cover",
    swatch: "url('/backgrounds/elegant_dark.jpg') center/cover",
  },
  {
    key: 'festi',
    label: 'Festif',
    bg:   "url('/backgrounds/Festi.jpg') center/cover",
    swatch: "url('/backgrounds/Festi.jpg') center/cover",
  },
  {
    key: 'balloons',
    label: 'Ballons',
    bg:   "url('/backgrounds/premium_balloons.jpg') center/cover",
    swatch: "url('/backgrounds/premium_balloons.jpg') center/cover",
  },
  {
    key: 'valentine',
    label: 'Valentine',
    bg:   "url('/backgrounds/Valentine.jpg') center/cover",
    swatch: "url('/backgrounds/Valentine.jpg') center/cover",
  },
  {
    key: 'fun_hearts',
    label: 'Cœurs fun',
    bg:   "url('/backgrounds/Fun-hearts.png') center/cover, #FFF5F7",
    swatch: "url('/backgrounds/Fun-hearts.png') center/cover, #FFF5F7",
  },
  {
    key: 'hearts',
    label: 'Cœurs pastel',
    bg:   "url('/backgrounds/hearts.png') center/cover, #FFF9F9",
    swatch: "url('/backgrounds/hearts.png') center/cover, #FFF9F9",
  },
];

export const UNBOXING_BG_MAP = Object.fromEntries(UNBOXING_BACKGROUNDS.map(b => [b.key, b]));

export const DEFAULT_BG_KEY       = 'default';
export const DEFAULT_CONFETTI_KEY = 'classic';
