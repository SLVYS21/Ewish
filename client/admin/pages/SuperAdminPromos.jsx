import { useState, useEffect } from 'react';
import { getPromos, createPromo, deletePromo } from '../../utils/api';
import PageShell from '../components/PageShell';
import { Plus, Trash2, X } from 'lucide-react';
import s from './SuperAdminPromos.module.css';

export default function SuperAdminPromos() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  
  const [form, setForm] = useState({
    code: '',
    description: '',
    type: 'percent',
    value: 10,
    maxUses: 1,
  });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getPromos();
      setPromos(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: form.code,
        description: form.description,
        type: form.type,
        value: form.value,
        maxUses: form.maxUses > 0 ? form.maxUses : null,
      };

      await createPromo(payload);
      setModalOpen(false);
      load();
    } catch (err) {
      alert(err.response?.data?.error || 'Erreur lors de la création');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce code promo ?')) return;
    try {
      await deletePromo(id);
      load();
    } catch (e) {
      alert('Erreur lors de la suppression');
    }
  };

  return (
    <PageShell title="Codes Promo" subtitle="Gérer les codes de réduction sur les paiements">
      <div className={s.toolbar}>
        <button className={s.btnPrimary} onClick={() => setModalOpen(true)}>
          <Plus size={18} /> Créer un code
        </button>
      </div>

      <div className={s.tableWrap}>
        {loading ? (
          <div className={s.empty}>Chargement...</div>
        ) : promos.length === 0 ? (
          <div className={s.empty}>Aucun code promo créé.</div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Réduction</th>
                <th>Utilisations</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.map(p => (
                <tr key={p._id}>
                  <td style={{fontWeight: 'bold'}}>{p.code}</td>
                  <td>{p.value}{p.type === 'percent' ? '%' : ' FCFA'}</td>
                  <td>{p.usedCount} / {p.maxUses || '∞'}</td>
                  <td>{p.active ? 'Actif' : 'Inactif'}</td>
                  <td>
                    <button className={s.btnDanger} onClick={() => handleDelete(p._id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className={s.modalOverlay} onClick={() => setModalOpen(false)}>
          <div className={s.modal} onClick={e => e.stopPropagation()}>
            <div className={s.modalHead}>
              <h2>Nouveau Code Promo</h2>
              <button className={s.closeBtn} onClick={() => setModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className={s.field}>
                <label>Code</label>
                <input required className={s.input} value={form.code} onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} placeholder="Ex: WELCOME10" />
              </div>
              <div className={s.field}>
                <label>Description</label>
                <input className={s.input} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Facultatif" />
              </div>

              <div style={{display: 'flex', gap: '10px'}}>
                <div className={s.field} style={{flex: 1}}>
                  <label>Type de réduction</label>
                  <select className={s.input} value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                    <option value="percent">Pourcentage (%)</option>
                    <option value="fixed">Montant Fixe (FCFA)</option>
                  </select>
                </div>
                <div className={s.field} style={{flex: 1}}>
                  <label>Valeur</label>
                  <input type="number" required min="1" className={s.input} value={form.value} onChange={e => setForm({...form, value: parseInt(e.target.value) || 0})} />
                </div>
              </div>

              <div className={s.field}>
                <label>Nombre maximum d'utilisations (0 = illimité)</label>
                <input type="number" required min="0" className={s.input} value={form.maxUses} onChange={e => setForm({...form, maxUses: parseInt(e.target.value) || 0})} />
              </div>

              <div className={s.modalActions}>
                <button type="button" className={s.btnCancel} onClick={() => setModalOpen(false)}>Annuler</button>
                <button type="submit" className={s.btnPrimary}>Créer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
