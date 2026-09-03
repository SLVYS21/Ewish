import { useState, useRef, useMemo } from 'react';
import { Music, Camera, ChevronRight, X, Timer, ImagePlus } from 'lucide-react';
import MusicPickerModal from './MusicPickerModal';
import NarrativeVariantPicker from './NarrativeVariantPicker';
import { findTrack } from '../data/musicLibrary';
import { NARRATIVE_VARIANTS } from '../data/narrativeVariants';
import styles from './ContentTab.module.css';

/* ─── Default field schema ─────────────────────────────────────── */
const DEFAULT_FIELDS = [
  { key: 'greeting',       label: "Message d'accueil",      type: 'text',      section: 'Intro',       placeholder: 'Hiya' },
  { key: 'name',           label: 'Prénom du destinataire', type: 'text',      section: 'Intro',       placeholder: 'Lydia', required: true },
  { key: 'greetingText',   label: 'Note personnelle',       type: 'text',      section: 'Intro',       placeholder: 'Tu comptes énormément pour nous !' },
  { key: 'musicSrc',       label: 'Fichier musical',        type: 'url',       section: 'Music',       placeholder: 'https://... .mp3' },
  { key: 'musicStartTime', label: 'Démarrer à',             type: 'starttime', section: 'Music' },
  { key: 'albumArt',       label: 'Pochette',               type: 'url',       section: 'Music',       placeholder: 'https://... .jpg' },
  { key: 'trackTitle',     label: 'Titre',                  type: 'text',      section: 'Music',       placeholder: 'Notre chanson' },
  { key: 'trackArtist',    label: 'Artiste',                type: 'text',      section: 'Music',       placeholder: 'Artiste' },
  { key: 'text1',          label: 'Annonce principale',     type: 'text',      section: 'Story',       required: true },
  { key: 'textInChatBox',  label: 'Message principal',      type: 'textarea',  section: 'Message',     required: true },
  { key: 'waName',         label: 'Nom du contact',         type: 'text',      section: 'Message' },
  { key: 'imagePath',      label: 'Photo principale',       type: 'url',       section: 'Celebration' },
  { key: 'photo1',         label: 'Photo gauche',           type: 'url',       section: 'Celebration' },
  { key: 'photo2',         label: 'Photo droite',           type: 'url',       section: 'Celebration' },
  { key: 'wishHeading',    label: 'Titre du vœu',           type: 'text',      section: 'Celebration', required: true },
  { key: 'wishText',       label: 'Sous-titre du vœu',      type: 'text',      section: 'Celebration' },
  { key: 'wish1',          label: 'Vœu 1',                  type: 'textarea',  section: 'Wishes' },
  { key: 'wish2',          label: 'Vœu 2',                  type: 'textarea',  section: 'Wishes' },
  { key: 'wish3',          label: 'Vœu 3',                  type: 'textarea',  section: 'Wishes' },
  { key: 'outroText',      label: 'Message de fin',         type: 'text',      section: 'Outro' },
  { key: 'replayText',     label: 'Texte bouton revoir',    type: 'text',      section: 'Outro' },
];

const MUSIC_KEYS = new Set(['musicSrc', 'albumArt', 'trackTitle', 'trackArtist', 'musicHint', 'musicStartTime']);
const isMusicField = f => MUSIC_KEYS.has(f.key) || f.section === 'Music' || f.section === 'Musique';
const isPhotoKey = k =>
  /^(imagePath|photo\d*|albumArt|coverImg|thumbnail)$/i.test(k) ||
  k.toLowerCase().includes('photo') ||
  k.toLowerCase().includes('image') ||
  k.toLowerCase().includes('art');

/* Default photo fields injected when the template defines none */
const DEFAULT_PHOTO_FIELDS = [
  { key: 'imagePath', label: 'Photo principale', type: 'url', section: 'Photos' },
  { key: 'photo1',    label: 'Photo gauche',      type: 'url', section: 'Photos' },
  { key: 'photo2',    label: 'Photo droite',      type: 'url', section: 'Photos' },
];

