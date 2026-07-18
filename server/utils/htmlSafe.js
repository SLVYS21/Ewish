/* ── HTML/script injection helpers ─────────────────────────────
   Utilitaires centralisant l'échappement lors de l'injection de
   données user-controlled dans du HTML/JS servi côté serveur.
   ──────────────────────────────────────────────────────────── */

const LS = ' ';
const PS = ' ';
const LS_RE = new RegExp(LS, 'g');
const PS_RE = new RegExp(PS, 'g');

/**
 * Sérialise une valeur en JSON safe pour être inclus dans un <script>.
 * Échappe les séquences qui permettraient de sortir du contexte script :
 *  - </  (fin de balise script)
 *  - -->  (fin de commentaire HTML)
 *  - U+2028, U+2029 (line separators qui cassent JS)
 */
function safeJsonForScript(value) {
  return JSON.stringify(value ?? null)
    .replace(/</g, '\\u003c')
    .replace(/-->/g, '--\\u003e')
    .replace(LS_RE, '\\u2028')
    .replace(PS_RE, '\\u2029');
}

/**
 * Valide une couleur CSS user-fournie.
 * Accepte : #rgb, #rrggbb, #rrggbbaa, rgb()/rgba(), hsl()/hsla(), noms basiques.
 * Retourne fallback si invalide.
 */
const COLOR_RE = /^(#[0-9a-fA-F]{3,8}|rgba?\([\d.,\s%]+\)|hsla?\([\d.,\s%]+\)|[a-zA-Z]{3,20})$/;
function safeColor(value, fallback = '#000000') {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!COLOR_RE.test(trimmed)) return fallback;
  return trimmed;
}

/**
 * Valide un nom de font (Google Fonts ou custom).
 * Accepte lettres, chiffres, espaces, tirets. Interdit tout ce qui peut sortir du CSS.
 */
const FONT_RE = /^[a-zA-Z0-9 \-]{1,50}$/;
function safeFontFamily(value, fallback = 'Work Sans') {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!FONT_RE.test(trimmed)) return fallback;
  return trimmed;
}

/**
 * Whitelist stricte pour un nom de template servant de path segment.
 * Bloque path traversal et caractères exotiques.
 */
const TEMPLATE_NAME_RE = /^[a-z0-9][a-z0-9-]{0,60}$/;
function isSafeTemplateName(value) {
  return typeof value === 'string' && TEMPLATE_NAME_RE.test(value);
}

/**
 * Nettoie une URL user-fournie destinée à être injectée dans du CSS `url(...)`.
 * Retourne '' si l'URL contient des caractères qui permettraient un breakout.
 */
function safeCssUrl(value) {
  if (typeof value !== 'string') return '';
  if (/["'()\r\n\\]/.test(value)) return '';
  return value;
}

/**
 * Nettoie une URL pour attribut HTML href (branding).
 * N'autorise que http/https/mailto/tel et chemins relatifs.
 */
function safeHttpUrl(value, fallback = '#') {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  if (!/^(https?:\/\/|mailto:|tel:|\/)/i.test(trimmed)) return fallback;
  return trimmed;
}

module.exports = {
  safeJsonForScript,
  safeColor,
  safeFontFamily,
  isSafeTemplateName,
  safeCssUrl,
  safeHttpUrl,
};
