# myKado — Règles UX (référentiel pour toutes les phases)

Ce document régit les décisions UX transverses. À consulter avant chaque nouvelle feature ou écran.

---

## 1. Principe cardinal : inclusivité 8 → 50+ ans

**Test mental** : "un enfant de 8-10 ans et un utilisateur de 50 ans peuvent-ils tous les deux comprendre cet écran sans hésiter ?"

Conséquences concrètes :

- **Labels explicites** — jamais de jargon. "Créer" > "New". "Envoyer à Amina" > "Submit". "Un petit mot" > "Message input".
- **Icônes + texte** partout où c'est possible. Icône seule uniquement si le contexte rend l'action évidente (croix de fermeture, retour, options).
- **Tailles minimum** : texte de contenu ≥ 16px. Bouton min-height 44px (déjà dans les tokens). Zone tactile min 44×44px sur mobile.
- **Contrastes** : minimum AA (déjà audité). Éviter les gris trop clairs pour du texte utile.
- **Actions primaires visibles** : jamais cachées dans un menu si elles sont attendues. Un CTA qui fait avancer le flow est toujours en évidence.
- **Confirmation avant action destructive** — modale explicite, jamais un simple hover.
- **Feedback immédiat** — toast, animation, changement d'état sur toute action.

---

## 2. Stratégie URL

### Contraintes fortes (backward compat obligatoire)

Les cartes/murs déjà livrés doivent continuer à fonctionner. Aucune migration ne peut casser ces URLs :

```
/s/:shortCode         Redirect public via Publication.shortCode (serveur)
                      → EN SERVICE, à conserver pour toujours
```

### Nouvelles URLs canoniques (préfixe par brique)

**Décision** : slug **obligatoire** et visible dans l'URL, id caché. Format le plus court et mémorisable.

```
/c/:slug              Carte animée              (canonical)
/m/:slug              Mur collaboratif
/g/:slug              Cadeau
```

- Slug **auto-généré à la création** basé sur titre/destinataire (ex: destinataire "Amina Ochoa" → `amina-ochoa`, collision → `amina-ochoa-2`)
- **Personnalisable** par le créateur via l'écran "Personnaliser le lien" dans l'éditeur
- Slug unique per kind (contrainte DB)
- ASCII a-z 0-9 - _, 3-40 chars
- L'ObjectId Mongo reste en base et sert de clé technique, mais n'apparaît jamais dans l'URL publique

### Comportements attendus

