/* ================================================================
   myKado — Slug utilities
   Génération et validation de slugs pour URLs canoniques /c/:slug etc.
   ================================================================ */

const ASCII_MAP = {
  à: 'a', â: 'a', ä: 'a', á: 'a', ã: 'a', å: 'a',
  ç: 'c',
  è: 'e', é: 'e', ê: 'e', ë: 'e',
  ì: 'i', í: 'i', î: 'i', ï: 'i',
  ñ: 'n',
  ò: 'o', ó: 'o', ô: 'o', õ: 'o', ö: 'o',
  ù: 'u', ú: 'u', û: 'u', ü: 'u',
  ý: 'y', ÿ: 'y',
  æ: 'ae', œ: 'oe', ß: 'ss',
};

/**
 * Normalise une chaîne en slug ASCII.
 *   slugify("Amina Ochoa — 30 ans !")  → "amina-ochoa-30-ans"
 */
function slugify(input) {
  if (!input || typeof input !== 'string') return '';
  const lower = input.toLowerCase().trim();
  // Remplace accents
  const stripped = lower.replace(/[àâäáãåçèéêëìíîïñòóôõöùúûüýÿæœß]/g, (m) => ASCII_MAP[m] || m);
  // Normalise NFD pour retirer les diacritiques restants
  const nfd = stripped.normalize('NFD').replace(/[̀-ͯ]/g, '');
  // Remplace tout ce qui n'est pas alphanumérique/underscore par un tiret
  const dashed = nfd.replace(/[^a-z0-9_]+/g, '-');
  // Collapse multiple dashes, trim edges
  return dashed.replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
}

/** Contraintes UX-rules : 3–40 chars, a-z 0-9 - _ */
const SLUG_REGEX = /^[a-z0-9][a-z0-9_-]{1,38}[a-z0-9]$/;

function isValidSlug(slug) {
  if (typeof slug !== 'string') return false;
  return SLUG_REGEX.test(slug);
}

/**
 * Génère un slug unique sur la collection donnée en évitant les collisions.
 * @param {Model} Model - Mongoose model to check uniqueness against
 * @param {string} base - Chaîne source (titre, customName, destinataire)
 * @param {object} [filter] - Extra filter appliqué à la recherche de collision
 *                            (ex: { _id: { $ne: currentDocId } } lors d'un update)
 * @returns {Promise<string>} slug unique valide
 */
async function generateUniqueSlug(Model, base, filter = {}) {
  let candidate = slugify(base);
  if (!candidate) candidate = 'creation';
  if (candidate.length < 3) candidate = candidate.padEnd(3, '0');
  if (candidate.length > 40) candidate = candidate.slice(0, 40).replace(/-+$/, '');

  let suffix = 0;
  // Test candidat brut d'abord
  while (true) {
    const slugToTest = suffix === 0 ? candidate : `${candidate}-${suffix}`;
    if (slugToTest.length > 40) {
      // Truncate base to fit suffix
      candidate = candidate.slice(0, 40 - String(suffix).length - 1).replace(/-+$/, '');
      continue;
    }
    const exists = await Model.findOne({ slug: slugToTest, ...filter }).select('_id').lean();
    if (!exists) return slugToTest;
    suffix++;
    if (suffix > 999) {
      // Ultra-safety : ajoute un random suffix
      return `${candidate}-${Math.random().toString(36).slice(2, 6)}`;
    }
  }
}

module.exports = { slugify, isValidSlug, generateUniqueSlug };
