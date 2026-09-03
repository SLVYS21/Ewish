/**
 * Fils narratifs — plusieurs variantes de storytelling par template.
 *
 * Chaque variante remplit un lot de champs `data.*` d'un coup.
 * Utilisée par NarrativeVariantPicker : quand l'utilisateur clique
 * sur une variante, on merge `variant.data` dans le state complet.
 *
 * Ne renseigne QUE les champs narratifs (text1..text5, greetings,
 * outroText, etc). Les champs personnels (name, photos, musique)
 * ne sont jamais touchés par le picker.
 */

const BIRTHDAY_VARIANTS = [
  {
    id: 'classique',
    label: 'Classique',
    tagline: 'Chaleureux et sincère.',
    data: {
      greeting: 'Coucou',
      greetingText: 'Ma star du jour !',
      text1: "C'est ton anniversaire !!! 🎉",
      textInChatBox: "Joyeux anniversaire !!! 🎉 Je te souhaite le meilleur du meilleur pour cette nouvelle année.",
      text2: "C'est ce que j'allais t'écrire..",
      text3: "Et puis je me suis arrêté.",
      text4: "J'ai réalisé que je voulais faire un truc",
      text4Adjective: 'Unique',
      text5Entry: 'Parce que,',
      text5Content: 'Tu es Spéciale',
      smiley: ':)',
      outroText: "J'espère que tu as kiffé !",
      replayText: 'Revoir ↺',
      outroSmiley: ':)',
    },
  },
  {
    id: 'complice',
    label: 'Complice',
    tagline: 'Ton pote pour la vie.',
    data: {
      greeting: 'Yo',
      greetingText: "T'es prêt·e pour ta journée de star ?",
      text1: "C'est LE grand jour 🎂",
      textInChatBox: "Joyeux anniv frérot / soeurette 🎊 Que cette année déchire encore plus que la précédente. Grosse pensée pour toi.",
      text2: "Je voulais te faire un truc classe.",
      text3: "Genre un post Instagram avec une belle légende.",
      text4: "Puis j'ai pensé mieux : quelque chose de",
      text4Adjective: 'inoubliable',
      text5Entry: 'Parce que franchement,',
      text5Content: 'Tu le mérites',
      smiley: '🔥',
      outroText: "Passe une journée à ton image : incroyable.",
      replayText: 'Rembobiner ↺',
      outroSmiley: '🥂',
    },
  },
  {
    id: 'tendre',
    label: 'Tendre',
    tagline: 'Doux, sensible, sincère.',
    data: {
      greeting: 'Mon soleil,',
      greetingText: "Aujourd'hui, c'est toi qu'on célèbre.",
      text1: "Ton anniversaire, ça compte 💛",
      textInChatBox: "Joyeux anniversaire du fond du coeur. Merci d'exister, merci d'être toi. Que cette année t'apporte tout ce que tu mérites.",
      text2: "J'ai cherché les bons mots.",
      text3: "Mais aucun ne rendait justice.",
      text4: "Alors je vais te le dire simplement, tu es",
      text4Adjective: 'précieux·se',
      text5Entry: 'Et je voulais juste te rappeler,',
      text5Content: 'Que tu es aimé·e',
      smiley: '💛',
      outroText: 'Prends soin de toi, toujours.',
      replayText: 'Revoir la surprise ↺',
      outroSmiley: '🌻',
    },
  },
];

