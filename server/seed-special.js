require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wishwell';

const specialTemplate = {
  name: 'special',
  label: 'Recherche Google',
  description: 'Une simulation de recherche Google qui révèle que tu es le #1 résultat mondial.',
  thumbnail: '/thumbnails/special.png',
  defaultStyle: {
    primaryColor: '#ff69b4',
    accentColor: '#ffb347',
    fontFamily: 'Work Sans',
    fontSize: 'medium',
    theme: 'light',
  },
  defaultData: {
    // Intro
    greeting: 'Hiya',
    name: 'Lydia',
    greetingText: 'I really like your name btw!',

    // Music
    musicSrc: '',
    albumArt: '',
    trackTitle: 'Notre chanson',
    trackArtist: 'Artiste',
    musicHint: "C'est mieux avec de la musique 🎶",

    // Transition
    text1: 'On a fait une recherche… 🔍',

    // Google section
    searchQuery: 'meilleure maman du monde',
    searchResultCount: '4 180 000 000',
    searchTime: '0,42',

    // Result 1 (featured)
    result1Domain: 'levivant.monde',
    result1Title: 'La meilleure maman du monde entier',
    result1Snippet: 'Après une analyse approfondie de 7,9 milliards de personnes, les résultats sont sans appel. Son amour, sa force et sa douceur la placent au sommet de tous les classements connus.',
    result1Rating: '5,0 · Note de l\'univers entier',
    resultImage: '',  // photo in the featured snippet

    // Result 2
    result2Domain: 'wikipedia.org',
    result2Title: 'Définition de "parfaite" — voir aussi : elle',
    result2Snippet: 'Les dictionnaires du monde entier ont récemment mis à jour leur définition de "parfaite" pour y inclure une photo. Les linguistes sont unanimes.',

    // Result 3
    result3Domain: 'guinnessrecords.com',
    result3Title: 'Record mondial officiel — Personne la plus formidable',
    result3Snippet: 'Le Guinness World Records certifie officiellement qu\'aucune méthode connue ne permet de mesurer l\'étendue totale de sa gentillesse. Catégorie : hors-norme.',

    // Story
    text2: 'On a cherché partout.',
    text3: 'Des milliards de résultats.',
    text4: 'Et le premier résultat, c\'était',
    text4Adjective: 'toi',
    text5Entry: 'Parce que,',
    text5Content: 'Tu es unique',
    smiley: ':)',
    bigTextPart1: 'S',
    bigTextPart2: 'O',

    // Celebration
    imagePath: '',
    photo1: '',
    photo2: '',
    wishHeading: 'Joyeux Anniversaire !',
    wishText: 'Le #1 résultat de ma vie 🏆',

    // Wishes
    wish1: 'Que cette nouvelle année soit aussi belle que le sourire que tu portes chaque jour.',
    wish2: 'Tu mérites tout le bonheur du monde — et l\'univers entier le sait.',
    wish3: 'Joyeux anniversaire du fond du cœur. 🎂✨',

    // Outro
    outroText: 'Reviens me dire si tu as aimé.',
    replayText: 'Clique pour revoir.',
    outroSmiley: ':)',
  },
  fields: [
    // ── Intro ──
    { key: 'greeting',     label: 'Salutation',        type: 'text',     placeholder: 'Hiya',   section: 'Intro' },
    { key: 'name',         label: 'Prénom',             type: 'text',     placeholder: 'Lydia',  section: 'Intro', required: true },
    { key: 'greetingText', label: 'Note personnelle',   type: 'text',     placeholder: "I really like your name btw!", section: 'Intro' },

    // ── Musique ──
    { key: 'musicSrc',    label: 'URL du fichier audio', type: 'url',  placeholder: 'https://... .mp3', section: 'Musique' },
    { key: 'albumArt',    label: 'Pochette album',       type: 'url',  placeholder: 'https://... .jpg', section: 'Musique' },
    { key: 'trackTitle',  label: 'Titre',                type: 'text', placeholder: 'Notre chanson',   section: 'Musique' },
    { key: 'trackArtist', label: 'Artiste',              type: 'text', placeholder: 'Artiste',          section: 'Musique' },
    { key: 'musicHint',   label: 'Texte d\'accroche',   type: 'text', placeholder: "C'est mieux avec de la musique 🎶", section: 'Musique' },

    // ── Recherche Google ──
    { key: 'searchQuery',       label: 'Requête de recherche',    type: 'text',     placeholder: 'meilleure maman du monde',    section: 'Google', required: true },
    { key: 'searchResultCount', label: 'Nombre de résultats',     type: 'text',     placeholder: '4 180 000 000',               section: 'Google' },
    { key: 'searchTime',        label: 'Temps de recherche (s)',  type: 'text',     placeholder: '0,42',                        section: 'Google' },

    // ── Résultat #1 ──
    { key: 'result1Domain',  label: 'Domaine #1',           type: 'text',     placeholder: 'levivant.monde',  section: 'Résultat #1' },
    { key: 'result1Title',   label: 'Titre #1',             type: 'text',     placeholder: 'La meilleure maman…', section: 'Résultat #1', required: true },
    { key: 'result1Snippet', label: 'Description #1',       type: 'textarea', placeholder: 'Après une analyse…', section: 'Résultat #1' },
    { key: 'result1Rating',  label: 'Note affichée',        type: 'text',     placeholder: '5,0 · Note de l\'univers entier', section: 'Résultat #1' },
    { key: 'resultImage',    label: 'Photo dans le résultat #1', type: 'url', placeholder: 'https://... .jpg', section: 'Résultat #1' },

    // ── Résultat #2 ──
    { key: 'result2Domain',  label: 'Domaine #2',   type: 'text',     placeholder: 'wikipedia.org',    section: 'Résultat #2' },
    { key: 'result2Title',   label: 'Titre #2',     type: 'text',     placeholder: 'Définition de "parfaite"…', section: 'Résultat #2' },
    { key: 'result2Snippet', label: 'Description #2', type: 'textarea', placeholder: 'Les dictionnaires…', section: 'Résultat #2' },

    // ── Résultat #3 ──
    { key: 'result3Domain',  label: 'Domaine #3',   type: 'text',     placeholder: 'guinnessrecords.com', section: 'Résultat #3' },
    { key: 'result3Title',   label: 'Titre #3',     type: 'text',     placeholder: 'Record mondial…',    section: 'Résultat #3' },
    { key: 'result3Snippet', label: 'Description #3', type: 'textarea', placeholder: 'Le Guinness World Records…', section: 'Résultat #3' },

    // ── Narration ──
    { key: 'text1',         label: 'Annonce transition',  type: 'text', placeholder: 'On a fait une recherche… 🔍', section: 'Narration' },
    { key: 'text2',         label: 'Ligne 1',             type: 'text', placeholder: 'On a cherché partout.',       section: 'Narration' },
    { key: 'text3',         label: 'Ligne 2',             type: 'text', placeholder: 'Des milliards de résultats.',  section: 'Narration' },
    { key: 'text4',         label: 'Ligne 3',             type: 'text', placeholder: "Et le premier résultat, c'était", section: 'Narration' },
    { key: 'text4Adjective',label: 'Mot mis en avant',    type: 'text', placeholder: 'toi',                        section: 'Narration' },
    { key: 'text5Entry',    label: 'Mot de transition',   type: 'text', placeholder: 'Parce que,',                 section: 'Narration' },
    { key: 'text5Content',  label: 'Grande affirmation',  type: 'text', placeholder: 'Tu es unique',               section: 'Narration' },

    // ── Célébration ──
    { key: 'imagePath',   label: 'Photo principale',    type: 'url',  placeholder: 'https://... .jpg', section: 'Célébration' },
    { key: 'photo1',      label: 'Photo gauche',        type: 'url',  placeholder: 'https://... .jpg', section: 'Célébration' },
    { key: 'photo2',      label: 'Photo droite',        type: 'url',  placeholder: 'https://... .jpg', section: 'Célébration' },
    { key: 'wishHeading', label: 'Titre de célébration', type: 'text', placeholder: 'Joyeux Anniversaire !', section: 'Célébration', required: true },
    { key: 'wishText',    label: 'Sous-titre',          type: 'text', placeholder: 'Le #1 résultat de ma vie 🏆', section: 'Célébration' },

    // ── Vœux ──
    { key: 'wish1', label: 'Vœu 1', type: 'textarea', placeholder: 'Premier vœu...', section: 'Vœux' },
    { key: 'wish2', label: 'Vœu 2', type: 'textarea', placeholder: 'Deuxième vœu...', section: 'Vœux' },
    { key: 'wish3', label: 'Vœu 3', type: 'textarea', placeholder: 'Troisième vœu...', section: 'Vœux' },

    // ── Outro ──
    { key: 'outroText',  label: 'Texte final',   type: 'text', placeholder: 'Reviens me dire si tu as aimé.', section: 'Outro' },
    { key: 'replayText', label: 'Texte replay',  type: 'text', placeholder: 'Clique pour revoir.', section: 'Outro' },
  ],
};

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  const t = await Template.findOneAndUpdate(
    { name: 'special' },
    specialTemplate,
    { upsert: true, new: true }
  );
  console.log('✅ Seeded template:', t.name);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });