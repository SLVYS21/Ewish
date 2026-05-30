const mongoose = require('mongoose');
const contributionSchema = new mongoose.Schema({
  publicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Publication', required: true, index: true },
  transactionId: { type: String, required: true, unique: true },
  amount:        { type: Number, required: true },
  contributorName: { type: String, default: '' },
  isAnonymous:   { type: Boolean, default: false },
  wishId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Wish', default: null },
  status:        { type: String, enum: ['pending', 'confirmed'], default: 'confirmed' },
}, { timestamps: true });
module.exports = mongoose.model('Contribution', contributionSchema);
