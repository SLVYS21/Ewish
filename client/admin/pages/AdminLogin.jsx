import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleBtn from '../components/GoogleBtn';
import s from './AdminLogin.module.css';

export default function AdminLogin() {
  const [email, setEmail]     = useState('');
  const [pass, setPass]       = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const location    = useLocation();
  const resetDone   = new URLSearchParams(location.search).get('reset') === '1';

  const submit = async () => {
    setError('');
    if (!email || !pass) { setError('Email et mot de passe requis.'); return; }
    setLoading(true);
    try {
      await login(email, pass);
      navigate('/ewish-admin/ewish');
    } catch (e) {
      setError(e.response?.data?.error || 'Identifiants invalides');
    } finally { setLoading(false); }
  };

  return (
    <div className={s.root}>

      {/* ── Left: brand panel ── */}
      <div className={s.valueSide}>
        <div className={s.valueLogo}>
          <span className={s.logoBox}>🎁</span>
          my<span>Kado</span>
        </div>

        <div>
          <div className={s.valueTagline}>CRÉER · PUBLIER · PARTAGER</div>
          <h1 className={s.valueHeadline}>
            Les plus belles cartes pour vos plus beaux moments.
          </h1>
          <p className={s.valueDesc}>
            Anniversaires, mariages, événements pro  créez une page personnalisée
            en quelques minutes. Partagez par un simple lien.
          </p>
        </div>

        {/* Floating preview card */}
        <div className={s.floatingCard}>
          <div className={s.floatingAvatar}>L</div>
          <div className={s.floatingCardTitle}>Joyeux Anniversaire</div>
          <div className={s.floatingCardName}>Lydia</div>
          <div className={s.floatingCardMsg}>On t'aime très fort ! Une belle année commence pour toi.</div>
        </div>

        <div className={s.valueFooter}>
          <span>✨ 5 templates</span>
          <span>💳 KKiapay & MoMo</span>
          <span>📱 PWA</span>
        </div>
      </div>

      {/* ── Right: form ── */}
      <div className={s.formSide}>
        <h2 className={s.formTitle}>Bon retour 👋</h2>
        <p className={s.formSub}>Connectez-vous pour gérer vos créations.</p>
        {resetDone && (
          <div style={{ padding: '10px 14px', borderRadius: 10, background: 'rgba(34,197,94,.1)', border: '1px solid rgba(34,197,94,.25)', color: '#166534', fontSize: '0.82rem', marginBottom: 8 }}>
            ✅ Mot de passe mis à jour. Connectez-vous avec votre nouveau mot de passe.
          </div>
        )}

        <div className={s.field}>
          <label>Email</label>
          <input
            type="email" value={email} autoComplete="username"
            placeholder="vous@mykado.com"
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && document.getElementById('login-pass')?.focus()}
          />
        </div>

        <div className={s.field}>
          <label>Mot de passe</label>
          <input
            id="login-pass" type="password" value={pass} autoComplete="current-password"
            placeholder="••••••••"
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>

        <div className={s.fieldRow}>
          <label>
            <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
            Se souvenir de moi
          </label>
          <Link to="/ewish-admin/forgot-password" style={{ color: '#E11D48', fontWeight: 600, textDecoration: 'none', fontSize: '0.8rem' }}>Oublié ?</Link>
        </div>

        {error && <div className={s.error}>{error}</div>}

        <button className={s.btn} onClick={submit} disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter →'}
        </button>

        <div className={s.orDivider}><span>OU</span></div>

        <GoogleBtn />

        <div className={s.formFooter}>
          Pas encore de compte ?{' '}
          <Link to="/ewish-admin/register">Créer un compte gratuit →</Link>
        </div>
      </div>
    </div>
  );
}
