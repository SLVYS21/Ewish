/**
 * Seed script  wall-of-wishes demo data
 * Usage: node server/seeds/wallOfWishes.js
 *   or:  npm run seed:ww  (from server/)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose    = require('mongoose');
const Publication = require('../models/Publication');
const Wish        = require('../models/Wish');
const Template    = require('../models/Template');

const SEEDS = [
  { firstName: 'Marie',     message: "Tu es une source d'inspiration pour toute l'équipe. Merci pour tout ce que tu nous as apporté !", color: 0, rot: -2.8 },
  { firstName: 'Thomas',    message: "Un immense merci pour ta bienveillance et ta générosité. Cette journée, tu la mérites vraiment !",  color: 1, rot:  2.2 },
  { firstName: 'Équipe RH', message: "Profite bien ! Tu vas tellement nous manquer 💛",                                                   color: 2, rot: -1.4 },
  { firstName: 'Jean-Paul', message: "Des années de bons souvenirs ensemble. À toi maintenant de voyager, découvrir, vivre !",            color: 3, rot:  3.1 },
  { firstName: 'Camille',   message: "Tu m'as tellement appris. Merci du fond du cœur.",                                                  color: 4, rot: -2.5 },
  { firstName: 'David',     message: "Retraite dorée pour une collègue en or ✨",                                                         color: 5, rot:  1.6 },
  { firstName: 'Nadia',     message: "Toujours là avec le sourire, même dans les moments difficiles. Un vrai exemple pour nous tous.",    color: 6, rot: -3.2 },
  { firstName: 'Lucas',     message: "On t'envie ! Mais surtout, on te souhaite le meilleur pour cette nouvelle aventure.",              color: 0, rot:  2.6 },
  { firstName: 'Sophie',    message: "Merci pour ta patience infinie et ta sagesse. Tu vas nous manquer chaque jour.",                    color: 1, rot: -1.2 },
  { firstName: 'Alex',      message: "À toutes les réunions du lundi matin qu'on a survécu ensemble 😄 Bonne continuation !",            color: 2, rot:  3.5 },
  { firstName: 'Isabelle',  message: "La plus belle des journées pour la plus belle des collègues.",                                     color: 3, rot: -2.0 },
  { firstName: 'Marc',      message: "Voyage, lis, jardine, profite ! C'est ta vie maintenant.",                                          color: 4, rot:  1.2 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connected to MongoDB');

  // ── 1. Upsert Template record ──────────────────────────────
  await Template.findOneAndUpdate(
    { name: 'wall-of-wishes' },
    {
      name:            'wall-of-wishes',
      label:           'Mur de vœux',
      description:     'Un mur interactif où chacun colle son message  comme des post-its numériques.',
      price:           4000,
      creditsRequired: 1,
      emoji:           '💌',
      gradient:        'linear-gradient(135deg,#fdf6c3,#fce4ec,#ede7f6)',
      highlights:      ['Participation collective', 'Post-its personnalisés', 'Partage par lien'],
      tags:            ['collectif', 'interactif'],
      sortOrder:       2,
      active:          true,
      featured:        false,
      fields: [
        { key: 'titleName', label: 'Prénom du destinataire', type: 'text',     section: 'Mur', placeholder: 'Sarah',     required: true },
        { key: 'subtitle',  label: 'Sous-titre',             type: 'textarea', section: 'Mur', placeholder: 'Partagez ce lien  chacun peut laisser son vœu ici.' },
      ],
      defaultData: {
        titleName: 'Prénom',
        subtitle:  'Partagez ce lien  chacun peut laisser son mot sur ce mur.',
      },
      defaultStyle: {
        primaryColor: '#c9a84c',
        accentColor:  '#e05574',
        fontFamily:   'Inter',
        fontSize:     'medium',
        theme:        'light',
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  console.log('✓ Template "wall-of-wishes" upserted');

  // ── 2. Find or create a demo publication ──────────────────
  let pub = await Publication.findOne({ templateName: 'wall-of-wishes', customName: 'demo' });
  if (!pub) {
    pub = await Publication.create({
      templateName: 'wall-of-wishes',
      customName:   'demo',
      title:        'Mur de vœux  Démo',
      data: {
        titleName: 'Sarah',
        subtitle:  'Partagez ce lien  chacun peut laisser son mot sur ce mur.',
      },
      published:    true,
      showBranding: true,
    });
    console.log('✓ Created publication:', pub._id.toString());
  } else {
    console.log('✓ Using existing publication:', pub._id.toString());
  }

  // Wipe then re-seed
  const { deletedCount } = await Wish.deleteMany({ publicationId: pub._id });
  console.log(`  Removed ${deletedCount} old wishes`);

  const docs = SEEDS.map(w => ({
    ...w,
    publicationId: pub._id,
    approved:  true,
    hidden:    false,
    mediaType: 'none',
    photoUrl:  '',
    audioUrl:  '',
    videoUrl:  '',
  }));
  await Wish.insertMany(docs);
  console.log(`✓ Inserted ${docs.length} seed wishes`);

  console.log('\n──────────────────────────────────────');
  console.log('Publication ID :', pub._id.toString());
  console.log('Preview URL    : /site/wall-of-wishes/demo');
  console.log('API endpoint   : /api/wishes/' + pub._id.toString() + '/approved');
  console.log('──────────────────────────────────────\n');

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(e => { console.error(e); process.exit(1); });
