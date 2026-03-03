const mongoose = require('mongoose');

const pageEventSchema = new mongoose.Schema({
  event:       { type: String, required: true },  // PageView, ViewContent, InitiateCheckout, Purchase, Lead
  templateName:{ type: String },
  orderId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  value:       { type: Number },   // valeur en FCFA pour Purchase
  currency:    { type: String, default: 'XOF' },
  // Client info (anonymisé)
  ipAddress:   { type: String },
  userAgent:   { type: String },
  fbp:         { type: String },
  fbc:         { type: String },
  referrer:    { type: String },
  // Facebook response
  fbSent:      { type: Boolean, default: false },
  fbEventId:   { type: String },
  fbResponse:  { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

// Index for analytics queries
pageEventSchema.index({ event: 1, createdAt: -1 });
pageEventSchema.index({ createdAt: -1 });

module.exports = mongoose.model('PageEvent', pageEventSchema);