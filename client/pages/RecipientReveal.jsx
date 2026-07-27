import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Gift } from 'lucide-react';
import { getPublicPublicationBySlug } from '../utils/api';
import { fireConfetti } from '../utils/confettiFx';
import AnimatedBackground from '../wall/AnimatedBackground';

export default function RecipientReveal() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isGuest = searchParams.get('collect') === '1';
  const isPreview = searchParams.get('preview') === '1';

  const [pub, setPub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [opened, setOpened] = useState(false);
  const [fade, setFade] = useState(false);

  useEffect(() => {
    getPublicPublicationBySlug(slug, { preview: isPreview })
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
  }, [slug, isGuest, isPreview]);

  const handleOpen = () => {
    setOpened(true);
    
    // Confettis dynamiques basés sur le choix de l'utilisateur
    const styleConfetti = pub?.style?.styleConfettiPreset || pub?.style?.confettiId || pub?.confettiType || 'default';
    fireConfetti(styleConfetti);

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
  // URL ABSOLUE vers l'origine serveur (VITE_API_URL) : sinon en prod, /site/... résout contre
  // app.mykado.store (static site) qui n'a pas /site/ et retombe sur l'index.html SPA → user
  // voit l'accueil dans l'iframe au lieu du mur.
  const VITE_SITE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
  const iframeUrl = `${VITE_SITE}/site/${pub.templateName}/${pub.customName}${isGuest ? '?collect=1' : '?previewMode=false'}`;

  // Render functions removed since they will be handled by the HTML templates
  const bgEmoji = pub?.occasion === 'wedding' ? '💍'
                : pub?.occasion === 'birth' ? '🍼'
                : pub?.occasion === 'graduation' ? '🎓'
                : '✨';

  // Arrière-plan
  const bgId = pub?.style?.styleBgPreset || pub?.style?.wallBackgroundId || 'bg-blob';

  let wallBg = pub?.style?.wallBackground || 'transparent';
  if (wallBg === 'transparent' || !wallBg) {
    const fallbacks = {
      'bg-blob': 'linear-gradient(155deg,#243157 0%,#1A234A 45%,#141B3B 100%)',
      'bg-polka': 'linear-gradient(160deg,#F0B24C,#E4922B)',
      'bg-bokeh': 'radial-gradient(120% 90% at 50% 15%,#3A2450 0%,#241634 55%,#160D22 100%)',
      'bg-comic': '#F2D24C',
      'bg-synthwave': 'linear-gradient(180deg,#1A1140 0%,#2A1550 46%,#3E1C5E 58%,#160D22 100%)',
      'bg-sunburst': '#1B2450',
    };
    wallBg = fallbacks[bgId] || '#FFFAF6';
  }
  const wallBgSize = pub?.style?.wallBackgroundSize === 'tile' ? 'auto' : 'cover';
  const wallBgRepeat = pub?.style?.wallBackgroundSize === 'tile' ? 'repeat' : 'no-repeat';

  return (
    <div style={{ 
      width: '100%', height: '100vh', overflow: 'hidden', position: 'relative', 
      background: wallBg,
      backgroundSize: wallBgSize,
      backgroundRepeat: wallBgRepeat,
      backgroundPosition: 'center'
    }}>
      
      {/* Lecteur Iframe du mur */}
      <iframe
        src={iframeUrl}
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          border: 'none', background: 'transparent',
          zIndex: 1
        }}
        title="Mur de mots"
      />

    </div>
  );
}
