# myKado — Flows utilisateur

Trois flows principaux (créateur, destinataire, invité) + trois funnels post-action.

Chaque flow doit respecter les règles UX (voir `ux-rules.md`) :
- Inclusivité 8→50+ ans
- CTA principal toujours évident
- Chemin retour toujours disponible
- Feedback immédiat à chaque étape
- Enchaînement intelligent (jamais de cul-de-sac)

---

## 1. Flow créateur — de l'idée à l'envoi

Objectif : **6 étapes max**, chaque écran a **un CTA principal** et une flèche retour.

```
┌─ Étape 1 ────────────────────────────────────────────┐
│ Pourquoi tu veux célébrer ?                          │
│                                                      │
│ [ Anniversaire ] [ Mariage ] [ Naissance ]           │
│ [ Retraite ] [ Fête de fin d'année ] [ Autre ]       │
│                                                      │
│ (icône + libellé grand format, cards cliquables)     │
└──────────────────────────────────────────────────────┘
    ↓
┌─ Étape 2 ────────────────────────────────────────────┐
│ Pour qui ?                                           │
│                                                      │
│ Nom du destinataire *   [Amina Ochoa       ]         │
│ Email (optionnel)       [amina@…            ]        │
│ (si email : possibilité d'envoi direct par mail)     │
│                                                      │
│ ← Retour                    [ Continuer ]            │
└──────────────────────────────────────────────────────┘
    ↓
┌─ Étape 3 ────────────────────────────────────────────┐
│ Comment tu veux la célébrer ?                        │
│                                                      │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│ │ CARTE       │ │ MUR         │ │ CADEAU      │      │
│ │ animée      │ │ collab.     │ │             │      │
│ │             │ │             │ │             │      │
│ │ Icône +     │ │ Icône +     │ │ Icône +     │      │
│ │ preview     │ │ preview     │ │ preview     │      │
│ └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                      │
│ (chaque card contient : "Idéal si tu veux…")         │
└──────────────────────────────────────────────────────┘
    ↓
┌─ Étape 4 ────────────────────────────────────────────┐
│ Choisis un modèle                                    │
│                                                      │
│ [Filtre par style]                                   │
│                                                      │
│ Grille templates filtrée par brique + occasion       │
│ Chaque tile a preview + bouton "Aperçu"              │
│                                                      │
│ ← Retour                                             │
└──────────────────────────────────────────────────────┘
    ↓
┌─ Étape 5 ────────────────────────────────────────────┐
│ Personnalise                                         │
│                                                      │
│ [Éditeur spécifique à la brique]                     │
│  - Cartes : musique, photos, texte, décos            │
│  - Murs : thème, modération, cagnotte, invités       │
│  - Cadeaux : montant, message, partenaire            │
│                                                      │
│ Auto-save brouillon toutes les 10s                   │
│ Preview toujours visible                             │
│                                                      │
│ ← Sauvegarder brouillon    [ Publier & Envoyer ]     │
└──────────────────────────────────────────────────────┘
    ↓
[Funnel post-création — voir §4a]
```

### Notes détaillées

- Étape 3 (choix brique) : montrer les 3 briques même si l'utilisateur en a déjà utilisé — pas de préselection cachée
- Étape 4 : le template doit être **changeable** à l'étape 5 sans perdre les données du destinataire
- Étape 5 : sur mobile, l'éditeur passe en plein écran ; sur desktop, split preview / editor
- Erreur : si l'utilisateur quitte, le brouillon est sauvé et retrouvable dans `/app/creations?filter=brouillon`

---

## 2. Flow destinataire — de la réception à l'exploration

Objectif : **impact émotionnel maximum** à l'ouverture, exploration fluide ensuite.

### 2a. Carte animée

```
[Lien reçu / cliqué]
    ↓
┌──────────────────────────────────────────────────────┐
│                                                      │
│    "Amina, tu as reçu une carte de Fatou"            │
│                                                      │
│                 [  Ouvrir  ]                         │
│                                                      │
│    (fond calme, motif afro-modern discret)           │
└──────────────────────────────────────────────────────┘
    ↓ (clic Ouvrir)
[Fullscreen animation carte + confetti card-open + musique]
    ↓ (fin d'animation)
[Contrôles minimaux : rejouer / précédent / suivant]
    ↓
[Funnel post-réception — voir §4c]
```

### 2b. Mur collaboratif

```
[Lien reçu / cliqué]
    ↓
┌──────────────────────────────────────────────────────┐
│                                                      │
│    "Fatou, ton mur pour tes 30 ans"                  │
│                                                      │
│                 [  Ouvrir  ]                         │
│                                                      │
└──────────────────────────────────────────────────────┘
    ↓ (clic Ouvrir)
[Explosion confetti wall-open + reveal des cartes]
    ↓
┌──────────────────────────────────────────────────────┐
│ [Toolbar minimal]                                    │
│ Vue :  [Défil.] [3D] [TikTok] [Projection]           │
│                                                      │
│ ┌──── Carte 1 ────┐                                  │
│ │ "Bon anniv !"   │                                  │
│ │  — Aya          │                                  │
│ └─────────────────┘                                  │
│                                                      │
│ ┌──── Carte 2 ────┐                                  │
│ │ [photo]         │                                  │
│ │ "T'es le best"  │                                  │
│ │  — Kwame        │                                  │
│ └─────────────────┘                                  │
│                                                      │
│ ...                                                  │
└──────────────────────────────────────────────────────┘
    ↓ (utilisateur a exploré)
[Funnel post-réception — voir §4c]
```

