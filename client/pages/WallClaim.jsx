import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Gift, Sparkles, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../admin/context/AuthContext';
import { getWallClaim, claimWall } from '../utils/api';
import Kado from '../components/Kado/Kado';

/* ══════════════════════════════════════════════════════════
   WallClaim — Route /ewish-admin/claim/:token
   Étape 8 flow murs. Landing publique montrant le "cadeau" qui
   attend le destinataire, puis prompt login/signup + auto-claim
   dès qu'il a un compte. Le token est consommé côté serveur.
   ══════════════════════════════════════════════════════════ */
export default function WallClaim() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [meta, setMeta]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const [errorCode, setErrorCode] = useState('');
  const [claiming, setClaiming]   = useState(false);

  /* Fetch meta au montage (public — pas besoin d'être connecté). */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getWallClaim(token);
        setMeta(data);
      } catch (err) {
        const c = err.response?.data;
        setError(c?.error || 'Ce lien est invalide ou a expiré.');
        setErrorCode(c?.code || '');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  const handleClaim = async () => {
    if (claiming) return;
    setClaiming(true);
    setError('');
    try {
      const { data } = await claimWall(token);
      navigate(data.redirectTo || '/ewish-admin', { replace: true });
    } catch (err) {
      const c = err.response?.data;
      setError(c?.error || 'La réception a échoué.');
      setErrorCode(c?.code || '');
      setClaiming(false);
    }
  };

  const isLoading = loading || authLoading;
  const recipientName = (meta?.recipientName || '').trim();
  const eventLabel = (meta?.occasionLabel || '').trim().toLowerCase();

  /* Palette — le claim est un moment cérémoniel, on garde rose+or+violet. */
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #FFF5F7 0%, #FFFCF3 55%, #F4EFFB 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '32px 20px',
      fontFamily: 'var(--mk-font-sans, Inter, system-ui, sans-serif)',
    }}>
      <div style={{
        maxWidth: 520, width: '100%',
        background: '#ffffff', borderRadius: 28,
        border: '1px solid rgba(255,193,69,0.35)',
        padding: '36px 30px 32px',
        boxShadow: '0 30px 80px -30px rgba(255,84,112,.28), 0 12px 30px -10px rgba(124,92,201,.16)',
        textAlign: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Décor mascotte en flottant top-center */}
        <div style={{
          position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)',
          filter: 'drop-shadow(0 12px 22px rgba(255,84,112,.24))',
        }}>
          <Kado size={110} cycle={['jump', 'love', 'wink']} cycleInterval={4000} ambient />
        </div>

        <div style={{ height: 62 }} />

        {/* States */}
        {isLoading && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            padding: '20px 0 12px',
          }}>
            <Loader2 size={22} className="mk-spin" style={{ animation: 'mk-spin .8s linear infinite', color: '#FF5470' }} />
            <div style={{ fontSize: 13.5, color: '#7A748F' }}>On vérifie ton lien…</div>
          </div>
        )}

        {!isLoading && error && (
          <>
            <div style={{
              width: 56, height: 56, borderRadius: 999, margin: '0 auto 14px',
              background: '#FFE1E5', color: '#C1354C',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <AlertCircle size={24} />
            </div>
            <h1 style={{
              fontFamily: 'var(--mk-font-serif, Fraunces, serif)',
              fontSize: 26, fontWeight: 500, color: '#2B1A2D',
              marginBottom: 10, lineHeight: 1.15,
            }}>
              {errorCode === 'ALREADY_CLAIMED'
                ? 'Ce mur a déjà été reçu'
                : errorCode === 'SELF_CLAIM'
                ? 'Un cadeau ne se reçoit pas soi-même'
                : 'Lien introuvable'}
            </h1>
            <p style={{ color: '#55506B', fontSize: 14.5, lineHeight: 1.55 }}>
              {error}
            </p>
            <Link
              to="/ewish-admin"
              style={{
                marginTop: 20, display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '11px 20px', borderRadius: 12, background: '#FF5470',
                color: '#fff', textDecoration: 'none', fontWeight: 700, fontSize: 14,
              }}
            >
              Aller à mon compte <ArrowRight size={15} />
            </Link>
          </>
        )}

        {!isLoading && !error && meta && (
          <>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 999,
              background: '#FFFCF3', border: '1px solid #FFC145',
              fontSize: 11, fontWeight: 700, letterSpacing: '.14em',
              textTransform: 'uppercase', color: '#C79600',
              marginBottom: 14,
            }}>
              <Sparkles size={12} /> Un cadeau t'attend
            </div>

            <h1 style={{
              fontFamily: 'var(--mk-font-serif, Fraunces, serif)',
              fontSize: 32, fontWeight: 500, color: '#2B1A2D',
              marginBottom: 10, lineHeight: 1.1, letterSpacing: '-.02em',
            }}>
              {recipientName
                ? <>Coucou <em style={{ fontStyle: 'italic', color: '#FF5470' }}>{recipientName}</em></>
                : 'Un mur t\'attend'}
            </h1>

            <p style={{
              color: '#55506B', fontSize: 15.5, lineHeight: 1.55,
              maxWidth: 380, margin: '0 auto 22px',
            }}>
              Tes proches ont préparé un mur de mots pour toi
              {eventLabel ? ` — ${eventLabel}` : ''}.
              {' '}Réceptionne-le pour le voir et garder tous ces mots précieux.
            </p>

            {/* Cagnotte teaser */}
            {meta.cagnotte?.enabled && meta.cagnotte.total > 0 && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '10px 16px', borderRadius: 14,
                background: 'linear-gradient(135deg, #FFF6DA 0%, #FFF 100%)',
                border: '1px solid #FFC145',
                fontSize: 13, color: '#8A6A2A', fontWeight: 700,
                marginBottom: 22,
              }}>
                <Gift size={16} style={{ color: '#C79600' }} />
                Une cagnotte de {Number(meta.cagnotte.total).toLocaleString('fr-FR')} FCFA t'attend aussi
              </div>
            )}

            {meta.alreadyClaimed && (
              <div style={{
                padding: 14, borderRadius: 12,
                background: '#FFF3F5', border: '1px solid #FFC1CB',
                color: '#C1354C', fontSize: 13.5, marginBottom: 18,
              }}>
                Ce mur a déjà été réceptionné. Si ce n'est pas toi, contacte celui qui te l'a offert.
              </div>
            )}

            {user ? (
              <button
                type="button"
                onClick={handleClaim}
                disabled={claiming || meta.alreadyClaimed}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 10,
                  padding: '14px 26px', borderRadius: 14, border: 'none',
                  background: meta.alreadyClaimed ? '#E5E1EE' : '#FF5470',
                  color: meta.alreadyClaimed ? '#8B85A0' : '#fff',
                  fontFamily: 'inherit', fontWeight: 700, fontSize: 15.5,
                  cursor: (claiming || meta.alreadyClaimed) ? 'not-allowed' : 'pointer',
                  boxShadow: meta.alreadyClaimed ? 'none' : '0 12px 28px -10px rgba(255,84,112,.5)',
                  transition: 'transform .15s',
                }}
              >
                {claiming
                  ? <><Loader2 size={16} style={{ animation: 'mk-spin .8s linear infinite' }} /> Réception…</>
                  : <>Je réceptionne mon mur <ArrowRight size={16} /></>}
              </button>
            ) : (
              <>
                <p style={{ fontSize: 13, color: '#7A748F', marginBottom: 14 }}>
                  Connecte-toi ou crée ton compte pour recevoir ton mur.
                </p>
                <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link
                    to={`/ewish-admin/login?next=${encodeURIComponent('/ewish-admin/claim/' + token)}`}
                    style={{
                      padding: '13px 22px', borderRadius: 12,
                      background: '#FF5470', color: '#fff',
                      textDecoration: 'none', fontWeight: 700, fontSize: 14.5,
                      boxShadow: '0 8px 20px -8px rgba(255,84,112,.5)',
                    }}
                  >
                    Se connecter
                  </Link>
                  <Link
                    to={`/ewish-admin/register?next=${encodeURIComponent('/ewish-admin/claim/' + token)}`}
                    style={{
                      padding: '13px 22px', borderRadius: 12,
                      background: '#fff', color: '#2B1A2D',
                      border: '1.5px solid #EEEBF3',
                      textDecoration: 'none', fontWeight: 700, fontSize: 14.5,
                    }}
                  >
                    Créer un compte
                  </Link>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
