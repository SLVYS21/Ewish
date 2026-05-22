import { useState, useRef } from 'react';
import { Hand, Music, BookOpen, MessageSquare, PartyPopper, Mail, Star, Timer, Upload, Film, ChevronRight } from 'lucide-react';
import styles from './ContentTab.module.css';

const SECTION_ICONS = {
  Intro: <Hand size={16} />,
  Music: <Music size={16} />,
  Story: <BookOpen size={16} />,
  Message: <MessageSquare size={16} />,
  Celebration: <PartyPopper size={16} />,
  Wishes: <Mail size={16} />,
  Outro: <Star size={16} />,
  Mur: <Mail size={16} />,
};

// Default fields when template isn't loaded from DB yet
const DEFAULT_FIELDS = [
  { key: 'greeting',       label: 'Message d\'accueil',       type: 'text',      section: 'Intro',       placeholder: 'Hiya' },
  { key: 'name',           label: 'Prénom du destinataire',   type: 'text',      section: 'Intro',       placeholder: 'Lydia', required: true },
  { key: 'greetingText',   label: 'Note personnelle',         type: 'text',      section: 'Intro',       placeholder: 'Tu comptes énormément pour nous !' },
  { key: 'musicSrc',       label: 'Fichier musical (URL)',    type: 'url',       section: 'Music',       placeholder: 'https://... .mp3' },
  { key: 'musicStartTime', label: 'Démarrer à',              type: 'starttime', section: 'Music' },
  { key: 'albumArt',       label: 'Pochette de l\'album',    type: 'url',       section: 'Music',       placeholder: 'https://... .jpg' },
  { key: 'trackTitle',     label: 'Titre de la musique',     type: 'text',      section: 'Music',       placeholder: 'Notre chanson' },
  { key: 'trackArtist',    label: 'Artiste',                 type: 'text',      section: 'Music',       placeholder: 'Artiste' },
  { key: 'text1',          label: 'Annonce principale',      type: 'text',      section: 'Story',       required: true },
  { key: 'textInChatBox',  label: 'Message WhatsApp',        type: 'textarea',  section: 'Message',     required: true },
  { key: 'waName',         label: 'Nom du contact',          type: 'text',      section: 'Message' },
  { key: 'imagePath',      label: 'Photo principale (URL)',  type: 'url',       section: 'Celebration' },
  { key: 'photo1',         label: 'Photo latérale gauche',  type: 'url',       section: 'Celebration' },
  { key: 'photo2',         label: 'Photo latérale droite',  type: 'url',       section: 'Celebration' },
  { key: 'wishHeading',    label: 'Titre du vœu',           type: 'text',      section: 'Celebration', required: true },
  { key: 'wishText',       label: 'Sous-titre du vœu',      type: 'text',      section: 'Celebration' },
  { key: 'wish1',          label: 'Paragraphe de vœu 1',    type: 'textarea',  section: 'Wishes' },
  { key: 'wish2',          label: 'Paragraphe de vœu 2',    type: 'textarea',  section: 'Wishes' },
  { key: 'wish3',          label: 'Paragraphe de vœu 3',    type: 'textarea',  section: 'Wishes' },
  { key: 'outroText',      label: 'Message de fin',         type: 'text',      section: 'Outro' },
  { key: 'replayText',     label: 'Texte du bouton revoir', type: 'text',      section: 'Outro' },
];


/* ── Start Time Field ────────────────────────────────────────── */
function StartTimeField({ value, onChange }) {
  const seconds = parseInt(value) || 0;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const fmtTime = (s) => {
    const m = Math.floor(s / 60);
    const ss = s % 60;
    return `${m}:${ss.toString().padStart(2, '0')}`;
  };

  const handleSlider = (e) => onChange(parseInt(e.target.value));
  const handleMins = (e) => onChange(Math.max(0, parseInt(e.target.value) || 0) * 60 + secs);
  const handleSecs = (e) => onChange(mins * 60 + Math.max(0, Math.min(59, parseInt(e.target.value) || 0)));

  return (
    <div className={styles.startTimeField}>
      <div className={styles.startTimeDisplay}>
        <span className={styles.startTimeIcon}><Timer size={14} /></span>
        <span className={styles.startTimeValue}>{fmtTime(seconds)}</span>
        <span className={styles.startTimeHint}>depuis le début</span>
      </div>
      <input
        type="range"
        min={0} max={600} step={1}
        value={seconds}
        onChange={handleSlider}
        className={styles.startTimeSlider}
      />
      <div className={styles.startTimeMMS}>
        <div className={styles.startTimeMM}>
          <label>min</label>
          <input type="number" min={0} max={10} value={mins}
            onChange={handleMins} className={styles.startTimeNum} />
        </div>
        <span className={styles.startTimeSep}>:</span>
        <div className={styles.startTimeMM}>
          <label>sec</label>
          <input type="number" min={0} max={59} value={secs}
            onChange={handleSecs} className={styles.startTimeNum} />
        </div>
        {seconds > 0 && (
          <button className={styles.startTimeReset} onClick={() => onChange(0)} title="Remettre à 0">✕</button>
        )}
      </div>
    </div>
  );
}

/* ── Date Field ──────────────────────────────────────────────── */
function DateField({ value, onChange, placeholder }) {
  // Affiche un date picker natif + calcul automatique du nombre de jours
  const days = value ? Math.floor((new Date() - new Date(value)) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className={styles.dateField}>
      <input
        type="date"
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        className={styles.dateInput}
        placeholder={placeholder}
        max={new Date().toISOString().split('T')[0]}
      />
      {days !== null && days >= 0 && (
        <div className={styles.dateDays}>
          <span className={styles.dateDaysNum}>{days.toLocaleString('fr-FR')}</span>
          <span className={styles.dateDaysLabel}>jours aujourd'hui</span>
        </div>
      )}
    </div>
  );
}

