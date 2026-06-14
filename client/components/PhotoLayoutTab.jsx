import { useState, useRef, useCallback } from 'react';
import { LayoutGrid, ScanLine, AlignVerticalJustifyCenter, AlignVerticalJustifyStart,
         AlignHorizontalJustifyStart, MousePointer2, RefreshCw } from 'lucide-react';
import s from './PhotoLayoutTab.module.css';

const FRAMES = [
  { id: 'none',     label: 'Aucun' },
  { id: 'polaroid', label: 'Polaroid' },
  { id: 'film',     label: 'Pellicule' },
  { id: 'vintage',  label: 'Vintage' },
  { id: 'instant',  label: 'Instant' },
];

const PHOTO_META = {
  photo1: { label: 'P1', color: '#e8d5f5', defaultX: -120 },
  photo2: { label: 'P2', color: '#ffd6e0', defaultX:    0 },
  photo3: { label: 'P3', color: '#d5eaf5', defaultX:  120 },
  photo4: { label: 'P4', color: '#d5f5e8', defaultX:  -60 },
  photo5: { label: 'P5', color: '#f5f5d5', defaultX:   60 },
  photo6: { label: 'P6', color: '#f5d5e8', defaultX:    0 },
};

const DEFAULTS = {
  photo1: { x: 0,   y: 4,  rotation: -6,  scale: 1,    zIndex: 1, frame: 'none', caption: '' },
  photo2: { x: 0,   y: 0,  rotation:  0,  scale: 1.1,  zIndex: 2, frame: 'none', caption: '' },
  photo3: { x: 0,   y: 2,  rotation:  5,  scale: 1,    zIndex: 1, frame: 'none', caption: '' },
  photo4: { x: -80, y: 10, rotation: -10, scale: 0.9,  zIndex: 1, frame: 'none', caption: '' },
  photo5: { x:  80, y: 10, rotation:  10, scale: 0.9,  zIndex: 1, frame: 'none', caption: '' },
  photo6: { x: 0,   y: 20, rotation:  3,  scale: 0.85, zIndex: 1, frame: 'none', caption: '' },
};

const PRESETS = [
  { id: 'default',  label: 'Défaut',   icon: <LayoutGrid size={15} />,                     transforms: { photo1:{x:0,y:4,rotation:-6,scale:1,zIndex:1},    photo2:{x:0,y:0,rotation:0,scale:1.1,zIndex:2},   photo3:{x:0,y:2,rotation:5,scale:1,zIndex:1}    }},
  { id: 'fan',      label: 'Éventail', icon: <ScanLine size={15} />,                        transforms: { photo1:{x:-20,y:10,rotation:-18,scale:0.9,zIndex:1}, photo2:{x:0,y:0,rotation:0,scale:1.05,zIndex:3},  photo3:{x:20,y:10,rotation:18,scale:0.9,zIndex:2} }},
  { id: 'stack',    label: 'Pile',     icon: <AlignVerticalJustifyCenter size={15} />,      transforms: { photo1:{x:-30,y:8,rotation:-12,scale:1,zIndex:1},   photo2:{x:0,y:0,rotation:3,scale:1,zIndex:3},     photo3:{x:28,y:6,rotation:10,scale:0.95,zIndex:2} }},
  { id: 'cascade',  label: 'Cascade',  icon: <AlignVerticalJustifyStart size={15} />,       transforms: { photo1:{x:-10,y:-20,rotation:-4,scale:0.88,zIndex:1}, photo2:{x:5,y:0,rotation:0,scale:1,zIndex:2},  photo3:{x:10,y:20,rotation:4,scale:0.88,zIndex:1} }},
  { id: 'row',      label: 'Rangée',   icon: <AlignHorizontalJustifyStart size={15} />,     transforms: { photo1:{x:0,y:0,rotation:-3,scale:0.95,zIndex:1},   photo2:{x:0,y:-8,rotation:0,scale:1,zIndex:2},    photo3:{x:0,y:0,rotation:3,scale:0.95,zIndex:1}  }},
];

const PREVIEW_SCALE = 0.45;

