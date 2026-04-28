import { useState } from 'react';
import styles from './ClientTab.module.css';

export default function ClientTab({ order, pubId, templateName, onImportAll }) {
  const [copiedKey, setCopiedKey] = useState(null);

  const directFormUrl = `${window.location.origin}/form-client.html?pub=${pubId}&t=${templateName}`;

  if (!order) {
    return (
      <div className={styles.root}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>📭</span>
          <h3>Aucune commande liée</h3>
          <p className={styles.subtitle}>
            Cette publication n'est liée à aucune commande classique. 
          </p>
          <div style={{ marginTop: '24px', background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', textAlign: 'left', width: '100%' }}>
            <p style={{ fontSize: '0.85rem', marginBottom: '8px', color: 'var(--brand)' }}><strong>Lien direct du formulaire :</strong></p>
            <p style={{ fontSize: '0.75rem', marginBottom: '12px', opacity: 0.8 }}>Envoyez ce lien au client pour qu'il remplisse ses informations. Ses réponses apparaîtront ici.</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input type="text" readOnly value={directFormUrl} style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)', background: '#000', color: '#fff', fontSize: '0.75rem' }} />
              <button 
                className={styles.copyBtn} 
                style={{ padding: '8px 12px', background: 'var(--brand)', color: '#000' }}
                onClick={() => { navigator.clipboard.writeText(directFormUrl); setCopiedKey('url'); setTimeout(() => setCopiedKey(null), 2000); }}
              >
                {copiedKey === 'url' ? '✓ Copié' : 'Copier'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { templateData, client, senderName, recipientName } = order;

  if (!templateData || Object.keys(templateData).length === 0) {
    return (
      <div className={styles.root}>
        <div className={styles.empty}>
          <span className={styles.emptyIcon}>⏳</span>
          <h3>Formulaire en attente</h3>
          <p className={styles.subtitle}>
            La commande existe mais le client n'a pas encore soumis ses informations via le formulaire.
          </p>
        </div>
      </div>
    );
  }

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isImageUrl = (val) => {
    if (typeof val !== 'string') return false;
    return val.startsWith('http') && (val.includes('res.cloudinary.com') || val.match(/\.(jpeg|jpg|gif|png|webp)$/i));
  };

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          Données Client
        </h2>
        <p className={styles.subtitle}>
          Commande de <strong>{senderName || client?.firstName || 'Client'}</strong> pour <strong>{recipientName || 'Destinataire'}</strong>.
        </p>
      </div>

      <button className={styles.importBtn} onClick={() => onImportAll(templateData)}>
        <span>⚡️</span> Tout importer dans l'éditeur
      </button>

      <div className={styles.fieldsList}>
        {Object.entries(templateData).map(([key, value]) => {
          if (!value) return null; // Ignorer les champs vides

          return (
            <div key={key} className={styles.fieldItem}>
              <div className={styles.fieldHeader}>
                <span className={styles.fieldKey}>{key}</span>
                <button
                  className={styles.copyBtn}
                  onClick={() => handleCopy(value, key)}
                  title="Copier la valeur"
                >
                  {copiedKey === key ? '✓ Copié' : 'Copier'}
                </button>
              </div>
              <div className={styles.fieldValue}>
                {value}
              </div>
              {isImageUrl(value) && (
                <img src={value} alt={key} className={styles.imgPreview} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
