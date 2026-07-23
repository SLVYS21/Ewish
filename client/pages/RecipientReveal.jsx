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
  const iframeUrl = `/site/${pub.templateName}/${pub.customName}${isGuest ? '?collect=1' : '?previewMode=false&noanim=1'}`;

  // Icône animée Noto Emoji
  const revealIconCode = pub?.style?.revealIcon || '1f381';
  
  const recipientName = pub?.recipient || pub?.title || 'Toi';

  const renderRevealEffects = () => {
    if (bgId === 'bg-comic') {
      return (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 46%,#F2D24C 0%,#F2D24C 20%,transparent 40%)', zIndex: 1, pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', inset: 0, background: '#fff', zIndex: 8, animation: 'mkRevFlash 5.5s ease-in-out infinite', pointerEvents: 'none' }}></div>
        </>
      );
    }
    if (bgId === 'bg-sunburst') {
      return (
        <>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 46%,rgba(232,163,61,.22) 0%,transparent 46%),radial-gradient(circle at 50% 120%,transparent 55%,rgba(11,14,32,.72))', zIndex: 1, pointerEvents: 'none' }}></div>
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle,rgba(255,255,255,.9),transparent 40%)', zIndex: 8, animation: 'mkRevFlash 5.5s ease-in-out infinite', pointerEvents: 'none' }}></div>
        </>
      );
    }
    return (
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)', zIndex: 0, pointerEvents: 'none' }} />
    );
  };

  const renderRevealContent = () => {
    if (pub?.style?.revealMascot) {
      return (
        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 200, height: 200, display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
            <div style={{ position: 'absolute', top: '50%', left: '-20%', width: '140%', transform: 'translateY(-10px)', zIndex: 4, animation: 'mkSpeedShow 5.5s ease-in-out infinite' }}>
              <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.28)', margin: '9px 0', width: '90%', animation: 'mkStreak .5s ease-in-out infinite' }} />
              <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.2)', margin: '9px 0', width: '70%', animation: 'mkStreak .5s ease-in-out infinite .1s' }} />
              <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.24)', margin: '9px 0', width: '80%', animation: 'mkStreak .5s ease-in-out infinite .05s' }} />
            </div>
            <div style={{ position: 'absolute', top: '63%', left: '50%', transform: 'translateX(-50%)', width: 170, height: 30, borderRadius: '50%', background: 'rgba(0,0,0,0.18)', filter: 'blur(5px)', zIndex: 4, animation: 'mkGroundPulse 5.5s ease-in-out infinite' }} />
            <div style={{ animation: 'mkMascotRun 5.5s ease-in-out infinite', transformOrigin: 'center bottom', zIndex: 6 }}>
              <svg width="178" viewBox="395 190 410 500" xmlns="http://www.w3.org/2000/svg">
                <g style={{ transformBox: 'fill-box', transformOrigin: 'center top', animation: 'mkLegSwing .34s ease-in-out infinite' }}><rect x="503" y="592" width="30" height="50" rx="15" fill="#E63E5C"></rect><ellipse cx="512" cy="646" rx="26" ry="14" fill="#2B2440"></ellipse></g>
                <g style={{ transformBox: 'fill-box', transformOrigin: 'center top', animation: 'mkLegSwingB .34s ease-in-out infinite' }}><rect x="667" y="592" width="30" height="50" rx="15" fill="#E63E5C"></rect><ellipse cx="688" cy="646" rx="26" ry="14" fill="#2B2440"></ellipse></g>
                <g style={{ transformBox: 'fill-box', transformOrigin: 'right top', animation: 'mkLegSwingB .34s ease-in-out infinite' }}><rect x="392" y="430" width="46" height="24" rx="12" fill="#E63E5C"></rect></g>
                <g style={{ transformBox: 'fill-box', transformOrigin: 'left top', animation: 'mkLegSwing .34s ease-in-out infinite' }}><rect x="762" y="430" width="46" height="24" rx="12" fill="#E63E5C"></rect></g>
                <rect x="420" y="360" width="360" height="240" rx="52" fill="#FF5470"></rect>
                <rect x="560" y="360" width="80" height="240" fill="#FFC145"></rect>
                <rect x="360" y="288" width="480" height="92" rx="46" fill="#E63E5C"></rect>
                <rect x="560" y="288" width="80" height="92" fill="#FFB02E"></rect>
                <path d="M600 286 C540 210 450 226 470 274 C490 316 566 306 600 286 Z" fill="#FFC145"></path>
                <path d="M600 286 C660 210 750 226 730 274 C710 316 634 306 600 286 Z" fill="#FFC145"></path>
                <circle cx="600" cy="286" r="34" fill="#FFB02E"></circle>
                <circle cx="520" cy="470" r="22" fill="#2B2440"></circle>
                <circle cx="680" cy="470" r="22" fill="#2B2440"></circle>
                <circle cx="527" cy="463" r="7" fill="#fff"></circle>
                <circle cx="687" cy="463" r="7" fill="#fff"></circle>
                <path d="M550 512 Q600 556 650 512" stroke="#2B2440" strokeWidth="15" fill="none" strokeLinecap="round"></path>
                <ellipse cx="470" cy="508" rx="26" ry="17" fill="#FFB3C0"></ellipse>
                <ellipse cx="730" cy="508" rx="26" ry="17" fill="#FFB3C0"></ellipse>
              </svg>
            </div>
          </div>
          <div style={{ textAlign: 'center', animation: 'mkRevTitle 5.5s ease-in-out infinite' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{ position: 'absolute', inset: 0, transform: 'translate(5px,6px) rotate(-2deg)', background: '#2B2440', borderRadius: 7 }}></div>
              <div style={{ position: 'relative', transform: 'rotate(-2deg)', background: '#FF5470', border: '3px solid #2B2440', borderRadius: 7, padding: '9px 22px', font: '800 28px "Plus Jakarta Sans"', color: '#fff' }}>SURPRISE&nbsp;!</div>
            </div>
            <div style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 21, color: '#2B2440', marginTop: 18, maxWidth: '26ch', marginInline: 'auto' }}>
              Kado t'apporte de jolis mots
            </div>
            <button onClick={handleOpen} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18, background: '#2B2440', color: '#fff', borderRadius: 99, padding: '11px 20px', fontWeight: 800, fontSize: 13, fontFamily: 'var(--body)', cursor: 'pointer', border: 'none', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              Découvrir <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </div>
        </div>
      );
    }
    
    if (bgId === 'bg-comic') {
      return (
        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
          <div style={{ position: 'relative', width: 200, height: 200, display: 'grid', placeItems: 'center' }}>
            <div style={{ position: 'absolute', width: 170, height: 170, borderRadius: '50%', border: '5px solid #C13B3B', animation: 'mkRevRing 5.5s ease-out infinite' }}></div>
            <img src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${revealIconCode}/512.gif`} alt="" style={{ position: 'absolute', width: 150, height: 150, filter: 'drop-shadow(0 16px 16px rgba(120,70,10,.4))', animation: 'mkRevGift 5.5s ease-in-out infinite' }} />
            <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f389/512.gif" alt="" style={{ position: 'absolute', width: 150, height: 150, filter: 'drop-shadow(0 16px 16px rgba(120,70,10,.4))', animation: 'mkRevPop 5.5s ease-in-out infinite' }} />
          </div>
          <div style={{ textAlign: 'center', animation: 'mkRevTitle 5.5s ease-in-out infinite', marginTop: 6 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{ position: 'absolute', inset: 0, transform: 'translate(5px,6px) rotate(-2deg)', background: '#161311', borderRadius: 7 }}></div>
              <div style={{ position: 'relative', transform: 'rotate(-2deg)', background: '#C13B3B', border: '3px solid #161311', borderRadius: 7, padding: '9px 22px', font: '800 30px "Plus Jakarta Sans"', color: '#fff' }}>SURPRISE&nbsp;!</div>
            </div>
            <div style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 22, color: '#161311', marginTop: 20 }}>Le mur de {recipientName} t'attend</div>
            <button onClick={handleOpen} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, background: '#161311', color: '#F2D24C', borderRadius: 99, padding: '11px 20px', fontWeight: 800, fontSize: 13, fontFamily: 'var(--body)', cursor: 'pointer', border: 'none', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              Ouvrir le mur <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </div>
        </div>
      );
    }
    
    if (bgId === 'bg-synthwave') {
      return (
        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 180, height: 180, display: 'grid', placeItems: 'center', marginTop: -30 }}>
            <img src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${revealIconCode}/512.gif`} alt="" style={{ position: 'absolute', width: 130, height: 130, filter: 'drop-shadow(0 16px 18px rgba(0,0,0,.5))', animation: 'mkRevGift 5.5s ease-in-out infinite' }} />
            <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/2728/512.gif" alt="" style={{ position: 'absolute', width: 130, height: 130, filter: 'drop-shadow(0 16px 18px rgba(0,0,0,.5))', animation: 'mkRevPop 5.5s ease-in-out infinite' }} />
          </div>
          <div style={{ textAlign: 'center', animation: 'mkRevTitle 5.5s ease-in-out infinite' }}>
            <div style={{ font: '800 11px "Plus Jakarta Sans"', letterSpacing: '.24em', textTransform: 'uppercase', color: '#E8A33D' }}>Joyeux anniversaire</div>
            <div style={{ fontFamily: 'Fraunces', fontSize: 46, lineHeight: 1, color: '#fff', marginTop: 8, textShadow: '0 0 24px rgba(232,163,61,.5)' }}>{recipientName}</div>
            <button onClick={handleOpen} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 22, background: '#E8A33D', color: '#160D22', borderRadius: 99, padding: '11px 20px', fontWeight: 800, fontSize: 13, fontFamily: 'var(--body)', boxShadow: '0 0 28px rgba(232,163,61,.5)', cursor: 'pointer', border: 'none', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              Entrer dans le mur <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </div>
        </div>
      );
    }
    
    if (bgId === 'bg-sunburst') {
      return (
        <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ position: 'relative', width: 190, height: 190, display: 'grid', placeItems: 'center' }}>
            <div style={{ position: 'absolute', width: 170, height: 170, borderRadius: '50%', border: '5px solid rgba(232,163,61,.8)', animation: 'mkRevRing 5.5s ease-out infinite' }}></div>
            <img src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${revealIconCode}/512.gif`} alt="" style={{ position: 'absolute', width: 140, height: 140, filter: 'drop-shadow(0 16px 18px rgba(0,0,0,.5))', animation: 'mkRevGift 5.5s ease-in-out infinite' }} />
            <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f973/512.gif" alt="" style={{ position: 'absolute', width: 140, height: 140, filter: 'drop-shadow(0 16px 18px rgba(0,0,0,.5))', animation: 'mkRevPop 5.5s ease-in-out infinite' }} />
          </div>
          <div style={{ textAlign: 'center', animation: 'mkRevTitle 5.5s ease-in-out infinite', marginTop: 8 }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <div style={{ position: 'absolute', inset: 0, transform: 'translate(5px,6px) rotate(-2deg)', background: '#0E1230', borderRadius: 7 }}></div>
              <div style={{ position: 'relative', transform: 'rotate(-2deg)', background: '#E8A33D', border: '3px solid #0E1230', borderRadius: 7, padding: '9px 22px', font: '800 28px "Plus Jakarta Sans"', color: '#161311' }}>TON MUR EST PRÊT</div>
            </div>
            <div style={{ fontFamily: 'Fraunces', fontStyle: 'italic', fontSize: 20, color: '#fff', marginTop: 18, maxWidth: '24ch', marginInline: 'auto' }}>Un superbe cadeau t'attend</div>
            <button onClick={handleOpen} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 18, background: '#fff', color: '#1B2450', borderRadius: 99, padding: '11px 20px', fontWeight: 800, fontSize: 13, fontFamily: 'var(--body)', cursor: 'pointer', border: 'none', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
              Découvrir <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </div>
        </div>
      );
    }
    
    // Default Layout
    return (
      <div style={{ zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 180, height: 180, display: 'grid', placeItems: 'center', marginBottom: 24 }}>
          <img src={`https://fonts.gstatic.com/s/e/notoemoji/latest/${revealIconCode}/512.gif`} alt="" style={{ position: 'absolute', width: 140, height: 140, filter: 'drop-shadow(0 16px 18px rgba(0,0,0,.5))', animation: 'mkRevGift 5.5s ease-in-out infinite' }} />
          <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/2728/512.gif" alt="" style={{ position: 'absolute', width: 140, height: 140, filter: 'drop-shadow(0 16px 18px rgba(0,0,0,.5))', animation: 'mkRevPop 5.5s ease-in-out infinite' }} />
        </div>
        <div style={{ textAlign: 'center', animation: 'mkRevTitle 5.5s ease-in-out infinite', marginTop: 8 }}>
          <h1 style={{ fontFamily: 'var(--display)', fontSize: 42, color: '#fff', margin: '0 0 4px 0', textShadow: '0 4px 20px rgba(0,0,0,0.4)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Pour {recipientName}
          </h1>
          <button onClick={handleOpen} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 16, background: '#fff', color: '#161311', borderRadius: 99, padding: '11px 20px', fontWeight: 800, fontSize: 13, fontFamily: 'var(--body)', cursor: 'pointer', border: 'none', boxShadow: '0 8px 20px rgba(0,0,0,0.2)', transition: 'transform 0.2s' }} onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'} onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            Ouvrir le mur <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M9 6l6 6-6 6"/></svg>
          </button>
        </div>
      </div>
    );
  };
  
  // Emoji d'arrière-plan selon l'occasion
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
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          transition: 'opacity 0.8s ease',
          opacity: fade ? 0 : 1,
          overflow: 'hidden'
        }}>
          
          <AnimatedBackground backgroundId={bgId} previewMode={false} hideEmojis={!(pub?.style?.revealEmojis ?? true)} />
          
          <style>{`
            @keyframes mkRevGift{0%{transform:scale(.55) rotate(-9deg);opacity:0}10%{transform:scale(1.06) rotate(0);opacity:1}20%{transform:scale(1) rotate(-4deg)}30%{transform:scale(1.04) rotate(4deg)}44%{transform:scale(1) rotate(0);opacity:1}52%{transform:scale(0) rotate(0);opacity:0}100%{transform:scale(0);opacity:0}}
            @keyframes mkRevPop{0%,50%{transform:scale(0);opacity:0}62%{transform:scale(1.18);opacity:1}84%{transform:scale(1);opacity:1}95%,100%{transform:scale(1);opacity:0}}
            @keyframes mkRevTitle{0%,56%{opacity:0;transform:translateY(26px)}72%{opacity:1;transform:translateY(0)}90%{opacity:1;transform:translateY(0)}99%,100%{opacity:0;transform:translateY(-8px)}}
            @keyframes mkRevFlash{0%,50%{opacity:0}55%{opacity:.85}68%{opacity:0}100%{opacity:0}}
            @keyframes mkRevRing{0%,50%{transform:scale(.3);opacity:0}58%{opacity:.55}80%{transform:scale(1.7);opacity:0}100%{opacity:0}}
          `}</style>
          
          {renderRevealEffects()}
          
          {!opened ? renderRevealContent() : (
            <div style={{ 
              animation: 'mk-zoom-in 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
              textAlign: 'center', zIndex: 1
            }}>
              <h2 style={{ 
                fontFamily: 'var(--display)', 
                fontSize: 64, color: '#fff', margin: '0 0 16px 0',
                textShadow: '0 4px 40px rgba(255,255,255,0.5), 0 2px 10px rgba(0,0,0,0.2)',
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
        @keyframes mkMascotRun {
          0% { transform: translate(-330px,0) scale(.4); opacity: 0; }
          10% { opacity: 1; }
          40% { transform: translate(0,0) scale(1); }
          47% { transform: translate(0,-26px) scale(1.03); }
          55% { transform: translate(0,0) scale(1); }
          90% { transform: translate(0,0) scale(1); opacity: 1; }
          98% { transform: translate(0,-8px) scale(.98); opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes mkLegSwing {
          0%, 100% { transform: rotate(22deg); }
          50% { transform: rotate(-22deg); }
        }
        @keyframes mkLegSwingB {
          0%, 100% { transform: rotate(-22deg); }
          50% { transform: rotate(22deg); }
        }
        @keyframes mkSpeedShow {
          0% { opacity: 0; }
          10% { opacity: .9; }
          34% { opacity: .9; }
          44% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes mkStreak {
          0% { transform: translateX(34px); }
          100% { transform: translateX(-34px); }
        }
        @keyframes mkGroundPulse {
          0%, 100% { transform: translateX(-50%) scale(1); }
          47% { transform: translateX(-50%) scale(.82); }
          55% { transform: translateX(-50%) scale(1); }
        }
      `}</style>
    </div>
  );
}