export default function ContentTab({ fields, data, onChange, onUpload }) {
  const [openSections, setOpenSections] = useState({ Intro: true, Music: true, Story: true, Message: true, Celebration: true, Wishes: true, Outro: false, Mur: true });
  const baseFields = fields.length > 0 ? fields : DEFAULT_FIELDS;

  // Always inject musicStartTime after musicSrc, regardless of DB fields
  const effectiveFields = baseFields.reduce((acc, f) => {
    acc.push(f);
    if (f.key === 'musicSrc' && !baseFields.find(x => x.key === 'musicStartTime')) {
      acc.push({ key: 'musicStartTime', label: 'Démarrer à', type: 'starttime', section: f.section });
    }
    return acc;
  }, []);

  // Group by section
  const sections = {};
  effectiveFields.forEach(f => {
    if (!sections[f.section]) sections[f.section] = [];
    sections[f.section].push(f);
  });

  const toggleSection = (name) => setOpenSections(s => ({ ...s, [name]: !s[name] }));

  return (
    <div className={styles.root}>
      {Object.entries(sections).map(([sectionName, sectionFields]) => (
        <Section
          key={sectionName}
          name={sectionName}
          icon={SECTION_ICONS[sectionName] || <BookOpen size={16} />}
          fields={sectionFields}
          data={data}
          onChange={onChange}
          onUpload={onUpload}
          open={!!openSections[sectionName]}
          onToggle={() => toggleSection(sectionName)}
        />
      ))}
    </div>
  );
}

function Section({ name, icon, fields, data, onChange, onUpload, open, onToggle }) {
  return (
    <div className={styles.section}>
      <button className={styles.sectionHeader} onClick={onToggle}>
        <span className={styles.sectionIcon}>{icon}</span>
        <span className={styles.sectionName}>{name}</span>
        <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}><ChevronRight size={16} /></span>
      </button>
      {open && (
        <div className={styles.sectionBody}>
          {fields.map(field => (
            <Field
              key={field.key}
              field={field}
              value={data[field.key] ?? ''}
              onChange={v => onChange(field.key, v)}
              onUpload={file => onUpload(file, field.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Field({ field, value, onChange, onUpload }) {
  const fileRef = useRef();
  const [uploading, setUploading] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try { await onUpload(file); }
    finally { setUploading(false); }
  };

  return (
    <div className={styles.field}>
      <label className={styles.label}>
        {field.label}
        {field.required && <span className={styles.required}>*</span>}
      </label>

      {field.type === 'textarea' ? (
        <textarea
          className={styles.textarea}
          placeholder={field.placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          rows={3}
        />
      ) : field.type === 'color' ? (
        <div className={styles.colorRow}>
          <input
            type="color" value={value || '#ff69b4'}
            onChange={e => onChange(e.target.value)}
            className={styles.colorPicker}
          />
          <input
            type="text" value={value}
            onChange={e => onChange(e.target.value)}
            placeholder="#ff69b4"
            className={styles.colorText}
          />
        </div>
      ) : field.type === 'url' ? (
        <div className={styles.urlRow}>
          <div className={styles.urlRowInputs}>
            <input
              type="url" value={value}
              onChange={e => onChange(e.target.value)}
              placeholder={field.placeholder || 'https://...'}
              className={styles.input}
            />
            {/* Upload button for image fields */}
            {(field.key.includes('photo') || field.key.includes('image') || field.key.includes('Art') || field.key.includes('Path') || /^photo\d+$/.test(field.key)) && (
              <>
                <input type="file" ref={fileRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} />
                <button
                  className={styles.uploadBtn}
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  title="Upload image"
                >
                  {uploading ? '…' : <><Upload size={14} /> Charger</>}
                </button>
              </>
            )}
            {field.key === 'musicSrc' && (
              <>
                <input type="file" ref={fileRef} onChange={handleFileChange} accept="audio/*" style={{ display: 'none' }} />
                <button className={styles.uploadBtn} onClick={() => fileRef.current?.click()} disabled={uploading} title="Upload audio">
                  {uploading ? '…' : <><Music size={14} /> Charger</>}
                </button>
              </>
            )}
            {field.key === 'videoSrc' && (
              <>
                <input type="file" ref={fileRef} onChange={handleFileChange} accept="video/*" style={{ display: 'none' }} />
                <button className={styles.uploadBtn} onClick={() => fileRef.current?.click()} disabled={uploading} title="Upload vidéo">
                  {uploading ? '…' : <><Film size={14} /> Charger</>}
                </button>
              </>
            )}
          </div>
          {/* Preview for image URLs */}
          {value && (field.key.includes('photo') || field.key.includes('image') || field.key.includes('Art') || field.key.includes('Path') || /^photo\d+$/.test(field.key)) && (
            <div className={styles.imgPreview}>
              <img src={value} alt="" onError={e => e.target.style.display = 'none'} />
            </div>
          )}
        </div>
      ) : field.type === 'starttime' ? (
        <StartTimeField value={value} onChange={onChange} />
      ) : field.type === 'date' ? (
        <DateField value={value} onChange={onChange} placeholder={field.placeholder} />
      ) : field.type === 'layout' ? (
        <div className={styles.layoutGrid}>
          {(field.options || []).map(opt => (
            <button
              key={opt.value}
              className={`${styles.layoutBtn} ${value === opt.value ? styles.layoutBtnActive : ''}`}
              onClick={() => onChange(opt.value)}
              title={opt.label}
            >
              <span className={styles.layoutIcon}>{opt.icon}</span>
              <span className={styles.layoutLabel}>{opt.label}</span>
            </button>
          ))}
        </div>
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={styles.input}
        />
      )}
    </div>
  );
}