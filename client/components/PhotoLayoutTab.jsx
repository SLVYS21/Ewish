import { useState, useRef, useCallback, useEffect } from 'react';
import s from './PhotoLayoutTab.module.css';

const PHOTO_META = {
  photo1: { label: 'Gauche',  emoji: '🖼', color: '#e8d5f5', defaultX: -80 },
  photo2: { label: 'Centre',  emoji: '⭐', color: '#ffd6e0', defaultX:   0 },
  photo3: { label: 'Droite',  emoji: '🖼', color: '#d5eaf5', defaultX:  80 },
};

const DEFAULTS = {
  photo1: { x: 0, y: 4,  rotation: -6, scale: 1,    zIndex: 1 },
  photo2: { x: 0, y: 0,  rotation:  0, scale: 1.1,  zIndex: 2 },
  photo3: { x: 0, y: 2,  rotation:  5, scale: 1,    zIndex: 1 },
};

const PRESETS = [
  { id: 'default',  label: 'Défaut',   icon: '▦', transforms: { photo1:{x:0,y:4,rotation:-6,scale:1,zIndex:1}, photo2:{x:0,y:0,rotation:0,scale:1.1,zIndex:2}, photo3:{x:0,y:2,rotation:5,scale:1,zIndex:1} } },
  { id: 'fan',      label: 'Éventail', icon: '🀱', transforms: { photo1:{x:-20,y:10,rotation:-18,scale:0.9,zIndex:1}, photo2:{x:0,y:0,rotation:0,scale:1.05,zIndex:3}, photo3:{x:20,y:10,rotation:18,scale:0.9,zIndex:2} } },
  { id: 'stack',    label: 'Pile',     icon: '⧉', transforms: { photo1:{x:-30,y:8,rotation:-12,scale:1,zIndex:1}, photo2:{x:0,y:0,rotation:3,scale:1,zIndex:3}, photo3:{x:28,y:6,rotation:10,scale:0.95,zIndex:2} } },
  { id: 'cascade',  label: 'Cascade',  icon: '↘', transforms: { photo1:{x:-10,y:-20,rotation:-4,scale:0.88,zIndex:1}, photo2:{x:5,y:0,rotation:0,scale:1,zIndex:2}, photo3:{x:10,y:20,rotation:4,scale:0.88,zIndex:1} } },
  { id: 'row',      label: 'Rangée',   icon: '▬', transforms: { photo1:{x:0,y:0,rotation:-3,scale:0.95,zIndex:1}, photo2:{x:0,y:-8,rotation:0,scale:1,zIndex:2}, photo3:{x:0,y:0,rotation:3,scale:0.95,zIndex:1} } },
];

// PREVIEW_SCALE: 1 template-px = how many preview-px
// Template photos are in a ~400px container, preview canvas is 180px → ratio ≈ 0.45
const PREVIEW_SCALE = 0.45;

