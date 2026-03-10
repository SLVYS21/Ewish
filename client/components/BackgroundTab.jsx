import { useState, useRef } from 'react';
import { uploadFile } from '../utils/api';
import s from './BackgroundTab.module.css';

/* ── Section definitions per template ─────────────────────── */
const TEMPLATE_SECTIONS = {
  birthday: [
    { key: 'global',      label: 'Global (fallback)', icon: '🌐' },
    { key: 'greeting',    label: 'Intro / Bonjour',   icon: '👋' },
    { key: 'music',       label: 'Musique',            icon: '🎵' },
    { key: 'message',     label: 'Message',            icon: '💬' },
    { key: 'ideas',       label: 'Idées',              icon: '💡' },
    { key: 'celebration', label: 'Celebration',        icon: '🎂' },
    { key: 'outro',       label: 'Outro',              icon: '✨' },
  ],
  special: [
    { key: 'global',      label: 'Global (fallback)', icon: '🌐' },
    { key: 'greeting',    label: 'Intro',              icon: '👋' },
    { key: 'music',       label: 'Musique',            icon: '🎵' },
    { key: 'message',     label: 'Message',            icon: '💬' },
    { key: 'ideas',       label: 'Idées',              icon: '💡' },
    { key: 'celebration', label: 'Celebration',        icon: '💫' },
    { key: 'outro',       label: 'Outro',              icon: '✨' },
  ],
  'collective-family': [
    { key: 'global',    label: 'Global (fallback)', icon: '🌐' },
    { key: 'greeting',  label: 'Intro',              icon: '👋' },
    { key: 'music',     label: 'Musique',            icon: '🎵' },
    { key: 'fromgroup', label: 'Du groupe',          icon: '👨‍👩‍👧' },
    { key: 'ideas',     label: 'Idées',              icon: '💡' },
    { key: 'wishes',    label: 'Vœux',               icon: '💌' },
    { key: 'outro',     label: 'Outro',              icon: '✨' },
  ],
  'collective-pro': [
    { key: 'global',    label: 'Global (fallback)', icon: '🌐' },
    { key: 'greeting',  label: 'Intro',              icon: '👋' },
    { key: 'music',     label: 'Musique',            icon: '🎵' },
    { key: 'fromgroup', label: 'Du groupe',          icon: '🏢' },
    { key: 'ideas',     label: 'Idées',              icon: '💡' },
    { key: 'wishes',    label: 'Vœux',               icon: '💌' },
    { key: 'outro',     label: 'Outro',              icon: '✨' },
  ],
};

const DEFAULT_SECTION = { type: 'color', value: '', overlay: 0, blur: 0 };

const GRADIENT_PRESETS = [
  { label: 'Dusk',       value: 'linear-gradient(135deg, #1a1220 0%, #2d1b4e 100%)' },
  { label: 'Kraft',      value: 'linear-gradient(160deg, #f5ede0 0%, #e8d5b8 100%)' },
  { label: 'Midnight',   value: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)' },
  { label: 'Blush',      value: 'linear-gradient(135deg, #fff0f5 0%, #fce4ec 100%)' },
  { label: 'Champagne',  value: 'linear-gradient(135deg, #f9f3e3 0%, #ede0c8 100%)' },
  { label: 'Deep Ocean', value: 'linear-gradient(135deg, #0a1628 0%, #1a3a5c 100%)' },
  { label: 'Forest',     value: 'linear-gradient(135deg, #1a2a1a 0%, #2d4a2d 100%)' },
  { label: 'Warm Ivory', value: 'linear-gradient(160deg, #fdfaf5 0%, #f5ede0 100%)' },
];

