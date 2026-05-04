import { useState, useEffect } from 'react';
import styles from './InstallPWA.module.css';
import { Download, X } from 'lucide-react';

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Capture the install prompt before it fires
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show if not already installed and user hasn't dismissed
      if (!localStorage.getItem('pwa_install_dismissed')) {
        setVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);

    // If already installed, don't show
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;
    if (isStandalone) setVisible(false);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setVisible(false);
    localStorage.setItem('pwa_install_dismissed', '1');
  };

  if (!visible) return null;

  return (
    <div className={styles.banner}>
      <div className={styles.inner}>
        <div className={styles.icon}>🎁</div>
        <div className={styles.text}>
          <div className={styles.title}>Installer myKado</div>
          <div className={styles.sub}>Accès rapide depuis votre écran d'accueil</div>
        </div>
        <button className={styles.btnInstall} onClick={handleInstall}>
          <Download size={15} /> Installer
        </button>
        <button className={styles.btnClose} onClick={handleDismiss} aria-label="Fermer">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
