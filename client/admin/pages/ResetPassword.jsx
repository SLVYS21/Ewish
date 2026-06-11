import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { resetPassword } from '../../utils/api';
import s from './AdminLogin.module.css';

export default function ResetPassword() {
  const { token }           = useParams();
  const navigate            = useNavigate();
  const [password, setPass] = useState('');
  const [confirm, setConf]  = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoad]  = useState(false);

  const submit = async () => {
    setError('');
    if (!password || !confirm) { setError('Remplis les deux champs.'); return; }
    if (password.length < 6)  { setError('Minimum 6 caractères.'); return; }
    if (password !== confirm)  { setError('Les mots de passe ne correspondent pas.'); return; }
    setLoad(true);
    try {
      await resetPassword(token, password);
      navigate('/ewish-admin/login?reset=1');
    } catch (e) {
      setError(e.response?.data?.error || 'Lien invalide ou expiré.');
    } finally { setLoad(false); }
  };

  return (
    <div className={s.root} style={{ justifyContent: 'center', background: 'linear-gradient(160deg,#fff1f4 0%,#fce7f3 40%,#fbcfe8 100%)' }}>
      <div className={s.formSide} style={{ maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>🎁</span>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#2B1A2D', marginTop: 8 }}>myKado</div>
        </div>

        <h2 className={s.formTitle}>Nouveau mot de passe</h2>
        <p className={s.formSub}>Choisis un nouveau mot de passe sécurisé.</p>

        <div className={s.field}>
          <label>Nouveau mot de passe</label>
          <input
            type="password" value={password} autoComplete="new-password"
            placeholder="6 caractères minimum"
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && document.getElementById('rp-confirm')?.focus()}
          />
        </div>

        <div className={s.field}>
          <label>Confirmer le mot de passe</label>
          <input
            id="rp-confirm" type="password" value={confirm} autoComplete="new-password"
            placeholder="••••••••"
            onChange={e => setConf(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>

        {error && <div className={s.error}>{error}</div>}

        <button className={s.btn} onClick={submit} disabled={loading}>
          {loading ? 'Mise à jour…' : 'Changer mon mot de passe →'}
        </button>

        <div className={s.formFooter} style={{ marginTop: 24 }}>
          <Link to="/ewish-admin/login">← Retour à la connexion</Link>
        </div>
      </div>
    </div>
  );
}
