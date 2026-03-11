const mongoose = require('mongoose');

/* ── Jar of Words sub-schemas ── */
const jarCategorySchema = new mongoose.Schema({
  id:    { type: String, required: true },
  label: { type: String, default: '' },
  color: { type: String, default: '#4e9eff' },
  bg:    { type: String, default: '#d0e8ff' },
  words: [{ type: String }],
}, { _id: false });

const jarConfigSchema = new mongoose.Schema({
  design:     { type: String, enum: ['classic', 'readmewhen', 'scroll'], default: 'classic' },
  words:      [{ type: String }],
  categories: [jarCategorySchema],
}, { _id: false });

/* ── Background per section ── */
// type: 'color' | 'image' | 'gradient'
// value: hex string | image URL | CSS gradient string
// overlay: 0–1 dark overlay on top of image
const sectionBgSchema = new mongoose.Schema({
  type:    { type: String, enum: ['color', 'image', 'gradient'], default: 'color' },
  value:   { type: String, default: '' },
  overlay: { type: Number, default: 0, min: 0, max: 1 },
  blur:    { type: Number, default: 0, min: 0, max: 20 },  // px blur on image bg
}, { _id: false });

/* ── Decoration element ── */
// src: URL of uploaded image
// section: which section key to attach to (global | greeting | music | message | ideas | celebration | outro | ...)
// animation: CSS/GSAP animation name
// position: { x, y } as percentage of section
// size: width in px
// opacity, zIndex, delay (s)
const decorationSchema = new mongoose.Schema({
  id:        { type: String, required: true },   // client-generated uuid
  src:       { type: String, required: true },   // Cloudinary URL
  section:   { type: String, default: 'global' },
  animation: {
    type: String,
    enum: ['none', 'float', 'spin', 'pulse', 'drift', 'pop', 'shake', 'swing', 'bounce'],
    default: 'float',
  },
  position:  {
    x: { type: Number, default: 50 },  // % from left
    y: { type: Number, default: 10 },  // % from top
  },
  size:      { type: Number, default: 80 },     // px
  opacity:   { type: Number, default: 0.85 },
  zIndex:    { type: Number, default: 10 },
  delay:     { type: Number, default: 0 },      // animation delay in seconds
  rotate:    { type: Number, default: 0 },      // initial rotation degrees
}, { _id: false });

const publicationSchema = new mongoose.Schema({
  templateName: { type: String, required: true },
  customName:   { type: String, required: true },
  title:        { type: String, default: 'My Wish' },

  data: { type: mongoose.Schema.Types.Mixed, default: {} },

  jarConfig: {
    type: jarConfigSchema,
    default: null,
  },

  style: {
    primaryColor: { type: String, default: '#ff69b4' },
    accentColor:  { type: String, default: '#ffb347' },
    fontFamily:   { type: String, default: 'Work Sans' },
    fontSize:     { type: String, default: 'medium' },
    theme:        { type: String, default: 'light' },

    // Background per section — key = section slug
    // Special key "global" = fallback for all sections with no specific bg
    backgrounds: {
      type: mongoose.Schema.Types.Mixed,  // { [sectionKey]: sectionBgSchema }
      default: {},
    },
  },

  // Widgets (countdown, age, quote, memories)
  widgets: { type: [mongoose.Schema.Types.Mixed], default: [] },

  // Per-photo position/rotation/scale transforms
  photoTransforms: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Free-form decoration elements
  decorations: [decorationSchema],

  published:   { type: Boolean, default: false },
  publishedAt: { type: Date },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
}, { timestamps: true });

publicationSchema.index({ templateName: 1, customName: 1 }, { unique: true });

module.exports = mongoose.model('Publication', publicationSchema);