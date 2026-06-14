/**
 * Seed walls only — upsert UNIQUEMENT les templates de murs (wall-of-wishes*).
 * Ne touche pas aux autres templates (birthday, special, forever, etc.).
 *
 * Usage : node server/seeds/seedWalls.js
 *   ou  : npm run seed:walls  (depuis server/)
 *
 * Aligné sur le redesign pixel-perfect des templates de murs :
 *   - wall-of-wishes        → classique  (#E11D48 rouge, #C99A3A gold)
 *   - wall-of-wishes-modern → moderne    (#7C5CC9 violet, #E0598B rose)
 *   - wall-of-wishes-space  → vibrant    (#F2643D corail, #F0356E rose)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Template = require('../models/Template');

const WALL_TEMPLATES = [

  /* ── wall-of-wishes (classique) ───────────────────────────── */
  {
    name: 'wall-of-wishes',
    label: 'Mur de vœux',
    description: "Un mur interactif où chacun colle son message — comme des post-its numériques.",
    price: 5000,
    creditsRequired: 10,
    emoji: '💌',
    gradient: 'linear-gradient(135deg,#FBF5EC,#FFE5D6,#FBCFE0)',
    highlights: ["Jusqu'à 30 contributeurs", 'Modération avant publication', '4 couleurs de post-it', "Partage par lien d'invitation"],
    tags: ['collectif', 'interactif'],
    sortOrder: 2,
    active: true,
    featured: false,
    fields: [
      { key: 'eyebrow',   label: 'Badge en haut du mur',   type: 'text',     section: 'Mur', placeholder: 'Mur de mots' },
      { key: 'titleName', label: 'Prénom du destinataire', type: 'text',     section: 'Mur', placeholder: 'Sarah',                              required: true },
      { key: 'subtitle',  label: 'Sous-titre du mur',      type: 'textarea', section: 'Mur', placeholder: 'Partagez ce lien — laissez votre message ici.' },
    ],
    defaultData: {
      eyebrow: 'Mur de mots',
      titleName: 'Prénom',
      subtitle: 'Partagez ce lien — chacun peut laisser son mot sur ce mur.',
    },
    defaultStyle: { primaryColor: '#E11D48', accentColor: '#E11D48', fontFamily: 'Plus Jakarta Sans', fontSize: 'medium', theme: 'light' },
  },

  /* ── wall-of-wishes-modern ────────────────────────────────── */
  {
    name: 'wall-of-wishes-modern',
    label: 'Mur Moderne',
    description: "Cartes pastel douces sur fond lilas, accent violet. Design moderne épuré et aéré.",
    price: 5000,
    creditsRequired: 10,
    emoji: '💬',
    gradient: 'linear-gradient(135deg,#F1EAFB,#FFEDF1,#E3F5EE)',
    highlights: ['Design soft & aéré', 'Cartes pastel élégantes', 'Barre de cagnotte intégrée', "Partage par lien d'invitation"],
    tags: ['collectif', 'interactif', 'moderne'],
    sortOrder: 9,
    active: true,
    featured: false,
    fields: [
      { key: 'eyebrow',   label: 'Badge en haut du mur',   type: 'text',     section: 'Mur', placeholder: 'Mur de mots' },
      { key: 'titleName', label: 'Prénom du destinataire', type: 'text',     section: 'Mur', placeholder: 'Sarah',                              required: true },
      { key: 'subtitle',  label: 'Sous-titre du mur',      type: 'textarea', section: 'Mur', placeholder: 'Partagez ce lien — laissez votre message ici.' },
    ],
    defaultData: {
      eyebrow: 'Mur de mots',
      titleName: 'Prénom',
      subtitle: 'Partagez ce lien — chacun peut laisser son mot sur ce mur.',
    },
    defaultStyle: { primaryColor: '#7C5CC9', accentColor: '#7C5CC9', fontFamily: 'Plus Jakarta Sans', fontSize: 'medium', theme: 'light' },
  },

  /* ── wall-of-wishes-space (vibrant) ───────────────────────── */
  {
    name: 'wall-of-wishes-space',
    label: 'Mur Spatial',
    description: "Canvas infini de vœux style Polaroid sur fond corail. Pan, zoom et vue détail au clic.",
    price: 5000,
    creditsRequired: 10,
    emoji: '🚀',
    gradient: 'linear-gradient(135deg,#ff8060,#ff4878,#d83070)',
    highlights: ['Canvas infini pan + zoom', 'Cartes Polaroid éparpillées', 'Vue détail au clic', "Partage par lien d'invitation"],
    tags: ['collectif', 'interactif', 'spatial'],
    sortOrder: 10,
    active: true,
    featured: false,
    fields: [
      { key: 'eyebrow',   label: 'Badge en haut du mur',   type: 'text',     section: 'Mur', placeholder: 'Mur de mots' },
      { key: 'titleName', label: 'Prénom du destinataire', type: 'text',     section: 'Mur', placeholder: 'Sarah',                              required: true },
      { key: 'subtitle',  label: 'Sous-titre du mur',      type: 'textarea', section: 'Mur', placeholder: 'Glisse pour explorer · Clique pour lire.' },
    ],
    defaultData: {
      eyebrow: 'Mur de mots',
      titleName: 'Prénom',
      subtitle: 'Glisse pour explorer · Clique sur une carte pour lire le vœu.',
    },
    defaultStyle: { primaryColor: '#F2643D', accentColor: '#F0356E', fontFamily: 'Plus Jakarta Sans', fontSize: 'medium', theme: 'light' },
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connecté à MongoDB\n');

  for (const tpl of WALL_TEMPLATES) {
    const { name, ...rest } = tpl;
    await Template.findOneAndUpdate(
      { name },
      { name, ...rest },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`✓ Template "${name}" mis à jour`);
  }

  console.log('\n──────────────────────────────────────');
  console.log(`${WALL_TEMPLATES.length} templates de murs mis à jour.`);
  console.log('──────────────────────────────────────\n');

  await mongoose.disconnect();
  console.log('Terminé.');
}

seed().catch(e => { console.error(e); process.exit(1); });
