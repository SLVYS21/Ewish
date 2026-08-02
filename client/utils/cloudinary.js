/* ══════════════════════════════════════════════════════════════════
   Cloudinary URL transforms
   ──────────────────────────────────────────────────────────────────
   Injecte une transformation dans une URL Cloudinary existante, ou
   renvoie l'URL inchangée si ce n'est pas du Cloudinary. Utilisé pour
   servir des thumbnails légers dans la grille du mur (au lieu de
   télécharger des images 4K à chaque pin).
   ══════════════════════════════════════════════════════════════════ */

export function cldTransform(url, transform) {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  // Ne double pas la transfo si l'URL en a déjà une (w_, q_, f_, c_, h_).
  if (/\/upload\/[^/]*[wqfch]_/.test(url)) return url;
  return url.replace('/upload/', `/upload/${transform}/`);
}

// Grille du mur — assez pour un pin sur écran retina.
export const cldThumb = (url) => cldTransform(url, 'w_600,q_auto,f_auto,c_limit');

// StoryViewer — plein écran mobile, largement suffisant pour un phone.
export const cldStory = (url) => cldTransform(url, 'w_1200,q_auto,f_auto,c_limit');

// PDF/vidéo/export haute-def — on garde l'original mais on laisse Cloudinary
// choisir le format et la qualité.
export const cldFull  = (url) => cldTransform(url, 'q_auto,f_auto');
