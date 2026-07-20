import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Gift } from 'lucide-react';
import { getPublicPublicationBySlug } from '../utils/api';
import { fireConfetti } from '../utils/confettiFx';

export default function RecipientReveal() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isGuest = searchParams.get('collect') === '1';

  const [pub, setPub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [opened, setOpened] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    getPublicPublicationBySlug(slug)
      .then(data => {
        setPub(data);
        setLoading(false);
        // Si c'est un invité, on passe directement l'animation
        if (isGuest) {
          setOpened(true);
          setFade(true);
        }
      })
      .catch(err => {
        console.error(err);
        setError(true);
        setLoading(false);
      });
  }, [slug, isGuest]);

  const handleOpen = () => {
    setOpened(true);
    
    // Confettis dynamiques basés sur le choix de l'utilisateur
    fireConfetti(pub?.confettiType || 'default');

    // On efface l'overlay après 2.8 secondes
    setTimeout(() => {
      setFade(true);
    }, 2800);
  };

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FFFAF6' }}>
        <div style={{ width: 30, height: 30, borderRadius: '50%', border: '2.5px solid #FFE0E6', borderTopColor: '#E11D48', animation: 'spin .75s linear infinite' }} />
      </div>
    );
  }

  if (error || !pub) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#FFFAF6', fontFamily: 'Inter' }}>
        <h2 style={{ color: '#1A1A1A' }}>Lien introuvable</h2>
        <p style={{ color: '#666' }}>Ce mur n'existe pas ou n'est plus disponible.</p>
        <button className="btn btn-primary" style={{ marginTop: 20 }} onClick={() => navigate('/')}>Retour</button>
      </div>
    );
  }

  // URL du mur rendu par le serveur. ?noanim=1 (pour que le mur sache de ne pas doubler les animations)
  const iframeUrl = `/site/${pub.templateName}/${pub.customName}${isGuest ? '?collect=1' : '?previewMode=false&noanim=1'}`;

  // Icône animée Noto Emoji
  const revealIconCode = pub.revealIcon === 'cake' ? '1f382'
                       : pub.revealIcon === 'heart' ? '1f49d'
                       : pub.revealIcon === 'party' ? '1f389'
                       : '1f381'; // Cadeau par défaut
  
  // Emoji d'arrière-plan selon l'occasion
  const bgEmoji = pub.occasion === 'wedding' ? '💍'
                : pub.occasion === 'birth' ? '🍼'
                : pub.occasion === 'graduation' ? '🎓'
                : '✨';

  return (
    <div style={{ width: '100%', height: '100vh', overflow: 'hidden', position: 'relative', background: '#FFFAF6' }}>
      
      {/* Lecteur Iframe du mur */}
      <iframe
        src={iframeUrl}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          border: 'none', background: 'transparent',
          transition: 'opacity 1.5s ease',
          opacity: fade ? 1 : 0,
          zIndex: 1
        }}
        title="Mur de mots"
      />

      {/* Overlay de Déballage Destinataire */}
      {!fade && !isGuest && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'rgba(30,20,32,0.65)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.8s ease',
          opacity: fade ? 0 : 1,
          overflow: 'hidden'
        }}>
          
          {/* Typographie GÉANTE floutée en fond (Initiales) */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            fontSize: '50vw', fontWeight: 800, color: 'rgba(255,255,255,0.1)',
            filter: 'blur(60px)', pointerEvents: 'none', userSelect: 'none',
            fontFamily: 'var(--mk-display, "Playfair Display", serif)',
            zIndex: -1, whiteSpace: 'nowrap'
          }}>
            {pub.recipient ? pub.recipient.charAt(0).toUpperCase() : bgEmoji}
          </div>

          {!opened ? (
            <div 
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', 
                animation: 'mk-float 4s ease-in-out infinite'
              }}
            >
              <div 
                onClick={handleOpen}
                style={{
                  width: 160, height: 160, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer', transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                  marginBottom: 32, position: 'relative'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1) translateY(-10px)';
                  e.currentTarget.style.boxShadow = '0 30px 60px rgba(255,255,255,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = '0 20px 50px rgba(0,0,0,0.3)';
                }}
              >
                {/* Glow interne */}
                <div style={{
                  position: 'absolute', inset: '15%', borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                  filter: 'blur(15px)', pointerEvents: 'none'
                }} />
                <img 
                  src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${revealIconCode}/512.gif`} 
                  alt="Ouvrir" 
                  style={{ width: 90, height: 90, zIndex: 2, pointerEvents: 'none' }} 
                />
              </div>
              
              <h1 style={{ 
                fontFamily: pub.fontFamily ? `'${pub.fontFamily}', sans-serif` : 'var(--mk-display, "Playfair Display", serif)', 
                fontSize: 42, color: '#fff', margin: '0 0 12px 0', textAlign: 'center',
                textShadow: '0 4px 20px rgba(0,0,0,0.4)',
                letterSpacing: '-0.02em', maxWidth: '90%', lineHeight: 1.1
              }}>
                Pour {pub.recipient || 'Toi'}
              </h1>
              <p style={{ 
                fontFamily: 'var(--mk-body, "Inter", sans-serif)', 
                fontSize: 16, color: 'rgba(255,255,255,0.6)', margin: 0 
              }}>
                Touche pour découvrir ✦
              </p>
            </div>
          ) : (
            <div style={{ 
              animation: 'mk-zoom-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              textAlign: 'center'
            }}>
              <h2 style={{ 
                fontFamily: pub.fontFamily ? `'${pub.fontFamily}', sans-serif` : 'var(--mk-display, "Playfair Display", serif)', 
                fontSize: 64, color: '#fff', margin: '0 0 16px 0',
                textShadow: '0 4px 40px rgba(255,255,255,0.5)',
                letterSpacing: '-0.02em'
              }}>
                Surprise !
              </h2>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes mk-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        @keyframes mk-zoom-in {
          0% { opacity: 0; transform: scale(0.6); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
