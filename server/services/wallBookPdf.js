/* ================================================================
   myKado — Wall Book PDF generator
   Génère un "livre des mots" A5 portrait à partir d'un mur.
     1  page de couverture (destinataire + événement)
     2  page de préface (nombre de mots, sous-titre)
     3  N pages : un mot par page (post-it façon mur)
     4  page finale (signature myKado)
   Rendu via Puppeteer — HTML/CSS puis print-to-PDF.
   ---------------------------------------------------------------
   Points sensibles :
     - Puppeteer + Chromium pèsent lourd. On garde une instance
       chrome partagée via getBrowser() pour éviter le cold start.
     - Les couleurs pastel viennent du mur classique (index.html:412).
       Si on ajoute une variante moderne du livre, on switchera ici.
     - Les photos Cloudinary passent en thumbnail (`c_fill,g_face,w_900`)
       pour éviter d'embarquer des originaux 4K dans le PDF.
   ================================================================ */

let _browserPromise = null;
async function getBrowser() {
  if (_browserPromise) return _browserPromise;
  const puppeteer = require('puppeteer');
  _browserPromise = puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  }).catch(err => {
    _browserPromise = null;
    throw err;
  });
  return _browserPromise;
}

/* Palette post-it du mur classique — synchronisée avec index.html:412-418. */
const STICKY_BG = ['#FFF7B8', '#C6F0C2', '#BFE3FF', '#FFD3C2', '#E7D5F0', '#F6E3C8', '#F9F5EA'];

function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function cldThumb(url, tx) {
  if (!url || typeof url !== 'string') return url;
  if (url.indexOf('/upload/') === -1) return url;
  return url.replace('/upload/', `/upload/${tx}/`);
}

