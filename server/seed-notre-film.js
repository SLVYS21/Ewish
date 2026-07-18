require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wishwell';

const notreFilmTemplate = {
  name:           'notre-film',
  label:          "Cinéma",
  description:    "Un souvenir animé scène par scène. Photo cliquable, vinyle qui tourne, polaroids, lettre qui s'écrit, vidéo surprise. Pour anniversaire, mariage, amitié ou hommage.",
  thumbnail:      '/thumbnails/notre-film.png',
  active: true, featured: true, collectEnabled: false,
  price: 8500, priceLabel: '8 500 FCFA', sortOrder: 3,
  tags: ['souvenir', 'cinématique', 'polaroid', 'vidéo', 'QR'],
  highlights: [
    "Photo circulaire cliquable",
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
    greeting: "Coucou...", imagePath: "",
    greetingText: "J'ai quelque chose de spécial pour toi.\nClique pour découvrir.",
    musicSrc: "", albumArt: "", trackTitle: "Notre Chanson", trackArtist: "Artiste",
    nowTag: "MAINTENANT...",
    musicText: "Tu sais, quand j'écoute cette chanson, je ne peux pas m'empêcher de penser à toi.\n\nChaque mot semble avoir été écrit pour ce moment.",
    photosBtn: "Voir nos souvenirs →",
    photo1: "", photo1Label: "",
    photo2: "", photo2Label: "",
    photo3: "", photo3Label: "",
    photo4: "", photo4Label: "",
    photo5: "", photo5Label: "",
    photo6: "", photo6Label: "",
    photoCaption: "(Quelques instants à revoir ensemble.)",
    letterBtn: "Lire ma lettre",
    letterTitle: "pour toi...", letterSalut: "Salut,",
    letterText: "Aujourd'hui je voulais prendre le temps de t'écrire.\n\nParce qu'il y a des choses qui ne se disent pas en passant, des mots qui méritent d'être posés.\n\nMerci d'être là.",
    senderName: "Avec affection", surpriseBtn: "J'ai une dernière surprise...",
    videoSrc: "", videoLabel: "Notre film", replayBtn: "Revoir le film",
  },

  fields: [
    // Accueil
    { key: 'greeting',     label: 'Salutation',            type: 'text',     section: 'Accueil',  placeholder: 'Coucou...', required: true },
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
    { key: 'letterBtn',    label: 'Bouton lettre',           type: 'text', section: 'Photos', placeholder: 'Lire ma lettre' },
    // Lettre
    { key: 'letterTitle',  label: 'Destinataire',           type: 'text',     section: 'Lettre', placeholder: 'pour toi...' },
    { key: 'letterSalut',  label: 'Salutation lettre',      type: 'text',     section: 'Lettre', placeholder: 'Salut,' },
    { key: 'letterText',   label: 'Corps de la lettre',     type: 'textarea', section: 'Lettre', placeholder: 'Aujourd\'hui je voulais te dire...', required: true },
    { key: 'senderName',   label: 'Signature',              type: 'text',     section: 'Lettre', placeholder: 'Avec affection' },
    { key: 'surpriseBtn',  label: 'Bouton surprise',        type: 'text',     section: 'Lettre', placeholder: "J'ai une dernière surprise..." },
    // Vidéo
    { key: 'videoSrc',    label: 'Vidéo surprise (mp4)',    type: 'url',  section: 'Vidéo', placeholder: 'https://... .mp4' },
    { key: 'videoLabel',  label: 'Titre de la vidéo',       type: 'text', section: 'Vidéo', placeholder: 'Notre film' },
    { key: 'replayBtn',   label: 'Bouton replay',           type: 'text', section: 'Vidéo', placeholder: 'Revoir le film' },
  ],
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  const t = await Template.findOneAndUpdate(
    { name: 'notre-film' },
    notreFilmTemplate,
    { upsert: true, new: true }
  );
  console.log('✅ Seeded:', t.name, '', t.fields.length, 'champs');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });