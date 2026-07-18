import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Calendar, MapPin, Clock, Users, Mail, Bell, MessageSquare,
  Plus, Trash2, Copy, Check, Upload, X, Link as LinkIcon,
} from 'lucide-react';
import {
  getGuests, createGuest, updateGuest, deleteGuest, importGuests,
} from '../utils/api';
import s from './InvitationTab.module.css';

const DEFAULT_CONFIG = {
  enabled: true,
  mode: 'public',
  eventDate: '',
  eventTime: '',
  location: '',
  locationUrl: '',
  rsvpDeadline: '',
  allowMaybe: true,
  allowPlusOnes: false,
  maxPlusOnes: 0,
  messageOnAccept: true,
  linkedWallTemplate: 'wall-of-wishes',
  notifyEmail: '',
  notifyOnEachRsvp: false,
  confirmationMessage: '',
};

const WALL_OPTIONS = [
  { value: 'none',                  label: 'Aucun mur' },
  { value: 'wall-of-wishes',        label: 'Mur classique (post-its)' },
  { value: 'wall-of-wishes-modern', label: 'Mur moderne (cartes)' },
  { value: 'wall-of-wishes-space',  label: 'Mur spatial (canvas infini)' },
];

function toDateInput(v) {
  if (!v) return '';
  try {
    const d = new Date(v);
    if (isNaN(d)) return '';
    return d.toISOString().slice(0, 10);
  } catch { return ''; }
}