function formatFrenchDate(d) {
  try {
    return new Date(d).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch { return ''; }
}

/* ---------- HTML builder ---------- */
function buildBookHtml({ publication, wishes }) {
  const d = publication.data || {};
  const recipient = d.titleName || publication.title || 'Toi';
  const subtitle  = d.subtitle || 'Un mur de mots rassemblés avec amour.';
  const eventName = d.event || d.eventName || d.occasion || '';
  const generatedAt = formatFrenchDate(new Date());
  const wishCount = wishes.length;

  const cover = `
    <section class="page cover">
      <div class="cover-frame">
        <div class="cover-kicker">Livre des mots</div>
        <h1 class="cover-title">Pour ${escapeHtml(recipient)}</h1>
        ${eventName ? `<div class="cover-event">${escapeHtml(eventName)}</div>` : ''}
        <div class="cover-sub">${escapeHtml(subtitle)}</div>
        <div class="cover-count">${wishCount} mot${wishCount > 1 ? 's' : ''} reçu${wishCount > 1 ? 's' : ''}</div>
        <div class="cover-date">${escapeHtml(generatedAt)}</div>
      </div>
    </section>
  `;

  const preface = `
    <section class="page preface">
      <div class="preface-inner">
        <div class="preface-mark">«</div>
        <p>Voici tous les mots que tes proches ont laissés sur ton mur.</p>
        <p>Chaque page est un souvenir. Prends ton temps.</p>
        <div class="preface-mark end">»</div>
      </div>
    </section>
  `;

  const wishPages = wishes.map((w, i) => {
    const bg = STICKY_BG[(w.color ?? 0) % STICKY_BG.length];
    const rot = (typeof w.rot === 'number' ? w.rot : 0);
    const clampedRot = Math.max(-4, Math.min(4, rot));
    const hasPhoto = w.mediaType === 'photo' && w.photoUrl;
    const photoTag = hasPhoto
      ? `<div class="wish-photo"><img src="${escapeHtml(cldThumb(w.photoUrl, 'c_fill,g_auto,w_900,h_680,q_auto'))}" alt=""></div>`
      : '';
    return `
      <section class="page wish-page">
        <div class="wish-note" style="background:${bg};">
          ${photoTag}
          <div class="wish-body">
            <p class="wish-text">${escapeHtml(w.message)}</p>
            <div class="wish-signature">
              <span class="wish-name">${escapeHtml(w.firstName || 'Anonyme')}</span>
              ${w.role ? `<span class="wish-role">${escapeHtml(w.role)}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="page-num">${i + 1} / ${wishCount}</div>
      </section>
    `;
  }).join('');

  /* Mot de merci du destinataire — étape 7 du flow murs.
     Injecté juste avant l'outro, seulement s'il est non-vide. */
  const thankYouPage = publication.thankYouMessage?.trim()
    ? `
      <section class="page thankyou">
        <div class="thankyou-inner">
          <div class="thankyou-kicker">Un mot pour vous tous</div>
          <p class="thankyou-body">${escapeHtml(publication.thankYouMessage.trim())}</p>
          <div class="thankyou-sig">— ${escapeHtml(recipient)}</div>
        </div>
      </section>
    `
    : '';

  const outro = `
    <section class="page outro">
      <div class="outro-inner">
        <div class="outro-mark">myKado</div>
        <div class="outro-tag">Généré le ${escapeHtml(generatedAt)}</div>
      </div>
    </section>
  `;

  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Livre des mots — ${escapeHtml(recipient)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Caveat:wght@400;600&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<style>
  :root {
    --ink:      #1E2952;
    --ink-2:    #4a4f66;
    --muted:    #7D7156;
    --paper:    #F9F5EA;
    --gold:     #E8A33D;
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  html, body { background: var(--paper); color: var(--ink); font-family: 'Fraunces', Georgia, 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji', sans-serif; }
  @page { size: A5 portrait; margin: 0; }
  .page {
    width: 148mm;
    height: 210mm;
    page-break-after: always;
    position: relative;
    overflow: hidden;
    background: var(--paper);
    padding: 22mm 20mm;
  }
  .page:last-child { page-break-after: auto; }

  /* ── COVER ── */
  .cover {
    background: linear-gradient(160deg, #FBE7A2 0%, #F6CFC3 55%, #E7D5F0 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 22mm 18mm;
  }
  .cover-frame {
    border: 2px solid var(--ink);
    padding: 18mm 12mm;
    text-align: center;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 6mm;
    background: rgba(255,255,255,0.35);
  }
  .cover-kicker {
    font-family: 'Inter', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.24em;
    font-size: 10pt;
    color: var(--ink-2);
  }
  .cover-title {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 700;
    font-size: 38pt;
    line-height: 1.05;
    color: var(--ink);
  }
  .cover-event {
    font-family: 'Caveat', cursive;
    font-size: 28pt;
    color: var(--gold);
  }
  .cover-sub {
    font-family: 'Inter', sans-serif;
    font-size: 11pt;
    color: var(--ink-2);
    line-height: 1.5;
    max-width: 82mm;
    margin: 0 auto;
  }
  .cover-count {
    margin-top: auto;
    font-family: 'Inter', sans-serif;
    font-size: 10pt;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--ink-2);
  }
  .cover-date {
    font-family: 'Inter', sans-serif;
    font-size: 9pt;
    color: var(--muted);
  }

  /* ── PREFACE ── */
  .preface { display: flex; align-items: center; justify-content: center; }
  .preface-inner {
    max-width: 100mm;
    text-align: center;
    font-family: 'Fraunces', Georgia, serif;
    font-size: 15pt;
    line-height: 1.6;
    color: var(--ink);
  }
  .preface-inner p + p { margin-top: 6mm; }
  .preface-mark {
    font-family: 'Fraunces', Georgia, serif;
    font-size: 64pt;
    color: var(--gold);
    line-height: 0.6;
    margin-bottom: 6mm;
  }
  .preface-mark.end { margin: 6mm 0 0; }

  /* ── WISH PAGES ── */
  .wish-page {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 15mm;
  }
  .wish-note {
    width: 108mm;
    max-height: 170mm;
    padding: 12mm 12mm 10mm;
    border-radius: 4mm;
    box-shadow:
      0 2mm 4mm rgba(0,0,0,0.10),
      0 6mm 12mm rgba(0,0,0,0.06);
    display: flex;
    flex-direction: column;
    gap: 6mm;
  }
  .wish-photo {
    width: 100%;
    height: 55mm;
    overflow: hidden;
    border-radius: 2mm;
    background: rgba(0,0,0,0.05);
  }
  .wish-photo img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .wish-body { display: flex; flex-direction: column; gap: 6mm; flex: 1; }
  .wish-text {
    font-family: 'Caveat', cursive, 'Segoe UI Emoji', 'Apple Color Emoji', 'Noto Color Emoji';
    font-size: 16pt;
    line-height: 1.45;
    color: #2a2540;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .wish-signature {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
    align-items: baseline;
    gap: 3mm;
  }
  .wish-name {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 700;
    font-size: 14pt;
    color: var(--ink);
  }
  .wish-role {
    font-family: 'Inter', sans-serif;
    font-size: 9pt;
    color: var(--ink-2);
    font-style: italic;
  }
  .page-num {
    position: absolute;
    bottom: 8mm;
    left: 0;
    right: 0;
    text-align: center;
    font-family: 'Inter', sans-serif;
    font-size: 8pt;
    letter-spacing: 0.14em;
    color: var(--muted);
  }

  /* ── THANK YOU PAGE (destinataire) ── */
  .thankyou {
    background: linear-gradient(160deg, #FFF5F7 0%, #FBE7A2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 22mm 20mm;
  }
  .thankyou-inner {
    max-width: 108mm;
    text-align: center;
  }
  .thankyou-kicker {
    font-family: 'Inter', sans-serif;
    text-transform: uppercase;
    letter-spacing: 0.24em;
    font-size: 10pt;
    color: var(--gold);
    margin-bottom: 10mm;
  }
  .thankyou-body {
    font-family: 'Caveat', cursive;
    font-size: 26pt;
    line-height: 1.4;
    color: var(--ink);
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .thankyou-sig {
    margin-top: 12mm;
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 700;
    font-size: 16pt;
    color: var(--ink);
    font-style: italic;
  }

  /* ── OUTRO ── */
  .outro {
    background: var(--ink);
    color: #EBE3CE;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .outro-inner { text-align: center; }
  .outro-mark {
    font-family: 'Fraunces', Georgia, serif;
    font-weight: 700;
    font-size: 32pt;
    letter-spacing: 0.02em;
    color: var(--gold);
  }
  .outro-tag {
    margin-top: 4mm;
    font-family: 'Inter', sans-serif;
    font-size: 9pt;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #EBE3CE;
  }
</style>
</head>
<body>
${cover}
${preface}
${wishPages}
${thankYouPage}
${outro}
</body>
</html>`;
}

/* ---------- Public API ---------- */
async function renderWallBookPdf({ publication, wishes }) {
  const html = buildBookHtml({ publication, wishes });
  const browser = await getBrowser();
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'networkidle0' });
    await page.evaluate(() => new Promise(resolve => setTimeout(resolve, 2500)));
    await page.evaluateHandle('document.fonts.ready');
    const pdf = await page.pdf({
      format: 'A5',
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    return pdf;
  } finally {
    await page.close();
  }
}

module.exports = { renderWallBookPdf, buildBookHtml };
