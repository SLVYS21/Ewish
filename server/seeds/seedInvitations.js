/**
 * Seed invitations â€” upsert les templates kind='invitation'.
 * Usage : node server/seeds/seedInvitations.js
 *   ou  : npm run seed:invitations  (depuis server/)
 *
 * Les templates HTML publics arriveront plus tard (designs).
 * Ce seed dÃ©finit uniquement le schÃ©ma de champs + mÃ©tadonnÃ©es
 * pour que l'Editor puisse les manipuler dÃ¨s maintenant.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Template = require('../models/Template');

/* Champs partagÃ©s entre toutes les invitations */
const SHARED_FIELDS = [
  { key: 'titleName', label: 'Nom(s) de l\'Ã©vÃ©nement', type: 'text', section: 'Invitation', placeholder: 'Sarah & Marc', required: true },
  { key: 'subtitle',  label: 'Sous-titre',             type: 'text', section: 'Invitation', placeholder: 'Vous Ãªtes invitÃ©(e) !' },
  { key: 'dressCode', label: 'Dress code (optionnel)', type: 'text', section: 'Invitation', placeholder: 'Tenue chic' },
  { key: 'notes',     label: 'Notes complÃ©mentaires',  type: 'textarea', section: 'Invitation', placeholder: 'Parking gratuit, garderie sur placeâ€¦' },
];

