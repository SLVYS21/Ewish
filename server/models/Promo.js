const mongoose = require('mongoose');

const promoSchema = new mongoose.Schema({
  code:        { type: String, required: true, unique: true, uppercase: true, trim: true },
  type:        { type: String, enum: ['percent', 'fixed'], default: 'percent' },
  value:       { type: Number, required: function () { return !this.isCreditGift; } },   // % ou montant FCFA
  minOrder:    { type: Number, default: 0 },        // montant minimum pour activer
  maxUses:     { type: Number, default: null },     // null = illimité
  usedCount:   { type: Number, default: 0 },
  active:      { type: Boolean, default: true },
  expiresAt:   { type: Date, default: null },
  description: { type: String },
  // Restreindre à certains templates
  templates:   [{ type: String }],  // vide = tous les templates

  // Credit specific promos
  isCreditGift: { type: Boolean, default: false },
  creditAmount: { type: Number, default: 0 },
  usedBy:      [{ type: mongoose.Schema.Types.ObjectId, ref: 'AdminUser' }], // Track users who used this code
}, { timestamps: true });

promoSchema.methods.isValid = function(orderAmount, userId = null) {
  if (!this.active) return { ok: false, reason: 'Code inactif' };
  if (this.expiresAt && new Date() > this.expiresAt) return { ok: false, reason: 'Code expiré' };
  if (this.maxUses !== null && this.usedCount >= this.maxUses) return { ok: false, reason: 'Code épuisé' };
  if (userId && this.usedBy && this.usedBy.includes(userId)) return { ok: false, reason: 'Vous avez déjà utilisé ce code' };
  if (orderAmount < this.minOrder) return { ok: false, reason: `Minimum ${this.minOrder} FCFA requis` };
  return { ok: true };
};

promoSchema.methods.computeDiscount = function(amount) {
  if (this.type === 'percent') return Math.round(amount * this.value / 100);
  return Math.min(this.value, amount); // ne pas descendre sous 0
};

module.exports = mongoose.model('Promo', promoSchema);