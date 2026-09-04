/**
 * Seed des 12 publications de démo utilisées par la landing page
 * (section « Démos en direct » — composant Inspirations.jsx).
 *
 * Crée 6 murs (Cartes de Groupes) + 6 cartes solo (Cartes Perso),
 * une par catégorie. Les publications sont attribuées au compte admin
 * (via son merchantId) et vides côté messages : à l'admin de les seeder
 * en partageant les liens aux vrais contributeurs.
 *
 * L'attribution utilise le champ AdminUser.merchantId (pas l'_id) — c'est
 * ce champ qui pilote le filtre "?mine=true" du GET /publications côté UI
 * "Mes créations". Si l'admin ciblé n'a pas de merchantId, on lui en
 * assigne un (son _id en string) pour que les créations apparaissent.
 *
 * Usage :
 *   node server/seeds/seedDemoLanding.js
 *   npm run seed:demo-landing   (depuis server/)
 *
 * Env :
 *   DEMO_LANDING_ADMIN_ID     _id de l'AdminUser cible (défaut ci-dessous)
 *   DEMO_LANDING_ADMIN_EMAIL  fallback : recherche par email si l'id ne matche pas
 *
 * Idempotent : réutilise les Publications existantes par (templateName, customName).
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose    = require('mongoose');
const Publication = require('../models/Publication');
const Template    = require('../models/Template');
const AdminUser   = require('../models/AdminUser');

const DEFAULT_ADMIN_ID    = process.env.DEMO_LANDING_ADMIN_ID    || '69a80c53c9bf1b93552c7879';
const DEFAULT_ADMIN_EMAIL = process.env.DEMO_LANDING_ADMIN_EMAIL || 'admin@ewishwell.com';

const WALLS = [
  {
    key: 'birthday_group',
    customName: 'demo-anniversaire-groupe',
    templateName: 'wall-of-wishes',
    title: 'Mur — Anniversaire Léa',
    data: {
      eyebrow: 'Mur de mots',
      titleName: 'Joyeux 30 ans Léa 🎂',
      subtitle: 'Ses proches ont laissé leurs mots pour ses 30 ans.',
    },
    style: { primaryColor: '#E11D48', accentColor: '#E11D48', fontFamily: 'Plus Jakarta Sans' },
    cagnotteConfig: {
      enabled: true,
      description: 'Cagnotte anniv Léa',
      goal: 150000,
      minContribution: 1000,
    },
  },
  {
    key: 'wedding_group',
    customName: 'demo-mariage-groupe',
    templateName: 'wall-of-wishes-modern',
    title: 'Mur — Mariage Sarah & Marc',
    data: {
      eyebrow: 'Livre d\'or',
      titleName: 'Vive les mariés ! Sarah & Marc 💍',
      subtitle: 'Vœux et messages des invités du mariage.',
    },
    style: { primaryColor: '#7C5CC9', accentColor: '#7C5CC9', fontFamily: 'Plus Jakarta Sans' },
    cagnotteConfig: {
      enabled: true,
      description: 'Voyage de noces',
      goal: 500000,
      minContribution: 2500,
    },
  },
  {
    key: 'memorial_group',
    customName: 'demo-deces-groupe',
    templateName: 'wall-of-wishes-modern',
    title: 'Mur — Hommage à Gabriel',
    data: {
      eyebrow: 'En mémoire',
      titleName: 'À la mémoire de Gabriel 🕊️',
      subtitle: 'Souvenirs et hommages partagés par ses proches.',
    },
    style: { primaryColor: '#5F6A82', accentColor: '#5F6A82', fontFamily: 'Plus Jakarta Sans' },
  },
  {
    key: 'party_group',
    customName: 'demo-soiree-groupe',
    templateName: 'wall-of-wishes-craft',
    title: 'Mur — Soirée du 15/03',
    data: {
      eyebrow: 'Best-of soirée',
      titleName: 'La bande : Soirée du 15 🕺',
      subtitle: 'Photos, best-of et moments cocasses de la soirée.',
    },
    style: { primaryColor: '#FF8F6B', accentColor: '#111111', fontFamily: 'Plus Jakarta Sans' },
  },
  {
    key: 'birth_group',
    customName: 'demo-naissance-groupe',
    templateName: 'wall-of-wishes-modern',
    title: 'Mur — Baptême de Noah',
    data: {
      eyebrow: 'Mur de bienvenue',
      titleName: 'Bienvenue au petit Noah 🍼',
      subtitle: 'Vœux de toute la famille pour l\'arrivée de bébé.',
    },
    style: { primaryColor: '#7ECFC9', accentColor: '#F5B5C8', fontFamily: 'Plus Jakarta Sans' },
  },
  {
    key: 'congrats_group',
    customName: 'demo-felicitations-groupe',
    templateName: 'wall-of-wishes',
    title: 'Mur — Félicitations Équipe',
    data: {
      eyebrow: 'Bravo l\'équipe',
      titleName: 'Bravo l\'équipe ! 🚀',
      subtitle: 'Reconnaissance collective pour un accomplissement partagé.',
    },
    style: { primaryColor: '#E8A33D', accentColor: '#E8A33D', fontFamily: 'Plus Jakarta Sans' },
  },
  {
    key: 'vision_group',
    customName: 'demo-vision-board',
    templateName: 'wall-of-wishes-craft',
    title: 'Mur — Vision Board 2026',
    data: {
      eyebrow: 'Vision Board',
      titleName: 'Objectifs & Motivations 🌟',
      subtitle: 'Mes inspirations et rappels personnels pour l\'année.',
    },
    style: { primaryColor: '#6D4FC7', accentColor: '#F5B544', fontFamily: 'Plus Jakarta Sans' },
  },
];

/* ── Cartes solo ──────────────────────────────────────────────────────
   Mapping fixé avec le PM :
     - Anniversaire → template `birthday` (démo animée existante)
     - Forever      → template `forever`  (démo animée existante)
     - Mariage / Baptême / Félicitations / Hommage → template `myenvelope`
       (card-editor) avec occasion + thème + textes adaptés. L'iframe de
       la landing pointe alors sur /c/:slug (SPA React), pas sur /site/*.
   Pour myenvelope : on n'utilise PAS `data` — on remplit les champs plats
   envelopeOccasion / envelopeTheme / envelopeTexts / envelopeConfetti /
   envelopeUnboxingBg, exactement comme le fait le card-editor. */
