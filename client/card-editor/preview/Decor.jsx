import React from 'react';
import SvgDecor from './SvgDecor';

/*
 * <Decor spec={{ imageUrl, svg, position, size, opacity, rotate }} />
 *
 * position: fill | top-left | top-center | top-right | center |
 *           bottom-left | bottom-center | bottom-right
 * size:     when position !== 'fill', a percent number (width % of the page)
 *           for oriented positions (top-*, bottom-*, center)
 */

const POSITION_STYLES = {
  'fill':            { inset: 0, width: '100%', height: '100%' },
  'top-left':        { top: 0, left: 0 },
  'top-center':      { top: 0, left: '50%', transform: 'translateX(-50%)' },
  'top-right':       { top: 0, right: 0 },
  'center':          { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' },
  'bottom-left':     { bottom: 0, left: 0 },
  'bottom-center':   { bottom: 0, left: '50%', transform: 'translateX(-50%)' },
  'bottom-right':    { bottom: 0, right: 0 },
  'right':           { top: 0, right: 0, bottom: 0 },  // full-height right column
  'left':            { top: 0, left: 0, bottom: 0 },   // full-height left column
  'stretch-x':       { left: 0, right: 0 },            // full width, positioned by y separately
};

// Where each position wants the image anchored inside its box
const OBJECT_POSITION = {
  'top-left':      'left top',
  'top-center':    'center top',
  'top-right':     'right top',
  'center':        'center center',
  'bottom-left':   'left bottom',
  'bottom-center': 'center bottom',
  'bottom-right':  'right bottom',
  'right':         'right center',
  'left':          'left center',
  'stretch-x':     'center center',
  'fill':          'center center',
};

export default function Decor({ spec }) {
  if (!spec) return null;
  const { imageUrl, svg, position = 'fill', size, opacity = 1, rotate = 0 } = spec;

  const posStyle = POSITION_STYLES[position] || POSITION_STYLES.fill;

  let sizeStyle = {};
  if (position === 'fill') {
    sizeStyle = { width: '100%', height: '100%' };
  } else if (position === 'right' || position === 'left') {
    sizeStyle = { width: size ? `${size}%` : '50%' };
  } else if (position === 'stretch-x') {
    sizeStyle = { height: size ? `${size}%` : 'auto' };
  } else if (size) {
    sizeStyle = { width: `${size}%` };
  }

  const extraTransform = rotate
    ? `${posStyle.transform || ''} rotate(${rotate}deg)`.trim()
    : posStyle.transform;

  const style = {
    position: 'absolute',
    ...posStyle,
    ...sizeStyle,
    ...(extraTransform ? { transform: extraTransform } : {}),
    opacity,
    pointerEvents: 'none',
  };

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt=""
        style={{
          ...style,
          objectFit: 'contain',
          objectPosition: OBJECT_POSITION[position] || 'center',
          display: 'block',
        }}
        draggable={false}
      />
    );
  }
  return (
    <div style={style} aria-hidden="true">
      <SvgDecor kind={svg} />
    </div>
  );
}
