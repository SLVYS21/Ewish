# ================================================================
# myKado — server image (DigitalOcean App Platform / any Docker host)
# ---------------------------------------------------------------
# Pourquoi un Dockerfile plutôt que les buildpacks Heroku ?
#   Le buildpack heroku/nodejs n'installe pas les libs système
#   dont Chromium (téléchargé par puppeteer) a besoin (libnss3,
#   libgtk-3-0, etc.). Ni nixpacks.toml ni Aptfile ne sont lus
#   par le builder DO. Avec un Dockerfile, on contrôle tout.
#
# Build context attendu : la racine du repo (pour accéder à
# `server/` ET `templates/`). Sur DO App Platform : mettre
# "Source Directory" = `/` (racine), ou vide.
# ================================================================

FROM node:22-bookworm-slim AS base

# ─── Libs système requises par Chromium ─────────────────────────
# Liste officielle : https://pptr.dev/troubleshooting
RUN apt-get update && apt-get install -y --no-install-recommends \
      ca-certificates \
      fonts-liberation \
      wget \
      xdg-utils \
      libnss3 libnspr4 \
      libatk1.0-0 libatk-bridge2.0-0 libatspi2.0-0 \
      libcups2 libdbus-1-3 libdrm2 \
      libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
      libgbm1 \
      libpango-1.0-0 libpangocairo-1.0-0 libcairo2 \
      libasound2 \
      libx11-6 libx11-xcb1 libxcb1 libxext6 libxi6 libxrender1 libxtst6 \
      libglib2.0-0 libgtk-3-0 libexpat1 libfontconfig1 \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# ─── Installation deps (couche cache-friendly) ──────────────────
# On copie package*.json d'abord pour bénéficier du cache Docker
# quand seul le code source change.
COPY server/package*.json ./server/
RUN cd server && npm ci --legacy-peer-deps
# ↑ postinstall télécharge Chrome dans server/.cache/puppeteer/

# ─── Templates + code source ────────────────────────────────────
# Copie templates avant server/ pour que la build step suivante
# les trouve dans ../templates.
COPY templates ./templates
COPY server ./server

# ─── Assets client servis par Express ───────────────────────────
# Les fonds de mur sont référencés via /backgrounds/<file>. Express
# les sert depuis ../client/public/backgrounds (voir server/index.js).
COPY client/public/backgrounds ./client/public/backgrounds

# Réplique le build script de package.json : templates dans server/
# pour que TEMPLATES_DIR = server/templates soit résolu tel quel.
RUN cd server && npm run build

# ─── Runtime ────────────────────────────────────────────────────
ENV NODE_ENV=production
ENV PORT=5000
# TEMPLATES_DIR n'a pas besoin d'être défini : le fallback dans
# server/index.js:52 pointe déjà sur server/templates si présent.

EXPOSE 5000

WORKDIR /app/server
CMD ["node", "index.js"]
