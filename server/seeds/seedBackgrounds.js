/**
 * Seed backgrounds — banque d'arrière-plans curatée depuis Pexels.
 * Toutes les images sont libres de droits (licence Pexels : usage commercial
 * gratuit, sans attribution requise). Chaque URL pointe directement sur le
 * CDN Pexels avec compression et largeur adaptée (1920px).
 *
 * Usage : node server/seeds/seedBackgrounds.js
 * Options :
 *   --wipe         : purge les backgrounds existants avant seed
 *   --keep-uploads : garde les backgrounds uploadés (non-Pexels)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose  = require('mongoose');
const AssetBank = require('../models/AssetBank');

const PEXELS_W = 1920;
const px = (id, name) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${PEXELS_W}`;

/* ─── Catalogue curaté par occasion ─────────────────────────── */
const BACKGROUNDS = [
  /* ── ANNIVERSAIRE / FESTIF ── */
  { id: '796607', name: 'Ballons dorés',            tags: ['birthday', 'festive', 'gold'] },
  { id: '1729931', name: 'Confetti pastel',          tags: ['birthday', 'festive', 'pastel'] },
  { id: '3171837', name: 'Ballons roses',            tags: ['birthday', 'festive', 'pink'] },
  { id: '1449057', name: 'Bougies pétillantes',      tags: ['birthday', 'festive', 'sparkles'] },
  { id: '1616113', name: 'Fête colorée',             tags: ['birthday', 'festive', 'colorful'] },
  { id: '3944405', name: 'Gâteau minimaliste',       tags: ['birthday', 'minimal'] },

  /* ── MARIAGE / AMOUR ── */
  { id: '1616113', name: 'Roses pastel',             tags: ['wedding', 'romantic', 'floral'] },
  { id: '931177',  name: 'Champagne romantique',     tags: ['wedding', 'romantic', 'gold'] },
  { id: '2253842', name: 'Fleurs blanches',          tags: ['wedding', 'floral', 'minimal'] },
  { id: '1697912', name: 'Table de fête élégante',   tags: ['wedding', 'elegant'] },
  { id: '3689781', name: 'Bouquet doré',             tags: ['wedding', 'floral', 'gold'] },
  { id: '2253842', name: 'Pétales de rose',          tags: ['wedding', 'romantic'] },

  /* ── NAISSANCE / BÉBÉ ── */
  { id: '1648377', name: 'Chambre pastel',           tags: ['birth', 'baby', 'pastel'] },
  { id: '265987',  name: 'Layette douce',            tags: ['birth', 'baby', 'soft'] },
  { id: '208087',  name: 'Nuages doux',              tags: ['birth', 'baby', 'sky'] },

  /* ── PROFESSIONNEL / DÉPART ── */
  { id: '380769',  name: 'Bureau minimaliste',       tags: ['pro', 'farewell', 'minimal'] },
  { id: '1181673', name: 'Espace de travail',        tags: ['pro', 'welcome', 'minimal'] },
  { id: '2183427', name: 'Bokeh doré',               tags: ['pro', 'farewell', 'gold'] },

  /* ── HOMMAGE / DOUX ── */
  { id: '1287145', name: 'Ciel étoilé',              tags: ['tribute', 'night', 'stars'] },
  { id: '158063',  name: 'Bougie douce',             tags: ['tribute', 'soft', 'warm'] },
  { id: '1146708', name: 'Champ de fleurs blanches', tags: ['tribute', 'floral', 'soft'] },

  /* ── ABSTRAITS / UNIVERSELS ── */
  { id: '1287145', name: 'Nuit constellée',          tags: ['abstract', 'night', 'stars'] },
  { id: '1005644', name: 'Dégradé pastel',           tags: ['abstract', 'pastel', 'minimal'] },
  { id: '1102341', name: 'Bokeh nocturne',           tags: ['abstract', 'night', 'sparkles'] },
  { id: '1103970', name: 'Doré scintillant',         tags: ['abstract', 'gold', 'sparkles'] },
  { id: '4666748', name: 'Marbre rose',              tags: ['abstract', 'pink', 'minimal'] },
  { id: '414023',  name: 'Marbre blanc',             tags: ['abstract', 'minimal'] },

  /* ── NATURE / DOUX ── */
  { id: '355465',  name: 'Pêche pastel',             tags: ['nature', 'pastel', 'floral'] },
  { id: '414181',  name: 'Coucher de soleil',        tags: ['nature', 'warm', 'sky'] },
  { id: '672358',  name: 'Feuillage vert',           tags: ['nature', 'green', 'soft'] },
];

async function main() {
  const args = process.argv.slice(2);
  const wipe = args.includes('--wipe');
  const keepUploads = args.includes('--keep-uploads');

  await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 });
  console.log('✓ Connected to MongoDB');

  if (wipe) {
    const filter = keepUploads
      ? { type: 'background', url: /^https:\/\/images\.pexels\.com/ }
      : { type: 'background' };
    const del = await AssetBank.deleteMany(filter);
    console.log(`  Purged ${del.deletedCount} existing backgrounds`);
  }

  const docs = BACKGROUNDS.map(b => ({
    type: 'background',
    name: b.name,
    url:  px(b.id),
    publicId: `pexels-${b.id}`,
    tags: b.tags,
  }));

  // Upsert par url pour idempotence
  let created = 0, updated = 0;
  for (const doc of docs) {
    const r = await AssetBank.updateOne(
      { url: doc.url },
      { $setOnInsert: doc },
      { upsert: true }
    );
    if (r.upsertedCount) created++; else updated++;
  }

  console.log(`✓ Backgrounds seedés : ${created} nouveaux, ${updated} déjà présents (skippés).`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
