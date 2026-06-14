import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { verifyKycMobileToken, submitKycMobile } from '../utils/api';

const ROSE = '#E11D48';
const INK = '#2B1A2D';
const BLUSH = '#FFF0F3';
const INK2 = '#6B4E6D';
const INK3 = '#B09AB2';
const LINE2 = '#EDD5DA';
const MINT = '#1F6E55';

const DOC_TIPS = [
  'Les 4 coins du document sont visibles',
  "Pas de reflet ni d'ombre",
  'Texte parfaitement lisible',
  'Fond uni de préférence',
];

const SELFIE_TIPS = [
  'Bonne luminosité, pas de contre-jour',
  "Regardez droit vers l'appareil photo",
  "Tenez votre pièce d'identité visible dans la main",
  'Fond neutre de préférence',
];

async function uploadFile(file) {
  const form = new FormData();
  form.append('file', file);
  const BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : '/api';
  const res = await fetch(`${BASE}/upload`, { method: 'POST', body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur upload');
  return data.url;
}

function TipsPanel({ tips }) {
  return (
    <div style={{
      background: BLUSH, borderRadius: 12, padding: '12px 14px',
      display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12,
    }}>
      {tips.map((tip, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13 }}>
          <span style={{ color: MINT, flexShrink: 0 }}>✅</span>
          <span style={{ color: INK2, lineHeight: 1.4 }}>{tip}</span>
        </div>
      ))}
    </div>
  );
}

function UploadZone({ preview, uploading, onChange, capture, label }) {
  return (
    <label style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      gap: 10, padding: 20, borderRadius: 16, cursor: 'pointer', minHeight: 160,
      border: `2px dashed ${preview ? ROSE : LINE2}`,
      background: preview ? BLUSH : '#FAFAFA',
      transition: 'all .15s',
    }}>
      <input
        type="file"
        accept="image/*"
        capture={capture}
        style={{ display: 'none' }}
        onChange={onChange}
      />
      {preview ? (
        <img src={preview} alt="upload" style={{ width: '100%', maxHeight: 140, objectFit: 'cover', borderRadius: 10 }} />
      ) : uploading ? (
        <div style={{ width: 28, height: 28, borderRadius: '50%', border: `3px solid ${LINE2}`, borderTopColor: ROSE, animation: 'kkm-spin .8s linear infinite' }} />
      ) : (
        <>
          <div style={{ fontSize: 36 }}>📷</div>
          <span style={{ fontSize: 13.5, color: INK3, textAlign: 'center', lineHeight: 1.4 }}>{label}</span>
        </>
      )}
    </label>
  );
}

