# myKado — Roadmap

**Direction visuelle** : Hybride C+A (Afro-Modern Elegance + ergonomie Editorial), fond blanc, UX-first.
**Principe** : identité forte + lisibilité éditoriale + cohérence totale sur toutes les briques.

Légende : `[ ]` à faire · `[~]` en cours · `[x]` fait · `[-]` déprécié

---

## Phase 0 — Design System

Base commune à toutes les briques. À terminer avant de coder des écrans.

- [x] Analyse concurrents (KudoBoard, ThankBox)
- [x] Choix direction visuelle → Hybride C+A sur fond blanc
- [x] Tokens couleurs (primaire indigo, or, argile, neutres chauds)
- [x] Tokens typographie (Fraunces titres + Inter body, échelle H1→caption)
- [x] Tokens spacing (échelle 4/8px)
- [x] Tokens radius (cartes 12–16, inputs 8–10, boutons pilule)
- [x] Tokens shadows (chaudes, pas neutres)
- [x] Tokens motion (durées, easings)
- [x] Iconographie stroke-based (Lucide) — inventaire icônes myKado
- [x] Bibliothèque motifs afro-modern SVG (abstraits, jamais figuratifs)
- [x] Bibliothèque confettis & éléments célébration
- [x] Composants primitifs : Button, Input, Textarea, Select, Checkbox, Radio, Switch
- [x] Composants composés : Card, Modal, Toast, Tabs, Dropdown, Tooltip
- [x] Composants layout : Container, Grid, Stack, Divider
- [x] Page démo / design system live (route interne `/design-system`)
- [x] Audit accessibilité (contrastes AA, focus states)

## Phase 1 — Architecture UX globale

Le squelette. Référentiel obligatoire : `notes/ux-rules.md`.

**Règles UX transverses (rappel)** :
- Inclusivité 8→50+ ans (labels explicites, icônes+texte, contrastes, tailles tactiles)
- Toute action réussie enchaîne intelligemment (funnels post-action)
- Backward compat totale : `/s/:shortCode` reste servi pour toujours

### Sitemap & flows
- [x] Sitemap myKado unifié (public + app + business) — `notes/sitemap.md`
- [x] Flow créateur : occasion → destinataire → brique → template → personnalisation → envoi — `notes/flows.md §1`
- [x] Flow destinataire : réception → ouverture → interaction → réponse — `notes/flows.md §2`
- [x] Flow invité mur : accès lien → contribution sans compte — `notes/flows.md §3`
- [x] Funnel post-contribution mur : contribution → (cagnotte/cadeau) → partage → créer le sien — `notes/flows.md §4b`
- [x] Funnel post-création : preview + lien + personnaliser + calendrier — `notes/flows.md §4a`
- [x] Funnel post-réception : créer à son tour + répondre aux invités — `notes/flows.md §4c`

### URLs & backward compat
- [x] Sitemap URLs canoniques : `/c/:slug` `/m/:slug` `/g/:slug` (id caché, slug obligatoire) — `server/routes/canonical.js`
- [x] Modèle `Publication` : ajouter champ `slug` (unique, ASCII 3–40) + champ `brique` dénormalisé — `server/models/Publication.js`
- [x] Générateur de slug par défaut (basé sur titre/destinataire) — `server/utils/slug.js` + pre-save hook
- [x] Redirect middleware : `/s/:shortCode` → forme canonique (301) — `server/routes/shortlinks.js`
- [x] Route legacy `/s/:shortCode` maintenue en service permanent
- [x] API `POST /api/publications/slug-check` + `PATCH /api/publications/:id/slug` + `GET /api/publications/by-slug/:slug`
- [x] Écran "Personnaliser le lien" (composant `<PersonalizeLinkModal>` — suggestion auto + validation live debouncée + toast)
- [x] Wire `<PersonalizeLinkModal>` dans `SharePage` (bouton "Personnaliser le lien myKado")

