/* ================================================================
   myKado — URLs canoniques /c/:slug /m/:slug /g/:slug
   Résout le slug en publication puis redirige (302) vers /site/…
   Voir notes/sitemap.md.

   Nouveau : le template `myenvelope` (créé via /card-editor) est
   rendu directement par la SPA React, pas par un template statique.
   → on renvoie le shell React (prod) ou on redirige vers le dev
   server Vite (dev).
   ================================================================ */

const router = require('express').Router();
const path   = require('path');
const fs     = require('fs');
const Publication = require('../models/Publication');

const PROD           = process.env.NODE_ENV === 'production';
const REACT_DIST     = path.join(__dirname, '../../client/dist');
const REACT_INDEX    = path.join(REACT_DIST, 'index.html');
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

function serveSpa(req, res) {
  if (!PROD) {
    return res.redirect(302, `${APP_HOST_DEV}${req.originalUrl}`);
  }
  if (!fs.existsSync(REACT_INDEX)) {
    return res.status(503).send('React app not built. Run: cd client && npm run build');
  }
  res.setHeader('Cache-Control', 'no-store');
  return res.sendFile(REACT_INDEX);
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

    // Card-editor cards live in the React SPA — no static template file.
    if (SPA_TEMPLATES.has(pub.templateName)) {
      return serveSpa(req, res);
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
