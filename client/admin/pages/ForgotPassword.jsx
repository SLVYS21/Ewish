import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../../utils/api';
import s from './AdminLogin.module.css';

export default function ForgotPassword() {
  const [email, setEmail]     = useState('');
  const [error, setError]     = useState('');
  const [sent, setSent]       = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (!email) { setError('Entrez votre adresse email.'); return; }
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur. Réessayez dans un instant.');
    } finally { setLoading(false); }
  };

  return (
    <div className={s.root} style={{ justifyContent: 'center', background: 'linear-gradient(160deg,#fff1f4 0%,#fce7f3 40%,#fbcfe8 100%)' }}>
      <div className={s.formSide} style={{ maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>🎁</span>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2B1A2D', marginTop: 8 }}>myKado</div>
        </div>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>📧</div>
            <h2 className={s.formTitle}>Email envoyé !</h2>
            <p className={s.formSub} style={{ marginBottom: 24 }}>
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.<br />
              Il expire dans 1 heure.
            </p>
            <p style={{ fontSize: '0.8rem', color: '#9E8BA3' }}>
              Pas reçu ? Vérifie tes spams ou{' '}
              <button
                style={{ background: 'none', border: 'none', color: '#E11D48', fontWeight: 700, cursor: 'pointer', padding: 0, fontSize: 'inherit' }}
                onClick={() => { setSent(false); }}
              >
                réessaie
              </button>
              .
            </p>
          </div>
        ) : (
          <>
            <h2 className={s.formTitle}>Mot de passe oublié ?</h2>
            <p className={s.formSub}>Entre ton email pour recevoir un lien de réinitialisation.</p>

            <div className={s.field}>
              <label>Email</label>
              <input
                type="email" value={email} autoComplete="email"
                placeholder="vous@mykado.com"
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
            </div>

            {error && <div className={s.error}>{error}</div>}

            <button className={s.btn} onClick={submit} disabled={loading}>
              {loading ? 'Envoi…' : 'Envoyer le lien →'}
            </button>
          </>
        )}

        <div className={s.formFooter} style={{ marginTop: 24 }}>
          <Link to="/ewish-admin/login">← Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
}
