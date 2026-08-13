import React from 'react';
import Decor from '../Decor';

/**
 * Page 3 — inside right, main message + signature.
 *
 * The message area shrinks its font gracefully once beyond a soft threshold.
 * The container is scrollable if the (adjusted) content still overflows —
 * matches the "digital scroll / print auto-fit" behaviour spec.
 */
export default function InsideRightPage({ theme, texts }) {
  const cfg = theme.insideRight;

  const messageLen = (texts.message || '').length;
  const scale = messageLen > 500 ? 0.78
             : messageLen > 350 ? 0.86
             : messageLen > 220 ? 0.92
             : 1;

  return (
    <div className="ce-page ce-inside-right" style={{
      width: '100%', height: '100%',
      background: cfg.background,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {cfg.decor?.map((d, i) => <Decor key={i} spec={d} />)}

      <div style={{
        position: 'absolute',
        inset: '14% 12% 20% 12%',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <div
          className="ce-message-scroll"
          onClick={(e) => e.stopPropagation()}
          onWheel={(e) => e.stopPropagation()}
          style={{
            flex: 1,
            overflowY: 'auto',
            fontFamily: cfg.message.font,
            color: cfg.message.color,
            fontSize: `${cfg.message.size * scale}px`,
            lineHeight: cfg.message.lineHeight,
            textAlign: cfg.message.align,
            whiteSpace: 'pre-wrap',
            padding: '4px 2px',
            cursor: 'text',
          }}
        >
          {texts.message}
        </div>

        <div style={{
          fontFamily: cfg.signature.font,
          color: cfg.signature.color,
          fontSize: `${cfg.signature.size}px`,
          textAlign: cfg.signature.align,
          fontStyle: cfg.signature.italic ? 'italic' : 'normal',
          marginTop: '16px',
        }}>
          {texts.signature}
        </div>
      </div>
    </div>
  );
}
