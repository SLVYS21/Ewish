import React from 'react';
import './AnimatedBackgrounds.css';
import NotoEmoji from '../components/NotoEmoji';

const BG_EMOJIS = {
  'bg-blob': ['sparkles', 'balloon', 'party-popper', 'heart'],
  'bg-polka': ['balloon', 'sparkles', 'clinking-glasses', 'confetti-ball'],
  'bg-bokeh': ['sparkling-heart', 'star', 'magic-wand', 'cherry-blossom'],
  'bg-comic': ['rocket', 'fire', 'star-struck', 'dizzy'],
  'bg-synthwave': ['alien', 'flying-saucer', 'sparkles', 'comet'],
  'bg-sunburst': ['sun-with-face', 'glowing-star', 'party-popper', 'balloon']
};

function FloatingEmojis({ bgId }) {
  const emojis = BG_EMOJIS[bgId];
  if (!emojis) return null;

  return (
    <div className="ab-corners">
      <div style={{ position: 'absolute', top: '10%', left: '8%', width: '40px', height: '40px', animation: 'mkFloat 4s ease-in-out infinite', opacity: 0.8 }}>
        <NotoEmoji name={emojis[0]} size={40} />
      </div>
      <div style={{ position: 'absolute', top: '15%', right: '8%', width: '30px', height: '30px', animation: 'mkFloat2 5s ease-in-out infinite', opacity: 0.8 }}>
        <NotoEmoji name={emojis[1]} size={30} />
      </div>
      <div style={{ position: 'absolute', bottom: '15%', left: '10%', width: '35px', height: '35px', animation: 'mkDrift 6s ease-in-out infinite', opacity: 0.8 }}>
        <NotoEmoji name={emojis[2]} size={35} />
      </div>
      <div style={{ position: 'absolute', bottom: '10%', right: '10%', width: '45px', height: '45px', animation: 'mkFloat 4.5s ease-in-out infinite 1s', opacity: 0.8 }}>
        <NotoEmoji name={emojis[3]} size={45} />
      </div>
    </div>
  );
}