/* ── Whitelist des champs "principaux" pour les 3 cartes actives.
   Tout le reste passe en "Champs avancés" (avec valeurs par défaut).
   `wishKey` : clé du champ principal du vœu (customisée par template). */
const REDUCED_PRIMARY = {
  'birthday':   { keys: ['name', 'wish1'],     wishKey: 'wish1',     wishLabel: 'Votre vœu (message principal)',   wishPlaceholder: 'Écris ici ton message principal pour la personne…' },
  'notre-film': { keys: ['name', 'wishText'],  wishKey: 'wishText',  wishLabel: 'Votre message (générique de fin)', wishPlaceholder: 'Ex : Avec tout notre amour 🎬' },
  'forever':    { keys: ['name', 'photoCaption'], wishKey: 'photoCaption', wishLabel: 'Votre message principal', wishPlaceholder: 'Ex : Toujours dans nos cœurs, toujours aussi belle.' },
};

/* ── Start Time Field ── */
function StartTimeField({ value, onChange }) {
  const s = parseInt(value) || 0;
  const m = Math.floor(s / 60), sec = s % 60;
  const fmt = n => `${Math.floor(n/60)}:${(n%60).toString().padStart(2,'0')}`;
  return (
    <div className={styles.startTimeField}>
      <div className={styles.startTimeDisplay}>
        <Timer size={13} className={styles.startTimeIcon} />
        <span className={styles.startTimeValue}>{fmt(s)}</span>
        <span className={styles.startTimeHint}>depuis le début</span>
      </div>
      <input type="range" min={0} max={600} value={s}
        onChange={e => onChange(parseInt(e.target.value))} className={styles.startTimeSlider} />
      <div className={styles.startTimeMMS}>
        <div className={styles.startTimeMM}>
          <label>min</label>
          <input type="number" min={0} max={10} value={m}
            onChange={e => onChange((parseInt(e.target.value)||0)*60+sec)} className={styles.startTimeNum} />
        </div>
        <span className={styles.startTimeSep}>:</span>
        <div className={styles.startTimeMM}>
          <label>sec</label>
          <input type="number" min={0} max={59} value={sec}
            onChange={e => onChange(m*60+Math.min(59,parseInt(e.target.value)||0))} className={styles.startTimeNum} />
        </div>
        {s > 0 && <button className={styles.startTimeReset} onClick={() => onChange(0)}>✕</button>}
      </div>
    </div>
  );
}

/* ── Date Field ── */
function DateField({ value, onChange, placeholder }) {
  const days = value ? Math.floor((Date.now() - new Date(value)) / 86400000) : null;
  return (
    <div className={styles.dateField}>
      <input type="date" value={value||''} max={new Date().toISOString().split('T')[0]}
        onChange={e => onChange(e.target.value)} className={styles.dateInput} placeholder={placeholder} />
      {days !== null && days >= 0 && (
        <div className={styles.dateDays}>
          <span className={styles.dateDaysNum}>{days.toLocaleString('fr-FR')}</span>
          <span className={styles.dateDaysLabel}>jours aujourd'hui</span>
        </div>
      )}
    </div>
  );
}

