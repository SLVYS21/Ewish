/* ── Template HTML cache ─────────────────────────────────────
   Lit et minifie chaque templates/<name>/index.html une fois au
   boot. fs.watch invalide l'entrée quand le fichier change.
   Élimine fs.readFileSync + minify() par requête.
   ──────────────────────────────────────────────────────────── */
const fs = require('fs');
const path = require('path');
const { minify } = require('html-minifier-terser');

const MINIFY_OPTS = {
  collapseWhitespace: true,
  removeComments: true,
  minifyJS: true,
  minifyCSS: true,
  ignoreCustomComments: [/FB_PIXEL_ID/],
};

const cache = new Map(); // templateName -> { html, mtimeMs }
const inflight = new Map(); // templateName -> Promise
let templatesDir = null;
const watchers = new Map();

function resolveDir() {
  if (templatesDir) return templatesDir;
  templatesDir = process.env.TEMPLATES_DIR
    || (fs.existsSync(path.join(__dirname, '../templates'))
        ? path.join(__dirname, '../templates')
        : fs.existsSync(path.join(__dirname, '../../templates'))
          ? path.join(__dirname, '../../templates')
          : null);
  return templatesDir;
}

function templatePath(name) {
  const dir = resolveDir();
  if (!dir) return null;
  return path.join(dir, name, 'index.html');
}

function watch(name, filePath) {
  if (watchers.has(name)) return;
  try {
    const w = fs.watch(filePath, { persistent: false }, () => {
      cache.delete(name);
    });
    w.on('error', () => { cache.delete(name); watchers.delete(name); });
    watchers.set(name, w);
  } catch {}
}

async function loadTemplate(name) {
  const filePath = templatePath(name);
  if (!filePath || !fs.existsSync(filePath)) return null;

  const stat = fs.statSync(filePath);
  const hit = cache.get(name);
  if (hit && hit.mtimeMs === stat.mtimeMs) return hit;

  if (inflight.has(name)) return inflight.get(name);

  const p = (async () => {
    const raw = await fs.promises.readFile(filePath, 'utf8');
    let html = raw;
    try {
      html = await minify(raw, MINIFY_OPTS);
    } catch (err) {
      console.error(`[templateCache] minify failed for ${name}:`, err.message);
    }
    const entry = { html, mtimeMs: stat.mtimeMs };
    cache.set(name, entry);
    watch(name, filePath);
    inflight.delete(name);
    return entry;
  })();

  inflight.set(name, p);
  return p;
}

/**
 * Retourne le HTML du template (minifié, cache boot-time).
 * Retourne null si le template n'existe pas sur disque.
 */
async function getTemplateHtml(name) {
  const entry = await loadTemplate(name);
  return entry ? entry.html : null;
}

/**
 * Précharge tous les templates connus au boot.
 * À appeler dans server/index.js après le montage des routes.
 */
async function preloadTemplates(names) {
  await Promise.all(names.map(n => loadTemplate(n).catch(() => null)));
}

/** Invalide manuellement un template (utile pour tests ou hot-reload). */
function invalidate(name) {
  cache.delete(name);
}

module.exports = {
  getTemplateHtml,
  preloadTemplates,
  invalidate,
};