export default function PhotoLayoutTab({ transforms = {}, onChange }) {
  const [activePhoto, setActivePhoto] = useState('photo1');
  const [dragging, setDragging]       = useState(null);
  const previewRef = useRef(null);

  const merged = {
    photo1: { ...DEFAULTS.photo1, ...(transforms.photo1 || {}) },
    photo2: { ...DEFAULTS.photo2, ...(transforms.photo2 || {}) },
    photo3: { ...DEFAULTS.photo3, ...(transforms.photo3 || {}) },
  };

  const update = (photo, field, value) => {
    onChange({ ...merged, [photo]: { ...merged[photo], [field]: Number(value) } });
  };

  const applyPreset = (preset) => onChange({ ...merged, ...preset.transforms });
  const resetPhoto  = (photo)  => onChange({ ...merged, [photo]: DEFAULTS[photo] });

  // ── Drag in preview ──
  const onPointerDown = useCallback((e, key) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setActivePhoto(key);
    setDragging({
      key,
      startX: e.clientX,
      startY: e.clientY,
      origX: merged[key].x,
      origY: merged[key].y,
    });
  }, [merged]);

  const onPointerMove = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    const dx = (e.clientX - dragging.startX) / PREVIEW_SCALE;
    const dy = (e.clientY - dragging.startY) / PREVIEW_SCALE;
    onChange({
      ...merged,
      [dragging.key]: {
        ...merged[dragging.key],
        x: Math.round(dragging.origX + dx),
        y: Math.round(dragging.origY + dy),
      }
    });
  }, [dragging, merged, onChange]);

  const onPointerUp = useCallback(() => setDragging(null), []);

  const t = merged[activePhoto];

  return (
    <div className={s.root}>

      {/* Presets */}
      <div className={s.section}>
        <div className={s.sectionTitle}>Présets</div>
        <div className={s.presetGrid}>
          {PRESETS.map(p => (
            <button key={p.id} className={s.presetBtn} onClick={() => applyPreset(p)}>
              <span className={s.presetIcon}>{p.icon}</span>
              <span className={s.presetLabel}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Drag preview */}
      <div className={s.section}>
        <div className={s.sectionTitle}>Glisser pour positionner</div>
        <div
          className={s.preview}
          ref={previewRef}
          style={{ cursor: dragging ? 'grabbing' : 'default' }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {Object.keys(PHOTO_META).map((key) => {
            const tr   = merged[key];
            const meta = PHOTO_META[key];
            const isActive = activePhoto === key;
            // Base position in preview: spread photos horizontally like in the template
            const baseX = meta.defaultX * PREVIEW_SCALE;
            const baseY = 0;
            return (
              <div
                key={key}
                className={`${s.previewItem} ${isActive ? s.previewItemActive : ''}`}
                style={{
                  background: meta.color,
                  transform: `translateX(${baseX + tr.x * PREVIEW_SCALE}px) translateY(${baseY + tr.y * PREVIEW_SCALE}px) rotate(${tr.rotation}deg) scale(${tr.scale})`,
                  zIndex: tr.zIndex,
                  cursor: dragging?.key === key ? 'grabbing' : 'grab',
                }}
                onPointerDown={(e) => onPointerDown(e, key)}
                onClick={() => setActivePhoto(key)}
              >
                <span className={s.previewEmoji}>{meta.emoji}</span>
                <span className={s.previewLabel}>{meta.label}</span>
              </div>
            );
          })}
        </div>
        <p className={s.hint}>✦ Fais glisser les photos • Clique pour sélectionner</p>
      </div>

      {/* Fine controls */}
      <div className={s.section}>
        <div className={s.photoHeader}>
          <div className={s.photoTabRow}>
            {Object.keys(PHOTO_META).map(key => (
              <button
                key={key}
                className={`${s.photoTab} ${activePhoto === key ? s.photoTabActive : ''}`}
                onClick={() => setActivePhoto(key)}
              >
                {PHOTO_META[key].emoji} {PHOTO_META[key].label}
              </button>
            ))}
          </div>
          <button className={s.resetBtn} onClick={() => resetPhoto(activePhoto)} title="Réinitialiser">↺</button>
        </div>

        <SliderRow label="Position X" value={t.x}        min={-200} max={200} step={1}    unit="px" onChange={v => update(activePhoto,'x',v)} />
        <SliderRow label="Position Y" value={t.y}        min={-200} max={200} step={1}    unit="px" onChange={v => update(activePhoto,'y',v)} />
        <SliderRow label="Rotation"   value={t.rotation} min={-180} max={180} step={1}    unit="°"  onChange={v => update(activePhoto,'rotation',v)} />
        <SliderRow label="Taille"     value={t.scale}    min={0.2}  max={3.0} step={0.05} unit="×"  onChange={v => update(activePhoto,'scale',v)} />
        <SliderRow label="Z-order"    value={t.zIndex}   min={1}    max={5}   step={1}    unit=""   onChange={v => update(activePhoto,'zIndex',v)} />
      </div>

    </div>
  );
}

function SliderRow({ label, value, min, max, step, onChange, unit }) {
  const display = typeof value === 'number'
    ? (step >= 1 ? Math.round(value) : value.toFixed(2))
    : value;
  return (
    <div className={s.sliderRow}>
      <div className={s.sliderHeader}>
        <span className={s.sliderLabel}>{label}</span>
        <span className={s.sliderValue}>{display}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(e.target.value)} className={s.slider} />
    </div>
  );
}