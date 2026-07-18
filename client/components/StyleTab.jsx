import { useEffect } from 'react';
import styles from './StyleTab.module.css';

const STYLE_PALETTES = [
  /* ─── myKado Hybride C+A (signature) ─── */
  { id: 'mk-signature',   name: 'myKado signature', colors: ['#F3EEE1', '#E8A33D', '#1E2952'] },
  { id: 'mk-terre',       name: 'Terre chaude',     colors: ['#F5D5D5', '#E8A33D', '#C13B3B'] },
  { id: 'mk-foret',       name: 'Forêt sacrée',     colors: ['#EDF3EF', '#E8A33D', '#2E4A3B'] },
  { id: 'mk-nuit-doree',  name: 'Nuit dorée',       colors: ['#1E2952', '#E8A33D', '#161311'] },
  { id: 'mk-argile',      name: 'Argile & or',      colors: ['#F9EBC7', '#C13B3B', '#9F6D22'] },
  { id: 'mk-indigo-clair',name: 'Indigo clair',     colors: ['#DFE3EE', '#E8A33D', '#354270'] },

  /* ─── Legacy pastel (conservé pour compat, à retirer plus tard) ─── */
  { id: 'rose',    name: 'Tendre rose',       colors: ['#FFE0E6', '#FFB3C1', '#E11D48'] },
  { id: 'lilac',   name: 'Lilas onirique',    colors: ['#E5D9F5', '#B59CF0', '#6E4FBA'] },
  { id: 'mint',    name: 'Menthe frais',      colors: ['#D4F1E5', '#9FE3CB', '#1F6E55'] },
  { id: 'sunset',  name: 'Coucher de soleil', colors: ['#FFD7C2', '#FFAE82', '#B84C1F'] },
  { id: 'gold',    name: 'Or doré',           colors: ['#FFE7AD', '#FFC95A', '#A86E00'] },
  { id: 'night',   name: 'Nuit étoilée',      colors: ['#3A2D5F', '#6B5BA0', '#FFC95A'] },
];

const TEXT_PALETTES = [
  /* ─── myKado Hybride C+A ─── */
  { id: 'mk-ink',    name: 'Encre myKado', textColor: '#161311', textMuted: '#7D7156' },
  { id: 'mk-indigo', name: 'Indigo doux',  textColor: '#1E2952', textMuted: '#5B6994' },
  { id: 'mk-creme',  name: 'Sur crème',    textColor: '#FFFFFF', textMuted: '#F3EEE1' },
  { id: 'mk-brasse', name: 'Or sur nuit',  textColor: '#E8A33D', textMuted: '#C88B2D' },

  /* ─── Legacy ─── */
  { id: 'dark',  name: 'Nuit',    textColor: '#1A1424', textMuted: '#8A8195' },
  { id: 'light', name: 'Blanc',   textColor: '#FFFFFF', textMuted: '#D0C8D4' },
  { id: 'sepia', name: 'Sépia',   textColor: '#2C1810', textMuted: '#9E7B6A' },
  { id: 'gold',  name: 'Doré',    textColor: '#F5E6D3', textMuted: '#C9A97A' },
  { id: 'slate', name: 'Ardoise', textColor: '#0D1B2A', textMuted: '#607B96' },
  { id: 'berry', name: 'Grenat',  textColor: '#3B0A1A', textMuted: '#9E4060' },
];

const TYPOGRAPHY = [
  /* ─── myKado Hybride C+A ─── */
  { id: 'mk-editorial', label: 'Éditorial (myKado)', fontFamily: 'Fraunces',      italic: false },
  { id: 'mk-moderne',   label: 'Moderne (myKado)',   fontFamily: 'Inter'                        },

  /* ─── Legacy ─── */
  { id: 'serif',  label: 'Élégant',   fontFamily: 'Playfair Display', italic: true  },
  { id: 'fest',   label: 'Festif',    fontFamily: 'Pacifico'                        },
  { id: 'mod',    label: 'Moderne',   fontFamily: 'Poppins'                         },
  { id: 'bold',   label: 'Audacieux', fontFamily: 'Raleway',          bold: true    },
];

export default function StyleTab({ style, onChange }) {
  const s = {
    primaryColor: '#1E2952',  /* myKado indigo */
    accentColor:  '#E8A33D',  /* myKado gold */
    fontFamily:   'Fraunces',
    fontSize:     'medium',
    textColor:    '#161311',  /* stone-900 */
    textMuted:    '#7D7156',  /* stone-500 */
    paletteId:    'mk-signature',
    typographyId: 'mk-editorial',
    ...style,
  };

  /* Load fonts for the panel UI preview */
  useEffect(() => {
    if (document.querySelector('link[data-mk-typo]')) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.setAttribute('data-mk-typo', '1');
    link.href = 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400..700,0..100&family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,400;1,400;1,600&family=Pacifico&family=Poppins:wght@400;600&family=Raleway:wght@400;700;900&display=swap';
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
