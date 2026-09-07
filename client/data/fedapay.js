/* ================================================================
   FedaPay — configuration client
   ---------------------------------------------------------------
   Catalogue produits monétisés côté FedaPay pour la publication
   de cartes/enveloppes et de murs. Prix officiels alignés avec
   server/routes/fedapay.js (PRODUCT_MAP) et
   server/routes/publication.js (FEDAPAY_PRODUCT_MAP, WALL_PLAN_PRICES).

   Le webhook FedaPay est reçu sur POST /api/fedapay/webhook côté
   serveur (voir server/routes/fedapay.js).
   ================================================================ */

/* URL du script Checkout.js embarqué — chargé à la demande par
   FedapayWidget. La version est figée pour éviter les breaking
   changes silencieux (à mettre à jour manuellement). */
export const FEDAPAY_CHECKOUT_JS_URL = 'https://cdn.fedapay.com/checkout.js?v=1.1.7';

/* Palette Warm Celebration (voir client/design-system/BRAND.md) —
   éventuellement passée aux options de Checkout.js si l'API le
   permet, sinon utilisée pour styler le container englobant. */
export const FEDAPAY_BRAND = {
  primary:    '#E25B45', // coral
  background: '#FDFBF7', // paper-noble
  contrast:   '#201524', // plum
};

/* Catalogue produit — la clé est un identifiant interne stable
   utilisé partout dans le client (WallPublishModal, ShareStep).
   Elle est envoyée dans custom_metadata.product à FedaPay. */
export const FEDAPAY_PRODUCTS = {
  card: {
    key:         'card',
    amount:      1000,
    currency:    'XOF',
    label:       'Carte',
    ctaText:     "Payer 1 000 FCFA",
    description: 'Publication de carte myKado',
  },
  wall_simple: {
    key:         'wall_simple',
    amount:      2500,
    currency:    'XOF',
    label:       'Mur Premium',
    ctaText:     "Payer 2 500 FCFA",
    description: 'Publication de mur myKado — Premium',
  },
  wall_premium: {
    key:         'wall_premium',
    amount:      10000,
    currency:    'XOF',
    label:       'Mur Illimité',
    ctaText:     "Payer 10 000 FCFA",
    description: 'Publication de mur myKado — Illimité',
  },
};

export function getFedapayProduct(key) {
  return FEDAPAY_PRODUCTS[key] || null;
}