export default function AnimatedBackground({ backgroundId, previewMode, hideEmojis }) {
  const safeBackgroundId = ['bg-blob', 'bg-polka', 'bg-bokeh', 'bg-comic', 'bg-synthwave', 'bg-sunburst'].includes(backgroundId) 
    ? backgroundId 
    : null;

  const renderBackground = () => {
    switch (safeBackgroundId) {
      case 'bg-blob':
        return (
          <div className="ab-container" style={{ background: 'linear-gradient(155deg,#243157 0%,#1A234A 45%,#141B3B 100%)' }}>
            <div style={{ position: 'absolute', top: '-60px', left: '-40px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle,#3A4C8A,transparent 70%)', filter: 'blur(38px)', animation: 'mkBlobA 12s ease-in-out infinite' }}></div>
            <div style={{ position: 'absolute', bottom: '20px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(232,163,61,.55),transparent 70%)', filter: 'blur(42px)', animation: 'mkBlobB 14s ease-in-out infinite' }}></div>
            <div style={{ position: 'absolute', bottom: '-70px', left: '30px', width: '240px', height: '240px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(138,99,210,.5),transparent 70%)', filter: 'blur(40px)', animation: 'mkBlobA 16s ease-in-out infinite 2s' }}></div>
          </div>
        );
      case 'bg-polka':
        return (
          <div className="ab-container" style={{ background: 'linear-gradient(160deg,#F0B24C,#E4922B)' }}>
            <div style={{ position: 'absolute', inset: '-20px', backgroundImage: 'radial-gradient(rgba(255,255,255,.42) 3.4px,transparent 4px),radial-gradient(rgba(58,36,16,.14) 3.4px,transparent 4px)', backgroundSize: '26px 26px,26px 26px', backgroundPosition: '0 0,13px 13px', animation: 'mkDots 5.5s linear infinite' }}></div>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 48%,rgba(255,251,242,.55),transparent 52%)' }}></div>
          </div>
        );
      case 'bg-bokeh':
        return (
          <div className="ab-container" style={{ background: 'radial-gradient(120% 90% at 50% 15%,#3A2450 0%,#241634 55%,#160D22 100%)' }}>
            <div style={{ position: 'absolute', top: '120px', left: '40px', width: '90px', height: '90px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(242,214,138,.55),transparent 70%)', filter: 'blur(6px)', animation: 'mkFloat 7s ease-in-out infinite' }}></div>
            <div style={{ position: 'absolute', top: '240px', right: '36px', width: '130px', height: '130px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(214,164,220,.4),transparent 70%)', filter: 'blur(8px)', animation: 'mkFloat2 9s ease-in-out infinite 1s' }}></div>
            <div style={{ position: 'absolute', bottom: '180px', left: '24px', width: '70px', height: '70px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,.35),transparent 70%)', filter: 'blur(5px)', animation: 'mkDrift 8s ease-in-out infinite .5s' }}></div>
            <div style={{ position: 'absolute', bottom: '120px', right: '60px', width: '50px', height: '50px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(242,214,138,.5),transparent 70%)', filter: 'blur(4px)', animation: 'mkFloat 6s ease-in-out infinite 1.5s' }}></div>
            <div style={{ position: 'absolute', top: '340px', left: '120px', width: '34px', height: '34px', borderRadius: '50%', background: 'radial-gradient(circle,rgba(255,255,255,.4),transparent 70%)', filter: 'blur(3px)', animation: 'mkFloat2 7.5s ease-in-out infinite' }}></div>
          </div>
        );
      case 'bg-comic':
        return (
          <div className="ab-container" style={{ background: '#F2D24C' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '250vmax', height: '250vmax', margin: '-125vmax 0 0 -125vmax', background: 'repeating-conic-gradient(from 0deg,#161311 0 2.2deg,transparent 2.2deg 8deg)', opacity: .9, animation: 'mkZoom 3.6s ease-in-out infinite' }}></div>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 48%,#F2D24C 0%,#F2D24C 24%,transparent 42%)' }}></div>
          </div>
        );
      case 'bg-synthwave':
        return (
          <div className="ab-container" style={{ background: 'linear-gradient(180deg,#1A1140 0%,#2A1550 46%,#3E1C5E 58%,#160D22 100%)' }}>
            <div style={{ position: 'absolute', top: '150px', left: '50%', transform: 'translateX(-50%)', width: '180px', height: '180px', borderRadius: '50%', background: 'radial-gradient(circle,#F2D68A 0%,#E8A33D 45%,rgba(232,163,61,0) 72%)', filter: 'blur(2px)' }}></div>
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '340px', overflow: 'hidden', perspective: '280px' }}>
              <div style={{ position: 'absolute', left: '-50%', right: '-50%', bottom: '-40px', height: '520px', backgroundImage: 'linear-gradient(rgba(232,163,61,.55) 2px,transparent 2px),linear-gradient(90deg,rgba(232,163,61,.55) 2px,transparent 2px)', backgroundSize: '52px 52px', transform: 'rotateX(66deg)', transformOrigin: 'bottom center', animation: 'mkGrid 2.4s linear infinite' }}></div>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg,#160D22 0%,transparent 34%,transparent 78%,rgba(22,13,34,.7))' }}></div>
            </div>
          </div>
        );
      case 'bg-sunburst':
        return (
          <div className="ab-container" style={{ background: '#1B2450' }}>
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '250vmax', height: '250vmax', margin: '-125vmax 0 0 -125vmax', background: 'repeating-conic-gradient(from 0deg,#2C3A6E 0 10deg,#1C264F 10deg 20deg)', animation: 'mkSunA 78s linear infinite' }}></div>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 46%,rgba(232,163,61,.18) 0%,transparent 46%),radial-gradient(circle at 50% 48%,rgba(15,18,40,.5) 0%,transparent 62%),radial-gradient(circle at 50% 120%,transparent 55%,rgba(11,14,32,.72))' }}></div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {renderBackground()}
      {(!previewMode && !hideEmojis) && <FloatingEmojis bgId={safeBackgroundId} />}
    </>
  );
}
