import { useState, useEffect } from 'react';
import PageShell from '../components/PageShell';
import { getSettings, updateSettings } from '../../utils/api';
import { Save, Phone, MessageSquare } from 'lucide-react';
import s from './SuperAdminSettings.module.css';

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState({
    wa_support_phone: '',
    wa_support_message: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getSettings().then(res => {
      setSettings(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await updateSettings(settings);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className={s.loading}>Chargement...</div>;

  return (
    <PageShell title="Configuration" subtitle="Paramètres généraux de la plateforme">
      <div className={s.container}>
        <form className={s.card} onSubmit={handleSave}>
          <div className={s.section}>
            <h3><Phone size={18} /> Support WhatsApp</h3>
            <p className={s.desc}>Configurez le numéro et le message par défaut pour le bouton de support flottant.</p>
            
            <div className={s.field}>
              <label>Numéro de téléphone WhatsApp</label>
              <div className={s.inputWrap}>
                <input 
                  type="text" 
                  value={settings.wa_support_phone} 
                  onChange={e => setSettings({...settings, wa_support_phone: e.target.value})}
                  placeholder="+22901XXXXXXXX"
                />
              </div>
              <span className={s.hint}>Inclure l'indicatif pays (ex: +229)</span>
            </div>

            <div className={s.field}>
              <label>Message par défaut</label>
              <div className={s.inputWrap}>
                <textarea 
                  rows={4}
                  value={settings.wa_support_message} 
                  onChange={e => setSettings({...settings, wa_support_message: e.target.value})}
                  placeholder="Bonjour, j'ai besoin d'aide..."
                />
              </div>
              <span className={s.hint}>Ce message sera pré-rempli dans la conversation WhatsApp de l'utilisateur.</span>
            </div>
          </div>

          <div className={s.footer}>
            {success && <span className={s.successMsg}>Paramètres enregistrés !</span>}
            <button type="submit" className={s.saveBtn} disabled={saving}>
              <Save size={18} /> {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </PageShell>
  );
}
