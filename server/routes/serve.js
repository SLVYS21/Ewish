const router = require('express').Router();
const path   = require('path');
const fs     = require('fs');
const Publication = require('../models/Publication');
const Font        = require('../models/Font');


/* ── Cloudinary URL optimizer ─────────────────────────────────
   Inserts transformation params into Cloudinary upload URLs.
   Non-Cloudinary URLs pass through unchanged.
   ──────────────────────────────────────────────────────────── */
function optimizeCloudinaryUrl(url, transforms = 'f_auto,q_auto:good,w_1400,c_limit') {
  if (!url || !url.includes('res.cloudinary.com')) return url;
  // Already has transforms → don't double-add
  if (url.includes('/upload/f_') || url.includes('/upload/q_') || url.includes('/upload/w_')) return url;
  return url.replace('/upload/', `/upload/${transforms}/`);
}

router.get('/:templateName/:customName', async (req, res) => {
  try {
    const pub = await Publication.findOne({
      templateName: req.params.templateName,
      customName:   req.params.customName,
    }).lean();

    if (!pub) {
      return res.status(404).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:80px;background:#fafafa">
          <h1>404</h1><p>Aucune création trouvée à cette adresse.</p>
        </body></html>
      `);
    }

    const TMPL_DIR = process.env.TEMPLATES_DIR ||
      (fs.existsSync(path.join(__dirname, '../templates'))
        ? path.join(__dirname, '../templates')
        : path.join(__dirname, '../../templates'));
    const templatePath = path.join(TMPL_DIR, `${pub.templateName}/index.html`);
    if (!fs.existsSync(templatePath)) {
      return res.status(404).send('<h1>Template introuvable</h1>');
    }

    let html = fs.readFileSync(templatePath, 'utf8');

    // Load custom fonts from DB and inject @font-face declarations
    let fontFaceCSS = '';
    try {
      const customFonts = await Font.find({}).lean();
      if (customFonts.length) {
        fontFaceCSS = customFonts.map(f =>
          `@font-face { font-family: '${f.name}'; src: url('${f.url}') format('${f.format}'); font-display: swap; }`
        ).join('\n');
      }
    } catch {}
    const s     = pub.style || {};
    const scale = s.fontSize === 'small' ? '0.85' : s.fontSize === 'large' ? '1.15' : '1';
    const bgs   = s.backgrounds || {};

    /* ── CSS: section background variables ─────────────────── */
    const bgCssLines = [];
    Object.entries(bgs).forEach(([key, bg]) => {
      if (!bg || !bg.value) return;
      let bgValue;
      if      (bg.type === 'color')    bgValue = bg.value;
      else if (bg.type === 'gradient') bgValue = bg.value;
      else if (bg.type === 'image')    bgValue = `url("${optimizeCloudinaryUrl(bg.value)}") center/cover no-repeat`;
      if (bgValue) {
        bgCssLines.push(`  --bg-${key}: ${bgValue};`);
        if (bg.overlay != null) bgCssLines.push(`  --bg-${key}-overlay: ${bg.overlay};`);
        if (bg.blur    != null) bgCssLines.push(`  --bg-${key}-blur: ${bg.blur}px;`);
      }
    });

    const injection = `
<style>
${fontFaceCSS ? fontFaceCSS + '\n' : ''}  :root {
    --primary:    ${s.primaryColor  || '#ff69b4'};
    --accent:     ${s.accentColor   || '#ffb347'};
    --font:       '${s.fontFamily   || 'Work Sans'}', sans-serif;
    --fs-scale:   ${scale};
    --text-color: ${s.textColor     || '#333333'};
    --text-muted: ${s.textMuted     || '#888888'};
${bgCssLines.join('\n')}
  }
  body { font-family: var(--font) !important; }
</style>
<script>
  /* ── Publication data injected by server ── */
  const _rawData = ${JSON.stringify(pub.data || {})};
  const _jarCfg  = ${JSON.stringify(pub.jarConfig || null)};

  window.__WW_DATA__  = _jarCfg ? { ..._rawData, jarConfig: _jarCfg } : _rawData;
  window.__WW_STYLE__ = ${JSON.stringify(pub.style || {})};
  window.__WW_META__  = ${JSON.stringify({
    id:           String(pub._id),
    title:        pub.title,
    templateName: pub.templateName,
    customName:   pub.customName,
  })};

  /* ── Decorations (read by ww-engine.js) ── */
  window.__WW_DECO__     = ${JSON.stringify(pub.decorations || [])};
  window.__WW_WIDGETS__ = ${JSON.stringify(pub.widgets || [])};
  window.__WW_PHOTO_TRANSFORMS__ = ${JSON.stringify(pub.photoTransforms || {})};
<\/script>`;

    /* ── Inject engine script tag if not already present ───── */
    if (!html.includes('ww-engine.js')) {
      html = html.replace('</head>', '<script src="/templates/shared/ww-engine.js"><\/script>\n</head>');
    }

    html = html.replace('</head>', injection + '\n</head>');
    res.send(html);
  } catch (e) {
    console.error(e);
    res.status(500).send('<h1>Erreur serveur</h1><pre>' + e.message + '</pre>');
  }
});

module.exports = router;