const CARDS = [
  {
    key: 'birthday_perso',
    customName: 'demo-anniversaire-solo',
    templateName: 'birthday',
    title: 'Carte — Anniversaire de Léa',
    data: {
      greeting: 'Joyeux anniversaire',
      name: 'Léa',
      greetingText: 'Une carte animée pour marquer le coup.',
      trackTitle: 'Notre chanson',
      trackArtist: 'Anniversaire',
      musicHint: "C'est mieux avec de la musique 🎶",
      text1: '30 ans, ça se fête !',
      waAvatar: 'L',
      waName: 'Léa',
      textInChatBox: 'Joyeux anniversaire ma belle ! 🎂✨',
      text2: 'Une nouvelle décennie.',
      text3: 'Pleine de belles choses.',
      text4: 'Un moment à toi',
      text4Adjective: 'unique',
      text5Entry: 'Parce que,',
      text5Content: 'Tu es incroyable',
      smiley: ':)',
      bigTextPart1: 'H',
      bigTextPart2: 'B',
      wishHeading: 'Joyeux Anniversaire !',
      wishText: 'Que cette année t\'apporte tout ce que tu mérites.',
      outroText: 'On t\'aime fort.',
      replayText: 'Rejoue',
      outroSmiley: ':)',
    },
    style: { primaryColor: '#E11D48', accentColor: '#F5B544', fontFamily: 'Work Sans' },
  },
  {
    key: 'love_perso',
    customName: 'demo-amour-solo',
    templateName: 'forever',
    title: "Carte — Forever, Nour & Amine",
    data: {
      recipient: 'Nour',
      titleName: 'Nour',
      message: 'Chaque jour à tes côtés est un cadeau. Merci d\'être toi, merci d\'être là.',
      sender: 'Amine, pour toujours ❤️',
    },
    style: { primaryColor: '#B23A48', accentColor: '#F2B5B5', fontFamily: 'Playfair Display' },
  },
  {
    key: 'wedding_perso',
    customName: 'demo-mariage-solo',
    templateName: 'myenvelope',
    title: 'Carte — Mariage Sarah & Marc',
    envelopeOccasion: 'mariage',
    envelopeTheme: { id: 'floral_champetres', color: '#EDE0CC', texture: 'linen', liner: 'theme' },
    envelopeTexts: {
      title:     'Toutes nos félicitations 💍',
      recipient: 'Sarah & Marc',
      message:   "En ce jour si particulier, nous vous souhaitons une vie remplie d'amour, de complicité et de moments inoubliables. Que votre union soit aussi belle que votre histoire.",
      signature: 'Vos amis, avec tendresse',
      backNote:  'Fait avec amour · myKado',
    },
    envelopeConfetti:   'hearts',
    envelopeUnboxingBg: 'default',
    style: { primaryColor: '#B4614A', accentColor: '#D4A574', fontFamily: 'Playfair Display' },
  },
  {
    key: 'birth_perso',
    customName: 'demo-naissance-solo',
    templateName: 'myenvelope',
    title: 'Carte — Baptême de Noah',
    envelopeOccasion: 'naissance',
    envelopeTheme: { id: 'floral_champetres', color: '#F5EFE5', texture: 'linen', liner: 'blush' },
    envelopeTexts: {
      title:     'Bienvenue au monde 👶',
      recipient: 'Petit Noah',
      message:   "Toutes nos félicitations pour cette merveilleuse nouvelle. Nous vous souhaitons plein de bonheur, de douceur et de tendres instants avec ce petit trésor.",
      signature: 'Toute la famille',
      backNote:  'Fait avec amour · myKado',
    },
    envelopeConfetti:   'stars',
    envelopeUnboxingBg: 'default',
    style: { primaryColor: '#7ECFC9', accentColor: '#F5B5C8', fontFamily: 'Playfair Display' },
  },
  {
    key: 'congrats_perso',
    customName: 'demo-felicitations-solo',
    templateName: 'myenvelope',
    title: 'Carte — Félicitations Alexandre',
    envelopeOccasion: 'felicitations',
    envelopeTheme: { id: 'confetti_pop', color: '#FF3E88', texture: 'smooth', liner: 'theme' },
    envelopeTexts: {
      title:     'Félicitations 🎓',
      recipient: 'Alexandre',
      message:   "Bravo pour cette belle réussite ! Elle est méritée et nous sommes très fiers de toi. Continue à briller et à croire en toi.",
      signature: 'Tes proches, très fiers',
      backNote:  'Fait avec amour · myKado',
    },
    envelopeConfetti:   'fireworks',
    envelopeUnboxingBg: 'default',
    style: { primaryColor: '#FF3E88', accentColor: '#FFC145', fontFamily: 'Fredoka' },
  },
  {
    key: 'memorial_perso',
    customName: 'demo-deces-solo',
    templateName: 'myenvelope',
    title: 'Carte — Hommage Gabriel',
    envelopeOccasion: 'condoleances',
    envelopeTheme: { id: 'chic_gold', color: '#111111', texture: 'smooth', liner: 'ink' },
    envelopeTexts: {
      title:     'Sincères condoléances 🕊️',
      recipient: 'Gabriel',
      message:   "Dans ce moment difficile, nous pensons très fort à vous. En hommage à une personne d'une bienveillance exceptionnelle, dont le souvenir restera dans nos cœurs.",
      signature: 'Ses proches, pour toujours',
      backNote:  'En mémoire · myKado',
    },
    envelopeConfetti:   'none',
    envelopeUnboxingBg: 'default',
    style: { primaryColor: '#1A1A1A', accentColor: '#C9A961', fontFamily: 'Cormorant Garamond' },
  },
  {
    /* Variante Anniversaire en format enveloppe (card-editor / myenvelope).
       Complémentaire de `demo-anniversaire-solo` qui est en template `birthday`
       (démo animée) — cette variante montre le rendu "carte à ouvrir" pour
       l'anniversaire, format prisé par les moments intimes. */
    key: 'birthday_perso_env',
    customName: 'demo-anniversaire-solo-env',
    templateName: 'myenvelope',
    title: 'Carte — Anniversaire de Camille',
    envelopeOccasion: 'anniversaire',
    envelopeTheme: { id: 'confetti_pop', color: '#F8BE68', texture: 'smooth', liner: 'theme' },
    envelopeTexts: {
      title:     'Joyeux anniversaire 🎂',
      recipient: 'Camille',
      message:   "Une nouvelle année qui commence, remplie de tout ce que tu aimes. Que cette journée ressemble à la personne exceptionnelle que tu es : lumineuse, joyeuse et pleine de vie.",
      signature: 'Avec toute notre tendresse',
      backNote:  'Fait avec amour · myKado',
    },
    envelopeConfetti:   'confetti',
    envelopeUnboxingBg: 'default',
    style: { primaryColor: '#E25B45', accentColor: '#F8BE68', fontFamily: 'Fredoka' },
  },
];

