/* ── OG landing page handler for shared walls (/m/:slug) ──────────
   Contexte : la vraie SPA React est servie par un DO Static Site à
   app.mykado.store, qui ne peut pas injecter d'OG dynamique. Express
   (go.mykado.store) sert donc les liens de partage /m/:slug avec :
     1. Les meta OG/Twitter (bannière, titre, description du mur) →
        WhatsApp/Facebook/iMessage/Telegram fabriquent la preview.
     2. Un redirect côté client vers app.mykado.store/m/:slug pour que
        les vrais utilisateurs atterrissent sur la SPA React et voient
        le mur.
   Les crawlers OG lisent la première réponse HTML et n'exécutent pas
   le JS → ils voient les meta et affichent la preview. Les navigateurs
   exécutent la redirect immédiatement. */

const router = require('express').Router();
const Publication = require('../models/Publication');
const { buildWallOgTags } = require('../utils/wallOgTags');

const APP_URL = (process.env.APP_URL || 'https://app.mykado.store').replace(/\/+$/, '');

function escAttr(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[c]));
}

function buildShellHtml({ ogTags, redirectUrl, title }) {
  const safeTitle = escAttr(title);
  const safeRedirect = escAttr(redirectUrl);
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeTitle}</title>
${ogTags}
<link rel="canonical" href="${safeRedirect}">
<style>
  html,body{margin:0;padding:0;background:#FFFAF6;color:#161311;font-family:-apple-system,BlinkMacSystemFont,'Inter','Plus Jakarta Sans',sans-serif}
  .wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;text-align:center}
  .card{max-width:420px}
  h1{font-family:'Fraunces',Georgia,serif;font-weight:500;font-size:24px;margin:0 0 8px}
  p{margin:0 0 16px;color:#4a4a55;font-size:15px;line-height:1.5}
  a{color:#FF5470;font-weight:600;text-decoration:none}
</style>
</head>
<body>
<div class="wrap"><div class="card">
<h1>${safeTitle}</h1>
<p>Chargement de votre mur…</p>
<p><a href="${safeRedirect}">Ouvrir le mur</a></p>
</div></div>
<script>window.location.replace(${JSON.stringify(redirectUrl)});</script>
</body>
</html>`;
}

router.get('/m/:slug', async (req, res, next) => {
  try {
    const slug = String(req.params.slug || '').trim();
    if (!slug) return next();

    /* Lookup : slug OU shortCode (backward compat avec les liens /s/ historiques
       où le shortCode fait office de slug dans /m/{shortCode}). */
    const pub = await Publication.findOne({
      $or: [{ slug }, { shortCode: slug }],
    }).lean();

    /* Redirect brut si pas trouvé — la SPA affichera son 404. */
    const redirectUrl = `${APP_URL}/m/${encodeURIComponent(slug)}`;

    if (!pub) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      return res.send(buildShellHtml({
        ogTags: '',
        redirectUrl,
        title: 'Mur myKado',
      }));
    }

    const isWall = pub.templateName && pub.templateName.startsWith('wall-of-wishes');
    const isWallFreemium = isWall && !pub.published;
    if (!pub.published && !isWallFreemium) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      return res.send(buildShellHtml({
        ogTags: '',
        redirectUrl,
        title: 'Mur myKado',
      }));
    }

    /* Injection OG. currentUrl = URL Express (celle que le crawler lit). */
    const host = req.get('host') || 'go.mykado.store';
    const proto = req.protocol || 'https';
    const currentUrl = `${proto}://${host}/m/${slug}`;
    const ogTags = buildWallOgTags(pub, currentUrl);

    const wallTitle = (pub.data && (pub.data.name || pub.data.wallTitle))
      || pub.title || 'Mur myKado';

    const html = buildShellHtml({
      ogTags,
      redirectUrl,
      title: String(wallTitle).slice(0, 120),
    });

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');
    return res.send(html);
  } catch (e) {
    /* Fallback : simple redirect si la DB est down. */
    const slug = String(req.params.slug || '').trim();
    return res.redirect(302, `${APP_URL}/m/${encodeURIComponent(slug)}`);
  }
});

module.exports = router;
