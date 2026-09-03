import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, CreditCard, Smartphone, ChevronDown, Check } from 'lucide-react';
import axios from 'axios';
import s from './FeexPayModal.module.css';

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

/* ================================================================
   Catalogue pays × opérateurs — aligné sur le mapping FeexPay
   (server/services/feexpay.js). Le `id` doit correspondre à une
   clé OPERATOR_MAP côté serveur, sinon l'init échoue.
   ================================================================ */
const COUNTRIES = [
  { code: 'BJ', name: 'Bénin',        flag: '🇧🇯', dial: '229', digits: 10, mask: [2, 2, 2, 2, 2], sample: '01 90 12 34 56',
    ops: [
      { id: 'mtn-benin',     brand: 'MTN' },
      { id: 'moov-benin',    brand: 'Moov' },
      { id: 'celtiis-benin', brand: 'Celtiis' },
    ] },
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', dial: '225', digits: 10, mask: [2, 2, 2, 2, 2], sample: '07 12 34 56 78',
    ops: [
      { id: 'mtn-ci',    brand: 'MTN' },
      { id: 'moov-ci',   brand: 'Moov' },
      { id: 'orange-ci', brand: 'Orange' },
      { id: 'wave-ci',   brand: 'Wave' },
    ] },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', dial: '226', digits: 8, mask: [2, 2, 2, 2], sample: '70 12 34 56',
    ops: [
      { id: 'moov-bf',   brand: 'Moov' },
      { id: 'orange-bf', brand: 'Orange' },
    ] },
  { code: 'SN', name: 'Sénégal',      flag: '🇸🇳', dial: '221', digits: 9, mask: [2, 3, 2, 2], sample: '77 123 45 67',
    ops: [
      { id: 'orange-sn', brand: 'Orange' },
      { id: 'free-sn',   brand: 'Free' },
    ] },
  { code: 'TG', name: 'Togo',         flag: '🇹🇬', dial: '228', digits: 8, mask: [2, 2, 2, 2], sample: '90 12 34 56',
    ops: [
      { id: 'togocom-tg', brand: 'Togocom' },
      { id: 'moov-tg',    brand: 'Moov' },
    ] },
  { code: 'CG', name: 'Congo Brazza', flag: '🇨🇬', dial: '242', digits: 9, mask: [2, 3, 2, 2], sample: '06 123 45 67',
    ops: [
      { id: 'mtn-cg', brand: 'MTN' },
    ] },
];

/* Charte des opérateurs — approximation des couleurs officielles.
   Utilisée comme fallback (pastille brand + monogramme) si le SVG manque. */
const BRAND_STYLES = {
  MTN:     { bg: '#FFCC00', fg: '#000000', mono: 'MTN' },
  Moov:    { bg: '#003DA5', fg: '#FFFFFF', mono: 'moov' },
  Orange:  { bg: '#FF7900', fg: '#FFFFFF', mono: 'orange' },
  Wave:    { bg: '#1EC8F8', fg: '#0B2540', mono: 'W' },
  Celtiis: { bg: '#E4002B', fg: '#FFFFFF', mono: 'C' },
  Free:    { bg: '#EF008E', fg: '#FFFFFF', mono: 'free' },
  Togocom: { bg: '#E4002B', fg: '#FFFFFF', mono: 't' },
};

/* Logos SVG servis depuis client/public/logos/. */
const BRAND_LOGO = {
  MTN:     '/logos/mtn.svg',
  Moov:    '/logos/moov.svg',
  Orange:  '/logos/orange.svg',
  Wave:    '/logos/wave.svg',
  Celtiis: '/logos/celtiis.svg',
  Free:    '/logos/free.svg',
  Togocom: '/logos/togocom.svg',
};

