// -----------------------------------------------------------------------------
// Card Editor — Themes registry
//
// Each theme defines a coordinated look across 5 surfaces:
//   envelope + page1 (cover) + page2 (inside-left) + page3 (inside-right) + page4 (back)
//
// Assets:
//   Each decor slot supports `imageUrl` (PNG/JPG, e.g. from user upload / CDN)
//   AND `svg` (fallback identifier resolved by <SvgDecor kind={svg}/>).
//   If `imageUrl` is set it wins. Otherwise the inline SVG placeholder is used.
// -----------------------------------------------------------------------------

export const THEMES = {
  floral_champetres: {
    id: 'floral_champetres',
    name: 'Fleurs Champêtres',
    tagline: 'Aquarelle romantique',
    // Small preview swatches shown in the theme grid
    swatches: ['#FEFBF6', '#EDE0CC', '#B4614A', '#D4A574', '#7A8B5C'],

    palette: {
      paper:    '#FEFBF6',
      envelope: '#EDE0CC',
      ink:      '#2C3E50',
      accent:   '#B4614A',
      soft:     '#D4A574',
      leaf:     '#7A8B5C',
    },

    fonts: {
      display: "'Playfair Display', 'Cormorant Garamond', Georgia, serif",
      body:    "'Cormorant Garamond', Georgia, serif",
      script:  "'Great Vibes', 'Allura', cursive",
    },

    envelope: {
      color: '#EDE0CC',
      texture: 'linen',                 // linen | smooth | kraft | satin (fallback procédural)
      paperUrl: '/textures/paper-cream.webp',
      linerPattern: { imageUrl: '/backgrounds/theme-floral/floral_liner.webp', svg: 'floral_liner' },
      waxSeal:  { color: '#B4614A', letter: '' },
    },

    cover: {
      background: '#FEFBF6',
      texture: 'paper',
      decor: [
        // vertical rose cascade running down the right edge of the cover
        { imageUrl: '/backgrounds/theme-floral/floral_frame.webp', svg: 'floral_frame', position: 'right', size: 55, opacity: 1 },
      ],
      title: {
        font: "'Playfair Display', serif",
        color: '#2C3E50',
        size: 28,
        weight: 700,
        transform: 'uppercase',
        letterSpacing: '3px',
        align: 'left',
      },
      subtitle: {
        font: "'Great Vibes', cursive",
        color: '#B4614A',
        size: 42,
        align: 'left',
      },
    },

    insideLeft: {
      background: '#FEFBF6',
      texture: 'paper',
      decor: [
        // top-right + bottom-left L-shape corner
        { imageUrl: '/backgrounds/theme-floral/floral_corner.webp', svg: 'floral_corner', position: 'fill', opacity: 0.35 },
      ],
      photoFrame: {
        shape: 'oval',                  // oval | rounded | square | circle
        borderColor: '#D4A574',
        borderWidth: 2,
        padding: 6,
        caption: { font: "'Great Vibes', cursive", color: '#B4614A', size: 22 },
      },
    },

    insideRight: {
      background: '#FEFBF6',
      texture: 'paper',
      decor: [
        { imageUrl: '/backgrounds/theme-floral/floral_bottom.webp', svg: 'floral_bottom', position: 'bottom-center', size: 100, opacity: 0.85 },
      ],
      message: {
        font: "'Cormorant Garamond', serif",
        color: '#2C3E50',
        size: 16,
        lineHeight: 1.7,
        align: 'center',
      },
      signature: {
        font: "'Great Vibes', cursive",
        color: '#B4614A',
        size: 28,
        align: 'right',
      },
    },

    back: {
      background: '#FEFBF6',
      texture: 'paper',
      decor: [
        { imageUrl: '/backgrounds/theme-floral/floral_corner.webp', svg: 'floral_stamp', position: 'bottom-right', size: 40, opacity: 0.4 },
      ],
      footer: {
        font: "'Cormorant Garamond', serif",
        color: '#B4614A',
        size: 11,
        transform: 'uppercase',
        letterSpacing: '2px',
        align: 'center',
      },
    },
  },

  // ---------------------------------------------------------------------------
  confetti_pop: {
    id: 'confetti_pop',
    name: 'Confettis Pop',
    tagline: 'Fête & couleurs vives',
    swatches: ['#FFF6EE', '#FF3E88', '#FFC145', '#3EC5FF', '#2B2440'],

    palette: {
      paper:    '#FFF6EE',
      envelope: '#FF3E88',
      ink:      '#2B2440',
      accent:   '#FF3E88',
      soft:     '#FFC145',
      leaf:     '#3EC5FF',
    },

    fonts: {
      display: "'Fredoka', 'Baloo 2', system-ui, sans-serif",
      body:    "'Plus Jakarta Sans', system-ui, sans-serif",
      script:  "'Caveat', 'Fredoka', cursive",
    },

    envelope: {
      color: '#FF3E88',
      texture: 'smooth',
      // Grain ivoire posé en multiply pour donner du relief sans altérer le rose vif.
      paperUrl: '/textures/paper-ivory.webp',
      paperBlend: 'multiply',
      paperOpacity: 0.55,
      linerPattern: { imageUrl: null, svg: 'confetti_liner' },
      waxSeal:  { color: '#FFC145', letter: '' },
    },

    cover: {
      background: '#FFF6EE',
      texture: 'smooth',
      decor: [
        { imageUrl: null, svg: 'balloons_bunch', position: 'top-center',  size: 55, opacity: 1 },
        { imageUrl: null, svg: 'confetti_burst', position: 'fill', opacity: 0.9 },
      ],
      title: {
        font: "'Fredoka', sans-serif",
        color: '#2B2440',
        size: 36,
        weight: 700,
        transform: 'none',
        letterSpacing: '-0.5px',
        align: 'center',
      },
      subtitle: {
        font: "'Caveat', cursive",
        color: '#FF3E88',
        size: 40,
        align: 'center',
      },
    },

    insideLeft: {
      background: '#FFF6EE',
      texture: 'smooth',
      decor: [
        { imageUrl: null, svg: 'confetti_scatter', position: 'top-left', size: 60, opacity: 0.7 },
      ],
      photoFrame: {
        shape: 'rounded',
        borderColor: '#FFC145',
        borderWidth: 4,
        padding: 6,
        caption: { font: "'Caveat', cursive", color: '#FF3E88', size: 24 },
      },
    },

    insideRight: {
      background: '#FFF6EE',
      texture: 'smooth',
      decor: [
        { imageUrl: null, svg: 'confetti_scatter', position: 'bottom-right', size: 55, opacity: 0.55 },
      ],
      message: {
        font: "'Plus Jakarta Sans', sans-serif",
        color: '#2B2440',
        size: 16,
        lineHeight: 1.6,
        align: 'center',
      },
      signature: {
        font: "'Caveat', cursive",
        color: '#FF3E88',
        size: 30,
        align: 'right',
      },
    },

    back: {
      background: '#FFF6EE',
      texture: 'smooth',
      decor: [
        { imageUrl: null, svg: 'balloon_small', position: 'bottom-center', size: 30, opacity: 0.9 },
      ],
      footer: {
        font: "'Fredoka', sans-serif",
        color: '#FF3E88',
        size: 12,
        transform: 'none',
        letterSpacing: '0px',
        align: 'center',
      },
    },
  },

  // ---------------------------------------------------------------------------
  chic_gold: {
    id: 'chic_gold',
    name: 'Chic & Doré',
    tagline: 'Minimaliste sophistiqué',
    swatches: ['#FFFFFF', '#111111', '#C9A961', '#E8DCC0', '#4A4A4A'],

    palette: {
      paper:    '#FBFAF6',
      envelope: '#111111',
      ink:      '#1A1A1A',
      accent:   '#C9A961',
      soft:     '#E8DCC0',
      leaf:     '#4A4A4A',
    },

    fonts: {
      display: "'Cormorant Garamond', 'Playfair Display', serif",
      body:    "'Inter', system-ui, sans-serif",
      script:  "'Cormorant Garamond', serif",
    },

    envelope: {
      color: '#111111',
      texture: 'smooth',
      paperUrl: '/textures/paper-black.webp',
      linerPattern: { imageUrl: null, svg: 'gold_liner' },
      waxSeal:  { color: '#C9A961', letter: '' },
    },

    cover: {
      background: '#FBFAF6',
      texture: 'smooth',
      decor: [
        { imageUrl: null, svg: 'gold_frame', position: 'fill', opacity: 1 },
        { imageUrl: null, svg: 'gold_ornament', position: 'top-center', size: 22, opacity: 1 },
      ],
      title: {
        font: "'Cormorant Garamond', serif",
        color: '#1A1A1A',
        size: 32,
        weight: 400,
        transform: 'uppercase',
        letterSpacing: '6px',
        align: 'center',
      },
      subtitle: {
        font: "'Cormorant Garamond', serif",
        color: '#C9A961',
        size: 46,
        align: 'center',
      },
    },

    insideLeft: {
      background: '#FBFAF6',
      texture: 'smooth',
      decor: [
        { imageUrl: null, svg: 'gold_line_thin', position: 'top-center', size: 40, opacity: 1 },
        { imageUrl: null, svg: 'gold_line_thin', position: 'bottom-center', size: 40, opacity: 1 },
      ],
      photoFrame: {
        shape: 'square',
        borderColor: '#C9A961',
        borderWidth: 1,
        padding: 10,
        caption: { font: "'Cormorant Garamond', serif", color: '#C9A961', size: 18 },
      },
    },

    insideRight: {
      background: '#FBFAF6',
      texture: 'smooth',
      decor: [
        { imageUrl: null, svg: 'gold_line_thin', position: 'top-center', size: 40, opacity: 1 },
      ],
      message: {
        font: "'Inter', sans-serif",
        color: '#1A1A1A',
        size: 15,
        lineHeight: 1.75,
        align: 'center',
      },
      signature: {
        font: "'Cormorant Garamond', serif",
        color: '#C9A961',
        size: 26,
        align: 'right',
        italic: true,
      },
    },

    back: {
      background: '#FBFAF6',
      texture: 'smooth',
      decor: [
        { imageUrl: null, svg: 'gold_ornament', position: 'bottom-center', size: 18, opacity: 0.8 },
      ],
      footer: {
        font: "'Inter', sans-serif",
        color: '#C9A961',
        size: 10,
        transform: 'uppercase',
        letterSpacing: '4px',
        align: 'center',
      },
    },
  },
};

export const THEME_IDS = Object.keys(THEMES);
export const DEFAULT_THEME_ID = 'floral_champetres';
