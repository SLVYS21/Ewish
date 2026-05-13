const { Schema, model } = require('mongoose');

const SuggestionSchema = new Schema({
  merchantId:  { type: String, required: true },
  authorName:  { type: String, default: 'Anonyme' },
  authorEmail: { type: String },
  category:    { type: String, enum: ['feature', 'bug', 'design', 'other'], default: 'feature' },
  message:     { type: String, required: true, maxlength: 1000 },
  status:      { type: String, enum: ['new', 'read', 'planned', 'done', 'rejected'], default: 'new' },
  adminNote:   { type: String, default: '' },
  upvotes:     { type: Number, default: 0 },
}, { timestamps: true });

module.exports = model('Suggestion', SuggestionSchema);