Vues du mur (togglable) :
- **Défilement** : liste verticale classique (défaut mobile)
- **3D** : navigation dans un espace 3D immersif (défaut desktop si device puissant)
- **TikTok** : une carte pleine, swipe pour la suivante
- **Projection** : mode kiosk pour afficher sur écran/projecteur (statuts WhatsApp)

Actions destinataire :
- Répondre à un invité (si son email est renseigné)
- Retrait cash cadeaux (si KYC OK)
- Épingler une carte
- Partager le mur (ré-partage)

### 2c. Cadeau reçu

```
[Lien reçu]
    ↓
"Tu as reçu un cadeau"
    ↓
[Confetti gift-received + reveal montant/type]
    ↓
Actions : Utiliser | Retirer (KYC) | Voir la carte associée
    ↓
[Funnel post-réception]
```

---

## 3. Flow invité mur — arriver, contribuer, enchaîner

Objectif : **contribution sans compte** en moins de 60 secondes, puis funnel viral.

```
[Invité clique lien mur]
    ↓
┌──────────────────────────────────────────────────────┐
│  "Fatou fête ses 30 ans !"                           │
│  Créé par Amina                                      │
│                                                      │
│  [ Écrire un mot ]  ou  Voir le mur (si public)      │
└──────────────────────────────────────────────────────┘
    ↓ (clic Écrire un mot)
┌──────────────────────────────────────────────────────┐
│  Ton mot pour Fatou                                  │
│  ┌────────────────────────────────────────────────┐  │
│  │                                                │  │
│  │  Textarea grand format, placeholder :          │  │
│  │  "Un souvenir, un message, une blague…"        │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  [+ Ajouter photo]  [+ GIF]  [+ Audio]  [+ Vidéo]    │
│  (selon config du mur)                               │
│                                                      │
│  Ta signature (nom ou surnom)  [ Aya         ]       │
│                                                      │
│  [ Envoyer mon mot ]                                 │
└──────────────────────────────────────────────────────┘
    ↓ (envoi)
[Toast success + info si modération]
    ↓
[Funnel post-contribution — voir §4b]
```

### Notes

- Aucune obligation de créer un compte pour contribuer
- Si modération active : afficher "Ton mot sera visible après approbation par Amina"
- Nom signature pré-rempli si l'utilisateur revient (localStorage)
- Photos : upload direct depuis mobile, drag&drop desktop, preview immédiat

---

## 4. Funnels post-action

### 4a. Post-création (créateur)

Voir `ux-rules.md §3b`. Structure :
1. Preview + confirmation
2. Lien canonique visible + CTA "Personnaliser le lien"
3. Actions : Copier / QR / Partager / Envoyer par mail (si dispo)
4. Suggestion : ajouter au calendrier
5. Cross-sell doux : "Découvrir les autres briques" (footer)

### 4b. Post-contribution invité (mur)

Voir `ux-rules.md §3a`. Séquence stricte :

```
Contribution envoyée
    ↓
[SI cagnotte OR cadeaux actifs]
    → "Envie de faire encore plus plaisir ?"
    [ Ajouter un cadeau ]  Non merci
        ↓ (décline)
[Partage]
    → "Partage ce mur avec d'autres personnes"
    [ Partager le mur ]  Non merci
        ↓ (décline)
[Création]
    → "Envie de créer le tien pour quelqu'un qui compte ?"
    [ Créer mon mur ]  Non merci
        ↓
[Fin — retour au mur si public, sinon page merci]
```

Règles :
- **Une seule question par écran** (ne pas empiler)
- Décliner un chemin ne re-propose jamais le même dans la session
- Chaque bouton "Non merci" est visuellement égal au CTA (pas caché)

### 4c. Post-réception (destinataire)

Voir `ux-rules.md §3c`. Séquence :

```
Consommation complète
    ↓
[Si liste emails renseignée]
    → "Envie de dire merci ?"
    [ Répondre aux invités ]
        ↓
[Toujours]
    → "Fais plaisir à ton tour"
    [ Créer une carte / un mur / un cadeau ]
        ↓
Redirect vers /app (avec CTA visible)
```

---

## 5. Points d'attention transverses

- **Auto-save brouillons** partout dans le flow créateur
- **URL vivante** : à chaque étape l'URL reflète l'état (ex: `/app/creer?step=3&brique=mur`) → refresh ne perd rien
- **Prev/next clavier** actif dans les navigations de mur (destinataire) et l'éditeur
- **Deep link** : chaque étape a une URL déeplink-able (pour reprendre un brouillon direct)
- **Mobile-first partout** — sur mobile chaque étape est plein écran, sur desktop split ou modale selon contexte
