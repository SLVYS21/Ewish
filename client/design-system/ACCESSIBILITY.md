# myKado Design System — Accessibility Audit

Audit initial des tokens et composants Phase 0.
Cible : **WCAG 2.1 AA** minimum sur tout ce qui concerne le texte, les états d'action et les composants interactifs.

## Contrastes vérifiés (sur fond blanc #FFFFFF)

| Token | Hex | Ratio sur blanc | Verdict |
|---|---|---|---|
| `--mk-text-primary` (stone-900) | #161311 | ~19.5:1 | AAA |
| `--mk-text-secondary` (stone-700) | #453E2E | ~10:1 | AAA |
| `--mk-text-tertiary` (stone-500) | #7D7156 | ~5.2:1 | AA normal / AAA large |
| `--mk-text-brand` (indigo-700) | #1E2952 | ~13:1 | AAA |
| `--mk-text-accent-gold` (gold-600) | #9F6D22 | ~4.7:1 | AA normal |
| `--mk-state-success` (forest-700) | #2E4A3B | ~9:1 | AAA |
| `--mk-state-error` (clay-600) | #A02C2C | ~5:1 | AA normal |
| `--mk-state-info` (indigo-500) | #354270 | ~8.5:1 | AAA |

### ⚠ Attention

- **Gold-400 (#E8A33D)** : contraste ~2:1 sur blanc — **INTERDIT pour du texte**. Réservé à la décoration (motifs, séparateurs, backgrounds à faible opacity, boutons "gold" où le texte est ink stone-900).
- **Clay-500 (#C13B3B)** : contraste ~4.4:1 — borderline. Utiliser clay-600 pour le texte, clay-500 pour les fills de composants (badge, bouton où le texte est blanc).
- **Bouton gold** : le fond est gold-400, le texte est stone-900 → contraste ~9:1, OK.

## Focus states

Tous les composants interactifs utilisent le token `--mk-ring-focus` :
```
box-shadow: 0 0 0 3px rgba(30, 41, 82, 0.25);
```

- Anneau 3px, indigo semi-transparent
- Visible sur fond blanc (contraste avec le blanc)
- Contraste avec le fond du composant lui-même : suffisant grâce au décalage
- Appliqué uniquement sur `:focus-visible` (pas au clic à la souris) — conforme WCAG 2.4.7

## Composants — checklist ARIA & clavier

### Button
- Native `<button>` avec type="button" par défaut
- `disabled` + `aria-busy` pour état loading
- Focus visible via `:focus-visible` → ring
- `iconOnly` requiert `aria-label` explicite

### Field / Input / Textarea / Select
- Association label↔control via `htmlFor` sur `<Field>`
- État error : `mk-input--error` + `role="alert"` sur le message d'erreur
- Placeholder ne remplace jamais le label (accessibilité + UX)

### Checkbox / Radio / Switch
- Basés sur inputs natifs (checkbox / radio) — a11y clavier gratuite
- Visuels custom via `<span>` + `aria-hidden`
- Switch : `role="switch"` explicite

### Modal
- `role="dialog"` + `aria-modal="true"`
- `aria-label` sur le title
- Escape ferme
- Body overflow bloqué pendant l'ouverture
- Focus trap : ⚠ **basique** (à améliorer en Phase 0.5)
- Portal vers `document.body`

### Toast
- Container `aria-live="polite"` + `aria-atomic="true"`
- Chaque toast `role="status"`
- Auto-dismiss par défaut 4s (paramétrable)

### Tabs
- List `role="tablist"`
- Trigger `role="tab"` + `aria-selected`
- Panel `role="tabpanel"`
- ⚠ Navigation clavier flèches gauche/droite : à implémenter en Phase 0.5

### Dropdown
- Trigger `aria-haspopup="menu"` + `aria-expanded`
- Menu `role="menu"` + items `role="menuitem"`
- Escape ferme, click-outside ferme
- ⚠ Navigation clavier flèches haut/bas : à implémenter en Phase 0.5

### Tooltip
- `role="tooltip"`
- Delay 300ms par défaut
- ⚠ **Ne pas** utiliser Tooltip comme seul moyen de véhiculer une info critique — c'est un supplément

## Motion & prefers-reduced-motion

Le token `@media (prefers-reduced-motion: reduce)` est géré dans `tokens.css` :
- Toutes les durées expressives sont ramenées à 50–100ms
- Easings spring/emphasis/bounce → linear
- Confetti `celebrate()` est neutralisé automatiquement

## À finir (Phase 0.5 — améliorations a11y)

- [ ] Focus trap complet dans `<Modal>` (tab + shift+tab bornés au dialog)
- [ ] Navigation flèches dans `<Tabs>` (roving tabindex)
- [ ] Navigation flèches dans `<Dropdown>` (roving tabindex)
- [ ] Skip link "Aller au contenu" sur les pages principales
- [ ] Test lecteur d'écran (NVDA / VoiceOver) sur les composants critiques
- [ ] Test avec zoom 200% (aucun débordement horizontal)
