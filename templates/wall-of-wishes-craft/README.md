# wall-of-wishes-craft

Variante « Atelier / moodboard » du mur collaboratif.

## Rendu

Comme les autres murs, servi par `server/routes/serve.js` via
`getTemplateHtml('wall-of-wishes-craft')` — le fichier `index.html`
ci-contre est un clone modifié de `templates/wall-of-wishes/index.html`
avec un bloc CSS d'override en fin de `<style>` :

- Fond corail (`#FF8F6B`) + grille sombre 22px
- Bannière cover transparente (plus d'ombre bronze arrondie)
- Titre + sous-titre flottants en noir sur corail
- Eyebrow en pastille blanche floue
- Post-its opaques (le quadrillage ne transparaît pas)
- FAB « Laisser un mot » noir sur corail

Le JS et le markup sont identiques au classic — mêmes fonctions,
même intégration `__WW_DATA__`, même `applyDemoMode()`.

## Enregistrement Template DB

Défini dans `server/seeds/seedWalls.js` (`sortOrder: 11`, `featured: true`).
(Ré)appliquer :

```
npm run seed:walls
```

## Détection variante

Non nécessaire côté JS : le HTML sert d'ancrage direct. Le
`isCraft`/`.ww-shell--craft` dans `client/wall/WallApp.jsx` +
`client/wall/wall.css` ne s'applique QUE pour le shell React
(preview.js) — pas pour les visites publiques via serve.js.
