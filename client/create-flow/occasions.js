/* Occasions partagées entre QuickCreate, QuickCreateWall et le nouveau
   wizard /create (InfoStep). `noto` = clé NotoEmoji (Google Noto Animated).
   `titleFor` génère le titre par défaut à partir du prénom du destinataire.
   `tpl` = template solo par défaut (utilisé par QuickCreate — pas par /create). */
export const OCCASIONS = [
  {
    id: 'anniversary',
    label: 'Anniversaire',
    noto: 'birthday-cake',
    tpl: 'birthday',
    titleFor: (n) => `Joyeux anniversaire, ${n}`,
  },
  {
    id: 'wedding',
    label: 'Mariage',
    noto: 'ring',
    tpl: 'forever',
    titleFor: (n) => `Heureux Mariage ${n}`,
  },
  {
    id: 'birth',
    label: 'Baptême',
    noto: 'baby',
    tpl: 'collective-family',
    titleFor: (n) => `Bienvenue à ${n}`,
  },
  {
    id: 'farewell',
    label: 'Pot de départ',
    noto: 'clinking-glasses',
    tpl: 'collective-pro',
    titleFor: (n) => `Bon départ, ${n}`,
  },
  {
    id: 'welcome',
    label: 'Bienvenue équipe',
    noto: 'waving-hand',
    tpl: 'special',
    titleFor: (n) => `Bienvenue, ${n}`,
  },
  {
    id: 'thanks',
    label: 'Remerciement',
    noto: 'red-heart',
    tpl: 'envelope',
    titleFor: (n) => `Merci, ${n}`,
  },
  {
    id: 'tribute',
    label: 'Hommage',
    noto: 'dove',
    tpl: 'sanctuary',
    titleFor: (n) => `En mémoire de ${n}`,
  },
  {
    id: 'other',
    label: 'Autre',
    noto: 'sparkles',
    tpl: 'booklet',
    titleFor: (n) => `Pour ${n}`,
  },
];

export const OCC_BY_ID = Object.fromEntries(OCCASIONS.map((o) => [o.id, o]));
