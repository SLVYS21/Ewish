import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import s from '../pages/AdminLogin.module.css';

export default function GoogleBtn({ label = 'Continuer avec Google', redirectTo = '/ewish-admin/ewish' }) {
  const { googleLogin } = useAuth();
  const navigate = useNavigate();
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);
  const callbackRef = useRef(null);

  callbackRef.current = async (response) => {
    setLoading(true);
    setError('');
    try {
      await googleLogin(response.credential);
      navigate(redirectTo);
    } catch (e) {
      setError(e.response?.data?.error || 'Erreur Google');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    const init = () => {
      window.google?.accounts.id.initialize({
        client_id: clientId,
        callback: (r) => callbackRef.current(r),
        auto_select: false,
        cancel_on_tap_outside: true,
      });
    };

    if (window.google?.accounts?.id) { init(); return; }

    if (!document.querySelector('script[src*="accounts.google.com/gsi"]')) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = init;
      document.head.appendChild(script);
    } else {
      const poll = setInterval(() => {
        if (window.google?.accounts?.id) { clearInterval(poll); init(); }
      }, 100);
      return () => clearInterval(poll);
    }
  }, []);

  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (!clientId) return null;

  const handleClick = () => window.google?.accounts.id.prompt();

  return (
    <>
      {error && <div className={s.error} style={{ marginBottom: 10 }}>{error}</div>}
      <button className={s.btnOutline} onClick={handleClick} disabled={loading}>
        <GoogleIcon />
        {loading ? 'Connexion…' : label}
      </button>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}
