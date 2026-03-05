import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createOrder, checkPromo, trackEvent } from '../utils/api';
import s from './OrderModal.module.css';

const TEMPLATE_LABELS = {
  birthday:          'Birthday Wish',
  special:           'Vœu Spécial',
  'collective-family':'Collectif Famille',
  'collective-pro':  'Collectif Pro',
};
const TEMPLATE_PRICES = { birthday: 5000, special: 6000, 'collective-family': 8000, 'collective-pro': 10000 };

function fmtPrice(p) { return new Intl.NumberFormat('fr-FR').format(p) + ' FCFA'; }

const STEPS = ['Infos', 'Détails', 'Paiement'];

export default function OrderModal({ templateName, onClose }) {
  const [step, setStep]           = useState(0);
  const [form, setForm]           = useState({
    firstName: '', lastName: '', email: '', phone: '',
    recipientName: '', occasion: '', notes: '',
    promoCode: '', paymentMethod: 'wave',
  });
  const [promo, setPromo]         = useState(null);  // { discount, type }
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError]     = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [done, setDone]           = useState(false);
  const [error, setError]         = useState('');

  const basePrice    = TEMPLATE_PRICES[templateName] || 5000;
  const discount     = promo ? (promo.type === 'percent' ? Math.round(basePrice * promo.value / 100) : promo.value) : 0;
  const finalPrice   = Math.max(0, basePrice - discount);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const applyPromo = async () => {
    if (!form.promoCode) return;
    setPromoLoading(true); setPromoError('');
    try {
      const data = await checkPromo(form.promoCode, templateName);
      setPromo({ value: data.value, type: data.type });
    } catch (e) {
      setPromoError(e.message); setPromo(null);
    } finally { setPromoLoading(false); }
  };

  const canNext = () => {
    if (step === 0) return form.firstName && form.email;
    if (step === 1) return form.recipientName && form.occasion;
    return true;
  };

  const submit = async () => {
    setSubmitting(true); setError('');
    try {
      await createOrder({
        templateName,
        client: { firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone },
        recipientName: form.recipientName,
        occasion: form.occasion,
        notes: form.notes,
        promoCode: form.promoCode || undefined,
        paymentMethod: form.paymentMethod,
      });
      // Track purchase
      trackEvent('Purchase', { value: finalPrice, currency: 'XOF', content_name: TEMPLATE_LABELS[templateName] });
      if (typeof window.fbq === 'function') window.fbq('track', 'Purchase', { value: finalPrice, currency: 'XOF' });
      setDone(true);
    } catch (e) { setError(e.message); }
    finally { setSubmitting(false); }
  };

  return (
    <AnimatePresence>
      <motion.div
        className={s.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={s.modal}
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0,  scale: 1 }}
          exit={{ opacity: 0, y: 40, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          onClick={e => e.stopPropagation()}
        >
          {/* Close */}
          <button className={s.close} onClick={onClose}>✕</button>

          {done ? (
            <div className={s.success}>
              <motion.div className={s.successIcon} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}>🎉</motion.div>
              <h3>Commande reçue !</h3>
              <p>Nous vous contacterons dans les prochaines heures pour finaliser votre vœu. Vérifiez votre boîte email.</p>
              <button className={s.btnClose} onClick={onClose}>Fermer</button>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className={s.head}>
                <h3 className={s.title}>{TEMPLATE_LABELS[templateName]}</h3>
                <div className={s.priceTag}>{fmtPrice(finalPrice)}{discount > 0 && <span className={s.strike}>{fmtPrice(basePrice)}</span>}</div>
              </div>

              {/* Step progress */}
              <div className={s.steps}>
                {STEPS.map((label, i) => (
                  <div key={i} className={`${s.stepDot} ${i <= step ? s.active : ''} ${i < step ? s.done : ''}`}>
                    <div className={s.dotCircle}>{i < step ? '✓' : i + 1}</div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>

              {/* Fields */}
              <div className={s.body}>
                {step === 0 && (
                  <div className={s.fields}>
                    <div className={s.row}>
                      <Field label="Prénom *" value={form.firstName} onChange={v => set('firstName', v)} placeholder="Kofi" />
                      <Field label="Nom" value={form.lastName} onChange={v => set('lastName', v)} placeholder="Mensah" />
                    </div>
                    <Field label="Email *" type="email" value={form.email} onChange={v => set('email', v)} placeholder="vous@email.com" />
                    <Field label="Téléphone (WhatsApp)" type="tel" value={form.phone} onChange={v => set('phone', v)} placeholder="+229 97..." />
                  </div>
                )}

                {step === 1 && (
                  <div className={s.fields}>
                    <Field label="Prénom du destinataire *" value={form.recipientName} onChange={v => set('recipientName', v)} placeholder="Marie" />
                    <Field label="Occasion *" value={form.occasion} onChange={v => set('occasion', v)} placeholder="Anniversaire 30 ans, départ en retraite…" />
                    <div className={s.fieldGroup}>
                      <label className={s.label}>Instructions / souhaits</label>
                      <textarea className={s.textarea} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Photos à inclure, musique souhaitée, ambiance particulière…" rows={3} />
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className={s.fields}>
                    {/* Promo */}
                    <div className={s.promoRow}>
                      <input className={s.promoInput} value={form.promoCode} onChange={e => set('promoCode', e.target.value.toUpperCase())} placeholder="Code promo" onKeyDown={e => e.key === 'Enter' && applyPromo()} />
                      <button className={s.promoBtn} onClick={applyPromo} disabled={promoLoading}>{promoLoading ? '…' : 'Appliquer'}</button>
                    </div>
                    {promoError && <p className={s.promoError}>{promoError}</p>}
                    {promo && <p className={s.promoOk}>✓ Code appliqué — économie de {fmtPrice(discount)}</p>}

                    {/* Payment */}
                    <div className={s.fieldGroup}>
                      <label className={s.label}>Mode de paiement</label>
                      <div className={s.payMethods}>
                        {[['wave','Wave'], ['mtn','MTN MoMo'], ['moov','Moov Money']].map(([val, lbl]) => (
                          <label key={val} className={`${s.payOption} ${form.paymentMethod === val ? s.selected : ''}`}>
                            <input type="radio" value={val} checked={form.paymentMethod === val} onChange={() => set('paymentMethod', val)} />
                            {lbl}
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Summary */}
                    <div className={s.summary}>
                      <div className={s.summaryRow}><span>Template</span><span>{TEMPLATE_LABELS[templateName]}</span></div>
                      <div className={s.summaryRow}><span>Prix</span><span>{fmtPrice(basePrice)}</span></div>
                      {discount > 0 && <div className={s.summaryRow}><span>Réduction</span><span className={s.discount}>−{fmtPrice(discount)}</span></div>}
                      <div className={`${s.summaryRow} ${s.total}`}><span>Total</span><span>{fmtPrice(finalPrice)}</span></div>
                    </div>
                    {error && <p className={s.errorMsg}>{error}</p>}
                  </div>
                )}
              </div>

              {/* Footer nav */}
              <div className={s.foot}>
                {step > 0 && <button className={s.btnBack} onClick={() => setStep(s => s - 1)}>← Retour</button>}
                {step < STEPS.length - 1
                  ? <button className={s.btnNext} onClick={() => setStep(s => s + 1)} disabled={!canNext()}>Suivant →</button>
                  : <button className={s.btnSubmit} onClick={submit} disabled={submitting || !canNext()}>{submitting ? 'Envoi…' : `Commander · ${fmtPrice(finalPrice)}`}</button>
                }
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Field({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div className={s.fieldGroup}>
      <label className={s.label}>{label}</label>
      <input className={s.input} type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}