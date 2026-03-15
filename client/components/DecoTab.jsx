import { useState, useRef } from 'react';
import { uploadFile } from '../utils/api';
import s from './DecoTab.module.css';

const ANIMATIONS = [
  { value: 'none',   label: 'Fixe',      icon: '⬛' },
  { value: 'float',  label: 'Flottant',  icon: '🌊' },
  { value: 'pulse',  label: 'Pulsation', icon: '💓' },
  { value: 'spin',   label: 'Rotation',  icon: '🔄' },
  { value: 'drift',  label: 'Dérive',    icon: '🍃' },
  { value: 'pop',    label: 'Pop',       icon: '🎯' },
  { value: 'bounce', label: 'Rebond',    icon: '⚡' },
  { value: 'swing',  label: 'Balancier', icon: '🎪' },
  { value: 'shake',  label: 'Vibration', icon: '📳' },
];

const TEMPLATE_SECTIONS = {
  birthday: [
    { key: 'global',      label: 'Partout' },
    { key: 'greeting',    label: 'Intro' },
    { key: 'music',       label: 'Musique' },
    { key: 'message',     label: 'Message' },
    { key: 'ideas',       label: 'Idées' },
    { key: 'celebration', label: 'Celebration' },
    { key: 'outro',       label: 'Outro' },
  ],
  special: [
    { key: 'global',      label: 'Partout' },
    { key: 'greeting',    label: 'Intro' },
    { key: 'music',       label: 'Musique' },
    { key: 'message',     label: 'Message' },
    { key: 'ideas',       label: 'Idées' },
    { key: 'celebration', label: 'Celebration' },
    { key: 'outro',       label: 'Outro' },
  ],
  'collective-family': [
    { key: 'global',    label: 'Partout' },
    { key: 'greeting',  label: 'Intro' },
    { key: 'music',     label: 'Musique' },
    { key: 'fromgroup', label: 'Du groupe' },
    { key: 'ideas',     label: 'Idées' },
    { key: 'wishes',    label: 'Vœux' },
    { key: 'outro',     label: 'Outro' },
  ],
  'collective-pro': [
    { key: 'global',    label: 'Partout' },
    { key: 'greeting',  label: 'Intro' },
    { key: 'music',     label: 'Musique' },
    { key: 'fromgroup', label: 'Du groupe' },
    { key: 'ideas',     label: 'Idées' },
    { key: 'wishes',    label: 'Vœux' },
    { key: 'outro',     label: 'Outro' },
  ],
};

function genId() {
  return 'deco_' + Math.random().toString(36).slice(2, 9);
}

const DEFAULT_DECO = {
  animation: 'float',
  section: 'global',
  position: { x: 50, y: 10 },
  size: 80,
  opacity: 0.85,
  zIndex: 10,
  delay: 0,
  rotate: 0,
};

