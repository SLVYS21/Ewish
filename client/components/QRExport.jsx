import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import html2canvas from 'html2canvas';
import {
  Modal, Button, Icon, useToast,
} from '../design-system';

/**
 * myKado — Export QR (composant unifié réutilisable)
 *
 * Respect règles UX (notes/ux-rules.md §4) :
 * - 3 formes en gros boutons visuels (coeur, carré, cercle)
 * - Fonds simples visibles d'un coup d'œil
 * - Preview live grand format
 * - Actions nommées par usage ("Pour un téléphone", "Pour un mur imprimé")
 * - Aucun jargon technique (SVG/DPI/vectoriel)
 *
 * <QRExport
 *   open={open}
 *   onClose={close}
 *   url="https://mykado.co/c/amina-30-ans"
 *   defaultTitle="Amina — 30 ans"
 * />
 */

const SHAPES = [
  { id: 'square', label: 'Carré',  icon: 'Square', preview: 'square' },
  { id: 'circle', label: 'Cercle', icon: 'Circle', preview: 'circle' },
  { id: 'heart',  label: 'Cœur',   icon: 'Heart',  preview: 'heart'  },
];

const BACKGROUNDS = [
  { id: 'white',  label: 'Blanc classique', bg: '#FFFFFF',            fg: 'var(--mk-stone-900)', kind: 'solid' },
  { id: 'cream',  label: 'Crème doux',      bg: 'var(--mk-stone-50)', fg: 'var(--mk-stone-900)', kind: 'solid' },
  { id: 'indigo', label: 'Indigo brand',    bg: 'var(--mk-indigo-700)', fg: '#FFFFFF',           kind: 'solid' },
  { id: 'motif',  label: 'Motif afro-modern', bg: '#FFFFFF',           fg: 'var(--mk-stone-900)', kind: 'motif' },
];

const SIZE_PRESETS = [
  { id: 'phone',  label: 'Pour un téléphone',   size: 480,  filename: 'mykado-qr-telephone' },
  { id: 'card',   label: 'Pour une carte imprimée', size: 800,  filename: 'mykado-qr-carte' },
  { id: 'poster', label: 'Pour une affiche',    size: 1600, filename: 'mykado-qr-affiche' },
];

