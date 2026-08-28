import React, { useEffect, useRef, useState } from 'react';
import Decor from '../Decor';

// Typewriter cadence — slower on the first few chars, then steady.
// Total pour ~180 caractères ≈ 4–5s, ce qui reste lisible sans être trop long.
const TYPE_CHAR_MS = 22;
const TYPE_PUNCT_MS = 140;  // pause on . ! ? …
const TYPE_COMMA_MS = 60;   // pause on , ; :
const TYPE_START_DELAY = 220;

/**
 * Page 3 — inside right, main message + signature.
 *
 * The message area shrinks its font gracefully once beyond a soft threshold.
 * The container is scrollable if the (adjusted) content still overflows —
 * matches the "digital scroll / print auto-fit" behaviour spec.
 *
 * When `animateMessage` is true, the message is revealed character by
 * character (typewriter effect). Each time the prop toggles true, the
 * animation restarts from zero. When false (default), the full message
 * is shown instantly — used for print/export and the mirrored back face.
 */
export default function InsideRightPage({ theme, texts, animateMessage = false }) {
  const cfg = theme.insideRight;

  const fullMessage = texts.message || '';
  const messageLen = fullMessage.length;
  const scale = messageLen > 500 ? 0.78
             : messageLen > 350 ? 0.86
             : messageLen > 220 ? 0.92
             : 1;

  const [typed, setTyped] = useState(animateMessage ? '' : fullMessage);
  const timerRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }

    if (!animateMessage) {
      setTyped(fullMessage);
      return;
    }

    let i = 0;
    setTyped('');

    const scheduleNext = (delay) => {
      timerRef.current = setTimeout(() => {
        i += 1;
        setTyped(fullMessage.slice(0, i));
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
        if (i < fullMessage.length) {
          const prev = fullMessage[i - 1];
          const next = fullMessage[i];
          let d = TYPE_CHAR_MS;
          if (/[.!?…]/.test(prev) && (!next || /\s/.test(next))) d = TYPE_PUNCT_MS;
          else if (/[,;:]/.test(prev) && (!next || /\s/.test(next))) d = TYPE_COMMA_MS;
          else if (prev === '\n') d = TYPE_COMMA_MS;
          scheduleNext(d);
        }
      }, delay);
    };

    scheduleNext(TYPE_START_DELAY);

    return () => {
      if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null; }
    };
  }, [animateMessage, fullMessage]);

  const isTyping = animateMessage && typed.length < fullMessage.length;

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
          ref={scrollRef}
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
          {typed}
          {isTyping && (
            <span
              aria-hidden="true"
              style={{
                display: 'inline-block',
                width: '0.06em',
                marginLeft: '0.02em',
                height: '1em',
                verticalAlign: '-0.15em',
                background: cfg.message.color,
                opacity: 0.85,
                animation: 'ce-caret-blink 1s steps(2, start) infinite',
              }}
            />
          )}
        </div>

        <div style={{
          fontFamily: cfg.signature.font,
          color: cfg.signature.color,
          fontSize: `${cfg.signature.size}px`,
          textAlign: cfg.signature.align,
          fontStyle: cfg.signature.italic ? 'italic' : 'normal',
          marginTop: '16px',
          opacity: animateMessage ? (isTyping ? 0 : 1) : 1,
          transition: 'opacity 500ms ease 200ms',
        }}>
          {texts.signature}
        </div>
      </div>
    </div>
  );
}
