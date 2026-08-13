/* ================================================================
   FeexPay — thin wrapper autour de l'API REST
   ---------------------------------------------------------------
   Deux hosts existent :
     - api-v2.feexpay.me   → v2 publique, VIVANT et validé pour init
     - api.feexpay.me      → v1 historique, actuellement instable/502
                             mais reste la seule route publique pour
                             la vérification par référence (le v2 n'expose
                             pas d'endpoint GET public de query).

   Endpoints utilisés :
     POST /api/transactions/public/requesttopay/{operator}   (v2)
     POST /api/transactions/public/initcard                  (v2)
     GET  /api/transactions/getrequesttopay/integration/{ref} (v1, fallback)

   Env requises :
     FEEXPAY_TOKEN        (token API privé serveur, header Bearer)
     FEEXPAY_SHOP_ID      (id boutique)
   Env optionnelles :
     FEEXPAY_BASE_URL     (override host init/card, défaut api-v2)
     FEEXPAY_VERIFY_URL   (override host verify, défaut api v1)
   ================================================================ */

const fetch = require('node-fetch');

const BASE_URL   = process.env.FEEXPAY_BASE_URL   || 'https://api-v2.feexpay.me';
const VERIFY_URL = process.env.FEEXPAY_VERIFY_URL || 'https://api.feexpay.me';
const TOKEN      = process.env.FEEXPAY_TOKEN      || '';
const SHOP_ID    = process.env.FEEXPAY_SHOP_ID    || '';

function authHeaders() {
  if (!TOKEN) throw new Error('FEEXPAY_TOKEN manquant en environnement.');
  return {
    'Content-Type':  'application/json',
    Authorization:   `Bearer ${TOKEN}`,
  };
}