export default function QRExport({ open, onClose, url, defaultTitle = '' }) {
  const [shape, setShape] = useState('square');
  const [bgId, setBgId] = useState('white');
  const [title, setTitle] = useState(defaultTitle);
  const [size, setSize] = useState('card');
  const [downloading, setDownloading] = useState(false);
  const { toast } = useToast();

  const qrHostRef = useRef(null);
  const captureRef = useRef(null);
  const qrCodeRef = useRef(null);

  const bg = BACKGROUNDS.find((b) => b.id === bgId) || BACKGROUNDS[0];

  useEffect(() => {
    if (!open || !url || !qrHostRef.current) return;
    // Init once
    if (!qrCodeRef.current) {
      qrCodeRef.current = new QRCodeStyling({
        width: 280,
        height: 280,
        data: url,
        margin: 0,
        qrOptions: { errorCorrectionLevel: 'H' },
        dotsOptions: { type: 'rounded', color: '#161311' },
        cornersSquareOptions: { type: 'extra-rounded', color: '#161311' },
        cornersDotOptions: { type: 'dot', color: '#161311' },
        backgroundOptions: { color: 'transparent' },
      });
      qrHostRef.current.innerHTML = '';
      qrCodeRef.current.append(qrHostRef.current);
    } else {
      qrCodeRef.current.update({ data: url });
    }
  }, [open, url]);

  // Update colors when background changes
  useEffect(() => {
    if (!qrCodeRef.current) return;
    const dotColor = bg.id === 'indigo' ? '#FFFFFF' : '#161311';
    qrCodeRef.current.update({
      dotsOptions: { type: 'rounded', color: dotColor },
      cornersSquareOptions: { type: 'extra-rounded', color: dotColor },
      cornersDotOptions: { type: 'dot', color: dotColor },
    });
  }, [bg.id]);

  const handleDownload = async (preset) => {
    if (!captureRef.current) return;
    setDownloading(true);
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: null,
        scale: preset.size / 320,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${preset.filename}.png`;
      link.click();
      toast.success({ title: 'Image téléchargée', message: preset.label });
    } catch (err) {
      toast.error({ title: 'Erreur', message: 'Impossible de télécharger' });
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (typeof navigator.share !== 'function') {
      await navigator.clipboard?.writeText(url);
      toast.success({ title: 'Lien copié', message: 'Colle-le où tu veux' });
      return;
    }
    try {
      await navigator.share({ url, title: title || 'myKado' });
    } catch { /* user cancelled */ }
  };

  const handlePrint = () => {
    const w = window.open('', '_blank', 'width=800,height=900');
    if (!w || !captureRef.current) return;
    const html = captureRef.current.outerHTML;
    w.document.write(`
      <html><head><title>${title || 'myKado QR'}</title>
      <style>body{margin:0;display:flex;align-items:center;justify-content:center;height:100vh;font-family:Inter,sans-serif}</style>
      </head><body>${html}</body></html>
    `);
    w.document.close();
    setTimeout(() => w.print(), 300);
  };

  const clipPath = shape === 'heart'
    ? 'path("M160 280 C 40 210, 20 130, 60 90 C 100 50, 140 70, 160 100 C 180 70, 220 50, 260 90 C 300 130, 280 210, 160 280 Z")'
    : shape === 'circle'
      ? 'circle(48% at 50% 50%)'
      : 'none';

  return (
    <Modal open={open} onClose={onClose} title="Exporter en QR code" size="lg">
      <Modal.Body>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }} className="mk-qr-export">
          <style>{`
            @media (min-width: 768px) {
              .mk-qr-export { grid-template-columns: 320px 1fr !important; }
            }
          `}</style>

          {/* PREVIEW */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div
              ref={captureRef}
              style={{
                width: 320,
                height: 320,
                background: bg.bg,
                clipPath,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--mk-shadow-md)',
                borderRadius: shape === 'square' ? 'var(--mk-radius-lg)' : 0,
                padding: 20,
              }}
            >
              {bg.kind === 'motif' && (
                <div
                  aria-hidden
                  style={{
                    position: 'absolute',
                    inset: 0,
                    color: 'var(--mk-action-accent-gold)',
                    opacity: 0.08,
                    backgroundImage: `url("data:image/svg+xml;utf8,${encodeURIComponent(
                      '<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\' viewBox=\'0 0 80 80\' fill=\'none\' stroke=\'%23E8A33D\' stroke-width=\'1\'><path d=\'M40 12 L52 40 L40 68 L28 40 Z\'/></svg>'
                    )}")`,
                  }}
                />
              )}
              <div ref={qrHostRef} style={{ position: 'relative', zIndex: 1 }} />
              {title && (
                <div
                  className="mk-body-strong"
                  style={{
                    marginTop: 12,
                    color: bg.fg,
                    textAlign: 'center',
                    fontSize: 14,
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: 260,
                    wordBreak: 'break-word',
                  }}
                >
                  {title}
                </div>
              )}
            </div>
            <div className="mk-caption" style={{ color: 'var(--mk-text-tertiary)' }}>
              Aperçu — c'est ce qui sera téléchargé
            </div>
          </div>

          {/* OPTIONS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {/* Forme */}
            <div>
              <div className="mk-overline" style={{ marginBottom: 12 }}>Forme</div>
              <div style={{ display: 'flex', gap: 12 }}>
                {SHAPES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setShape(s.id)}
                    style={{
                      flex: 1,
                      padding: 16,
                      background: shape === s.id ? 'var(--mk-indigo-50)' : 'var(--mk-surface-base)',
                      border: `2px solid ${shape === s.id ? 'var(--mk-action-primary)' : 'var(--mk-border-default)'}`,
                      borderRadius: 'var(--mk-radius-md)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      transition: 'all var(--mk-motion-hover)',
                    }}
                  >
                    <Icon name={s.icon} size="lg" color={shape === s.id ? 'var(--mk-text-brand)' : 'var(--mk-text-secondary)'} />
                    <div className="mk-body-sm" style={{ color: shape === s.id ? 'var(--mk-text-brand)' : 'var(--mk-text-secondary)', fontWeight: shape === s.id ? 600 : 500 }}>
                      {s.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Fond */}
            <div>
              <div className="mk-overline" style={{ marginBottom: 12 }}>Fond</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {BACKGROUNDS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBgId(b.id)}
                    style={{
                      padding: '12px 14px',
                      background: bgId === b.id ? 'var(--mk-indigo-50)' : 'var(--mk-surface-base)',
                      border: `2px solid ${bgId === b.id ? 'var(--mk-action-primary)' : 'var(--mk-border-default)'}`,
                      borderRadius: 'var(--mk-radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      textAlign: 'left',
                    }}
                  >
                    <span
                      aria-hidden
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 6,
                        border: '1px solid var(--mk-border-default)',
                        background: b.bg,
                        flexShrink: 0,
                      }}
                    />
                    <span className="mk-body-sm" style={{ fontWeight: bgId === b.id ? 600 : 400 }}>
                      {b.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Titre optionnel */}
            <div>
              <div className="mk-overline" style={{ marginBottom: 12 }}>Titre en dessous (optionnel)</div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex : Amina — 30 ans"
                maxLength={40}
                className="mk-input"
              />
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer style={{ flexDirection: 'column', alignItems: 'stretch', gap: 16 }}>
        <div className="mk-overline" style={{ textAlign: 'center' }}>Télécharger — choisis l'usage</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {SIZE_PRESETS.map((preset) => (
            <Button
              key={preset.id}
              variant={preset.id === size ? 'primary' : 'tertiary'}
              size="md"
              onClick={() => { setSize(preset.id); handleDownload(preset); }}
              disabled={downloading}
              iconLeft="Download"
            >
              {preset.label}
            </Button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
          <Button variant="ghost" iconLeft="Share2" onClick={handleShare}>Partager</Button>
          <Button variant="ghost" iconLeft="Printer" onClick={handlePrint}>Imprimer</Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
