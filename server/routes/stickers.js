/* ================================================================
   /api/stickers — liste des stickers disponibles pour les composers
   des murs et de la page collecte.
   ---------------------------------------------------------------
   Lit une fois au boot le dossier server/public/stickers/, cache la
   liste en mémoire. Les stickers sont servis via /stickers/<file>
   (voir server/index.js). Public : le composer est ouvert à tous
   les visiteurs d'un mur.
   ================================================================ */

const router = require('express').Router();
const fs = require('fs');
const path = require('path');

const STICKERS_DIR = path.join(__dirname, '..', 'public', 'stickers');

let cache = null;
function loadStickers() {
  if (cache) return cache;
  try {
    const files = fs.readdirSync(STICKERS_DIR)
      .filter(f => /\.(webp|png|gif)$/i.test(f))
      .sort();
    cache = files.map(name => ({
      id:  name.replace(/\.[^.]+$/, ''),
      url: '/stickers/' + encodeURIComponent(name),
    }));
  } catch {
    cache = [];
  }
  return cache;
}

/* Watch → si l'admin ajoute des stickers, le cache se vide au prochain call. */
try {
  fs.watch(STICKERS_DIR, { persistent: false }, () => { cache = null; });
} catch {}

router.get('/', (req, res) => {
  res.set('Cache-Control', 'public, max-age=300');
  res.json({ stickers: loadStickers() });
});

module.exports = router;
