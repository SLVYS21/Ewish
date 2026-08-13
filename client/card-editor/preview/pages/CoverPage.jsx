import React from 'react';
import Decor from '../Decor';

/**
 * Cover — Page 1
 *
 * Base 400x560 (5:7 portrait). Consumers scale via CSS transform.
 *
 * When decor is placed on the right/left column, the text block
 * shrinks to the remaining side (theme-defined via title.align).
 */
export default function CoverPage({ theme, texts }) {
  const cfg = theme.cover;

  // If a decor takes a lateral column, keep text on the opposite side.
  const rightDecor = cfg.decor?.find(d => d.position === 'right');
  const leftDecor  = cfg.decor?.find(d => d.position === 'left');
  const align = cfg.title?.align || 'center';

  let textBoxStyle = {
    position: 'absolute',
    inset: '20% 10%',
    textAlign: align,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  };

  if (rightDecor) {
    const width = 100 - (rightDecor.size ?? 55);
    textBoxStyle = { ...textBoxStyle, inset: `12% auto 12% 8%`, width: `${width - 2}%` };
  } else if (leftDecor) {
    const width = 100 - (leftDecor.size ?? 55);
    textBoxStyle = { ...textBoxStyle, inset: `12% 8% 12% auto`, width: `${width - 2}%` };
  } else {
    textBoxStyle = { ...textBoxStyle, inset: '18% 12%' };
  }

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: cfg.background,
      position: 'relative',
      overflow: 'hidden',
    }} className="ce-page ce-cover">
      {cfg.decor?.map((d, i) => <Decor key={i} spec={d} />)}

      <div style={textBoxStyle}>
        <div style={{
          fontFamily: cfg.subtitle.font,
          color: cfg.subtitle.color,
          fontSize: `${cfg.subtitle.size}px`,
          lineHeight: 1,
          marginBottom: '10px',
          textAlign: align,
        }}>
          {texts.subtitle}
        </div>
        <div style={{
          fontFamily: cfg.title.font,
          color: cfg.title.color,
          fontSize: `${cfg.title.size}px`,
          fontWeight: cfg.title.weight,
          textTransform: cfg.title.transform,
          letterSpacing: cfg.title.letterSpacing,
          lineHeight: 1.15,
          textAlign: align,
        }}>
          {texts.title}
        </div>
      </div>
    </div>
  );
}
