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
  showAfter: {type: Number, default: 0},
  hideAfter: { type: Number, default: 0}
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
    /* myKado defaults — Hybride C+A signature (indigo + gold + crème) */
    primaryColor: { type: String, default: '#1E2952' },
    accentColor:  { type: String, default: '#E8A33D' },
    textColor:    { type: String, default: '#161311' },
    textMuted:    { type: String, default: '#7D7156' },
    fontFamily:   { type: String, default: 'Fraunces' },
    fontSize:     { type: String, default: 'medium' },
    theme:        { type: String, default: 'light' },
    confettiType:  { type: String, default: 'fireworks' },
    paletteId:     { type: String, default: 'mk-signature' },
    typographyId:  { type: String, default: 'mk-editorial' },

    // Nouveaux champs Wall Wizard
    styleBgPreset: { type: String },
    stylePalettePreset: { type: String },
    styleConfettiPreset: { type: String },
    styleCustomBgUrl: { type: String },
    wallBackgroundId: { type: String },
    wallBackground: { type: String },
    wallBackgroundInk: { type: String },
    wallBackgroundSize: { type: String },
    wallAccent: { type: String },
    paletteAccentText: { type: String },

    // Background per section  key = section slug
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

  // Multi-tenant
  merchantId:  { type: String, index: true },

  // Pre-made system
  isPremade:   { type: Boolean, default: false, index: true },
  premadeLabel:{ type: String },

  // Analytics  compteur de visites
  views:       { type: Number, default: 0 },
  lastViewedAt:{ type: Date },

  published:   { type: Boolean, default: false },
  publishedAt: { type: Date },

  // Branding promo button
  showBranding: { type: Boolean, default: false },  // afficher bouton promo eWishWell
  brandingUrl:  { type: String,  default: '' },      // lien custom (WhatsApp ou landing)
  brandingText: { type: String,  default: '' },      // texte custom (WhatsApp ou landing)

  isPaid:      { type: Boolean, default: false },
  planType:    { type: String, enum: ['free', 'premium', 'infinite'], default: 'free' },
  shortCode:   { type: String, unique: true, sparse: true },

  /* Mot de merci du destinataire — ajouté après réception du mur, apparaît
     comme page finale du livre PDF et comme dernière scène de la vidéo.
     Étape 7 du flow murs (voir memory/project_walls_flow.md). */
  thankYouMessage: { type: String, default: '', trim: true, maxlength: 600 },

  /* ── Étape 8 flow murs — destinataire & cagnotte ────────────────────
     Le créateur (merchantId) offre le mur à un destinataire qui doit :
       1. Cliquer sur un lien claim personnalisé (recipientClaimToken)
       2. Se connecter/inscrire, ce qui associe recipientUserId
       3. Passer le KYC via AdminUser.kycStatus === 'approved'
       4. Retirer la cagnotte (withdraw*)
     Ownership du "message de merci" et retrait cagnotte sont gated par
     recipientUserId. Enjeu financier/légal — pas de raccourci ici. */
  recipientEmail:      { type: String, default: '', trim: true, lowercase: true },
  recipientClaimToken: { type: String, index: true, sparse: true },
  recipientClaimExpiry:{ type: Date },
  recipientUserId:     { type: String, index: true, sparse: true },
  recipientClaimedAt:  { type: Date },

  cagnotteWithdrawal: {
    /* pending  = destinataire a demandé le retrait (KYC OK) mais pas encore payé
       paid     = payé à la personne
       none     = rien demandé (défaut) */
    status:    { type: String, enum: ['none', 'pending', 'paid'], default: 'none' },
    method:    { type: String, default: '' },   // 'mobile-money' | 'bank' | 'orange' | 'mtn' | ...
    account:   { type: String, default: '' },   // masqué en lecture, numéro ou IBAN
    requestedAt:{ type: Date },
    paidAt:    { type: Date },
    paidAmount:{ type: Number, default: 0 },
    reference: { type: String, default: '' },
  },

  // URL canonique myKado — slug obligatoire visible dans /c/:slug /m/:slug /g/:slug
  // Auto-généré à la sauvegarde si absent, via pre-save hook (voir bas du fichier)
  // ASCII a-z 0-9 - _, 3–40 chars, unique
  slug:        { type: String, unique: true, sparse: true, index: true },

  // Brique dénormalisée depuis Template.kind pour le routing (redirect /s/ → /c/|/m/|/g/)
  // Rempli à la création à partir du template. Valeur : 'carte' | 'mur' | 'cadeau'
  brique:      { type: String, enum: ['carte', 'mur', 'cadeau'], index: true },
  cagnotteConfig: {
    enabled:           { type: Boolean, default: false },
    description:       { type: String,  default: '' },
    goal:              { type: Number,  default: 0 },
    image:             { type: String,  default: '' },
    deadline:          { type: Date },
    wishesEnabled:     { type: Boolean, default: true },
    minContribution:   { type: Number,  default: 0 },
    maxContribution:   { type: Number,  default: 0 },
    collectTitle:      { type: String,  default: '' },
    collectSubtitle:   { type: String,  default: '' },
    collectCover:      { type: String,  default: '' },
    collectAccentColor:{ type: String,  default: '' },
    isPrivate:         { type: Boolean, default: false },
    accessCode:        { type: String,  default: '' },
    requireModeration: { type: Boolean, default: false },
  },

  // Invitation + RSVP (templates kind='invitation')
  invitationConfig: {
    enabled:          { type: Boolean, default: false },
    mode:             { type: String, enum: ['public', 'list'], default: 'public' },
    eventDate:        { type: Date },
    eventTime:        { type: String, default: '' },        // "19:30"
    location:         { type: String, default: '' },
    locationUrl:      { type: String, default: '' },        // Google Maps link
    rsvpDeadline:     { type: Date },
    allowMaybe:       { type: Boolean, default: true },
    allowPlusOnes:    { type: Boolean, default: false },
    maxPlusOnes:      { type: Number,  default: 0 },
    messageOnAccept:  { type: Boolean, default: true },     // message → post-it sur le mur
    linkedWallTemplate: {
      type: String,
      enum: ['none', 'wall-of-wishes', 'wall-of-wishes-modern', 'wall-of-wishes-space'],
      default: 'wall-of-wishes',
    },
    notifyEmail:        { type: String, default: '' },
    notifyOnEachRsvp:   { type: Boolean, default: false },
    confirmationMessage:{ type: String, default: '' },      // message affiché après réponse
  },

  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
}, { timestamps: true });

