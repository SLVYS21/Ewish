import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GoogleBtn from '../components/GoogleBtn';
import PasswordInput from '../components/PasswordInput';
import Kado from '../../components/Kado';
import s from './AdminLogin.module.css';

export default function AdminLogin() {
  const [email, setEmail]       = useState('');
  const [pass, setPass]         = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const resetDone  = new URLSearchParams(location.search).get('reset') === '1';

  const submit = async () => {
    setError('');
    if (!email || !pass) { setError('Email et mot de passe requis.'); return; }
    setLoading(true);
    try {
      await login(email, pass);
      navigate('/ewish-admin');
    } catch (e) {
      setError(e.response?.data?.error || 'Identifiants invalides');
    } finally { setLoading(false); }
  };

  return (
    <div className={s.root}>
      <div className={s.card}>

        {/* ── Left: brand panel with Kado mascot ── */}
        <aside className={s.brandPanel} aria-hidden>
          <div className={s.brandMascot}>
            <Kado
              size={220}
              cycle={['jump', 'levitate', 'wink']}
              cycleInterval={4200}
              ambient
            />
          </div>
          <h2 className={s.brandTitle}>La fête commence ici !</h2>
          <p className={s.brandDesc}>
            Crée de belles cartes, murs et cadeaux, et partage-les avec ceux que tu aimes.
          </p>
        </aside>

        {/* ── Right: form ── */}
        <section className={s.formPanel}>
          <div className={s.formHeader}>
            <h1 className={s.formTitle}>Bienvenue sur myKado</h1>
            <p className={s.formSub}>Connecte-toi à ton compte pour continuer</p>
          </div>

          <div className={s.tabs} role="tablist">
            <button className={`${s.tab} ${s.tabActive}`} role="tab" aria-selected="true">
              Connexion
            </button>
            <Link
              to="/ewish-admin/register"
              className={s.tab}
              role="tab"
              aria-selected="false"
            >
              Inscription
            </Link>
          </div>

          <GoogleBtn label="Continuer avec Google" />

          <div className={s.orDivider}><span>Ou continue avec</span></div>

          {resetDone && (
            <div className={s.success}>
              <CheckCircle2 size={16} />
              Mot de passe mis à jour. Connecte-toi avec ton nouveau mot de passe.
            </div>
          )}

          <div className={s.field}>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              autoComplete="username"
              placeholder="ton.email@exemple.com"
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('login-pass')?.focus()}
            />
          </div>

          <div className={s.field}>
            <label htmlFor="login-pass">Mot de passe</label>
            <PasswordInput
              id="login-pass"
              value={pass}
              autoComplete="current-password"
              placeholder="un-secret-inoubliable"
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>

          <div className={s.fieldRow}>
            <label>
              <input
                type="checkbox"
                checked={remember}
                onChange={e => setRemember(e.target.checked)}
              />
              Se souvenir de moi
            </label>
            <Link to="/ewish-admin/forgot-password">Mot de passe oublié ?</Link>
          </div>

          {error && <div className={s.error}>{error}</div>}

          <button className={s.btn} onClick={submit} disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>

          <div className={s.formFooter}>
            En continuant, tu acceptes nos{' '}
            <Link to="/terms" target="_blank">Conditions d'utilisation</Link>
            {' '}et notre{' '}
            <Link to="/privacy" target="_blank">Politique de confidentialité</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