/* ── Photo Card (row layout, used dans avancés) ── */
function PhotoCard({ label, value, onChange, onUpload }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file) => {
    if (!file?.type.startsWith('image/')) return;
    setUploading(true);
    try { await onUpload(file); } finally { setUploading(false); }
  };

  return (
    <div className={styles.photoField}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }}
        onChange={e => handleFile(e.target.files?.[0])} />
      {value ? (
        <div className={styles.photoPrimaryCard}>
          <img src={value} alt="" className={styles.photoThumb} onError={e=>e.target.style.opacity='.3'} />
          <div className={styles.photoInfo}>
            <div className={styles.photoTitle}>{label}</div>
            <div className={styles.photoSub}>Photo ajoutée</div>
          </div>
          <div className={styles.photoActions}>
            <button className={styles.photoChangeBtn} onClick={() => fileRef.current?.click()}>
              <Camera size={13}/> Changer
            </button>
            <button className={styles.photoRemoveBtn} onClick={() => onChange('')}><X size={13}/></button>
          </div>
        </div>
      ) : (
        <div
          className={`${styles.photoPrimaryCard} ${dragOver ? styles.photoPrimaryCardDrag : ''}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
        >
          <span className={styles.photoIconCircle}><Camera size={16}/></span>
          <div className={styles.photoInfo}>
            <div className={styles.photoTitle}>{label}</div>
            <div className={styles.photoSub}>{uploading ? 'Upload en cours…' : 'Aucune photo'}</div>
          </div>
          <button className={styles.photoSelectBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? '…' : 'Choisir'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Photo Tile (grid layout, principale) ── */
function PhotoTile({ label, value, onUpload, onRemove }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file) => {
    if (!file?.type.startsWith('image/')) return;
    setUploading(true);
    try { await onUpload(file); } finally { setUploading(false); }
  };

  return (
    <div className={styles.photoTile}>
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={e => handleFile(e.target.files?.[0])} />
      <button
        type="button"
        className={`${styles.photoTileBtn} ${value ? styles.photoTileBtnFilled : ''}`}
        onClick={() => fileRef.current?.click()}
      >
        {value ? (
          <>
            <img src={value} alt={label} className={styles.photoTileImg} onError={e=>e.target.style.opacity='.3'} />
            <span className={styles.photoTileOverlay}>
              <Camera size={16} />
              <span>Changer</span>
            </span>
            {onRemove && (
              <span
                role="button"
                tabIndex={0}
                className={styles.photoTileRemove}
                onClick={e => { e.preventDefault(); e.stopPropagation(); onRemove(); }}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); onRemove(); } }}
                aria-label="Supprimer la photo"
              >
                <X size={12} />
              </span>
            )}
          </>
        ) : (
          <>
            <span className={styles.photoTileIcon}>
              {uploading ? <span className={styles.spin}>…</span> : <ImagePlus size={22} />}
            </span>
            <span className={styles.photoTileLabel}>{label}</span>
            <span className={styles.photoTileHint}>{uploading ? 'Upload…' : 'Cliquer pour ajouter'}</span>
          </>
        )}
      </button>
    </div>
  );
}

/* ── Music Trigger (bouton qui ouvre la modale) ── */
function MusicTrigger({ data, onOpen }) {
  const currentSrc  = data.musicSrc || '';
  const trackTitle  = data.trackTitle  || '';
  const trackArtist = data.trackArtist || '';
  const albumArt    = data.albumArt    || '';
  const hasTrack    = !!(currentSrc || trackTitle);

  const libraryMatch = useMemo(() => findTrack(currentSrc), [currentSrc]);
  const displayTitle  = trackTitle  || libraryMatch?.title  || (hasTrack ? 'Musique personnalisée' : 'Aucune musique');
  const displayArtist = trackArtist || libraryMatch?.artist || (hasTrack ? 'Fichier importé' : 'Ajouter une piste pour renforcer l\'ambiance');
  const displayCover  = albumArt   || libraryMatch?.cover   || '';

  return (
    <div className={styles.musicTrigger}>
      {displayCover ? (
        <img src={displayCover} alt="" className={styles.musicTriggerCover} onError={e=>e.target.style.display='none'}/>
      ) : (
        <span className={styles.musicTriggerIcon}><Music size={16}/></span>
      )}
      <div className={styles.musicTriggerInfo}>
        <div className={styles.musicTriggerTitle}>{displayTitle}</div>
        <div className={styles.musicTriggerSub}>{displayArtist}</div>
      </div>
      <button type="button" className={styles.musicTriggerBtn} onClick={onOpen}>
        {hasTrack ? 'Changer' : 'Choisir'}
      </button>
    </div>
  );
}

/* ── Generic flat field ── */
function FlatField({ field, value, onChange, onUpload }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

  if (field.type === 'url' && isPhotoKey(field.key)) {
    return <PhotoCard label={field.label.toUpperCase()} value={value} onChange={onChange}
      onUpload={f => onUpload(f, field.key)} />;
  }

  return (
    <div className={styles.flatFieldRow}>
      <div className={styles.flatLabel}>
        {field.label.toUpperCase()}
        {field.required && <span className={styles.required}> *</span>}
      </div>
      {field.type === 'textarea' ? (
        <textarea className={styles.textarea} placeholder={field.placeholder}
          value={value} onChange={e=>onChange(e.target.value)} rows={4}/>
      ) : field.type === 'url' ? (
        <div className={styles.urlRowInputs}>
          <input type="url" value={value} onChange={e=>onChange(e.target.value)}
            placeholder={field.placeholder||'https://...'} className={styles.input}/>
          {field.key === 'videoSrc' && (<>
            <input ref={fileRef} type="file" accept="video/*" style={{display:'none'}}
              onChange={async e => { const f=e.target.files?.[0]; if(!f)return; setUploading(true); try{await onUpload(f,field.key);}finally{setUploading(false);} }}/>
            <button className={styles.uploadBtn} onClick={()=>fileRef.current?.click()} disabled={uploading}>
              {uploading?'…':'▶ Charger'}
            </button>
          </>)}
        </div>
      ) : field.type === 'starttime' ? (
        <StartTimeField value={value} onChange={onChange}/>
      ) : field.type === 'date' ? (
        <DateField value={value} onChange={onChange} placeholder={field.placeholder}/>
      ) : field.type === 'layout' ? (
        <div className={styles.layoutGrid}>
          {(field.options||[]).map(opt => (
            <button key={opt.value} onClick={()=>onChange(opt.value)}
              className={`${styles.layoutBtn} ${value===opt.value?styles.layoutBtnActive:''}`}>
              <span className={styles.layoutIcon}>{opt.icon}</span>
              <span className={styles.layoutLabel}>{opt.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <input type="text" value={value} onChange={e=>onChange(e.target.value)}
          placeholder={field.placeholder} className={styles.input}/>
      )}
    </div>
  );
}

/* ── Main export ── */
export default function ContentTab({ fields, data, onChange, onUpload, templateName = '' }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [musicModalOpen, setMusicModalOpen] = useState(false);
  const baseFields = fields.length > 0 ? fields : DEFAULT_FIELDS;

  const reduced = REDUCED_PRIMARY[templateName] || null;
  const hasVariants = !!NARRATIVE_VARIANTS[templateName];

  /* Inject musicStartTime after musicSrc if missing */
  const effectiveFields = baseFields.reduce((acc, f) => {
    acc.push(f);
    if (f.key === 'musicSrc' && !baseFields.find(x => x.key === 'musicStartTime'))
      acc.push({ key: 'musicStartTime', label: 'Démarrer à', type: 'starttime', section: 'Musique' });
    return acc;
  }, []);

  /* Champ vœu synthétique pour les templates actifs (au cas où absent du schéma) */
  const wishField = useMemo(() => {
    if (!reduced) return null;
    const existing = effectiveFields.find(f => f.key === reduced.wishKey);
    return {
      key: reduced.wishKey,
      label: reduced.wishLabel,
      type: existing?.type === 'textarea' ? 'textarea' : (reduced.wishKey === 'wish1' ? 'textarea' : 'text'),
      placeholder: reduced.wishPlaceholder,
      required: false,
    };
  }, [reduced, effectiveFields]);

  /* Categorise */
  const musicFieldsAll = effectiveFields.filter(isMusicField);
  const photoFieldsAll = effectiveFields.filter(f => f.type === 'url' && isPhotoKey(f.key) && !isMusicField(f));

  /* Always show photo cards — use template's own if defined, else inject defaults */
  const finalPhotoFields = (photoFieldsAll.length > 0 ? photoFieldsAll : DEFAULT_PHOTO_FIELDS)
    .filter(f => f.importance !== 'secondary');

  let primaryFields;
  let advancedFields;

  if (reduced) {
    /* Mode "3 cartes actives" : whitelist stricte pour le principal */
    const whitelist = new Set(reduced.keys);
    primaryFields = [];
    // Toujours name en premier
    const nameField = effectiveFields.find(f => f.key === 'name') || { key: 'name', label: 'Prénom du destinataire', type: 'text', required: true, placeholder: 'Prénom' };
    primaryFields.push(nameField);
    // Puis le vœu principal
    if (wishField) primaryFields.push(wishField);
    // Avancés = tout le reste (hors photos et hors musique)
    advancedFields = effectiveFields.filter(f =>
      !whitelist.has(f.key)
      && !isMusicField(f)
      && !(f.type === 'url' && isPhotoKey(f.key))
    );
  } else {
    /* Mode standard (autres templates) : basé sur importance */
    primaryFields = effectiveFields.filter(f =>
      f.importance !== 'secondary' && !isMusicField(f) && !(f.type === 'url' && isPhotoKey(f.key))
    );
    advancedFields = effectiveFields.filter(f => f.importance === 'secondary');
  }

  /* Sélection d'un track depuis la modale : maj des 4 champs d'un coup */
  const handleMusicSelect = (track) => {
    onChange('musicSrc', track.src || '');
    onChange('trackTitle', track.title || '');
    onChange('trackArtist', track.artist || '');
    if (track.cover !== undefined) onChange('albumArt', track.cover || '');
  };

  /* Upload audio depuis la modale : renvoie une URL. */
  const handleMusicUpload = async (file) => {
    const result = await onUpload(file, 'musicSrc');
    // Éventuel format {url} vs URL brute — normalise
    if (typeof result === 'string') return result;
    if (result?.url) return result.url;
    return '';
  };

  /* Application d'une variante narrative : merge les champs. */
  const handleVariantApply = (patch) => {
    Object.entries(patch).forEach(([k, v]) => onChange(k, v));
  };

  return (
    <div className={styles.flatRoot}>

      {/* ── Fil narratif (uniquement pour les templates avec variantes) ── */}
      {hasVariants && (
        <NarrativeVariantPicker
          templateName={templateName}
          data={data}
          onApply={handleVariantApply}
        />
      )}

      {/* ── Destinataire & message principal ── */}
      {primaryFields.map(f => (
        <FlatField key={f.key} field={f}
          value={data[f.key] ?? ''}
          onChange={v => onChange(f.key, v)}
          onUpload={onUpload}
        />
      ))}

      {/* ── Photos en grille (côte à côte) ── */}
      {finalPhotoFields.length > 0 && (
        <div className={styles.photoBlock}>
          <div className={styles.flatLabel}>PHOTOS</div>
          <div
            className={styles.photoGrid}
            data-count={finalPhotoFields.length}
          >
            {finalPhotoFields.map(f => (
              <PhotoTile
                key={f.key}
                label={f.label}
                value={data[f.key] ?? ''}
                onUpload={file => onUpload(file, f.key)}
                onRemove={() => onChange(f.key, '')}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Musique (déclencheur qui ouvre la modale) ── */}
      {musicFieldsAll.length > 0 && (
        <div className={styles.musicBlock}>
          <div className={styles.flatLabel}>MUSIQUE</div>
          <MusicTrigger data={data} onOpen={() => setMusicModalOpen(true)} />
        </div>
      )}

      {/* ── Champs avancés ── */}
      {advancedFields.length > 0 && (
        <div className={styles.advancedBlock}>
          <button className={styles.advancedToggle} onClick={() => setShowAdvanced(o => !o)}>
            <ChevronRight size={15} className={showAdvanced ? styles.chevronOpen : styles.chevronIcon}/>
            Champs avancés
            <span className={styles.advancedCount}>{advancedFields.length}</span>
          </button>
          {showAdvanced && (
            <div className={styles.advancedContent}>
              {advancedFields.map(f => (
                <FlatField key={f.key} field={f}
                  value={data[f.key] ?? ''}
                  onChange={v => onChange(f.key, v)}
                  onUpload={onUpload}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {musicModalOpen && (
        <MusicPickerModal
          currentSrc={data.musicSrc || ''}
          templateName={templateName}
          onSelect={handleMusicSelect}
          onUpload={handleMusicUpload}
          onClose={() => setMusicModalOpen(false)}
        />
      )}
    </div>
  );
}