publicationSchema.index({ templateName: 1, customName: 1 }, { unique: true });
//publicationSchema.index({ shortCode: 1 }, { unique: true, sparse: true });

/* ─── Slug auto-generation (pre-save hook) ───────────────────────────
   Génère un slug unique à partir du titre ou customName si absent.
   Ne touche jamais un slug déjà présent (pour permettre la personnalisation).
   Doc: notes/ux-rules.md §2, notes/sitemap.md
   ─────────────────────────────────────────────────────────────────── */
const { generateUniqueSlug, isValidSlug } = require('../utils/slug');

const KIND_TO_BRIQUE = { animation: 'carte', wall: 'mur', invitation: 'carte' };

publicationSchema.pre('save', async function (next) {
  try {
    // Slug auto-generation si absent ou invalide
    if (!this.slug || !isValidSlug(this.slug)) {
      const source = this.title || this.customName || 'creation';
      this.slug = await generateUniqueSlug(this.constructor, source, { _id: { $ne: this._id } });
    }
    // Brique auto-populate depuis Template.kind si absente
    if (!this.brique && this.templateName) {
      const Template = require('./Template');
      const tpl = await Template.findOne({ name: this.templateName }).select('kind').lean();
      if (tpl?.kind) this.brique = KIND_TO_BRIQUE[tpl.kind] || 'carte';
    }
    next();
  } catch (err) {
    next(err);
  }
});

module.exports = mongoose.model('Publication', publicationSchema);