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
  { firstName: 'Marie',     message: "Tu es une source d'inspiration pour toute l'Ã©quipe. Merci pour tout ce que tu nous as apportÃ© !", color: 0, rot: -2.8 },
  { firstName: 'Thomas',    message: "Un immense merci pour ta bienveillance et ta gÃ©nÃ©rositÃ©. Cette journÃ©e, tu la mÃ©rites vraiment !",  color: 1, rot:  2.2 },
  { firstName: 'Ã‰quipe RH', message: "Profite bien ! Tu vas tellement nous manquer ðŸ’›",                                                   color: 2, rot: -1.4 },
  { firstName: 'Jean-Paul', message: "Des annÃ©es de bons souvenirs ensemble. Ã€ toi maintenant de voyager, dÃ©couvrir, vivre !",            color: 3, rot:  3.1 },
  { firstName: 'Camille',   message: "Tu m'as tellement appris. Merci du fond du cÅ“ur.",                                                  color: 4, rot: -2.5 },
  { firstName: 'David',     message: "Retraite dorÃ©e pour une collÃ¨gue en or âœ¨",                                                         color: 5, rot:  1.6 },
  { firstName: 'Nadia',     message: "Toujours lÃ  avec le sourire, mÃªme dans les moments difficiles. Un vrai exemple pour nous tous.",    color: 6, rot: -3.2 },
  { firstName: 'Lucas',     message: "On t'envie ! Mais surtout, on te souhaite le meilleur pour cette nouvelle aventure.",              color: 0, rot:  2.6 },
  { firstName: 'Sophie',    message: "Merci pour ta patience infinie et ta sagesse. Tu vas nous manquer chaque jour.",                    color: 1, rot: -1.2 },
  { firstName: 'Alex',      message: "Ã€ toutes les rÃ©unions du lundi matin qu'on a survÃ©cu ensemble ðŸ˜„ Bonne continuation !",            color: 2, rot:  3.5 },
  { firstName: 'Isabelle',  message: "La plus belle des journÃ©es pour la plus belle des collÃ¨gues.",                                     color: 3, rot: -2.0 },
  { firstName: 'Marc',      message: "Voyage, lis, jardine, profite ! C'est ta vie maintenant.",                                          color: 4, rot:  1.2 },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('âœ“ Connected to MongoDB');

  // â”€â”€ 1. Upsert Template record â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  await Template.findOneAndUpdate(
    { name: 'wall-of-wishes' },
    {
      name:            'wall-of-wishes',
      label:           'Mur classique',
      description:     'Un mur interactif oÃ¹ chacun colle son message  comme des post-its numÃ©riques.',
      price:           4000,
      priceFCFA: 500,
      emoji:           'ðŸ’Œ',
      gradient:        'linear-gradient(135deg,#fdf6c3,#fce4ec,#ede7f6)',
      highlights:      ['Participation collective', 'Post-its personnalisÃ©s', 'Partage par lien'],
      tags:            ['collectif', 'interactif'],
      sortOrder:       2,
      active:          true,
      featured:        false,
      fields: [
        { key: 'titleName', label: 'PrÃ©nom du destinataire', type: 'text',     section: 'Mur', placeholder: 'Sarah',     required: true },
        { key: 'subtitle',  label: 'Sous-titre',             type: 'textarea', section: 'Mur', placeholder: 'Partagez ce lien  chacun peut laisser son vÅ“u ici.' },
      ],
      defaultData: {
        titleName: 'PrÃ©nom',
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
  console.log('âœ“ Template "wall-of-wishes" upserted');

  // â”€â”€ 2. Find or create a demo publication â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  let pub = await Publication.findOne({ templateName: 'wall-of-wishes', customName: 'demo' });
  if (!pub) {
    pub = await Publication.create({
      templateName: 'wall-of-wishes',
      customName:   'demo',
      title:        'Mur classique  DÃ©mo',
      data: {
        titleName: 'Sarah',
        subtitle:  'Partagez ce lien  chacun peut laisser son mot sur ce mur.',
      },
      published:    true,
      showBranding: true,
    });
    console.log('âœ“ Created publication:', pub._id.toString());
  } else {
    console.log('âœ“ Using existing publication:', pub._id.toString());
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
  console.log(`âœ“ Inserted ${docs.length} seed wishes`);

  console.log('\nâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€');
  console.log('Publication ID :', pub._id.toString());
  console.log('Preview URL    : /site/wall-of-wishes/demo');
  console.log('API endpoint   : /api/wishes/' + pub._id.toString() + '/approved');
  console.log('â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€\n');

  await mongoose.disconnect();
  console.log('Done.');
}

seed().catch(e => { console.error(e); process.exit(1); });
