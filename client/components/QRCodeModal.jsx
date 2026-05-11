import React, { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import html2canvas from 'html2canvas';
import { X, Heart, Square, Circle, LayoutGrid } from 'lucide-react';
import styles from './QRCodeModal.module.css';

export default function QRCodeModal({ url, onClose }) {
  const [shape, setShape] = useState('heart'); // Global outline shape
  const [styleType, setStyleType] = useState('rounded'); // 'square', 'rounded', 'dots', 'classy'
  const [qrColor, setQrColor] = useState('#e60000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [isTransparent, setIsTransparent] = useState(true);
  const [qrSrc, setQrSrc] = useState('');
  
  const qrCode = useRef(null);
  const captureRef = useRef(null);

  useEffect(() => {
    qrCode.current = new QRCodeStyling({
      width: 240,
      height: 240,
      data: url,
      margin: 0,
      qrOptions: {
        typeNumber: 0,
        mode: "Byte",
        errorCorrectionLevel: "H" // High error correction needed for shapes like Heart
      },
      imageOptions: {
        hideBackgroundDots: true,
        imageSize: 0.4,
        margin: 0
      }
    });
    
    updateQR();
  }, []);

  useEffect(() => {
    updateQR();
  }, [url, qrColor, bgColor, isTransparent, styleType]);

  const updateQR = async () => {
    if (!qrCode.current) return;
    
    let dotsType = 'square';
    let cornersSquareType = 'square';
    let cornersDotType = 'square';

    if (styleType === 'rounded') {
      dotsType = 'rounded';
      cornersSquareType = 'extra-rounded';
      cornersDotType = 'dot';
    } else if (styleType === 'dots') {
      dotsType = 'dots';
      cornersSquareType = 'dot';
      cornersDotType = 'dot';
    } else if (styleType === 'classy') {
      dotsType = 'classy-rounded';
      cornersSquareType = 'extra-rounded';
      cornersDotType = 'dot';
    }

    qrCode.current.update({
      data: url,
      dotsOptions: {
        color: qrColor,
        type: dotsType
      },
      backgroundOptions: {
        color: isTransparent ? 'transparent' : bgColor,
      },
      cornersSquareOptions: {
        color: qrColor,
        type: cornersSquareType
      },
      cornersDotOptions: {
        color: qrColor,
        type: cornersDotType
      }
    });

    try {
      const blob = await qrCode.current.getRawData("png");
      if (blob) {
        setQrSrc(URL.createObjectURL(blob));
      }
    } catch (e) {
      console.error("Erreur lors de la génération du QR", e);
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
      link.download = `qrcode-${shape}-${styleType}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Erreur lors de l'export: ", err);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal} style={{maxHeight: '90vh', overflowY: 'auto'}}>
        <button className={styles.closeBtn} onClick={onClose}>
          <X size={20} />
        </button>
        
        <h2 className={styles.title}>Code QR</h2>
        <p className={styles.subtitle}>Générez un code QR stylisé pour partager votre lien : <br/> <a href={url} target="_blank" rel="noreferrer">{url}</a></p>

        <div className={styles.controls}>
          {/* Global Shape Selector */}
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
              <Square size={20} rx={6} />
              <span>Arrondi</span>
            </div>
            <div className={`${styles.shapeBtn} ${shape === 'circle' ? styles.active : ''}`} onClick={() => setShape('circle')}>
              <Circle size={20} />
              <span>Cercle</span>
            </div>
          </div>

          <div className={styles.divider} />

          {/* Pixels Style Selector */}
          <div className={styles.shapeSelector}>
            <div className={`${styles.shapeBtn} ${styleType === 'square' ? styles.active : ''}`} onClick={() => setStyleType('square')}>
              <Square size={20} />
              <span>Pixels carrés</span>
            </div>
            <div className={`${styles.shapeBtn} ${styleType === 'rounded' ? styles.active : ''}`} onClick={() => setStyleType('rounded')}>
              <Square size={20} rx={6} />
              <span>Pixels arrondis</span>
            </div>
            <div className={`${styles.shapeBtn} ${styleType === 'dots' ? styles.active : ''}`} onClick={() => setStyleType('dots')}>
              <Circle size={20} />
              <span>En points</span>
            </div>
            <div className={`${styles.shapeBtn} ${styleType === 'classy' ? styles.active : ''}`} onClick={() => setStyleType('classy')}>
              <LayoutGrid size={20} />
              <span>Style Classe</span>
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
              {qrSrc && (
                shape === 'heart' ? (
                  <div className={styles.heartWrapper}>
                    <div className={styles.qrPartMain}><img src={qrSrc} alt="QR" /></div>
                    <div className={styles.qrPartLeft}><img src={qrSrc} alt="QR" /></div>
                    <div className={styles.qrPartRight}><img src={qrSrc} alt="QR" /></div>
                  </div>
                ) : (
                  <div className={`${styles.simpleWrapper} ${styles[shape]}`}>
                    <img src={qrSrc} alt="QR" />
                  </div>
                )
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
