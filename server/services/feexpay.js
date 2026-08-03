/* ================================================================
   FeexPay — thin wrapper autour de l'API REST officielle
   https://api.feexpay.me
   ---------------------------------------------------------------
   Pas de SDK Node officiel : on appelle l'API directement via axios
   avec un Bearer token. Utilisé côté serveur pour :
     - verify(reference)              → vérif d'une transaction
     - initMobileMoney(...)           → init d'un paiement Mobile Money
     - initCard(...)                  → init d'un paiement carte

   Env requises :
     FEEXPAY_TOKEN        (token API privé serveur)
     FEEXPAY_SHOP_ID      (id boutique)
     FEEXPAY_MODE         (LIVE | SANDBOX) — informational, l'API base
                           reste api.feexpay.me dans les deux modes.
   ================================================================ */

const fetch = require('node-fetch');

/* Base URL alignée sur le SDK PHP officiel foxinnovs/feexpay-sdk-php :
   les endpoints /api/transactions/requesttopay/integration et
   /api/transactions/getrequesttopay/integration/{ref} n'existent que sur
   api.feexpay.me — api-v2 renvoie 404 dessus. */
const BASE_URL = process.env.FEEXPAY_BASE_URL || 'https://api.feexpay.me';
const TOKEN    = process.env.FEEXPAY_TOKEN || '';
const SHOP_ID  = process.env.FEEXPAY_SHOP_ID || '';

function authHeaders() {
  if (!TOKEN) throw new Error('FEEXPAY_TOKEN manquant en environnement.');
  return {
    'Content-Type':  'application/json',
    Authorization:   `Bearer ${TOKEN}`,
  };
}

/* Wrapper fetch avec timeout + parse JSON + gestion d'erreur homogène.
   throw sur HTTP >= 400. */
