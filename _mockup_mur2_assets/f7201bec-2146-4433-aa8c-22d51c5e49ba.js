/* ============================================================
   myKado · Wall app — icon set + Noto animated-emoji helper
   ============================================================ */

const _i = (paths, props = {}) => (extra = {}) => {
  const { size = 20, stroke = 'currentColor', sw = 1.8, fill = 'none', ...rest } = { ...props, ...extra };
  return React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill,
    stroke, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', ...rest,
  }, paths.map((d, k) => React.createElement('path', { key: k, d })));
};
const _ic = (children, props = {}) => (extra = {}) => {
  const { size = 20, stroke = 'currentColor', sw = 1.8, fill = 'none', ...rest } = { ...props, ...extra };
  return React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill,
    stroke, strokeWidth: sw, strokeLinecap: 'round', strokeLinejoin: 'round', ...rest,
  }, children);
};

const Icon = {
  plus:    _i(['M12 5v14', 'M5 12h14']),
  arrowR:  _i(['M5 12h14', 'm12 5 7 7-7 7']),
  arrowL:  _i(['M19 12H5', 'm12 19-7-7 7-7']),
  chevR:   _i(['m9 18 6-6-6-6']),
  chevD:   _i(['m6 9 6 6 6-6']),
  chevUp:  _i(['m18 15-6-6-6 6']),
  check:   _i(['M20 6 9 17l-5-5']),
  x:       _i(['M18 6 6 18', 'm6 6 12 12']),
  search:  _ic([React.createElement('circle',{key:0,cx:11,cy:11,r:8}), React.createElement('path',{key:1,d:'m21 21-4.3-4.3'})]),
  heart:   _i(['M19 14c1.5-1.5 3-3.4 3-5.5A4.5 4.5 0 0 0 12 6 4.5 4.5 0 0 0 2 8.5c0 2.1 1.5 4 3 5.5l7 7Z']),
  gift:    _ic([React.createElement('rect',{key:0,x:3,y:8,width:18,height:4,rx:1}),React.createElement('path',{key:1,d:'M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8M16.5 8a2.5 2.5 0 0 0 0-5C13 3 12 8 12 8'})]),
  sparkle: _i(['M12 3l1.6 4.6L18 9l-4.4 1.4L12 15l-1.6-4.6L6 9l4.4-1.4Z','M19 14l.7 2 .3.6']),
  qr:      _ic([React.createElement('rect',{key:0,x:3,y:3,width:7,height:7,rx:1}),React.createElement('rect',{key:1,x:14,y:3,width:7,height:7,rx:1}),React.createElement('rect',{key:2,x:3,y:14,width:7,height:7,rx:1}),React.createElement('path',{key:3,d:'M14 14h3v3M21 14v.01M14 21h.01M21 17v4h-4'})]),
  link:    _i(['M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1','M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1']),
  image:   _ic([React.createElement('rect',{key:0,x:3,y:3,width:18,height:18,rx:2}),React.createElement('circle',{key:1,cx:9,cy:9,r:2}),React.createElement('path',{key:2,d:'m21 15-5-5L5 21'})]),
  mic:     _ic([React.createElement('rect',{key:0,x:9,y:2,width:6,height:12,rx:3}),React.createElement('path',{key:1,d:'M5 10a7 7 0 0 0 14 0M12 17v4M8 21h8'})]),
  music:   _i(['M9 18V5l12-2v13','M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z']),
  play:    _i(['M6 4l14 8-14 8Z']),
  pause:   _i(['M6 4h4v16H6zM14 4h4v16h-4z']),
  send:    _i(['M22 2 11 13','M22 2 15 22l-4-9-9-4Z']),
  share:   _ic([React.createElement('circle',{key:0,cx:18,cy:5,r:3}),React.createElement('circle',{key:1,cx:6,cy:12,r:3}),React.createElement('circle',{key:2,cx:18,cy:19,r:3}),React.createElement('path',{key:3,d:'m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5'})]),
  copy:    _ic([React.createElement('rect',{key:0,x:9,y:9,width:12,height:12,rx:2}),React.createElement('path',{key:1,d:'M5 15a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2'})]),
  lock:    _ic([React.createElement('rect',{key:0,x:4,y:11,width:16,height:10,rx:2}),React.createElement('path',{key:1,d:'M8 11V7a4 4 0 0 1 8 0v4'})]),
  wall:    _ic([React.createElement('rect',{key:0,x:3,y:4,width:18,height:16,rx:2}),React.createElement('path',{key:1,d:'M3 9h18M3 14h18M8 4v5M14 9v5M10 14v6'})]),
  smile:   _ic([React.createElement('circle',{key:0,cx:12,cy:12,r:9}),React.createElement('path',{key:1,d:'M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01'})]),
  sticker: _i(['M15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h9l7-7V5a2 2 0 0 0-2-2Z','M14 21v-5a2 2 0 0 1 2-2h5']),
  pen:     _i(['M12 20h9','M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z']),
  users:   _i(['M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2','M22 21v-2a4 4 0 0 0-3-3.9','M16 3.1a4 4 0 0 1 0 7.8']),
  star:    _i(['M12 3l2.6 5.6L21 9.3l-4.5 4.3 1.1 6.1L12 17l-5.6 2.7 1.1-6.1L3 9.3l6.4-.7Z']),
  forward: _i(['M13 17l5-5-5-5M6 17l5-5-5-5']),
  volume:  _i(['M11 5 6 9H2v6h4l5 4V5Z','M15.5 8.5a5 5 0 0 1 0 7M19 5a9 9 0 0 1 0 14']),
};

/* ── Noto animated-emoji: 512px looping GIF, with emoji fallback ── */
const NOTO = (code) => (typeof window !== 'undefined' && window.__resources && window.__resources[code]) || `https://fonts.gstatic.com/s/e/notoemoji/latest/${code}/512.gif`;
function Anim({ code, char, size = 48, style, className }) {
  const [ok, setOk] = React.useState(true);
  if (!ok) return <span className={className} style={{ fontSize: size * 0.82, lineHeight: 1, ...style }}>{char}</span>;
  return <img className={className} src={NOTO(code)} width={size} height={size} alt=""
    style={{ display: 'block', objectFit: 'contain', ...style }} onError={() => setOk(false)} />;
}

Object.assign(window, { Icon, Anim, NOTO });
