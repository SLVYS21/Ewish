const mongoose = require('mongoose');

const fieldSchema = new mongoose.Schema({
  key: String,
  label: String,
  type: { type: String, enum: ['text', 'textarea', 'image', 'url', 'color', 'select'] },
  placeholder: String,
  options: [String],   // for select
  section: String,     // Content section grouping e.g. "Intro", "Story", "Wishes"
  required: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
});

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },  // e.g. "birthday"
  label: { type: String, required: true },               // e.g. "Birthday Wish"
  description: String,
  thumbnail: String,
  fields: [fieldSchema],
  defaultData: { type: mongoose.Schema.Types.Mixed, default: {} },
  defaultStyle: {
    primaryColor: { type: String, default: '#ff69b4' },
    accentColor:  { type: String, default: '#ffb347' },
    fontFamily:   { type: String, default: 'Work Sans' },
    fontSize:     { type: String, default: 'medium' },
    theme:        { type: String, default: 'light' },
  },
  createdAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);