# myKado — Sitemap unifié

Trois zones : **public** (marketing + réception), **app** (utilisateur connecté), **business** (compte entreprise).

Règle d'or : **aucune URL existante ne casse jamais**. Les anciennes redirigent en 301 vers les nouvelles.

---

## Zone publique

Accessible sans authentification. C'est aussi ici que les destinataires et invités arrivent depuis un lien partagé.

### Marketing

```
/                          Landing home
/tarifs                    Pricing (XOF / EUR / USD)
/business                  Teaser B2B (redirige vers zone business)
/comment-ca-marche         Explainer produit
/blog                      (backlog)
/a-propos                  (backlog)

/terms                     Mentions légales (en place)
/privacy                   Confidentialité (en place)
```

### Réception (cartes / murs / cadeaux reçus)

```
/c/:slug                   Carte animée — vue destinataire
/m/:slug                   Mur collaboratif — vue destinataire + contribution invité
/g/:slug                   Cadeau — vue destinataire
```

- `:slug` obligatoire, auto-généré à la création, personnalisable
- Format ASCII a-z 0-9 - _, 3–40 chars, unique per brique
- Exemples : `/c/amina-30-ans`, `/m/adieu-fatou`, `/g/merci-partenaires-2026`

### Backward compat (URLs legacy servies pour toujours)

```
/s/:shortCode              Redirect 301 → /c/:slug ou /m/:slug ou /g/:slug
                           (Selon Publication.kind)
```

### Auth publique (invité, KYC)

```
/kyc/mobile/:token         Flow KYC mobile (en place)
```

### Dev / preview

```
/design-system             Demo interne du design system (à protéger en prod)
```

---

## Zone app (utilisateur connecté)

Préfixe `/app/*`. Tout redirige vers `/app/connexion` si pas de session.

### Auth

```
/app/connexion             Login
/app/inscription           Sign up
/app/mot-de-passe-oublie   Reset password
/app/reinitialiser/:token  Nouveau mot de passe
```

### Dashboard & création

```
/app                       Dashboard : mes créations récentes + CTA créer
/app/creer                 Sélection brique (carte / mur / cadeau) + occasion
/app/creer/carte           Éditeur nouvelle carte
/app/creer/mur             Setup nouveau mur
/app/creer/cadeau          (Phase 5)
```

### Gestion des créations

```
/app/creations                        Liste : mes créations (données)
/app/creations?filter=recu            Reçues
/app/creations?filter=brouillon       Brouillons
/app/creations?filter=invitation      Invitations à contribuer

/app/creations/:id                    Détail (preview + stats + actions)
/app/creations/:id/editer             Éditeur (carte ou mur selon kind)
/app/creations/:id/personnaliser-lien Écran vanity slug
/app/creations/:id/partager           Share sheet (QR, lien, réseaux, email)
/app/creations/:id/qr                 Export QR (détails formes + fonds + preview)
/app/creations/:id/invites            Gestion liste invités (murs)
/app/creations/:id/moderation         Modération messages (murs)
/app/creations/:id/cagnotte           Suivi cagnotte + retrait
```

### Calendrier & notifs

```
/app/calendrier            Mes dates (anniv, fêtes, événements)
/app/notifications         Historique notifs
```

### Paramètres

```
/app/parametres                    Profil, préférences
/app/parametres/kyc                KYC (obligatoire pour cagnotte/cadeaux)
/app/parametres/paiements          Cartes bancaires, mobile money
/app/parametres/portefeuille       Solde, retraits, historique
/app/parametres/notifications      Préférences email/push
/app/parametres/langue-devise      FR/EN + XOF/EUR/USD
```

### Backward compat (routes `/ewish-admin/*`)

Toutes redirigent en **301** vers `/app/*` équivalent. Restent servies pour préserver les bookmarks, mais l'app pousse toujours la nouvelle forme.

```
/ewish-admin                          → /app
/ewish-admin/login                    → /app/connexion
/ewish-admin/register                 → /app/inscription
/ewish-admin/forgot-password          → /app/mot-de-passe-oublie
/ewish-admin/reset-password/:token    → /app/reinitialiser/:token
/ewish-admin/ewish                    → /app/creations
/ewish-admin/ewish/new                → /app/creer
/ewish-admin/ewish/edit/:id           → /app/creations/:id/editer
/ewish-admin/templates                → /app/creer (avec preselect templates)
/ewish-admin/template/:name           → /app/creer/carte?template=:name
/ewish-admin/wall/:id                 → /app/creations/:id/editer
/ewish-admin/share/:id                → /app/creations/:id/partager
/ewish-admin/cagnotte/:id             → /app/creations/:id/cagnotte
/ewish-admin/credits                  → /app/parametres/portefeuille
/ewish-admin/profile                  → /app/parametres
/ewish-admin/publications             → /app/creations (admin uniquement)
/ewish-admin/wishes                   → /app/creations?filter=all (admin uniquement)
```

---

## Zone business (B2B)

Compte entreprise avec branding, employés, facturation. Préfixe `/business/*`.

```
/business                       Landing B2B (public, teaser)
/business/tarifs                Pricing entreprise
/business/inscription           Créer compte entreprise
/business/connexion             Login compte entreprise

/business/app                   Dashboard entreprise
/business/app/equipes           Gestion des équipes
/business/app/employes          Répertoire employés
/business/app/events            Events prédéfinis (anniv, naissance, retirement…)
/business/app/creer             Création avec branding entreprise auto
/business/app/reconnaissance    Reconnaissance employés (employé du mois, etc.)
/business/app/marketing         Cartes marketing client
/business/app/facturation       Factures (compta)
/business/app/parametres        Réglages entreprise (logo, branding, liens)
```

---

## Zone super-admin

Rôle interne (staff myKado). Conservée sous `/ewish-admin/super/*` — pas de refonte à ce stade.

```
/ewish-admin/super/stats
/ewish-admin/super/users
/ewish-admin/super/promos
/ewish-admin/super/assets
/ewish-admin/super/prospection
/ewish-admin/super/settings
/ewish-admin/super/kyc
/ewish-admin/super-templates
```

---

## Résumé — décisions clés

1. **`/s/:shortCode`** reste servi **pour toujours** — redirect vers `/c|/m|/g/:slug`
2. **Nouvelles URLs canoniques** : slug obligatoire, id caché
3. **`/ewish-admin/*`** → tout redirige vers `/app/*` en 301 (bookmarks préservés)
4. **`/app/*`** est le nouveau territoire utilisateur
5. **`/business/*`** est le territoire B2B (Phase 7)
6. **Super-admin** reste sous `/ewish-admin/super/*` (pas de migration prio)

## Prochaines actions (dans tasks.md)

- Ajouter `slug` sur Publication
- Générateur de slug par défaut
- Middleware serveur `/s/:code` → redirect vers canonique
- Middleware `/ewish-admin/*` → redirect vers `/app/*`
- Nouveau BrowserRouter avec les routes `/app/*` et `/c/:slug` `/m/:slug` `/g/:slug`
- Écran "Personnaliser le lien"
