import { useState } from 'react';
import { useAuth } from '../admin/context/AuthContext';
import { X, Loader2 } from 'lucide-react';
import GoogleBtn from '../admin/components/GoogleBtn';

export default function AuthBottomSheet({ onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('register'); // 'register' or 'login'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !pass || (mode === 'register' && !name)) {
      setError('Tous les champs sont requis.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'register') {
        await register(email, pass, name);
      } else {
        await login(email, pass);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err.response?.data?.error || "L'authentification a échoué.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.4)', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
      <div style={{ position: 'absolute', inset: 0 }} onClick={onClose} />
      <div className="mk-anim-slide-up" style={{ position: 'relative', width: '100%', maxHeight: '85vh', background: '#FAF7F0', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 -10px 40px rgba(0,0,0,0.2)' }}>
        
        <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #EFE9DB', background: '#fff' }}>
          <div style={{ fontFamily: 'var(--mk-display)', fontSize: '18px', color: '#161311' }}>
            {mode === 'register' ? 'Crée ton compte' : 'Connexion'}
          </div>
          <button onClick={onClose} style={{ background: '#F6F1E6', border: 'none', color: '#453E2E', cursor: 'pointer', padding: '6px', borderRadius: '50%', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <div className="mk-scroll" style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', background: '#fff' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            <button 
              onClick={() => setMode('register')} 
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: mode === 'register' ? '#1E2952' : '#F6F1E6', color: mode === 'register' ? '#fff' : '#453E2E', font: '700 13px var(--mk-body)', cursor: 'pointer' }}
            >
              Inscription
            </button>
            <button 
              onClick={() => setMode('login')} 
              style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: mode === 'login' ? '#1E2952' : '#F6F1E6', color: mode === 'login' ? '#fff' : '#453E2E', font: '700 13px var(--mk-body)', cursor: 'pointer' }}
            >
              Connexion
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
             <GoogleBtn label="Continuer avec Google" redirectTo={window.location.pathname} />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0', color: '#8C8570', font: '500 12px var(--mk-body)' }}>
            <div style={{ flex: 1, height: '1px', background: '#EFE9DB' }} />
            Ou avec ton email
            <div style={{ flex: 1, height: '1px', background: '#EFE9DB' }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'register' && (
              <div>
                <label style={{ display: 'block', font: '700 12px var(--mk-body)', color: '#453E2E', marginBottom: '6px' }}>Nom complet</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E5DDC9', background: '#FAF7F0', font: '500 14px var(--mk-body)', outline: 'none' }} 
                  placeholder="Ex: Sarah Martin"
                />
              </div>
            )}
            <div>
              <label style={{ display: 'block', font: '700 12px var(--mk-body)', color: '#453E2E', marginBottom: '6px' }}>Adresse email</label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E5DDC9', background: '#FAF7F0', font: '500 14px var(--mk-body)', outline: 'none' }} 
                placeholder="sarah@example.com"
              />
            </div>
            <div>
              <label style={{ display: 'block', font: '700 12px var(--mk-body)', color: '#453E2E', marginBottom: '6px' }}>Mot de passe</label>
              <input 
                type="password" 
                value={pass} 
                onChange={e => setPass(e.target.value)} 
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #E5DDC9', background: '#FAF7F0', font: '500 14px var(--mk-body)', outline: 'none' }} 
                placeholder="Min. 8 caractères"
              />
            </div>
            
            {error && <div style={{ color: '#D81B60', font: '600 12px var(--mk-body)', padding: '10px', background: '#FCE4EC', borderRadius: '8px' }}>{error}</div>}

            <button type="submit" disabled={loading} style={{ marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: '#1E2952', color: '#fff', font: '800 14px var(--mk-body)', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? <Loader2 size={16} style={{ animation: 'mk-spin .75s linear infinite' }} /> : null}
              {mode === 'register' ? 'Créer mon compte' : 'Me connecter'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
