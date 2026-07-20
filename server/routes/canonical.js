/* ================================================================
   myKado — URLs canoniques /c/:slug /m/:slug /g/:slug
   Résout le slug en publication puis redirige (302) vers /site/…
   Voir notes/sitemap.md.
   ================================================================ */

const router = require('express').Router();
const Publication = require('../models/Publication');

const BRIQUE_PREFIX = { c: 'carte', m: 'mur', g: 'cadeau' };

function notFound(res) {
  return res.status(404).send(`
    <html><body style="font-family:'Inter',sans-serif;text-align:center;padding:80px;background:#FFFAF6;color:#161311">
      <h1 style="font-family:'Fraunces',serif;font-weight:500">Lien introuvable</h1>
      <p>Ce lien n'existe pas ou n'est pas encore publié.</p>
      <p style="margin-top:24px"><a href="/" style="color:#1E2952">Retour à l'accueil</a></p>
    </body></html>
  `);
}

function serverError(res) {
  return res.status(500).send('<h1>Erreur serveur</h1>');
}

// One handler for the 3 briques
async function handleCanonical(prefix, slug, res) {
  try {
    const pub = await Publication.findOne({ slug }).lean();
    if (!pub || !pub.published) return notFound(res);

    // Optionnel : si le prefix ne matche pas la brique du pub → redirect vers le bon prefix
    const expected = BRIQUE_PREFIX[prefix];
    if (pub.brique && expected && pub.brique !== expected) {
      const correctPrefix = { carte: 'c', mur: 'm', cadeau: 'g' }[pub.brique];
      if (correctPrefix) {
        return res.redirect(301, `/${correctPrefix}/${pub.slug}`);
      }
    }

    // Redirect vers le rendu legacy /site/:templateName/:customName
    return res.redirect(302, `/site/${pub.templateName}/${pub.customName}`);
  } catch (e) {
    return serverError(res);
  }
}

router.get('/c/:slug', (req, res) => handleCanonical('c', req.params.slug, res));
// /m/:slug is now handled by the React Frontend (catch-all in server/index.js)
router.get('/g/:slug', (req, res) => handleCanonical('g', req.params.slug, res));

module.exports = router;
