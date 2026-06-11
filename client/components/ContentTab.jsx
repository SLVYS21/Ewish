import { useState, useRef } from 'react';
import { Music, Camera, ChevronRight, X, Timer } from 'lucide-react';
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

const PRIMARY_SECTIONS = new Set(['Intro', 'Story', 'Message']);
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

/* ── Photo Card ── */
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

/* ── Music Section ── */
function MusicSection({ fields, data, onChange, onUpload }) {
  const [expanded, setExpanded] = useState(false);
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

  const trackTitle  = data.trackTitle  || '';
  const trackArtist = data.trackArtist || '';
  const albumArt    = data.albumArt    || '';
  const musicSrc    = data.musicSrc    || '';
  const hasTrack    = !!(musicSrc || trackTitle);

  const handleAudioFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try { await onUpload(file, 'musicSrc'); } finally { setUploading(false); }
  };

  const hasStartTime = fields.some(f => f.key === 'musicStartTime');
  const hasAlbumArt  = fields.some(f => f.key === 'albumArt');
  const hasHint      = fields.some(f => f.key === 'musicHint');

  return (
    <div className={styles.musicWrapper}>
      <div className={styles.musicCard}>
        {albumArt ? (
          <img src={albumArt} alt="" className={styles.musicAlbumArt} onError={e=>e.target.style.display='none'}/>
        ) : (
          <span className={styles.musicIconCircle}><Music size={16}/></span>
        )}
        <div className={styles.musicInfo}>
          <div className={styles.musicTitle}>{hasTrack ? (trackTitle||'Musique sans titre') : 'Musique d\'ambiance'}</div>
          <div className={styles.musicSub}>{hasTrack ? (trackArtist||'Artiste inconnu') : 'Aucune musique sélectionnée'}</div>
        </div>
        <button className={styles.musicChangeBtn} onClick={() => setExpanded(o=>!o)}>
          {expanded ? 'Fermer' : hasTrack ? 'Modifier' : 'Choisir'}
        </button>
      </div>

      {expanded && (
        <div className={styles.musicExpandedFields}>
          <input ref={fileRef} type="file" accept="audio/*" style={{display:'none'}}
            onChange={e => handleAudioFile(e.target.files?.[0])} />
          <div className={styles.flatFieldRow}>
            <div className={styles.flatLabel}>FICHIER AUDIO</div>
            <div className={styles.urlRowInputs}>
              <input type="text" value={musicSrc} onChange={e=>onChange('musicSrc',e.target.value)}
                placeholder="https://... .mp3" className={styles.input}/>
              <button className={styles.uploadBtn} onClick={()=>fileRef.current?.click()} disabled={uploading}>
                {uploading ? '…' : <><Music size={13}/> Charger</>}
              </button>
            </div>
          </div>
          <div className={styles.flatFieldRow}>
            <div className={styles.flatLabel}>TITRE</div>
            <input type="text" value={trackTitle} onChange={e=>onChange('trackTitle',e.target.value)}
              placeholder="Notre chanson" className={styles.input}/>
          </div>
          <div className={styles.flatFieldRow}>
            <div className={styles.flatLabel}>ARTISTE</div>
            <input type="text" value={trackArtist} onChange={e=>onChange('trackArtist',e.target.value)}
              placeholder="Artiste" className={styles.input}/>
          </div>
          {hasAlbumArt && (
            <PhotoCard label="POCHETTE D'ALBUM" value={albumArt}
              onChange={v=>onChange('albumArt',v)} onUpload={f=>onUpload(f,'albumArt')}/>
          )}
          {hasStartTime && (
            <div className={styles.flatFieldRow}>
              <div className={styles.flatLabel}>DÉMARRER À</div>
              <StartTimeField value={data.musicStartTime} onChange={v=>onChange('musicStartTime',v)}/>
            </div>
          )}
          {hasHint && (
            <div className={styles.flatFieldRow}>
              <div className={styles.flatLabel}>INDICATION (affiché au visiteur)</div>
              <input type="text" value={data.musicHint||''} onChange={e=>onChange('musicHint',e.target.value)}
                placeholder="C'est mieux avec de la musique 🎶" className={styles.input}/>
            </div>
          )}
        </div>
      )}
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
export default function ContentTab({ fields, data, onChange, onUpload }) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const baseFields = fields.length > 0 ? fields : DEFAULT_FIELDS;

  /* Inject musicStartTime after musicSrc if missing */
  const effectiveFields = baseFields.reduce((acc, f) => {
    acc.push(f);
    if (f.key === 'musicSrc' && !baseFields.find(x => x.key === 'musicStartTime'))
      acc.push({ key: 'musicStartTime', label: 'Démarrer à', type: 'starttime', section: 'Musique' });
    return acc;
  }, []);

  /* Categorise */
  const musicFields  = effectiveFields.filter(isMusicField);
  const photoFields  = effectiveFields.filter(f => f.type === 'url' && isPhotoKey(f.key) && !isMusicField(f));

  /* Always show photo cards — use template's own if defined, else inject defaults */
  const finalPhotoFields = photoFields.length > 0 ? photoFields : DEFAULT_PHOTO_FIELDS;

  const primaryFields = effectiveFields.filter(f =>
    PRIMARY_SECTIONS.has(f.section) && !isMusicField(f) && !(f.type === 'url' && isPhotoKey(f.key))
  );
  const advancedFields = effectiveFields.filter(f =>
    !musicFields.includes(f) && !photoFields.includes(f) && !primaryFields.includes(f)
  );

  return (
    <div className={styles.flatRoot}>

      {/* ── Destinataire & message primary fields ── */}
      {primaryFields.map(f => (
        <FlatField key={f.key} field={f}
          value={data[f.key] ?? ''}
          onChange={v => onChange(f.key, v)}
          onUpload={onUpload}
        />
      ))}

      {/* ── Photos ── */}
      {finalPhotoFields.map(f => (
        <PhotoCard key={f.key} label={f.label}
          value={data[f.key] ?? ''}
          onChange={v => onChange(f.key, v)}
          onUpload={file => onUpload(file, f.key)}
        />
      ))}

      {/* ── Musique ── */}
      {musicFields.length > 0 && (
        <MusicSection fields={musicFields} data={data} onChange={onChange} onUpload={onUpload} />
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
    </div>
  );
}
