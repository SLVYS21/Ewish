import { useState, useEffect } from 'react';
import PageShell from '../components/PageShell';
import { getAllSuggestions, getMySuggestions, updateSuggestion, deleteSuggestion, createSuggestion } from '../../utils/api';
import { useAuth } from '../context/AuthContext';
import s from './SuperAdminSuggestions.module.css';

import { 
  Send, Star, Trash2, Edit2, MessageSquare, CheckCircle, 
  Clock, AlertCircle, XCircle, Info, Lightbulb, Bug, Palette, HelpCircle 
} from 'lucide-react';

const STATUS_OPTIONS = ['new', 'read', 'planned', 'done', 'rejected'];
const STATUS_LABELS  = { new: 'Nouveau', read: 'Lu', planned: 'Planifié', done: 'Terminé', rejected: 'Rejeté' };
const STATUS_ICONS   = { 
  new: <Clock size={14} />, 
  read: <Info size={14} />, 
  planned: <Clock size={14} />, 
  done: <CheckCircle size={14} />, 
  rejected: <XCircle size={14} /> 
};
const STATUS_COLORS  = { new: '#3b82f6', read: '#94a3b8', planned: '#f59e0b', done: '#10b981', rejected: '#ef4444' };
const CAT_LABELS = { feature: 'Fonctionnalité', bug: 'Bug', design: 'Design', other: 'Autre' };
const CAT_ICONS = { 
  feature: <Lightbulb size={14} />, 
  bug: <Bug size={14} />, 
  design: <Palette size={14} />, 
  other: <HelpCircle size={14} /> 
};

