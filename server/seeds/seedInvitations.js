/**
 * Seed invitations — upsert les templates kind='invitation'.
 * Usage : node server/seeds/seedInvitations.js
 *   ou  : npm run seed:invitations  (depuis server/)
 *
 * Les templates HTML publics arriveront plus tard (designs).
 * Ce seed définit uniquement le schéma de champs + métadonnées
 * pour que l'Editor puisse les manipuler dès maintenant.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Template = require('../models/Template');

/* Champs partagés entre toutes les invitations */
const SHARED_FIELDS = [
  { key: 'titleName', label: 'Nom(s) de l\'événement', type: 'text', section: 'Invitation', placeholder: 'Sarah & Marc', required: true },
  { key: 'subtitle',  label: 'Sous-titre',             type: 'text', section: 'Invitation', placeholder: 'Vous êtes invité(e) !' },
  { key: 'dressCode', label: 'Dress code (optionnel)', type: 'text', section: 'Invitation', placeholder: 'Tenue chic' },
  { key: 'notes',     label: 'Notes complémentaires',  type: 'textarea', section: 'Invitation', placeholder: 'Parking gratuit, garderie sur place…' },
];

const TEMPLATES = [
  /* ── wedding-invitation ─────────────────────────────────── */
  {
    name: 'wedding-invitation',
    kind: 'invitation',
    label: 'Invitation Mariage',
    description: "Faire-part numérique avec compte à rebours, RSVP et mur de mots des invités.",
    price: 8000,
    creditsRequired: 12,
    emoji: '💍',
    gradient: 'linear-gradient(135deg,#FBF5EC,#FFE5D6,#FBCFE0)',
    highlights: ['Compte à rebours live', 'RSVP en 1 clic', 'Mur de mots des invités', 'Export liste CSV'],
    tags: ['invitation', 'mariage', 'rsvp'],
    sortOrder: 20,
    active: true,
    featured: true,
    fields: [
      ...SHARED_FIELDS,
      { key: 'ceremonyTitle', label: 'Titre cérémonie',  type: 'text', section: 'Cérémonie', placeholder: 'Cérémonie' },
      { key: 'ceremonyVenue', label: 'Lieu cérémonie',   type: 'text', section: 'Cérémonie', placeholder: 'Église Saint-Michel' },
      { key: 'receptionTitle', label: 'Titre réception', type: 'text', section: 'Réception', placeholder: 'Vin d\'honneur & dîner' },
      { key: 'receptionVenue', label: 'Lieu réception',  type: 'text', section: 'Réception', placeholder: 'Château de Versailles' },
    ],
    defaultData: {
      titleName: 'Sarah & Marc',
      subtitle: 'Nous serions honorés de votre présence',
      ceremonyTitle: 'Cérémonie',
      receptionTitle: 'Vin d\'honneur & dîner',
    },
    defaultStyle: { primaryColor: '#B6885A', accentColor: '#D9A37E', fontFamily: 'Playfair Display', fontSize: 'medium', theme: 'light' },
  },

  /* ── birthday-invitation ────────────────────────────────── */
  {
    name: 'birthday-invitation',
    kind: 'invitation',
    label: 'Invitation Anniversaire',
    description: "Invitation festive avec décompte, formulaire RSVP et mur de messages.",
    price: 4000,
    creditsRequired: 6,
    emoji: '🎉',
    gradient: 'linear-gradient(135deg,#FFE5D6,#FBCFE0,#F1EAFB)',
    highlights: ['Décompte avant la fête', 'Réponses en temps réel', 'Mur de messages', 'Liste invités importable'],
    tags: ['invitation', 'anniversaire', 'rsvp'],
    sortOrder: 21,
    active: true,
    featured: true,
    fields: [
      ...SHARED_FIELDS,
      { key: 'recipientAge', label: 'Âge fêté (optionnel)', type: 'text', section: 'Invitation', placeholder: '30' },
      { key: 'partyTheme',   label: 'Thème de la fête',     type: 'text', section: 'Invitation', placeholder: 'Disco / Tropical / Casino…' },
    ],
    defaultData: {
      titleName: 'Sally',
      subtitle: 'Tu es invité(e) à ma fête !',
      partyTheme: '',
    },
    defaultStyle: { primaryColor: '#E11D48', accentColor: '#F5B544', fontFamily: 'Plus Jakarta Sans', fontSize: 'medium', theme: 'light' },
  },

  /* ── party-invitation ───────────────────────────────────── */
  {
    name: 'party-invitation',
    kind: 'invitation',
    label: 'Invitation Soirée',
    description: "Pour vos crémaillères, afters, dîners — RSVP rapide et mur de mots.",
    price: 3000,
    creditsRequired: 4,
    emoji: '🥂',
    gradient: 'linear-gradient(135deg,#1E1B4B,#7C5CC9,#E0598B)',
    highlights: ['Setup en 2 minutes', 'RSVP par lien public', 'Mur de mots collectif', 'Notifications email'],
    tags: ['invitation', 'soirée', 'event'],
    sortOrder: 22,
    active: true,
    featured: false,
    fields: [
      ...SHARED_FIELDS,
      { key: 'hostName',  label: 'Hôte / Organisateur', type: 'text', section: 'Invitation', placeholder: 'Alex' },
      { key: 'partyKind', label: 'Type d\'événement',   type: 'text', section: 'Invitation', placeholder: 'Crémaillère / Apéro / After…' },
    ],
    defaultData: {
      titleName: 'Apéro chez moi',
      subtitle: 'Pose ta date, viens !',
    },
    defaultStyle: { primaryColor: '#7C5CC9', accentColor: '#E0598B', fontFamily: 'Plus Jakarta Sans', fontSize: 'medium', theme: 'dark' },
  },

  /* ── baby-shower-invitation ─────────────────────────────── */
  {
    name: 'baby-shower-invitation',
    kind: 'invitation',
    label: 'Invitation Baby Shower',
    description: "Une invitation douce pour annoncer la fête prénatale, avec RSVP et mur de vœux.",
    price: 4000,
    creditsRequired: 6,
    emoji: '👶',
    gradient: 'linear-gradient(135deg,#E3F5EE,#F1EAFB,#FFEDF1)',
    highlights: ['Compte à rebours', 'RSVP simple', 'Mur de mots pour le bébé', 'Liste cadeaux possible'],
    tags: ['invitation', 'baby-shower', 'rsvp'],
    sortOrder: 23,
    active: true,
    featured: false,
    fields: [
      ...SHARED_FIELDS,
      { key: 'parentNames', label: 'Nom des parents',  type: 'text', section: 'Invitation', placeholder: 'Léa & Tom' },
      { key: 'babyHint',    label: 'Indice bébé',      type: 'text', section: 'Invitation', placeholder: 'C\'est une fille ! / Surprise…' },
    ],
    defaultData: {
      titleName: 'Baby Shower de Léa',
      subtitle: 'Venez fêter l\'arrivée de bébé !',
    },
    defaultStyle: { primaryColor: '#7C5CC9', accentColor: '#E0598B', fontFamily: 'Plus Jakarta Sans', fontSize: 'medium', theme: 'light' },
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connecté à MongoDB\n');

  for (const tpl of TEMPLATES) {
    const { name, ...rest } = tpl;
    await Template.findOneAndUpdate(
      { name },
      { name, ...rest },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`✓ Template invitation "${name}" mis à jour`);
  }

  console.log('\n──────────────────────────────────────');
  console.log(`${TEMPLATES.length} templates d'invitation mis à jour.`);
  console.log('──────────────────────────────────────\n');

  await mongoose.disconnect();
  console.log('Terminé.');
}

seed().catch(e => { console.error(e); process.exit(1); });
