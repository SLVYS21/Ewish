const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const Template = require('../models/Template');

// Demo data per template — realistic but fake
const DEMO_DATA = {
  birthday: {
    greeting: 'Hiya', name: 'Lydia', greetingText: 'Tu comptes énormément pour nous !',
    musicHint: 'C\'est mieux avec de la musique 🎶',
    trackTitle: 'Happy Birthday', trackArtist: 'Stevie Wonder',
    text2: 'On a cherché les mots.', text3: 'On en a trouvé beaucoup.',
    text4: 'Mais surtout, on voulait dire', text4Adjective: 'merci',
    text5Entry: 'Parce que,', text5Content: 'Tu es irremplaçable', smiley: '🥹',
    bigTextPart1: 'S', bigTextPart2: 'O',
    wishHeading: 'Joyeux Anniversaire !', wishText: 'Avec tout notre amour 💖',
    outroText: 'Reviens nous dire si tu as aimé.', replayText: 'Clique pour revoir ↺', outroSmiley: '🥰',
  },
  special: {
    greeting: 'Hiya', name: 'Kofi', greetingText: 'On a cherché et on t\'a trouvé.',
    musicHint: 'Mets le son 🎶',
    trackTitle: 'Gold', trackArtist: 'Spandau Ballet',
    searchQuery: 'meilleure personne du monde',
    result1Title: 'La personne la plus exceptionnelle recensée à ce jour',
    result1Domain: 'google.com/featured',
    result1Snippet: 'Après analyse de 8 milliards de profils, les experts s\'accordent sur un résultat sans appel.',
    result1Rating: '5',
    text2: 'On a cherché partout.', text3: 'Et on t\'a trouvé.',
    text4: 'Parce que t\'es', text4Adjective: 'unique',
    text5Entry: 'Et surtout,', text5Content: 'Joyeux Anniversaire !', smiley: '🎂',
    bigTextPart1: 'W', bigTextPart2: 'O',
    wishHeading: 'Joyeux Anniversaire !', wishText: 'Le meilleur reste à venir 🚀',
    outroText: 'On espère que tu as aimé.', replayText: 'Revoir ↺', outroSmiley: '🎉',
  },
  'collective-family': {
    greeting: 'Hiya', name: 'Ama', greetingText: 'On t\'aime tellement !',
    musicHint: 'C\'est mieux avec de la musique 🎶',
    trackTitle: 'Notre chanson', trackArtist: 'Artiste préféré',
    groupName: 'La famille', groupMessage: 'On s\'est tous réunis pour te dire quelque chose d\'important…', groupEmojis: '🥰 🎂 🎊',
    text2: 'On a cherché les mots.', text3: 'On en a trouvé beaucoup.',
    text4: 'Mais surtout, on voulait dire', text4Adjective: 'merci',
    text5Entry: 'Parce que,', text5Content: 'Tu es irremplaçable', smiley: '🥹',
    bigTextPart1: 'S', bigTextPart2: 'O',
    wishHeading: 'Joyeux Anniversaire !', wishText: 'De toute la famille avec amour 💖',
    carouselTitle: 'Ce qu\'ils ont voulu te dire 💌',
    outroText: 'Reviens nous dire si tu as aimé.', replayText: 'Clique pour revoir ↺', outroSmiley: '🥰',
  },
  'collective-pro': {
    greeting: 'Cher', name: 'Alexandre', greetingText: 'Nous tenions à marquer ce moment.',
    musicHint: 'Prenez un moment pour écouter 🎵',
    trackTitle: 'Un morceau pour vous', trackArtist: 'Sélection de l\'équipe',
    groupName: 'L\'équipe Marketing', groupMessage: 'Nous nous sommes réunis pour vous adresser quelques mots qui viennent du cœur.',
    text2: 'Nous avons cherché les mots justes.', text3: 'Nous en avons trouvé beaucoup.',
    text4: 'Mais ce qui compte vraiment, c\'est', text4Adjective: 'vous',
    text5Entry: 'Car,', text5Content: 'Votre présence compte', smiley: '.',
    bigTextPart1: 'M', bigTextPart2: 'R',
    wishHeading: 'Joyeux Anniversaire', wishText: 'Avec toute notre considération',
    carouselTitle: 'Ce que l\'équipe a voulu vous dire',
    outroText: 'Nous espérons que ce moment vous a touché.', replayText: '↺ Revoir', outroSmiley: '✦',
  },
};

