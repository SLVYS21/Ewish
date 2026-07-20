/* ================================================================
   myKado — SSE (Server-Sent Events) pour les murs live
   GET /api/walls/:pubId/stream
   ---------------------------------------------------------------
   Push temps réel :
     - nouveaux vœux approuvés
     - nouvelles contributions cagnotte
     - stats cagnotte
   Le client (mur classique + moderne) s'abonne via EventSource.
   Fallback polling 30s conservé côté client si la connexion coupe.
   ---------------------------------------------------------------
   Notes :
     - Heartbeat "ping" toutes les 15s (garde-vivant proxy/nginx).
     - `retry:` initial de 3s (le navigateur reconnecte auto).
     - Envoie un event `hello` à l'ouverture pour confirmer.
   ================================================================ */

const router = require('express').Router();
const Publication = require('../models/Publication');
const wallEvents  = require('../services/wallEvents');

router.get('/:pubId/stream', async (req, res) => {
  const { pubId } = req.params;

  // Sanity check: existence de la publication avant d'ouvrir le stream.
  const pub = await Publication.findById(pubId).select('_id templateName').lean().catch(() => null);
  if (!pub) return res.status(404).json({ error: 'Publication not found' });

  res.set({
    'Content-Type':      'text/event-stream',
    'Cache-Control':     'no-cache, no-transform',
    'Connection':        'keep-alive',
    'X-Accel-Buffering': 'no', // nginx : désactive le buffering
  });
  res.flushHeaders?.();

  const send = (event, payload) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(payload)}\n\n`);
  };

  // Reconnect delay côté client si la connexion tombe.
  res.write('retry: 3000\n\n');
  send('hello', { pubId: String(pubId), ts: Date.now() });

  // Bind au bus
  const unsubscribe = wallEvents.subscribe(pubId, (evt) => {
    send(evt.type, evt);
  });

  // Heartbeat — commentaire SSE (ligne débutant par ':') est ignoré par le client
  // mais garde la connexion ouverte à travers les proxies.
  const heartbeat = setInterval(() => {
    res.write(`: ping ${Date.now()}\n\n`);
  }, 15000);

  const cleanup = () => {
    clearInterval(heartbeat);
    unsubscribe();
    try { res.end(); } catch {}
  };

  req.on('close', cleanup);
  req.on('aborted', cleanup);
});

module.exports = router;