export default function DecoTab({ templateName, decorations = [], onChange }) {
  const sections = TEMPLATE_SECTIONS[templateName] || TEMPLATE_SECTIONS.birthday;
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState(null); // id of selected deco
  const fileRef = useRef(null);

  const selectedDeco = decorations.find(d => d.id === selected);

  const updateDeco = (id, patch) => {
    onChange(decorations.map(d => d.id === id ? { ...d, ...patch } : d));
  };

  const updatePos = (id, axis, val) => {
    const deco = decorations.find(d => d.id === id);
    if (!deco) return;
    onChange(decorations.map(d =>
      d.id === id ? { ...d, position: { ...d.position, [axis]: val } } : d
    ));
  };

  const removeDeco = (id) => {
    onChange(decorations.filter(d => d.id !== id));
    if (selected === id) setSelected(null);
  };

  const handleUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const r = await uploadFile(file);
      const newDeco = { ...DEFAULT_DECO, id: genId(), src: r.data.url };
      const next = [...decorations, newDeco];
      onChange(next);
      setSelected(newDeco.id);
    } catch (e) {
      alert('Upload failed: ' + (e.response?.data?.error || e.message));
    } finally { setUploading(false); }
  };

  return (
    <div className={s.root}>

      {/* Add button */}
      <div className={s.addArea}>
        <button
          className={s.addBtn}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading
            ? <><span className={s.spinner} /> Envoi…</>
            : <><span>＋</span> Ajouter une décoration</>
          }
        </button>
        <input
          ref={fileRef} type="file" accept="image/*,image/gif"
          style={{ display: 'none' }}
          onChange={e => handleUpload(e.target.files[0])}
        />
        <p className={s.hint}>PNG, GIF, WebP — fonctionne mieux avec fond transparent</p>
      </div>

      {/* Decoration list */}
      {decorations.length === 0 ? (
        <div className={s.empty}>
          <span className={s.emptyIcon}>🎨</span>
          <p>Aucune décoration pour l'instant</p>
          <p className={s.emptyHint}>Uploadez une image pour commencer</p>
        </div>
      ) : (
        <div className={s.decoList}>
          {decorations.map(deco => (
            <button
              key={deco.id}
              className={`${s.decoCard} ${selected === deco.id ? s.decoCardActive : ''}`}
              onClick={() => setSelected(selected === deco.id ? null : deco.id)}
            >
              <div className={s.decoThumbWrap}>
                <img src={deco.src} alt="" className={s.decoThumb} />
              </div>
              <div className={s.decoMeta}>
                <span className={s.decoSection}>
                  {sections.find(s => s.key === deco.section)?.label || deco.section}
                </span>
                <span className={s.decoAnim}>
                  {ANIMATIONS.find(a => a.value === deco.animation)?.icon}{' '}
                  {ANIMATIONS.find(a => a.value === deco.animation)?.label}
                </span>
              </div>
              <button
                className={s.decoRemove}
                onClick={e => { e.stopPropagation(); removeDeco(deco.id); }}
                title="Supprimer"
              >✕</button>
            </button>
          ))}
        </div>
      )}

      {/* Editor panel for selected deco */}
      {selectedDeco && (
        <div className={s.editor}>
          <div className={s.editorHeader}>
            <img src={selectedDeco.src} alt="" className={s.editorThumb} />
            <span className={s.editorTitle}>Paramètres</span>
          </div>

          {/* Section */}
          <div className={s.field}>
            <label className={s.fieldLabel}>Section</label>
            <select
              className={s.select}
              value={selectedDeco.section}
              onChange={e => updateDeco(selectedDeco.id, { section: e.target.value })}
            >
              {sections.map(sec => (
                <option key={sec.key} value={sec.key}>{sec.label}</option>
              ))}
            </select>
          </div>

          {/* Animation */}
          <div className={s.field}>
            <label className={s.fieldLabel}>Animation</label>
            <div className={s.animGrid}>
              {ANIMATIONS.map(a => (
                <button
                  key={a.value}
                  className={`${s.animBtn} ${selectedDeco.animation === a.value ? s.animBtnActive : ''}`}
                  onClick={() => updateDeco(selectedDeco.id, { animation: a.value })}
                  title={a.label}
                >
                  <span className={s.animIcon}>{a.icon}</span>
                  <span className={s.animLabel}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Position */}
          <div className={s.field}>
            <label className={s.fieldLabel}>Position</label>
            {/* Visual position picker — 2D click target */}
            <div
              className={s.posPicker}
              onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
                const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
                updateDeco(selectedDeco.id, { position: { x, y } });
              }}
            >
              <div
                className={s.posHandle}
                style={{
                  left: `${selectedDeco.position?.x ?? 50}%`,
                  top:  `${selectedDeco.position?.y ?? 10}%`,
                }}
              />
              <span className={s.posHint}>Cliquez pour positionner</span>
            </div>
            <div className={s.posInputs}>
              <div className={s.posInputGroup}>
                <label className={s.posLabel}>X</label>
                <input type="number" min="0" max="100" className={s.posInput}
                  value={selectedDeco.position?.x ?? 50}
                  onChange={e => updatePos(selectedDeco.id, 'x', parseInt(e.target.value))}
                />
                <span className={s.posUnit}>%</span>
              </div>
              <div className={s.posInputGroup}>
                <label className={s.posLabel}>Y</label>
                <input type="number" min="0" max="100" className={s.posInput}
                  value={selectedDeco.position?.y ?? 10}
                  onChange={e => updatePos(selectedDeco.id, 'y', parseInt(e.target.value))}
                />
                <span className={s.posUnit}>%</span>
              </div>
            </div>
          </div>

          {/* Size */}
          <div className={s.field}>
            <div className={s.sliderHeader}>
              <label className={s.fieldLabel}>Taille</label>
              <span className={s.sliderVal}>{selectedDeco.size || 80}px</span>
            </div>
            <input type="range" min="20" max="300" step="5"
              className={s.slider}
              value={selectedDeco.size || 80}
              onChange={e => updateDeco(selectedDeco.id, { size: parseInt(e.target.value) })}
            />
          </div>

          {/* Opacity */}
          <div className={s.field}>
            <div className={s.sliderHeader}>
              <label className={s.fieldLabel}>Opacité</label>
              <span className={s.sliderVal}>{Math.round((selectedDeco.opacity ?? 0.85) * 100)}%</span>
            </div>
            <input type="range" min="0.05" max="1" step="0.05"
              className={s.slider}
              value={selectedDeco.opacity ?? 0.85}
              onChange={e => updateDeco(selectedDeco.id, { opacity: parseFloat(e.target.value) })}
            />
          </div>

          {/* Rotation */}
          <div className={s.field}>
            <div className={s.sliderHeader}>
              <label className={s.fieldLabel}>Rotation initiale</label>
              <span className={s.sliderVal}>{selectedDeco.rotate || 0}°</span>
            </div>
            <input type="range" min="-180" max="180" step="5"
              className={s.slider}
              value={selectedDeco.rotate || 0}
              onChange={e => updateDeco(selectedDeco.id, { rotate: parseInt(e.target.value) })}
            />
          </div>

          {/* Delay */}
          <div className={s.field}>
            <div className={s.sliderHeader}>
              <label className={s.fieldLabel}>Délai d'animation</label>
              <span className={s.sliderVal}>{selectedDeco.delay || 0}s</span>
            </div>
            <input type="range" min="0" max="30" step="0.25"
              className={s.slider}
              value={selectedDeco.delay || 0}
              onChange={e => updateDeco(selectedDeco.id, { delay: parseFloat(e.target.value) })}
            />
          </div>

          {/* Z-index */}
          <div className={s.field}>
            <div className={s.sliderHeader}>
              <label className={s.fieldLabel}>Profondeur (z-index)</label>
              <span className={s.sliderVal}>{selectedDeco.zIndex ?? 10}</span>
            </div>
            <input type="range" min="1" max="9999" step="1"
              className={s.slider}
              value={selectedDeco.zIndex ?? 10}
              onChange={e => updateDeco(selectedDeco.id, { zIndex: parseInt(e.target.value) })}
            />
          </div>

          <button
            className={s.btnDanger}
            onClick={() => removeDeco(selectedDeco.id)}
          >🗑 Supprimer cette décoration</button>
        </div>
      )}
    </div>
  );
}