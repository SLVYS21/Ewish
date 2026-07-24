import {
  Cake, Heart, Baby, Waves, Hand, Feather, Sparkles, GraduationCap,
} from 'lucide-react';

/* ─── WALL_EVENTS ─────────────────────────────────────────────
   Repris et enrichi depuis client/pages/TemplatesGallery.jsx.
   Chaque évènement génère titre + phrase d'accueil + confetti
   par défaut, en respectant Smart Defaults (l'utilisateur
   n'a rien à taper pour obtenir un rendu chaleureux).
   ────────────────────────────────────────────────────────── */
export const WALL_EVENTS = [
  {
    id: 'anniversary', label: 'Anniversaire', Icon: Cake, festive: true,
    accent: '#FF5470', tint: 'linear-gradient(135deg,#FFE9EE 0%,#FFC1CB 100%)',
    bannerInk: '#2B2440',
    title:    (n) => `Joyeux anniversaire, ${n || '…'}`,
    subtitle: (n) => `Laisse un mot doux à ${n || 'la personne du jour'} pour son anniversaire.`,
    eyebrow:  'Anniversaire',
    confettiSuggestion: 'emoji_party',
  },
  {
    id: 'wedding', label: 'Mariage', Icon: Heart, festive: true,
    accent: '#FF8DAA', tint: 'linear-gradient(135deg,#FFE9EE 0%,#FFB3C0 100%)',
    bannerInk: '#2B2440',
    title:    (n) => `Le mariage de ${n || '…'}`,
    subtitle: (n) => `Un mot doux pour les jeunes mariés${n ? `, ${n}` : ''}.`,
    eyebrow:  'Mariage',
    confettiSuggestion: 'hearts',
  },
  {
    id: 'birth', label: 'Naissance', Icon: Baby, festive: true,
    accent: '#A9D6FF', tint: 'linear-gradient(135deg,#EAF4FF 0%,#A9D6FF 100%)',
    bannerInk: '#2B2440',
    title:    (n) => `Bienvenue à ${n || 'ce petit bout'}`,
    subtitle: (n) => `Un mot chaleureux pour l'arrivée de ${n || 'ce petit bout'}.`,
    eyebrow:  'Naissance',
    confettiSuggestion: 'stars',
  },
  {
    id: 'farewell', label: 'Pot de départ', Icon: Waves, festive: true,
    accent: '#B59CF0', tint: 'linear-gradient(135deg,#F1EAFB 0%,#B59CF0 100%)',
    bannerInk: '#FFFFFF',
    title:    (n) => `Bon départ, ${n || '…'}`,
    subtitle: (n) => `Un mot pour le nouveau chapitre de ${n || 'notre collègue'}.`,
    eyebrow:  'Pot de départ',
    confettiSuggestion: 'gold_rain',
  },
  {
    id: 'welcome', label: 'Bienvenue', Icon: Hand, festive: true,
    accent: '#7CE0C1', tint: 'linear-gradient(135deg,#E4FBF3 0%,#7CE0C1 100%)',
    bannerInk: '#2B2440',
    title:    (n) => `Bienvenue, ${n || '…'}`,
    subtitle: (n) => `Un mot chaleureux pour l'arrivée de ${n || 'notre nouvelle recrue'}.`,
    eyebrow:  'Bienvenue',
    confettiSuggestion: 'default',
  },
  {
    id: 'graduation', label: 'Diplôme', Icon: GraduationCap, festive: true,
    accent: '#FFC145', tint: 'linear-gradient(135deg,#FFFCF3 0%,#FFC145 100%)',
    bannerInk: '#2B2440',
    title:    (n) => `Bravo ${n || '…'} !`,
    subtitle: (n) => `Un mot pour féliciter ${n || 'notre lauréat'} de sa réussite.`,
    eyebrow:  'Diplôme',
    confettiSuggestion: 'school_pride',
  },
  {
    id: 'thanks', label: 'Remerciement', Icon: Heart, festive: false,
    accent: '#FF5470', tint: 'linear-gradient(135deg,#FFE9EE 0%,#FF5470 100%)',
    bannerInk: '#FFFFFF',
    title:    (n) => `Merci, ${n || '…'}`,
    subtitle: (n) => `Un mot pour dire merci à ${n || 'cette personne'}.`,
    eyebrow:  'Remerciement',
    confettiSuggestion: 'hearts',
  },
  {
    id: 'tribute', label: 'Hommage', Icon: Feather, festive: false,
    accent: '#2B2440', tint: 'linear-gradient(135deg,#F0EEF5 0%,#2B2440 100%)',
    bannerInk: '#FFFFFF',
    title:    (n) => `En mémoire de ${n || '…'}`,
    subtitle: (n) => `Un souvenir, un mot doux pour ${n || 'cette personne'}.`,
    eyebrow:  'Hommage',
    confettiSuggestion: 'default',
  },
  /* "Autre" — filet de sécurité pour toutes les occasions non listées.
     Titre volontairement générique, éditable ensuite dans l'onglet Réglages. */
  {
    id: 'other', label: 'Autre', Icon: Sparkles, festive: true,
    accent: '#B59CF0', tint: 'linear-gradient(135deg,#F1EAFB 0%,#B59CF0 100%)',
    bannerInk: '#FFFFFF',
    title:    (n) => `Un mot pour ${n || '…'}`,
    subtitle: (n) => `Laisse un petit mot doux à ${n || 'cette personne'}.`,
    eyebrow:  '',
    confettiSuggestion: 'default',
  },
];

