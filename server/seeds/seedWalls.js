/**
 * Seed walls only â€” upsert UNIQUEMENT les templates de murs (wall-of-wishes*).
 * Ne touche pas aux autres templates (birthday, special, forever, etc.).
 *
 * Usage : node server/seeds/seedWalls.js
 *   ou  : npm run seed:walls  (depuis server/)
 *
 * AlignÃ© sur le redesign pixel-perfect des templates de murs :
 *   - wall-of-wishes        â†’ classique  (#E11D48 rouge, #C99A3A gold)
 *   - wall-of-wishes-modern â†’ moderne    (#7C5CC9 violet, #E0598B rose)
 *   - wall-of-wishes-space  â†’ vibrant    (#F2643D corail, #F0356E rose)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Template = require('../models/Template');

const WALL_TEMPLATES = [

  /* â”€â”€ wall-of-wishes-craft (moodboard corail quadrillÃ©) â”€â”€â”€â”€ */
  {
    name: 'wall-of-wishes-craft',
    kind: 'wall', /* essentiel : sans Ã§a le prÃ©-save hook Publication mappe
                     brique='carte' (default kind='animation'), et le mur
                     apparaÃ®t dans le catalogue Cartes au lieu de Murs.
                     Voir server/models/Publication.js KIND_TO_BRIQUE. */
    label: 'Mur Atelier',
    description: "Fond corail quadrillÃ©, titre flottant sans banniÃ¨re et post-its Ã©pinglÃ©s. Vibe atelier / moodboard chaleureuse.",
    price: 5000,
    priceFCFA: 5000,
    emoji: 'ðŸ“Œ',
    gradient: 'linear-gradient(135deg,#FFB199,#FF8F6B,#F26B4C)',
    highlights: ['Fond corail quadrillÃ© signature', 'Titre Ã©ditorial flottant', 'Post-its avec rotation naturelle', "Partage par lien d'invitation"],
    tags: ['collectif', 'interactif', 'moodboard', 'craft'],
    sortOrder: 11,
    active: true,
    featured: true,
    fields: [
      { key: 'eyebrow',   label: 'Badge en haut du mur',   type: 'text',     section: 'Mur', placeholder: 'Mur de mots' },
      { key: 'titleName', label: 'PrÃ©nom du destinataire', type: 'text',     section: 'Mur', placeholder: 'Sarah',                              required: true },
      { key: 'subtitle',  label: 'Sous-titre du mur',      type: 'textarea', section: 'Mur', placeholder: 'Un mur atelier pour Ã©pingler vos mots.' },
    ],
    defaultData: {
      eyebrow: 'Mur de mots',
      titleName: 'PrÃ©nom',
      subtitle: 'Un mur atelier oÃ¹ chacun Ã©pingle son mot, sa photo, son souvenir.',
    },
    defaultStyle: { primaryColor: '#FF8F6B', accentColor: '#111111', fontFamily: 'Plus Jakarta Sans', fontSize: 'medium', theme: 'light' },
  },

];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('âœ“ ConnectÃ© Ã  MongoDB\n');

  for (const tpl of WALL_TEMPLATES) {
    const { name, ...rest } = tpl;
    await Template.findOneAndUpdate(
      { name },
      { name, ...rest },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    console.log(`âœ“ Template "${name}" mis Ã  jour`);
  }

  console.log('\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€');
  console.log(`${WALL_TEMPLATES.length} templates de murs mis Ã  jour.`);
  console.log('â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n');

  await mongoose.disconnect();
  console.log('TerminÃ©.');
}

seed().catch(e => { console.error(e); process.exit(1); });
