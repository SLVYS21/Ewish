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
  const t = setTimeout(() => controller.abort(), 15000);
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

/* Mapping opérateur → path endpoint FeexPay Mobile Money.
   Les noms de path viennent du SDK PHP officiel. On accepte des alias
   pour rester tolérant à la casse / aux abréviations. */
const OPERATOR_PATHS = {
  mtn:        'mtn_ci',      // fallback CI, override via req.operator
  moov:       'moov_ci',
  orange:     'orange_ci',
  wave:       'wave_ci',
  'mtn-benin':    'mtn_benin',
  'moov-benin':   'moov_benin',
  'mtn-ci':       'mtn_ci',
  'moov-ci':      'moov_ci',
  'orange-ci':    'orange_ci',
  'orange-sn':    'orange_sn',
  'free-sn':      'free_sn',
  'togocom-tg':   'togocom_tg',
  'moov-tg':      'moov_tg',
  'airtel-ne':    'airtel_ne',
};

function resolveOperator(op) {
  const key = String(op || '').toLowerCase();
  return OPERATOR_PATHS[key] || key.replace(/[^a-z_]/g, '_');
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

  const opPath = resolveOperator(operator);
  const url = `/api/transactions/public/requesttopay/${opPath}`;
  const body = {
    shop:        SHOP_ID,
    amount:      Number(amount),
    phoneNumber: String(phone).replace(/\s+/g, ''),
    reason:      description || 'Contribution myKado',
    custom_id:   customId || '',
    callback_url: callbackUrl || '',
    email:       email || '',
    first_name:  firstName || '',
    last_name:   lastName || '',
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

  const url = `/api/transactions/public/card/inittransact`;
  const body = {
    shop:        SHOP_ID,
    amount:      Number(amount),
    reason:      description || 'Paiement myKado',
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
