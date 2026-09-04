import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, CalendarDays, Trash2, Pencil, Bell, X } from 'lucide-react';
import {
  getUserDates,
  createUserDate,
  updateUserDate,
  deleteUserDate,
} from '../utils/api';
import styles from './DatesPage.module.css';

const OCCASION_LABELS = {
  'anniversaire':    'Anniversaire',
  'mariage':         'Mariage',
  'naissance':       'Naissance',
  'noel':            'Noël',
  'nouvel-an':       'Nouvel An',
  'saint-valentin':  'Saint-Valentin',
  'fete-des-meres':  'Fête des mères',
  'fete-des-peres':  'Fête des pères',
  'graduation':      'Graduation',
  'autre':           'Autre',
};

const OCCASION_COLORS = {
  'anniversaire':    { bg: '#FFF0F3', fg: '#E11D48' },
  'mariage':         { bg: '#EDE8F8', fg: '#6E4FBA' },
  'naissance':       { bg: '#D4F1E5', fg: '#1F6E55' },
  'noel':            { bg: '#FEE2E2', fg: '#B91C1C' },
  'nouvel-an':       { bg: '#FEF3C7', fg: '#B45309' },
  'saint-valentin':  { bg: '#FCE7F3', fg: '#BE185D' },
  'fete-des-meres':  { bg: '#FCE7F3', fg: '#BE185D' },
  'fete-des-peres':  { bg: '#DBEAFE', fg: '#1D4ED8' },
  'graduation':      { bg: '#FEF3C7', fg: '#B45309' },
  'autre':           { bg: '#F5F0FF', fg: '#7C5CBF' },
};

const MONTHS_FR = ['Jan','Fév','Mar','Avr','Mai','Juin','Juil','Août','Sep','Oct','Nov','Déc'];

function formatCountdown(days) {
  if (days === 0) return "Aujourd'hui";
  if (days === 1) return 'Demain';
  if (days <= 7) return `Dans ${days} jours`;
  if (days <= 30) return `Dans ${days} jours`;
  const weeks = Math.round(days / 7);
  if (weeks < 12) return `Dans ${weeks} semaines`;
  const months = Math.round(days / 30);
  return `Dans ${months} mois`;
}

export default function DatesPage() {
  const navigate = useNavigate();
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = () => {
    setLoading(true);
    getUserDates()
      .then((r) => setDates(r.data.dates || []))
      .catch(() => setDates([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const openAdd = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (d) => { setEditing(d); setModalOpen(true); };

  const handleSave = async (payload) => {
    if (editing) {
      await updateUserDate(editing._id, payload);
    } else {
      await createUserDate(payload);
    }
    setModalOpen(false);
    load();
  };

  const handleDelete = async (d) => {
    if (!window.confirm(`Supprimer "${d.name}" ?`)) return;
    await deleteUserDate(d._id);
    load();
  };

  return (
    <div className={styles.root}>
      <header className={styles.topbar}>
        <button className={styles.back} onClick={() => navigate('/ewish-admin/profile')} aria-label="Retour">
          <ArrowLeft size={20} />
        </button>
        <h1 className={styles.title}>Mes dates</h1>
        <button className={styles.addBtnTop} onClick={openAdd} aria-label="Ajouter une date">
          <Plus size={20} />
        </button>
      </header>

      <div className={styles.hint}>
        <Bell size={16} />
        <span>On te rappelle 3 jours et 1 jour avant chaque occasion pour créer la carte à temps.</span>
      </div>

      {loading ? (
        <div className={styles.empty}>Chargement…</div>
      ) : dates.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><CalendarDays size={32} /></div>
          <h2>Aucune date enregistrée</h2>
          <p>Ajoute les anniversaires et occasions importantes de tes proches — on t'enverra un rappel à l'avance.</p>
          <button className={styles.emptyCta} onClick={openAdd}>
            <Plus size={18} /> Ajouter une date
          </button>
        </div>
      ) : (
        <ul className={styles.list}>
          {dates.map((d) => {
            const c = OCCASION_COLORS[d.occasion] || OCCASION_COLORS.autre;
            return (
              <li key={d._id} className={styles.item}>
                <div className={styles.dateBadge} style={{ background: c.bg, color: c.fg }}>
                  <span className={styles.dateDay}>{d.day}</span>
                  <span className={styles.dateMonth}>{MONTHS_FR[d.month - 1]}</span>
                </div>
                <div className={styles.itemBody}>
                  <div className={styles.itemName}>{d.name}</div>
                  <div className={styles.itemMeta}>
                    <span>{OCCASION_LABELS[d.occasion] || d.occasion}</span>
                    <span className={styles.dot}>·</span>
                    <span className={styles.countdown}>{formatCountdown(d.daysUntil)}</span>
                  </div>
                </div>
                <div className={styles.itemActions}>
                  <button className={styles.iconBtn} onClick={() => openEdit(d)} aria-label="Modifier">
                    <Pencil size={16} />
                  </button>
                  <button className={styles.iconBtn} onClick={() => handleDelete(d)} aria-label="Supprimer">
                    <Trash2 size={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {modalOpen && (
        <DateModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function DateModal({ initial, onClose, onSave }) {
  const [name, setName] = useState(initial?.name || '');
  const [occasion, setOccasion] = useState(initial?.occasion || 'anniversaire');
  const [date, setDate] = useState(() => {
    if (!initial) return '';
    const y = initial.originYear || new Date().getFullYear();
    const m = String(initial.month).padStart(2, '0');
    const d = String(initial.day).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!name.trim()) return setErr('Nom requis');
    if (!date) return setErr('Date requise');
    setSaving(true);
    try {
      await onSave({ name: name.trim(), occasion, date });
    } catch (ex) {
      setErr(ex?.response?.data?.error || 'Erreur');
      setSaving(false);
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <form className={styles.modal} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className={styles.modalHead}>
          <h2>{initial ? 'Modifier la date' : 'Nouvelle date'}</h2>
          <button type="button" className={styles.iconBtn} onClick={onClose} aria-label="Fermer">
            <X size={18} />
          </button>
        </div>

        <label className={styles.field}>
          <span>De qui s'agit-il ?</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Maman, Alex, Papa…"
            maxLength={80}
            autoFocus
          />
        </label>

        <label className={styles.field}>
          <span>Occasion</span>
          <select value={occasion} onChange={(e) => setOccasion(e.target.value)}>
            {Object.entries(OCCASION_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span>Date</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        {err && <div className={styles.err}>{err}</div>}

        <div className={styles.modalActions}>
          <button type="button" className={styles.btnSecondary} onClick={onClose}>Annuler</button>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            {saving ? 'Enregistrement…' : (initial ? 'Enregistrer' : 'Ajouter')}
          </button>
        </div>
      </form>
    </div>
  );
}
