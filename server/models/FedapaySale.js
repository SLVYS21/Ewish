const mongoose = require('mongoose');

/* ================================================================
   FedapaySale — enregistrement d'une vente FedaPay reçue via webhook.
   ---------------------------------------------------------------
   Sert de :
     1. Source de vérité serveur pour "cette transaction FedaPay
        existe et est approuvée" — consultée par publication.js quand
        le client envoie fedapayTransactionId au moment du publish.
     2. Ligne d'audit + idempotence (dédup sur eventId).
   ---------------------------------------------------------------
   Alimenté uniquement par server/routes/fedapay.js (webhook signé).
   ================================================================ */
const fedapaySaleSchema = new mongoose.Schema({
  /* Idempotence webhook — FedaPay retry jusqu'à 10 fois. On
     dédoublonne sur l'ID de l'Event object (event.id) qui est
     stable par livraison. */
  eventId: { type: String, index: true, unique: true, sparse: true },

  /* Identifiants FedaPay */
  transactionId: { type: Number, required: true, index: true },
  reference:     { type: String, index: true },

  /* Événement d'origine (transaction.approved, .declined, .canceled…) */
  event: { type: String, required: true },

  /* Montant et devise */
  amount:   { type: Number, required: true },
  currency: { type: String, required: true, default: 'XOF' },

  /* Client (dépôt d'informations minimales) */
  customerEmail: { type: String },
  customerName:  { type: String },

  /* Métadonnées passées à Transaction.create — clé pour retrouver
     notre entité :
       - pubId   : Publication liée (mur ou carte)
       - product : 'card' | 'wall_simple' | 'wall_premium'
       - plan    : 'premium' | 'infinite' (walls uniquement) */
  customMetadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  pvar:           { type: String, index: true }, // pubId aplati pour requête directe

  /* Statut applicatif — "received" = webhook reçu, "applied" = plan
     appliqué à la Publication, "orphan" = pas de pubId dans metadata. */
  status: {
    type: String,
    enum: ['received', 'applied', 'orphan', 'failed_apply'],
    default: 'received',
  },
  appliedToPublicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Publication',
    index: true,
  },
  appliedError: { type: String },

  /* Payload brut pour debug */
  rawPayload: { type: mongoose.Schema.Types.Mixed },

  receivedAt: { type: Date, default: Date.now },
  appliedAt:  { type: Date },
}, { timestamps: true });

module.exports = mongoose.model('FedapaySale', fedapaySaleSchema);
