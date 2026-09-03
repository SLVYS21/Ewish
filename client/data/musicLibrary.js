/**
 * Bibliothèque musicale curée — utilisée dans MusicPickerModal.
 *
 * Chaque piste :
 *   id       — identifiant unique (slug)
 *   title    — titre affiché
 *   artist   — artiste affiché
 *   src      — URL du fichier .mp3 (Cloudinary ou CDN)
 *   cover    — URL de la pochette (JPG/PNG)
 *   mood     — humeur pour filtre optionnel (birthday, romantic, hommage, cinematic, upbeat)
 *   duration — durée approximative en secondes (pour affichage)
 *
 * Astuce : pour ajouter une piste, uploade le MP3 sur Cloudinary,
 * copie l'URL sécurisée puis complète cet objet.
 */
export const MUSIC_LIBRARY = [
  // ── Birthday / Upbeat ─────────────────────────────────────────────
  {
    id: 'happy-birthday-naza',
    title: 'Joyeux Anniversaire',
    artist: 'Naza',
    src: 'https://res.cloudinary.com/dwuqjrbcp/video/upload/v1720000001/mykado/music/happy-birthday-naza.mp3',
    cover: 'https://res.cloudinary.com/dwuqjrbcp/image/upload/v1720000001/mykado/music/covers/happy-birthday-naza.jpg',
    mood: 'birthday',
    duration: 180,
  },
  {
    id: 'celebration-kool',
    title: 'Celebration',
    artist: 'Kool & The Gang',
    src: 'https://res.cloudinary.com/dwuqjrbcp/video/upload/v1720000001/mykado/music/celebration-kool.mp3',
    cover: 'https://res.cloudinary.com/dwuqjrbcp/image/upload/v1720000001/mykado/music/covers/celebration-kool.jpg',
    mood: 'birthday',
    duration: 210,
  },
  {
    id: 'happy-pharrell',
    title: 'Happy',
    artist: 'Pharrell Williams',
    src: 'https://res.cloudinary.com/dwuqjrbcp/video/upload/v1720000001/mykado/music/happy-pharrell.mp3',
    cover: 'https://res.cloudinary.com/dwuqjrbcp/image/upload/v1720000001/mykado/music/covers/happy-pharrell.jpg',
    mood: 'upbeat',
    duration: 232,
  },
  {
    id: 'good-life-kanye',
    title: 'Good Life',
    artist: 'Kanye West',
    src: 'https://res.cloudinary.com/dwuqjrbcp/video/upload/v1720000001/mykado/music/good-life.mp3',
    cover: 'https://res.cloudinary.com/dwuqjrbcp/image/upload/v1720000001/mykado/music/covers/good-life.jpg',
    mood: 'upbeat',
    duration: 240,
  },

  // ── Romantic / Forever ────────────────────────────────────────────
  {
    id: 'perfect-sheeran',
    title: 'Perfect',
    artist: 'Ed Sheeran',
    src: 'https://res.cloudinary.com/dwuqjrbcp/video/upload/v1720000001/mykado/music/perfect-sheeran.mp3',
    cover: 'https://res.cloudinary.com/dwuqjrbcp/image/upload/v1720000001/mykado/music/covers/perfect-sheeran.jpg',
    mood: 'romantic',
    duration: 263,
  },
  {
    id: 'gold-spandau',
    title: 'Gold',
    artist: 'Spandau Ballet',
    src: 'https://res.cloudinary.com/dwuqjrbcp/video/upload/v1720000001/mykado/music/gold-spandau.mp3',
    cover: 'https://res.cloudinary.com/dwuqjrbcp/image/upload/v1720000001/mykado/music/covers/gold-spandau.jpg',
    mood: 'romantic',
    duration: 245,
  },
  {
    id: 'thinking-out-loud',
    title: 'Thinking Out Loud',
    artist: 'Ed Sheeran',
    src: 'https://res.cloudinary.com/dwuqjrbcp/video/upload/v1720000001/mykado/music/thinking-out-loud.mp3',
    cover: 'https://res.cloudinary.com/dwuqjrbcp/image/upload/v1720000001/mykado/music/covers/thinking-out-loud.jpg',
    mood: 'romantic',
    duration: 281,
  },

  // ── Cinematic / Notre Film ───────────────────────────────────────
  {
    id: 'time-zimmer',
    title: 'Time',
    artist: 'Hans Zimmer',
    src: 'https://res.cloudinary.com/dwuqjrbcp/video/upload/v1720000001/mykado/music/time-zimmer.mp3',
    cover: 'https://res.cloudinary.com/dwuqjrbcp/image/upload/v1720000001/mykado/music/covers/time-zimmer.jpg',
    mood: 'cinematic',
    duration: 275,
  },
  {
    id: 'cornfield-chase',
    title: 'Cornfield Chase',
    artist: 'Hans Zimmer',
    src: 'https://res.cloudinary.com/dwuqjrbcp/video/upload/v1720000001/mykado/music/cornfield-chase.mp3',
    cover: 'https://res.cloudinary.com/dwuqjrbcp/image/upload/v1720000001/mykado/music/covers/cornfield-chase.jpg',
    mood: 'cinematic',
    duration: 130,
  },
  {
    id: 'clair-de-lune',
    title: 'Clair de Lune',
    artist: 'Claude Debussy',
    src: 'https://res.cloudinary.com/dwuqjrbcp/video/upload/v1720000001/mykado/music/clair-de-lune.mp3',
    cover: 'https://res.cloudinary.com/dwuqjrbcp/image/upload/v1720000001/mykado/music/covers/clair-de-lune.jpg',
    mood: 'cinematic',
    duration: 300,
  },

  // ── Hommage ─────────────────────────────────────────────────────
  {
    id: 'nuvole-bianche',
    title: 'Nuvole Bianche',
    artist: 'Ludovico Einaudi',
    src: 'https://res.cloudinary.com/dwuqjrbcp/video/upload/v1720000001/mykado/music/nuvole-bianche.mp3',
    cover: 'https://res.cloudinary.com/dwuqjrbcp/image/upload/v1720000001/mykado/music/covers/nuvole-bianche.jpg',
    mood: 'hommage',
    duration: 360,
  },
  {
    id: 'river-flows',
    title: 'River Flows in You',
    artist: 'Yiruma',
    src: 'https://res.cloudinary.com/dwuqjrbcp/video/upload/v1720000001/mykado/music/river-flows.mp3',
    cover: 'https://res.cloudinary.com/dwuqjrbcp/image/upload/v1720000001/mykado/music/covers/river-flows.jpg',
    mood: 'hommage',
    duration: 213,
  },
];

/* Regroupement par humeur pour affichage catégorisé. */
export const MUSIC_MOODS = [
  { id: 'birthday',  label: 'Anniversaire' },
  { id: 'upbeat',    label: 'Feel-good' },
  { id: 'romantic',  label: 'Romantique' },
  { id: 'cinematic', label: 'Cinématique' },
  { id: 'hommage',   label: 'Hommage' },
];

/* Suggestions par template. */
export const MOODS_BY_TEMPLATE = {
  'birthday':   ['birthday', 'upbeat'],
  'notre-film': ['cinematic', 'romantic'],
  'forever':   ['hommage', 'romantic'],
};

export function findTrack(src) {
  if (!src) return null;
  return MUSIC_LIBRARY.find(t => t.src === src) || null;
}

export function formatDuration(sec) {
  if (!sec) return '';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}