const TEMPLATES = [
  /* â”€â”€ wedding-invitation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  {
    name: 'wedding-invitation',
    kind: 'invitation',
    label: 'Invitation Mariage',
    description: "Faire-part numÃ©rique avec compte Ã  rebours, RSVP et mur de mots des invitÃ©s.",
    price: 8000,
    priceFCFA: 6000,
    emoji: 'ðŸ’',
    gradient: 'linear-gradient(135deg,#FBF5EC,#FFE5D6,#FBCFE0)',
    highlights: ['Compte Ã  rebours live', 'RSVP en 1 clic', 'Mur de mots des invitÃ©s', 'Export liste CSV'],
    tags: ['invitation', 'mariage', 'rsvp'],
    sortOrder: 20,
    active: true,
    featured: true,
    fields: [
      ...SHARED_FIELDS,
      { key: 'ceremonyTitle', label: 'Titre cÃ©rÃ©monie',  type: 'text', section: 'CÃ©rÃ©monie', placeholder: 'CÃ©rÃ©monie' },
      { key: 'ceremonyVenue', label: 'Lieu cÃ©rÃ©monie',   type: 'text', section: 'CÃ©rÃ©monie', placeholder: 'Ã‰glise Saint-Michel' },
      { key: 'receptionTitle', label: 'Titre rÃ©ception', type: 'text', section: 'RÃ©ception', placeholder: 'Vin d\'honneur & dÃ®ner' },
      { key: 'receptionVenue', label: 'Lieu rÃ©ception',  type: 'text', section: 'RÃ©ception', placeholder: 'ChÃ¢teau de Versailles' },
    ],
    defaultData: {
      titleName: 'Sarah & Marc',
      subtitle: 'Nous serions honorÃ©s de votre prÃ©sence',
      ceremonyTitle: 'CÃ©rÃ©monie',
      receptionTitle: 'Vin d\'honneur & dÃ®ner',
    },
    defaultStyle: { primaryColor: '#B6885A', accentColor: '#D9A37E', fontFamily: 'Playfair Display', fontSize: 'medium', theme: 'light' },
  },

  /* â”€â”€ birthday-invitation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  {
    name: 'birthday-invitation',
    kind: 'invitation',
    label: 'Invitation Anniversaire',
    description: "Invitation festive avec dÃ©compte, formulaire RSVP et mur de messages.",
    price: 4000,
    priceFCFA: 3000,
    emoji: 'ðŸŽ‰',
    gradient: 'linear-gradient(135deg,#FFE5D6,#FBCFE0,#F1EAFB)',
    highlights: ['DÃ©compte avant la fÃªte', 'RÃ©ponses en temps rÃ©el', 'Mur de messages', 'Liste invitÃ©s importable'],
    tags: ['invitation', 'anniversaire', 'rsvp'],
    sortOrder: 21,
    active: true,
    featured: true,
    fields: [
      ...SHARED_FIELDS,
      { key: 'recipientAge', label: 'Ã‚ge fÃªtÃ© (optionnel)', type: 'text', section: 'Invitation', placeholder: '30' },
      { key: 'partyTheme',   label: 'ThÃ¨me de la fÃªte',     type: 'text', section: 'Invitation', placeholder: 'Disco / Tropical / Casinoâ€¦' },
    ],
    defaultData: {
      titleName: 'Sally',
      subtitle: 'Tu es invitÃ©(e) Ã  ma fÃªte !',
      partyTheme: '',
    },
    defaultStyle: { primaryColor: '#E11D48', accentColor: '#F5B544', fontFamily: 'Plus Jakarta Sans', fontSize: 'medium', theme: 'light' },
  },

  /* â”€â”€ party-invitation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  {
    name: 'party-invitation',
    kind: 'invitation',
    label: 'Invitation SoirÃ©e',
    description: "Pour vos crÃ©maillÃ¨res, afters, dÃ®ners â€” RSVP rapide et mur de mots.",
    price: 3000,
    priceFCFA: 2000,
    emoji: 'ðŸ¥‚',
    gradient: 'linear-gradient(135deg,#1E1B4B,#7C5CC9,#E0598B)',
    highlights: ['Setup en 2 minutes', 'RSVP par lien public', 'Mur de mots collectif', 'Notifications email'],
    tags: ['invitation', 'soirÃ©e', 'event'],
    sortOrder: 22,
    active: true,
    featured: false,
    fields: [
      ...SHARED_FIELDS,
      { key: 'hostName',  label: 'HÃ´te / Organisateur', type: 'text', section: 'Invitation', placeholder: 'Alex' },
      { key: 'partyKind', label: 'Type d\'Ã©vÃ©nement',   type: 'text', section: 'Invitation', placeholder: 'CrÃ©maillÃ¨re / ApÃ©ro / Afterâ€¦' },
    ],
    defaultData: {
      titleName: 'ApÃ©ro chez moi',
      subtitle: 'Pose ta date, viens !',
    },
    defaultStyle: { primaryColor: '#7C5CC9', accentColor: '#E0598B', fontFamily: 'Plus Jakarta Sans', fontSize: 'medium', theme: 'dark' },
  },

  /* â”€â”€ baby-shower-invitation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
  {
    name: 'baby-shower-invitation',
    kind: 'invitation',
    label: 'Invitation Baby Shower',
    description: "Une invitation douce pour annoncer la fÃªte prÃ©natale, avec RSVP et Mur classique.",
    price: 4000,
    priceFCFA: 3000,
    emoji: 'ðŸ‘¶',
    gradient: 'linear-gradient(135deg,#E3F5EE,#F1EAFB,#FFEDF1)',
    highlights: ['Compte Ã  rebours', 'RSVP simple', 'Mur de mots pour le bÃ©bÃ©', 'Liste cadeaux possible'],
    tags: ['invitation', 'baby-shower', 'rsvp'],
    sortOrder: 23,
    active: true,
    featured: false,
    fields: [
      ...SHARED_FIELDS,
      { key: 'parentNames', label: 'Nom des parents',  type: 'text', section: 'Invitation', placeholder: 'LÃ©a & Tom' },
      { key: 'babyHint',    label: 'Indice bÃ©bÃ©',      type: 'text', section: 'Invitation', placeholder: 'C\'est une fille ! / Surpriseâ€¦' },
    ],
    defaultData: {
      titleName: 'Baby Shower de LÃ©a',
      subtitle: 'Venez fÃªter l\'arrivÃ©e de bÃ©bÃ© !',
    },
    defaultStyle: { primaryColor: '#7C5CC9', accentColor: '#E0598B', fontFamily: 'Plus Jakarta Sans', fontSize: 'medium', theme: 'light' },
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('âœ“ ConnectÃ© Ã  MongoDB\n');

  for (const tpl of TEMPLATES) {
    const { name, ...rest } = tpl;
    await Template.findOneAndUpdate(
      { name },
      { name, ...rest },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`âœ“ Template invitation "${name}" mis Ã  jour`);
  }

  console.log('\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€');
  console.log(`${TEMPLATES.length} templates d'invitation mis Ã  jour.`);
  console.log('â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n');

  await mongoose.disconnect();
  console.log('TerminÃ©.');
}

seed().catch(e => { console.error(e); process.exit(1); });
