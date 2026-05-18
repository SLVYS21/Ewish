import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import s from './AdminLogin.module.css';

const VALUE_CARDS = [
  { icon: '🎂', title: '5 templates clé en main',   desc: 'Anniversaire, mariage, événement…' },
  { icon: '💸', title: '3 crédits gratuits offerts', desc: 'Pas de carte requise pour commencer' },
  { icon: '📲', title: 'Mobile Money intégré',       desc: 'MTN, Moov, Wave, carte bancaire' },
  { icon: '⏱', title: 'Sites publiés en 1 clic',    desc: 'Lien court + QR code générés' },
];

export default function AdminRegister() {
  const [email, setEmail]     = useState('');
  const [pass, setPass]       = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [agree, setAgree]     = useState(true);
  const { register } = useAuth();
  const navigate     = useNavigate();

  const submit = async () => {
    setError('');
    if (!email || !pass) { setError('Tous les champs sont requis.'); return; }
    setLoading(true);
    try {
      await register(email, pass, '');
      navigate('/ewish-admin');
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur lors de la création du compte');
    } finally { setLoading(false); }
  };

  return (
    <div className={s.root}>

      {/* ── Left: value props ── */}
      <div className={s.valueSide}>
        <div className={s.valueLogo}>
          <span className={s.logoBox}>🎁</span>
          my<span>Kado</span>
        </div>

        <div>
          <h1 className={s.valueHeadline}>
            Lancez votre première carte en moins de 5 minutes.
          </h1>
          <div className={s.valueCards}>
            {VALUE_CARDS.map((c, i) => (
              <div key={i} className={s.valueCard}>
                <div className={s.valueCardIcon}>{c.icon}</div>
                <div>
                  <div className={s.valueCardTitle}>{c.title}</div>
                  <div className={s.valueCardDesc}>{c.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={s.socialProof}>
          <div className={s.avatarStack}>
            {[
              { bg: '#fbcfe8', l: 'S' }, { bg: '#fde68a', l: 'M' },
              { bg: '#bfdbfe', l: 'K' }, { bg: '#bbf7d0', l: 'A' },
            ].map((a, i) => (
              <div key={i} className={s.avatarStackItem} style={{ background: a.bg }}>
                {a.l}
              </div>
            ))}
          </div>
          +240 marchands déjà inscrits cette semaine
        </div>
      </div>

      {/* ── Right: form ── */}
      <div className={s.formSide}>
        <h2 className={s.formTitle}>Créer mon compte</h2>
        <p className={s.formSub}>
          C'est gratuit. <strong style={{ color: '#e11d48' }}>3 crédits offerts</strong> à l'inscription.
        </p>

        <div className={s.field}>
          <label>Email professionnel</label>
          <input
            type="email" value={email} autoComplete="username"
            placeholder="vous@mykado.com"
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && document.getElementById('reg-pass')?.focus()}
          />
        </div>

        <div className={s.field}>
          <label>Mot de passe</label>
          <input
            id="reg-pass" type="password" value={pass} autoComplete="new-password"
            placeholder="8 caractères minimum"
            onChange={e => setPass(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
          />
        </div>

        <div className={s.field} style={{ marginBottom: 18 }}>
          <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontWeight: 400, fontSize: '0.72rem', color: '#52525b', lineHeight: 1.5, textTransform: 'none', letterSpacing: 0 }}>
            <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} style={{ accentColor: '#e11d48', marginTop: 2 }} />
            <span>J'accepte les <a style={{ color: '#e11d48', fontWeight: 700, textDecoration: 'none' }}>conditions d'utilisation</a> et la politique de confidentialité.</span>
          </label>
        </div>

        {error && <div className={s.error}>{error}</div>}

        <button className={s.btn} onClick={submit} disabled={loading}>
          {loading ? 'Création…' : 'Créer mon compte gratuit →'}
        </button>

        <div className={s.formFooter}>
          Déjà un compte ?{' '}
          <Link to="/ewish-admin/login">Se connecter</Link>
        </div>
      </div>
    </div>
  );
}
