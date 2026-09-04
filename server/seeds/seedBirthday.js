/**
 * Seed ciblÃ©  birthday uniquement
 * Usage : node server/seeds/seedBirthday.js
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Template = require('../models/Template');

const birthday = {
  name: 'birthday',
  label: 'Joyeux Anniversaire',
  description: "Animation complÃ¨te avec photos, musique et vÅ“ux personnalisÃ©s. L'incontournable.",
  price: 1000,
  priceFCFA: 1000,
  emoji: 'ðŸŽ‚',
  gradient: 'linear-gradient(135deg,#ffb4d1,#f7d59e)',
  highlights: ['Musique personnalisÃ©e (MP3)', '3 styles de typographie', 'Lien privÃ© + QR code'],
  tags: ['anniversaire', 'classique'],
  sortOrder: 1,
  active: true,
  featured: true,
  fields: [
    // â”€â”€ Intro (primaires) â”€â”€
    { key: 'name',           label: 'PrÃ©nom du destinataire',    type: 'text',      section: 'Intro',       placeholder: 'Sally',                                                     required: true  },
    { key: 'greeting',       label: "Message d'accueil",         type: 'text',      section: 'Intro',       placeholder: 'Coucou'                                                                         },
    { key: 'greetingText',   label: 'Note personnelle',          type: 'text',      section: 'Intro',       placeholder: "Ma star du jour !"                                                              },

    // â”€â”€ Musique â”€â”€
    { key: 'musicSrc',       label: 'Fichier musical (URL .mp3)',type: 'url',       section: 'Musique',     placeholder: 'https://... .mp3'                                                               },
    { key: 'musicStartTime', label: 'DÃ©marrer Ã  (secondes)',     type: 'starttime', section: 'Musique'                                                                                                    },
    { key: 'albumArt',       label: "Pochette de l'album (URL)", type: 'url',       section: 'Musique',     placeholder: 'https://... .jpg'                                                               },
    { key: 'trackTitle',     label: 'Titre de la musique',       type: 'text',      section: 'Musique',     placeholder: 'Happy Birthday'                                                                 },
    { key: 'trackArtist',    label: 'Artiste',                   type: 'text',      section: 'Musique',     placeholder: 'Naza'                                                                           },
    { key: 'musicHint',      label: 'Indication musique',        type: 'text',      section: 'Musique',     placeholder: "C'est mieux avec de la musique ðŸŽ¶"                                              },

    // â”€â”€ Message (primaires) â”€â”€
    { key: 'text1',          label: "Accroche principale",       type: 'text',      section: 'Message',     placeholder: "C'est ton anniversaire !!! ðŸŽ‰"                                                  },
    { key: 'waName',         label: 'Nom du contact WhatsApp',  type: 'text',      section: 'Message',     placeholder: 'PrÃ©nom'                                                                         },
    { key: 'textInChatBox',  label: 'Message WhatsApp',          type: 'textarea',  section: 'Message',     placeholder: "Joyeux anniversaire !!! ðŸŽ‰ Je te souhaite le meileur.."                         },

    // â”€â”€ Histoire (avancÃ©s) â”€â”€
    { key: 'text2',          label: "Phrase d'histoire 1",       type: 'text',      section: 'Histoire',    placeholder: "C'est ce que j'allais t'Ã©crire.."                                               },
    { key: 'text3',          label: "Phrase d'histoire 2",       type: 'text',      section: 'Histoire',    placeholder: 'Et puis je me suis arrÃªtÃ©.'                                                     },
    { key: 'text4',          label: "Phrase d'histoire 3",       type: 'text',      section: 'Histoire',    placeholder: "J'ai rÃ©alisÃ© que je voulais faire un truc "                                     },
    { key: 'text4Adjective', label: "Mot clÃ© de l'histoire",     type: 'text',      section: 'Histoire',    placeholder: 'Unique'                                                                         },
    { key: 'text5Entry',     label: 'Intro phrase finale',       type: 'text',      section: 'Histoire',    placeholder: 'Parce que,'                                                                     },
    { key: 'text5Content',   label: 'Phrase finale',             type: 'text',      section: 'Histoire',    placeholder: 'Tu es SpÃ©ciale'                                                                 },
    { key: 'smiley',         label: 'Emoji principal',           type: 'text',      section: 'Histoire',    placeholder: ':)'                                                                             },
    { key: 'bigTextPart1',   label: 'PremiÃ¨re lettre (grande)',  type: 'text',      section: 'Histoire',    placeholder: 'S'                                                                              },
    { key: 'bigTextPart2',   label: 'DeuxiÃ¨me lettre (grande)', type: 'text',      section: 'Histoire',    placeholder: 'O'                                                                              },

    // â”€â”€ CÃ©lÃ©bration (avancÃ©s) â”€â”€
    { key: 'imagePath',      label: 'Photo principale',          type: 'url',       section: 'CÃ©lÃ©bration', placeholder: 'https://... .jpg'                                                               },
    { key: 'photo1',         label: 'Photo gauche',              type: 'url',       section: 'CÃ©lÃ©bration', placeholder: 'https://... .jpg'                                                               },
    { key: 'photo2',         label: 'Photo droite',              type: 'url',       section: 'CÃ©lÃ©bration', placeholder: 'https://... .jpg'                                                               },
    { key: 'imageLayout',    label: 'Disposition photos',        type: 'layout',    section: 'CÃ©lÃ©bration',
      options: [
        { value: 'grid',      label: 'Grille',  icon: 'â–¦' },
        { value: 'stack',     label: 'Pile',    icon: 'â§‰' },
        { value: 'spotlight', label: 'Focus',   icon: 'â—Ž' },
        { value: 'row',       label: 'RangÃ©e',  icon: 'â–¬' },
      ]
    },

    // â”€â”€ VÅ“u (avancÃ©s) â”€â”€
    { key: 'wishHeading',    label: 'Titre du vÅ“u',              type: 'text',      section: 'VÅ“u',         placeholder: 'Joyeux Anniversaire !',                           required: true               },
    { key: 'wishText',       label: 'Sous-titre du vÅ“u',         type: 'text',      section: 'VÅ“u',         placeholder: 'Bel Ã¢ge Ã  toi !'                                                               },

    // â”€â”€ VÅ“ux personnels (avancÃ©s) â”€â”€
    { key: 'wish1',          label: 'VÅ“u 1',                     type: 'textarea',  section: 'VÅ“ux',        placeholder: 'Ton premier vÅ“uâ€¦'                                                               },
    { key: 'wish2',          label: 'VÅ“u 2',                     type: 'textarea',  section: 'VÅ“ux',        placeholder: 'Ton deuxiÃ¨me vÅ“uâ€¦'                                                              },
    { key: 'wish3',          label: 'VÅ“u 3',                     type: 'textarea',  section: 'VÅ“ux',        placeholder: 'Ton troisiÃ¨me vÅ“uâ€¦'                                                             },

    // â”€â”€ Outro (avancÃ©s) â”€â”€
    { key: 'outroText',      label: 'Message de fin',            type: 'text',      section: 'Outro',       placeholder: "J'espÃ¨re que tu as kiffÃ© !"                                                     },
    { key: 'replayText',     label: 'Texte du bouton revoir',    type: 'text',      section: 'Outro',       placeholder: 'Revoir â†º'                                                                       },
    { key: 'outroSmiley',    label: 'Emoji de fin',              type: 'text',      section: 'Outro',       placeholder: ':)'                                                                             },
  ],
  defaultData: {
    greeting:       'Coucou',
    name:           'Sally',
    greetingText:   "Ma star du jour !",
    musicHint:      "C'est mieux avec de la musique ðŸŽ¶",
    trackTitle:     'Happy Birthday',
    trackArtist:    'Naza',
    text1:          "C'est ton anniversaire !!! ðŸŽ‰",
    waName:         'Sally',
    waAvatar:       'S',
    textInChatBox:  "Joyeux anniversaire !!! ðŸŽ‰ Je te souhaite le meileur.. blah blah blah !!",
    text2:          "C'est ce que j'allais t'Ã©crire..",
    text3:          'Et puis je me suis arrÃªtÃ©.',
    text4:          "J'ai rÃ©alisÃ© que je voulais faire un truc ",
    text4Adjective: 'Unique',
    text5Entry:     'Parce que,',
    text5Content:   'Tu es SpÃ©ciale',
    smiley:         ':)',
    bigTextPart1:   'S',
    bigTextPart2:   'O',
    wishHeading:    'Joyeux Anniversaire !',
    wishText:       'Bel Ã¢ge Ã  toi !',
    wish1:          'Que cette nouvelle annÃ©e de ta vie soit remplie de joie, de lumiÃ¨re et de toutes ces petites choses qui font sourire.',
    wish2:          "Tu mÃ©rites tout le bonheur du monde, et je souhaite que chaque journÃ©e t'apporte quelque chose de beau.",
    wish3:          'Joyeux anniversaire du fond du cÅ“ur. ðŸŽ‚âœ¨',
    outroText:      "J'espÃ¨re que tu as kiffÃ© !",
    replayText:     'Revoir â†º',
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
  console.log('âœ“ ConnectÃ© Ã  MongoDB');

  const t = await Template.findOneAndUpdate(
    { name: 'birthday' },
    birthday,
    { upsert: true, new: true }
  );
  console.log(`âœ“ Template "birthday" mis Ã  jour (${t.fields.length} champs)`);

  await mongoose.disconnect();
  console.log('TerminÃ©.');
}

seed().catch(e => { console.error(e); process.exit(1); });