function OperatorLogo({ brand }) {
  const [imgFailed, setImgFailed] = useState(false);
  const logoUrl = BRAND_LOGO[brand];

  if (logoUrl && !imgFailed) {
    return (
      <div className={s.opLogo} style={{ background: '#fff', padding: 4 }} aria-hidden="true">
        <img
          src={logoUrl}
          alt=""
          onError={() => setImgFailed(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    );
  }

  const style = BRAND_STYLES[brand] || { bg: '#EAE0E5', fg: '#2B1A2D', mono: brand?.slice(0, 2)?.toUpperCase() || '?' };
  return (
    <div
      className={s.opLogo}
      style={{ background: style.bg, color: style.fg }}
      aria-hidden="true"
    >
      {style.mono}
    </div>
  );
}

/* Formate un flux de chiffres selon le masque du pays (ex. [2,2,2,2,2]
   pour BJ → "01 90 12 34 56"). Retourne aussi la longueur "propre". */
function formatPhone(digits, country) {
  const clean = String(digits || '').replace(/\D/g, '').slice(0, country.digits);
  const parts = [];
  let cursor = 0;
  for (const g of country.mask) {
    if (cursor >= clean.length) break;
    parts.push(clean.slice(cursor, cursor + g));
    cursor += g;
  }
  return { display: parts.join(' '), clean };
}

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS  = 2 * 60 * 1000;

/* Props :
   - amount, description, customId
   - initEndpoint  ('/feexpay/init' par défaut — auth ; ou '/contributions/feexpay-init')
   - initExtraBody (object, mergé dans le body /init)
   - onClose(), onSuccess({ reference, amount }), onFailure(err)
*/
export default function FeexPayModal({
  amount,
  description,
  customId,
  initEndpoint = '/feexpay/init',
  initExtraBody = {},
  onClose,
  onSuccess,
  onFailure,
}) {
  const [countryCode, setCountryCode] = useState('BJ');
  const [countryOpen, setCountryOpen] = useState(false);
  const [operator, setOperator]       = useState('mtn-benin');
  const [phone, setPhone]             = useState('');
  const [payWithCard, setPayWithCard] = useState(false);
  const [phase, setPhase]             = useState('idle');   // idle | initiating | waiting | error
  const [error, setError]             = useState('');
  const [reference, setReference]     = useState(null);
  const pollTimerRef = useRef(null);
  const startedAtRef = useRef(null);

  const country = useMemo(() => COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0], [countryCode]);
  const { display: phoneDisplay, clean: phoneClean } = formatPhone(phone, country);
  const phoneValid = phoneClean.length === country.digits;

  /* Reset opérateur si le pays change et que l'op courant n'existe pas
     dans le nouveau pays. */
  useEffect(() => {
    if (payWithCard) return;
    if (!country.ops.some(op => op.id === operator)) {
      setOperator(country.ops[0].id);
    }
  }, [country, operator, payWithCard]);

  useEffect(() => () => {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
  }, []);

  async function poll(ref) {
    try {
      const { data } = await axios.get(`${BASE}/feexpay/status/${encodeURIComponent(ref)}`);
      if (data.status === 'SUCCESSFUL') {
        clearInterval(pollTimerRef.current);
        onSuccess?.({ reference: ref, amount: data.amount });
        return;
      }
      if (data.status === 'FAILED') {
        clearInterval(pollTimerRef.current);
        setError('Le paiement a échoué ou a été annulé.');
        setPhase('error');
        onFailure?.(new Error('FAILED'));
        return;
      }
      if (Date.now() - startedAtRef.current > POLL_TIMEOUT_MS) {
        clearInterval(pollTimerRef.current);
        setError('Délai dépassé. Réessaie ou vérifie ton mobile.');
        setPhase('error');
        onFailure?.(new Error('TIMEOUT'));
      }
    } catch (e) { /* on retente au prochain tick */ }
  }

  async function handleSubmit() {
    setError('');
    if (!payWithCard && !phoneValid) {
      setError(`Numéro invalide — attendu ${country.digits} chiffres.`);
      return;
    }
    setPhase('initiating');
    try {
      /* En E.164 : dialCode + digits locaux. Le serveur strippe le "+" et
         les espaces avant d'appeler FeexPay. */
      const fullPhone = payWithCard ? undefined : `${country.dial}${phoneClean}`;
      const body = {
        amount,
        operator: payWithCard ? 'card' : operator,
        phone:    fullPhone,
        description,
        customId,
        ...initExtraBody,
      };
      const { data } = await axios.post(`${BASE}${initEndpoint}`, body, { withCredentials: true });
      const ref = data.reference;
      setReference(ref);

      if (data.redirectUrl) {
        window.open(data.redirectUrl, '_blank', 'noopener');
      }

      startedAtRef.current = Date.now();
      setPhase('waiting');
      pollTimerRef.current = setInterval(() => poll(ref), POLL_INTERVAL_MS);
      poll(ref);
    } catch (e) {
      setError(e.response?.data?.error || e.message || 'Erreur au démarrage du paiement');
      setPhase('error');
    }
  }

  function handleCancelPolling() {
    if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    setPhase('idle');
    setReference(null);
  }

  const selectedOp = country.ops.find(op => op.id === operator);
  const selectedOpBrand = selectedOp?.brand || 'MTN';

  const modalContent = (
    <div className={s.overlay} onClick={phase === 'waiting' ? undefined : onClose}>
      <div className={s.modal} onClick={e => e.stopPropagation()}>
        <div className={s.header}>
          <h2>Paiement</h2>
          {phase !== 'waiting' && (
            <button className={s.closeBtn} onClick={onClose} aria-label="Fermer">
              <X size={18} />
            </button>
          )}
        </div>

        <div className={s.body}>
          <div className={s.amountBox}>
            <div className={s.amountLabel}>Montant</div>
            <div className={s.amountValue}>{amount.toLocaleString('fr-FR')} FCFA</div>
          </div>

          {phase === 'waiting' ? (
            <div className={s.waiting}>
              <Loader2 size={40} className={s.spin} />
              <div className={s.waitTitle}>Confirme sur ton téléphone</div>
              <div className={s.waitText}>
                Ouvre l'application {selectedOpBrand} et valide la
                demande de paiement. La confirmation se fait automatiquement.
              </div>
              {reference && <div className={s.waitRef}>Réf : {reference}</div>}
              <button className={s.waitCancel} onClick={handleCancelPolling}>Annuler</button>
            </div>
          ) : (
            <>
              {/* --- Sélecteur pays --- */}
              <label className={s.fieldLabel}>Pays</label>
              <button
                type="button"
                className={s.countryPicker}
                onClick={() => setCountryOpen(o => !o)}
                aria-expanded={countryOpen}
              >
                <span className={s.countryFlag}>{country.flag}</span>
                <span className={s.countryName}>{country.name}</span>
                <span className={s.countryDial}>+{country.dial}</span>
                <ChevronDown size={16} className={`${s.chev} ${countryOpen ? s.chevOpen : ''}`} />
              </button>

              {countryOpen && (
                <div className={s.countryList} role="listbox">
                  {COUNTRIES.map(c => (
                    <button
                      key={c.code}
                      type="button"
                      className={`${s.countryItem} ${c.code === countryCode ? s.countryItemActive : ''}`}
                      onClick={() => { setCountryCode(c.code); setCountryOpen(false); setPayWithCard(false); setPhone(''); }}
                      role="option"
                      aria-selected={c.code === countryCode}
                    >
                      <span className={s.countryFlag}>{c.flag}</span>
                      <span className={s.countryName}>{c.name}</span>
                      <span className={s.countryDial}>+{c.dial}</span>
                      {c.code === countryCode && <Check size={14} className={s.countryCheck} />}
                    </button>
                  ))}
                </div>
              )}

              {!payWithCard && (
                <>
                  {/* --- Opérateurs du pays --- */}
                  <label className={s.fieldLabel} style={{ marginTop: 14 }}>Opérateur</label>
                  <div
                    className={s.operators}
                    style={{ gridTemplateColumns: `repeat(${Math.min(country.ops.length, 4)}, 1fr)` }}
                  >
                    {country.ops.map(op => (
                      <button
                        key={op.id}
                        type="button"
                        className={`${s.op} ${operator === op.id ? s.opActive : ''}`}
                        onClick={() => setOperator(op.id)}
                      >
                        <OperatorLogo brand={op.brand} />
                        <span className={s.opLabel}>{op.brand}</span>
                      </button>
                    ))}
                  </div>

                  {/* --- Numéro avec préfixe fixe --- */}
                  <label className={s.fieldLabel}>Numéro de téléphone</label>
                  <div className={s.phoneWrap}>
                    <span className={s.phonePrefix}>+{country.dial}</span>
                    <input
                      type="tel"
                      inputMode="tel"
                      className={s.phoneInput}
                      placeholder={country.sample}
                      value={phoneDisplay}
                      onChange={e => setPhone(e.target.value)}
                      autoFocus
                      aria-invalid={phone && !phoneValid ? 'true' : undefined}
                    />
                  </div>
                  <div className={s.hint}>
                    Format attendu : {country.sample} — tu recevras une demande de confirmation sur ce numéro.
                  </div>
                </>
              )}

              {payWithCard && (
                <div className={s.cardNotice}>
                  <CreditCard size={18} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div className={s.cardNoticeTitle}>Paiement par carte bancaire</div>
                      <div style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }} aria-hidden="true">
                        <img src="/logos/visa.svg" alt="" style={{ height: 16, objectFit: 'contain' }} />
                        <img src="/logos/mastercard.svg" alt="" style={{ height: 16, objectFit: 'contain' }} />
                      </div>
                    </div>
                    <div className={s.cardNoticeText}>Une nouvelle fenêtre s'ouvrira pour saisir tes informations en toute sécurité.</div>
                  </div>
                </div>
              )}

              {error && <div className={s.errorBox}>{error}</div>}

              <button
                className={s.payBtn}
                onClick={handleSubmit}
                disabled={phase === 'initiating' || (!payWithCard && !phoneValid)}
              >
                {phase === 'initiating' ? (
                  <><Loader2 size={16} className={s.spin} /> Initialisation…</>
                ) : (
                  <>{payWithCard ? <CreditCard size={16} /> : <Smartphone size={16} />} Payer {amount.toLocaleString('fr-FR')} FCFA</>
                )}
              </button>

              {/* --- Séparateur + option carte --- */}
              <div className={s.divider}><span>ou</span></div>
              <button
                type="button"
                className={`${s.altPayBtn} ${payWithCard ? s.altPayBtnActive : ''}`}
                onClick={() => setPayWithCard(v => !v)}
              >
                <CreditCard size={16} />
                {payWithCard ? 'Utiliser Mobile Money' : 'Payer par carte bancaire'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined'
    ? createPortal(modalContent, document.body)
    : modalContent;
}
