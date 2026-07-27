import { useState, useEffect, useRef } from 'react';
import { X, Loader2, CreditCard, Smartphone } from 'lucide-react';
import axios from 'axios';
import s from './FeexPayModal.module.css';

const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';

/* Liste des opérateurs proposés — à ajuster selon les pays cibles.
   `path` correspond à la clé attendue par le service feexpay.js côté serveur. */
const OPERATORS = [
  { id: 'mtn-benin',   label: 'MTN',    color: '#FFC800', short: 'MTN' },
  { id: 'moov-benin',  label: 'Moov',   color: '#00A3E0', short: 'MV' },
  { id: 'orange-ci',   label: 'Orange', color: '#FF7900', short: 'OR' },
  { id: 'wave',        label: 'Wave',   color: '#1EC8F8', short: 'WV' },
  { id: 'card',        label: 'Carte',  color: '#2B1A2D', short: 'CB' },
];

const POLL_INTERVAL_MS = 3000;
const POLL_TIMEOUT_MS  = 2 * 60 * 1000; // 2 min

/* Props :
   - amount        (number, FCFA)
   - description   (string)
   - customId      (string)
   - initEndpoint  ('/feexpay/init' par défaut — auth ; ou '/contributions/feexpay-init' — public + publicationId)
   - initExtraBody (object, mergé dans le body /init — ex. {publicationId})
   - onClose()
   - onSuccess({ reference, amount })
   - onFailure(err)
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
  const [operator, setOperator] = useState('mtn-benin');
  const [phone, setPhone]       = useState('');
  const [phase, setPhase]       = useState('idle'); // idle | initiating | waiting | error
  const [error, setError]       = useState('');
  const [reference, setReference] = useState(null);
  const pollTimerRef = useRef(null);
  const startedAtRef = useRef(null);

  const isCard = operator === 'card';

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
      /* Timeout : 2 min sans SUCCESS ni FAILED. */
      if (Date.now() - startedAtRef.current > POLL_TIMEOUT_MS) {
        clearInterval(pollTimerRef.current);
        setError('Délai dépassé. Réessaie ou vérifie ton mobile.');
        setPhase('error');
        onFailure?.(new Error('TIMEOUT'));
      }
    } catch (e) {
      /* on ignore les erreurs réseau ponctuelles, on retentera au prochain tick */
    }
  }

  async function handleSubmit() {
    setError('');
    if (!isCard && !phone.trim()) {
      setError('Numéro requis');
      return;
    }
    setPhase('initiating');
    try {
      const body = {
        amount,
        operator,
        phone: isCard ? undefined : phone.replace(/\s+/g, ''),
        description,
        customId,
        ...initExtraBody,
      };
      const { data } = await axios.post(`${BASE}${initEndpoint}`, body, { withCredentials: true });
      const ref = data.reference;
      setReference(ref);

      if (data.redirectUrl) {
        /* Carte : on ouvre le checkout hébergé dans une nouvelle fenêtre,
           puis on poll comme pour Mobile Money. */
        window.open(data.redirectUrl, '_blank', 'noopener');
      }

      startedAtRef.current = Date.now();
      setPhase('waiting');
      pollTimerRef.current = setInterval(() => poll(ref), POLL_INTERVAL_MS);
      /* Premier check immédiat pour le cas où le webhook a déjà été traité. */
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

  return (
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
                Ouvre l'application {OPERATORS.find(o => o.id === operator)?.label} et valide la
                demande de paiement. La confirmation se fait automatiquement.
              </div>
              {reference && <div className={s.waitRef}>Réf : {reference}</div>}
              <button className={s.waitCancel} onClick={handleCancelPolling}>Annuler</button>
            </div>
          ) : (
            <>
              <label className={s.fieldLabel}>Moyen de paiement</label>
              <div className={s.operators}>
                {OPERATORS.map(op => (
                  <button
                    key={op.id}
                    type="button"
                    className={`${s.op} ${operator === op.id ? s.opActive : ''}`}
                    onClick={() => setOperator(op.id)}
                  >
                    <div className={s.opDot} style={{ background: op.color }}>
                      {op.id === 'card' ? <CreditCard size={12} /> : op.short}
                    </div>
                    {op.label}
                  </button>
                ))}
              </div>

              {!isCard && (
                <>
                  <label className={s.fieldLabel}>Numéro de téléphone</label>
                  <input
                    type="tel"
                    className={s.input}
                    placeholder="+229 90 00 00 00"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    autoFocus
                  />
                  <div className={s.hint}>
                    Tu recevras une demande de confirmation sur ce numéro.
                  </div>
                </>
              )}

              {error && <div className={s.errorBox}>{error}</div>}

              <button
                className={s.payBtn}
                onClick={handleSubmit}
                disabled={phase === 'initiating'}
              >
                {phase === 'initiating' ? (
                  <><Loader2 size={16} className={s.spin} /> Initialisation…</>
                ) : (
                  <>{isCard ? <CreditCard size={16} /> : <Smartphone size={16} />} Payer {amount.toLocaleString('fr-FR')} FCFA</>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