- L'URL courte `/s/:shortCode` reste servie et redirige (301) vers `/c/:id/:slug` ou `/m/:id/:slug` selon le type
- Lors de la création : l'utilisateur voit son URL par défaut (`/c/:id`) et un CTA "Personnaliser le lien" ouvre un champ où il choisit son slug
- Slug unique par brique (contrainte DB)
- Caractères autorisés : `a-z 0-9 - _` (ASCII uniquement pour éviter les problèmes d'encoding en partage)
- Longueur 3–40 caractères
- Suggestions automatiques basées sur le titre ou le destinataire (ex: destinataire = "Amina Ochoa" → suggestion `amina-ochoa`)

### Migration (à faire en Phase 1)

1. Ajouter champ `slug` (unique per kind) sur `Publication`
2. Ajouter middleware qui, sur `GET /c/:id/:slug`, valide/redirige
3. Rediriger `/s/:code` vers la forme canonique
4. Générer un slug par défaut à partir du titre/destinataire lors de la création
5. Écran "Personnaliser le lien" dans l'éditeur

---

## 3. Funnels post-action

Chaque action réussie doit **enchaîner** intelligemment, pas se terminer en cul-de-sac. Trois moments critiques :

### 3a. Après contribution à un mur (invité qui dépose un mot)

```
Invité écrit son mot → Valide
    ↓
┌───────────────────────────────────────────┐
│  "Merci pour ton mot !"                   │
│  [animation légère + confetti soft]       │
└───────────────────────────────────────────┘
    ↓
[SI cagnotte active OU cadeaux autorisés]
    ↓
┌───────────────────────────────────────────┐
│  "Envie de faire encore plus plaisir ?    │
│   Ajoute un cadeau à ton mot."            │
│                                           │
│  [ Ajouter un cadeau ]  Non, merci        │
└───────────────────────────────────────────┘
    ↓ (décline)
┌───────────────────────────────────────────┐
│  "Partage ce mur avec d'autres personnes  │
│   qui aimeraient célébrer aussi"          │
│                                           │
│  [ Partager le mur ]                      │
│                                           │
│  ─────────────────                        │
│                                           │
│  "Envie de créer le tien pour quelqu'un   │
│   qui compte ?"                           │
│                                           │
│  [ Créer mon mur ]                        │
└───────────────────────────────────────────┘
```

Règles :
- Toujours proposer, jamais imposer — un chemin "Non merci" clair
- Une seule question à la fois (pas de cagnotte + partage + création dans le même écran)
- Le chemin décliné n'est **jamais** re-proposé dans la même session
- Si la cagnotte n'est PAS active → sauter directement à l'étape partage/création

### 3b. Après création (créateur qui vient de finaliser sa carte/mur)

```
Création finalisée
    ↓
┌───────────────────────────────────────────┐
│  "C'est prêt !"                           │
│  [preview de la carte/mur]                │
│                                           │
│  Lien : mykado.co/c/amina-ochoa           │
│  [ Personnaliser le lien ]                │
│                                           │
│  Comment veux-tu l'envoyer ?              │
│  [ Copier lien ] [ QR ] [ Partager ]      │
│                                           │
│  ─────────────────                        │
│                                           │
│  "Envie de programmer une prochaine       │
│   célébration ?"                          │
│  [ Ajouter au calendrier ]                │
└───────────────────────────────────────────┘
```

### 3c. Après réception (destinataire qui vient d'ouvrir)

```
Destinataire ouvre / explore
    ↓
[Consommation complète du contenu]
    ↓
┌───────────────────────────────────────────┐
│  "Fais plaisir à ton tour"                │
│  [ Créer une carte / un mur ]             │
│                                           │
│  Répondre aux invités  [ Écrire un mot ]  │
│  (si liste emails renseignée)             │
└───────────────────────────────────────────┘
```

---

## 4. Export QR — cas d'école UX inclusive

Un QR est utilisé par un enfant qui veut afficher sur un frigo, un ado qui le partage en story, un adulte qui l'imprime pour une carte physique, un senior qui veut la version simple.

### L'écran d'export QR doit permettre :

**A. Formes (déjà spec'd)** : carré · cercle · cœur — via 3 boutons visuels grand format, chacun avec un preview du résultat.

**B. Fond** : options simples visibles d'un coup d'œil, pas un panneau de config étranglé.
- Fond blanc classique (par défaut)
- Fond crème doux
- Fond indigo brand
- Motif afro-modern subtil
- Fond photo (choisir depuis les 3 photos uploadées) — le QR reste lisible via un "halo" blanc automatique derrière

**C. Ajustements minimalistes** : cadre autour du QR (aucun / fin / épais). Titre en dessous (optionnel — préremplit avec le nom du destinataire). C'est tout — pas de curseur de rotation, pas de sliders exotiques.

**D. Preview live** grand format à droite (desktop) ou en haut (mobile). Modifications reflétées instantanément.

**E. Actions finales** grosses et claires :
- `[ Télécharger PNG ]` (bouton primary)
- `[ Télécharger PDF ]`
- `[ Partager ]` (réseaux + email + WhatsApp)
- `[ Imprimer ]`

**F. Aucun jargon** : "PDF haute résolution" > "300 DPI vector". "Assez grand pour un mur" > "A3". Les tailles proposées sont nommées par usage : "Pour un téléphone", "Pour une carte à imprimer", "Pour une affiche".

### Anti-patterns à éviter
- Panneau de configuration à onglets avec 15 options
- Terminologie technique (SVG vs PNG sans contexte)
- Curseurs sans preview immédiate
- Écran sans CTA principal évident

---

## 5. Formulaires

- **Labels au-dessus** des champs, jamais dedans (les placeholders ne remplacent pas les labels — problème pour les 50+ ans qui perdent le contexte après avoir commencé à taper)
- **Un hint sous le champ** si non-évident, jamais dans un tooltip
- **Erreurs** : sous le champ concerné, en clay avec icône, **immédiat** au blur (pas à la soumission)
- **Validation optimiste** : accepter le max de formats (numéro de téléphone avec espaces, email trim, etc.)
- **Champ actif visible** : focus ring 3px indigo (déjà token)
- **Progrès sur formulaires longs** : indicateur d'étape en haut (ex: "Étape 2 sur 4 — Personnalisation")
- **Auto-save des brouillons** — jamais perdre le travail d'un utilisateur

---

## 6. Motion & célébration

**Règle** : la célébration se mérite. Trop de confettis = fête permanente = plus une fête.

Quand déclencher confetti :
- ✅ Ouverture d'une carte reçue (moment fort)
- ✅ Ouverture d'un mur reçu (moment fort)
- ✅ Cadeau reçu (moment fort)
- ✅ Création finalisée (petit — preset `form-success`)
- ❌ Ajout d'un mot au mur (trop fréquent, remplacer par animation card entrée)
- ❌ Sauvegarde brouillon (invisible)
- ❌ Navigation entre pages

**Prefers-reduced-motion** : tout est déjà atténué automatiquement via les tokens.

---

## 7. Nommage — glossaire à respecter partout

| ❌ Ne pas utiliser | ✅ Utiliser |
|---|---|
| Wish, Voeu | Carte |
| Wall, Board | Mur |
| Gift | Cadeau |
| Submit, Send | Envoyer |
| Preview | Aperçu |
| Draft | Brouillon |
| Publish | Publier |
| Dashboard | Mes créations / Mon espace |
| Login | Se connecter |
| Sign up | Créer un compte |
| Recipient | Destinataire |
| Contributor | Invité (dans le contexte mur) |

Si un mot doit rester en anglais (marque, terme technique), le mettre en italique ou entre guillemets pour signaler l'exception.

---

## 8. Erreurs & vides

- **États vides** ne montrent jamais une page blanche. Ils expliquent (1) pourquoi c'est vide, (2) comment le remplir, (3) offrent un CTA direct
- **Erreurs réseau** : message clair + retry visible + support si persistant
- **Erreurs 404** : redirection vers l'espace utilisateur, jamais un cul-de-sac

---

## 9. Feedback loop — l'user doit savoir

À tout moment, l'utilisateur doit pouvoir répondre à ces 3 questions :
1. **Où suis-je ?** (breadcrumb / titre de page / URL lisible)
2. **Que puis-je faire ici ?** (CTA principal visible)
3. **Comment revenir en arrière ?** (bouton retour, close, cancel — jamais piégé)