export default function SuperAdminSuggestions() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role === 'super_admin';

  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded,  setExpanded]  = useState(null); // id of expanded row
  const [noteEdit,  setNoteEdit]  = useState({});   // { [id]: string }
  const [savingNote, setSavingNote] = useState(null);

  // Merchant: new suggestion form
  const [form,    setForm]    = useState({ category: 'feature', message: '' });
  const [sending, setSending] = useState(false);
  const [done,    setDone]    = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const r = isSuperAdmin
        ? await getAllSuggestions({ status: statusFilter || undefined, limit: 100 })
        : await getMySuggestions();
      setItems(isSuperAdmin ? r.data.items : r.data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleStatusChange = async (id, status) => {
    try {
      const r = await updateSuggestion(id, { status });
      setItems(prev => prev.map(x => x._id === id ? r.data : x));
    } catch {}
  };

  const handleSaveNote = async (id) => {
    setSavingNote(id);
    try {
      const r = await updateSuggestion(id, { adminNote: noteEdit[id] ?? '' });
      setItems(prev => prev.map(x => x._id === id ? r.data : x));
    } catch {}
    finally { setSavingNote(null); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette suggestion ?')) return;
    await deleteSuggestion(id);
    setItems(prev => prev.filter(x => x._id !== id));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.message.trim()) return;
    setSending(true);
    try {
      await createSuggestion(form);
      setDone(true); setForm({ category: 'feature', message: '' });
      setTimeout(() => setDone(false), 3000);
      load();
    } catch {}
    finally { setSending(false); }
  };

  const COUNTS = STATUS_OPTIONS.reduce((acc, st) => {
    acc[st] = items.filter(x => x.status === st).length;
    return acc;
  }, {});

  return (
    <PageShell
      title="Suggestions"
      subtitle={isSuperAdmin ? `${items.length} suggestion${items.length !== 1 ? 's' : ''}` : 'Vos idées & retours'}
    >
      {/* ── Merchant: Submit form ── */}
      {!isSuperAdmin && (
        <form className={s.submitForm} onSubmit={handleSubmit}>
          <h3>💡 Soumettre une suggestion</h3>
          <div className={s.catRow}>
            {Object.entries(CAT_LABELS).map(([k, v]) => (
              <button key={k} type="button"
                className={`${s.catBtn} ${form.category === k ? s.catActive : ''}`}
                onClick={() => setForm(f => ({...f, category: k}))}>
                {v}
              </button>
            ))}
          </div>
          <textarea
            className={s.textarea}
            rows={4}
            placeholder="Décrivez votre idée, problème ou amélioration…"
            value={form.message}
            onChange={e => setForm(f => ({...f, message: e.target.value}))}
            required
          />
          <button type="submit" className={s.submitBtn} disabled={sending || !form.message.trim()}>
            {sending ? 'Envoi…' : done ? '✅ Envoyé !' : '📨 Envoyer'}
          </button>
        </form>
      )}

      {/* ── Super Admin: Status filter pills ── */}
      {isSuperAdmin && (
        <div className={s.filterRow}>
          <button className={`${s.pill} ${statusFilter===''?s.pillActive:''}`} onClick={() => setStatusFilter('')}>
            Tous <span className={s.pillCount}>{items.length}</span>
          </button>
          {STATUS_OPTIONS.map(st => (
            <button key={st} className={`${s.pill} ${statusFilter===st?s.pillActive:''}`}
              style={{'--pc': STATUS_COLORS[st]}}
              onClick={() => setStatusFilter(st)}>
              {STATUS_LABELS[st]} <span className={s.pillCount}>{COUNTS[st]}</span>
            </button>
          ))}
        </div>
      )}

      {loading && <div className={s.spinner}/>}

      {!loading && items.length === 0 && (
        <div className={s.empty}>
          <span>💬</span>
          <p>{isSuperAdmin ? 'Aucune suggestion pour le moment.' : 'Vous n\'avez encore soumis aucune suggestion.'}</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className={s.list}>
          {items.map(item => (
            <div key={item._id} className={`${s.card} ${expanded === item._id ? s.cardOpen : ''}`}>
              <div className={s.cardHead} onClick={() => setExpanded(expanded === item._id ? null : item._id)}>
                <span className={s.catTag}>{CAT_ICONS[item.category]} {CAT_LABELS[item.category] || item.category}</span>
                <p className={s.msg}>{item.message.length > 120 ? item.message.slice(0, 120) + '…' : item.message}</p>
                <div className={s.cardMeta}>
                  {isSuperAdmin && <span className={s.author}>👤 {item.authorName || item.authorEmail}</span>}
                  <span className={s.date}>{new Date(item.createdAt).toLocaleDateString('fr-FR', {day:'numeric',month:'short',year:'numeric'})}</span>
                  {isSuperAdmin ? (
                    <div className={s.statusSelectWrap} onClick={e => e.stopPropagation()}>
                      <select
                        className={s.statusSelect}
                        value={item.status}
                        style={{color: STATUS_COLORS[item.status]}}
                        onChange={e => handleStatusChange(item._id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map(st => <option key={st} value={st}>{STATUS_LABELS[st]}</option>)}
                      </select>
                    </div>
                  ) : (
                    <span className={s.statusBadge} style={{color: STATUS_COLORS[item.status]}}>
                      {STATUS_ICONS[item.status]} {STATUS_LABELS[item.status]}
                    </span>
                  )}
                  <span className={s.chevron}>{expanded === item._id ? '▲' : '▼'}</span>
                </div>
              </div>

              {expanded === item._id && (
                <div className={s.cardBody}>
                  <p className={s.fullMsg}>{item.message}</p>

                  {/* Admin note */}
                  {item.adminNote && !isSuperAdmin && (
                    <div className={s.adminNoteBox}>
                      <span className={s.adminNoteLabel}>Réponse myKado</span>
                      <p>{item.adminNote}</p>
                    </div>
                  )}

                  {isSuperAdmin && (
                    <div className={s.noteEdit}>
                      <label>Réponse admin (visible par l'utilisateur)</label>
                      <textarea
                        rows={3}
                        className={s.noteTextarea}
                        value={noteEdit[item._id] ?? item.adminNote ?? ''}
                        onChange={e => setNoteEdit(prev => ({...prev, [item._id]: e.target.value}))}
                        placeholder="Votre réponse…"
                      />
                      <div className={s.noteActions}>
                        <button
                          className={s.noteSave}
                          disabled={savingNote === item._id}
                          onClick={() => handleSaveNote(item._id)}
                        >
                          {savingNote === item._id ? 'Sauvegarde…' : '💾 Sauvegarder'}
                        </button>
                        <button className={s.noteDelete} onClick={() => handleDelete(item._id)}>🗑️ Supprimer</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
}
