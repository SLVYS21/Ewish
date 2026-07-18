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
          <h2 className={s.brandTitle}>Let's get the party started!</h2>
          <p className={s.brandDesc}>
            Create beautiful digital wishes and share them with your loved ones.
          </p>
        </aside>

        {/* ── Right: form ── */}
        <section className={s.formPanel}>
          <div className={s.formHeader}>
            <h1 className={s.formTitle}>Welcome to myKado</h1>
            <p className={s.formSub}>Sign in to your account to continue</p>
          </div>

          <div className={s.tabs} role="tablist">
            <button className={`${s.tab} ${s.tabActive}`} role="tab" aria-selected="true">
              Login
            </button>
            <Link
              to="/ewish-admin/register"
              className={s.tab}
              role="tab"
              aria-selected="false"
            >
              Register
            </Link>
          </div>

          <GoogleBtn label="Continue with Google" />

          <div className={s.orDivider}><span>Or continue with</span></div>

          {resetDone && (
            <div className={s.success}>
              <CheckCircle2 size={16} />
              Password updated. Sign in with your new password.
            </div>
          )}

          <div className={s.field}>
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={email}
              autoComplete="username"
              placeholder="your.email@example.com"
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('login-pass')?.focus()}
            />
          </div>

          <div className={s.field}>
            <label htmlFor="login-pass">Password</label>
            <PasswordInput
              id="login-pass"
              value={pass}
              autoComplete="current-password"
              placeholder="secret-you-wont-forget"
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
              Remember me
            </label>
            <Link to="/ewish-admin/forgot-password">Forgot password?</Link>
          </div>

          {error && <div className={s.error}>{error}</div>}

          <button className={s.btn} onClick={submit} disabled={loading}>
            {loading ? 'Signing in…' : 'Log in'}
          </button>

          <div className={s.formFooter}>
            By clicking continue, you agree to our{' '}
            <Link to="/terms" target="_blank">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" target="_blank">Privacy Policy</Link>
          </div>
        </section>
      </div>
    </div>
  );
}
