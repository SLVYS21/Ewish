require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wishwell';

const notreFilmTemplate = {
  name:           'notre-film',
  label:          "Notre Film d'Amour",
  description:    "Un souvenir animé. Cœur battant, vinyle qui tourne, polaroids, lettre qui s'écrit, vidéo surprise.",
  thumbnail:      '/thumbnails/notre-film.png',
  active: true, featured: true, collectEnabled: false,
  price: 8500, priceLabel: '8 500 FCFA', sortOrder: 3,
  tags: ['amour', 'souvenir', 'QR', 'collier', 'polaroid', 'vidéo'],
  highlights: [
    "Photo circulaire avec cœur cliquable",
    "Vinyle qui tourne (cover album)",
    "Galerie de polaroids (jusqu'à 6 photos)",
    "Lettre qui s'écrit lettre par lettre",
    "Vidéo surprise en boucle",
    "Player audio en pilule",
  ],

  defaultStyle: {
    primaryColor: '#e8637a', accentColor: '#f4a0b0',
    fontFamily: 'Lato', fontSize: 'medium', theme: 'light',
  },

  defaultData: {
    greeting: "Coucou mon Amour...", imagePath: "",
    greetingText: "J'ai quelque chose de spécial pour toi.\nClique sur mon coeur.",
    musicSrc: "", albumArt: "", trackTitle: "Notre Chanson", trackArtist: "Artiste",
    nowTag: "MAINTENANT...",
    musicText: "Tu sais, quand j'écoute cette chanson, je ne peux pas m'empêcher de sourire.\n\nParce que chaque mot semble avoir été écrit pour nous deux.",
    photosBtn: "Voir nos souvenirs →",
    photo1: "", photo1Label: "",
    photo2: "", photo2Label: "",
    photo3: "", photo3Label: "",
    photo4: "", photo4Label: "",
    photo5: "", photo5Label: "",
    photo6: "", photo6Label: "",
    photoCaption: "(Oui, tu es toujours le plus beau sur les photos !)",
    letterBtn: "Lire ma lettre d'amour",
    letterTitle: "mon amour...", letterSalut: "Mon coeur,",
    letterText: "Mon amour, parfois je me demande comment j'ai pu vivre avant toi.\n\nDepuis que tu es entré(e) dans ma vie, chaque journée a pris une autre saveur.\n\nJe t'aime infiniment.",
    senderName: "Ton amour", surpriseBtn: "J'ai une dernière surprise...",
    videoSrc: "", videoLabel: "Notre film d'amour", replayBtn: "Revoir nos souvenirs",
  },

  fields: [
    // Accueil
    { key: 'greeting',     label: 'Salutation',            type: 'text',     section: 'Accueil',  placeholder: 'Coucou mon Amour...', required: true },
    { key: 'imagePath',    label: 'Photo du cercle',        type: 'url',      section: 'Accueil',  placeholder: 'https://... .jpg' },
    { key: 'greetingText', label: 'Sous-texte accueil',     type: 'textarea', section: 'Accueil',  placeholder: "J'ai quelque chose de spécial..." },
    // Musique
    { key: 'musicSrc',    label: 'Fichier audio',           type: 'url',      section: 'Musique',  placeholder: 'https://... .mp3' },
    { key: 'albumArt',    label: 'Pochette (vinyle)',        type: 'url',      section: 'Musique',  placeholder: 'https://... .jpg' },
    { key: 'trackTitle',  label: 'Titre de la chanson',     type: 'text',     section: 'Musique',  placeholder: 'Notre Chanson' },
    { key: 'nowTag',      label: 'Tag MAINTENANT',           type: 'text',     section: 'Musique',  placeholder: 'MAINTENANT...' },
    { key: 'musicText',   label: 'Texte section musique',   type: 'textarea', section: 'Musique',  placeholder: "Tu sais, quand j'écoute..." },
    { key: 'photosBtn',   label: 'Bouton "voir souvenirs"', type: 'text',     section: 'Musique',  placeholder: 'Voir nos souvenirs →' },
    // Photos
    { key: 'photo1',      label: 'Photo 1',                 type: 'url',  section: 'Photos', placeholder: 'https://... .jpg' },
    { key: 'photo1Label', label: 'Légende photo 1',          type: 'text', section: 'Photos', placeholder: 'ex: Notre premier voyage' },
    { key: 'photo2',      label: 'Photo 2',                 type: 'url',  section: 'Photos', placeholder: 'https://... .jpg' },
    { key: 'photo2Label', label: 'Légende photo 2',          type: 'text', section: 'Photos', placeholder: '' },
    { key: 'photo3',      label: 'Photo 3',                 type: 'url',  section: 'Photos', placeholder: 'https://... .jpg' },
    { key: 'photo3Label', label: 'Légende photo 3',          type: 'text', section: 'Photos', placeholder: '' },
    { key: 'photo4',      label: 'Photo 4 (optionnel)',      type: 'url',  section: 'Photos', placeholder: 'https://... .jpg' },
    { key: 'photo4Label', label: 'Légende photo 4',          type: 'text', section: 'Photos', placeholder: '' },
    { key: 'photo5',      label: 'Photo 5 (optionnel)',      type: 'url',  section: 'Photos', placeholder: 'https://... .jpg' },
    { key: 'photo5Label', label: 'Légende photo 5',          type: 'text', section: 'Photos', placeholder: '' },
    { key: 'photo6',      label: 'Photo 6 (optionnel)',      type: 'url',  section: 'Photos', placeholder: 'https://... .jpg' },
    { key: 'photo6Label', label: 'Légende photo 6',          type: 'text', section: 'Photos', placeholder: '' },
    { key: 'photoCaption', label: 'Légende générale',        type: 'text', section: 'Photos', placeholder: '(Oui, tu es toujours...)' },
    { key: 'letterBtn',    label: 'Bouton lettre',           type: 'text', section: 'Photos', placeholder: 'Lire ma lettre d\'amour' },
    // Lettre
    { key: 'letterTitle',  label: 'Destinataire',           type: 'text',     section: 'Lettre', placeholder: 'mon amour...' },
    { key: 'letterSalut',  label: 'Salutation lettre',      type: 'text',     section: 'Lettre', placeholder: 'Mon coeur,' },
    { key: 'letterText',   label: 'Corps de la lettre',     type: 'textarea', section: 'Lettre', placeholder: 'Mon amour...', required: true },
    { key: 'senderName',   label: 'Signature',              type: 'text',     section: 'Lettre', placeholder: 'Ton amour Marc' },
    { key: 'surpriseBtn',  label: 'Bouton surprise',        type: 'text',     section: 'Lettre', placeholder: "J'ai une dernière surprise..." },
    // Vidéo
    { key: 'videoSrc',    label: 'Vidéo surprise (mp4)',    type: 'url',  section: 'Vidéo', placeholder: 'https://... .mp4' },
    { key: 'videoLabel',  label: 'Titre de la vidéo',       type: 'text', section: 'Vidéo', placeholder: 'Notre film d\'amour' },
    { key: 'replayBtn',   label: 'Bouton replay',           type: 'text', section: 'Vidéo', placeholder: 'Revoir nos souvenirs' },
  ],
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  const t = await Template.findOneAndUpdate(
    { name: 'notre-film' },
    notreFilmTemplate,
    { upsert: true, new: true }
  );
  console.log('✅ Seeded:', t.name, '—', t.fields.length, 'champs');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });