---
name: Warm Celebration
version: 1.0.0
status: canonical
description: >
  Brand identity officielle myKado. Source de vérité pour tokens, typographie,
  formes, motion et composants. Tout ce qui vit dans client/design-system/
  et landing/src/ doit dériver de ce document.
colors:
  # ── Sémantiques Warm Celebration ──
  primary: '#E25B45'            # Coral terracotta — battement du cœur festif
  primary-hover: '#F46A54'      # Vivid coral (état hover)
  primary-pressed: '#C94A37'    # Coral pressé (retour au container)
  primary-container: '#FDF0ED'  # coral-subtle
  on-primary: '#FDFBF7'         # Texte sur coral (paper noble)

  secondary: '#E9A23B'          # Honey warm — cadeaux, jalons dorés
  secondary-hover: '#F8BE68'    # Honey soft (état hover)
  secondary-container: '#FEF7EC' # gold-subtle
  on-secondary: '#201524'       # Ink sur honey

  ink-primary: '#201524'        # Plum deep — encre principale
  ink-espresso: '#1B181E'       # Plum espresso — pour surfaces très denses
  ink-muted: '#58413D'          # Plum muted — sur surfaces claires
  ink-tertiary: '#8C716C'       # Outline

  paper-noble: '#FDFBF7'        # Fond principal (coton fin)
  paper-cream: '#F7F3EE'        # Élévation +1 (papier crème)
  paper-sand:  '#EFE9E0'        # Élévation +2 (papier sable, keepsakes)

  border-warm: 'rgba(32, 21, 36, 0.08)'
  border-warm-strong: 'rgba(32, 21, 36, 0.14)'

  # États
  success: '#2E4A3B'
  warning: '#E9A23B'
  error:   '#BA1A1A'
  info:    '#354270'
typography:
  display:
    family: Epilogue
    weights: [500, 600, 700]
    fallback: "'Fraunces', ui-serif, Georgia, serif"
  body:
    family: Plus Jakarta Sans
    weights: [400, 500, 600, 700]
    fallback: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  scale:
    hero-desktop:  { size: 56px, line: 64px, weight: 700, tracking: -0.03em, family: display }
    hero-mobile:   { size: 36px, line: 44px, weight: 700, tracking: -0.02em, family: display }
    h1-desktop:    { size: 40px, line: 48px, weight: 700, tracking: -0.025em, family: display }
    h1-mobile:     { size: 28px, line: 36px, weight: 700, tracking: -0.02em, family: display }
    h2:            { size: 28px, line: 36px, weight: 600, tracking: -0.015em, family: display }
    h3:            { size: 22px, line: 30px, weight: 600, tracking: -0.01em, family: display }
    title-lg:      { size: 20px, line: 28px, weight: 600, tracking: -0.01em, family: body }
    title-md:      { size: 18px, line: 26px, weight: 600, tracking: -0.005em, family: body }
    body-lg:       { size: 17px, line: 26px, weight: 400, family: body }
    body-md:       { size: 15px, line: 24px, weight: 400, family: body }
    body-sm:       { size: 13px, line: 20px, weight: 400, family: body }
    label-lg:      { size: 14px, line: 20px, weight: 600, tracking: 0.01em, family: body }
    label-md:      { size: 12px, line: 16px, weight: 600, tracking: 0.02em, family: body }
    label-tag:     { size: 11px, line: 14px, weight: 700, tracking: 0.06em, family: body, transform: uppercase }
radius:
  sm:      8px    # micro-controls (badges, chips serrés)
  md:      14px   # inputs, chips
  lg:      20px   # buttons pill sizing, small cards
  xl:      28px   # cards standard, modals compacts
  2xl:     36px   # keepsake cards, modals imposants
  pill:    9999px # CTAs, chips actifs
spacing:
  2xs: 4px
  xs:  8px
  sm:  12px
  md:  16px
  lg:  24px
  xl:  32px
  2xl: 48px
  3xl: 72px
  4xl: 96px
  container-max: 1240px
  gutter-desktop: 32px
  gutter-tablet:  24px
  gutter-mobile:  16px
shadows:
  # Ambient warm (teinte plum #201524)
  xs:  '0 1px 2px rgba(32, 21, 36, 0.04)'
  sm:  '0 4px 12px -2px rgba(32, 21, 36, 0.06), 0 2px 4px -2px rgba(32, 21, 36, 0.03)'
  md:  '0 12px 36px -8px rgba(32, 21, 36, 0.08), 0 4px 12px -2px rgba(32, 21, 36, 0.04)'
  lg:  '0 24px 48px -12px rgba(32, 21, 36, 0.12), 0 8px 16px -8px rgba(32, 21, 36, 0.06)'
  xl:  '0 32px 64px -16px rgba(32, 21, 36, 0.16), 0 12px 24px -12px rgba(32, 21, 36, 0.08)'
  # Glow signature (autour des CTAs coral et keepsakes gold)
  glow-coral: '0 8px 24px rgba(226, 91, 69, 0.28)'
  glow-honey: '0 8px 24px rgba(233, 162, 59, 0.24)'
  # Focus rings
  ring-coral: '0 0 0 4px rgba(226, 91, 69, 0.15)'
  ring-error: '0 0 0 4px rgba(186, 26, 26, 0.15)'
motion:
  durations:
    fast:   150ms  # hover
    base:   240ms  # state changes (le fameux 240ms cubic pour cards)
    slow:   400ms  # overlays, sheets
    reveal: 600ms  # reveal keepsakes
  easings:
    out:      'cubic-bezier(0.22, 1, 0.36, 1)'
    emphasis: 'cubic-bezier(0.16, 1, 0.3, 1)'
    spring:   'cubic-bezier(0.34, 1.56, 0.64, 1)'
---

## Brand & Style

myKado crafts an emotional, tactile, and radiant atmosphere designed for gifting,
emotional memory-keeping, and shared collective celebration. Moving decisively away
from cold, utilitarian fintech or standard SaaS interfaces, the visual direction
merges the warmth of fine stationery with the fluid delight of contemporary
digital experiences.

The aesthetic is grounded in **modern editorial warmth** and **soft tactile
physicalism** :

- **Intimacy & Celebration** — warm parchment undertones, glowing coral-terracotta
  accents, and luminous golden honey tones replace stark synthetic whites and
  neon digital colors.
- **Noble Craft** — interfaces evoke physical keepsakes: textured fine papers,
  embossed foil highlights, smooth-curved tactile cards, and soft ambient glows.
- **Emotionally Premium** — sophisticated deep velvet plum/espresso typography
  anchors the experience with editorial gravitas, while bouncy rounded
  micro-interactions and pill badges add festive energy without sacrificing
  elegance.

## Colors — role reference

- **Primary Coral (`#E25B45`) & Vivid Coral (`#F46A54`)** — celebratory heartbeat.
  Core CTAs, emotional highlights, active states, festive flourishes.
- **Secondary Honey (`#E9A23B`) & Warm Honey (`#F8BE68`)** — gifting, golden
  milestones, celebratory moments, tactile treasures (rings, keepsake books, QR plaques).
- **Deep Plum & Espresso (`#201524`, `#1B181E`)** — primary ink. Rich velvet
  contrast for typography, deep midnight containers, crisp icons. **Never use
  generic cold gray.**
- **Noble Paper Canvas (`#FDFBF7`, `#F7F3EE`, `#EFE9E0`)** — foundational
  surfaces. Mimic heavy cotton stock, zero optical glare, luxurious canvas.
- **Tonal Tints (`coral-subtle #FDF0ED`, `gold-subtle #FEF7EC`)** — background
  chips, badge backings, warm callout cards.

## Typography

- **Display (`Epilogue`)** — distinctive, contemporary, architectural with organic
  charm. Elevates titles, celebratory slogans, milestone headers.
- **UI/Body (`Plus Jakarta Sans`)** — friendly, balanced, open. Exceptional
  clarity across collaborative walls, personalized messages, forms, transactions.
- **Accents** — italicized words or highlighted keywords inside headlines take
  primary terracotta (`#E25B45`) or warm golden honey (`#E9A23B`) for rhythm.

## Elevation & depth

Avoid harsh artificial drop shadows. Prefer **soft ambient illumination** and
physical paper-like layering :

- **Ambient Layering** — cards sit on layered paper tiers (`#FDFBF7` on `#F7F3EE`),
  delimited by soft hairline borders (`rgba(32, 21, 36, 0.08)`).
- **Warm Diffuse Shadows** — see `shadows.md` above.
- **Physical Depth for Collectibles** — QR cards, jewelry showcases, book mockups
  float with a slight coral undertone glow (`rgba(226, 91, 69, 0.12)`).
- **Interactive State Elevation** — on hover, cards lift `translateY(-3px)` and
  shadow expands over 240ms `cubic-bezier(0.16, 1, 0.3, 1)`.

## Shapes

- **Buttons / Chips / Tags** — pill (`radius-pill`) or `radius-lg` (20px)
- **Cards / Containers** — `radius-xl` to `radius-2xl` (28-36px), keepsake feel
- **QR containers, media badges, polaroids** — smoothed squircle geometry (via SVG
  when possible)

## Components — anchor specs

### Buttons

- **Primary Festive** — coral fill `#E25B45`, text `#FDFBF7`, pill, padding
  `14px 28px`. Hover: shift to `#F46A54` + `scale(1.02)` + `glow-coral`.
- **Secondary Midnight** — plum fill `#201524`, text `#FDFBF7`, pill. Authoritative
  for admin/creation checkpoints.
- **Tertiary Warm Ghost** — transparent, fine warm stroke `border-warm`, text
  `#201524`. Hover fills with `coral-subtle` or `paper-cream`.

### Occasion Chips & Filter Badges

- Pill, height `32px` or `36px`, `label-md`.
- Default: `#FFFFFF` or `paper-cream`, border `border-warm`, text `#201524`.
- Active: `#201524` bg + `#FDFBF7` text, OR `coral-subtle` bg + `#E25B45` text
  + `1px solid #E25B45`.

### Keepsake & Collaborative Cards

- Background `#FFFFFF` or textured `#FDFBF7`.
- Generously rounded (`radius-2xl`, 36px), bordered `1px solid border-warm`.
- Internal structure separates visual media (polaroids, QR, gift previews) with
  warm tonal blocks (`paper-cream` or gradient tints) from typography.

### Input Fields

- Generously rounded (`radius-lg`, 20px), background `#FFFFFF` or `paper-noble`,
  stroke `1.5px solid rgba(32, 21, 36, 0.10)`.
- Focus: border → `#E25B45`, ring `0 0 0 4px rgba(226, 91, 69, 0.15)`.
- Placeholder in muted plum-espresso (`rgba(32, 21, 36, 0.4)`).

### Collaborative Wall Sticky Notes

- Fluid playful cards designed like physical celebration notes.
- Subtle rotation variants (`-1deg` to `+1.5deg` on hover) with soft pin badges.
- `radius-xl` (28px), ambient warm paper shadows, contributor avatar micro-chips.

## Voice & tone (short)

- **Warm, sincère, jamais mielleux.** On célèbre sans tomber dans le
  guimauve marketing.
- **Concis.** Un moment de cadeau ne se raconte pas en trois paragraphes.
- **Français d'abord.** Anglais quand le mot fait mieux que sa traduction.
- **Pas d'emojis natifs.** Toujours des icônes (Lucide) ou l'`NotoEmoji`
  component quand il faut du fun animé.

## Migration & governance

Ce fichier est la seule source de vérité brand. En cas de divergence entre :
- ce fichier
- `client/design-system/tokens.css`
- `landing/src/tokens.css`
- mémoire Claude (`memory/*.md`)

→ **BRAND.md gagne toujours.** Toute évolution doit d'abord modifier BRAND.md,
puis les tokens en aval.
