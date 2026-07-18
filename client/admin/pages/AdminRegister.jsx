import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleBtn from '../components/GoogleBtn';
import PasswordInput from '../components/PasswordInput';
import Kado from '../../components/Kado';
import s from './AdminLogin.module.css';

export default function AdminRegister() {
  const [name, setName]               = useState('');
  const [email, setEmail]             = useState('');
  const [pass, setPass]               = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [agree, setAgree]             = useState(false);
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const submit = async () => {
    setError('');
    if (!name || !email || !pass || !confirmPass) {
      setError('All fields are required.');
      return;
    }
    if (pass !== confirmPass) {
      setError("Passwords don't match.");
      return;
    }
    if (pass.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (!agree) {
      setError('Please accept the terms to continue.');
      return;
    }
    setLoading(true);
    try {
      await register(email, pass, name);
      navigate('/ewish-admin');
    } catch (e) {
      setError(e.response?.data?.error || 'Account creation failed.');
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
              cycle={['jump', 'levitate', 'confetti']}
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
            <p className={s.formSub}>Create your account to continue</p>
          </div>

          <div className={s.tabs} role="tablist">
            <Link
              to="/ewish-admin/login"
              className={s.tab}
              role="tab"
              aria-selected="false"
            >
              Login
            </Link>
            <button className={`${s.tab} ${s.tabActive}`} role="tab" aria-selected="true">
              Register
            </button>
          </div>

          <GoogleBtn label="Continue with Google" />

          <div className={s.orDivider}><span>Or continue with</span></div>

          <div className={s.field}>
            <label htmlFor="reg-name">Full name</label>
            <input
              id="reg-name"
              type="text"
              value={name}
              autoComplete="name"
              placeholder="Your first and last name"
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('reg-email')?.focus()}
            />
          </div>

          <div className={s.field}>
            <label htmlFor="reg-email">Email</label>
            <input
              id="reg-email"
              type="email"
              value={email}
              autoComplete="username"
              placeholder="your.email@example.com"
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('reg-pass')?.focus()}
            />
          </div>

          <div className={s.field}>
            <label htmlFor="reg-pass">Password</label>
            <PasswordInput
              id="reg-pass"
              value={pass}
              autoComplete="new-password"
              placeholder="secret-you-wont-forget"
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('reg-confirm')?.focus()}
            />
          </div>

          <div className={s.field}>
            <label htmlFor="reg-confirm">Confirm password</label>
            <PasswordInput
              id="reg-confirm"
              value={confirmPass}
              autoComplete="new-password"
              placeholder="Repeat your password"
              onChange={e => setConfirmPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && submit()}
            />
          </div>

          <div className={s.field} style={{ marginBottom: 18 }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 8,
                fontWeight: 500,
                fontSize: 13,
                color: '#5D5474',
                lineHeight: 1.5,
                textTransform: 'none',
                letterSpacing: 0,
              }}
            >
              <input
                type="checkbox"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
                style={{
                  accentColor: '#FF5470',
                  marginTop: 3,
                  flexShrink: 0,
                  width: 'auto',
                  padding: 0,
                }}
              />
              <span>
                I accept the{' '}
                <Link
                  to="/terms"
                  target="_blank"
                  style={{ color: '#FF5470', fontWeight: 700, textDecoration: 'none' }}
                >
                  Terms of Service
                </Link>
                {' '}and{' '}
                <Link
                  to="/privacy"
                  target="_blank"
                  style={{ color: '#FF5470', fontWeight: 700, textDecoration: 'none' }}
                >
                  Privacy Policy
                </Link>.
              </span>
            </label>
          </div>

          {error && <div className={s.error}>{error}</div>}

          <button className={s.btn} onClick={submit} disabled={loading || !agree}>
            {loading ? 'Creating account…' : 'Create Account'}
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
