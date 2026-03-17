// ══════════════════════════════════════════════
// seed-forever.js
// ══════════════════════════════════════════════
require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wishwell';

const foreverTemplate = {
  name:           'forever',
  label:          'Forever',
  description:    'Un souvenir d\'amour. Décompte depuis le premier jour, photos, message qui s\'écrit lettre par lettre. Fait pour être gravé sur un collier.',
  thumbnail:      '/thumbnails/forever.png',
  active:         true,
  featured:       true,
  collectEnabled: false,
  price:          7500,
  priceLabel:     '7 500 FCFA',
  sortOrder:      5,
  tags:           ['amour', 'souvenir', 'QR', 'collier', 'cadeau'],
  highlights:     ['Décompte en jours depuis votre premier jour', 'Message qui s\'écrit lettre par lettre', '3 photos avec mise en scène', 'Pluie de cœurs', 'Thème blanc & rouge'],

  defaultStyle: {
    primaryColor: '#c0392b',
    accentColor:  '#e74c3c',
    fontFamily:   'Playfair Display',
    fontSize:     'medium',
    theme:        'light',
  },

  defaultData: {
    greeting:       'hey,',
    name:           'Mon cœur',
    greetingText:   'J\'ai une surprise pour toi.',
    musicSrc:       '',
    albumArt:       '',
    trackTitle:     'Notre chanson',
    trackArtist:    'Artiste',
    loveStartDate:  '',          // date ISO YYYY-MM-DD pour le décompte auto
    keyNumber:      '∞',         // affiché si loveStartDate vide
    countdownLabel: 'ensemble depuis',
    countdownUnit:  'jours',
    countdownSince: 'depuis le premier jour',
    imagePath:      '',
    photo1:         '',
    photo2:         '',
    photoCaption:   'Toujours aussi belle.',
    photoSub:       'à chaque regard',
    messageText:    'Je t\'aime infiniment.\n\nChaque jour avec toi est un cadeau.\nJe ne sais pas tout dire avec les mots,\nalors je t\'offre ce moment —\nà scanner quand tu as besoin\nde savoir que tu comptes.',
    senderName:     'de toi qui t\'aime',
    outroText:      'garde-le près de toi',
    replayText:     'recommencer',
  },

  fields: [
    // Intro
    { key: 'greeting',     label: 'Ligne d\'intro',    type: 'text',     section: 'Intro', placeholder: 'hey,' },
    { key: 'name',         label: 'Prénom / Surnom',   type: 'text',     section: 'Intro', placeholder: 'Mon cœur', required: true },
    { key: 'greetingText', label: 'Phrase d\'accroche', type: 'text',    section: 'Intro', placeholder: 'J\'ai une surprise pour toi.' },
    // Musique
    { key: 'musicSrc',    label: 'URL audio',    type: 'url',  section: 'Musique', placeholder: 'https://... .mp3' },
    { key: 'albumArt',    label: 'Pochette',     type: 'url',  section: 'Musique', placeholder: 'https://... .jpg' },
    { key: 'trackTitle',  label: 'Titre',        type: 'text', section: 'Musique', placeholder: 'Notre chanson' },
    { key: 'trackArtist', label: 'Artiste',      type: 'text', section: 'Musique', placeholder: 'Artiste' },
    // Décompte
    { key: 'loveStartDate',  label: 'Date du premier jour', type: 'date', section: 'Décompte', placeholder: '2022-02-14' },
    { key: 'keyNumber',      label: 'Chiffre si pas de date',            type: 'text', section: 'Décompte', placeholder: '∞ ou 365' },
    { key: 'countdownLabel', label: 'Texte au-dessus',                   type: 'text', section: 'Décompte', placeholder: 'ensemble depuis' },
    { key: 'countdownUnit',  label: 'Unité sous le chiffre',             type: 'text', section: 'Décompte', placeholder: 'jours' },
    { key: 'countdownSince', label: 'Ligne italique',                    type: 'text', section: 'Décompte', placeholder: 'depuis le premier jour' },
    // Photos
    { key: 'imagePath',    label: 'Photo centrale',   type: 'url', section: 'Photos', placeholder: 'https://... .jpg' },
    { key: 'photo1',       label: 'Photo gauche',     type: 'url', section: 'Photos', placeholder: 'https://... .jpg' },
    { key: 'photo2',       label: 'Photo droite',     type: 'url', section: 'Photos', placeholder: 'https://... .jpg' },
    { key: 'photoCaption', label: 'Légende principale', type: 'text', section: 'Photos', placeholder: 'Toujours aussi belle.' },
    { key: 'photoSub',     label: 'Sous-légende',     type: 'text', section: 'Photos', placeholder: 'à chaque regard' },
    // Message
    { key: 'messageText', label: 'Message (s\'écrit lettre par lettre)', type: 'textarea', section: 'Message', placeholder: 'Ton message personnel...', required: true },
    { key: 'senderName',  label: 'Signature',  type: 'text', section: 'Message', placeholder: 'de toi qui t\'aime' },
    // Outro
    { key: 'outroText',  label: 'Texte final',  type: 'text', section: 'Outro', placeholder: 'garde-le près de toi' },
    { key: 'replayText', label: 'Texte replay', type: 'text', section: 'Outro', placeholder: 'recommencer' },
  ],
};

