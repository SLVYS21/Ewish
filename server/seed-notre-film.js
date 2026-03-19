require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wishwell';

const notreFilmTemplate = {
  name:           'notre-film',
  label:          'Notre Film d\'Amour',
  description:    'Un souvenir animé. Cœur battant, vinyle qui tourne, polaroids, lettre qui s\'écrit, vidéo surprise. Fait pour être gravé sur un collier.',
  thumbnail:      '/thumbnails/notre-film.png',
  active:         true,
  featured:       true,
  collectEnabled: false,
  price:          8500,
  priceLabel:     '8 500 FCFA',
  sortOrder:      3,
  tags:           ['amour', 'souvenir', 'QR', 'collier', 'polaroid', 'vidéo'],
  highlights:     [
    'Photo circulaire avec cœur cliquable',
    'Vinyle qui tourne (cover album)',
    'Galerie de polaroids positionnables',
    'Lettre qui s\'écrit lettre par lettre',
    'Vidéo surprise en boucle',
    'Player audio persistent',
  ],

  defaultStyle: {
    primaryColor: '#e8637a',
    accentColor:  '#f4a0b0',
    fontFamily:   'Lato',
    fontSize:     'medium',
    theme:        'light',
  },

  defaultData: {
    // S1 — Accueil
    greeting:     'Coucou Sarah...',
    imagePath:    '',
    greetingText: 'J\'ai quelque chose de spécial pour toi.\nClique sur mon cœur.',

    // S2 — Musique
    musicSrc:     '',
    albumArt:     '',
    trackTitle:   'Notre Chanson',
    trackArtist:  'Artiste',
    nowTag:       'MAINTENANT...',
    musicText:    'Tu sais, quand j\'écoute cette chanson, je ne peux pas m\'empêcher de sourire comme une idiote.\n\nParce que chaque mot semble avoir été écrit pour nous deux.',
    photosBtn:    'Voir nos souvenirs →',

    // S3 — Photos (stockées comme JSON array)
    photoCaption: '(Oui, tu es toujours le plus beau sur les photos !)',
    letterBtn:    'Lire ma lettre d\'amour',
    // photos: []  ← géré comme JSON dans data.photos

    // S4 — Lettre
    letterTitle:  'Sarah d\'amour...',
    letterSalut:  'Mon cœur,',
    letterText:   'Mon amour, parfois je me demande comment j\'ai pu vivre avant toi. Depuis que tu es entrée dans ma vie, chaque journée a pris une autre saveur.\n\nMême dans le silence, ta présence me rassure.\n\nTu es celle qui me comprend sans que j\'aie besoin de tout expliquer. Celle qui me fait rire quand je n\'en avais plus envie.\n\nJe t\'aime infiniment.',
    senderName:   'Ton amour Marc',
    surpriseBtn:  'J\'ai une dernière surprise...',

    // S5 — Vidéo
    videoSrc:     '',
    videoLabel:   'Notre film d\'amour',
    replayBtn:    'Revoir nos souvenirs',
  },

  fields: [
    // Accueil
    { key: 'greeting',    label: 'Salutation',         type: 'text',     section: 'Accueil',  placeholder: 'Coucou Sarah...', required: true },
    { key: 'imagePath',   label: 'Photo principale',   type: 'url',      section: 'Accueil',  placeholder: 'https://... .jpg' },
    { key: 'greetingText',label: 'Sous-texte accueil', type: 'textarea', section: 'Accueil',  placeholder: 'J\'ai quelque chose de spécial...' },

    // Musique
    { key: 'musicSrc',    label: 'URL audio',          type: 'url',      section: 'Musique',  placeholder: 'https://... .mp3' },
    { key: 'albumArt',    label: 'Pochette (vinyle)',   type: 'url',      section: 'Musique',  placeholder: 'https://... .jpg' },
    { key: 'trackTitle',  label: 'Titre de la chanson', type: 'text',    section: 'Musique',  placeholder: 'I found a love for me...' },
    { key: 'nowTag',      label: 'Tag au-dessus',       type: 'text',    section: 'Musique',  placeholder: 'MAINTENANT...' },
    { key: 'musicText',   label: 'Texte section musique', type: 'textarea', section: 'Musique', placeholder: 'Tu sais, quand j\'écoute...' },
    { key: 'photosBtn',   label: 'Bouton photos',       type: 'text',    section: 'Musique',  placeholder: 'Voir nos souvenirs →' },

    // Photos
    { key: 'photoCaption', label: 'Légende photos',    type: 'text',     section: 'Photos',   placeholder: '(Oui, tu es toujours...)' },
    { key: 'letterBtn',    label: 'Bouton lettre',      type: 'text',     section: 'Photos',   placeholder: 'Lire ma lettre d\'amour' },

    // Lettre
    { key: 'letterTitle',  label: 'Destinataire',       type: 'text',     section: 'Lettre',   placeholder: 'Sarah d\'amour...' },
    { key: 'letterSalut',  label: 'Salutation lettre',  type: 'text',     section: 'Lettre',   placeholder: 'Mon cœur,' },
    { key: 'letterText',   label: 'Corps de la lettre', type: 'textarea', section: 'Lettre',   placeholder: 'Mon amour...', required: true },
    { key: 'senderName',   label: 'Signature',          type: 'text',     section: 'Lettre',   placeholder: 'Ton amour Marc' },
    { key: 'surpriseBtn',  label: 'Bouton surprise',    type: 'text',     section: 'Lettre',   placeholder: 'J\'ai une dernière surprise...' },

    // Vidéo
    { key: 'videoSrc',   label: 'URL vidéo (mp4)',      type: 'url',      section: 'Vidéo',    placeholder: 'https://... .mp4' },
    { key: 'videoLabel', label: 'Titre de la vidéo',    type: 'text',     section: 'Vidéo',    placeholder: 'Notre film d\'amour' },
    { key: 'replayBtn',  label: 'Bouton replay',        type: 'text',     section: 'Vidéo',    placeholder: 'Revoir nos souvenirs' },
  ],
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  const t = await Template.findOneAndUpdate(
    { name: 'notre-film' },
    notreFilmTemplate,
    { upsert: true, new: true }
  );
  console.log('✅ Seeded:', t.name);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });