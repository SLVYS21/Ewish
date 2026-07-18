import React from 'react';

/**
 * Tooltip — mini info bubble on hover/focus.
 *
 * <Tooltip label="Partager">
 *   <Button variant="ghost" iconOnly icon="Share2" aria-label="Partager" />
 * </Tooltip>
 */
export function Tooltip({ label, side = 'top', children, delay = 300 }) {
  const [visible, setVisible] = React.useState(false);
  const [coords, setCoords] = React.useState({ top: 0, left: 0 });
  const wrapRef = React.useRef(null);
  const timerRef = React.useRef(null);

  const show = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const rect = wrapRef.current?.getBoundingClientRect();
      if (!rect) return;
      const top =
        side === 'bottom'
          ? rect.bottom + 8
          : rect.top - 8;
      const left = rect.left + rect.width / 2;
      setCoords({ top, left });
      setVisible(true);
    }, delay);
  };
  const hide = () => {
    clearTimeout(timerRef.current);
    setVisible(false);
  };

  React.useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <>
      <span
        ref={wrapRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        style={{ display: 'inline-flex' }}
      >
        {children}
      </span>
      {visible && (
        <div
          role="tooltip"
          className="mk-tooltip"
          style={{
            top: coords.top,
            left: coords.left,
            transform:
              side === 'bottom'
                ? 'translate(-50%, 0)'
                : 'translate(-50%, -100%)',
          }}
        >
          {label}
        </div>
      )}
    </>
  );
}

export default Tooltip;