// ══════════════════════════════════════════════
// seed-sanctuary.js
// ══════════════════════════════════════════════
const sanctuaryTemplate = {
  name:           'sanctuary',
  label:          'Sanctuary',
  description:    'Une Bible / Coran de poche personnalisée. Versets, prières, pages que seul l\'utilisateur peut modifier avec son code PIN.',
  thumbnail:      '/thumbnails/sanctuary.png',
  active:         true,
  featured:       true,
  collectEnabled: false,
  price:          7500,
  priceLabel:     '7 500 FCFA',
  sortOrder:      6,
  tags:           ['prière', 'foi', 'bible', 'coran', 'cadeau', 'QR'],
  highlights:     ['Livre de poche animé', 'Versets & prières au choix', 'Ajout / suppression de pages', 'Protégé par code PIN à 6 chiffres', 'Musique de louange'],

  defaultStyle: {
    primaryColor: '#7b5e3a',
    accentColor:  '#c9a96e',
    fontFamily:   'Crimson Text',
    fontSize:     'medium',
    theme:        'light',
  },

  defaultData: {
    bookTitle:    'Ma Bible de Poche',
    bookSubtitle: 'pour toi, avec amour',
    bookFrom:     'de maman',
    musicSrc:     '',
    albumArt:     '',
    trackTitle:   'Louange',
    trackArtist:  'Artiste',
    // Les pages sont stockées dans localStorage et/ou ici
    // pages: []  — géré par le template en JSON
  },

  fields: [
    // Couverture
    { key: 'bookTitle',    label: 'Titre du livre',    type: 'text', section: 'Couverture', placeholder: 'Ma Bible de Poche', required: true },
    { key: 'bookSubtitle', label: 'Sous-titre',        type: 'text', section: 'Couverture', placeholder: 'pour toi, avec amour' },
    { key: 'bookFrom',     label: 'De la part de',     type: 'text', section: 'Couverture', placeholder: 'de maman' },
    // Musique
    { key: 'musicSrc',    label: 'URL audio (louange)', type: 'url',  section: 'Musique', placeholder: 'https://... .mp3' },
    { key: 'albumArt',    label: 'Pochette',            type: 'url',  section: 'Musique', placeholder: 'https://... .jpg' },
    { key: 'trackTitle',  label: 'Titre',               type: 'text', section: 'Musique', placeholder: 'Louange' },
    { key: 'trackArtist', label: 'Artiste',             type: 'text', section: 'Musique', placeholder: 'Artiste' },
  ],
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  const t1 = await Template.findOneAndUpdate({ name: 'forever'   }, foreverTemplate,   { upsert: true, new: true });
  const t2 = await Template.findOneAndUpdate({ name: 'sanctuary' }, sanctuaryTemplate, { upsert: true, new: true });
  console.log('✅ Seeded:', t1.name, '·', t2.name);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });