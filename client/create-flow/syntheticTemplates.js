/* Templates synthétiques (pas en DB) — utilisés partout où on liste les
   templates cartes/wall pour ajouter l'enveloppe myKado en premier.

   MYENVELOPE_TEMPLATE : la carte enveloppe qui pointe vers /card-editor.
   Marquée `_isCardEditor` pour signaler aux consommateurs (TemplatesGallery,
   Dashboard) qu'elle a un flow spécial. */
export const MYENVELOPE_TEMPLATE = {
  _id: '__myenvelope',
  name: 'myenvelope',
  label: 'Carte Enveloppe myKado',
  description: '4 pages + enveloppe. Design floral, animation 3D d\'ouverture.',
  thumbnail: '/backgrounds/theme-floral/floral_frame.webp',
  creditsRequired: 1,
  _isCardEditor: true,
  _isNew: true,
};

/* Sets pour détecter le type d'un template par son name. */
export const WALL_TEMPLATE_NAMES = new Set([
  'wall-of-wishes',
  'wall-of-wishes-modern',
  'wall-of-wishes-craft',
]);

export function isEnvelopeTemplate(name) {
  return name === 'myenvelope';
}

export function isWallTemplate(name) {
  return WALL_TEMPLATE_NAMES.has(name);
}

/* Type de flow /create pour un template donné (wish par défaut). */
export function createFlowTypeFor(name) {
  if (isEnvelopeTemplate(name)) return 'envelope';
  if (isWallTemplate(name))     return 'wall';
  return 'wish';
}
