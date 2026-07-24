/* ================================================================
   myKado — Wall video export (POC)
   GET /api/walls/:pubId/export/video
     Sert une page HTML qui, côté client :
       - charge les vœux du mur
       - les rejoue en animation dans un <canvas>
       - capture via MediaRecorder → WebM
       - déclenche le téléchargement automatiquement
   ---------------------------------------------------------------
   Pourquoi côté client ?
     - Zéro dépendance serveur lourde (pas de Remotion/ffmpeg).
     - Le user peut prévisualiser avant d'enregistrer.
     - Suffisant pour un premier livrable partageable.
   Limites connues :
     - WebM (Chromium). Pour un vrai MP4 partageable social,
       une v2 côté serveur (Remotion) sera nécessaire.
     - La qualité dépend du browser (bitrate MediaRecorder).
   ================================================================ */

const router = require('express').Router();
const path = require('path');
const fs = require('fs');
const Publication = require('../models/Publication');

const RECORDER_PATH = path.join(__dirname, '..', 'templates', 'wall-export-video', 'index.html');
const FALLBACK_RECORDER_PATH = path.join(__dirname, '..', '..', 'templates', 'wall-export-video', 'index.html');

/* Échappe les chaînes injectées dans un template JS (entre guillemets simples).
   Suffit pour le contexte du recorder — pas d'HTML rendu, uniquement du texte
   consommé par le canvas via drawText. */
function escapeJsString(s) {
  return String(s ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '')
    .replace(/</g, '\\u003c');
}

router.get('/:pubId/export/video', async (req, res) => {
  const filePath = fs.existsSync(RECORDER_PATH) ? RECORDER_PATH : FALLBACK_RECORDER_PATH;
  if (!fs.existsSync(filePath)) {
    return res.status(500).send('Recorder template not found');
  }

  /* On lit la publication pour injecter titre + mot de merci + fond du mur
     dans le recorder, évitant un round-trip API côté client. */
  let recipient = '';
  let thankYou  = '';
  let title     = '';
  let wallBgId  = '';
  let wallBg    = '';
  let wallInk   = '';
  try {
    const pub = await Publication.findById(req.params.pubId)
      .select('title data.recipient data.titleName thankYouMessage style.wallBackgroundId style.wallBackground style.wallBackgroundInk')
      .lean();
    if (pub) {
      /* RECIPIENT = prénom seul (Sarah) pour le générique "— Sarah" de fin.
         Fallback legacy sur titleName/title pour les murs pré-migration. */
      recipient = pub.data?.recipient || pub.data?.titleName || pub.title || '';
      thankYou  = pub.thankYouMessage || '';
      /* Titre affiché au tout début de la vidéo : on utilise le titre
         complet du mur (déjà formaté par occasion) sans préfixer "Pour". */
      title     = pub.title || recipient || '';
      wallBgId  = pub.style?.wallBackgroundId || '';
      wallBg    = pub.style?.wallBackground || '';
      wallInk   = pub.style?.wallBackgroundInk || '';
    }
  } catch (err) {
    console.warn('[wallVideo] publication lookup failed', err.message);
  }

  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(/\{\{PUB_ID\}\}/g,      req.params.pubId);
  html = html.replace(/\{\{RECIPIENT\}\}/g,   escapeJsString(recipient));
  html = html.replace(/\{\{THANK_YOU\}\}/g,   escapeJsString(thankYou));
  html = html.replace(/\{\{TITLE\}\}/g,       escapeJsString(title));
  html = html.replace(/\{\{WALL_BG_ID\}\}/g,  escapeJsString(wallBgId));
  html = html.replace(/\{\{WALL_BG\}\}/g,     escapeJsString(wallBg));
  html = html.replace(/\{\{WALL_INK\}\}/g,    escapeJsString(wallInk));

  res.set('Content-Type', 'text/html; charset=utf-8');
  res.set('Cache-Control', 'no-store');
  res.send(html);
});

module.exports = router;
