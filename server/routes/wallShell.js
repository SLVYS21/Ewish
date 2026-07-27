/* ── SPA shell handler for /m/:slug avec preview OG server-side ────
   Sert client/dist/index.html en injectant les meta OG (og:image =
   bannière du mur) avant </head> pour que WhatsApp/Facebook/iMessage
   affichent une vraie preview.

   Sans ce handler, /m/:slug tombe sur le catch-all SPA qui renvoie un
   HTML statique sans meta → preview vide.

   L'hydratation React continue de fonctionner normalement : on n'injecte
   qu'un bloc de <meta> avant </head>, tout le reste du shell est intact. */

const router = require('express').Router();
const fs = require('fs');
const path = require('path');
const Publication = require('../models/Publication');
const { buildWallOgTags } = require('../utils/wallOgTags');

const PROD = process.env.NODE_ENV === 'production';
const REACT_DIST = path.join(__dirname, '../../client/dist');
const INDEX_PATH = path.join(REACT_DIST, 'index.html');

/* Cache du shell HTML en mémoire (rebuild ⇒ redémarrage serveur, donc OK). */
let _shellCache = null;
function readShell() {
  if (!PROD) {
    /* En dev le shell vit dans Vite (localhost:3000) — on ne peut pas
       injecter côté Express. On laisse la route pass-through. */
    return null;
  }
  if (_shellCache) return _shellCache;
  if (!fs.existsSync(INDEX_PATH)) return null;
  _shellCache = fs.readFileSync(INDEX_PATH, 'utf8');
  return _shellCache;
}

router.get('/m/:slug', async (req, res, next) => {
  try {
    /* En dev : pass-through vers le catch-all SPA (Vite gère). */
    const shell = readShell();
    if (!shell) return next();

    const slug = String(req.params.slug || '').trim();
    if (!slug) return next();

    /* Lookup : slug OU shortCode (backward compat avec les liens /s/ historiques
       où le shortCode fait office de slug dans /m/{shortCode}). */
    const pub = await Publication.findOne({
      $or: [{ slug }, { shortCode: slug }],
    }).lean();

    /* Pas trouvé ou non publié (hors freemium wall) : on laisse la SPA gérer
       le rendu / le 404 côté client, sans meta OG. */
    if (!pub) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      return res.send(shell);
    }

    const isWall = pub.templateName && pub.templateName.startsWith('wall-of-wishes');
    const isWallFreemium = isWall && !pub.published;
    if (!pub.published && !isWallFreemium) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      return res.send(shell);
    }

    /* Injection OG. currentUrl = origine app + /m/:slug (sans query string). */
    const host = req.get('host') || process.env.APP_HOST || 'app.mykado.store';
    const proto = req.protocol || 'https';
    const currentUrl = `${proto}://${host}/m/${slug}`;
    const ogTags = buildWallOgTags(pub, currentUrl);

    /* Strip la description + le title génériques du shell — ils ne
       correspondent pas à ce mur précis et peuvent primer sur nos meta
       si le crawler lit la première occurrence trouvée. */
    let html = shell
      .replace(/<meta\s+name=["']description["'][^>]*>\s*/i, '')
      .replace(/<title>[\s\S]*?<\/title>/i, '');

    /* On remet un <title> propre au mur avant l'injection OG. */
    const wallTitle = (pub.data && (pub.data.name || pub.data.wallTitle))
      || pub.title || 'Mur myKado';
    const safeTitle = String(wallTitle).replace(/[<>&"']/g, c => ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;',
    }[c])).slice(0, 120);

    html = html.replace('</head>', `<title>${safeTitle}</title>\n${ogTags}\n</head>`);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res.send(html);
  } catch (e) {
    /* En cas d'erreur (DB down…) on laisse quand même le shell partir pour ne
       pas casser la page pour l'utilisateur — juste sans OG. */
    return next();
  }
});

module.exports = router;
