import styles from './StyleTab.module.css';

const FONTS = [
  'Work Sans',
  'Inter',
  'Playfair Display',
  'Pacifico',
  'Dancing Script',
  'Montserrat',
  'Poppins',
  'Lato',
  'Raleway',
  'Nunito',
];

const FONT_SIZES = [
  { value: 'small', label: 'Small', desc: '90%' },
  { value: 'medium', label: 'Medium', desc: '100%' },
  { value: 'large', label: 'Large', desc: '115%' },
];

const THEMES = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark', label: 'Dark', icon: '🌙' },
];

const PRESETS = [
  { label: 'Birthday Pink', primary: '#ff69b4', accent: '#ffb347' },
  { label: 'Ocean Blue',    primary: '#0ea5e9', accent: '#38bdf8' },
  { label: 'Forest Green',  primary: '#22c55e', accent: '#a3e635' },
  { label: 'Royal Purple',  primary: '#a855f7', accent: '#ec4899' },
  { label: 'Sunset',        primary: '#f97316', accent: '#fbbf24' },
  { label: 'Rose Gold',     primary: '#e11d48', accent: '#f43f5e' },
];

export default function StyleTab({ style, onChange }) {
  const s = {
    primaryColor: '#ff69b4',
    accentColor: '#ffb347',
    fontFamily: 'Work Sans',
    fontSize: 'medium',
    theme: 'light',
    ...style,
  };

  return (
    <div className={styles.root}>

      {/* Color Presets */}
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>🎨 Color Presets</h3>
        <div className={styles.presets}>
          {PRESETS.map(p => (
            <button
              key={p.label}
              className={`${styles.preset} ${s.primaryColor === p.primary ? styles.presetActive : ''}`}
              onClick={() => { onChange('primaryColor', p.primary); onChange('accentColor', p.accent); }}
              title={p.label}
            >
              <span className={styles.presetSwatch} style={{
                background: `linear-gradient(135deg, ${p.primary}, ${p.accent})`
              }} />
              <span className={styles.presetLabel}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom colors */}
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>🖌 Custom Colors</h3>
        <div className={styles.colorRow}>
          <label className={styles.colorLabel}>Primary</label>
          <div className={styles.colorPair}>
            <input
              type="color" value={s.primaryColor}
              onChange={e => onChange('primaryColor', e.target.value)}
              className={styles.colorPicker}
            />
            <input
              type="text" value={s.primaryColor}
              onChange={e => onChange('primaryColor', e.target.value)}
              className={styles.colorInput}
            />
          </div>
        </div>
        <div className={styles.colorRow}>
          <label className={styles.colorLabel}>Accent</label>
          <div className={styles.colorPair}>
            <input
              type="color" value={s.accentColor}
              onChange={e => onChange('accentColor', e.target.value)}
              className={styles.colorPicker}
            />
            <input
              type="text" value={s.accentColor}
              onChange={e => onChange('accentColor', e.target.value)}
              className={styles.colorInput}
            />
          </div>
        </div>
      </div>

      {/* Font Family */}
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>✏️ Font Family</h3>
        <div className={styles.fontGrid}>
          {FONTS.map(f => (
            <button
              key={f}
              className={`${styles.fontBtn} ${s.fontFamily === f ? styles.fontActive : ''}`}
              style={{ fontFamily: `'${f}', sans-serif` }}
              onClick={() => onChange('fontFamily', f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Font Size */}
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>🔠 Font Size</h3>
        <div className={styles.sizeRow}>
          {FONT_SIZES.map(sz => (
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

      {/* Theme */}
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>🌗 Theme</h3>
        <div className={styles.themeRow}>
          {THEMES.map(t => (
            <button
              key={t.value}
              className={`${styles.themeBtn} ${s.theme === t.value ? styles.themeBtnActive : ''}`}
              onClick={() => onChange('theme', t.value)}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Live preview swatch */}
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>👁 Preview</h3>
        <div className={styles.sampleCard} style={{
          fontFamily: `'${s.fontFamily}', sans-serif`,
          fontSize: s.fontSize === 'small' ? '0.85rem' : s.fontSize === 'large' ? '1.05rem' : '0.9rem',
        }}>
          <div className={styles.sampleBadge} style={{
            background: `linear-gradient(135deg, ${s.primaryColor}, ${s.accentColor})`
          }}>Happy Birthday!</div>
          <p>A warm message just for you 🎂</p>
          <button className={styles.sampleBtn} style={{
            background: `linear-gradient(135deg, ${s.primaryColor}, ${s.accentColor})`
          }}>Voir mes vœux 💌</button>
        </div>
      </div>
    </div>
  );
}