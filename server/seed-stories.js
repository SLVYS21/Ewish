require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wishwell';

const STICKER_OPTIONS = [
  { value: 'none',     label: 'Aucun',     icon: '∅' },
  { value: 'heart',    label: 'Cœurs',     icon: '♥' },
  { value: 'star',     label: 'Étoiles',   icon: '★' },
  { value: 'sparkle',  label: 'Sparkles',  icon: '✦' },
  { value: 'cake',     label: 'Gâteaux',   icon: '◈' },
  { value: 'balloon',  label: 'Ballons',   icon: '◯' },
  { value: 'confetti', label: 'Confettis', icon: '❋' },
];

const POS_OPTIONS = [
  { value: 'top',    label: 'Haut',   icon: '↑' },
  { value: 'center', label: 'Centre', icon: '↔' },
  { value: 'bottom', label: 'Bas',    icon: '↓' },
];

function slideFields(n) {
  return [
    { key: `slide${n}Photo`,   label: `Photo`,            type: 'url',      section: `Slide ${n}`, placeholder: 'https://... .jpg' },
    { key: `slide${n}Title`,   label: `Titre`,            type: 'text',     section: `Slide ${n}`, placeholder: 'Bon anniversaire !' },
    { key: `slide${n}Text`,    label: `Texte / message`,  type: 'textarea', section: `Slide ${n}`, placeholder: 'Un petit mot pour ce moment...' },
    { key: `slide${n}Sticker`, label: `Stickers animés`,  type: 'layout',   section: `Slide ${n}`, options: STICKER_OPTIONS },
    { key: `slide${n}TextPos`, label: `Position du texte`, type: 'layout',   section: `Slide ${n}`, options: POS_OPTIONS },
  ];
}

const storiesTemplate = {
  name:           'stories',
  label:          'Stories',
  description:    "Format vertical 9:16 façon stories: plusieurs slides photo+texte, barres de progression, stickers animés, tap pour avancer, musique optionnelle. Idéal pour un montage personnel et intime.",
  thumbnail:      '/thumbnails/stories.png',
  active: true, featured: true, collectEnabled: false,
  price: 5500, priceLabel: '5 500 FCFA', sortOrder: 4,
  tags: ['stories', 'vertical', 'photo', 'moderne'],
  highlights: [
    "Format vertical 9:16 immersif",
    "Jusqu'à 8 slides photo + texte",
    "Barres de progression auto-avance",
    "Stickers animés (cœurs, étoiles, ballons...)",
    "Tap gauche/droite ou clavier pour naviguer",
    "Musique de fond optionnelle",
    "Réactions envoyables (cœur, sparkle)",
  ],

  defaultStyle: {
    primaryColor: '#FF3B7F', accentColor: '#7C5CFF',
    fontFamily: 'Inter', fontSize: 'medium', theme: 'dark',
  },

  defaultData: {
    recipientName: 'Emma',
    fromLabel: 'de',
    senderName: 'ton crush secret',
    avatarSrc: '',
    musicSrc: '',
    slideDurationSec: 6,
    endTitle: "Merci d'avoir regardé ✦",
    endText: "J'espère que ça t'a fait sourire.",
    replayBtn: 'Revoir',

    slide1Photo: '', slide1Title: 'Joyeux Anniversaire',
    slide1Text: "Aujourd'hui, c'est ton jour ♥",
    slide1Sticker: 'heart', slide1TextPos: 'center',

    slide2Photo: '', slide2Title: '',
    slide2Text: 'Tu es cette personne qui rend chaque instant plus doux.',
    slide2Sticker: 'sparkle', slide2TextPos: 'bottom',

    slide3Photo: '', slide3Title: 'Souviens-toi',
    slide3Text: 'De tous ces moments qu\'on a partagés ensemble.',
    slide3Sticker: 'star', slide3TextPos: 'top',

    slide4Photo: '', slide4Title: '',
    slide4Text: 'Que cette année t\'apporte tout ce que tu mérites.',
    slide4Sticker: 'confetti', slide4TextPos: 'bottom',

    slide5Photo: '', slide5Title: 'Bon anniv',
    slide5Text: 'Avec tout mon amour ♡',
    slide5Sticker: 'cake', slide5TextPos: 'center',

    slide6Photo: '', slide6Title: '', slide6Text: '', slide6Sticker: 'none', slide6TextPos: 'bottom',
    slide7Photo: '', slide7Title: '', slide7Text: '', slide7Sticker: 'none', slide7TextPos: 'bottom',
    slide8Photo: '', slide8Title: '', slide8Text: '', slide8Sticker: 'none', slide8TextPos: 'bottom',
  },

  fields: [
    // Général
    { key: 'recipientName', label: 'Prénom du destinataire', type: 'text', section: 'Général', placeholder: 'Emma', required: true },
    { key: 'senderName',    label: 'Ton pseudo / signature', type: 'text', section: 'Général', placeholder: 'ton crush secret' },
    { key: 'fromLabel',     label: 'Mot-liaison (de / from)', type: 'text', section: 'Général', placeholder: 'de' },
    { key: 'avatarSrc',     label: 'Avatar (photo mini)',    type: 'url',  section: 'Général', placeholder: 'https://... .jpg' },
    { key: 'slideDurationSec', label: 'Durée par slide (secondes)', type: 'text', section: 'Général', placeholder: '6' },

    // Musique
    { key: 'musicSrc',       label: 'Bande-son (URL .mp3)',   type: 'url',       section: 'Musique', placeholder: 'https://... .mp3' },
    { key: 'musicStartTime', label: 'Démarrer à (secondes)',  type: 'starttime', section: 'Musique' },

    // Slides
    ...slideFields(1),
    ...slideFields(2),
    ...slideFields(3),
    ...slideFields(4),
    ...slideFields(5),
    ...slideFields(6),
    ...slideFields(7),
    ...slideFields(8),

    // Final
    { key: 'endTitle', label: 'Titre écran de fin', type: 'text', section: 'Final', placeholder: "Merci d'avoir regardé ✦" },
    { key: 'endText',  label: 'Message écran de fin', type: 'textarea', section: 'Final', placeholder: "J'espère que ça t'a fait sourire." },
    { key: 'replayBtn', label: 'Bouton revoir', type: 'text', section: 'Final', placeholder: 'Revoir' },
  ],
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  const t = await Template.findOneAndUpdate(
    { name: 'stories' },
    storiesTemplate,
    { upsert: true, new: true }
  );
  console.log('✅ Seeded:', t.name, '-', t.fields.length, 'champs');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
