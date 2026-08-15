import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../admin/context/AuthContext';
import GoogleBtn from '../admin/components/GoogleBtn';

/* Modale d'auth rapide utilisée par /create quand un flow nécessite un compte
   (ex. wish TemplateStep → createPublication). Signup par défaut, toggle vers
   Login. Pas de Google ici — pour l'auth Google, l'utilisateur va sur /login.

   Props :
   - open       : bool
   - onClose    : ferme la modale (clic X, Escape, clic sur le veil)
   - onAuthed   : callback appelé avec le user créé/connecté après succès
   - title      : titre custom (default : "Un compte pour continuer")
   - subtitle   : sous-titre custom */
export default function QuickAuthModal({
  open,
  onClose,
  onAuthed,
  title = 'Un compte pour continuer',
  subtitle = 'On te crée un compte rapide pour préparer ta carte et la retrouver.',
}) {
  const { login, register } = useAuth();
  const [mode, setMode] = useState('signup'); // 'signup' | 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    /* Focus le premier champ à l'ouverture (name pour signup, email pour login). */
    setTimeout(() => firstInputRef.current?.focus(), 80);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  /* Reset le formulaire si on ferme la modale. */
  useEffect(() => {
    if (!open) {
      setError('');
      setLoading(false);
    }
  }, [open]);

  if (!open) return null;

  const submit = async (e) => {
    e?.preventDefault?.();
    setError('');
    if (mode === 'signup') {
      if (!name.trim() || !email.trim() || !pass) {
        setError('Tous les champs sont requis.');
        return;
      }
      if (pass.length < 8) {
        setError('Mot de passe : 8 caractères minimum.');
        return;
      }
    } else {
      if (!email.trim() || !pass) {
        setError('Email et mot de passe requis.');
        return;
      }
    }

    setLoading(true);
    try {
      const user = mode === 'signup'
        ? await register(email.trim(), pass, name.trim())
        : await login(email.trim(), pass);
      onAuthed?.(user);
    } catch (err) {
      setError(err?.response?.data?.error || (mode === 'signup'
        ? 'La création du compte a échoué.'
        : 'Identifiants invalides.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 1300,
        background: 'rgba(43, 36, 64, .55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
        fontFamily: 'var(--mk-body, "Plus Jakarta Sans", system-ui, sans-serif)',
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 24,
          padding: 28,
          width: '100%', maxWidth: 420,
          boxShadow: '0 24px 60px -12px rgba(0,0,0,.4)',
          position: 'relative',
          display: 'flex', flexDirection: 'column', gap: 18,
        }}
      >
        {/* Close X */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          style={{
            position: 'absolute', top: 14, right: 14,
            width: 32, height: 32,
            borderRadius: '50%',
            border: 'none',
            background: '#FFF3F5',
            color: '#5D5474',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div>
          <h2 style={{
            fontFamily: 'var(--mk-display, "Instrument Serif", Georgia, serif)',
            fontWeight: 400,
            fontSize: 26,
            lineHeight: 1.15,
            color: '#2B2440',
            margin: '0 0 8px',
            paddingRight: 40,
          }}>
            {title}
          </h2>
          <p style={{
            fontSize: 14,
            color: '#5D5474',
            margin: 0,
            lineHeight: 1.5,
          }}>
            {subtitle}
          </p>
        </div>

        {/* Google login (au-dessus, plus rapide) */}
        <div>
          <GoogleBtn
            label="Continuer avec Google"
            onSuccess={(u) => onAuthed?.(u)}
            className="mk-google-quick-btn"
          />
          <style>{`
            .mk-google-quick-btn {
              width: 100%;
              display: inline-flex;
              align-items: center;
              justify-content: center;
              gap: 10px;
              padding: 12px 16px;
              border-radius: 12px;
              border: 1.5px solid #EAD6DE;
              background: #FFFFFF;
              color: #2B2440;
              font-family: inherit;
              font-size: 14px;
              font-weight: 700;
              cursor: pointer;
              transition: background .15s ease, border-color .15s ease;
            }
            .mk-google-quick-btn:hover {
              background: #FFF3F5;
              border-color: #FF5470;
            }
            .mk-google-quick-btn:disabled {
              opacity: .7;
              cursor: not-allowed;
            }
          `}</style>
        </div>

        {/* Séparateur "ou" */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12,
          fontSize: 12, color: '#8C859E', fontWeight: 600,
        }}>
          <div style={{ flex: 1, height: 1, background: '#EAD6DE' }} />
          <span>ou</span>
          <div style={{ flex: 1, height: 1, background: '#EAD6DE' }} />
        </div>

        {/* Toggle Signup / Login */}
        <div style={{
          display: 'flex',
          background: '#FFF3F5',
          borderRadius: 12,
          padding: 4,
          gap: 4,
        }}>
          <button
            type="button"
            onClick={() => { setMode('signup'); setError(''); }}
            style={{
              flex: 1, padding: '10px 12px',
              borderRadius: 8, border: 'none',
              background: mode === 'signup' ? '#FFFFFF' : 'transparent',
              color: mode === 'signup' ? '#FF5470' : '#5D5474',
              fontWeight: 700, fontSize: 13,
              cursor: 'pointer',
              boxShadow: mode === 'signup' ? '0 2px 8px -2px rgba(43,36,64,.15)' : 'none',
              transition: 'background .15s ease',
            }}
          >
            Inscription
          </button>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            style={{
              flex: 1, padding: '10px 12px',
              borderRadius: 8, border: 'none',
              background: mode === 'login' ? '#FFFFFF' : 'transparent',
              color: mode === 'login' ? '#FF5470' : '#5D5474',
              fontWeight: 700, fontSize: 13,
              cursor: 'pointer',
              boxShadow: mode === 'login' ? '0 2px 8px -2px rgba(43,36,64,.15)' : 'none',
              transition: 'background .15s ease',
            }}
          >
            Connexion
          </button>
        </div>

        {/* Form */}
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'signup' && (
            <div>
              <label htmlFor="qa-name" style={labelStyle}>Prénom</label>
              <input
                id="qa-name"
                ref={firstInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex. Sarah"
                autoComplete="given-name"
                style={inputStyle}
              />
            </div>
          )}
          <div>
            <label htmlFor="qa-email" style={labelStyle}>Email</label>
            <input
              id="qa-email"
              ref={mode === 'login' ? firstInputRef : null}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="toi@exemple.com"
              autoComplete="email"
              style={inputStyle}
            />
          </div>
          <div>
            <label htmlFor="qa-pass" style={labelStyle}>
              Mot de passe {mode === 'signup' && <span style={{ color: '#8C859E', fontWeight: 400 }}>(8+ caractères)</span>}
            </label>
            <input
              id="qa-pass"
              type="password"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              placeholder="••••••••"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              style={inputStyle}
            />
          </div>

          {error && (
            <div style={{
              padding: '10px 12px',
              background: '#FFF3F5',
              color: '#D6465E',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 500,
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              marginTop: 4,
              padding: '14px 20px',
              borderRadius: 12,
              border: 'none',
              background: loading ? '#DCC4CE' : '#FF5470',
              color: '#FFFFFF',
              fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 8px 24px rgba(255,84,112,.24)',
              transition: 'transform .15s ease, background .15s ease',
            }}
          >
            {loading ? 'Un instant…' : (mode === 'signup' ? 'Créer mon compte' : 'Me connecter')}
          </button>
        </form>

        {/* Alt CTA vers l'auth complète */}
        <div style={{ fontSize: 12, color: '#8C859E', textAlign: 'center' }}>
          Besoin de plus d'options ?{' '}
          <a
            href={mode === 'signup' ? '/ewish-admin/register' : '/ewish-admin/login'}
            style={{ color: '#FF5470', fontWeight: 600, textDecoration: 'none' }}
          >
            Page complète →
          </a>
        </div>
      </div>
    </div>
  );
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 600,
  color: '#2B2440',
  marginBottom: 6,
};

const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  fontSize: 15,
  fontFamily: 'inherit',
  color: '#2B2440',
  background: '#FFFFFF',
  border: '1.5px solid #EAD6DE',
  borderRadius: 10,
  outline: 'none',
  transition: 'border-color .15s ease, box-shadow .15s ease',
};
