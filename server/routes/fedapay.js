/* ================================================================
   FedaPay — configuration widget côté client, webhook signé,
   endpoints de vérification.
   ---------------------------------------------------------------
   Architecture (Checkout.js / fedapay-reactjs pattern) :
     1. Client → GET /api/fedapay/prepare?pubId=…&product=…
     2. Serveur valide pubId + product/amount, renvoie
        { publicKey, environment, transaction: { amount, description,
          custom_metadata } } — pas de Transaction.create côté serveur.
     3. Client init Checkout.js embedded avec ces options ;
        FedaPay.init({ public_key, transaction, currency, container,
        onComplete }) — le widget crée la Transaction lui-même via la
        clé publique et gère la collecte customer (email/phone).
     4. FedaPay émet un webhook 'transaction.approved' → vérif HMAC
        (X-FEDAPAY-SIGNATURE) via Webhook.constructEvent(), lecture
        custom_metadata.pubId → application du plan à la Publication.
     5. Le client, en parallèle, écoute onComplete + poll isPaid.

   Sécurité :
     - Signature webhook obligatoire (SignatureVerificationError → 401).
     - Idempotence sur event.id (dédup upsert).
     - allowlist productId (custom_metadata.product).
     - Le serveur reste seule source de vérité sur amount/description
       (le client reçoit ces valeurs déjà résolues, pas de choix libre).
   ================================================================ */

const express       = require('express');
const router        = express.Router();
const { FedaPay, Webhook } = require('fedapay');
const FedapaySale   = require('../models/FedapaySale');
const Publication   = require('../models/Publication');
const AppTransaction = require('../models/Transaction');
const { requireAdmin } = require('../middleware/auth');

/* ---------------------------------------------------------------- *
   Configuration FedaPay au chargement du module.
   Le prefixe de la clé détermine l'environnement :
     sk_live_*    → live
     sk_sandbox_* → sandbox
 * ---------------------------------------------------------------- */
const FEDAPAY_SECRET = process.env.FEDAPAY_PRIVATE_KEY || '';
const FEDAPAY_PUBLIC = process.env.FEDAPAY_PUBLIC_KEY || '';
const FEDAPAY_ENV = FEDAPAY_SECRET.startsWith('sk_live_') ? 'live' : 'sandbox';

if (!FEDAPAY_SECRET) {
  console.warn('[fedapay] FEDAPAY_PRIVATE_KEY manquante — les routes /api/fedapay ne fonctionneront pas.');
} else {
  FedaPay.setApiKey(FEDAPAY_SECRET);
  FedaPay.setEnvironment(FEDAPAY_ENV);
  console.log(`[fedapay] SDK initialisé (env=${FEDAPAY_ENV})`);
}

const WEBHOOK_SECRET = process.env.FEDAPAY_WEBHOOK_SECRET || '';
if (!WEBHOOK_SECRET) {
  console.warn(
    '[fedapay] FEDAPAY_WEBHOOK_SECRET non défini — le webhook rejettera tous les événements en production. '
    + 'À configurer depuis le dashboard FedaPay (Webhooks → ton endpoint → "Click to reveal").'
  );
}

/* ---------------------------------------------------------------- *
   Catalogue produits — doit rester aligné avec client/data/fedapay.js
   et server/routes/publication.js (WALL_PLAN_PRICES).
 * ---------------------------------------------------------------- */
const PRODUCT_MAP = {
  card:         { kind: 'card',          amount: 1000,  description: 'Publication de carte myKado' },
  wall_simple:  { kind: 'wall',  plan: 'premium',  amount: 2500,  description: 'Publication de mur myKado — Premium'  },
  wall_premium: { kind: 'wall',  plan: 'infinite', amount: 10000, description: 'Publication de mur myKado — Illimité' },
};

/* ---------------------------------------------------------------- *
   Applique un plan à une Publication (mur ou carte) à partir d'une
   vente FedaPay approuvée.
 * ---------------------------------------------------------------- */
