import React from 'react';
import Decor from '../Decor';
import { LucideImage } from 'lucide-react';

const FRAME_RADIUS = {
  circle:  '50%',
  oval:    '50% / 45%',
  rounded: '14px',
  square:  '0',
};

export default function InsideLeftPage({ theme, texts, photo }) {
  const cfg = theme.insideLeft;
  const frame = cfg.photoFrame;
  const radius = FRAME_RADIUS[frame.shape] || '0';

  return (
    <div className="ce-page ce-inside-left" style={{
      width: '100%', height: '100%',
      background: cfg.background,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {cfg.decor?.map((d, i) => <Decor key={i} spec={d} />)}

      <div style={{
        position: 'absolute',
        inset: '22% 15% 22% 15%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '20px',
      }}>
        <div style={{
          width: '100%',
          aspectRatio: '3 / 4',
          borderRadius: radius,
          background: '#F4EDE3',
          border: `${frame.borderWidth}px solid ${frame.borderColor}`,
          padding: `${frame.padding}px`,
          boxShadow: '0 8px 20px rgba(0,0,0,0.08)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            width: '100%', height: '100%',
            borderRadius: `calc(${radius} - ${frame.padding}px)`,
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: photo ? '#000' : 'linear-gradient(135deg, #F5EEE2, #E8DCC6)',
          }}>
            {photo ? (
              <img src={photo} alt="souvenir"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                draggable={false} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: frame.borderColor, opacity: 0.55, gap: '6px' }}>
                <LucideImage size={32} />
                <span style={{ fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase' }}>Photo souvenir</span>
              </div>
            )}
          </div>
        </div>

        {texts.photoCaption && (
          <div style={{
            fontFamily: frame.caption.font,
            color: frame.caption.color,
            fontSize: `${frame.caption.size}px`,
            textAlign: 'center',
            lineHeight: 1.2,
          }}>
            {texts.photoCaption}
          </div>
        )}
      </div>
    </div>
  );
}
