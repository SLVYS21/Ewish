/* ================================================================
   myKado — Notification service
   Émetteur central — appelé depuis les routes/events métier.
   ================================================================ */

const Notification = require('../models/Notification');
const mongoose = require('mongoose');

/**
 * Retourne l'AdminUser._id du propriétaire d'une publication.
 * Convention: Publication.merchantId === AdminUser._id.toString() pour les merchants.
 * Renvoie null si publication n'a pas de propriétaire (system-owned / anonymous).
 */
async function ownerUserIdForPublication(pubOrId) {
  const pub = typeof pubOrId === 'string' || pubOrId instanceof mongoose.Types.ObjectId
    ? await require('../models/Publication').findById(pubOrId).select('merchantId').lean()
    : pubOrId;
  if (!pub?.merchantId) return null;
  try {
    return new mongoose.Types.ObjectId(pub.merchantId);
  } catch {
    return null;
  }
}

/**
 * Émet une notification pour un utilisateur.
 * Chaque type a un template FR côté serveur — les briques appellent
 * `notify.contributionReceived(userId, { publicationId, contributorName })`.
 */

async function create(payload) {
  try {
    return await Notification.create(payload);
  } catch (err) {
    console.error('[notifications] create failed', err.message);
    return null;
  }
}

const notify = {
  contributionReceived: (userId, { publicationId, contributorName, wallTitle }) =>
    create({
      userId,
      type: 'contribution_received',
      title: `${contributorName || 'Un invité'} a laissé un mot`,
      body: wallTitle ? `Sur "${wallTitle}"` : '',
      actionUrl: publicationId ? `/app/creations/${publicationId}` : '',
      actionLabel: 'Voir le mur',
      publicationId,
    }),

  giftReceived: (userId, { publicationId, amount, currency = 'XOF', fromName }) =>
    create({
      userId,
      type: 'gift_received',
      title: 'Tu as reçu un cadeau',
      body: `${fromName || 'Un invité'} t'a envoyé ${amount} ${currency}`,
      actionUrl: publicationId ? `/app/creations/${publicationId}` : '',
      actionLabel: 'Voir le cadeau',
      publicationId,
      metadata: { amount, currency, fromName },
    }),

  cagnotteContribution: (userId, { publicationId, amount, currency = 'XOF', total }) =>
    create({
      userId,
      type: 'cagnotte_contribution',
      title: 'Nouvelle contribution à ta cagnotte',
      body: `+${amount} ${currency}${total ? ` — total ${total} ${currency}` : ''}`,
      actionUrl: publicationId ? `/app/creations/${publicationId}/cagnotte` : '',
      actionLabel: 'Suivre',
      publicationId,
    }),

  cardOpened: (userId, { publicationId, recipientName }) =>
    create({
      userId,
      type: 'card_opened',
      title: `${recipientName || 'Ton destinataire'} a ouvert ta carte`,
      body: '',
      actionUrl: publicationId ? `/app/creations/${publicationId}` : '',
      publicationId,
    }),

  wallOpened: (userId, { publicationId, recipientName }) =>
    create({
      userId,
      type: 'wall_opened',
      title: `${recipientName || 'Ton destinataire'} a ouvert ton mur`,
      body: '',
      actionUrl: publicationId ? `/app/creations/${publicationId}` : '',
      publicationId,
    }),

  moderationPending: (userId, { publicationId, count = 1 }) =>
    create({
      userId,
      type: 'moderation_pending',
      title: count > 1 ? `${count} messages à modérer` : 'Un message à modérer',
      body: '',
      actionUrl: publicationId ? `/app/creations/${publicationId}/moderation` : '',
      actionLabel: 'Modérer',
      publicationId,
    }),

  kycApproved: (userId) =>
    create({
      userId,
      type: 'kyc_approved',
      title: 'Ton identité est vérifiée',
      body: 'Tu peux maintenant recevoir des cadeaux et activer la cagnotte.',
      actionUrl: '/app/parametres/kyc',
    }),

  kycRejected: (userId, { reason }) =>
    create({
      userId,
      type: 'kyc_rejected',
      title: 'Vérification d\'identité — action requise',
      body: reason || 'Merci de renvoyer tes documents.',
      actionUrl: '/app/parametres/kyc',
      actionLabel: 'Corriger',
    }),

  system: (userId, { title, body, actionUrl, actionLabel }) =>
    create({ userId, type: 'system', title, body, actionUrl, actionLabel }),
};

module.exports = { notify, create, ownerUserIdForPublication };
