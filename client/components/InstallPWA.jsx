import { useState, useEffect } from 'react';
import styles from './InstallPWA.module.css';
import { Download, X, Share } from 'lucide-react';

/* ── Detect iOS ─────────────────────────────────────────────── */
function isIOS() {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function isInStandaloneMode() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true
  );
}

export default function InstallPWA() {
  const [show, setShow]               = useState(false);
  const [mode, setMode]               = useState('android'); // 'android' | 'ios'
  const [deferredPrompt, setDeferred] = useState(null);
  const [iosStep, setIosStep]         = useState(0); // 0=intro, 1=step1, 2=step2

  useEffect(() => {
    // Already installed → don't show
    if (isInStandaloneMode()) return;

    // Already dismissed → don't show
    if (localStorage.getItem('pwa_install_dismissed')) return;

    if (isIOS()) {
      setMode('ios');
      // Show iOS instructions after 3s
      const t = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(t);
    }

    // Android / Desktop — wait for native prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferred(e);
      setMode('android');
      setShow(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem('pwa_install_dismissed', '1');
  };

  const handleAndroidInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShow(false);
    setDeferred(null);
  };

  if (!show) return null;

  /* ── iOS banner ── */
  if (mode === 'ios') {
    return (
      <div className={styles.overlay} onClick={dismiss}>
        <div className={styles.iosSheet} onClick={e => e.stopPropagation()}>
          <div className={styles.dragPill} />

          <div className={styles.iosHeader}>
            <div className={styles.appInfo}>
              <div className={styles.appIcon}>🎁</div>
              <div>
                <div className={styles.appName}>myKado</div>
                <div className={styles.appUrl}>app.mykado.store</div>
              </div>
            </div>
            <button className={styles.closeBtn} onClick={dismiss} aria-label="Fermer">
              <X size={16} />
            </button>
          </div>

          <div className={styles.iosTitle}>Installer l'application</div>
          <div className={styles.iosSub}>
            Ajoutez myKado à votre écran d'accueil pour un accès rapide, même hors connexion.
          </div>

          <div className={styles.iosSteps}>
            {/* Step 1 */}
            <div className={styles.iosStep}>
              <div className={styles.iosStepNum}>1</div>
              <div className={styles.iosStepText}>
                Appuyez sur le bouton <strong>Partager</strong>
                <span className={styles.iosShareIcon}>
                  {/* iOS share icon SVG */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                    <polyline points="16 6 12 2 8 6"/>
                    <line x1="12" y1="2" x2="12" y2="15"/>
                  </svg>
                </span>
                en bas de Safari
              </div>
            </div>

            <div className={styles.iosConnector} />

            {/* Step 2 */}
            <div className={styles.iosStep}>
              <div className={styles.iosStepNum}>2</div>
              <div className={styles.iosStepText}>
                Faites défiler et appuyez sur{' '}
                <strong>"Sur l'écran d'accueil"</strong>
                <span className={styles.iosAddIcon}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                    <line x1="12" y1="8" x2="12" y2="16"/>
                    <line x1="8" y1="12" x2="16" y2="12"/>
                  </svg>
                </span>
              </div>
            </div>

            <div className={styles.iosConnector} />

            {/* Step 3 */}
            <div className={styles.iosStep}>
              <div className={styles.iosStepNum}>3</div>
              <div className={styles.iosStepText}>
                Appuyez sur <strong>"Ajouter"</strong> en haut à droite
              </div>
            </div>
          </div>

          {/* Arrow pointing to bottom */}
          <div className={styles.iosArrow}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand,#c9a84c)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <polyline points="19 12 12 19 5 12"/>
            </svg>
            <span>Bouton Partager</span>
          </div>

          <button className={styles.gotItBtn} onClick={dismiss}>
            Compris !
          </button>
        </div>
      </div>
    );
  }

  /* ── Android / Desktop banner ── */
  return (
    <div className={styles.banner}>
      <div className={styles.inner}>
        <div className={styles.icon}>🎁</div>
        <div className={styles.text}>
          <div className={styles.title}>Installer myKado</div>
          <div className={styles.sub}>Accès rapide depuis votre écran d'accueil</div>
        </div>
        <button className={styles.btnInstall} onClick={handleAndroidInstall}>
          <Download size={15} /> Installer
        </button>
        <button className={styles.btnClose} onClick={dismiss} aria-label="Fermer">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