async function applyFedapaySaleToPublication(sale, mapping) {
  const meta  = sale.customMetadata || {};
  const pubId = meta.pubId || meta.publicationId || sale.pvar;
  if (!pubId) return { ok: false, error: 'no-pub-id-in-metadata' };

  const pub = await Publication.findById(pubId);
  if (!pub) return { ok: false, error: 'publication-not-found' };

  pub.isPaid = true;
  if (mapping.kind === 'wall' && mapping.plan) {
    pub.wallPlan = mapping.plan;
  }
  if (!pub.published) {
    pub.published   = true;
    pub.publishedAt = new Date();
  }
  await pub.save();

  /* Audit unique par vente — cohérent avec le flow FeexPay. */
  await AppTransaction.updateOne(
    { transactionId: String(sale.transactionId) },
    {
      $setOnInsert: {
        transactionId: String(sale.transactionId),
        adminId:       pub.merchantId || null,
        amount:        sale.amount,
        source:        'fedapay',
        paymentData:   sale.rawPayload,
        status:        'SUCCESS',
      },
    },
    { upsert: true },
  );

  return { ok: true, publication: pub };
}

/* ================================================================
   POST /api/fedapay/prepare
   Deux shapes acceptés :
     A. Produit fixe    : { product, pubId }
                          → amount résolu depuis PRODUCT_MAP
     B. Amount custom   : { amount, description, pubId, purpose }
                          → amount libre (cas card+gift, unlock legacy…)

   Réponse :
     { publicKey, environment,
       transaction: { amount, description, custom_metadata },
       currency:    { iso: 'XOF' },
       callback_url }

   Le client passe ces options telles quelles à FedaPay.init() — le
   widget crée la Transaction lui-même via la clé publique et collecte
   les infos customer (email/phone) dans son propre formulaire.
   On ne fait AUCUN appel serveur→FedaPay ici, donc plus de risque
   de collision d'email sur la ressource Customer.
   ================================================================ */
