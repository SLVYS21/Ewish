const { join } = require('path');

/**
 * Force Puppeteer to store its browser cache inside the project tree
 * so it survives the build → runtime step of the deployment (Coolify,
 * Nixpacks, Docker, etc.). The default (~/.cache/puppeteer) is often
 * wiped between phases.
 */
module.exports = {
  cacheDirectory: join(__dirname, '.cache', 'puppeteer'),
};