/* ─── BACKGROUNDS_CATALOG ─────────────────────────────────────
   Backgrounds curated pour l'étape 3 du wizard, alignés sur
   la palette Kado Signature (Indigo / Or / Argile / Stone).
   Chaque preset est utilisable partout : preview + mur destinataire.
   ────────────────────────────────────────────────────────── */
/* Chaque background embarque sa palette :
     ink    = couleur du texte principal sur ce fond
     accent = couleur des CTAs et de la bannière (bouton "Participer", barre cagnotte, etc.)
     size   = mode CSS background-size ('cover' | 'tile')
   Consommé par server/routes/serve.js qui émet --wall-bg, --wall-ink, --wall-accent. */
export const BACKGROUNDS_CATALOG = [
  {
    id: 'bg-blob', label: 'Blob fluide', tab: 'gradient',
    css: 'transparent', ink: '#FFFFFF', accent: '#FF5470', size: 'cover',
    preview: 'linear-gradient(155deg,#243157 0%,#1A234A 45%,#141B3B 100%)',
  },
  {
    id: 'bg-polka', label: 'Vague de pois', tab: 'pattern',
    css: 'transparent', ink: '#453E2E', accent: '#E4922B', size: 'cover',
    preview: 'linear-gradient(160deg,#F0B24C,#E4922B)',
  },
  {
    id: 'bg-bokeh', label: 'Bokeh', tab: 'photo',
    css: 'transparent', ink: '#FFFFFF', accent: '#D6A4DC', size: 'cover',
    preview: 'radial-gradient(120% 90% at 50% 15%,#3A2450 0%,#241634 55%,#160D22 100%)',
  },
  {
    id: 'bg-comic', label: 'Comic burst', tab: 'pattern',
    css: 'transparent', ink: '#161311', accent: '#FF5470', size: 'cover',
    preview: '#F2D24C',
  },
  {
    id: 'bg-synthwave', label: 'Grille synthwave', tab: 'gradient',
    css: 'transparent', ink: '#FFFFFF', accent: '#E8A33D', size: 'cover',
    preview: 'linear-gradient(180deg,#1A1140 0%,#2A1550 46%,#3E1C5E 58%,#160D22 100%)',
  },
  {
    id: 'bg-sunburst', label: 'Sunburst', tab: 'gradient',
    css: 'transparent', ink: '#FFFFFF', accent: '#FFC145', size: 'cover',
    preview: '#1B2450',
  },
];

export const BACKGROUND_TABS = [
  { id: 'gradient', label: 'Dégradés' },
  { id: 'pattern',  label: 'Motifs' },
  { id: 'photo',    label: 'Ambiances' },
  { id: 'plain',    label: 'Unis' },
];

/* null = pas de fond au moment de la création. Les fonds animés du
   catalogue ne sont plus proposés pour le mur lui-même (ils servent
   maintenant en rotation sur les statuts). L'utilisateur choisit un
   fond image dans l'éditeur (Fond du mur) si il le souhaite. */
export const DEFAULT_BACKGROUND_ID = null;

/* ─── Cagnotte presets — Contrast Effect ──────────────────── */
export const CAGNOTTE_PRESETS = [
  { id: 'small',  amount: 10000,  label: 'Petit geste',   hint: 'Un mot doux + petite attention' },
  { id: 'medium', amount: 50000,  label: 'Cadeau marquant', hint: 'Un vrai cadeau, souvenir durable', recommended: true },
  { id: 'big',    amount: 100000, label: 'Cadeau XL',     hint: 'Grande occasion, groupe soudé' },
];

export const DEFAULT_CAGNOTTE_GOAL = 25000;

/* ─── Confetti effects — repris de ConfettiTab.jsx pour éviter
   un import cross-directory dans un composant de wizard ─── */
export const CONFETTI_EFFECTS = [
  { value: 'emoji_party', label: 'Fête festive', desc: 'Emojis colorés qui volent' },
  { value: 'default',     label: 'Classique',    desc: 'Confettis colorés' },
  { value: 'fireworks',   label: "Feux d'artifice", desc: 'Explosions de particules' },
  { value: 'stars',       label: 'Étoiles',      desc: "Pluie d'étoiles dorées" },
  { value: 'hearts',      label: 'Cœurs',        desc: 'Cœurs roses' },
  { value: 'gold_rain',   label: "Pluie d'or",   desc: 'Or et champagne' },
  { value: 'snow',        label: 'Neige',        desc: 'Flocons blancs' },
  { value: 'side_cannons',label: 'Canons',       desc: 'Deux canons latéraux' },
  { value: 'realistic',   label: 'Réaliste',     desc: 'Gravité naturelle' },
  { value: 'school_pride',label: "Couleurs d'équipe", desc: 'Bicolore continu' },
];

export const DEFAULT_CONFETTI = 'emoji_party';

/* ─── Deadline par défaut : J+30 (Smart Default) ─── */
export function defaultDeadlineISO() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().slice(0, 10);
}

/* ─── Template par défaut du wizard ─── */
export const DEFAULT_WALL_TEMPLATE = 'wall-of-wishes';

/* ─── Progress Gradient — Goal Gradient Effect
   Toutes les étapes démarrent au-dessus de 0 (motivation).  */
export const WIZARD_PROGRESS = {
  1: 20,
  2: 35,
  3: 55,
  4: 70,
  5: 85,
  6: 100,
};

/* Utilitaire d'accès rapide */
export const getEvent = (id) =>
  WALL_EVENTS.find((e) => e.id === id) || WALL_EVENTS[0];

export const getBackground = (id) =>
  BACKGROUNDS_CATALOG.find((b) => b.id === id) || BACKGROUNDS_CATALOG[0];
