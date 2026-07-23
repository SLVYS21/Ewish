import React from 'react';
import AnimatedBackground from '../wall/AnimatedBackground';

function getPreviewBgStyle(wallBg, fallback) {
  if (!wallBg) return { background: fallback };
  // If it's a valid CSS background string (color, gradient, or url)
  if (wallBg.startsWith('#') || wallBg.startsWith('rgb') || wallBg.startsWith('linear-gradient') || wallBg.startsWith('radial-gradient') || wallBg.startsWith('url')) {
    return { background: wallBg, backgroundSize: 'cover', backgroundPosition: 'center' };
  }
  return { background: fallback };
}

function WallActivityPreviewA({ isOnline, recipientInitial, bgId, wallBg, style = {} }) {
  return (
    <div style={{ position: 'relative', aspectRatio: '1', ...getPreviewBgStyle(wallBg, 'linear-gradient(155deg,#25315C,#1A2247)'), overflow: 'hidden', ...style }}>
      <AnimatedBackground backgroundId={bgId} previewMode={true} hideEmojis={true} />
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexWrap: 'wrap', alignContent: 'center', justifyContent: 'center', gap: '8px', padding: '20px', zIndex: 2 }}>
        <div style={{ width: '52px', height: '46px', borderRadius: '7px', background: '#FBE6C8', boxShadow: '0 4px 8px rgba(0,0,0,.22)', padding: '7px', transform: 'rotate(-5deg)' }}>
           <div style={{ height: '4px', width: '75%', background: 'rgba(0,0,0,.16)', borderRadius: '2px' }} />
           <div style={{ height: '4px', width: '95%', background: 'rgba(0,0,0,.1)', borderRadius: '2px', marginTop: '4px' }} />
        </div>
        <div style={{ width: '52px', height: '46px', borderRadius: '7px', background: '#F5D6DE', boxShadow: '0 4px 8px rgba(0,0,0,.22)', padding: '7px', transform: 'rotate(4deg)' }}>
           <div style={{ height: '4px', width: '60%', background: 'rgba(0,0,0,.16)', borderRadius: '2px' }} />
           <div style={{ height: '4px', width: '88%', background: 'rgba(0,0,0,.1)', borderRadius: '2px', marginTop: '4px' }} />
        </div>
        <div style={{ width: '52px', height: '46px', borderRadius: '7px', background: '#DCEBDF', boxShadow: '0 4px 8px rgba(0,0,0,.22)', padding: '7px', transform: 'rotate(3deg)' }}>
           <div style={{ height: '4px', width: '80%', background: 'rgba(0,0,0,.16)', borderRadius: '2px' }} />
           <div style={{ height: '4px', width: '70%', background: 'rgba(0,0,0,.1)', borderRadius: '2px', marginTop: '4px' }} />
        </div>
        <div style={{ width: '52px', height: '46px', borderRadius: '7px', background: '#DDE7F5', boxShadow: '0 4px 8px rgba(0,0,0,.22)', padding: '7px', transform: 'rotate(-3deg)' }}>
           <div style={{ height: '4px', width: '70%', background: 'rgba(0,0,0,.16)', borderRadius: '2px' }} />
           <div style={{ height: '4px', width: '92%', background: 'rgba(0,0,0,.1)', borderRadius: '2px', marginTop: '4px' }} />
        </div>
      </div>
      
      <span style={{ position: 'absolute', top: '10px', left: '10px', font: '800 9px "Plus Jakarta Sans", sans-serif', letterSpacing: '.05em', background: isOnline ? '#3FA98A' : 'rgba(255,255,255,0.95)', color: isOnline ? '#fff' : '#161311', padding: '4px 9px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isOnline ? '#fff' : '#161311' }} />
        {isOnline ? 'EN LIGNE' : 'BROUILLON'}
      </span>
      
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '24px 12px 10px', background: 'linear-gradient(to top,rgba(12,15,32,.92),transparent)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', marginLeft: '4px' }}>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#E8A33D', border: '2px solid #1A2247', marginLeft: '-6px', font: '800 9px "Plus Jakarta Sans", sans-serif', color: '#161311', display: 'grid', placeItems: 'center', zIndex: 3 }}>{recipientInitial}</span>
          <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: '#8A63D2', border: '2px solid #1A2247', marginLeft: '-6px', font: '800 9px "Plus Jakarta Sans", sans-serif', color: '#fff', display: 'grid', placeItems: 'center', zIndex: 2 }}>+</span>
        </div>
        <span style={{ font: '800 11px "Plus Jakarta Sans", sans-serif', color: '#fff' }}>Murs</span>
      </div>
    </div>
  );
}