async function ensureTemplateExists(templateName) {
  const tpl = await Template.findOne({ name: templateName }).select('name kind').lean();
  if (!tpl) {
    console.warn(`  ⚠  Template "${templateName}" introuvable en base. Publication créée quand même, mais elle ne s'affichera pas tant que le template n'est pas seedé.`);
  }
  return tpl;
}

async function resolveAdminMerchantId() {
  /* On tente d'abord par _id (fourni via env ou par défaut), sinon par email.
     Si l'admin trouvé n'a pas encore de merchantId, on lui en assigne un
     (= son _id string) : c'est cette valeur qui pilote le filtre
     "mine=true" côté GET /publications, donc sans elle les créations
     n'apparaîtront pas dans « Mes créations ». */
  let admin = null;
  try {
    if (mongoose.isValidObjectId(DEFAULT_ADMIN_ID)) {
      admin = await AdminUser.findById(DEFAULT_ADMIN_ID);
    }
  } catch {}
  if (!admin && DEFAULT_ADMIN_EMAIL) {
    admin = await AdminUser.findOne({ email: String(DEFAULT_ADMIN_EMAIL).toLowerCase().trim() });
  }
  if (!admin) {
    throw new Error(
      `AdminUser introuvable (id="${DEFAULT_ADMIN_ID}", email="${DEFAULT_ADMIN_EMAIL}"). ` +
      `Vérifie DEMO_LANDING_ADMIN_ID / DEMO_LANDING_ADMIN_EMAIL, ou crée l'admin d'abord.`
    );
  }
  if (!admin.merchantId) {
    admin.merchantId = String(admin._id);
    await admin.save();
    console.log(`  ⓘ  merchantId absent sur l'admin — assigné à "${admin.merchantId}"`);
  }
  return { adminId: String(admin._id), merchantId: String(admin.merchantId), email: admin.email };
}

