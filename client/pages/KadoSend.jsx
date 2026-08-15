import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import NotoEmoji from '../components/NotoEmoji';
import { clearContext } from '../create-flow/context';

/* /kado/send — Placeholder de la 4e voie ("Un kado" = envoi d'argent sans carte).
   Le vrai flow (destinataire + montant + moyen de paiement) reste à construire.
   On rend l'écran propre et cohérent avec le reste du wizard /create : palette
   Kado, fond blanc, message clair + retour vers /create. */
export default function KadoSend() {
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const recipient = params.get('name') || '';
  const occasion = params.get('occ') || '';

  const goBack = () => navigate('/create');
  const goDashboard = () => {
    clearContext();
    navigate('/ewish-admin');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FFFFFF',
      padding: '30px 24px 60px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative',
      fontFamily: 'var(--mk-body, "Plus Jakarta Sans", system-ui, sans-serif)',
      color: '#2B2440',
    }}>
      {/* Retour */}
      <button
        onClick={goBack}
        style={{
          position: 'absolute', top: 20, left: 20,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '8px 14px 8px 10px',
          border: '1px solid #EAD6DE',
          background: '#FFFFFF', color: '#2B2440',
          borderRadius: 999, fontWeight: 600, fontSize: 13,
          cursor: 'pointer',
        }}
      >
        <ArrowLeft size={18} />
        <span>Retour</span>
      </button>

      <div style={{
        maxWidth: 520,
        textAlign: 'center',
        margin: '96px auto 0',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
      }}>
        {/* Illustration animée */}
        <div style={{
          width: 120, height: 120,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #CFF2ED, #FFF0C9)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <NotoEmoji name="wrapped-gift" size={72} />
        </div>

        {/* Chip statut */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 12px',
          background: '#FFF3F5',
          color: '#D6465E',
          borderRadius: 999,
          fontSize: 12, fontWeight: 700,
          letterSpacing: '.04em', textTransform: 'uppercase',
        }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%',
            background: '#FF5470', display: 'inline-block',
          }} />
          Bientôt disponible
        </div>

        {/* Titre */}
        <h1 style={{
          fontFamily: 'var(--mk-display, "Instrument Serif", Georgia, serif)',
          fontWeight: 400,
          fontSize: 'clamp(28px, 4.4vw, 40px)',
          lineHeight: 1.1,
          letterSpacing: '-0.01em',
          margin: 0,
        }}>
          Envoyer un kado, sans carte
        </h1>

        {/* Sous-titre */}
        <p style={{
          fontSize: 16,
          color: '#5D5474',
          margin: 0,
          lineHeight: 1.5,
        }}>
          {recipient
            ? <>On prépare le flow pour t'envoyer un cadeau à <strong style={{ color: '#2B2440' }}>{recipient}</strong> en quelques clics.</>
            : <>On prépare le flow pour envoyer de l'argent en quelques clics, sans passer par une carte.</>}
          {' '}En attendant, tu peux offrir un <em>kado</em> via une carte enveloppe.
        </p>

        {/* Récap contexte (si présent) */}
        {(occasion || recipient) && (
          <div style={{
            padding: '12px 16px',
            background: '#FFF3F5',
            borderRadius: 12,
            border: '1px solid #EAD6DE',
            fontSize: 13,
            color: '#5D5474',
            width: '100%',
            display: 'flex', flexDirection: 'column', gap: 4,
            textAlign: 'left',
          }}>
            <div style={{ fontWeight: 600, color: '#2B2440', marginBottom: 4 }}>Tes infos</div>
            {occasion && <div>Occasion : <strong style={{ color: '#2B2440' }}>{occasion}</strong></div>}
            {recipient && <div>Destinataire : <strong style={{ color: '#2B2440' }}>{recipient}</strong></div>}
          </div>
        )}

        {/* CTAs */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 10,
          width: '100%', marginTop: 8,
        }}>
          <Link
            to="/create?type=envelope"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              gap: 8, padding: '14px 22px',
              borderRadius: 14,
              background: '#FF5470', color: '#FFFFFF',
              fontSize: 15, fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 8px 24px rgba(255,84,112,.24)',
            }}
          >
            <span>Créer une enveloppe kado</span>
            <ArrowRight size={17} />
          </Link>
          <button
            onClick={goDashboard}
            style={{
              padding: '12px 20px',
              borderRadius: 14,
              background: 'transparent',
              color: '#5D5474',
              border: '1px solid #EAD6DE',
              fontSize: 14, fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Revenir au dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
