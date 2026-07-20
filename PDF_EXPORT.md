# Documentation de l'Export PDF (Livre des Mots)

## Fonctionnement général
L'export PDF est entièrement géré **côté serveur** (Backend) afin de garantir une qualité d'impression optimale et de ne pas surcharger le navigateur de l'utilisateur.

1. **Génération HTML :** Le serveur récupère les informations du mur (titre, destinataire, liste des mots) depuis la base de données. Il construit ensuite une grande page HTML (`buildBookHtml`) qui contient la couverture, la préface, chaque mot inséré dans un design de post-it, et la page de remerciement.
2. **Puppeteer (Chromium Headless) :** Le serveur lance une instance invisible du navigateur Chrome via la librairie `puppeteer`. Il charge le code HTML généré dans ce navigateur virtuel.
3. **Impression :** Une fois le rendu visuel parfait, Puppeteer utilise la fonction d'impression native de Chrome pour générer un fichier binaire PDF (au format A5, configuré via la règle CSS `@page`).
4. **Envoi :** Le fichier binaire est renvoyé directement au client avec les en-têtes HTTP appropriés (`Content-Disposition: attachment`) pour déclencher un téléchargement propre.

## Problèmes rencontrés et solutions

### 1. Fichier PDF corrompu ou invalide (Invalid PDF structure)
* **Symptôme :** Le navigateur téléchargeait un fichier avec l'extension `.pdf`, mais les lecteurs PDF (comme PDF.js) affichaient une erreur de structure.
* **Cause 1 (Redirection API) :** L'URL de l'API (`API_BASE`) du bouton côté frontend n'était pas bien définie en environnement local (elle pointait vers `/api` au lieu de `http://localhost:5000/api`). Le serveur React Frontend interceptait la requête et renvoyait sa page `index.html` web. Le "PDF" téléchargé était donc en réalité du code HTML.
* **Cause 2 (Encodage Express) :** La méthode `res.send(pdf)` d'Express tentait parfois de convertir le buffer binaire du PDF en chaîne de caractères (UTF-8), ce qui détruisait la structure binaire.
* **Solutions :**
  - Fixer l'URL absolue `API_BASE`.
  - Remplacer le téléchargement capricieux via `fetch` + `Blob` par un simple lien natif `window.open` pour laisser le navigateur gérer le flux binaire.
  - Utiliser `res.end(pdf)` au lieu de `res.send()` côté serveur pour garantir l'intégrité absolue des données binaires.

### 2. PDF "Illisible" (Problèmes de polices et d'affichage)
* **Symptôme :** Le texte dans le PDF était mal aligné, les polices cursives (*Caveat*) ne s'affichaient pas, et les émojis étaient remplacés par des carrés vides.
* **Causes :** 
  - Puppeteer prenait la "photo" PDF trop vite, avant même que les fichiers de polices Google (WOFF2) n'aient eu le temps de se télécharger sur le réseau.
  - Puppeteer (Chromium sur Windows) ne sait pas toujours comment dessiner les émojis sans instruction précise.
* **Solutions :**
  - Ajout d'une pause explicite de 2,5 secondes et utilisation de la commande `document.fonts.ready` pour forcer Puppeteer à attendre le chargement complet des polices.
  - Ajout explicite des polices de secours pour émojis (`'Segoe UI Emoji', 'Apple Color Emoji'`) dans les règles CSS du générateur.
  - Réduction de la taille de police (`20pt` -> `16pt`) et suppression des rotations CSS (`transform: rotate`) pour éviter les débordements de texte sur la hauteur très stricte d'une page A5.