export default function PhotoLayoutTab({ transforms = {}, onChange }) {
  const photoCount = transforms._photoCount || 3;
  const [activePhoto, setActivePhoto]   = useState('photo1');
  const [dragging, setDragging]         = useState(null);
  const previewRef = useRef(null);

  const allKeys    = Object.keys(PHOTO_META);
  const activeKeys = allKeys.slice(0, photoCount);

  const merged = {
    _photoCount: photoCount,
    ...Object.fromEntries(
      allKeys.map(key => [key, { ...DEFAULTS[key], ...(transforms[key] || {}) }])
    ),
  };

  const safeActive = activeKeys.includes(activePhoto) ? activePhoto : activeKeys[0];
  const t = merged[safeActive];

  const update = (photo, field, value) => {
    const cast = field === 'frame' || field === 'caption' ? value : Number(value);
    onChange({ ...merged, [photo]: { ...merged[photo], [field]: cast } });
  };

  const applyPreset = (preset) => {
    const next = { ...merged };
    Object.entries(preset.transforms).forEach(([k, v]) => {
      if (merged[k]) next[k] = { ...merged[k], ...v };
    });
    onChange(next);
  };

  const resetPhoto = (photo) => onChange({ ...merged, [photo]: DEFAULTS[photo] });

  const setPhotoCount = (n) => {
    onChange({ ...merged, _photoCount: n });
    if (!allKeys.slice(0, n).includes(safeActive)) setActivePhoto(allKeys[n - 1]);
  };

  /* ── Drag ── */
  const onPointerDown = useCallback((e, key) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setActivePhoto(key);
    setDragging({ key, startX: e.clientX, startY: e.clientY, origX: merged[key].x, origY: merged[key].y });
  }, [merged]);

  const onPointerMove = useCallback((e) => {
    if (!dragging) return;
    e.preventDefault();
    const dx = (e.clientX - dragging.startX) / PREVIEW_SCALE;
    const dy = (e.clientY - dragging.startY) / PREVIEW_SCALE;
    onChange({
      ...merged,
      [dragging.key]: { ...merged[dragging.key], x: Math.round(dragging.origX + dx), y: Math.round(dragging.origY + dy) },
    });
  }, [dragging, merged, onChange]);

  const onPointerUp = useCallback(() => setDragging(null), []);

  const capLen = (t.caption || '').length;

  return (
    <div className={s.root}>

      {/* ── Photo count segmented control (désactivé  limité à 3 photos) ── */}
      {/* <div className={s.countBar}>
        <span className={s.countBarLabel}>Nombre de photos</span>
        <div className={s.countSegment}>
          {[3, 4, 5, 6].map(n => (
            <button
              key={n}
              className={`${s.countSeg} ${photoCount === n ? s.countSegActive : ''}`}
              onClick={() => setPhotoCount(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div> */}

      {/* ── Drag preview ── */}
      <div className={s.previewSection}>
        <div
          className={s.preview}
          ref={previewRef}
          style={{ cursor: dragging ? 'grabbing' : 'default' }}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
        >
          {activeKeys.map(key => {
            const tr   = merged[key];
            const meta = PHOTO_META[key];
            const isActive = safeActive === key;
            const baseX = meta.defaultX * PREVIEW_SCALE;
            return (
              <div
                key={key}
                className={`${s.previewItem} ${isActive ? s.previewItemActive : ''}`}
                style={{
                  background: meta.color,
                  transform: `translateX(${baseX + tr.x * PREVIEW_SCALE}px) translateY(${tr.y * PREVIEW_SCALE}px) rotate(${tr.rotation}deg) scale(${tr.scale})`,
                  zIndex: tr.zIndex,
                  cursor: dragging?.key === key ? 'grabbing' : 'grab',
                }}
                onPointerDown={e => onPointerDown(e, key)}
                onClick={() => setActivePhoto(key)}
              >
                <span className={s.previewLabel}>{meta.label}</span>
              </div>
            );
          })}
        </div>
        <p className={s.hint}>
          <MousePointer2 size={11} /> Glisse · Tape pour sélectionner
        </p>
      </div>

      {/* ── Presets ── */}
      <div className={s.section}>
        <div className={s.sectionLabel}>Mise en page</div>
        <div className={s.presetStrip}>
          {PRESETS.map(p => (
            <button key={p.id} className={s.presetChip} onClick={() => applyPreset(p)}>
              <span className={s.presetChipIcon}>{p.icon}</span>
              <span className={s.presetChipLabel}>{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Photo selector + sliders ── */}
      <div className={s.section}>
        <div className={s.photoHeader}>
          <div className={s.photoTabRow}>
            {activeKeys.map(key => (
              <button
                key={key}
                className={`${s.photoTab} ${safeActive === key ? s.photoTabActive : ''}`}
                style={safeActive === key ? { background: PHOTO_META[key].color + 'b0', borderColor: PHOTO_META[key].color } : {}}
                onClick={() => setActivePhoto(key)}
              >
                {PHOTO_META[key].label}
              </button>
            ))}
          </div>
          <button className={s.resetBtn} onClick={() => resetPhoto(safeActive)} title="Réinitialiser">
            <RefreshCw size={13} />
          </button>
        </div>

        <div className={s.sliders}>
          <SliderRow label="X"        value={t.x}        min={-200} max={200} step={1}    unit="px" onChange={v => update(safeActive, 'x', v)} />
          <SliderRow label="Y"        value={t.y}        min={-200} max={200} step={1}    unit="px" onChange={v => update(safeActive, 'y', v)} />
          <SliderRow label="Rotation" value={t.rotation} min={-180} max={180} step={1}    unit="°"  onChange={v => update(safeActive, 'rotation', v)} />
          <SliderRow label="Taille"   value={t.scale}    min={0.2}  max={3.0} step={0.05} unit="×"  onChange={v => update(safeActive, 'scale', v)} />
          <SliderRow label="Ordre"    value={t.zIndex}   min={1}    max={6}   step={1}    unit=""   onChange={v => update(safeActive, 'zIndex', v)} />
        </div>
      </div>

      {/* ── Frame picker ── */}
      <div className={s.section}>
        <div className={s.sectionLabel}>
          Cadre <span className={s.sectionSub}> {PHOTO_META[safeActive].label}</span>
        </div>
        <div className={s.frameStrip}>
          {FRAMES.map(fr => (
            <button
              key={fr.id}
              className={`${s.frameChip} ${(t.frame || 'none') === fr.id ? s.frameChipActive : ''}`}
              onClick={() => update(safeActive, 'frame', fr.id)}
            >
              <FrameSwatch type={fr.id} />
              <span className={s.frameChipLabel}>{fr.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Caption ── */}
      <div className={s.section}>
        <div className={s.sectionLabel}>
          Légende <span className={s.sectionSub}> {PHOTO_META[safeActive].label}</span>
        </div>
        <div className={s.captionWrap}>
          <input
            type="text"
            className={s.captionInput}
            placeholder="Texte sur le cadre…"
            value={t.caption || ''}
            onChange={e => update(safeActive, 'caption', e.target.value)}
            maxLength={40}
          />
          <span className={`${s.captionCount} ${capLen > 30 ? s.captionCountWarn : ''}`}>
            {capLen}/40
          </span>
        </div>
      </div>

    </div>
  );
}

/* ── Frame swatch preview ── */
function FrameSwatch({ type }) {
  if (type === 'none') return (
    <div className={s.swatch}>
      <div className={s.swatchPhoto} style={{ borderRadius: 4 }} />
    </div>
  );
  if (type === 'polaroid') return (
    <div className={s.swatch}>
      <div className={s.swatchPolaroid}>
        <div className={s.swatchPhoto} style={{ flex: 1 }} />
        <div className={s.swatchPolCapLine} />
      </div>
    </div>
  );
  if (type === 'film') return (
    <div className={s.swatch}>
      <div className={s.swatchFilm}>
        <div className={s.swatchFilmHoles}><span/><span/><span/><span/></div>
        <div className={s.swatchPhoto} style={{ flex: 1 }} />
        <div className={s.swatchFilmHoles}><span/><span/><span/><span/></div>
      </div>
    </div>
  );
  if (type === 'vintage') return (
    <div className={s.swatch}>
      <div className={s.swatchVintage}>
        <div className={s.swatchPhoto} style={{ width: '100%', height: '100%' }} />
      </div>
    </div>
  );
  if (type === 'instant') return (
    <div className={s.swatch}>
      <div className={s.swatchInstant}>
        <div className={s.swatchPhoto} style={{ flex: 1 }} />
        <div className={s.swatchPolCapLine} style={{ background: '#ddd' }} />
      </div>
    </div>
  );
  return null;
}

/* ── Slider row ── */
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
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(e.target.value)}
        className={s.slider}
      />
    </div>
  );
}
