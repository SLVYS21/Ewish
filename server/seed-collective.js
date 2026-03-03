require('dotenv').config();
const mongoose = require('mongoose');
const Template = require('./models/Template');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/wishwell';

const COMMON_COLLECTIVE_FIELDS = [
  // Intro
  { key: 'greeting',     label: 'Salutation',         type: 'text',     placeholder: 'Hiya',          section: 'Intro' },
  { key: 'name',         label: 'Prénom destinataire', type: 'text',     placeholder: 'Lydia',         section: 'Intro', required: true },
  { key: 'greetingText', label: 'Note d\'ouverture',   type: 'text',     placeholder: 'On t\'aime tellement !', section: 'Intro' },
  // Musique
  { key: 'musicSrc',    label: 'URL audio',     type: 'url',  placeholder: 'https://…mp3', section: 'Musique' },
  { key: 'albumArt',    label: 'Pochette',      type: 'url',  placeholder: 'https://…jpg', section: 'Musique' },
  { key: 'trackTitle',  label: 'Titre',         type: 'text', placeholder: 'Notre chanson', section: 'Musique' },
  { key: 'trackArtist', label: 'Artiste',       type: 'text', placeholder: 'Artiste',       section: 'Musique' },
  { key: 'musicHint',   label: 'Texte d\'accroche', type: 'text', placeholder: "C'est mieux avec de la musique 🎶", section: 'Musique' },
  // Groupe
  { key: 'groupName',    label: 'Nom du groupe',   type: 'text',     placeholder: 'La famille',        section: 'Groupe', required: true },
  { key: 'groupMessage', label: 'Message du groupe', type: 'textarea', placeholder: 'On s\'est réunis pour…', section: 'Groupe' },
  { key: 'groupEmojis',  label: 'Émojis décoratifs', type: 'text',     placeholder: '🥰 🎂 🎊',          section: 'Groupe' },
  // Narration
  { key: 'text2',         label: 'Ligne 1',             type: 'text', placeholder: 'On a cherché les mots.',        section: 'Narration' },
  { key: 'text3',         label: 'Ligne 2',             type: 'text', placeholder: 'On en a trouvé beaucoup.',      section: 'Narration' },
  { key: 'text4',         label: 'Ligne 3',             type: 'text', placeholder: "Mais surtout, on voulait dire", section: 'Narration' },
  { key: 'text4Adjective',label: 'Mot mis en avant',    type: 'text', placeholder: 'merci',                        section: 'Narration' },
  { key: 'text5Entry',    label: 'Transition',          type: 'text', placeholder: 'Parce que,',                   section: 'Narration' },
  { key: 'text5Content',  label: 'Grande affirmation',  type: 'text', placeholder: 'Tu es irremplaçable',          section: 'Narration' },
  // Célébration
  { key: 'imagePath',   label: 'Photo principale',  type: 'url',  placeholder: 'https://…jpg', section: 'Célébration' },
  { key: 'photo1',      label: 'Photo pellicule 1', type: 'url',  placeholder: 'https://…jpg', section: 'Célébration' },
  { key: 'photo2',      label: 'Photo pellicule 2', type: 'url',  placeholder: 'https://…jpg', section: 'Célébration' },
  { key: 'wishHeading', label: 'Titre principal',   type: 'text', placeholder: 'Joyeux Anniversaire !', section: 'Célébration', required: true },
  { key: 'wishText',    label: 'Sous-titre',        type: 'text', placeholder: 'De toute la famille avec amour 💖', section: 'Célébration' },
  // Carousel vœux
  { key: 'carouselTitle', label: 'Titre du carousel', type: 'text', placeholder: "Ce qu'ils ont voulu te dire 💌", section: 'Vœux collectifs' },
  // Outro
  { key: 'outroText',  label: 'Texte final',  type: 'text', placeholder: 'Reviens nous dire si tu as aimé.', section: 'Outro' },
  { key: 'replayText', label: 'Texte replay', type: 'text', placeholder: 'Clique pour revoir ↺',            section: 'Outro' },
  { key: 'outroSmiley',label: 'Symbole final',type: 'text', placeholder: '🥰',                              section: 'Outro' },
];