async function upsertPublication(entry, brique, merchantId) {
  /* Recherche par slug (unique+sparse) : c'est la seule clé stable quand on
     re-seed après avoir changé templateName (ex : demo-amour-solo passé de
     notre-film à forever, demo-mariage-solo passé de forever à myenvelope).
     Fallback sur (templateName, customName) pour tolérer une pub historique
     sans slug renseigné. */
  const existing =
       (await Publication.findOne({ slug: entry.customName }))
    || (await Publication.findOne({ templateName: entry.templateName, customName: entry.customName }));

  const payload = {
    templateName: entry.templateName,
    customName:   entry.customName,
    title:        entry.title,
    data:         entry.data || {},
    style:        entry.style || {},
    merchantId,
    published:    true,
    isPremade:    false,
    brique,
    slug:         entry.customName,
  };
  if (entry.cagnotteConfig) payload.cagnotteConfig = entry.cagnotteConfig;

  /* Champs plats myenvelope — remplis uniquement pour templateName='myenvelope'.
     Sous-objets shallow-mergés côté modèle (default: () => ({})), donc les
     laisser undefined sur les autres templates est safe. */
  if (entry.templateName === 'myenvelope') {
    if (entry.envelopeOccasion)   payload.envelopeOccasion   = entry.envelopeOccasion;
    if (entry.envelopeTheme)      payload.envelopeTheme      = entry.envelopeTheme;
    if (entry.envelopeTexts)      payload.envelopeTexts      = entry.envelopeTexts;
    if (entry.envelopePhoto)      payload.envelopePhoto      = entry.envelopePhoto;
    if (entry.envelopeGift)       payload.envelopeGift       = entry.envelopeGift;
    if (entry.envelopeConfetti)   payload.envelopeConfetti   = entry.envelopeConfetti;
    if (entry.envelopeUnboxingBg) payload.envelopeUnboxingBg = entry.envelopeUnboxingBg;
  }

  if (existing) {
    Object.assign(existing, payload);
    await existing.save();
    return { pub: existing, created: false };
  }
  const pub = await Publication.create(payload);
  return { pub, created: true };
}

