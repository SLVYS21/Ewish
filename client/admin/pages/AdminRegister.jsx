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
      setError('Tous les champs sont requis.');
      return;
    }
    if (pass !== confirmPass) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (pass.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (!agree) {
      setError("Merci d'accepter les conditions pour continuer.");
      return;
    }
    setLoading(true);
    try {
      await register(email, pass, name);
      navigate('/ewish-admin');
    } catch (e) {
      setError(e.response?.data?.error || "La création du compte a échoué.");
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
          <h2 className={s.brandTitle}>La fête commence ici !</h2>
          <p className={s.brandDesc}>
            Crée de belles cartes, murs et cadeaux, et partage-les avec ceux que tu aimes.
          </p>
        </aside>

        {/* ── Right: form ── */}
        <section className={s.formPanel}>
          <div className={s.formHeader}>
            <h1 className={s.formTitle}>Bienvenue sur myKado</h1>
            <p className={s.formSub}>Crée ton compte pour continuer</p>
          </div>

          <div className={s.tabs} role="tablist">
            <Link
              to="/ewish-admin/login"
              className={s.tab}
              role="tab"
              aria-selected="false"
            >
              Connexion
            </Link>
            <button className={`${s.tab} ${s.tabActive}`} role="tab" aria-selected="true">
              Inscription
            </button>
          </div>

          <GoogleBtn label="Continuer avec Google" />

          <div className={s.orDivider}><span>Ou continue avec</span></div>

          <div className={s.field}>
            <label htmlFor="reg-name">Nom complet</label>
            <input
              id="reg-name"
              type="text"
              value={name}
              autoComplete="name"
              placeholder="Ton prénom et ton nom"
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
              placeholder="ton.email@exemple.com"
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('reg-pass')?.focus()}
            />
          </div>

          <div className={s.field}>
            <label htmlFor="reg-pass">Mot de passe</label>
            <PasswordInput
              id="reg-pass"
              value={pass}
              autoComplete="new-password"
              placeholder="un-secret-inoubliable"
              onChange={e => setPass(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('reg-confirm')?.focus()}
            />
          </div>

          <div className={s.field}>
            <label htmlFor="reg-confirm">Confirme le mot de passe</label>
            <PasswordInput
              id="reg-confirm"
              value={confirmPass}
              autoComplete="new-password"
              placeholder="Répète ton mot de passe"
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
                J'accepte les{' '}
                <Link
                  to="/terms"
                  target="_blank"
                  style={{ color: '#FF5470', fontWeight: 700, textDecoration: 'none' }}
                >
                  Conditions d'utilisation
                </Link>
                {' '}et la{' '}
                <Link
                  to="/privacy"
                  target="_blank"
                  style={{ color: '#FF5470', fontWeight: 700, textDecoration: 'none' }}
                >
                  Politique de confidentialité
                </Link>.
              </span>
            </label>
          </div>

          {error && <div className={s.error}>{error}</div>}

          <button className={s.btn} onClick={submit} disabled={loading || !agree}>
            {loading ? 'Création du compte…' : 'Créer un compte'}
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
