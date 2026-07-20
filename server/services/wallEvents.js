/* ================================================================
   myKado — Wall live events bus
   Pub/Sub in-memory par publicationId. Consommé par la route SSE
   /api/walls/:pubId/stream. Émis depuis routes/wishes.js et
   routes/contributions.js après la persistance.
   ---------------------------------------------------------------
   Types d'événements :
     wish        → nouveau vœu approuvé arrivé sur le mur
     contribution → nouvelle participation cagnotte confirmée
     stats       → agrégat cagnotte mis à jour {total, count, goal, pct}
   Format payload : voir emitWish / emitContribution / emitStats
   ================================================================ */

const { EventEmitter } = require('events');

// Un seul emitter partagé — on scope par channel = String(publicationId).
const bus = new EventEmitter();
// Un mur = potentiellement beaucoup d'écrans (projection + participants).
bus.setMaxListeners(0);

function channelFor(pubId) {
  return `wall:${String(pubId)}`;
}

/** Abonne un listener aux events d'un mur. Retourne un unsubscribe(). */
function subscribe(pubId, listener) {
  const ch = channelFor(pubId);
  bus.on(ch, listener);
  return () => bus.off(ch, listener);
}

function emit(pubId, event) {
  bus.emit(channelFor(pubId), event);
}

/** Nouveau vœu approuvé (jamais un pendingPayment). */
function emitWish(pubId, wish) {
  emit(pubId, {
    type: 'wish',
    data: {
      _id:       String(wish._id),
      firstName: wish.firstName || 'Anonyme',
      role:      wish.role || '',
      message:   wish.message,
      photoUrl:  wish.photoUrl || '',
      audioUrl:  wish.audioUrl || '',
      videoUrl:  wish.videoUrl || '',
      mediaType: wish.mediaType || 'none',
      color:     wish.color ?? 0,
      rot:       wish.rot ?? 0,
      createdAt: wish.createdAt,
    },
  });
}

/** Nouvelle contribution confirmée + éventuel snapshot stats. */
function emitContribution(pubId, contribution, stats) {
  emit(pubId, {
    type: 'contribution',
    data: {
      _id:             String(contribution._id),
      amount:          contribution.amount,
      contributorName: contribution.contributorName || '',
      isAnonymous:     !!contribution.isAnonymous,
      wishId:          contribution.wishId ? String(contribution.wishId) : null,
      createdAt:       contribution.createdAt,
    },
    stats: stats || null,
  });
}

/** Push d'un stats standalone (utile après recalcul serveur). */
function emitStats(pubId, stats) {
  emit(pubId, { type: 'stats', data: stats });
}

module.exports = {
  subscribe,
  emitWish,
  emitContribution,
  emitStats,
};