function WallActivityPreviewB({ isOnline, bgId, wallBg, style = {} }) {
  return (
    <div style={{ position: 'relative', aspectRatio: '1', ...getPreviewBgStyle(wallBg, 'linear-gradient(155deg,#F4E7CE,#E9D3A8)'), overflow: 'hidden', ...style }}>
      <AnimatedBackground backgroundId={bgId} previewMode={true} hideEmojis={true} />
      <div style={{ position: 'absolute', top: '24px', left: '50%', width: '120px', height: '96px', borderRadius: '10px', background: '#fff', boxShadow: '0 6px 14px rgba(0,0,0,.16)', transform: 'translateX(-50%) rotate(-9deg)' }} />
      <div style={{ position: 'absolute', top: '20px', left: '50%', width: '120px', height: '96px', borderRadius: '10px', background: '#fff', boxShadow: '0 6px 14px rgba(0,0,0,.16)', transform: 'translateX(-50%) rotate(5deg)' }} />
      <div style={{ position: 'absolute', top: '16px', left: '50%', width: '120px', height: '104px', borderRadius: '10px', background: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,.2)', transform: 'translateX(-50%) rotate(-2deg)', padding: '12px' }}>
        <div style={{ fontFamily: 'var(--display)', fontStyle: 'italic', fontSize: '12px', lineHeight: 1.3, color: '#2A2A2A' }}>« Le meilleur chef qu'on ait eu… »</div>
        <div style={{ font: '800 9px "Plus Jakarta Sans", sans-serif', letterSpacing: '.05em', color: '#9F6D22', marginTop: '8px' }}>— MARINE</div>
      </div>
      <span style={{ position: 'absolute', bottom: '10px', right: '10px', font: '800 10px "Plus Jakarta Sans", sans-serif', background: '#161311', color: '#fff', padding: '4px 10px', borderRadius: '999px' }}>+11 mots</span>
      
      <span style={{ position: 'absolute', top: '10px', left: '10px', font: '800 9px "Plus Jakarta Sans", sans-serif', letterSpacing: '.05em', background: isOnline ? '#3FA98A' : 'rgba(255,255,255,0.95)', color: isOnline ? '#fff' : '#161311', padding: '4px 9px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isOnline ? '#fff' : '#161311' }} />
        {isOnline ? 'EN LIGNE' : 'BROUILLON'}
      </span>
    </div>
  );
}

function WallActivityPreviewC({ isOnline, bgId, wallBg, style = {} }) {
  return (
    <div style={{ position: 'relative', aspectRatio: '1', ...getPreviewBgStyle(wallBg, 'linear-gradient(155deg,#3B2E52,#241A38)'), overflow: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', ...style }}>
      <AnimatedBackground backgroundId={bgId} previewMode={true} hideEmojis={true} />
      <div style={{ position: 'relative', width: '96px', height: '96px' }}>
        <svg width="96" height="96" viewBox="0 0 96 96" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="48" cy="48" r="42" fill="none" stroke="rgba(255,255,255,.14)" strokeWidth="9"/>
          <circle cx="48" cy="48" r="42" fill="none" stroke="#E8A33D" strokeWidth="9" strokeLinecap="round" strokeDasharray="264" strokeDashoffset="88"/>
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ font: '800 22px "Plus Jakarta Sans", sans-serif', color: '#fff', lineHeight: 1 }}>8</span>
          <span style={{ font: '700 9px "Plus Jakarta Sans", sans-serif', color: 'rgba(255,255,255,.6)' }}>/ 12</span>
        </div>
      </div>
      <span style={{ font: '700 11px "Plus Jakarta Sans", sans-serif', color: '#F2D68A' }}>ont laissé leur mot</span>
      <div style={{ display: 'flex' }}>
        <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#E8A33D', border: '2px solid #241A38', marginLeft: '-6px', font: '800 10px "Plus Jakarta Sans", sans-serif', color: '#161311', display: 'grid', placeItems: 'center', zIndex: 3 }}>A</span>
        <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#3FA98A', border: '2px solid #241A38', marginLeft: '-6px', font: '800 10px "Plus Jakarta Sans", sans-serif', color: '#fff', display: 'grid', placeItems: 'center', zIndex: 2 }}>M</span>
        <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#F35C7A', border: '2px solid #241A38', marginLeft: '-6px', font: '800 10px "Plus Jakarta Sans", sans-serif', color: '#fff', display: 'grid', placeItems: 'center', zIndex: 1 }}>Y</span>
        <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'rgba(255,255,255,.16)', border: '2px solid #241A38', marginLeft: '-6px', font: '800 9px "Plus Jakarta Sans", sans-serif', color: '#fff', display: 'grid', placeItems: 'center', zIndex: 0 }}>+5</span>
      </div>
      
      <span style={{ position: 'absolute', top: '10px', left: '10px', font: '800 9px "Plus Jakarta Sans", sans-serif', letterSpacing: '.05em', background: isOnline ? '#3FA98A' : 'rgba(255,255,255,0.95)', color: isOnline ? '#fff' : '#161311', padding: '4px 9px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isOnline ? '#fff' : '#161311' }} />
        {isOnline ? 'EN LIGNE' : 'BROUILLON'}
      </span>
    </div>
  );
}

function WallActivityPreviewD({ isOnline, bgId, wallBg, style = {} }) {
  return (
    <div style={{ position: 'relative', aspectRatio: '1', ...getPreviewBgStyle(wallBg, 'linear-gradient(155deg,#FCE1C0,#F6C98D)'), overflow: 'hidden', ...style }}>
      <AnimatedBackground backgroundId={bgId} previewMode={true} hideEmojis={true} />
      <div style={{ position: 'absolute', top: '50%', left: '50%', width: '280px', height: '280px', margin: '-140px 0 0 -140px', background: 'repeating-conic-gradient(from 0deg,rgba(255,255,255,.35) 0 10deg,transparent 10deg 20deg)', animation: 'mkSunA 70s linear infinite' }} />
      <div style={{ position: 'absolute', left: '50%', bottom: '14px', transform: 'translateX(-50%)', animation: 'mkBob 3s ease-in-out infinite' }}>
        <div style={{ position: 'absolute', left: '50%', bottom: '-6px', transform: 'translateX(-50%)', width: '74px', height: '12px', borderRadius: '50%', background: 'rgba(120,70,10,.28)', filter: 'blur(4px)' }} />
        <svg width="112" height="120" viewBox="0 0 112 120">
          <ellipse cx="56" cy="112" rx="34" ry="6" fill="#2B2440" opacity="0.12"/>
          <rect x="24" y="52" width="64" height="46" rx="11" fill="#FF5470"/>
          <rect x="49" y="52" width="14" height="46" fill="#FFC145"/>
          <rect x="18" y="40" width="76" height="17" rx="8" fill="#E63E5C"/>
          <rect x="49" y="40" width="14" height="17" fill="#FFB02E"/>
          <path d="M56 40 C44 26 27 30 31 39 C35 47 49 45 56 40 Z" fill="#FFC145"/>
          <path d="M56 40 C68 26 85 30 81 39 C77 47 63 45 56 40 Z" fill="#FFC145"/>
          <circle cx="56" cy="40" r="6" fill="#FFB02E"/>
          <circle cx="46" cy="70" r="4.2" fill="#2B2440"/>
          <circle cx="66" cy="70" r="4.2" fill="#2B2440"/>
          <path d="M49 78 Q56 85 63 78" stroke="#2B2440" strokeWidth="3" fill="none" strokeLinecap="round"/>
          <ellipse cx="38" cy="77" rx="5" ry="3.2" fill="#FFB3C0"/>
          <ellipse cx="74" cy="77" rx="5" ry="3.2" fill="#FFB3C0"/>
        </svg>
      </div>
      
      <span style={{ position: 'absolute', top: '10px', left: '10px', font: '800 9px "Plus Jakarta Sans", sans-serif', letterSpacing: '.05em', background: isOnline ? '#3FA98A' : 'rgba(255,255,255,0.95)', color: isOnline ? '#fff' : '#161311', padding: '4px 9px', borderRadius: '999px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: isOnline ? '#fff' : '#161311' }} />
        {isOnline ? 'EN LIGNE' : 'BROUILLON'}
      </span>
    </div>
  );
}

export function WallActivityPreview({ pub, style = {} }) {
  const isOnline = pub.published;
  const recipientInitial = (pub.data?.titleName || pub.data?.recipient || pub.title || 'M').charAt(0).toUpperCase();
  
  const bgId = pub?.style?.styleBgPreset || pub?.style?.wallBackgroundId || 'bg-blob';
  const wallBg = pub?.style?.wallBackground || '';
  
  // Choose variation based on pub._id hash so it stays consistent
  const idStr = pub._id || '123';
  const charCode = idStr.charCodeAt(idStr.length - 1) || 0;
  const mod = charCode % 4;

  if (mod === 1) return <WallActivityPreviewB isOnline={isOnline} bgId={bgId} wallBg={wallBg} style={style} />;
  if (mod === 2) return <WallActivityPreviewC isOnline={isOnline} bgId={bgId} wallBg={wallBg} style={style} />;
  if (mod === 3) return <WallActivityPreviewD isOnline={isOnline} bgId={bgId} wallBg={wallBg} style={style} />;
  
  return <WallActivityPreviewA isOnline={isOnline} recipientInitial={recipientInitial} bgId={bgId} wallBg={wallBg} style={style} />;
}

export function WallThemePreview({ templateName, style = {} }) {
  if (templateName === 'wall-of-wishes') {
    // Design F - Aperçu Épingles
    return (
      <div style={{ position: 'relative', aspectRatio: '1.14', background: 'linear-gradient(160deg,#233152,#18213F)', overflow: 'hidden', padding: '16px', ...style }}>
        <div style={{ columns: 2, columnGap: '10px' }}>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '9px', marginBottom: '10px', boxShadow: '0 6px 12px rgba(0,0,0,.28)', breakInside: 'avoid' }}>
            <div style={{ height: '4px', width: '90%', background: 'rgba(0,0,0,.15)', borderRadius: '2px' }} />
            <div style={{ height: '4px', width: '70%', background: 'rgba(0,0,0,.1)', borderRadius: '2px', marginTop: '4px' }} />
            <div style={{ height: '4px', width: '80%', background: 'rgba(0,0,0,.1)', borderRadius: '2px', marginTop: '4px' }} />
          </div>
          <div style={{ background: '#FBE6C8', borderRadius: '8px', padding: '9px', marginBottom: '10px', boxShadow: '0 6px 12px rgba(0,0,0,.28)', breakInside: 'avoid' }}>
            <div style={{ height: '4px', width: '75%', background: 'rgba(0,0,0,.15)', borderRadius: '2px' }} />
            <div style={{ height: '4px', width: '92%', background: 'rgba(0,0,0,.1)', borderRadius: '2px', marginTop: '4px' }} />
          </div>
          <div style={{ background: '#fff', borderRadius: '8px', padding: '9px', marginBottom: '10px', boxShadow: '0 6px 12px rgba(0,0,0,.28)', breakInside: 'avoid' }}>
            <div style={{ height: '4px', width: '85%', background: 'rgba(0,0,0,.15)', borderRadius: '2px' }} />
            <div style={{ height: '4px', width: '60%', background: 'rgba(0,0,0,.1)', borderRadius: '2px', marginTop: '4px' }} />
          </div>
          <div style={{ background: '#F5D6DE', borderRadius: '8px', padding: '9px', boxShadow: '0 6px 12px rgba(0,0,0,.28)', breakInside: 'avoid' }}>
            <div style={{ height: '4px', width: '95%', background: 'rgba(0,0,0,.15)', borderRadius: '2px' }} />
            <div style={{ height: '4px', width: '72%', background: 'rgba(0,0,0,.1)', borderRadius: '2px', marginTop: '4px' }} />
            <div style={{ height: '4px', width: '84%', background: 'rgba(0,0,0,.1)', borderRadius: '2px', marginTop: '4px' }} />
          </div>
        </div>
      </div>
    );
  }

  // Design E - Aperçu Mosaïque
  return (
    <div style={{ position: 'relative', aspectRatio: '1.14', background: '#F3ECDD', overflow: 'hidden', padding: '16px', ...style }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px', alignContent: 'center', justifyContent: 'center', height: '100%' }}>
        <div style={{ width: '56px', height: '50px', borderRadius: '8px', background: '#FBE6C8', boxShadow: '0 4px 8px rgba(0,0,0,.12)', padding: '8px', transform: 'rotate(-4deg)' }}>
          <div style={{ height: '4px', width: '78%', background: 'rgba(0,0,0,.16)', borderRadius: '2px' }} />
          <div style={{ height: '4px', width: '95%', background: 'rgba(0,0,0,.1)', borderRadius: '2px', marginTop: '4px' }} />
        </div>
        <div style={{ width: '56px', height: '50px', borderRadius: '8px', background: '#F5D6DE', boxShadow: '0 4px 8px rgba(0,0,0,.12)', padding: '8px', transform: 'rotate(3deg)' }}>
          <div style={{ height: '4px', width: '65%', background: 'rgba(0,0,0,.16)', borderRadius: '2px' }} />
          <div style={{ height: '4px', width: '88%', background: 'rgba(0,0,0,.1)', borderRadius: '2px', marginTop: '4px' }} />
        </div>
        <div style={{ width: '56px', height: '50px', borderRadius: '8px', background: '#DDE7F5', boxShadow: '0 4px 8px rgba(0,0,0,.12)', padding: '8px', transform: 'rotate(2deg)' }}>
          <div style={{ height: '4px', width: '82%', background: 'rgba(0,0,0,.16)', borderRadius: '2px' }} />
          <div style={{ height: '4px', width: '70%', background: 'rgba(0,0,0,.1)', borderRadius: '2px', marginTop: '4px' }} />
        </div>
        <div style={{ width: '56px', height: '50px', borderRadius: '8px', background: '#DCEBDF', boxShadow: '0 4px 8px rgba(0,0,0,.12)', padding: '8px', transform: 'rotate(-3deg)' }}>
          <div style={{ height: '4px', width: '72%', background: 'rgba(0,0,0,.16)', borderRadius: '2px' }} />
          <div style={{ height: '4px', width: '90%', background: 'rgba(0,0,0,.1)', borderRadius: '2px', marginTop: '4px' }} />
        </div>
      </div>
    </div>
  );
}
