import React, { useState, useRef, useEffect } from 'react';
import { X, Music, Upload, Sparkles, Play, Pause, Check, Loader2 } from 'lucide-react';
import { MUSIC_LIBRARY, MUSIC_MOODS, MOODS_BY_TEMPLATE, formatDuration } from '../data/musicLibrary';
import styles from './MusicPickerModal.module.css';

const TABS = [
  { id: 'library',  label: 'Bibliothèque', Icon: Music },
  { id: 'upload',   label: 'Uploader',      Icon: Upload },
  { id: 'generate', label: 'Générer (IA)',  Icon: Sparkles },
];

/**
 * MusicPickerModal — 3 sources : bibliothèque curée, upload utilisateur, génération IA.
 * Props :
 *   currentSrc  — URL du track actuellement sélectionné (highlight preview)
 *   templateName — sert à choisir l'humeur pré-sélectionnée
 *   onSelect(track) — { src, title, artist, cover } lorsqu'une piste est choisie
 *   onUpload(file) — appelé quand un fichier audio est uploadé (attend une URL)
 *   onClose()
 */
export default function MusicPickerModal({
  currentSrc = '',
  templateName = '',
  onSelect,
  onUpload,
  onClose,
}) {
  const [activeTab, setActiveTab]     = useState('library');
  const [previewingId, setPreviewingId] = useState(null);
  const [uploading, setUploading]       = useState(false);
  const [genPrompt, setGenPrompt]       = useState('');
  const [generating, setGenerating]     = useState(false);
  const audioRef  = useRef(null);
  const fileRef   = useRef(null);

  const suggestedMoods = MOODS_BY_TEMPLATE[templateName] || [];
  const [activeMood, setActiveMood] = useState(suggestedMoods[0] || 'all');

  /* Stop preview quand la modale se ferme. */
  useEffect(() => () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  const handlePreview = (track) => {
    if (previewingId === track.id) {
      audioRef.current?.pause();
      setPreviewingId(null);
      return;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(track.src);
    audio.play().catch(() => {});
    audioRef.current = audio;
    setPreviewingId(track.id);
    audio.addEventListener('ended', () => setPreviewingId(null));
  };

  const handleChooseTrack = (track) => {
    audioRef.current?.pause();
    onSelect?.({
      src:    track.src,
      title:  track.title,
      artist: track.artist,
      cover:  track.cover,
    });
    onClose?.();
  };

  const handleUploadFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const url = await onUpload?.(file);
      if (url) {
        onSelect?.({
          src:    url,
          title:  file.name.replace(/\.[^/.]+$/, ''),
          artist: 'Ma musique',
          cover:  '',
        });
        onClose?.();
      }
    } finally {
      setUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!genPrompt.trim()) return;
    setGenerating(true);
    // Placeholder : à brancher sur ton endpoint /api/music/generate quand dispo.
    setTimeout(() => {
      setGenerating(false);
      alert("Génération musicale IA — bientôt disponible.\n\nPour l'instant, utilise la bibliothèque ou uploade ton propre fichier.");
    }, 900);
  };

  const filtered = activeMood === 'all'
    ? MUSIC_LIBRARY
    : MUSIC_LIBRARY.filter(t => t.mood === activeMood);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <header className={styles.header}>
          <div>
            <div className={styles.title}>Choisir une musique</div>
            <div className={styles.sub}>Une piste bien choisie change tout l'effet.</div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </header>

        <nav className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t.id}
              className={`${styles.tab} ${activeTab === t.id ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <t.Icon size={14} />
              <span>{t.label}</span>
            </button>
          ))}
        </nav>

        {/* ── LIBRARY ─────────────────────────────────────── */}
        {activeTab === 'library' && (
          <div className={styles.body}>
            <div className={styles.moodBar}>
              <button
                className={`${styles.moodChip} ${activeMood === 'all' ? styles.moodChipActive : ''}`}
                onClick={() => setActiveMood('all')}
              >
                Toutes
              </button>
              {MUSIC_MOODS.map(m => (
                <button
                  key={m.id}
                  className={`${styles.moodChip} ${activeMood === m.id ? styles.moodChipActive : ''}`}
                  onClick={() => setActiveMood(m.id)}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <div className={styles.trackList}>
              {filtered.map(track => {
                const isCurrent   = currentSrc && currentSrc === track.src;
                const isPlaying   = previewingId === track.id;
                return (
                  <div key={track.id} className={`${styles.trackRow} ${isCurrent ? styles.trackRowCurrent : ''}`}>
                    <button
                      className={styles.trackCover}
                      onClick={() => handlePreview(track)}
                      aria-label={isPlaying ? 'Pause' : 'Écouter'}
                    >
                      {track.cover ? (
                        <img src={track.cover} alt="" onError={e => { e.target.style.display = 'none'; }} />
                      ) : (
                        <Music size={16} />
                      )}
                      <span className={styles.trackCoverOverlay}>
                        {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                      </span>
                    </button>
                    <div className={styles.trackInfo}>
                      <div className={styles.trackTitle}>{track.title}</div>
                      <div className={styles.trackMeta}>
                        <span>{track.artist}</span>
                        {track.duration ? <span className={styles.trackDot}>·</span> : null}
                        {track.duration ? <span>{formatDuration(track.duration)}</span> : null}
                      </div>
                    </div>
                    <button
                      className={`${styles.trackChoose} ${isCurrent ? styles.trackChooseCurrent : ''}`}
                      onClick={() => handleChooseTrack(track)}
                    >
                      {isCurrent ? <><Check size={13}/> Choisie</> : 'Choisir'}
                    </button>
                  </div>
                );
              })}
              {filtered.length === 0 && (
                <div className={styles.empty}>Aucune piste dans cette humeur.</div>
              )}
            </div>
          </div>
        )}

        {/* ── UPLOAD ──────────────────────────────────────── */}
        {activeTab === 'upload' && (
          <div className={styles.body}>
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              style={{ display: 'none' }}
              onChange={e => handleUploadFile(e.target.files?.[0])}
            />
            <div className={styles.uploadDrop}>
              <span className={styles.uploadIcon}><Upload size={22} /></span>
              <div className={styles.uploadTitle}>Uploade ton propre fichier</div>
              <div className={styles.uploadSub}>
                Formats : MP3, M4A, WAV. Max ~10 Mo.<br />
                Assure-toi d'avoir les droits sur la piste.
              </div>
              <button
                className={styles.uploadBtn}
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <><Loader2 size={14} className={styles.spin}/> Upload…</> : <><Upload size={14}/> Choisir un fichier</>}
              </button>
            </div>
          </div>
        )}

        {/* ── GENERATE ────────────────────────────────────── */}
        {activeTab === 'generate' && (
          <div className={styles.body}>
            <div className={styles.genIntro}>
              <span className={styles.genBadge}>Bêta</span>
              <div className={styles.genTitle}>Compose une piste sur mesure</div>
              <div className={styles.genSub}>
                Décris l'ambiance recherchée (instrument, tempo, émotion) — l'IA génère un extrait de 30 s.
              </div>
            </div>
            <textarea
              className={styles.genPrompt}
              rows={4}
              placeholder="Ex : Piano doux et cordes légères, tempo lent, ambiance nostalgique et lumineuse."
              value={genPrompt}
              onChange={e => setGenPrompt(e.target.value)}
            />
            <button
              className={styles.genBtn}
              onClick={handleGenerate}
              disabled={!genPrompt.trim() || generating}
            >
              {generating ? <><Loader2 size={14} className={styles.spin}/> Génération…</> : <><Sparkles size={14}/> Générer la musique</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
