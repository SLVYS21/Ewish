import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import s from './AdminLogin.module.css';

export default function AdminRegister() {
  const [name, setName]     = useState('');
  const [email, setEmail]   = useState('');
  const [pass, setPass]     = useState('');
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate  = useNavigate();

  const submit = async () => {
    setError('');
    if (!email || !pass || !name) { setError('Tous les champs sont requis.'); return; }
    setLoading(true);
    try {
      await register(email, pass, name);
      navigate('/ewish-admin');
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de la création du compte');
    } finally { setLoading(false); }
  };

  const onKey = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <div className={s.root}>
      <div className={s.glow} />
      <div className={s.card}>
        <div className={s.logo}>eWish<span>Well</span></div>
        <div className={s.sub}>Inscription Marchand</div>

        <div className={s.field}>
          <label>Nom ou Société</label>
          <input
            type="text" value={name}
            placeholder="Mon Entreprise"
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && document.getElementById('reg-email').focus()}
          />
        </div>

        <div className={s.field}>
          <label>Email</label>
          <input
            id="reg-email" type="email" value={email} autoComplete="username"
            placeholder="contact@exemple.com"
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && document.getElementById('reg-pass').focus()}
          />
        </div>

        <div className={s.field}>
          <label>Mot de passe</label>
          <input
            id="reg-pass" type="password" value={pass} autoComplete="new-password"
            placeholder="••••••••"
            onChange={e => setPass(e.target.value)}
            onKeyDown={onKey}
          />
        </div>

        {error && <div className={s.error}>{error}</div>}

        <button className={s.btn} onClick={submit} disabled={loading}>
          {loading ? 'Création...' : 'Créer mon compte'}
        </button>
        
        <div style={{ marginTop: 15, textAlign: 'center', fontSize: 13, color: '#888' }}>
          Déjà un compte ? <Link to="/ewish-admin/login" style={{ color: '#c8963e', textDecoration: 'none' }}>Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
