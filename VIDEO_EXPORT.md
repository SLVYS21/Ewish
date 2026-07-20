# Documentation de l'Export Vidéo (Livre Vidéo)

## Fonctionnement général
L'export Vidéo est conçu comme un **Proof of Concept (POC) côté client**. Toute la génération de la vidéo est calculée par le navigateur de l'utilisateur (le Frontend), sans nécessiter de serveur vidéo lourd (comme FFmpeg ou Remotion).

1. **La Fenêtre Modale :** L'utilisateur clique sur "Vidéo 9:16", ce qui ouvre une fenêtre modale contenant une balise `<iframe>`. Cette iframe charge un fichier HTML autonome (`templates/wall-export-video/index.html`) fourni par le backend.
2. **Le Dessin (Canvas) :** Ce fichier HTML télécharge les mots du mur via l'API, puis prépare un élément HTML `<canvas>` (une toile de dessin numérique) de 1080x1920 pixels.
3. **L'Enregistreur (MediaRecorder) :** Quand on clique sur "Enregistrer", le script utilise `canvas.captureStream(30)` pour extraire 30 images par seconde depuis la toile. Il transmet ce flux vidéo à l'API du navigateur `MediaRecorder` qui va l'encoder à la volée.
4. **L'Animation :** Une boucle `requestAnimationFrame` se lance pour animer l'apparition des post-its sur le canvas.
5. **Finalisation :** À la fin de la séquence, l'enregistrement se coupe (`recorder.stop()`), assemble les morceaux de vidéo en mémoire (Blob), et génère un bouton permettant à l'utilisateur de télécharger le fichier directement depuis sa propre machine.

## Pourquoi le format WebM et non MP4 ?
L'API `MediaRecorder` des navigateurs web, en particulier sur Google Chrome et Firefox, encode nativement les flux vidéo en utilisant les codecs **VP8** ou **VP9** imbriqués dans un conteneur **WebM**. 
Contrairement au format MP4 (H.264) qui est soumis à des licences commerciales strictes, le WebM est un standard ouvert (open-source). Bien que Safari (Apple) commence à supporter l'encodage MP4 natif, Chrome et Firefox imposent le WebM pour ce type d'enregistrement en direct depuis un `<canvas>`.
Pour obtenir un vrai MP4 universel depuis le web, il faudrait déléguer la création vidéo au serveur en utilisant des outils lourds comme FFmpeg, ce qui demanderait beaucoup de puissance de calcul.

## Problèmes rencontrés et solutions

### 1. Enregistrement bloqué à 100% (Aucun téléchargement)
* **Symptôme :** L'animation allait jusqu'à 100% et s'arrêtait, mais rien ne se passait ensuite. Aucun fichier n'était téléchargé.
* **Cause 1 (Le codec Audio Piège) :** Le script d'origine demandait au navigateur d'utiliser le format `video/webm;codecs=vp8,opus`. Le codec `opus` indique qu'on s'attend à recevoir une piste audio. Or, le flux du canvas (`captureStream`) ne fournit **que de la vidéo**. Sous Firefox, le multiplexeur vidéo attendait indéfiniment de recevoir des données audio pour fermer le fichier, bloquant ainsi le processus à tout jamais.
* **Cause 2 (Sécurité des Iframes) :** Pour une meilleure intégration, la page vidéo a été placée dans une `<iframe>` (fenêtre modale). Les navigateurs bloquent par sécurité les téléchargements automatiques (via un `a.click()` généré par Javascript) s'ils proviennent d'une iframe trop stricte.
* **Solutions :**
  - Retrait du codec `opus` des paramètres de configuration. Le navigateur sait désormais qu'il enregistre un fichier 100% silencieux (`video/webm;codecs=vp8`).
  - Ajout d'une détection pour Safari (qui préfère `video/mp4`).
  - Remplacement du téléchargement automatique forcé (bloqué par les sécurités anti-popups) par un vrai bouton **"Télécharger la vidéo"** qui apparaît à la fin de l'enregistrement, permettant un téléchargement manuel et infaillible.

### 2. Erreur d'Iframe (Le site s'ouvre dans la modale)
* **Symptôme :** En cliquant sur "Générer la vidéo", la fenêtre modale s'ouvrait mais affichait une miniature du site myKado au lieu de l'interface d'enregistrement vidéo.
* **Cause :** L'URL `API_BASE` configurée sur l'environnement de développement tombait sur le routeur de React (`/api/walls...`) au lieu de pointer vers le serveur Node (`localhost:5000/api...`).
* **Solution :** Correction de l'URL absolue de secours de l'API pour s'assurer que l'iframe interroge bien le serveur backend, même sans variable d'environnement configurée.
