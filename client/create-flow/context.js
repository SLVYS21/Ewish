/* Persistance du contexte de création entre les étapes de /create et
   l'éditeur cible. localStorage + TTL 24h : survit à la fermeture d'onglet,
   à un rechargement ou à une hésitation avant l'auth. Passé 24h, on
   considère le brouillon comme abandonné pour éviter de restaurer un état
   confus au retour de l'utilisateur. */

const KEY = 'mk_create_context';
const TTL_MS = 24 * 60 * 60 * 1000;

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
    localStorage.setItem(
      KEY,
      JSON.stringify({ ...ctx, savedAt: Date.now() })
    );
  } catch {
    /* quota / private mode — silent fail */
  }
}

export function loadContext() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - (parsed.savedAt || 0) > TTL_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearContext() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* silent fail */
  }
}