async function request(method, path, body) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 60000);
  let res;
  try {
    res = await fetch(BASE_URL + path, {
      method,
      headers: authHeaders(),
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(t);
  }
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw: text }; }
  if (!res.ok) {
    const err = new Error(`FeexPay ${res.status}: ${data?.message || data?.error || text || res.statusText}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/* Mapping opérateur → valeur `reseau` attendue par l'API v1 dans le body.
   L'endpoint est fixe (/requesttopay/integration) ; c'est le champ `reseau`
   qui identifie l'opérateur. Le SDK PHP passe des noms UPPERCASE, ex.
   "MTN", "MOOV" pour Bénin, "MTN CI", "ORANGE CI", etc. pour les autres. */
const OPERATOR_NETWORKS = {
  'mtn-benin':  'MTN',
  'moov-benin': 'MOOV',
  mtn:          'MTN',
  moov:         'MOOV',
  'mtn-ci':     'MTN CI',
  'moov-ci':    'MOOV CI',
  'orange-ci':  'ORANGE CI',
  'wave-ci':    'WAVE CI',
  wave:         'WAVE CI',
  orange:       'ORANGE CI',
  'orange-sn':  'ORANGE SN',
  'free-sn':    'FREE SN',
  'togocom-tg': 'TOGOCOM TG',
  'moov-tg':    'MOOV TG',
  'airtel-ne':  'AIRTEL NE',
};

function resolveOperator(op) {
  const key = String(op || '').toLowerCase();
  return OPERATOR_NETWORKS[key] || String(op || '').toUpperCase();
}

/* ---------------------------------------------------------------- *
   verify(reference)
   Renvoie une forme normalisée :
     { status: 'SUCCESSFUL' | 'FAILED' | 'PENDING',
       amount: Number, reference: String, raw: Object }
   Ne throw jamais sur un statut business — throw seulement sur erreur
   réseau / HTTP.
 * ---------------------------------------------------------------- */
async function verify(reference) {
  if (!reference) throw new Error('reference requise');
  const url = `/api/transactions/getrequesttopay/integration/${encodeURIComponent(reference)}`;
  const data = await request('GET', url);

  // FeexPay renvoie parfois status en majuscule/minuscule ou dans data.transaction
  const raw = data?.transaction || data || {};
  const rawStatus = String(raw.status || data?.status || '').toUpperCase();
  let status = 'PENDING';
  if (['SUCCESSFUL', 'SUCCESS', 'COMPLETED', 'PAID'].includes(rawStatus)) status = 'SUCCESSFUL';
  else if (['FAILED', 'FAILURE', 'CANCELED', 'CANCELLED', 'REJECTED', 'EXPIRED'].includes(rawStatus)) status = 'FAILED';

  const amount = Number(raw.amount ?? data?.amount ?? 0) || 0;
  const ref    = raw.reference || data?.reference || reference;

  return { status, amount, reference: ref, raw: data };
}

/* ---------------------------------------------------------------- *
   initMobileMoney({ amount, phone, operator, description, customId,
                     callbackUrl, email, firstName, lastName })
   Renvoie { reference, raw }.
 * ---------------------------------------------------------------- */
async function initMobileMoney({
  amount, phone, operator, description, customId, callbackUrl,
  email, firstName, lastName,
}) {
  if (!amount || amount <= 0) throw new Error('amount invalide');
  if (!phone) throw new Error('phone requis');
  if (!operator) throw new Error('operator requis');
  if (!SHOP_ID) throw new Error('FEEXPAY_SHOP_ID manquant en environnement.');

  const reseau = resolveOperator(operator);
  const url = `/api/transactions/requesttopay/integration`;
  /* Body aligné sur le SDK PHP officiel (paiementLocal). L'API attend
     `token` en body en plus du header Authorization, et `reseau` pour
     identifier l'opérateur. On garde `description`/`custom_id` en champs
     additionnels : ignorés par l'API si non supportés, utiles pour debug. */
  const body = {
    phoneNumber: String(phone).replace(/\s+/g, ''),
    amount:      Number(amount),
    reseau,
    token:       TOKEN,
    shop:        SHOP_ID,
    first_name:  firstName || '',
    last_name:   lastName || '',
    email:       email || '',
    description: description || 'Paiement myKado',
    custom_id:   customId || '',
    callback_info: callbackUrl || '',
  };
  const data = await request('POST', url, body);
  const reference = data?.reference || data?.transaction?.reference || data?.transaction_id;
  if (!reference) throw new Error('FeexPay: aucune référence retournée');
  return { reference, raw: data };
}

/* ---------------------------------------------------------------- *
   initCard({ amount, description, customId, callbackUrl,
              email, firstName, lastName })
   Renvoie { reference, redirectUrl, raw } — redirectUrl à ouvrir en
   nouvelle fenêtre pour le paiement carte.
 * ---------------------------------------------------------------- */
async function initCard({
  amount, description, customId, callbackUrl,
  email, firstName, lastName,
}) {
  if (!amount || amount <= 0) throw new Error('amount invalide');
  if (!SHOP_ID) throw new Error('FEEXPAY_SHOP_ID manquant en environnement.');

  const url = `/api/transactions/card/inittransact/integration`;
  const body = {
    shop:        SHOP_ID,
    token:       TOKEN,
    amount:      Number(amount),
    reason:      description || 'Paiement myKado',
    description: description || 'Paiement myKado',
    custom_id:   customId || '',
    callback_url: callbackUrl || '',
    email:       email || '',
    first_name:  firstName || '',
    last_name:   lastName || '',
  };
  const data = await request('POST', url, body);
  const reference   = data?.reference || data?.transaction?.reference;
  const redirectUrl = data?.redirect_url || data?.url || data?.payment_url;
  if (!reference) throw new Error('FeexPay: aucune référence retournée');
  return { reference, redirectUrl, raw: data };
}

module.exports = {
  verify,
  initMobileMoney,
  initCard,
  resolveOperator,
  OPERATOR_PATHS,
};
