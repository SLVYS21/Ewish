/**
 * One-shot script: uploads the 26 per-letter BubbleFont WOFF2 files to Cloudinary CDN.
 * Saves the resulting URLs to bubble-font-urls.json which serve.js reads at runtime.
 *
 *   cd server && node uploadBubbleLetters.js
 *
 * Prerequisite: generate the 26 files first (from project root):
 *   node -e "..." OR run the pyftsubset loop in PowerShell (see README)
 *
 * The templates/bubble-letters/ directory must contain A.woff2 … Z.woff2.
 */
require('dotenv').config();
const cloudinary = require('cloudinary').v2;
const path = require('path');
const fs   = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const LETTERS_DIR  = path.join(__dirname, '../templates/bubble-letters');
const OUTPUT_FILE  = path.join(__dirname, 'bubble-font-urls.json');

async function run() {
  if (!fs.existsSync(LETTERS_DIR)) {
    console.error(`Letters directory not found: ${LETTERS_DIR}`);
    console.error('Generate the 26 WOFF2 files first with pyftsubset (see project README).');
    process.exit(1);
  }

  const existing = fs.existsSync(OUTPUT_FILE) ? JSON.parse(fs.readFileSync(OUTPUT_FILE, 'utf8')) : {};
  const urls = { ...existing };

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  let uploaded = 0;

  for (const letter of letters) {
    const file = path.join(LETTERS_DIR, `${letter}.woff2`);
    if (!fs.existsSync(file)) {
      console.warn(`  skip (not found): ${letter}.woff2`);
      continue;
    }

    if (urls[letter]) {
      console.log(`  already uploaded: ${letter} → ${urls[letter]}`);
      continue;
    }

    const sizeKB = Math.round(fs.statSync(file).size / 1024);
    process.stdout.write(`  uploading ${letter}.woff2 (${sizeKB} KB)… `);

    try {
      const result = await cloudinary.uploader.upload(file, {
        resource_type: 'raw',
        public_id:     `ewishes/bubble-letters/${letter}`,
        overwrite:     true,
        invalidate:    true,
      });
      urls[letter] = result.secure_url;
      console.log(`OK → ${result.secure_url}`);
      uploaded++;
    } catch (err) {
      console.error(`FAILED: ${err.message}`);
    }
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(urls, null, 2), 'utf8');
  console.log(`\nSaved ${Object.keys(urls).length} URLs to bubble-font-urls.json`);
  console.log(`Uploaded ${uploaded} new file(s).`);
}

run().catch(err => { console.error(err.message); process.exit(1); });
