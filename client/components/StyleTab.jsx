import { useEffect } from 'react';
import styles from './StyleTab.module.css';

const STYLE_PALETTES = [
  { id: 'rose',    name: 'Tendre rose',       colors: ['#FFE0E6', '#FFB3C1', '#E11D48'] },
  { id: 'lilac',   name: 'Lilas onirique',    colors: ['#E5D9F5', '#B59CF0', '#6E4FBA'] },
  { id: 'mint',    name: 'Menthe frais',      colors: ['#D4F1E5', '#9FE3CB', '#1F6E55'] },
  { id: 'sunset',  name: 'Coucher de soleil', colors: ['#FFD7C2', '#FFAE82', '#B84C1F'] },
  { id: 'gold',    name: 'Or doré',           colors: ['#FFE7AD', '#FFC95A', '#A86E00'] },
  { id: 'night',   name: 'Nuit étoilée',      colors: ['#3A2D5F', '#6B5BA0', '#FFC95A'] },
];

const TEXT_PALETTES = [
  { id: 'dark',  name: 'Nuit',    textColor: '#1A1424', textMuted: '#8A8195' },
  { id: 'light', name: 'Blanc',   textColor: '#FFFFFF', textMuted: '#D0C8D4' },
  { id: 'sepia', name: 'Sépia',   textColor: '#2C1810', textMuted: '#9E7B6A' },
  { id: 'gold',  name: 'Doré',    textColor: '#F5E6D3', textMuted: '#C9A97A' },
  { id: 'slate', name: 'Ardoise', textColor: '#0D1B2A', textMuted: '#607B96' },
  { id: 'berry', name: 'Grenat',  textColor: '#3B0A1A', textMuted: '#9E4060' },
];

const TYPOGRAPHY = [
  { id: 'serif',  label: 'Élégant',   fontFamily: 'Playfair Display', italic: true  },
  { id: 'fest',   label: 'Festif',    fontFamily: 'Pacifico'                        },
  { id: 'mod',    label: 'Moderne',   fontFamily: 'Poppins'                         },
  { id: 'bold',   label: 'Audacieux', fontFamily: 'Raleway',          bold: true    },
];

export default function StyleTab({ style, onChange }) {
  const s = {
    primaryColor: '#E11D48',
    accentColor:  '#FFB3C1',
    fontFamily:   'Playfair Display',
    fontSize:     'medium',
    textColor:    '#1A1424',
    textMuted:    '#8A8195',
    paletteId:    'rose',
    typographyId: 'serif',
    ...style,
  };

  /* Load fonts for the panel UI preview */
  useEffect(() => {
    if (document.querySelector('link[data-mk-typo]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.setAttribute('data-mk-typo', '1');
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400;1,600&family=Pacifico&family=Poppins:wght@400;600&family=Raleway:wght@400;700;900&display=swap';
    document.head.appendChild(link);
  }, []);

  const handlePalette = (p) => {
    onChange({ primaryColor: p.colors[2], accentColor: p.colors[1], paletteId: p.id });
  };

  const handleTypography = (t) => {
    onChange({ fontFamily: t.fontFamily, typographyId: t.id });
  };

  const activePaletteId = s.paletteId ||
    STYLE_PALETTES.find(p => p.colors[2] === s.primaryColor)?.id;

  const activeTypoId = s.typographyId ||
    TYPOGRAPHY.find(t => t.fontFamily === s.fontFamily)?.id;

  const handleTextPalette = (p) => {
    onChange({ textColor: p.textColor, textMuted: p.textMuted, textPaletteId: p.id });
  };

  const activeTextPaletteId = s.textPaletteId ||
    TEXT_PALETTES.find(p => p.textColor === s.textColor)?.id;

  return (
    <div className={styles.root}>

      {/* ── Palettes ── */}
      <div className={styles.group}>
        <div className={styles.groupLabel}>PALETTE DE COULEURS</div>
        <div className={styles.paletteGrid}>
          {STYLE_PALETTES.map(p => (
            <button
              key={p.id}
              className={`${styles.paletteCard} ${activePaletteId === p.id ? styles.paletteCardActive : ''}`}
              onClick={() => handlePalette(p)}
            >
              <div className={styles.paletteSwatch}>
                {p.colors.map((c, i) => (
                  <span key={i} className={styles.paletteColor} style={{ background: c }} />
                ))}
              </div>
              <div className={styles.paletteName}>{p.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Typography ── */}
      <div className={styles.group}>
        <div className={styles.groupLabel}>TYPOGRAPHIE</div>
        <div className={styles.typoGrid}>
          {TYPOGRAPHY.map(t => (
            <button
              key={t.id}
              className={`${styles.typoCard} ${activeTypoId === t.id ? styles.typoCardActive : ''}`}
              onClick={() => handleTypography(t)}
            >
              <div
                className={styles.typoAa}
                style={{
                  fontFamily: `'${t.fontFamily}', serif`,
                  fontStyle:  t.italic ? 'italic' : 'normal',
                  fontWeight: t.bold   ? 900      : 600,
                }}
              >
                Aa
              </div>
              <div className={styles.typoLabel}>{t.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Couleur du texte ── */}
      <div className={styles.group}>
        <div className={styles.groupLabel}>COULEUR DU TEXTE</div>
        <div className={styles.textPaletteGrid}>
          {TEXT_PALETTES.map(p => (
            <button
              key={p.id}
              className={`${styles.textPaletteCard} ${activeTextPaletteId === p.id ? styles.textPaletteCardActive : ''}`}
              onClick={() => handleTextPalette(p)}
            >
              <div className={styles.textPaletteDots}>
                <span className={styles.textPaletteDot} style={{ background: p.textColor, border: p.textColor === '#FFFFFF' ? '1.5px solid #ddd' : 'none' }} />
                <span className={styles.textPaletteDot} style={{ background: p.textMuted }} />
              </div>
              <div className={styles.textPaletteName}>{p.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Taille ── */}
      <div className={styles.group}>
        <div className={styles.groupLabel}>TAILLE DE POLICE</div>
        <div className={styles.sizeRow}>
          {[
            { value: 'small',  label: 'Compact', desc: '90%'  },
            { value: 'medium', label: 'Normal',  desc: '100%' },
            { value: 'large',  label: 'Grand',   desc: '115%' },
          ].map(sz => (
            <button
              key={sz.value}
              className={`${styles.sizeBtn} ${s.fontSize === sz.value ? styles.sizeBtnActive : ''}`}
              onClick={() => onChange('fontSize', sz.value)}
            >
              <span>{sz.label}</span>
              <small>{sz.desc}</small>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
