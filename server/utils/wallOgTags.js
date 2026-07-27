/* ── Open Graph / Twitter meta tags for shared walls ──────────────
   Utilisé par :
   - /site/:template/:name  (SSR legacy — serve.js)
   - /m/:slug               (React SPA shell — canonical /m + APP_HOST)
   Un seul générateur pour garantir la cohérence de la preview WhatsApp/FB
   entre les deux chemins de rendu. */

const { safeHttpUrl } = require('./htmlSafe');

function optimizeCloudinaryUrl(url, transforms) {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  if (url.includes('/upload/f_') || url.includes('/upload/q_') || url.includes('/upload/w_')) return url;
  return url.replace('/upload/', `/upload/${transforms}/`);
}

function escHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

/**
 * Construit le bloc de meta tags OG/Twitter/description pour une publication.
 * @param {object} pub      Le document Publication (lean).
 * @param {string} pageUrl  URL absolue de la page courante (canonical).
 * @returns {string}        HTML prêt à injecter avant </head>.
 */
function buildWallOgTags(pub, pageUrl) {
  const rawTitle = String(
    (pub.data && (pub.data.name || pub.data.wallTitle)) || pub.title || 'Mur myKado'
  ).trim().slice(0, 120);

  const rawDesc = String(
    (pub.data && (pub.data.subtitle || pub.data.phrase || pub.data.description)) ||
    'Un espace vivant pour déposer des mots, des souvenirs et des gestes d\'amour.'
  ).trim().slice(0, 300);

  const rawImage = safeHttpUrl(
    (pub.data && (pub.data.bannerImage || pub.data.coverImage || pub.data.wallCover)) || ''
  );

  const ogImage = rawImage
    ? (rawImage.includes('res.cloudinary.com')
        ? optimizeCloudinaryUrl(rawImage, 'f_auto,q_auto:good,w_1200,h_630,c_fill,g_auto')
        : rawImage)
    : '';

  const ogTitle = escHtml(rawTitle);
  const ogDesc  = escHtml(rawDesc);
  const ogUrl   = escHtml(pageUrl || '');

  return `
<meta property="og:type" content="website">
<meta property="og:title" content="${ogTitle}">
<meta property="og:description" content="${ogDesc}">
${ogUrl ? `<meta property="og:url" content="${ogUrl}">` : ''}
${ogImage ? `<meta property="og:image" content="${escHtml(ogImage)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">` : ''}
<meta name="twitter:card" content="${ogImage ? 'summary_large_image' : 'summary'}">
<meta name="twitter:title" content="${ogTitle}">
<meta name="twitter:description" content="${ogDesc}">
${ogImage ? `<meta name="twitter:image" content="${escHtml(ogImage)}">` : ''}
<meta name="description" content="${ogDesc}">`;
}

module.exports = { buildWallOgTags };
