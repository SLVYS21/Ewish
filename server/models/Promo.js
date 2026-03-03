const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, uppercase: true, trim: true },
  type:        { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  value:       { type: Number, required: true },   // % ou montant FCFA
  minOrder:    { type: Number, default: 0 },        // montant minimum pour activer
  maxUses:     { type: Number, default: null },     // null = illimité
  usedCount:   { type: Number, default: 0 },
  active:      { type: Boolean, default: true },
  expiresAt:   { type: Date, default: null },
  description: { type: String },
  // Restreindre à certains templates
  templates:   [{ type: String }],  // vide = tous les templates
}, { timestamps: true });

promoSchema.methods.isValid = function(orderAmount) {
  if (!this.active) return { ok: false, reason: 'Code inactif' };
  if (this.expiresAt && new Date() > this.expiresAt) return { ok: false, reason: 'Code expiré' };
  if (this.maxUses !== null && this.usedCount >= this.maxUses) return { ok: false, reason: 'Code épuisé' };
  if (orderAmount < this.minOrder) return { ok: false, reason: `Minimum ${this.minOrder} FCFA requis` };
  return { ok: true };
};

promoSchema.methods.computeDiscount = function(amount) {
  if (this.type === 'percent') return Math.round(amount * this.value / 100);
  return Math.min(this.value, amount); // ne pas descendre sous 0
};

module.exports = mongoose.model('Promo', promoSchema);