const NOTRE_FILM_VARIANTS = [
  {
    id: 'romance',
    label: 'Romance',
    tagline: 'Notre histoire à deux.',
    data: {
      greeting: 'Ce film est pour toi.',
      text2: 'Il était une fois...',
      text3: 'Une rencontre qui a tout changé.',
      text4Adjective: 'inoubliable',
      text5Content: 'Notre film, notre histoire.',
      wishText: 'Avec tout mon amour 🎬',
      outroText: 'Fin. (Ou plutôt : à suivre…)',
      replayText: '↺ Revoir le film',
    },
  },
  {
    id: 'hommage-famille',
    label: 'Hommage familial',
    tagline: 'Pour les parents ou grands-parents.',
    data: {
      greeting: 'Ce film retrace notre parcours ensemble.',
      text2: 'Il y a des personnes...',
      text3: "Qui construisent nos souvenirs les plus précieux.",
      text4Adjective: 'essentielles',
      text5Content: "Merci pour tout ce que tu nous transmets.",
      wishText: 'De la part de toute la famille ❤️',
      outroText: 'Et l\'histoire continue.',
      replayText: '↺ Revoir',
    },
  },
  {
    id: 'aventure-amis',
    label: 'Aventure entre amis',
    tagline: 'Le crew, les souvenirs, les fous rires.',
    data: {
      greeting: 'Générique de notre bande.',
      text2: 'Ça a commencé par une soirée...',
      text3: 'Et depuis, on ne s\'est plus lâchés.',
      text4Adjective: 'iconique',
      text5Content: 'Le crew qui déchire tout.',
      wishText: "On t'aime fort — la team 🎬",
      outroText: 'À la prochaine aventure.',
      replayText: '↺ Revoir',
    },
  },
];

const FOREVER_VARIANTS = [
  {
    id: 'hommage-classique',
    label: 'Hommage classique',
    tagline: 'Sobre et intemporel.',
    data: {
      greeting: 'En mémoire de',
      greetingText: "Une présence qui reste, toujours.",
      countdownLabel: 'Nous pensons à toi depuis',
      countdownUnit: 'jours',
      countdownSince: 'et pour toujours',
      photoCaption: "Ton sourire, gravé à jamais.",
      photoSub: 'et dans chacun de nos souvenirs',
      senderName: 'Ceux qui t\'aiment',
      outroText: 'Toujours dans nos cœurs.',
      replayText: 'Revoir',
    },
  },
  {
    id: 'celebration-vie',
    label: 'Célébration d\'une vie',
    tagline: 'Focus sur la lumière laissée.',
    data: {
      greeting: 'Pour célébrer',
      greetingText: "Une vie qui a marqué la nôtre.",
      countdownLabel: 'Éclat vécu depuis',
      countdownUnit: 'jours',
      countdownSince: 'et rayonnant encore',
      photoCaption: 'Ton énergie, ton rire, ta manière d\'être.',
      photoSub: 'nous accompagnent tous les jours',
      senderName: 'La famille & les proches',
      outroText: 'Merci d\'avoir été là.',
      replayText: 'Revoir',
    },
  },
  {
    id: 'anniversaire-absence',
    label: 'Anniversaire (absence)',
    tagline: 'Pour un anniversaire à distance ou en souvenir.',
    data: {
      greeting: 'Joyeux anniversaire,',
      greetingText: "Où que tu sois, on pense à toi.",
      countdownLabel: 'Ensemble depuis',
      countdownUnit: 'jours',
      countdownSince: 'et pour longtemps encore',
      photoCaption: "Notre plus belle photo de toi.",
      photoSub: 'à chaque regard',
      senderName: 'De ceux qui t\'aiment',
      outroText: 'Gros bisous à toi.',
      replayText: 'Recommencer',
    },
  },
];

/**
 * Map exportée : templateName → tableau de variantes.
 * Utilisé par NarrativeVariantPicker et par ContentTab.
 */
export const NARRATIVE_VARIANTS = {
  'birthday':   BIRTHDAY_VARIANTS,
  'notre-film': NOTRE_FILM_VARIANTS,
  'forever':    FOREVER_VARIANTS,
};

/**
 * Retourne l'ID de la variante active en scannant les champs
 * du data actuel (correspondance sur greeting + text2 principalement).
 * Utile pour pré-sélectionner le bon bouton dans le picker.
 */
export function detectActiveVariant(templateName, data) {
  const variants = NARRATIVE_VARIANTS[templateName];
  if (!variants || !data) return null;
  for (const v of variants) {
    const sample = v.data.greeting || v.data.text2 || '';
    if (sample && (data.greeting === v.data.greeting || data.text2 === v.data.text2)) {
      return v.id;
    }
  }
  return null;
}