export default function InvitationTab({ publicationId, invitationConfig, onChange, publicUrl }) {
  const cfg = useMemo(() => ({ ...DEFAULT_CONFIG, ...(invitationConfig || {}) }), [invitationConfig]);

  const update = (patch) => onChange({ ...cfg, ...patch });

  return (
    <div className={s.root}>
      {/* ── Activation ── */}
      <Section icon={<Mail size={14} />} title="Invitation">
        <Toggle
          label="Activer l'invitation"
          hint="Affiche le formulaire RSVP sur la page publique"
          value={cfg.enabled}
          onChange={(v) => update({ enabled: v })}
        />
      </Section>

      {/* ── Événement ── */}
      <Section icon={<Calendar size={14} />} title="Événement">
        <Row>
          <Field label="Date de l'événement">
            <input
              type="date"
              className={s.input}
              value={toDateInput(cfg.eventDate)}
              onChange={(e) => update({ eventDate: e.target.value })}
            />
          </Field>
          <Field label="Heure">
            <input
              type="time"
              className={s.input}
              value={cfg.eventTime || ''}
              onChange={(e) => update({ eventTime: e.target.value })}
            />
          </Field>
        </Row>
        <Field label="Lieu" icon={<MapPin size={12} />}>
          <input
            className={s.input}
            value={cfg.location || ''}
            onChange={(e) => update({ location: e.target.value })}
            placeholder="Château de Versailles, Place d'Armes"
          />
        </Field>
        <Field label="Lien Google Maps (optionnel)" icon={<LinkIcon size={12} />}>
          <input
            className={s.input}
            value={cfg.locationUrl || ''}
            onChange={(e) => update({ locationUrl: e.target.value })}
            placeholder="https://maps.google.com/..."
          />
        </Field>
        <Field label="Date limite de réponse (RSVP)" icon={<Clock size={12} />}>
          <input
            type="date"
            className={s.input}
            value={toDateInput(cfg.rsvpDeadline)}
            onChange={(e) => update({ rsvpDeadline: e.target.value })}
          />
        </Field>
      </Section>

      {/* ── Mode d'accès ── */}
      <Section icon={<Users size={14} />} title="Qui peut répondre ?">
        <div className={s.modeGrid}>
          <ModeCard
            active={cfg.mode === 'public'}
            title="Lien public"
            desc="N'importe qui avec le lien peut répondre. Anti-doublon par email."
            onClick={() => update({ mode: 'public' })}
          />
          <ModeCard
            active={cfg.mode === 'list'}
            title="Liste fermée"
            desc="Chaque invité reçoit un lien personnel unique."
            onClick={() => update({ mode: 'list' })}
          />
        </div>
      </Section>

      {/* ── Options RSVP ── */}
      <Section icon={<MessageSquare size={14} />} title="Options de réponse">
        <Toggle
          label="Autoriser « Peut-être »"
          value={cfg.allowMaybe}
          onChange={(v) => update({ allowMaybe: v })}
        />
        <Toggle
          label="Autoriser les accompagnants (+1, +2…)"
          value={cfg.allowPlusOnes}
          onChange={(v) => update({ allowPlusOnes: v })}
        />
        {cfg.allowPlusOnes && (
          <Field label={`Nombre max d'accompagnants par invité`}>
            <input
              type="number" min={1} max={10}
              className={s.input}
              value={cfg.maxPlusOnes || 1}
              onChange={(e) => update({ maxPlusOnes: Math.max(0, Math.min(10, parseInt(e.target.value) || 0)) })}
            />
          </Field>
        )}
        <Toggle
          label="Publier le message des invités sur le mur"
          hint="Quand un invité accepte avec un message, il apparaît en post-it sur le mur"
          value={cfg.messageOnAccept}
          onChange={(v) => update({ messageOnAccept: v })}
        />
        {cfg.messageOnAccept && (
          <Field label="Style du mur lié">
            <select
              className={s.input}
              value={cfg.linkedWallTemplate}
              onChange={(e) => update({ linkedWallTemplate: e.target.value })}
            >
              {WALL_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
        )}
        <Field label="Message de confirmation (après réponse)">
          <textarea
            className={s.textarea}
            value={cfg.confirmationMessage || ''}
            onChange={(e) => update({ confirmationMessage: e.target.value })}
            placeholder="Merci ! On a hâte de te voir."
            rows={2}
          />
        </Field>
      </Section>

      {/* ── Notifications ── */}
      <Section icon={<Bell size={14} />} title="Notifications">
        <Field label="Email de l'organisateur">
          <input
            type="email"
            className={s.input}
            value={cfg.notifyEmail || ''}
            onChange={(e) => update({ notifyEmail: e.target.value })}
            placeholder="moi@exemple.com"
          />
        </Field>
        <Toggle
          label="Recevoir une notification à chaque RSVP"
          value={cfg.notifyOnEachRsvp}
          onChange={(v) => update({ notifyOnEachRsvp: v })}
        />
      </Section>

      {/* ── Liste invités (mode list uniquement) ── */}
      {cfg.mode === 'list' && publicationId && (
        <GuestListSection publicationId={publicationId} publicUrl={publicUrl} />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   Guest list manager (mode 'list')
   ───────────────────────────────────────────────────────────── */
function GuestListSection({ publicationId, publicUrl }) {
  const [guests, setGuests]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding]   = useState(false);
  const [draft, setDraft]     = useState({ name: '', email: '', phone: '' });
  const [error, setError]     = useState('');
  const [importing, setImporting] = useState(false);
  const fileRef = useRef(null);

  const reload = () => {
    setLoading(true);
    getGuests(publicationId)
      .then(r => setGuests(r.data || []))
      .catch(e => setError(e.response?.data?.error || e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); }, [publicationId]);

  const handleAdd = async () => {
    if (!draft.name.trim()) return;
    try {
      const r = await createGuest(publicationId, draft);
      setGuests(g => [...g, r.data]);
      setDraft({ name: '', email: '', phone: '' });
      setAdding(false);
      setError('');
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet invité ?')) return;
    try {
      await deleteGuest(publicationId, id);
      setGuests(g => g.filter(x => x._id !== id));
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    }
  };

  const handleCsvImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (!rows.length) throw new Error('Fichier CSV vide ou invalide');
      const list = rows.map(r => ({
        name: r.name || r.nom || r.Name || r.Nom || '',
        email: r.email || r.Email || '',
        phone: r.phone || r.telephone || r.Telephone || r.Phone || '',
        group: r.group || r.groupe || '',
      })).filter(g => g.name.trim());
      if (!list.length) throw new Error('Aucun invité valide (besoin d\'une colonne "name" ou "nom")');
      await importGuests(publicationId, list);
      reload();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <Section icon={<Users size={14} />} title={`Liste invités (${guests.length})`}>
      {error && <div className={s.error}>{error}</div>}

      <div className={s.guestActions}>
        <button className={s.btnGhost} onClick={() => setAdding(true)}>
          <Plus size={13} /> Ajouter
        </button>
        <button className={s.btnGhost} onClick={() => fileRef.current?.click()} disabled={importing}>
          <Upload size={13} /> {importing ? 'Import…' : 'Importer CSV'}
        </button>
        <input
          ref={fileRef} type="file" accept=".csv,text/csv"
          style={{ display: 'none' }} onChange={handleCsvImport}
        />
      </div>

      {adding && (
        <div className={s.draftRow}>
          <input className={s.input} placeholder="Nom" value={draft.name}
            onChange={e => setDraft(d => ({ ...d, name: e.target.value }))} autoFocus />
          <input className={s.input} placeholder="Email" value={draft.email}
            onChange={e => setDraft(d => ({ ...d, email: e.target.value }))} />
          <input className={s.input} placeholder="Téléphone" value={draft.phone}
            onChange={e => setDraft(d => ({ ...d, phone: e.target.value }))} />
          <button className={s.btnPrimary} onClick={handleAdd}><Check size={14} /></button>
          <button className={s.btnGhostSmall} onClick={() => { setAdding(false); setDraft({ name: '', email: '', phone: '' }); }}><X size={14} /></button>
        </div>
      )}

      {loading && <div className={s.muted}>Chargement…</div>}

      {!loading && guests.length === 0 && !adding && (
        <div className={s.empty}>
          Aucun invité ajouté. Importez un CSV ou ajoutez-les un par un.
        </div>
      )}

      <div className={s.guestList}>
        {guests.map(g => (
          <GuestRow key={g._id} guest={g} publicUrl={publicUrl} onDelete={() => handleDelete(g._id)} />
        ))}
      </div>
    </Section>
  );
}

function GuestRow({ guest, publicUrl, onDelete }) {
  const [copied, setCopied] = useState(false);
  const inviteLink = publicUrl ? `${publicUrl}?invite=${guest.token}` : `?invite=${guest.token}`;
  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    });
  };
  return (
    <div className={s.guestRow}>
      <div className={s.guestInfo}>
        <div className={s.guestName}>{guest.name}</div>
        <div className={s.guestSub}>
          {guest.email || guest.phone || <span className={s.muted}>—</span>}
        </div>
      </div>
      <div className={s.guestStatus}>
        {guest.rsvpId
          ? <span className={s.badgeOk}>Répondu</span>
          : <span className={s.badgePending}>En attente</span>}
      </div>
      <button className={s.btnIcon} onClick={handleCopy} title="Copier le lien invité">
        {copied ? <Check size={13} /> : <Copy size={13} />}
      </button>
      <button className={s.btnIconDanger} onClick={onDelete} title="Supprimer">
        <Trash2 size={13} />
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   UI primitives
   ───────────────────────────────────────────────────────────── */
function Section({ icon, title, children }) {
  return (
    <div className={s.section}>
      <div className={s.sectionHead}>
        <span className={s.sectionIcon}>{icon}</span>
        <span className={s.sectionTitle}>{title}</span>
      </div>
      <div className={s.sectionBody}>{children}</div>
    </div>
  );
}

function Row({ children }) {
  return <div className={s.row}>{children}</div>;
}

function Field({ label, icon, children }) {
  return (
    <div className={s.field}>
      <label className={s.label}>
        {icon ? <span className={s.labelIcon}>{icon}</span> : null}
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({ label, hint, value, onChange }) {
  return (
    <div className={s.toggleRow}>
      <button
        className={`${s.toggle} ${value ? s.toggleOn : ''}`}
        onClick={() => onChange(!value)}
        type="button"
      >
        <span className={s.toggleKnob} />
      </button>
      <div className={s.toggleText}>
        <div className={s.toggleLabel}>{label}</div>
        {hint && <div className={s.toggleHint}>{hint}</div>}
      </div>
    </div>
  );
}

function ModeCard({ active, title, desc, onClick }) {
  return (
    <button className={`${s.modeCard} ${active ? s.modeCardActive : ''}`} onClick={onClick} type="button">
      <div className={s.modeTitle}>{title}</div>
      <div className={s.modeDesc}>{desc}</div>
    </button>
  );
}

/* ── CSV parser (minimal, supports quoted fields) ───────────── */
function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter(Boolean);
  if (!lines.length) return [];
  const split = (line) => {
    const out = []; let cur = ''; let inQ = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (inQ) {
        if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (c === '"') inQ = false;
        else cur += c;
      } else {
        if (c === '"') inQ = true;
        else if (c === ',' || c === ';') { out.push(cur); cur = ''; }
        else cur += c;
      }
    }
    out.push(cur);
    return out.map(v => v.trim());
  };
  const header = split(lines[0]).map(h => h.toLowerCase());
  return lines.slice(1).map(line => {
    const cols = split(line);
    const obj = {};
    header.forEach((h, i) => { obj[h] = cols[i] ?? ''; });
    return obj;
  });
}
