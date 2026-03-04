import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import s from './AdminLogin.module.css';

export default function AdminLogin() {
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const submit = async () => {
    setError('');
    if (!email || !pass) { setError('Email et mot de passe requis.'); return; }
    setLoading(true);
    try {
      await login(email, pass);
      navigate('/admin');
    } catch (e) {
      setError(e.response?.data?.error || 'Identifiants invalides');
    } finally { setLoading(false); }
  };

  const onKey = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <div className={s.root}>
      <div className={s.glow} />
      <div className={s.card}>
        <div className={s.logo}>eWish<span>Well</span></div>
        <div className={s.sub}>Interface Admin</div>

        <div className={s.field}>
          <label>Email</label>
          <input
            type="email" value={email} autoComplete="username"
            placeholder="admin@ewishwell.com"
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && document.getElementById('admin-pass').focus()}
          />
        </div>
        <div className={s.field}>
          <label>Mot de passe</label>
          <input
            id="admin-pass" type="password" value={pass} autoComplete="current-password"
            placeholder="••••••••"
            onChange={e => setPass(e.target.value)}
            onKeyDown={onKey}
          />
        </div>

        {error && <div className={s.error}>{error}</div>}

        <button className={s.btn} onClick={submit} disabled={loading}>
          {loading ? 'Connexion…' : 'Se connecter'}
        </button>
      </div>
    </div>
  );
}