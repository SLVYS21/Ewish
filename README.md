# Ewishes — myKado

**myKado** est une plateforme de création et de partage de vœux animés, adressée aux particuliers, aux équipes RH et aux marques d'Afrique francophone et de la diaspora. Elle combine un modèle SaaS (paiement en crédits) avec une future couche de cagnotte collective (crowdfunding de cadeau).

---

## Vision produit

### Le problème
Les vœux numériques restent banals — un message WhatsApp ou une carte e-mail jetable. Il n'existe pas de solution mémorable, partageable et adaptée au contexte africain (Mobile Money, langues, occasions locales comme Tabaski ou Korité).

### La réponse myKado
Un studio de vœux animés où chaque création est :
- **personnalisable gratuitement** (photos, musique, QR code, bouton CTA)
- **publiée contre des crédits** (1 crédit = 500 FCFA ≈ 0,76 €)
- **partageable par lien ou QR** — scan, regarde, conserve

### Le pivot cagnotte (bientôt)
Sur les vœux collectifs (anniversaire, mariage, départ en retraite), myKado proposera aux contributeurs de participer à un cadeau commun — une PS5, un voyage, une montre. Le bénéficiaire reçoit le montant directement. SaaS + crowdfunding dans la même page.

---

## Modèle économique

| Action | Coût |
|---|---|
| Création d'un compte | Gratuit |
| Personnalisation complète | Gratuit |
| Publication d'un vœu personnel | 5–12 crédits |
| Publication d'un vœu collectif | 20–30 crédits |
| 1 crédit | 500 FCFA · ≈ 0,76 € |

**Packs de crédits :** Découverte (5 cr / 2 500 FCFA), Essentiel (12+2 cr / 6 000 FCFA), Pro (30+6 cr / 15 000 FCFA), Entreprise (80+20 cr / 40 000 FCFA).

**Moyens de paiement :** Wave, Orange Money, MTN Money, Visa, Mastercard.

---

## Architecture du monorepo

```
Ewishes/
├── client/              # Éditeur de vœux (React + Vite)
│   └── components/      # PhotoLayoutTab, ContentTab, etc.
├── landing/             # Landing page marketing (React + Vite)
│   └── src/
│       ├── components/  # Navbar, Hero, Templates, Pricing…
│       ├── data.js      # TEMPLATES, PLANS, FAQS, fmtFCFA, fmtEUR
│       ├── hooks/
│       │   ├── useReveal.js   # IntersectionObserver reveal
│       │   └── useInView.js
│       ├── App.jsx
│       └── index.css    # Design system complet (tokens, composants)
├── server/              # API Node.js/Express
│   └── routes/          # /api/templates, /preview/:name…
└── templates/           # Templates HTML animés
    ├── birthday/
    ├── wall-of-wishes-3d/
    ├── special/
    ├── collective-family/
    └── collective-pro/
```

---

## Landing page — design system

La landing (`landing/`) utilise une identité visuelle cohérente :

### Typographie
- **Instrument Serif** — display, titres italiques, romanticisme
- **Bricolage Grotesque** — UI, texte courant, variable weight
- **JetBrains Mono** — données numériques (prix, codes)

### Palette
```css
--ivory:      #f7f3eb   /* fond principal */
--paper:      #fefcf7   /* cartes */
--cream:      #fbf6ec   /* fonds sombres */
--ink:        #1c1611   /* texte */
--gold:       #c9a84c   /* accent principal */
--rose:       #d6557a   /* CTA, emphase */
--emerald:    #2d7159   /* succès, cagnotte */
--peach:      #f1a06e   /* template mariage/baby */
```

### Sections (ordre de la page)
1. **Announce bar** — teaser cagnotte + badge "Bientôt"
2. **Nav** — sticky, blur, menu mobile drawer
3. **Hero** — phone mockup animé, floating cards QR + "+24 contributeurs"
4. **TrustStrip** — Wave / Orange Money / MTN / Visa / Mastercard + badge "Aucun frais caché"
5. **Templates** — mosaïque Pinterest 3 colonnes, 9 templates avec prévisualisations CSS, modal détail
6. **HowItWorks** — 4 étapes, badge "le seul moment où vous payez" à l'étape 3
7. **Features** (Personnalisation) — photos & musique / QR stylisé / bouton CTA marque
8. **UseCases** — Particuliers / RH / Marques + module cagnotte teaser avec démo barre de progression
9. **Pricing** — 4 packs, prix en FCFA + équivalent EUR pour la diaspora
10. **Transparence** — tableau ligne-par-ligne (frais d'inscription = 0, frais de partage = 0…)
11. **FAQ** — 7 questions dont cagnotte, accordion
12. **FinalCTA** — fond sombre, déco typographique
13. **Footer** — colonnes Produit / Pour / Société

---

## Démarrage local

```bash
# Landing page
cd landing
npm install
npm run dev       # http://localhost:5173

# Éditeur client
cd client
npm install
npm run dev       # http://localhost:5174

# Serveur API
cd server
npm install
npm start         # http://localhost:5000
```

Variables d'environnement (`landing/.env`) :
```
VITE_APP_URL=http://localhost:3000
VITE_API_URL=http://localhost:5000
```

---

## Templates disponibles

| Nom | Catégorie | Crédits |
|---|---|---|
| Anniversaire | Personnel | 8 |
| Mur de vœux | Collectif | 10 |
| Mariage floral | Personnel | 12 |
| Bienvenue (naissance) | Personnel | 8 |
| Départ en retraite | Pro | 20 |
| Tabaski / fêtes religieuses | Personnel | 6 |
| Hommage | Personnel | 10 |
| Vœu de marque | Pro | 25 |
| Notre film (cinématique) | Personnel | 15 |

---

## Enjeux clés

- **Transparence** — pas de frais cachés, prix annoncé avant paiement, personnalisation toujours gratuite
- **Afrique d'abord** — Mobile Money prioritaire, FCFA affiché, occasions locales (Tabaski, Korité, Magal)
- **Diaspora** — équivalent EUR affiché, Visa/Mastercard accepté
- **Confiance RH** — conformité RGPD, lien privé non-indexé, collectif jusqu'à 100 contributeurs
- **Pivot cagnotte** — coexistence SaaS + crowdfunding dans la même expérience, teaser discret en attendant le lancement

---

*myKado — Le studio de vœux animés. Dakar · Abidjan · partout.*
