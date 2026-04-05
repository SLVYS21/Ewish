const mongoose = require('mongoose');

// const orderSchema = new mongoose.Schema({
//   // Template acheté
//   templateName:  { type: String, required: true },
//   templateLabel: { type: String },
//   basePrice:     { type: Number, required: true },   // FCFA
//   finalPrice:    { type: Number, required: true },   // après promo

//   // Code promo appliqué
//   promoCode:     { type: String },
//   promoDiscount: { type: Number, default: 0 },       // montant remisé en FCFA

//   // Infos client
//   client: {
//     firstName: { type: String, required: true },
//     lastName:  { type: String },
//     email:     { type: String, required: true },
//     phone:     { type: String },
//     country:   { type: String, default: 'BJ' },
//   },

//   // Ce qu'ils veulent dans le site
//   recipientName: { type: String },   // prénom du destinataire
//   occasion:      { type: String },   // anniversaire, retraite, etc.
//   notes:         { type: String },   // instructions spéciales

//   // Statut commande
//   status: {
//     type: String,
//     enum: ['pending', 'confirmed', 'in_progress', 'delivered', 'cancelled'],
//     default: 'pending',
//   },

//   // Publication créée depuis cette commande
//   publicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication' },

//   // Tracking
//   fbEventId:  { type: String },   // pour déduplication Conversions API
//   ipAddress:  { type: String },
//   userAgent:  { type: String },
//   fbp:        { type: String },   // _fbp cookie
//   fbc:        { type: String },   // _fbc cookie

// }, { timestamps: true });

const orderSchema = new mongoose.Schema({
  ref:           { type: String, required: true, unique: true },
  status:        { type: String, enum: ['nouveau','contacté','en_cours','livré','annulé'], default: 'nouveau' },
  templateName:  { type: String, required: true },
  senderName:    { type: String, required: true },
  senderPhone:   { type: String, required: true },
  recipientName: { type: String, required: true },
  occasion:      { type: String, default: '' },
  delay:         { type: String, default: 'flexible' },
  notes:         { type: String, default: '' },
  source:        { type: String, default: 'public' },
  // Lien vers la publication créée (rempli après livraison)
  publicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication', default: null },
  adminNotes:    { type: String, default: '' },
  // Données du formulaire client (rempli après envoi du formulaire)
  templateData:  { type: mongoose.Schema.Types.Mixed, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);