export default function BackgroundTab({ templateName, backgrounds = {}, onChange }) {
  const sections = TEMPLATE_SECTIONS[templateName] || TEMPLATE_SECTIONS.birthday;
  const [activeSection, setActiveSection] = useState(sections[0].key);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const current = backgrounds[activeSection] || DEFAULT_SECTION;

  const update = (patch) => {
    const updated = { ...current, ...patch };
    onChange({ ...backgrounds, [activeSection]: updated });
  };

  const handleImageUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const r = await uploadFile(file);
      update({ type: 'image', value: r.data.url });
    } catch (e) {
      alert('Upload failed: ' + (e.response?.data?.error || e.message));
    } finally { setUploading(false); }
  };

  const clearBg = () => {
    const next = { ...backgrounds };
    delete next[activeSection];
    onChange(next);
  };

  const hasValue = current.value && current.value.trim() !== '';

  return (
    <div className={s.root}>

      {/* Section selector */}
      <div className={s.sectionList}>
        {sections.map(sec => {
          const hasBg = backgrounds[sec.key]?.value;
          return (
            <button
              key={sec.key}
              className={`${s.sectionBtn} ${activeSection === sec.key ? s.sectionActive : ''}`}
              onClick={() => setActiveSection(sec.key)}
            >
              <span className={s.sectionIcon}>{sec.icon}</span>
              <span className={s.sectionLabel}>{sec.label}</span>
              {hasBg && <span className={s.sectionDot} />}
            </button>
          );
        })}
      </div>

      {/* Type selector */}
      <div className={s.group}>
        <h3 className={s.groupTitle}>Type de fond</h3>
        <div className={s.typeRow}>
          {[
            { value: 'color',    label: '🎨 Couleur' },
            { value: 'gradient', label: '🌈 Dégradé' },
            { value: 'image',    label: '🖼 Image' },
          ].map(t => (
            <button
              key={t.value}
              className={`${s.typeBtn} ${current.type === t.value ? s.typeBtnActive : ''}`}
              onClick={() => update({ type: t.value, value: '' })}
            >{t.label}</button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      {current.type === 'color' && (
        <div className={s.group}>
          <h3 className={s.groupTitle}>Couleur</h3>
          <div className={s.colorRow}>
            <input
              type="color"
              value={current.value || '#ffffff'}
              className={s.colorPicker}
              onChange={e => update({ value: e.target.value })}
            />
            <input
              type="text"
              value={current.value || ''}
              placeholder="#ffffff"
              className={s.colorInput}
              onChange={e => update({ value: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Gradient */}
      {current.type === 'gradient' && (
        <div className={s.group}>
          <h3 className={s.groupTitle}>Dégradé</h3>
          <div className={s.gradientPresets}>
            {GRADIENT_PRESETS.map(p => (
              <button
                key={p.label}
                className={`${s.gradPreset} ${current.value === p.value ? s.gradPresetActive : ''}`}
                style={{ background: p.value }}
                title={p.label}
                onClick={() => update({ value: p.value })}
              >
                <span className={s.gradLabel}>{p.label}</span>
              </button>
            ))}
          </div>
          <div className={s.gradCustom}>
            <label className={s.fieldLabel}>CSS personnalisé</label>
            <input
              type="text"
              value={current.value || ''}
              placeholder="linear-gradient(135deg, #f00 0%, #00f 100%)"
              className={s.textInput}
              onChange={e => update({ value: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Image */}
      {current.type === 'image' && (
        <div className={s.group}>
          <h3 className={s.groupTitle}>Image de fond</h3>

          {current.value ? (
            <div className={s.imagePreview}>
              <img src={current.value} alt="" className={s.previewThumb} />
              <div className={s.imageActions}>
                <button
                  className={s.btnSecondary}
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? '↻ Upload…' : '🔄 Changer'}
                </button>
                <button className={s.btnDanger} onClick={() => update({ value: '' })}>
                  🗑 Supprimer
                </button>
              </div>
            </div>
          ) : (
            <div
              className={s.dropZone}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add(s.dragOver); }}
              onDragLeave={e => e.currentTarget.classList.remove(s.dragOver)}
              onDrop={e => {
                e.preventDefault();
                e.currentTarget.classList.remove(s.dragOver);
                handleImageUpload(e.dataTransfer.files[0]);
              }}
            >
              {uploading
                ? <><span className={s.uploadSpinner} /> Upload en cours…</>
                : <><span className={s.dropIcon}>🖼</span> Cliquez ou déposez une image</>
              }
            </div>
          )}

          <input
            ref={fileRef} type="file" accept="image/*"
            style={{ display: 'none' }}
            onChange={e => handleImageUpload(e.target.files[0])}
          />

          {/* Image controls */}
          {current.value && (
            <>
              <div className={s.sliderGroup}>
                <div className={s.sliderHeader}>
                  <label className={s.fieldLabel}>Assombrissement</label>
                  <span className={s.sliderVal}>{Math.round((current.overlay || 0) * 100)}%</span>
                </div>
                <input
                  type="range" min="0" max="0.9" step="0.05"
                  value={current.overlay || 0}
                  className={s.slider}
                  onChange={e => update({ overlay: parseFloat(e.target.value) })}
                />
              </div>
              <div className={s.sliderGroup}>
                <div className={s.sliderHeader}>
                  <label className={s.fieldLabel}>Flou</label>
                  <span className={s.sliderVal}>{current.blur || 0}px</span>
                </div>
                <input
                  type="range" min="0" max="20" step="1"
                  value={current.blur || 0}
                  className={s.slider}
                  onChange={e => update({ blur: parseInt(e.target.value) })}
                />
              </div>
            </>
          )}

          {/* URL direct */}
          <div style={{ marginTop: 10 }}>
            <label className={s.fieldLabel}>Ou coller une URL</label>
            <input
              type="text"
              value={current.value || ''}
              placeholder="https://..."
              className={s.textInput}
              onChange={e => update({ value: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Live preview swatch */}
      {hasValue && (
        <div className={s.group}>
          <div className={s.preview}>
            {current.type === 'image'
              ? <div className={s.previewBox} style={{
                  backgroundImage: `url("${current.value}")`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  filter: `brightness(${1 - (current.overlay || 0) * 0.6})`,
                }}>
                  <span className={s.previewLabel}>Aperçu</span>
                </div>
              : <div className={s.previewBox} style={{ background: current.value }}>
                  <span className={s.previewLabel}>Aperçu</span>
                </div>
            }
          </div>
          <button className={s.btnDanger} onClick={clearBg} style={{ marginTop: 8 }}>
            🗑 Effacer ce fond
          </button>
        </div>
      )}
    </div>
  );
}