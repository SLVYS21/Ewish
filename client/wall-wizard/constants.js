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
  /* Dégradés — Aurore Kado (rose→or) est le Smart Default */
  {
    id: 'aurore-kado', label: 'Aurore Kado', tab: 'gradient',
    css: 'linear-gradient(135deg, #FF5470 0%, #FF8DAA 55%, #FFC145 100%)',
    ink: '#FFFFFF', accent: '#FF5470', size: 'cover',
    preview: 'linear-gradient(135deg, #FF5470 0%, #FF8DAA 55%, #FFC145 100%)',
  },
  {
    id: 'rose-blush', label: 'Rose blush', tab: 'gradient',
    css: 'linear-gradient(135deg, #FFFAFB 0%, #FFE9EE 55%, #FFB3C0 100%)',
    ink: '#2B2440', accent: '#FF5470', size: 'cover',
    preview: 'linear-gradient(135deg, #FFFAFB 0%, #FFE9EE 55%, #FFB3C0 100%)',
  },
  {
    id: 'gold-cream', label: 'Or crème', tab: 'gradient',
    css: 'linear-gradient(135deg, #FFFCF3 0%, #FFE9AD 60%, #FFC145 100%)',
    ink: '#2B2440', accent: '#C88B2D', size: 'cover',
    preview: 'linear-gradient(135deg, #FFFCF3 0%, #FFE9AD 60%, #FFC145 100%)',
  },
  {
    id: 'ink-night', label: 'Nuit myKado', tab: 'gradient',
    css: 'linear-gradient(160deg, #2B2440 0%, #4A3F6F 55%, #7C5CC9 100%)',
    ink: '#FFFFFF', accent: '#FFC145', size: 'cover',
    preview: 'linear-gradient(160deg, #2B2440 0%, #4A3F6F 55%, #7C5CC9 100%)',
  },
  {
    id: 'mint-fresh', label: 'Menthe fraîche', tab: 'gradient',
    css: 'linear-gradient(135deg, #E4FBF3 0%, #7CE0C1 60%, #4FAB86 100%)',
    ink: '#FFFFFF', accent: '#2E7256', size: 'cover',
    preview: 'linear-gradient(135deg, #E4FBF3 0%, #7CE0C1 60%, #4FAB86 100%)',
  },

  /* Motifs — se répètent à l'infini quand on scroll (background-repeat: repeat) */
  {
    id: 'confetti-rain', label: 'Pluie de confettis', tab: 'pattern',
    css: 'radial-gradient(circle at 20% 30%, rgba(255,84,112,0.35) 0 4px, transparent 5px), radial-gradient(circle at 60% 70%, rgba(255,193,69,0.35) 0 4px, transparent 5px), radial-gradient(circle at 80% 20%, rgba(124,224,193,0.32) 0 4px, transparent 5px), radial-gradient(circle at 30% 80%, rgba(181,156,240,0.32) 0 4px, transparent 5px), #FFFFFF',
    ink: '#2B2440', accent: '#FF5470', size: 'tile',
    preview: 'radial-gradient(circle at 20% 30%, rgba(255,84,112,0.35) 2px, transparent 3px), radial-gradient(circle at 60% 70%, rgba(255,193,69,0.35) 2px, transparent 3px), radial-gradient(circle at 80% 20%, rgba(124,224,193,0.32) 2px, transparent 3px), radial-gradient(circle at 30% 80%, rgba(181,156,240,0.32) 2px, transparent 3px), #FFFFFF',
  },
  {
    id: 'ballon-dots', label: 'Petits ballons', tab: 'pattern',
    css: 'radial-gradient(circle at 25% 25%, rgba(255,84,112,0.14) 0 26px, transparent 27px), radial-gradient(circle at 75% 65%, rgba(255,193,69,0.14) 0 22px, transparent 23px), #FFFFFF',
    ink: '#2B2440', accent: '#FF5470', size: 'tile',
    preview: 'radial-gradient(circle at 25% 25%, rgba(255,84,112,0.32) 12px, transparent 13px), radial-gradient(circle at 75% 65%, rgba(255,193,69,0.32) 10px, transparent 11px), #FFFFFF',
  },

  /* Ambiances — dégradés photo-like */
  {
    id: 'photo-sunset', label: 'Coucher de soleil', tab: 'photo',
    css: 'linear-gradient(180deg, #FFC145 0%, #FF5470 60%, #7C5CC9 100%)',
    ink: '#FFFFFF', accent: '#FFC145', size: 'cover',
    preview: 'linear-gradient(180deg, #FFC145 0%, #FF5470 60%, #7C5CC9 100%)',
  },
  {
    id: 'photo-tropical', label: 'Tropical', tab: 'photo',
    css: 'linear-gradient(180deg, #A9D6FF 0%, #7CE0C1 55%, #FFC145 100%)',
    ink: '#2B2440', accent: '#2E7256', size: 'cover',
    preview: 'linear-gradient(180deg, #A9D6FF 0%, #7CE0C1 55%, #FFC145 100%)',
  },

  /* Unis — pour l'élégance minimale */
  {
    id: 'plain-white', label: 'Blanc pur', tab: 'plain', css: '#FFFFFF',
    ink: '#2B2440', accent: '#FF5470', size: 'cover', preview: '#FFFFFF',
  },
  {
    id: 'plain-rose', label: 'Rose Kado', tab: 'plain', css: '#FF5470',
    ink: '#FFFFFF', accent: '#FFC145', size: 'cover', preview: '#FF5470',
  },
  {
    id: 'plain-ink', label: 'Ink myKado', tab: 'plain', css: '#2B2440',
    ink: '#FFFFFF', accent: '#FFC145', size: 'cover', preview: '#2B2440',
  },
];

export const BACKGROUND_TABS = [
  { id: 'gradient', label: 'Dégradés' },
  { id: 'pattern',  label: 'Motifs' },
  { id: 'photo',    label: 'Ambiances' },
  { id: 'plain',    label: 'Unis' },
];

export const DEFAULT_BACKGROUND_ID = 'aurore-kado';

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
