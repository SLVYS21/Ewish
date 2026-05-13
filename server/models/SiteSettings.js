const { Schema, model } = require('mongoose');

const SiteSettingsSchema = new Schema({
  key:   { type: String, required: true, unique: true },
  value: { type: Schema.Types.Mixed },
}, { timestamps: true });

module.exports = model('SiteSettings', SiteSettingsSchema);
