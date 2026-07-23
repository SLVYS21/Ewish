import React, { useState } from 'react';

/* ══════════════════════════════════════════════════════════════════
   NotoEmoji — animated emojis from Google's Noto Emoji Animation
   https://googlefonts.github.io/noto-emoji-animation/
   ──────────────────────────────────────────────────────────────────
   Usage:
     <NotoEmoji name="partying-face" size={32} />
     <NotoEmoji name="party-popper" size={48} loop />
     <NotoEmoji name="sparkles"  size={20} />

   Format : webp (small, animated) by default, gif fallback.
   Respects prefers-reduced-motion — falls back to static PNG.
   ══════════════════════════════════════════════════════════════════ */

/* Curated set — extend as needed */
const CODEPOINTS = {
  'partying-face':      '1f973',
  'party-popper':       '1f389',
  'confetti-ball':      '1f38a',
  'sparkles':           '2728',
  'heart':              '2764_fe0f',
  'red-heart':          '2764_fe0f',
  'pink-heart':         '1fa77',
  'sparkling-heart':    '1f496',
  'growing-heart':      '1f497',
  'two-hearts':         '1f495',
  'gift':               '1f381',
  'wrapped-gift':       '1f381',
  'star':               '2b50',
  'star-struck':        '1f929',
  'smiling-face-hearts':'1f970',
  'heart-eyes':         '1f60d',
  'grinning':           '1f600',
  'grinning-squinting': '1f606',
  'clapping-hands':     '1f44f',
  'raising-hands':      '1f64c',
  'folded-hands':       '1f64f',
  'fire':               '1f525',
  'rocket':             '1f680',
  'rainbow':            '1f308',
  'balloon':            '1f388',
  'birthday-cake':      '1f382',
  'cake':               '1f370',
  'trophy':             '1f3c6',
  'thumbs-up':          '1f44d',
  'ok-hand':            '1f44c',
  'writing-hand':       '270d_fe0f',
  'love-letter':        '1f48c',
  'envelope-heart':     '1f48c',
  'ribbon':             '1f380',
  'lock':               '1f512',
  'unlock':             '1f513',
  'check':              '2705',
  'money-bag':          '1f4b0',
  'money-face':         '1f911',
  'speech-balloon':     '1f4ac',
  'thought-balloon':    '1f4ad',
};

const CDN_BASE = 'https://fonts.gstatic.com/s/e/notoemoji/latest';

/* Detect reduced-motion preference on the client */
function useReducedMotion() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function NotoEmoji({
  name,
  size = 24,
  className = '',
  style = {},
  format = 'webp',        // 'webp' | 'gif' | 'lottie' (webp = smallest animated)
  static: staticOnly = false,
  title,
  onClick,
}) {
  const codepoint = CODEPOINTS[name];
  const [broken, setBroken] = useState(false);
  const reducedMotion = useReducedMotion();

  if (!codepoint) {
    if (typeof console !== 'undefined') {
      console.warn(`[NotoEmoji] unknown name "${name}". Add it to CODEPOINTS.`);
    }
    return null;
  }

  const wantsStatic = staticOnly || reducedMotion;
  const ext = wantsStatic ? 'png' : (format === 'gif' ? 'gif' : 'webp');
  const src = `${CDN_BASE}/${codepoint}/512.${ext}`;
  const fallback = `${CDN_BASE}/${codepoint}/512.gif`;

  if (broken && ext !== 'gif' && !wantsStatic) {
    return (
      <img
        src={fallback}
        alt={title || name}
        width={size}
        height={size}
        className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
        onClick={onClick}
        draggable={false}
      />
    );
  }

  return (
    <img
      src={src}
      alt={title || name}
      width={size}
      height={size}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', ...style }}
      onError={() => setBroken(true)}
      onClick={onClick}
      draggable={false}
      loading="lazy"
      decoding="async"
    />
  );
}

