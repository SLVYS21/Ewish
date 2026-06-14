/**
 * Seed ciblé  birthday uniquement
 * Usage : node server/seeds/seedBirthday.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Template = require('../models/Template');

const birthday = {
  name: 'birthday',
  label: 'Joyeux Anniversaire',
  description: "Animation complète avec photos, musique et vœux personnalisés. L'incontournable.",
  price: 1000,
  creditsRequired: 2,
  emoji: '🎂',
  gradient: 'linear-gradient(135deg,#ffb4d1,#f7d59e)',
  highlights: ['Musique personnalisée (MP3)', '3 styles de typographie', 'Lien privé + QR code'],
  tags: ['anniversaire', 'classique'],
  sortOrder: 1,
  active: true,
  featured: true,
  fields: [
    // ── Intro (primaires) ──
    { key: 'name',           label: 'Prénom du destinataire',    type: 'text',      section: 'Intro',       placeholder: 'Sally',                                                     required: true  },
    { key: 'greeting',       label: "Message d'accueil",         type: 'text',      section: 'Intro',       placeholder: 'Coucou'                                                                         },
    { key: 'greetingText',   label: 'Note personnelle',          type: 'text',      section: 'Intro',       placeholder: "Ma star du jour !"                                                              },

    // ── Musique ──
    { key: 'musicSrc',       label: 'Fichier musical (URL .mp3)',type: 'url',       section: 'Musique',     placeholder: 'https://... .mp3'                                                               },
    { key: 'musicStartTime', label: 'Démarrer à (secondes)',     type: 'starttime', section: 'Musique'                                                                                                    },
    { key: 'albumArt',       label: "Pochette de l'album (URL)", type: 'url',       section: 'Musique',     placeholder: 'https://... .jpg'                                                               },
    { key: 'trackTitle',     label: 'Titre de la musique',       type: 'text',      section: 'Musique',     placeholder: 'Happy Birthday'                                                                 },
    { key: 'trackArtist',    label: 'Artiste',                   type: 'text',      section: 'Musique',     placeholder: 'Naza'                                                                           },
    { key: 'musicHint',      label: 'Indication musique',        type: 'text',      section: 'Musique',     placeholder: "C'est mieux avec de la musique 🎶"                                              },

    // ── Message (primaires) ──
    { key: 'text1',          label: "Accroche principale",       type: 'text',      section: 'Message',     placeholder: "C'est ton anniversaire !!! 🎉"                                                  },
    { key: 'waName',         label: 'Nom du contact WhatsApp',  type: 'text',      section: 'Message',     placeholder: 'Prénom'                                                                         },
    { key: 'textInChatBox',  label: 'Message WhatsApp',          type: 'textarea',  section: 'Message',     placeholder: "Joyeux anniversaire !!! 🎉 Je te souhaite le meileur.."                         },

    // ── Histoire (avancés) ──
    { key: 'text2',          label: "Phrase d'histoire 1",       type: 'text',      section: 'Histoire',    placeholder: "C'est ce que j'allais t'écrire.."                                               },
    { key: 'text3',          label: "Phrase d'histoire 2",       type: 'text',      section: 'Histoire',    placeholder: 'Et puis je me suis arrêté.'                                                     },
    { key: 'text4',          label: "Phrase d'histoire 3",       type: 'text',      section: 'Histoire',    placeholder: "J'ai réalisé que je voulais faire un truc "                                     },
    { key: 'text4Adjective', label: "Mot clé de l'histoire",     type: 'text',      section: 'Histoire',    placeholder: 'Unique'                                                                         },
    { key: 'text5Entry',     label: 'Intro phrase finale',       type: 'text',      section: 'Histoire',    placeholder: 'Parce que,'                                                                     },
    { key: 'text5Content',   label: 'Phrase finale',             type: 'text',      section: 'Histoire',    placeholder: 'Tu es Spéciale'                                                                 },
    { key: 'smiley',         label: 'Emoji principal',           type: 'text',      section: 'Histoire',    placeholder: ':)'                                                                             },
    { key: 'bigTextPart1',   label: 'Première lettre (grande)',  type: 'text',      section: 'Histoire',    placeholder: 'S'                                                                              },
    { key: 'bigTextPart2',   label: 'Deuxième lettre (grande)', type: 'text',      section: 'Histoire',    placeholder: 'O'                                                                              },

    // ── Célébration (avancés) ──
    { key: 'imagePath',      label: 'Photo principale',          type: 'url',       section: 'Célébration', placeholder: 'https://... .jpg'                                                               },
    { key: 'photo1',         label: 'Photo gauche',              type: 'url',       section: 'Célébration', placeholder: 'https://... .jpg'                                                               },
    { key: 'photo2',         label: 'Photo droite',              type: 'url',       section: 'Célébration', placeholder: 'https://... .jpg'                                                               },
    { key: 'imageLayout',    label: 'Disposition photos',        type: 'layout',    section: 'Célébration',
      options: [
        { value: 'grid',      label: 'Grille',  icon: '▦' },
        { value: 'stack',     label: 'Pile',    icon: '⧉' },
        { value: 'spotlight', label: 'Focus',   icon: '◎' },
        { value: 'row',       label: 'Rangée',  icon: '▬' },
      ]
    },

    // ── Vœu (avancés) ──
    { key: 'wishHeading',    label: 'Titre du vœu',              type: 'text',      section: 'Vœu',         placeholder: 'Joyeux Anniversaire !',                           required: true               },
    { key: 'wishText',       label: 'Sous-titre du vœu',         type: 'text',      section: 'Vœu',         placeholder: 'Bel âge à toi !'                                                               },

    // ── Vœux personnels (avancés) ──
    { key: 'wish1',          label: 'Vœu 1',                     type: 'textarea',  section: 'Vœux',        placeholder: 'Ton premier vœu…'                                                               },
    { key: 'wish2',          label: 'Vœu 2',                     type: 'textarea',  section: 'Vœux',        placeholder: 'Ton deuxième vœu…'                                                              },
    { key: 'wish3',          label: 'Vœu 3',                     type: 'textarea',  section: 'Vœux',        placeholder: 'Ton troisième vœu…'                                                             },

    // ── Outro (avancés) ──
    { key: 'outroText',      label: 'Message de fin',            type: 'text',      section: 'Outro',       placeholder: "J'espère que tu as kiffé !"                                                     },
    { key: 'replayText',     label: 'Texte du bouton revoir',    type: 'text',      section: 'Outro',       placeholder: 'Revoir ↺'                                                                       },
    { key: 'outroSmiley',    label: 'Emoji de fin',              type: 'text',      section: 'Outro',       placeholder: ':)'                                                                             },
  ],
  defaultData: {
    greeting:       'Coucou',
    name:           'Sally',
    greetingText:   "Ma star du jour !",
    musicHint:      "C'est mieux avec de la musique 🎶",
    trackTitle:     'Happy Birthday',
    trackArtist:    'Naza',
    text1:          "C'est ton anniversaire !!! 🎉",
    waName:         'Sally',
    waAvatar:       'S',
    textInChatBox:  "Joyeux anniversaire !!! 🎉 Je te souhaite le meileur.. blah blah blah !!",
    text2:          "C'est ce que j'allais t'écrire..",
    text3:          'Et puis je me suis arrêté.',
    text4:          "J'ai réalisé que je voulais faire un truc ",
    text4Adjective: 'Unique',
    text5Entry:     'Parce que,',
    text5Content:   'Tu es Spéciale',
    smiley:         ':)',
    bigTextPart1:   'S',
    bigTextPart2:   'O',
    wishHeading:    'Joyeux Anniversaire !',
    wishText:       'Bel âge à toi !',
    wish1:          'Que cette nouvelle année de ta vie soit remplie de joie, de lumière et de toutes ces petites choses qui font sourire.',
    wish2:          "Tu mérites tout le bonheur du monde, et je souhaite que chaque journée t'apporte quelque chose de beau.",
    wish3:          'Joyeux anniversaire du fond du cœur. 🎂✨',
    outroText:      "J'espère que tu as kiffé !",
    replayText:     'Revoir ↺',
    outroSmiley:    ':)',
  },
  defaultStyle: {
    primaryColor: '#E11D74',
    accentColor:  '#F5B544',
    fontFamily:   'Outfit',
    fontSize:     'medium',
    theme:        'light',
  },
};

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✓ Connecté à MongoDB');

  const t = await Template.findOneAndUpdate(
    { name: 'birthday' },
    birthday,
    { upsert: true, new: true }
  );
  console.log(`✓ Template "birthday" mis à jour (${t.fields.length} champs)`);

  await mongoose.disconnect();
  console.log('Terminé.');
}

seed().catch(e => { console.error(e); process.exit(1); });
