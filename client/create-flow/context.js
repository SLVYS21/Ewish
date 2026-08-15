/* Persistance du contexte de création entre les étapes de /create et
   l'éditeur cible. sessionStorage pour éviter la friction d'auth avant
   la publication — le contexte disparait à la fermeture d'onglet. */

const KEY = 'mk_create_context';

/* Shape :
   {
     type: 'wish' | 'wall' | 'envelope',
     occasion: 'anniversary' | 'wedding' | ...,
     recipient: string,
     title: string,
     savedAt: number (timestamp)
   } */
export function saveContext(ctx) {
  try {
    sessionStorage.setItem(
      KEY,
      JSON.stringify({ ...ctx, savedAt: Date.now() })
    );
  } catch {
    /* quota / private mode — silent fail */
  }
}

export function loadContext() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearContext() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* silent fail */
  }
}
