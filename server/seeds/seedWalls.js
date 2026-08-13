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

  /* ── wall-of-wishes-craft (moodboard corail quadrillé) ──── */
  {
    name: 'wall-of-wishes-craft',
    kind: 'wall', /* essentiel : sans ça le pré-save hook Publication mappe
                     brique='carte' (default kind='animation'), et le mur
                     apparaît dans le catalogue Cartes au lieu de Murs.
                     Voir server/models/Publication.js KIND_TO_BRIQUE. */
    label: 'Mur Atelier',
    description: "Fond corail quadrillé, titre flottant sans bannière et post-its épinglés. Vibe atelier / moodboard chaleureuse.",
    price: 5000,
    creditsRequired: 10,
    emoji: '📌',
    gradient: 'linear-gradient(135deg,#FFB199,#FF8F6B,#F26B4C)',
    highlights: ['Fond corail quadrillé signature', 'Titre éditorial flottant', 'Post-its avec rotation naturelle', "Partage par lien d'invitation"],
    tags: ['collectif', 'interactif', 'moodboard', 'craft'],
    sortOrder: 11,
    active: true,
    featured: true,
    fields: [
      { key: 'eyebrow',   label: 'Badge en haut du mur',   type: 'text',     section: 'Mur', placeholder: 'Mur de mots' },
      { key: 'titleName', label: 'Prénom du destinataire', type: 'text',     section: 'Mur', placeholder: 'Sarah',                              required: true },
      { key: 'subtitle',  label: 'Sous-titre du mur',      type: 'textarea', section: 'Mur', placeholder: 'Un mur atelier pour épingler vos mots.' },
    ],
    defaultData: {
      eyebrow: 'Mur de mots',
      titleName: 'Prénom',
      subtitle: 'Un mur atelier où chacun épingle son mot, sa photo, son souvenir.',
    },
    defaultStyle: { primaryColor: '#FF8F6B', accentColor: '#111111', fontFamily: 'Plus Jakarta Sans', fontSize: 'medium', theme: 'light' },
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