async function request(method, url, body, { timeoutMs = 60000 } = {}) {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), timeoutMs);
  let res;
  try {
    res = await fetch(url, {
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

/* Mapping opérateur → { path, reseau } — le path va dans l'URL, le reseau
   dans le body. Le SDK React officiel envoie les deux : path pour router,
   reseau pour déclencher le vrai push USSD chez l'opérateur.
   Valeurs reseau validées contre le SDK React v1.5.8 (module Re) :
     BENIN         : MTN=MTN, MOOV=MOOV, CELTIIS="CELTIIS BJ"
     COTE_D_IVOIRE : MTN="MTN CI", MOOV="MOOV CI", ORANGE="ORANGE CI", WAVE="WAVE CI"
     BURKINA_FASO  : MOOV="MOOV BF", ORANGE="ORANGE BF"
     SENEGAL       : ORANGE="ORANGE SN", FREE="FREE SN"
     TOGO          : TOGOCOM="TOGOCOM TG", MOOV="MOOV TG" */
const OPERATOR_MAP = {
  'mtn-benin':     { path: 'mtn',         reseau: 'MTN' },
  'moov-benin':    { path: 'moov',        reseau: 'MOOV' },
  'celtiis-benin': { path: 'celtiis_bj',  reseau: 'CELTIIS BJ' },
  mtn:             { path: 'mtn',         reseau: 'MTN' },
  moov:            { path: 'moov',        reseau: 'MOOV' },
  'mtn-ci':        { path: 'mtn_ci',      reseau: 'MTN CI' },
  'moov-ci':       { path: 'moov_ci',     reseau: 'MOOV CI' },
  'orange-ci':     { path: 'orange_ci',   reseau: 'ORANGE CI' },
  'wave-ci':       { path: 'wave_ci',     reseau: 'WAVE CI' },
  wave:            { path: 'wave_ci',     reseau: 'WAVE CI' },
  orange:          { path: 'orange_ci',   reseau: 'ORANGE CI' },
  'orange-sn':     { path: 'orange_sn',   reseau: 'ORANGE SN' },
  'free-sn':       { path: 'free_sn',     reseau: 'FREE SN' },
  'togocom-tg':    { path: 'togocom_tg',  reseau: 'TOGOCOM TG' },
  'moov-tg':       { path: 'moov_tg',     reseau: 'MOOV TG' },
  'moov-bf':       { path: 'moov_bf',     reseau: 'MOOV BF' },
  'orange-bf':     { path: 'orange_bf',   reseau: 'ORANGE BF' },
  'mtn-cg':        { path: 'mtn_cg',      reseau: 'MTN CG' },
};

function resolveOperator(op) {
  const key = String(op || '').toLowerCase();
  if (OPERATOR_MAP[key]) return OPERATOR_MAP[key];
  const fallback = key.replace(/[^a-z_0-9]/g, '_');
  return { path: fallback, reseau: fallback.toUpperCase().replace(/_/g, ' ') };
}

/* ---------------------------------------------------------------- *
   verify(reference)
   Renvoie { status: 'SUCCESSFUL' | 'FAILED' | 'PENDING',
             amount: Number, reference: String, raw: Object }
   Ne throw jamais sur un statut business — throw seulement sur erreur
   réseau / HTTP.
 * ---------------------------------------------------------------- */
async function verify(reference) {
  if (!reference) throw new Error('reference requise');
  /* v1 sur api.feexpay.me est le seul host qui expose une lecture GET
     par référence (l'API v2 attend un webhook via callback_info).
     Ce host peut être temporairement en 502 : on renvoie alors PENDING
     silencieusement plutôt que de throw, pour que le polling front
     continue proprement sans spammer les logs. */
  const url = `${VERIFY_URL}/api/transactions/getrequesttopay/integration/${encodeURIComponent(reference)}`;
  let data;
  try {
    data = await request('GET', url, null, { timeoutMs: 15000 });
  } catch (err) {
    if (err.status === 502 || err.status === 503 || err.status === 504 || err.name === 'AbortError') {
      return { status: 'PENDING', amount: 0, reference, raw: { upstreamError: err.message } };
    }
    throw err;
  }

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

  const { path: opPath, reseau } = resolveOperator(operator);
  const url = `${BASE_URL}/api/transactions/public/requesttopay/${opPath}`;
  /* Normalisation numéro : strip espaces ET le "+" (l'API rejette
     silencieusement les numéros avec + — HTTP 202 mais aucun USSD envoyé).
     Aligné sur le SDK React officiel. */
  const phoneNumber = String(phone).replace(/\s+/g, '').replace(/\+/g, '');
  /* MTN rejette les caractères non-alphanumériques dans description
     (accents, tirets, em-dash…) — sanitize comme le SDK React. */
  let desc = description || 'Paiement myKado';
  if (reseau === 'MTN' || reseau.startsWith('MTN')) {
    desc = desc.replace(/[^a-zA-Z0-9 ]/g, '');
  }
  /* Body validé sur SDK React 1.5.8. Le `reseau` en body ET le path
     spécialisé sont tous les deux requis pour déclencher le vrai USSD.
     ⚠ `email` doit être OMIS s'il est vide — FeexPay valide "email valide
     ou absent", mais rejette la chaîne vide ("Validation failed"). */
  const body = {
    phoneNumber,
    amount:            Number(amount),
    shop:              SHOP_ID,
    reseau,
    currency:          'XOF',
    payment_interface: 'API',
    description:       desc,
    custom_id:         customId || '',
    first_name:        firstName || '',
    last_name:         lastName || '',
    callback_info:     callbackUrl || '',
    otp:               '',
  };
  if (email) body.email = email;
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

  const url = `${BASE_URL}/api/transactions/public/initcard`;
  /* Même règle que initMobileMoney : email omis si vide, pour éviter le
     "Validation failed" côté FeexPay. */
  const body = {
    shop:         SHOP_ID,
    amount:       Number(amount),
    description:  description || 'Paiement myKado',
    custom_id:    customId || '',
    callback_url: callbackUrl || '',
    firstName:    firstName || '',
    lastName:     lastName || '',
  };
  if (email) body.email = email;
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
  OPERATOR_MAP,
};
