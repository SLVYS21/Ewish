import React from 'react';
import Decor from '../Decor';

export default function BackPage({ theme, texts }) {
  const cfg = theme.back;

  return (
    <div className="ce-page ce-back" style={{
      width: '100%', height: '100%',
      background: cfg.background,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {cfg.decor?.map((d, i) => <Decor key={i} spec={d} />)}

      <div style={{
        position: 'absolute',
        bottom: '10%',
        left: 0, right: 0,
        textAlign: cfg.footer.align,
        fontFamily: cfg.footer.font,
        color: cfg.footer.color,
        fontSize: `${cfg.footer.size}px`,
        textTransform: cfg.footer.transform,
        letterSpacing: cfg.footer.letterSpacing,
      }}>
        {texts.backNote}
      </div>
    </div>
  );
}
