/**
 * One-shot script: uploads BubbleFont.ttf as-is to Cloudinary CDN
 * and patches all templates with the absolute CDN URL.
 *
 *   cd server && node uploadFont.js
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

const FONT_SRC = path.join(__dirname, '../templates/BubbleFont.ttf');

const TEMPLATES = [
  '../templates/birthday/index.html',
  '../templates/special/index.html',
  '../templates/collective-family/index.html',
  '../templates/collective-pro/index.html',
].map(p => path.join(__dirname, p));

async function run() {
  if (!fs.existsSync(FONT_SRC)) {
    console.error('Font not found at', FONT_SRC);
    process.exit(1);
  }

  const sizeKB = (fs.statSync(FONT_SRC).size / 1024).toFixed(0);
  console.log(`Uploading BubbleFont.ttf (${sizeKB} KB) to Cloudinary…`);

  const result = await cloudinary.uploader.upload(FONT_SRC, {
    resource_type: 'raw',
    public_id: 'ewishes/BubbleFont.ttf',
    overwrite: true,
    invalidate: true,
  });

  const url = result.secure_url;
  console.log('CDN URL:', url);

  let count = 0;
  for (const file of TEMPLATES) {
    if (!fs.existsSync(file)) { console.warn('  skip (not found):', file); continue; }
    let html = fs.readFileSync(file, 'utf8');
    const patched = html.replace(
      "url('../BubbleFont.ttf') format('truetype')",
      `url('${url}') format('truetype')`
    );
    if (patched !== html) {
      fs.writeFileSync(file, patched, 'utf8');
      console.log('  patched:', path.basename(path.dirname(file)));
      count++;
    } else {
      console.warn('  nothing to replace in:', path.basename(path.dirname(file)));
    }
  }

  console.log(`\nDone — ${count} template(s) updated.`);
  console.log('Font is served from Cloudinary CDN — cached permanently after first load per region.');
}

run().catch(err => { console.error(err.message); process.exit(1); });
