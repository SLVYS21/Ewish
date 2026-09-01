require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wishwell';

function letterFields(n) {
  return [
    { key: `letter${n}Text`,   label: `Lettre ${n} — texte`,     type: 'textarea', section: `Lettre ${n}`, placeholder: 'Message de la lettre...' },
    { key: `letter${n}Sender`, label: `Lettre ${n} — signature`, type: 'text',     section: `Lettre ${n}`, placeholder: 'Ton prénom' },
  ];
}

const happyBirthdayTemplate = {
  name:           'happy-birthday-classic',
  label:          'Happy Birthday Classic',
  description:    "Souvenir animé façon carte anniversaire : intro gâteau avec bougies, page d'accueil avec titre lettre-par-lettre, chapeau, ballons, photo circulaire, texte tournant, livre message et enveloppe qui s'ouvre sur 8 lettres draggables. Adaptation fidèle d'un design open-source.",
  thumbnail:      '/thumbnails/happy-birthday-classic.png',
  active: true, featured: true, collectEnabled: false,
  price: 7500, priceLabel: '7 500 FCFA', sortOrder: 5,
  tags: ['anniversaire', 'gâteau', 'enveloppe', 'lettres', 'classique'],
  highlights: [
    "Intro gâteau animé avec bougies & glaçage",
    "Titre 'Happy Birthday' lettre-par-lettre",
    "Photo circulaire + ballons + texte tournant",
    "Livre message qui s'ouvre en 3D (survol)",
    "Enveloppe qui s'ouvre sur 8 lettres draggables",
    "Cœurs battants + pluie de cœurs",
    "Confettis à l'ouverture",
  ],

  defaultStyle: {
    primaryColor: '#FF7882', accentColor: '#8B0000',
    fontFamily: 'Sriracha', fontSize: 'medium', theme: 'light',
  },

  defaultData: {
    recipientName: 'Trisha',
    senderName:    'Rexon',
    dateOfBirth:   '19 Nov',
    photoSrc:      '',

    // Intro
    cakeTitle: 'Happy 18th Birthday!',

    // Book
    bookTitle:     'Happy Birthday!',
    bookSubtitle:  'A purr-fect message just for you...',
    bookRecipient: 'To You!',
    bookP1: 'Happy Birthday, Trisha ♥',
    bookP2: "From the moment we met, something in my life shifted — like the universe quietly guiding me toward someone meant for me. You brought warmth into the parts of me I didn't even know were cold.",
    bookP3: "On your birthday, I just want you to know this: I want you with me in every chapter, every storm, every sunshine, every tomorrow.",
    bookP4: "You're not just another year older today — you're the reason my life feels softer, brighter, and endlessly worth living. Happy Birthday.",
    bookSignature: 'Your Best Friend, Rexon',

    // Envelope
    envelopeTitle: 'Envelope Of Love',

    // Letters
    letter1Text: 'Wish you the happiest birthday.',
    letter1Sender: 'Rexon',
    letter2Text: 'One picture from you can change my whole day, my whole mood, my whole heartbeat.',
    letter2Sender: 'Rexon',
    letter3Text: "Even through screens and pixels, your laugh reaches me like sunlight through a window — warm, real, and impossible to forget.",
    letter3Sender: 'Rexon',
    letter4Text: "Every notification from you feels like a heartbeat whispering, I'm here, and I love you.",
    letter4Sender: 'Rexon',
    letter5Text: "Our messages might travel through wires, but every word you send lands straight in my heart.",
    letter5Sender: 'Rexon',
    letter6Text: "Ever since we met, my heart knew where it wanted to stay — with you, in every soft moment, every smile, every quiet piece of forever.",
    letter6Sender: 'Rexon',
    letter7Text: "You turned an ordinary day into a memory my heart refuses to forget. Since then, every moment with you has felt softer, brighter.",
    letter7Sender: 'Rexon',
    letter8Text: "Since our first conversation, you've been the quiet spark that changed my world, turning ordinary days into moments that feel beautifully meant to be.",
    letter8Sender: 'Rexon',
  },

  fields: [
    // Général
    { key: 'recipientName', label: 'Prénom du destinataire', type: 'text', section: 'Général', placeholder: 'Trisha', required: true },
    { key: 'senderName',    label: 'Ton prénom (expéditeur)', type: 'text', section: 'Général', placeholder: 'Rexon', required: true },
    { key: 'dateOfBirth',   label: 'Date de naissance (courte)', type: 'text', section: 'Général', placeholder: '19 Nov' },
    { key: 'photoSrc',      label: 'Photo du destinataire',  type: 'url',  section: 'Général', placeholder: 'https://... .jpg' },

    // Intro
    { key: 'cakeTitle', label: "Titre écran d'intro",       type: 'text', section: 'Intro', placeholder: 'Happy 18th Birthday!' },

    // Book
    { key: 'bookTitle',     label: 'Titre du livre',          type: 'text',     section: 'Livre', placeholder: 'Happy Birthday!' },
    { key: 'bookSubtitle',  label: 'Sous-titre du livre',     type: 'text',     section: 'Livre', placeholder: 'A purr-fect message just for you...' },
    { key: 'bookRecipient', label: 'En-tête page message',    type: 'text',     section: 'Livre', placeholder: 'To You!' },
    { key: 'bookP1',        label: 'Paragraphe 1',            type: 'textarea', section: 'Livre', placeholder: 'Happy Birthday...', required: true },
    { key: 'bookP2',        label: 'Paragraphe 2',            type: 'textarea', section: 'Livre' },
    { key: 'bookP3',        label: 'Paragraphe 3',            type: 'textarea', section: 'Livre' },
    { key: 'bookP4',        label: 'Paragraphe 4',            type: 'textarea', section: 'Livre' },
    { key: 'bookSignature', label: 'Signature',               type: 'text',     section: 'Livre', placeholder: 'Your Best Friend, Rexon' },

    // Envelope
    { key: 'envelopeTitle', label: "Titre de l'enveloppe",    type: 'text', section: 'Enveloppe', placeholder: 'Envelope Of Love' },

    // Letters
    ...letterFields(1),
    ...letterFields(2),
    ...letterFields(3),
    ...letterFields(4),
    ...letterFields(5),
    ...letterFields(6),
    ...letterFields(7),
    ...letterFields(8),
  ],
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  const t = await Template.findOneAndUpdate(
    { name: 'happy-birthday-classic' },
    happyBirthdayTemplate,
    { upsert: true, new: true }
  );
  console.log('✅ Seeded:', t.name, '-', t.fields.length, 'champs');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
