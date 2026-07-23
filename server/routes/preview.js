const router = require('express').Router();
const Template = require('../models/Template');
const { getTemplateHtml } = require('../utils/templateCache');
const {
  safeJsonForScript,
  safeColor,
  safeFontFamily,
  isSafeTemplateName,
} = require('../utils/htmlSafe');
const { getReactWallShell } = require('../utils/reactWallShell');

const DEMO_DATA = {};

/* ── Anti-copy layer (friction UX, PAS de la sécurité) ────
   Bloque le clic droit / F12 / drag pour décourager la copie.
   `view-source:` et `curl` contournent tout : ce n'est pas de
   la protection, juste de la friction visuelle. */
function injectProtection(html) {
  const watermarkCss = `
<style id="ww-demo-style">
  * { -webkit-user-select: none !important; user-select: none !important; }
  body::after {
    content: '';
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    pointer-events: none;
    z-index: 2147483647;
    background:
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Ctext x='50%25' y='50%25' fill='rgba(0,0,0,0.07)' font-family='sans-serif' font-weight='bold' font-size='22' letter-spacing='2' text-anchor='middle' transform='rotate(-45 150 150)'%3ED%C3%89MO MYKADO%3C/text%3E%3C/svg%3E"),
      repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(255,105,180,0.03) 60px, rgba(255,105,180,0.03) 120px);
  }
</style>`;

  const protectionScript = `
<script id="ww-demo-guard">
(function(){
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', function(e) {
    var blocked = e.key === 'F12'
      || (e.ctrlKey && ['u','s','i','j','p'].includes(e.key.toLowerCase()))
      || (e.metaKey && ['u','s'].includes(e.key.toLowerCase()))
      || (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase()));
    if (blocked) e.preventDefault();
  });
  document.addEventListener('dragstart', e => e.preventDefault());
})();
<\/script>`;

  html = html.replace('</head>', watermarkCss + '\n</head>');
  html = html.replace('</body>', protectionScript + '\n</body>');
  return html;
}

const GFONTS_MAP = {
  'Outfit':           'Outfit:wght@200;300;400;500;600;700;800',
  'Work Sans':        'Work+Sans:wght@300;400;500;600;700',
  'Inter':            'Inter:wght@300;400;500;600;700',
  'Playfair Display': 'Playfair+Display:wght@400;500;600;700',
  'Pacifico':         'Pacifico',
  'Dancing Script':   'Dancing+Script:wght@400;500;600;700',
  'Montserrat':       'Montserrat:wght@300;400;500;600;700',
  'Poppins':          'Poppins:wght@300;400;500;600;700',
  'Lato':             'Lato:wght@300;400;700',
  'Raleway':          'Raleway:wght@300;400;500;600;700',
  'Nunito':           'Nunito:wght@300;400;500;600;700',
};

const CSP = [
  "default-src 'self' https: data: blob:",
  "script-src 'self' 'unsafe-inline' https: http://localhost:3000 http://localhost:5173",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com https://res.cloudinary.com data:",
  "img-src 'self' https: data: blob:",
  "media-src 'self' https: blob:",
  "connect-src 'self' https: http://localhost:3000 http://localhost:5173 ws://localhost:3000 ws://localhost:5173",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'self' http://localhost:3000 http://localhost:5173 https://app.mykado.store https://mykado.store",
].join('; ');

router.get('/:templateName', async (req, res) => {
  const { templateName } = req.params;

  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Cache-Control', 'no-store');

  if (!isSafeTemplateName(templateName)) {
    return res.status(400).send('<h1>Nom invalide</h1>');
  }

  try {
    const template = await Template.findOne({ name: templateName }).lean();
    if (!template) return res.status(404).send('<h1>Template not found</h1>');

    let html;
    if (templateName.startsWith('wall-of-wishes')) {
      html = getReactWallShell();
      if (!html) return res.status(503).send('<h1>Mur React indisponible</h1>');
    } else {
      html = await getTemplateHtml(templateName);
      if (!html) return res.status(404).send('<h1>Not found</h1>');
    }

    const demoData  = DEMO_DATA[templateName] || {};
    const demoStyle = template.defaultStyle || {};
    const scale = '1';
    const fontFamily = safeFontFamily(demoStyle.fontFamily, 'Outfit');
    const primary    = safeColor(demoStyle.primaryColor, '#E11D74');
    const accent     = safeColor(demoStyle.accentColor,  '#F5B544');
    const gfontParam = GFONTS_MAP[fontFamily];
    const fontLink = gfontParam
      ? `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=${gfontParam}&display=swap">`
      : '';

    const injection = `
    ${fontLink}
    <style>
      :root {
        --primary: ${primary};
        --accent:  ${accent};
        --font:    '${fontFamily}', sans-serif;
        --fs-scale: ${scale};
      }
      body { font-family: var(--font) !important; }
    </style>
    <script>
      window.__WW_DATA__  = ${safeJsonForScript(demoData)};
      window.__WW_STYLE__ = ${safeJsonForScript(demoStyle)};
      window.__WW_META__  = ${safeJsonForScript({ id: '', demo: true })};
    <\/script>`;

    html = html.replace('</head>', injection + '\n</head>');
    html = injectProtection(html);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    console.error('[preview]', e);
    res.status(500).send('<h1>Erreur</h1>');
  }
});

module.exports = router;
