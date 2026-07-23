const fs = require('fs');
const path = require('path');

const PROD = process.env.NODE_ENV === 'production';
const DEV_VITE_ORIGIN = process.env.VITE_DEV_SERVER_ORIGIN || 'http://localhost:3000';
const CLIENT_DIST = path.join(__dirname, '../../client/dist');
const WALL_DIST_INDEX = path.join(CLIENT_DIST, 'wall', 'index.html');

function getReactWallShell() {
  if (PROD) {
    if (!fs.existsSync(WALL_DIST_INDEX)) {
      return null;
    }
    return fs.readFileSync(WALL_DIST_INDEX, 'utf8');
  }

  return `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#111111" />
    <title>Mur myKado</title>
    <script type="module">
      import RefreshRuntime from '${DEV_VITE_ORIGIN}/@react-refresh'
      RefreshRuntime.injectIntoGlobalHook(window)
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>
    <script type="module" src="${DEV_VITE_ORIGIN}/@vite/client"></script>
    <script type="module" src="${DEV_VITE_ORIGIN}/wall/main.jsx"></script>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`;
}

module.exports = {
  getReactWallShell,
  WALL_DIST_INDEX,
};