### App shell
- [ ] Dashboard utilisateur : mes cartes / murs / cadeaux (donnés, reçus, brouillons, invitations) — DIFFÉRÉ (design UI attend refonte)
- [x] Écran sélection brique `/app/creer` — flow créateur §3 avec design system (3 grandes cards carte/mur/cadeau, contextualisé occasion+destinataire via query params)
- [ ] Auth + onboarding — DIFFÉRÉ (existant fonctionne, refresh design plus tard)
- [x] Système de notifications in-app (infra serveur) — `Notification` model + `services/notifications.js` (émetteur) + `/api/notifications` + `useNotifications` hook + `NotificationBell` composant
- [ ] Système de notifications email — DIFFÉRÉ (nécessite provider SMTP + templates)
- [x] Émettre notifs depuis les points d'usage : wish contribution (mur), cagnotte confirmed, KYC approved/rejected — câblés dans `routes/wishes.js` `routes/contributions.js` `routes/kyc.js` avec helper `ownerUserIdForPublication`
- [ ] Émettre notifs "card_opened" / "wall_opened" — nécessite tracker view côté template (à faire quand on refera les templates)
- [x] Wire `<NotificationBell>` dans `AdminLayout` (mobile topbar + sidebar footer)
- [x] Composant export QR unifié — `client/components/QRExport.jsx` (formes cœur/carré/cercle + fonds blanc/crème/indigo/motif + preview live + télécharger nommé par usage + partager/imprimer)
- [x] Wire `<QRExport>` dans `SharePage` (bouton "Exporter en QR (formes, fonds, tailles)")
- [x] `ToastProvider` global au niveau App (permet aux modals design-system d'émettre des toasts partout)
- [ ] Migration `/ewish-admin/*` → `/app/*` — DIFFÉRÉ (gros refactor sitemap client, target Phase 2/3)

## Phase 2 — Landing page publique

- [x] Mockup v4 Hybride C+A complet — `landing/mockup/v4-mykado.html`
- [x] Wireframe home (traduit en HTML)
- [x] Hero + SubHero — piste user "Vous voulez faire mieux qu'un WhatsApp ?" + eyebrow "Cartes · Murs · Cadeaux"
- [x] Visuel hero : cluster de 4 cartes overlappantes inclinées + confetti decorations
- [x] Section 3 briques (cartes / murs / cadeaux) avec icônes color-coded et features par brique
- [x] Section "Comment ça marche" en 4 étapes
- [x] Section tarifs multi-devises XOF/EUR/USD (tabs)
- [x] Section business teaser B2B (fond indigo inversé, gold accents)
- [x] Footer + mentions légales
- [x] Migration mockup → React — `landing/src/App.jsx` + composants `Navbar`, `Hero`, `Briques`, `HowItWorks`, `Pricing` (tabs multi-devises fonctionnels), `Business`, `Footer` + CSS modules alignés sur tokens Hybride C+A. Legacy pastel supprimé de `index.css`.
- [ ] i18n FR / EN — à ajouter avec react-i18next ou intl (défere quand marché EN visé)
- [x] Responsive mobile-first (breakpoints intégrés au mockup)

## Phase 3 — Brique Cartes animées

- [x] Refonte visuelle templates existants (birthday, special, forever, notre-film, sanctuary) — défauts CSS `:root` alignés Hybride C+A, Fraunces + Inter ajoutées, chaque template ajusté à son mood (indigo pour anniv, clay pour romance, stone-700 pour sacré)
- [x] Palettes StyleTab enrichies : 6 palettes mk-* (signature, terre, forêt, nuit dorée, argile, indigo clair) + 4 palettes texte mk-* + 2 typographies mk-* (Éditorial Fraunces, Moderne Inter) — legacy pastel conservé
- [x] Publication defaults serveur → myKado signature (indigo + gold + Fraunces + mk-editorial)
- [ ] Éditeur unifié cartes (musique + photos + texte + décos)
- [ ] Intégration musique YouTube / Spotify (embed + preview)
- [ ] Suggestions musique par zone géo (sourcing playlist + logique geo)
- [ ] Upload photos (max 3) + crop/compression
- [ ] Bibliothèque décorations (pétales, ballons, confettis) réutilisable
- [ ] Attachement cadeau optionnel
- [ ] Export QR (formes carré / cercle / cœur)
- [ ] Export lien + partage social
- [ ] Preview mobile intégré à l'éditeur

## Phase 4 — Brique Murs collaboratifs

- [ ] Setup mur : thème, style confettis, style post-its
- [ ] Options modération (validation avant apparition)
- [ ] Options cagnotte + acceptation cadeaux (dépend KYC — phase 8)
- [ ] Réception médias : photo / vidéo / GIF / audio
- [ ] Musique du mur
- [ ] Épingle un mot
- [ ] Public vs privé (visibilité des mots par les invités)
- [ ] Liste stricte invités par email (envoi direct)
- [ ] Contribution invité sans compte + CTA "créer le mien"
- [ ] Ouverture destinataire : titre + bouton ouvrir → explosion confettis
- [ ] Vue défilement vertical
- [ ] Vue navigation 3D
- [ ] Vue carte centrale (style TikTok)
- [ ] Vue mode projection (statuts WhatsApp)
- [ ] Bouton "répondre à un invité" (si mails renseignés)
- [ ] Export QR (cœur / carré / cercle) + lien + partage
- [ ] Retrait cash cadeaux OU usage partenaires (dépend phase 5 + KYC)

## Phase 5 — Brique Cadeaux

- [ ] Intégration Reloadly (cartes cadeaux internationales)
- [ ] Partenaires locaux : Momo Bénin (+ MTN, Orange Money, Wave ?)
- [ ] Flow KYC pour cadeaux entrants et retrait
- [ ] Activation cagnotte sur mur
- [ ] Retrait cash utilisateur
- [ ] Usage chez partenaires (Netflix, Amazon, etc.)
- [ ] Pricing multi-devises XOF / EUR / USD

## Phase 6 — Calendriers

- [ ] UI calendrier utilisateur (dates récurrentes + one-shot)
- [ ] Notifications J-3, J-2, J-1
- [ ] CTA "créer une carte / mur depuis cette date"

## Phase 7 — myKado for Business

- [ ] Espace entreprise (admin, équipes, employés)
- [ ] Personnalisation logo + liens marketing
- [ ] Events prédéfinis (anniv, naissance, mariage, retirement, fin d'année)
- [ ] Reconnaissance employés (employé du mois, etc.)
- [ ] Cartes marketing "merci client" avec redirection
- [ ] Facturation entreprise (compta)
- [ ] Plan tarifaire B2B

## Phase 8 — Chantiers transverses

- [ ] Multi-devises XOF/EUR/USD (dès l'architecture)
- [ ] Multi-langues FR / EN (i18n en base)
- [ ] KYC unifié (partagé entre cadeaux et cagnotte)
- [ ] Banque backgrounds (sources + curation + CDN — priorité forte user)
- [ ] Banque GIFs (sources + curation)
- [ ] Analytics (funnel création, conversion)
- [ ] SEO landing + pages briques
- [ ] Performance (Lighthouse ≥ 90 sur toutes routes publiques)
- [ ] PWA (offline drafts, installation)

## Idées à explorer (backlog)

- [ ] Génération musique par IA
- [ ] Plan B2B pour envoi cartes clients post-achat / fêtes