const templates = [
  {
    name: 'collective-family',
    label: 'Collectif — Famille & Amis',
    description: 'Un cadeau de groupe chaleureux avec carousel de vœux personnels. Parfait pour famille, amis proches, groupe scolaire.',
    thumbnail: '/thumbnails/collective-family.png',
    collectEnabled: true,
    defaultStyle: {
      primaryColor: '#ff69b4',
      accentColor: '#ffb347',
      fontFamily: 'Nunito',
      fontSize: 'medium',
      theme: 'light',
    },
    defaultData: {
      greeting: 'Hiya', name: 'Lydia', greetingText: 'On t\'aime tellement !',
      musicSrc: '', albumArt: '', trackTitle: 'Notre chanson', trackArtist: 'Artiste',
      musicHint: "C'est mieux avec de la musique 🎶",
      groupName: 'La famille', groupMessage: 'On s\'est tous réunis pour te dire quelque chose d\'important…', groupEmojis: '🥰 🎂 🎊',
      text2: 'On a cherché les mots.', text3: 'On en a trouvé beaucoup.',
      text4: 'Mais surtout, on voulait dire', text4Adjective: 'merci',
      text5Entry: 'Parce que,', text5Content: 'Tu es irremplaçable', smiley: '🥹',
      bigTextPart1: 'S', bigTextPart2: 'O',
      imagePath: '', photo1: '', photo2: '',
      wishHeading: 'Joyeux Anniversaire !', wishText: 'De toute la famille avec amour 💖',
      carouselTitle: 'Ce qu\'ils ont voulu te dire 💌',
      outroText: 'Reviens nous dire si tu as aimé.', replayText: 'Clique pour revoir ↺', outroSmiley: '🥰',
    },
    fields: COMMON_COLLECTIVE_FIELDS,
  },
  {
    name: 'collective-pro',
    label: 'Collectif — Professionnel',
    description: 'Un hommage élégant de toute une équipe. Typographie serif, palette navy/or. Idéal pour collègue, patron, départ en retraite.',
    thumbnail: '/thumbnails/collective-pro.png',
    collectEnabled: true,
    defaultStyle: {
      primaryColor: '#1e3a5f',
      accentColor: '#c9a84c',
      fontFamily: 'Lora',
      fontSize: 'medium',
      theme: 'dark',
    },
    defaultData: {
      greeting: 'Cher', name: 'Alexandre', greetingText: 'Nous tenions à marquer ce moment.',
      musicSrc: '', albumArt: '', trackTitle: 'Un morceau pour vous', trackArtist: 'Sélection de l\'équipe',
      musicHint: 'Prenez un moment pour écouter 🎵',
      groupName: 'L\'équipe Marketing', groupMessage: 'Nous nous sommes réunis pour vous adresser quelques mots qui viennent du cœur.', groupEmojis: '',
      text2: 'Nous avons cherché les mots justes.', text3: 'Nous en avons trouvé beaucoup.',
      text4: 'Mais ce qui compte vraiment, c\'est', text4Adjective: 'vous',
      text5Entry: 'Car,', text5Content: 'Votre présence compte', smiley: '.',
      bigTextPart1: 'M', bigTextPart2: 'R',
      imagePath: '', photo1: '', photo2: '',
      wishHeading: 'Joyeux Anniversaire', wishText: 'Avec toute notre considération',
      carouselTitle: 'Ce que l\'équipe a voulu vous dire',
      outroText: 'Nous espérons que ce moment vous a touché.', replayText: '↺ Revoir', outroSmiley: '✦',
    },
    fields: COMMON_COLLECTIVE_FIELDS.map(f => ({
      ...f,
      placeholder: f.key === 'groupEmojis' ? '(optionnel pour le contexte pro)' : f.placeholder,
    })),
  },
];

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  for (const t of templates) {
    const result = await Template.findOneAndUpdate({ name: t.name }, t, { upsert: true, new: true });
    console.log(`✅ Seeded: ${result.name}`);
  }
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });