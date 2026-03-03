const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const Publication = require('../models/Publication');

// GET /site/:templateName/:customName  → render the template as HTML
router.get('/:templateName/:customName', async (req, res) => {
  try {
    const pub = await Publication.findOne({
      templateName: req.params.templateName,
      customName: req.params.customName,
    }).lean();

    if (!pub) {
      return res.status(404).send(`
        <html><body style="font-family:sans-serif;text-align:center;padding:80px">
          <h1>404 — Page not found</h1>
          <p>No wish found at this address.</p>
        </body></html>
      `);
    }

    const templatePath = path.join(__dirname, `../../templates/${pub.templateName}/index.html`);
    if (!fs.existsSync(templatePath)) {
      return res.status(404).send('<h1>Template not found</h1>');
    }

    let html = fs.readFileSync(templatePath, 'utf8');
    const s = pub.style || {};
    const scale = s.fontSize === 'small' ? '0.85' : s.fontSize === 'large' ? '1.15' : '1';

    // Inject CSS vars + data as window globals — templates read this themselves
    const injection = `
<style>
  :root {
    --primary: ${s.primaryColor || '#ff69b4'};
    --accent:  ${s.accentColor  || '#ffb347'};
    --font:    '${s.fontFamily  || 'Work Sans'}', sans-serif;
    --fs-scale: ${scale};
  }
  body { font-family: var(--font) !important; }
</style>
<script>
  window.__WW_DATA__  = ${JSON.stringify(pub.data  || {})};
  window.__WW_STYLE__ = ${JSON.stringify(pub.style || {})};
</script>`;

    html = html.replace('</head>', injection + '\n</head>');
    res.send(html);

  } catch (e) {
    console.error(e);
    res.status(500).send('<h1>Server error</h1><pre>' + e.message + '</pre>');
  }
});

module.exports = router;