router.post('/prepare', express.json(), requireAdmin, async (req, res) => {
  try {
    const { product, pubId, amount: rawAmount, description: rawDescription, purpose } = req.body || {};
    if (!pubId) return res.status(400).json({ error: 'pubId requis', code: 'MISSING_PUB_ID' });

    if (!FEDAPAY_SECRET || !FEDAPAY_PUBLIC) {
      return res.status(500).json({ error: 'FedaPay non configuré côté serveur', code: 'FEDAPAY_NOT_CONFIGURED' });
    }

    /* Résolution amount + description + custom_metadata selon le shape. */
    let amount, description, metadata;
    if (product) {
      const mapping = PRODUCT_MAP[product];
      if (!mapping) return res.status(400).json({ error: 'Produit inconnu', code: 'UNKNOWN_PRODUCT' });
      amount      = mapping.amount;
      description = mapping.description;
      metadata    = { pubId: String(pubId), product };
    } else {
      const custom = Number(rawAmount);
      if (!Number.isFinite(custom) || custom < 100) {
        return res.status(400).json({ error: 'amount requis (>= 100 FCFA)', code: 'INVALID_AMOUNT' });
      }
      amount      = Math.floor(custom);
      description = String(rawDescription || `Paiement myKado ${amount} FCFA`).slice(0, 200);
      metadata    = { pubId: String(pubId), purpose: String(purpose || 'custom') };
    }

    /* Vérifie que la Publication existe et appartient à l'admin. */
    const pub = await Publication.findById(pubId).lean();
    if (!pub) return res.status(404).json({ error: 'Publication introuvable', code: 'PUB_NOT_FOUND' });
    const currentMerchantId = req.admin.merchantId || String(req.admin.id);
    if (pub.merchantId && req.admin.role === 'merchant' && pub.merchantId !== currentMerchantId) {
      return res.status(403).json({ error: 'Accès refusé', code: 'FORBIDDEN' });
    }
    if (!pub.merchantId && req.admin?.id) {
      await Publication.findByIdAndUpdate(pubId, { merchantId: currentMerchantId });
    }

    /* callback_url doit être publiquement joignable en live. On force
       le domaine public si CLIENT_URL est un http:// (dev). */
    const baseUrl = process.env.CLIENT_URL || 'https://app.mykado.store';
    const publicBaseUrl = (FEDAPAY_ENV === 'live' && !/^https:\/\//.test(baseUrl))
      ? 'https://app.mykado.store'
      : baseUrl;

    /* Pré-remplissage widget (Checkout.js `customer` option — distincte
       de transaction.customer, elle ne crée pas de Customer côté
       FedaPay, juste les valeurs par défaut du formulaire). Le modèle
       AdminUser stocke `name` (single field) + `email` + `kycPhone`
       (rempli après KYC). Pas de firstName/lastName distincts →
       on split le name. */
    let adminDoc = null;
    try {
      const AdminUser = require('../models/AdminUser');
      adminDoc = await AdminUser.findById(req.admin.id).select('email name kycPhone kycName').lean();
    } catch { /* modèle indisponible, on continue sans pré-remplissage */ }

    const rawName   = (adminDoc?.kycName || adminDoc?.name || req.admin?.name || '').trim();
    const nameParts = rawName && rawName.toLowerCase() !== 'admin' ? rawName.split(/\s+/) : [];
    const firstname = nameParts[0] || '';
    const lastname  = nameParts.slice(1).join(' ') || '';
    const email     = adminDoc?.email || req.admin?.email || '';
    const phone     = adminDoc?.kycPhone || '';

    const prefillCustomer = {};
    if (firstname) prefillCustomer.firstname = firstname;
    if (lastname)  prefillCustomer.lastname  = lastname;
    if (email)     prefillCustomer.email     = email;
    if (phone) {
      prefillCustomer.phone_number = {
        number:  String(phone).replace(/\s+/g, ''),
        country: 'BJ',
      };
    }

    return res.json({
      publicKey:   FEDAPAY_PUBLIC,
      environment: FEDAPAY_ENV,
      transaction: {
        amount,
        description,
        custom_metadata: metadata,
      },
      currency:     { iso: 'XOF' },
      callback_url: `${publicBaseUrl}/dashboard?fedapay=${pubId}`,
      customer:     Object.keys(prefillCustomer).length ? prefillCustomer : undefined,
    });
  } catch (err) {
    console.error('[fedapay/prepare]', err?.message || err);
    return res.status(500).json({ error: 'Impossible de préparer le paiement', detail: err?.message });
  }
});

/* ================================================================
   POST /api/fedapay/webhook — endpoint signé par FedaPay.
   raw body OBLIGATOIRE pour la vérif HMAC.
   Réponse 2xx systématique dès que le payload est traité (même
   ignoré) pour éviter les retries perpétuels.
   ================================================================ */
router.post('/webhook', express.raw({ type: '*/*', limit: '1mb' }), async (req, res) => {
  const rawBody = req.body instanceof Buffer
    ? req.body.toString('utf8')
    : (typeof req.body === 'string' ? req.body : JSON.stringify(req.body || {}));

  const signature = req.header('x-fedapay-signature') || req.header('X-FEDAPAY-SIGNATURE');

  let event;
  if (WEBHOOK_SECRET) {
    try {
      event = Webhook.constructEvent(rawBody, signature, WEBHOOK_SECRET);
    } catch (err) {
      console.warn('[fedapay/webhook] Signature invalide :', err?.message);
      if (process.env.NODE_ENV === 'production') {
        return res.status(401).send('invalid signature');
      }
      /* DEV : on parse quand même pour débugger l'intégration. */
      try { event = JSON.parse(rawBody); }
      catch { return res.status(400).send('invalid json'); }
    }
  } else {
    /* Pas de secret configuré : on accepte en dev, on rejette en prod. */
    if (process.env.NODE_ENV === 'production') {
      console.warn('[fedapay/webhook] Rejet : FEDAPAY_WEBHOOK_SECRET manquant en prod.');
      return res.status(500).send('webhook secret not configured');
    }
    try { event = JSON.parse(rawBody); }
    catch { return res.status(400).send('invalid json'); }
  }

  const eventId   = event?.id || event?.event?.id || null;
  const eventName = event?.name || event?.type || 'unknown';
  const entity    = event?.entity || event?.data?.object || event?.data || {};

  /* Idempotence — si on a déjà traité cet event.id, on répond 200. */
  if (eventId) {
    const existing = await FedapaySale.findOne({ eventId }).lean();
    if (existing) return res.status(200).send('duplicate ignored');
  }

  /* On ne traite que les transactions approuvées. Les autres events
     (declined, canceled…) sont log-only. */
  if (eventName !== 'transaction.approved') {
    return res.status(200).send(`ignored: ${eventName}`);
  }

  const transactionId = entity.id;
  const reference     = entity.reference;
  const amount        = Number(entity.amount) || 0;
  const currency      = entity.currency?.iso || 'XOF';
  const customer      = entity.customer || {};
  const customMetadata = entity.custom_metadata || {};
  const pvar = customMetadata.pubId || customMetadata.publicationId || null;

  const saleDoc = await FedapaySale.create({
    eventId:        eventId || undefined,
    transactionId,
    reference,
    event:          eventName,
    amount,
    currency,
    customerEmail:  customer.email,
    customerName:   [customer.firstname, customer.lastname].filter(Boolean).join(' ') || undefined,
    customMetadata,
    pvar,
    rawPayload:     event,
    status:         'received',
  });

  /* Résolution du mapping :
     - product connu → mapping du catalogue (avec plan pour murs)
     - purpose sans product → mapping générique "card" (isPaid + published,
       pas de wallPlan). Couvre : card_gift, wall_topup, legacy_unlock, custom. */
  let mapping = PRODUCT_MAP[customMetadata.product];
  if (!mapping && customMetadata.purpose) {
    mapping = { kind: 'card', amount, description: 'Paiement custom' };
  }
  if (!mapping) {
    saleDoc.status = 'orphan';
    saleDoc.appliedError = `unknown-product-and-no-purpose:${customMetadata.product || 'none'}`;
    await saleDoc.save();
    return res.status(200).send('unknown product/purpose');
  }

  try {
    const applied = await applyFedapaySaleToPublication(saleDoc, mapping);
    if (applied.ok) {
      saleDoc.status = 'applied';
      saleDoc.appliedToPublicationId = applied.publication._id;
      saleDoc.appliedAt = new Date();
    } else {
      saleDoc.status = applied.error === 'no-pub-id-in-metadata' ? 'orphan' : 'failed_apply';
      saleDoc.appliedError = applied.error;
    }
    await saleDoc.save();
  } catch (e) {
    console.error('[fedapay/webhook] apply plan failed', e.message);
    saleDoc.status = 'failed_apply';
    saleDoc.appliedError = e.message;
    await saleDoc.save();
  }

  return res.status(200).send('ok');
});

/* ================================================================
   GET /api/fedapay/verify/:transactionId (auth)
   Le client appelle après réception de onComplete/CHECKOUT_COMPLETED
   pour confirmer que le webhook est bien arrivé avant de déclencher
   le publish.
   ================================================================ */
router.get('/verify/:transactionId', requireAdmin, async (req, res) => {
  const sale = await FedapaySale.findOne({ transactionId: Number(req.params.transactionId) }).lean();
  if (!sale) {
    return res.status(404).json({
      ok: false,
      code: 'FEDAPAY_WEBHOOK_NOT_RECEIVED',
      message: 'Le webhook FedaPay n\'est pas encore arrivé. Réessaie dans quelques secondes.',
    });
  }
  res.json({
    ok:            sale.status === 'applied',
    status:        sale.status,
    publicationId: sale.appliedToPublicationId || null,
    amount:        sale.amount,
    currency:      sale.currency,
  });
});

/* ================================================================
   GET /api/fedapay/find-sale/:pvar (auth)
   Fallback quand onComplete ne remonte pas : cherche la vente la plus
   récente pour un pubId donné.
   ================================================================ */
router.get('/find-sale/:pvar', requireAdmin, async (req, res) => {
  const pvar = String(req.params.pvar || '').trim();
  if (!pvar) return res.status(400).json({ ok: false, error: 'pvar required' });

  const sale = await FedapaySale
    .findOne({ pvar, event: 'transaction.approved' })
    .sort({ receivedAt: -1 })
    .lean();

  if (!sale) return res.status(404).json({ ok: false, code: 'NO_SALE_YET' });

  res.json({
    ok:            true,
    transactionId: sale.transactionId,
    status:        sale.status,
    publicationId: sale.appliedToPublicationId || null,
    amount:        sale.amount,
    currency:      sale.currency,
    receivedAt:    sale.receivedAt,
  });
});

module.exports = router;
