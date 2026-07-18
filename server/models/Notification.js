/* ================================================================
   myKado — Notification model
   Notifications in-app pour les utilisateurs.
   ================================================================ */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser', required: true, index: true },

  // Type d'événement — dictate icône + template
  type: {
    type: String,
    required: true,
    enum: [
      'contribution_received',    // Un invité a déposé un mot
      'gift_received',            // Cadeau reçu
      'cagnotte_contribution',    // Cagnotte alimentée
      'card_opened',              // Destinataire a ouvert
      'wall_opened',
      'moderation_pending',       // Nouveau message à modérer
      'kyc_approved',
      'kyc_rejected',
      'system',                   // annonce plateforme
    ],
    index: true,
  },

  title:      { type: String, required: true },
  body:       { type: String, default: '' },
  actionUrl:  { type: String, default: '' },       // Où aller au clic (ex: /app/creations/:id)
  actionLabel:{ type: String, default: '' },       // Label du bouton d'action (ex: "Voir le mur")

  // Contexte optionnel
  publicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication', index: true },
  metadata:      { type: mongoose.Schema.Types.Mixed, default: {} },

  read:    { type: Boolean, default: false, index: true },
  readAt:  { type: Date },

  // Delivery — pour tracker envois email/push si activés
  emailSent:{ type: Boolean, default: false },
  emailSentAt:{ type: Date },
  pushSent: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
