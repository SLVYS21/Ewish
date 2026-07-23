const fs = require('fs');

const classicHtml = fs.readFileSync('templates/wall-of-wishes/index.html', 'utf8');
const modernHtml = fs.readFileSync('templates/wall-of-wishes-modern/index.html', 'utf8');

const extractCss = (html) => {
  const match = html.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
  return match ? match[1] : '';
};

const classicCss = extractCss(classicHtml);
const modernCss = extractCss(modernHtml);

const processCSS = (css, prefix) => {
  let processed = css;
  // Replace :root with prefix
  processed = processed.replace(/:root/g, prefix);
  
  // Replace body { ... } with prefix { ... }
  processed = processed.replace(/body(\s*\{|\s*\[)/g, `${prefix}$1`);
  
  // Replace body .something with prefix .something
  processed = processed.replace(/body\s*\./g, `${prefix} .`);
  
  // Prefix main IDs with the prefix to isolate them
  const idsToPrefix = ['wall-header', 'cagnotte-strip', 'add-btn', 'wishes-closed', 'notes-container', 'empty-state', 'add-overlay', 'toast', 'added-overlay', 'gift-overlay', 'thanks-overlay', 'story-viewer', 'cascade'];
  const idRegex = new RegExp(`(#(?:${idsToPrefix.join('|')}))`, 'g');
  processed = processed.replace(idRegex, `${prefix} $1`);

  return processed;
};

const finalCss = `/* CLASSIC TEMPLATE CSS */\n${processCSS(classicCss, '.ww-shell--classic')}\n\n/* MODERN TEMPLATE CSS */\n${processCSS(modernCss, '.ww-shell--modern')}`;

fs.writeFileSync('client/wall/wall.css', finalCss);
console.log('CSS extraction and merging completed successfully.');