export default function KycMobilePage() {
  const { token } = useParams();

  const [verifying, setVerifying] = useState(true);
  const [invalid, setInvalid] = useState(false);
  const [userName, setUserName] = useState('');

  const [step, setStep] = useState(0);

  // Step 0  Document
  const [fullName, setFullName] = useState('');
  const [idType, setIdType] = useState('cni');
  const [docPreview, setDocPreview] = useState('');
  const [docUrl, setDocUrl] = useState('');
  const [docUploading, setDocUploading] = useState(false);
  const [docError, setDocError] = useState('');

  // Step 1  Selfie
  const [selfiePreview, setSelfiePreview] = useState('');
  const [selfieUrl, setSelfieUrl] = useState('');
  const [selfieUploading, setSelfieUploading] = useState(false);
  const [selfieError, setSelfieError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    verifyKycMobileToken(token)
      .then(res => {
        setUserName(res.data.name || '');
        if (res.data.kycStatus === 'pending' || res.data.kycStatus === 'approved') {
          setDone(true);
        }
      })
      .catch(() => setInvalid(true))
      .finally(() => setVerifying(false));
  }, [token]);

  const handleDocUpload = async (file) => {
    if (!file) return;
    setDocUploading(true);
    setDocError('');
    try {
      setDocPreview(URL.createObjectURL(file));
      const url = await uploadFile(file);
      setDocUrl(url);
    } catch (e) {
      setDocError(e.message);
      setDocPreview('');
    } finally { setDocUploading(false); }
  };

  const handleSelfieUpload = async (file) => {
    if (!file) return;
    setSelfieUploading(true);
    setSelfieError('');
    try {
      setSelfiePreview(URL.createObjectURL(file));
      const url = await uploadFile(file);
      setSelfieUrl(url);
    } catch (e) {
      setSelfieError(e.message);
      setSelfiePreview('');
    } finally { setSelfieUploading(false); }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitKycMobile(token, {
        fullName: fullName || userName,
        idType,
        documentUrl: docUrl,
        selfieUrl,
      });
      setDone(true);
    } catch (e) {
      setSubmitError(e.response?.data?.error || "Erreur lors de l'envoi. Réessaie.");
    } finally { setSubmitting(false); }
  };

  const cardStyle = {
    background: '#fff',
    borderRadius: 24,
    padding: 24,
    boxShadow: '0 4px 24px rgba(43,26,45,.10)',
    border: '1px solid #F2E6EA',
  };

  const btnRose = {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    width: '100%', padding: '14px 20px', borderRadius: 999,
    background: `linear-gradient(135deg, #FF6F8B, ${ROSE})`, color: '#fff',
    fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(225,29,72,.3)', transition: 'transform .15s',
    marginTop: 8,
  };

  if (verifying) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BLUSH }}>
        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `3px solid #FFE0E6`, borderTopColor: ROSE, animation: 'kkm-spin .75s linear infinite' }} />
        <style>{`@keyframes kkm-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (invalid) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BLUSH, padding: 20 }}>
        <div style={{ ...cardStyle, textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <div style={{ fontWeight: 800, fontSize: 20, color: INK, marginBottom: 8 }}>Lien invalide ou expiré</div>
          <p style={{ fontSize: 14, color: INK2, lineHeight: 1.5 }}>
            Ce lien n'est plus valide. Retournez sur votre ordinateur et générez un nouveau lien QR depuis la vérification KYC.
          </p>
        </div>
        <style>{`@keyframes kkm-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  if (done) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: BLUSH, padding: 20 }}>
        <div style={{ ...cardStyle, textAlign: 'center', maxWidth: 360 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🎉</div>
          <div style={{ fontWeight: 800, fontSize: 24, color: INK, marginBottom: 10 }}>C'est fait !</div>
          <p style={{ fontSize: 14, color: INK2, lineHeight: 1.6 }}>
            Votre vérification a été soumise avec succès.<br/>
            <strong>Retournez sur votre ordinateur</strong> pour continuer et activer la cagnotte.
          </p>
        </div>
        <style>{`@keyframes kkm-spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: BLUSH, padding: '24px 16px 40px' }}>
      <style>{`@keyframes kkm-spin{to{transform:rotate(360deg)}} * { box-sizing: border-box; }`}</style>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{
          display: 'inline-flex', width: 52, height: 52, borderRadius: 16,
          background: '#fff', alignItems: 'center', justifyContent: 'center',
          fontSize: 24, boxShadow: '0 2px 12px rgba(225,29,72,.15)', marginBottom: 10,
        }}>🛡️</div>
        <div style={{ fontWeight: 800, fontSize: 22, color: INK }}>Vérification KYC</div>
        <div style={{ fontSize: 13, color: INK3, marginTop: 4 }}>
          {userName ? `Bonjour ${userName}  ` : ''}Étape {step + 1} sur 2
        </div>
      </div>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 20, maxWidth: 380, margin: '0 auto 20px' }}>
        {['Document', 'Selfie'].map((l, i) => (
          <div key={l} style={{ display: 'flex', alignItems: 'center', flex: i < 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: step >= i ? ROSE : '#F2E6EA', color: step >= i ? '#fff' : INK3,
                fontWeight: 800, fontSize: 12, flexShrink: 0,
              }}>
                {step > i ? '✓' : i + 1}
              </div>
              <span style={{ fontSize: 10.5, color: step >= i ? INK : INK3, fontWeight: 700 }}>{l}</span>
            </div>
            {i < 1 && <div style={{ flex: 1, height: 2, background: step > i ? ROSE : '#F2E6EA', margin: '0 4px', marginBottom: 16 }} />}
          </div>
        ))}
      </div>

      <div style={{ maxWidth: 420, margin: '0 auto' }}>
        {/* ── Step 0: Document ── */}
        {step === 0 && (
          <div style={cardStyle}>
            <div style={{ fontWeight: 800, fontSize: 18, color: INK, marginBottom: 4 }}>Document d'identité</div>
            <p style={{ fontSize: 13, color: INK2, marginBottom: 16 }}>Prenez une photo de votre pièce d'identité avec l'appareil photo arrière.</p>

            <div style={{ fontWeight: 700, fontSize: 12, color: INK3, letterSpacing: '.04em', marginBottom: 8 }}>NOM COMPLET</div>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder={userName || 'ex: Amina Karim Diallo'}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12,
                border: `1.5px solid ${LINE2}`, fontSize: 14.5, color: INK,
                outline: 'none', marginBottom: 16,
              }}
            />

            <div style={{ fontWeight: 700, fontSize: 12, color: INK3, letterSpacing: '.04em', marginBottom: 8 }}>TYPE DE PIÈCE</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              {[{ id: 'cni', label: 'CNI', emoji: '🪪' }, { id: 'passport', label: 'Passeport', emoji: '📘' }].map(t => (
                <button
                  key={t.id}
                  style={{
                    padding: '14px 10px', borderRadius: 14, textAlign: 'center',
                    border: `2px solid ${idType === t.id ? ROSE : LINE2}`,
                    background: idType === t.id ? BLUSH : '#fff', cursor: 'pointer',
                  }}
                  onClick={() => setIdType(t.id)}
                >
                  <div style={{ fontSize: 28, marginBottom: 4 }}>{t.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: INK }}>{t.label}</div>
                </button>
              ))}
            </div>

            <div style={{ fontWeight: 700, fontSize: 12, color: INK3, letterSpacing: '.04em', marginBottom: 8 }}>PHOTO DU DOCUMENT</div>
            <UploadZone
              preview={docPreview}
              uploading={docUploading}
              capture="environment"
              label="Appuyer pour prendre une photo du document"
              onChange={e => handleDocUpload(e.target.files[0])}
            />
            {docError && <p style={{ fontSize: 12, color: '#e74c3c', marginTop: 6 }}>{docError}</p>}
            {docUrl && <p style={{ fontSize: 12, color: MINT, marginTop: 6 }}>✅ Document uploadé</p>}

            <TipsPanel tips={DOC_TIPS} />

            <button
              style={{ ...btnRose, opacity: !docUrl ? .5 : 1 }}
              disabled={!docUrl || docUploading}
              onClick={() => setStep(1)}
            >
              Continuer →
            </button>
          </div>
        )}

        {/* ── Step 1: Selfie ── */}
        {step === 1 && (
          <div style={cardStyle}>
            <div style={{ fontWeight: 800, fontSize: 18, color: INK, marginBottom: 4 }}>Selfie avec pièce d'identité</div>
            <p style={{ fontSize: 13, color: INK2, marginBottom: 16 }}>Prenez un selfie en tenant votre pièce d'identité bien visible dans la main.</p>

            <UploadZone
              preview={selfiePreview}
              uploading={selfieUploading}
              capture="user"
              label="Appuyer pour prendre un selfie"
              onChange={e => handleSelfieUpload(e.target.files[0])}
            />
            {selfieError && <p style={{ fontSize: 12, color: '#e74c3c', marginTop: 6 }}>{selfieError}</p>}
            {selfieUrl && <p style={{ fontSize: 12, color: MINT, marginTop: 6 }}>✅ Selfie uploadé</p>}

            <TipsPanel tips={SELFIE_TIPS} />

            {submitError && <p style={{ fontSize: 12, color: '#e74c3c', marginTop: 8 }}>{submitError}</p>}

            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button
                style={{ flex: 1, padding: '12px', borderRadius: 999, border: `1.5px solid ${LINE2}`, background: '#fff', color: INK2, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}
                onClick={() => setStep(0)}
              >
                Retour
              </button>
              <button
                style={{ ...btnRose, flex: 2, marginTop: 0, opacity: (!selfieUrl || submitting) ? .5 : 1 }}
                disabled={!selfieUrl || selfieUploading || submitting}
                onClick={handleSubmit}
              >
                {submitting
                  ? <span style={{ display: 'inline-block', width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,.4)', borderTopColor: '#fff', animation: 'kkm-spin .75s linear infinite' }} />
                  : 'Envoyer la vérification'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
