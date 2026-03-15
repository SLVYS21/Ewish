import { useState, useEffect, useRef } from 'react';
import { getFonts, uploadFont, deleteFont } from '../utils/api';
import styles from './StyleTab.module.css';

const SYSTEM_FONTS = [
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
  { value: 'small',  label: 'Small',  desc: '90%'  },
  { value: 'medium', label: 'Medium', desc: '100%' },
  { value: 'large',  label: 'Large',  desc: '115%' },
];

const THEMES = [
  { value: 'light', label: 'Light', icon: '☀️' },
  { value: 'dark',  label: 'Dark',  icon: '🌙' },
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
    accentColor:  '#ffb347',
    fontFamily:   'Work Sans',
    fontSize:     'medium',
    theme:        'light',
    textColor:    '#333333',
    textMuted:    '#888888',
    ...style,
  };

  /* ── Custom fonts state ─────────────────────────────────────── */
  const [customFonts,   setCustomFonts]   = useState([]);
  const [uploading,     setUploading]     = useState(false);
  const [uploadError,   setUploadError]   = useState('');
  const [fontName,      setFontName]      = useState('');
  const [showUploader,  setShowUploader]  = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    getFonts()
      .then(r => setCustomFonts(r.data))
      .catch(() => {});
  }, []);

  // Inject @font-face for custom fonts into the editor page itself (for preview)
  useEffect(() => {
    customFonts.forEach(font => {
      if (!document.querySelector(`style[data-font="${font.name}"]`)) {
        const style = document.createElement('style');
        style.setAttribute('data-font', font.name);
        style.textContent = `@font-face { font-family: '${font.name}'; src: url('${font.url}') format('${font.format}'); font-display: swap; }`;
        document.head.appendChild(style);
      }
    });
  }, [customFonts]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!fontName.trim()) { setUploadError("Donne un nom à la font d'abord"); return; }

    setUploading(true);
    setUploadError('');
    try {
      const form = new FormData();
      form.append('file', file);
      form.append('name', fontName.trim());
      const r = await uploadFont(form);
      setCustomFonts(prev => [r.data, ...prev]);
      setFontName('');
      setShowUploader(false);
      onChange('fontFamily', r.data.name);
    } catch (e) {
      setUploadError(e.response?.data?.error || 'Upload échoué');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteFont = async (font, e) => {
    e.stopPropagation();
    if (!confirm(`Supprimer "${font.name}" ?`)) return;
    try {
      await deleteFont(font._id);
      setCustomFonts(prev => prev.filter(f => f._id !== font._id));
      if (s.fontFamily === font.name) onChange('fontFamily', 'Work Sans');
    } catch {}
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
            <input type="color" value={s.primaryColor}
              onChange={e => onChange('primaryColor', e.target.value)}
              className={styles.colorPicker} />
            <input type="text" value={s.primaryColor}
              onChange={e => onChange('primaryColor', e.target.value)}
              className={styles.colorInput} />
          </div>
        </div>
        <div className={styles.colorRow}>
          <label className={styles.colorLabel}>Accent</label>
          <div className={styles.colorPair}>
            <input type="color" value={s.accentColor}
              onChange={e => onChange('accentColor', e.target.value)}
              className={styles.colorPicker} />
            <input type="text" value={s.accentColor}
              onChange={e => onChange('accentColor', e.target.value)}
              className={styles.colorInput} />
          </div>
        </div>
      </div>

      {/* Text Colors */}
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>🔤 Couleur du texte</h3>
        <div className={styles.colorRow}>
          <label className={styles.colorLabel}>Principal</label>
          <div className={styles.colorPair}>
            <input type="color" value={s.textColor}
              onChange={e => onChange('textColor', e.target.value)}
              className={styles.colorPicker} />
            <input type="text" value={s.textColor}
              onChange={e => onChange('textColor', e.target.value)}
              className={styles.colorInput} />
          </div>
        </div>
        <div className={styles.colorRow}>
          <label className={styles.colorLabel}>Secondaire</label>
          <div className={styles.colorPair}>
            <input type="color" value={s.textMuted}
              onChange={e => onChange('textMuted', e.target.value)}
              className={styles.colorPicker} />
            <input type="text" value={s.textMuted}
              onChange={e => onChange('textMuted', e.target.value)}
              className={styles.colorInput} />
          </div>
        </div>
        <div className={styles.textPresets}>
          <button className={styles.textPresetBtn}
            onClick={() => { onChange('textColor', '#333333'); onChange('textMuted', '#888888'); }}>
            <span style={{color:'#333'}}>A</span> Sombre
          </button>
          <button className={styles.textPresetBtn}
            onClick={() => { onChange('textColor', '#ffffff'); onChange('textMuted', '#cccccc'); }}>
            <span style={{color:'#fff', textShadow:'0 0 2px #666'}}>A</span> Clair
          </button>
          <button className={styles.textPresetBtn}
            onClick={() => { onChange('textColor', '#f5e6d3'); onChange('textMuted', '#c9a97a'); }}>
            <span style={{color:'#c9a97a'}}>A</span> Doré
          </button>
        </div>
      </div>

      {/* Font Family */}
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>✏️ Police</h3>

        {/* Custom fonts section */}
        {customFonts.length > 0 && (
          <div className={styles.fontSection}>
            <p className={styles.fontSectionLabel}>Mes fonts</p>
            <div className={styles.fontGrid}>
              {customFonts.map(font => (
                <button
                  key={font._id}
                  className={`${styles.fontBtn} ${styles.fontCustom} ${s.fontFamily === font.name ? styles.fontActive : ''}`}
                  style={{ fontFamily: `'${font.name}', sans-serif` }}
                  onClick={() => onChange('fontFamily', font.name)}
                >
                  <span className={styles.fontBtnName}>{font.name}</span>
                  <span
                    className={styles.fontDeleteBtn}
                    onClick={(e) => handleDeleteFont(font, e)}
                    title="Supprimer"
                  >✕</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upload new font */}
        {showUploader ? (
          <div className={styles.fontUploader}>
            <input
              className={styles.fontNameInput}
              placeholder="Nom de la font (ex: Clash Display)"
              value={fontName}
              onChange={e => setFontName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
            />
            <label className={`${styles.fontUploadBtn} ${uploading ? styles.fontUploadBtnLoading : ''}`}>
              {uploading ? '⏳ Upload…' : '📁 Choisir le fichier (.ttf .otf .woff2)'}
              <input
                ref={fileInputRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2,font/*"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
                disabled={uploading}
              />
            </label>
            {uploadError && <p className={styles.fontError}>{uploadError}</p>}
            <button className={styles.fontCancelBtn} onClick={() => { setShowUploader(false); setUploadError(''); setFontName(''); }}>
              Annuler
            </button>
          </div>
        ) : (
          <button className={styles.addFontBtn} onClick={() => setShowUploader(true)}>
            ➕ Ajouter une font
          </button>
        )}

        {/* System fonts */}
        <p className={styles.fontSectionLabel} style={{ marginTop: 12 }}>Fonts système</p>
        <div className={styles.fontGrid}>
          {SYSTEM_FONTS.map(f => (
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

      {/* Live preview */}
      <div className={styles.group}>
        <h3 className={styles.groupTitle}>👁 Preview</h3>
        <div className={styles.sampleCard} style={{
          fontFamily: `'${s.fontFamily}', sans-serif`,
          fontSize: s.fontSize === 'small' ? '0.85rem' : s.fontSize === 'large' ? '1.05rem' : '0.9rem',
        }}>
          <div className={styles.sampleBadge} style={{
            background: `linear-gradient(135deg, ${s.primaryColor}, ${s.accentColor})`
          }}>Happy Birthday!</div>
          <p style={{ color: s.textColor }}>A warm message just for you 🎂</p>
          <button className={styles.sampleBtn} style={{
            background: `linear-gradient(135deg, ${s.primaryColor}, ${s.accentColor})`
          }}>Voir mes vœux 💌</button>
        </div>
      </div>
    </div>
  );
}