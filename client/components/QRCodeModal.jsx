import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import html2canvas from 'html2canvas';
import { X, Heart, Square, Circle } from 'lucide-react';
import styles from './QRCodeModal.module.css';

export default function QRCodeModal({ url, onClose }) {
  const [shape, setShape] = useState('heart');
  const [qrColor, setQrColor] = useState('#e60000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isTransparent, setIsTransparent] = useState(true);
  const [qrSrc, setQrSrc] = useState('');
  
  const captureRef = useRef(null);

  useEffect(() => {
    generateQR();
  }, [url, qrColor, bgColor, isTransparent]);

  const generateQR = async () => {
    try {
      // Use the alpha channel for transparency if enabled (#00000000 for fully transparent)
      const lightColor = isTransparent ? '#00000000' : bgColor;
      
      const src = await QRCode.toDataURL(url, {
        width: 200,
        margin: 0, // margin 0 is REQUIRED to prevent gaps inside the shapes
        color: {
          dark: qrColor,
          light: lightColor
        },
        errorCorrectionLevel: 'H'
      });
      setQrSrc(src);
    } catch (err) {
      console.error(err);
    }
  };

  const handleExport = async () => {
    if (!captureRef.current) return;
    try {
      const canvas = await html2canvas(captureRef.current, {
        backgroundColor: null,
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: true,
        width: captureRef.current.scrollWidth,
        height: captureRef.current.scrollHeight
      });
      
      const link = document.createElement('a');
      link.download = `qrcode-${shape}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Erreur lors de l'export: ", err);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>
        
        <h2 className={styles.title}>Code QR</h2>
        <p className={styles.subtitle}>Générez un code QR stylisé pour partager votre lien : <br/> <a href={url} target="_blank" rel="noreferrer">{url}</a></p>

        <div className={styles.controls}>
          {/* Shape Selector */}
          <div className={styles.shapeSelector}>
            <div className={`${styles.shapeBtn} ${shape === 'heart' ? styles.active : ''}`} onClick={() => setShape('heart')}>
              <Heart size={20} />
              <span>Cœur</span>
            </div>
            <div className={`${styles.shapeBtn} ${shape === 'square' ? styles.active : ''}`} onClick={() => setShape('square')}>
              <Square size={20} />
              <span>Carré</span>
            </div>
            <div className={`${styles.shapeBtn} ${shape === 'rounded' ? styles.active : ''}`} onClick={() => setShape('rounded')}>
              <Square size={20} rx={4} />
              <span>Arrondi</span>
            </div>
            <div className={`${styles.shapeBtn} ${shape === 'circle' ? styles.active : ''}`} onClick={() => setShape('circle')}>
              <Circle size={20} />
              <span>Cercle</span>
            </div>
          </div>

          <div className={styles.divider} />

          {/* Color Selectors */}
          <div className={styles.colorRow}>
            <div className={styles.colorField}>
              <label>Code QR</label>
              <input type="color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} />
            </div>
            
            <div className={styles.colorField}>
              <label>Arrière-plan</label>
              <input 
                type="color" 
                value={bgColor} 
                onChange={(e) => setBgColor(e.target.value)} 
                disabled={isTransparent}
                style={{ opacity: isTransparent ? 0.4 : 1 }}
              />
            </div>
            
            <label className={styles.checkbox}>
              <input 
                type="checkbox" 
                checked={isTransparent} 
                onChange={(e) => setIsTransparent(e.target.checked)} 
              />
              Transparent
            </label>
          </div>
        </div>

        {/* Preview Area */}
        <div className={styles.previewBg}>
          <div className={styles.scaleWrapper}>
            <div className={styles.captureArea} ref={captureRef} style={{ padding: shape === 'heart' ? '80px' : '40px' }}>
              {shape === 'heart' ? (
                <div className={styles.heartWrapper}>
                  <div className={styles.qrPartMain}><img src={qrSrc} alt="QR" /></div>
                  <div className={styles.qrPartLeft}><img src={qrSrc} alt="QR" /></div>
                  <div className={styles.qrPartRight}><img src={qrSrc} alt="QR" /></div>
                </div>
              ) : (
                <div className={`${styles.simpleWrapper} ${styles[shape]}`}>
                  <img src={qrSrc} alt="QR" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button className={styles.btnSecondary} onClick={onClose}>Fermer</button>
          <button className={styles.btnPrimary} onClick={handleExport}>Exporter PNG</button>
        </div>
      </div>
    </div>
  );
}