async function seed() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/wishwell';
  await mongoose.connect(uri);
  console.log('✓ Connecté à MongoDB');

  const { adminId, merchantId, email } = await resolveAdminMerchantId();
  console.log(`  Admin cible : ${email}  (id=${adminId}, merchantId=${merchantId})\n`);

  const results = { walls: [], cards: [] };

  console.log('── Murs (Cartes de Groupes) ──');
  for (const wall of WALLS) {
    await ensureTemplateExists(wall.templateName);
    const { pub, created } = await upsertPublication(wall, 'mur', merchantId);
    console.log(`  ${created ? '+ Créé  ' : '~ MAJ   '} ${wall.customName.padEnd(32)} (${pub._id})`);
    results.walls.push({ ...wall, id: pub._id.toString() });
  }

  console.log('\n── Cartes solo (Cartes Perso) ──');
  for (const card of CARDS) {
    await ensureTemplateExists(card.templateName);
    const { pub, created } = await upsertPublication(card, 'carte', merchantId);
    console.log(`  ${created ? '+ Créé  ' : '~ MAJ   '} ${card.customName.padEnd(32)} (${pub._id})`);
    results.cards.push({ ...card, id: pub._id.toString() });
  }

  const publicBase = process.env.APP_URL
    || (process.env.NODE_ENV === 'production' ? 'https://app.mykado.store' : 'http://localhost:5000');

  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  URLs des murs (à partager pour seeder les mots) :');
  console.log('══════════════════════════════════════════════════════════════');
  for (const w of results.walls) {
    console.log(`  ${w.key.padEnd(20)} → ${publicBase}/site/${w.templateName}/${w.customName}`);
  }
  console.log('\n══════════════════════════════════════════════════════════════');
  console.log('  URLs des cartes solo :');
  console.log('══════════════════════════════════════════════════════════════');
  for (const c of results.cards) {
    console.log(`  ${c.key.padEnd(20)} → ${publicBase}/site/${c.templateName}/${c.customName}`);
  }
  console.log('\n──────────────────────────────────────────────────────────────');
  console.log('  Aperçu iframe landing (mode démo) : mêmes URLs avec ?demo=1');
  console.log('──────────────────────────────────────────────────────────────');

  /* ── Diagnostic « Mes créations » (filter serveur GET /publications?mine=true).
     Reproduit EXACTEMENT la query serveur pour vérifier que le compte admin va
     bien voir les publications qu'on vient de seeder. Si count=0 alors que le
     seed a créé N pubs, c'est presque toujours parce que le JWT actif de l'admin
     est ancien (généré avant que merchantId ne soit set) → logout + re-login. */
  const asMineFilter = { merchantId, isPremade: { $ne: true } };
  const mineCount = await Publication.countDocuments(asMineFilter);
  const mineNames = await Publication.find(asMineFilter).select('customName templateName brique').sort('-updatedAt').lean();
  console.log('\n── Diagnostic « Mes créations » (?mine=true côté API) ──');
  console.log(`  Filter    : { merchantId: "${merchantId}", isPremade: { $ne: true } }`);
  console.log(`  Résultat  : ${mineCount} publication${mineCount > 1 ? 's' : ''} matchent`);
  if (mineCount < results.walls.length + results.cards.length) {
    console.log(`  ⚠  Attendu au moins ${results.walls.length + results.cards.length} (walls+cards seed).`);
  }
  mineNames.slice(0, 20).forEach(p => {
    console.log(`    · ${(p.brique || '?').padEnd(5)} ${(p.templateName || '').padEnd(28)} ${p.customName}`);
  });

  console.log('\n  Si tu ne les vois pas dans le UI « Mes créations » alors que');
  console.log('  ce diagnostic les liste bien → LOGOUT puis re-login : ton cookie');
  console.log('  JWT actuel a été émis avant que merchantId soit set sur ton compte.');
  console.log('  Le nouveau JWT contiendra merchantId et la query côté serveur');
  console.log('  fonctionnera correctement.\n');

  await mongoose.disconnect();
  console.log('Terminé.');
}

seed().catch(e => { console.error(e); process.exit(1); });
