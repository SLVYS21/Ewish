import { useState, useRef, useEffect } from 'react';
import { uploadFile, getAssets } from '../utils/api';
import { Globe, Hand, Music, MessageSquare, Lightbulb, Gift, Sparkles, Users, Building, Mail, Palette, Wand2, Image as ImageIcon, RefreshCw, Trash2, UploadCloud, Library } from 'lucide-react';
import s from './BackgroundTab.module.css';

/* ── Section definitions per template ─────────────────────── */
const TEMPLATE_SECTIONS = {
  birthday: [
    { key: 'global',      label: 'Global (fallback)', icon: <Globe size={16} /> },
    { key: 'greeting',    label: 'Intro / Bonjour',   icon: <Hand size={16} /> },
    { key: 'music',       label: 'Musique',            icon: <Music size={16} /> },
    { key: 'message',     label: 'Message',            icon: <MessageSquare size={16} /> },
    { key: 'ideas',       label: 'Idées',              icon: <Lightbulb size={16} /> },
    { key: 'celebration', label: 'Celebration',        icon: <Gift size={16} /> },
    { key: 'outro',       label: 'Outro',              icon: <Sparkles size={16} /> },
  ],
  special: [
    { key: 'global',      label: 'Global (fallback)', icon: <Globe size={16} /> },
    { key: 'greeting',    label: 'Intro',              icon: <Hand size={16} /> },
    { key: 'music',       label: 'Musique',            icon: <Music size={16} /> },
    { key: 'message',     label: 'Message',            icon: <MessageSquare size={16} /> },
    { key: 'ideas',       label: 'Idées',              icon: <Lightbulb size={16} /> },
    { key: 'celebration', label: 'Celebration',        icon: <Sparkles size={16} /> },
    { key: 'outro',       label: 'Outro',              icon: <Sparkles size={16} /> },
  ],
  'collective-family': [
    { key: 'global',    label: 'Global (fallback)', icon: <Globe size={16} /> },
    { key: 'greeting',  label: 'Intro',              icon: <Hand size={16} /> },
    { key: 'music',     label: 'Musique',            icon: <Music size={16} /> },
    { key: 'fromgroup', label: 'Du groupe',          icon: <Users size={16} /> },
    { key: 'ideas',     label: 'Idées',              icon: <Lightbulb size={16} /> },
    { key: 'wishes',    label: 'Vœux',               icon: <Mail size={16} /> },
    { key: 'outro',     label: 'Outro',              icon: <Sparkles size={16} /> },
  ],
  'collective-pro': [
    { key: 'global',    label: 'Global (fallback)', icon: <Globe size={16} /> },
    { key: 'greeting',  label: 'Intro',              icon: <Hand size={16} /> },
    { key: 'music',     label: 'Musique',            icon: <Music size={16} /> },
    { key: 'fromgroup', label: 'Du groupe',          icon: <Building size={16} /> },
    { key: 'ideas',     label: 'Idées',              icon: <Lightbulb size={16} /> },
    { key: 'wishes',    label: 'Vœux',               icon: <Mail size={16} /> },
    { key: 'outro',     label: 'Outro',              icon: <Sparkles size={16} /> },
  ],
  'wall-of-wishes': [
    { key: 'global', label: 'Fond du mur', icon: <Globe size={16} /> },
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
  const [bankAssets, setBankAssets] = useState([]);
  const fileRef = useRef(null);

  useEffect(() => {
    getAssets('background')
      .then(r => setBankAssets(r.data))
      .catch(() => {});
  }, []);

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
            { value: 'color',    label: <><Palette size={14} /> Couleur</> },
            { value: 'gradient', label: <><Wand2 size={14} /> Dégradé</> },
            { value: 'image',    label: <><ImageIcon size={14} /> Image</> },
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
                  style={{display: 'flex', gap: '6px', alignItems: 'center'}}
                >
                  {uploading ? <><RefreshCw size={14} className="spinIcon" /> Upload…</> : <><RefreshCw size={14} /> Changer</>}
                </button>
                <button className={s.btnDanger} onClick={() => update({ value: '' })} style={{display: 'flex', gap: '6px', alignItems: 'center'}}>
                  <Trash2 size={14} /> Supprimer
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
                : <><span className={s.dropIcon}><ImageIcon size={24} /></span> Cliquez ou déposez une image</>
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

          {/* Shared Bank */}
          {bankAssets.length > 0 && (
            <div style={{ marginTop: 20 }}>
              <div className={s.sliderHeader}>
                <label className={s.fieldLabel} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Library size={14} /> Banque d'images
                </label>
              </div>
              <div className={s.bankGrid}>
                {bankAssets.map(asset => (
                  <div 
                    key={asset._id} 
                    className={`${s.bankItem} ${current.value === asset.url ? s.bankItemActive : ''}`}
                    onClick={() => update({ type: 'image', value: asset.url })}
                    title={asset.name}
                  >
                    <img src={asset.url} alt={asset.name} className={s.bankImg} loading="lazy" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* URL direct */}
          <div style={{ marginTop: 20 }}>
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
          <button className={s.btnDanger} onClick={clearBg} style={{ marginTop: 8, display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
            <Trash2 size={14} /> Effacer ce fond
          </button>
        </div>
      )}
    </div>
  );
}