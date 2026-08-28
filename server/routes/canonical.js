/* ================================================================
   myKado — URLs canoniques /c/:slug /m/:slug /g/:slug
   Résout le slug en publication puis redirige (302) vers /site/…
   Voir notes/sitemap.md.

   Nouveau : le template `myenvelope` (créé via /card-editor) est
   rendu directement par la SPA React, pas par un template statique.
   La SPA vit sur le DO Static Site (app.mykado.store) — Express
   (go.mykado.store) n'a PAS le build React (client/dist n'est pas
   copié dans l'image Docker, voir Dockerfile). On redirige donc
   vers APP_URL, comme wallShell.js le fait pour /m/:slug.
   ================================================================ */

const router = require('express').Router();
const Publication = require('../models/Publication');

const SPA_TEMPLATES  = new Set(['myenvelope']);
const APP_HOST_DEV   = process.env.APP_HOST_DEV || 'http://localhost:3000';

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

/* Résout l'URL du frontend React (SPA). Aligné sur shortlinks.js:resolveAppUrl. */
function resolveAppUrl(req) {
  const host = String(req.hostname || '').toLowerCase();
  const isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');
  if (isLocal) return APP_HOST_DEV;
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/+$/, '');
  const appHost = process.env.APP_HOST || 'app.mykado.store';
  return `${req.protocol}://${appHost}`;
}

function redirectToSpa(req, res, prefix, slug) {
  const appUrl = resolveAppUrl(req);
  const qIdx = req.originalUrl.indexOf('?');
  const search = qIdx >= 0 ? req.originalUrl.slice(qIdx) : '';
  return res.redirect(302, `${appUrl}/${prefix}/${encodeURIComponent(slug)}${search}`);
}

async function handleCanonical(prefix, slug, req, res) {
  try {
    const pub = await Publication.findOne({ slug }).lean();
    if (!pub || !pub.published) return notFound(res);

    // If the URL prefix doesn't match the brique, redirect to the correct one.
    const expected = BRIQUE_PREFIX[prefix];
    if (pub.brique && expected && pub.brique !== expected) {
      const correctPrefix = { carte: 'c', mur: 'm', cadeau: 'g' }[pub.brique];
      if (correctPrefix) {
        return res.redirect(301, `/${correctPrefix}/${pub.slug}`);
      }
    }

    // Card-editor cards live in the React SPA hosted on app.mykado.store.
    // Express n'a pas le build React → redirect vers APP_URL (même pattern
    // que wallShell.js pour /m/:slug).
    if (SPA_TEMPLATES.has(pub.templateName)) {
      return redirectToSpa(req, res, prefix, pub.slug);
    }

    // Legacy templates: redirect to /site/:templateName/:customName
    return res.redirect(302, `/site/${pub.templateName}/${pub.customName}`);
  } catch (e) {
    return serverError(res);
  }
}

router.get('/c/:slug', (req, res) => handleCanonical('c', req.params.slug, req, res));
// /m/:slug is handled by the React frontend (catch-all in server/index.js)
router.get('/g/:slug', (req, res) => handleCanonical('g', req.params.slug, req, res));

module.exports = router;
