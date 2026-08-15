/* eslint-disable no-console */
/**
 * Génère un poster WebP pour chaque démo Inspirations.
 *
 * Prérequis :
 *   - Backend en marche sur http://localhost:5000 (ou VITE_API_URL)
 *   - Publications seedées via server/seeds/seedDemoLanding.js
 *   - `npm i -D puppeteer sharp` dans landing/
 *
 * Usage :
 *   node scripts/generate-posters.js
 *
 * Sortie : landing/public/posters/{tabId}.webp
 */

const path = require('path');
const fs   = require('fs');

const API_URL = process.env.VITE_API_URL || 'http://localhost:5000';
const OUT_DIR = path.join(__dirname, '..', 'public', 'posters');

const VIEWPORT = { width: 1280, height: 800, deviceScaleFactor: 2 };
const CAPTURE_DELAY_MS = 2200; // laisse le template poser fonts + assets

const DEMOS = {
  // Groupes
  birthday_group:  { templateName: 'wall-of-wishes',        customName: 'demo-anniversaire-groupe' },
  wedding_group:   { templateName: 'wall-of-wishes-modern', customName: 'demo-mariage-groupe' },
  birth_group:     { templateName: 'wall-of-wishes-modern', customName: 'demo-naissance-groupe' },
  party_group:     { templateName: 'wall-of-wishes-craft',  customName: 'demo-soiree-groupe' },
  congrats_group:  { templateName: 'wall-of-wishes',        customName: 'demo-felicitations-groupe' },
  memorial_group:  { templateName: 'wall-of-wishes-modern', customName: 'demo-deces-groupe' },
  // Perso
  birthday_perso:  { templateName: 'birthday',   customName: 'demo-anniversaire-solo' },
  wedding_perso:   { templateName: 'forever',    customName: 'demo-mariage-solo' },
  love_perso:      { templateName: 'notre-film', customName: 'demo-amour-solo' },
  birth_perso:     { templateName: 'birthday',   customName: 'demo-naissance-solo' },
  congrats_perso:  { templateName: 'notre-film', customName: 'demo-felicitations-solo' },
  memorial_perso:  { templateName: 'sanctuary',  customName: 'demo-deces-solo' },
};

function demoUrl({ templateName, customName }) {
  return `${API_URL}/site/${templateName}/${customName}?demo=1&noanim=1`;
}

async function main() {
  let puppeteer, sharp;
  try {
    puppeteer = require('puppeteer');
    sharp = require('sharp');
  } catch (e) {
    console.error('Missing deps. Run: npm i -D puppeteer sharp');
    process.exit(1);
  }

  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport(VIEWPORT);

  for (const [id, demo] of Object.entries(DEMOS)) {
    const url = demoUrl(demo);
    console.log(`\n▸ ${id}  ←  ${url}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30_000 });
      await new Promise(r => setTimeout(r, CAPTURE_DELAY_MS));
      const png = await page.screenshot({ type: 'png', fullPage: false });
      const outPath = path.join(OUT_DIR, `${id}.webp`);
      await sharp(png)
        .resize(1600, 1000, { fit: 'cover', position: 'top' })
        .webp({ quality: 78, effort: 5 })
        .toFile(outPath);
      const sizeKb = (fs.statSync(outPath).size / 1024).toFixed(1);
      console.log(`  ✓ saved  ${outPath}  (${sizeKb} KB)`);
    } catch (err) {
      console.error(`  ✗ failed: ${err.message}`);
    }
  }

  await browser.close();
  console.log('\nDone.');
}

main().catch((e) => { console.error(e); process.exit(1); });
