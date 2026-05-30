import { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, Shield, Camera, Check, Loader, Copy } from 'lucide-react';
import QRCode from 'qrcode';
import { submitKyc, generateKycMobileToken, getKycStatus } from '../utils/api';
import styles from './KycModal.module.css';

async function uploadFile(file) {
  const form = new FormData();
  form.append('file', file);
  const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur upload');
  return data.url;
}

const isMobile = () =>
  'ontouchstart' in window || window.matchMedia('(pointer:coarse)').matches;

const DOC_TIPS = [
  'Les 4 coins du document sont visibles',
  'Pas de reflet ni d\'ombre',
  'Texte parfaitement lisible',
  'Fond uni de préférence',
];

const SELFIE_TIPS = [
  'Bonne luminosité, pas de contre-jour',
  'Regardez droit vers l\'appareil photo',
  'Tenez votre pièce d\'identité visible dans la main',
  'Fond neutre de préférence',
];

const STEPS = ['Identité', 'Selfie', 'Confirmation'];

export default function KycModal({ open, onClose, onDone }) {
  const [step, setStep] = useState(0);

  // Step 0 — Identité
  const [fullName, setFullName] = useState('');
  const [idType, setIdType] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');
  const [documentPreview, setDocumentPreview] = useState('');
  const [docUploading, setDocUploading] = useState(false);
  const [docUploadError, setDocUploadError] = useState('');

  // Step 1 — Selfie
  const [selfieUrl, setSelfieUrl] = useState('');
  const [selfiePreview, setSelfiePreview] = useState('');
  const [selfieUploading, setSelfieUploading] = useState(false);
  const [selfieUploadError, setSelfieUploadError] = useState('');
  const [tokenLoading, setTokenLoading] = useState(false);
  const [mobileToken, setMobileToken] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [polling, setPolling] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const pollRef = useRef(null);

  // Submit
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (open) {
      setStep(0);
      setFullName(''); setIdType('');
      setDocumentUrl(''); setDocumentPreview(''); setDocUploading(false); setDocUploadError('');
      setSelfieUrl(''); setSelfiePreview(''); setSelfieUploading(false); setSelfieUploadError('');
      setTokenLoading(false); setMobileToken(''); setQrDataUrl(''); setPolling(false); setLinkCopied(false);
      setSubmitLoading(false); setSubmitError('');
    }
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [open]);

  // Generate QR when entering step 1 on desktop
  useEffect(() => {
    if (step === 1 && !isMobile() && !mobileToken) {
      generateToken();
    }
    if (step !== 1) {
      if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      setPolling(false);
    }
  }, [step]);

  const generateToken = async () => {
    setTokenLoading(true);
    try {
      const res = await generateKycMobileToken();
      const { token } = res.data;
      setMobileToken(token);
      const url = `${window.location.origin}/kyc/mobile/${token}`;
      const dataUrl = await QRCode.toDataURL(url, { width: 200, margin: 1 });
      setQrDataUrl(dataUrl);
      startPolling();
    } catch (e) {
      console.error('Token generation failed:', e);
    } finally {
      setTokenLoading(false);
    }
  };

  const startPolling = () => {
    setPolling(true);
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const res = await getKycStatus();
        if (res.data.kycStatus === 'pending') {
          clearInterval(pollRef.current);
          pollRef.current = null;
          setPolling(false);
          setSelfieUrl(res.data.kycSelfieUrl || '__mobile__');
          setStep(2);
        }
      } catch {}
    }, 3000);
  };

  const handleDocUpload = async (file) => {
    if (!file) return;
    setDocUploading(true);
    setDocUploadError('');
    try {
      const preview = URL.createObjectURL(file);
      setDocumentPreview(preview);
      const url = await uploadFile(file);
      setDocumentUrl(url);
    } catch (e) {
      setDocUploadError(e.message);
      setDocumentPreview('');
    } finally {
      setDocUploading(false);
    }
  };

  const handleSelfieUpload = async (file) => {
    if (!file) return;
    setSelfieUploading(true);
    setSelfieUploadError('');
    try {
      const preview = URL.createObjectURL(file);
      setSelfiePreview(preview);
      const url = await uploadFile(file);
      setSelfieUrl(url);
    } catch (e) {
      setSelfieUploadError(e.message);
      setSelfiePreview('');
    } finally {
      setSelfieUploading(false);
    }
  };

  const handleContinue = async () => {
    if (step === 1) {
      setSubmitLoading(true);
      setSubmitError('');
      try {
        await submitKyc({ fullName, idType, documentUrl, selfieUrl });
        setStep(2);
      } catch (e) {
        setSubmitError(e.response?.data?.error || 'Erreur lors de l\'envoi. Réessaie.');
      } finally {
        setSubmitLoading(false);
      }
    } else {
      setStep(s => s + 1);
    }
  };

  const canContinueStep0 = fullName.trim() && idType && documentUrl;
  const canContinueStep1 = selfieUrl;

  const mobileUrl = mobileToken ? `${window.location.origin}/kyc/mobile/${mobileToken}` : '';

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}><X size={16}/></button>

        {/* Art header */}
        <div className={styles.artHeader}>
          <div className={styles.shieldBox}><Shield size={26}/></div>
          <div className={styles.headerHand}>Avant d'activer la cagnotte</div>
          <h2 className={styles.headerTitle}>Une petite vérification (3 min)</h2>
          <p className={styles.headerSub}>
            Pour pouvoir recevoir des contributions, on doit vérifier ton identité. C'est rapide et obligatoire (loi anti-fraude).
          </p>
        </div>

        {/* Progress steps */}
        <div className={styles.stepsRow}>
          {STEPS.map((l, i) => (
            <div key={l} style={{ display: 'flex', alignItems: 'center', flex: i < STEPS.length - 1 ? 1 : 0 }}>
              <div className={styles.stepItem}>
                <span
                  className={styles.stepCircle}
                  style={{
                    background: step >= i ? 'var(--mk-rose)' : 'var(--mk-blush)',
                    color: step >= i ? '#fff' : 'var(--mk-ink-3)',
                  }}
                >
                  {step > i ? <Check size={12}/> : i + 1}
                </span>
                <span className={styles.stepLabel} style={{ color: step >= i ? 'var(--mk-ink)' : 'var(--mk-ink-3)' }}>{l}</span>
              </div>
              {i < STEPS.length - 1 && (
                <span className={styles.stepLine} style={{ background: step > i ? 'var(--mk-rose)' : 'var(--mk-line-2)', flex: 1 }}/>
              )}
            </div>
          ))}
        </div>

        {/* Step content */}
        <div className={styles.body}>
          {/* ── Step 0: Identité ── */}
          {step === 0 && (
            <div className={styles.stepContent}>
              <label className={styles.inputLabel}>NOM COMPLET (TEL QU'INSCRIT SUR LA PIÈCE)</label>
              <input
                className={styles.input}
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="ex: Amina Karim Diallo"
                onFocus={e => { e.target.style.borderColor = 'var(--mk-rose-soft)'; e.target.style.boxShadow = '0 0 0 4px var(--mk-rose-pale)'; }}
                onBlur={e => { e.target.style.borderColor = 'var(--mk-line-2)'; e.target.style.boxShadow = 'none'; }}
              />

              <div className={styles.inputLabel} style={{ marginTop: 14 }}>PIÈCE D'IDENTITÉ</div>
              <div className={styles.idGrid}>
                {[{ id: 'cni', label: 'CNI', emoji: '🪪' }, { id: 'passport', label: 'Passeport', emoji: '📘' }].map(t => (
                  <button
                    key={t.id}
                    className={styles.idCard}
                    style={{ border: `2px solid ${idType === t.id ? 'var(--mk-rose)' : 'var(--mk-line-2)'}`, background: idType === t.id ? 'var(--mk-blush)' : '#fff' }}
                    onClick={() => setIdType(t.id)}
                  >
                    <div style={{ fontSize: 32, marginBottom: 6 }}>{t.emoji}</div>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{t.label}</div>
                  </button>
                ))}
              </div>

              <div className={styles.inputLabel} style={{ marginTop: 14 }}>PHOTO DU DOCUMENT</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
                {/* Upload zone */}
                <label style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  gap: 8, padding: 16, borderRadius: 14, cursor: 'pointer', minHeight: 120,
                  border: `2px dashed ${documentUrl ? 'var(--mk-rose)' : 'var(--mk-line-2)'}`,
                  background: documentUrl ? 'var(--mk-blush)' : '#FAFAFA',
                  position: 'relative', overflow: 'hidden', transition: 'all .15s',
                }}>
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleDocUpload(e.target.files[0])} />
                  {documentPreview ? (
                    <img src={documentPreview} alt="doc" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 8 }} />
                  ) : docUploading ? (
                    <Loader size={22} style={{ color: 'var(--mk-rose)', animation: 'mk-spin .8s linear infinite' }} />
                  ) : (
                    <>
                      <Camera size={22} style={{ color: 'var(--mk-ink-3)' }} />
                      <span style={{ fontSize: 12, color: 'var(--mk-ink-3)', textAlign: 'center' }}>Cliquer pour uploader</span>
                    </>
                  )}
                </label>

                {/* Tips panel */}
                <div style={{
                  background: 'var(--mk-blush)', borderRadius: 12, padding: '12px 14px',
                  display: 'flex', flexDirection: 'column', gap: 6,
                }}>
                  {DOC_TIPS.map((tip, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12 }}>
                      <span style={{ color: '#1F6E55', flexShrink: 0 }}>✅</span>
                      <span style={{ color: 'var(--mk-ink-2)', lineHeight: 1.4 }}>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
              {docUploadError && <p style={{ fontSize: 12, color: '#e74c3c', marginTop: 6 }}>{docUploadError}</p>}
              {documentUrl && (
                <p style={{ fontSize: 11.5, color: '#1F6E55', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={12}/> Document uploadé avec succès
                </p>
              )}
            </div>
          )}

          {/* ── Step 1: Selfie ── */}
          {step === 1 && (
            <div className={styles.stepContent}>
              {isMobile() ? (
                // Mobile: direct camera capture
                <>
                  <p style={{ fontSize: 13, color: 'var(--mk-ink-2)', marginBottom: 14 }}>
                    Prenez un selfie en tenant votre pièce d'identité bien visible.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, alignItems: 'start' }}>
                    <label style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      gap: 8, padding: 16, borderRadius: 14, cursor: 'pointer', minHeight: 140,
                      border: `2px dashed ${selfieUrl ? 'var(--mk-rose)' : 'var(--mk-line-2)'}`,
                      background: selfieUrl ? 'var(--mk-blush)' : '#FAFAFA',
                    }}>
                      <input type="file" accept="image/*" capture="user" style={{ display: 'none' }} onChange={e => handleSelfieUpload(e.target.files[0])} />
                      {selfiePreview ? (
                        <img src={selfiePreview} alt="selfie" style={{ width: '100%', height: 110, objectFit: 'cover', borderRadius: 8 }} />
                      ) : selfieUploading ? (
                        <Loader size={22} style={{ color: 'var(--mk-rose)', animation: 'mk-spin .8s linear infinite' }} />
                      ) : (
                        <>
                          <Camera size={28} style={{ color: 'var(--mk-rose)' }} />
                          <span style={{ fontSize: 12, color: 'var(--mk-ink-3)', textAlign: 'center' }}>Prendre un selfie</span>
                        </>
                      )}
                    </label>
                    <div style={{ background: 'var(--mk-blush)', borderRadius: 12, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {SELFIE_TIPS.map((tip, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12 }}>
                          <span style={{ color: '#1F6E55', flexShrink: 0 }}>✅</span>
                          <span style={{ color: 'var(--mk-ink-2)', lineHeight: 1.4 }}>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {selfieUploadError && <p style={{ fontSize: 12, color: '#e74c3c', marginTop: 6 }}>{selfieUploadError}</p>}
                  {selfieUrl && (
                    <p style={{ fontSize: 11.5, color: '#1F6E55', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check size={12}/> Selfie uploadé avec succès
                    </p>
                  )}
                </>
              ) : (
                // Desktop: QR code only — selfie must be taken on mobile
                <>
                  <p style={{ fontSize: 13, color: 'var(--mk-ink-2)', marginBottom: 16 }}>
                    Le selfie doit être pris avec l'appareil photo de votre téléphone. Scannez le QR code ci-dessous pour continuer sur mobile.
                  </p>

                  <div style={{
                    border: '1.5px solid var(--mk-line-2)', borderRadius: 18, padding: 20,
                    display: 'flex', gap: 20, alignItems: 'center', background: '#FAFAFA', marginBottom: 14,
                  }}>
                    <div style={{ flexShrink: 0, width: 130, height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {tokenLoading ? (
                        <Loader size={28} style={{ color: 'var(--mk-rose)', animation: 'mk-spin .8s linear infinite' }} />
                      ) : qrDataUrl ? (
                        <img src={qrDataUrl} alt="QR" style={{ width: 130, height: 130, borderRadius: 10 }} />
                      ) : (
                        <div style={{ fontSize: 12, color: 'var(--mk-ink-3)', textAlign: 'center' }}>Génération…</div>
                      )}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>Continuez sur votre téléphone</div>
                      <div style={{ fontSize: 12.5, color: 'var(--mk-ink-2)', lineHeight: 1.5, marginBottom: 12 }}>
                        Scannez ce QR avec votre appareil photo. Le lien est valable 2h.
                      </div>
                      {mobileUrl && (
                        <button
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5,
                            padding: '7px 14px', borderRadius: 999, border: '1.5px solid var(--mk-line-2)',
                            color: linkCopied ? '#1F6E55' : 'var(--mk-ink-2)', background: linkCopied ? '#D4F1E5' : '#fff',
                            cursor: 'pointer', transition: 'all .15s',
                          }}
                          onClick={() => { navigator.clipboard.writeText(mobileUrl); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 1500); }}
                        >
                          {linkCopied ? <Check size={13}/> : <Copy size={13}/>}
                          {linkCopied ? 'Copié !' : 'Copier le lien'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Polling indicator */}
                  {polling && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                      background: 'var(--mk-blush)', borderRadius: 12, marginBottom: 14, fontSize: 13,
                    }}>
                      <Loader size={15} style={{ color: 'var(--mk-rose)', animation: 'mk-spin .8s linear infinite', flexShrink: 0 }} />
                      <span style={{ color: 'var(--mk-ink-2)' }}>En attente de votre téléphone…</span>
                    </div>
                  )}

                  {/* Tips */}
                  <div style={{ background: 'var(--mk-blush)', borderRadius: 12, padding: '12px 14px', marginTop: 4, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {SELFIE_TIPS.map((tip, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 12 }}>
                        <span style={{ color: '#1F6E55', flexShrink: 0 }}>✅</span>
                        <span style={{ color: 'var(--mk-ink-2)', lineHeight: 1.4 }}>{tip}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {submitError && <p style={{ fontSize: 12, color: '#e74c3c', marginTop: 8 }}>{submitError}</p>}
            </div>
          )}

          {/* ── Step 2: Confirmation ── */}
          {step === 2 && (
            <div className={styles.successContent}>
              <div className={styles.successCircle}><Check size={48}/></div>
              <div style={{ fontFamily: 'var(--mk-display)', fontStyle: 'italic', fontSize: 28, marginBottom: 6 }}>C'est envoyé !</div>
              <p style={{ fontSize: 14, color: 'var(--mk-ink-2)', maxWidth: 380, margin: '0 auto' }}>
                Votre vérification est en cours (généralement &lt; 1h). Vous recevrez un SMS dès que c'est validé.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          {step < 2 ? (
            <>
              <button
                className={styles.btnQuiet}
                onClick={step === 0 ? onClose : () => setStep(s => s - 1)}
                disabled={submitLoading || docUploading || selfieUploading}
              >
                {step === 0 ? 'Annuler' : 'Précédent'}
              </button>
              <button
                className={styles.btnNext}
                onClick={handleContinue}
                disabled={
                  submitLoading || docUploading || selfieUploading ||
                  (step === 0 && !canContinueStep0) ||
                  (step === 1 && !canContinueStep1)
                }
              >
                {submitLoading
                  ? <><Loader size={14} className={styles.spin}/> Envoi…</>
                  : <>{step === 1 ? 'Envoyer' : 'Continuer'} <ArrowRight size={14}/></>}
              </button>
            </>
          ) : (
            <button className={styles.btnNext} style={{ marginLeft: 'auto' }} onClick={onDone}>
              C'est parti — activer la cagnotte <ArrowRight size={14}/>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