// Minify HTML — strip comments, collapse whitespace
function minifyHtml(html) {
  return html
    .replace(/<!--(?!FB_PIXEL_ID)[\s\S]*?-->/g, '')        // strip HTML comments
    .replace(/\s{2,}/g, ' ')                                // collapse whitespace
    .replace(/>\s+</g, '><')                                // trim between tags
    .replace(/\/\*[\s\S]*?\*\//g, '');                      // strip CSS comments
}

// Inject protection layer into the HTML
function injectProtection(html, templateName) {
  const watermarkCss = `
<style id="ww-demo-style">
  /* Demo watermark */
  body::after {
    content: 'DÉMO EWISHWELL • DÉMO EWISHWELL • DÉMO EWISHWELL • DÉMO EWISHWELL • DÉMO EWISHWELL • DÉMO EWISHWELL • DÉMO EWISHWELL •';
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.9rem; font-family: sans-serif; font-weight: 700;
    color: rgba(0,0,0,0.06); letter-spacing: 0.1em;
    word-break: break-all; line-height: 2.8;
    pointer-events: none; z-index: 9999;
    background: repeating-linear-gradient(
      -45deg,
      transparent,
      transparent 60px,
      rgba(255,105,180,0.03) 60px,
      rgba(255,105,180,0.03) 120px
    );
  }
  /* Block text selection */
  * { -webkit-user-select: none !important; user-select: none !important; }
</style>`;

  const protectionScript = `
<script id="ww-demo-guard">
(function(){
  // Block right-click
  document.addEventListener('contextmenu', e => e.preventDefault());
  // Block F12, Ctrl+U, Ctrl+S, Ctrl+Shift+I/J, Cmd+U/S
  document.addEventListener('keydown', function(e) {
    var blocked = e.key === 'F12'
      || (e.ctrlKey && ['u','s','i','j','p'].includes(e.key.toLowerCase()))
      || (e.metaKey && ['u','s'].includes(e.key.toLowerCase()))
      || (e.ctrlKey && e.shiftKey && ['i','j','c'].includes(e.key.toLowerCase()));
    if (blocked) e.preventDefault();
  });
  // Detect DevTools open (basic heuristic)
  var threshold = 160;
  setInterval(function() {
    if (window.outerWidth - window.innerWidth > threshold || window.outerHeight - window.innerHeight > threshold) {
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#aaa;font-size:1rem;">🔒 Démo indisponible</div>';
    }
  }, 1000);
  // Disable drag
  document.addEventListener('dragstart', e => e.preventDefault());
})();
</scr` + `ipt>`;

  // Inject right before </head>
  html = html.replace('</head>', watermarkCss + '\n</head>');
  // Inject at end of body
  html = html.replace('</body>', protectionScript + '\n</body>');
  return html;
}

// GET /preview/:templateName
router.get('/:templateName', async (req, res) => {
  const { templateName } = req.params;

  // Security headers — only embeddable from same origin
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Content-Security-Policy', "frame-ancestors 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');

  try {
    const template = await Template.findOne({ name: templateName, active: true }).lean();
    if (!template) return res.status(404).send('<h1>Template not found</h1>');

    const templatePath = path.join(__dirname, `../../templates/${templateName}/index.html`);
    if (!fs.existsSync(templatePath)) return res.status(404).send('<h1>Not found</h1>');

    let html = fs.readFileSync(templatePath, 'utf8');

    const demoData  = DEMO_DATA[templateName] || {};
    const demoStyle = template.defaultStyle || {};
    const scale = '1';

    const injection = `
<style>
  :root {
    --primary: ${demoStyle.primaryColor || '#ff69b4'};
    --accent:  ${demoStyle.accentColor  || '#ffb347'};
    --font:    '${demoStyle.fontFamily  || 'Work Sans'}', sans-serif;
    --fs-scale: ${scale};
  }
  body { font-family: var(--font) !important; }
</style>
<script>
  window.__WW_DATA__  = ${JSON.stringify(demoData)};
  window.__WW_STYLE__ = ${JSON.stringify(demoStyle)};
  window.__WW_META__  = { id: '', demo: true };
</script>`;

    html = html.replace('</head>', injection + '\n</head>');
    html = injectProtection(html, templateName);
    html = minifyHtml(html);

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (e) {
    console.error(e);
    res.status(500).send('<h1>Erreur</h1>');
  }
});

module.exports = router;