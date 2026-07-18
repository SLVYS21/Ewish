import { useEffect, useMemo, useState } from 'react';
import {
  Check, X, HelpCircle, Clock, Download, Search, Users, TrendingUp, RefreshCw,
} from 'lucide-react';
import { getRsvps, getRsvpStats, exportRsvpsUrl } from '../utils/api';
import s from './RsvpManager.module.css';

const STATUS_META = {
  accepted: { label: 'Accepté',    color: '#15803D', bg: '#DCFCE7', Icon: Check },
  declined: { label: 'Refusé',     color: '#B91C1C', bg: '#FEE2E2', Icon: X },
  maybe:    { label: 'Peut-être',  color: '#B45309', bg: '#FEF3C7', Icon: HelpCircle },
  pending:  { label: 'En attente', color: '#7A6A7D', bg: '#F3F0F5', Icon: Clock },
};

export default function RsvpManager({ publicationId }) {
  const [rsvps, setRsvps]       = useState([]);
  const [stats, setStats]       = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch]     = useState('');

  const reload = () => {
    setLoading(true);
    Promise.all([
      getRsvps(publicationId, { status: statusFilter || undefined, search: search || undefined }),
      getRsvpStats(publicationId),
    ])
      .then(([rRsvps, rStats]) => {
        setRsvps(rRsvps.data || []);
        setStats(rStats.data?.stats || null);
        setTimeline(rStats.data?.timeline || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { reload(); /* eslint-disable-next-line */ }, [publicationId, statusFilter]);

  // Refresh sur recherche (debounce)
  useEffect(() => {
    const t = setTimeout(reload, 300);
    return () => clearTimeout(t);
    /* eslint-disable-next-line */
  }, [search]);

  const filteredCount = rsvps.length;

  return (
    <div className={s.root}>
      {/* ── Stats cards ── */}
      <div className={s.statsGrid}>
        <StatCard label="Réponses" value={stats?.totalResponses ?? 0} icon={<Users size={14} />} color="#7C5CC9" />
        <StatCard label="Confirmés" value={stats?.accepted ?? 0} icon={<Check size={14} />} color="#15803D" />
        <StatCard label="Refusés" value={stats?.declined ?? 0} icon={<X size={14} />} color="#B91C1C" />
        <StatCard label="Peut-être" value={stats?.maybe ?? 0} icon={<HelpCircle size={14} />} color="#B45309" />
      </div>

      {stats && (stats.plusOnes > 0 || stats.totalAttending > 0) && (
        <div className={s.attendingPill}>
          <TrendingUp size={13} />
          <strong>{stats.totalAttending}</strong> personne{stats.totalAttending > 1 ? 's' : ''} attendue{stats.totalAttending > 1 ? 's' : ''}
          {stats.plusOnes > 0 && <span className={s.muted}> · dont {stats.plusOnes} accompagnant{stats.plusOnes > 1 ? 's' : ''}</span>}
        </div>
      )}

      {/* ── Timeline (sparkline 30j) ── */}
      {timeline.length > 0 && (
        <TimelineChart timeline={timeline} />
      )}

      {/* ── Toolbar ── */}
      <div className={s.toolbar}>
        <div className={s.searchWrap}>
          <Search size={13} className={s.searchIcon} />
          <input
            className={s.search}
            placeholder="Chercher un nom, email…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className={s.filterSelect}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">Tous les statuts</option>
          <option value="accepted">Acceptés</option>
          <option value="declined">Refusés</option>
          <option value="maybe">Peut-être</option>
          <option value="pending">En attente</option>
        </select>
        <button className={s.btnGhost} onClick={reload} title="Rafraîchir">
          <RefreshCw size={13} className={loading ? s.spin : ''} />
        </button>
        <a
          className={s.btnPrimary}
          href={exportRsvpsUrl(publicationId)}
          target="_blank" rel="noreferrer"
        >
          <Download size={13} /> Export CSV
        </a>
      </div>

      {/* ── Table ── */}
      <div className={s.tableWrap}>
        {loading && rsvps.length === 0 ? (
          <div className={s.empty}>Chargement…</div>
        ) : filteredCount === 0 ? (
          <div className={s.empty}>
            Aucun RSVP pour le moment. Partagez le lien d'invitation pour commencer à recevoir des réponses.
          </div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Invité</th>
                <th>Contact</th>
                <th>Statut</th>
                <th>+</th>
                <th>Message</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {rsvps.map(r => <RsvpRow key={r._id} rsvp={r} />)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }) {
  return (
    <div className={s.statCard} style={{ borderColor: color + '33' }}>
      <div className={s.statIcon} style={{ background: color + '15', color }}>{icon}</div>
      <div className={s.statText}>
        <div className={s.statValue} style={{ color }}>{value}</div>
        <div className={s.statLabel}>{label}</div>
      </div>
    </div>
  );
}

function RsvpRow({ rsvp }) {
  const meta = STATUS_META[rsvp.status] || STATUS_META.pending;
  const Icon = meta.Icon;
  return (
    <tr>
      <td className={s.cellName}>{rsvp.guestName}</td>
      <td className={s.cellMuted}>{rsvp.guestEmail || rsvp.guestPhone || '—'}</td>
      <td>
        <span className={s.statusBadge} style={{ background: meta.bg, color: meta.color }}>
          <Icon size={11} /> {meta.label}
        </span>
      </td>
      <td className={s.cellCenter}>{rsvp.plusOnes > 0 ? `+${rsvp.plusOnes}` : ''}</td>
      <td className={s.cellMessage} title={rsvp.message}>
        {rsvp.message || <span className={s.muted}>—</span>}
      </td>
      <td className={s.cellMuted}>
        {rsvp.respondedAt ? new Date(rsvp.respondedAt).toLocaleDateString('fr-FR', {
          day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
        }) : '—'}
      </td>
    </tr>
  );
}

/* ── Mini chart (SVG, no deps) ────────────────────────────── */
function TimelineChart({ timeline }) {
  const byDay = useMemo(() => {
    const map = new Map();
    timeline.forEach(t => {
      const d = t._id?.d || '';
      const cur = map.get(d) || { accepted: 0, declined: 0, maybe: 0 };
      const status = t._id?.s;
      if (status in cur) cur[status] += t.count || 0;
      map.set(d, cur);
    });
    return [...map.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-14);
  }, [timeline]);

  if (byDay.length < 2) return null;

  const max = Math.max(1, ...byDay.map(([, v]) => v.accepted + v.declined + v.maybe));
  const W = 100, H = 36;
  const step = W / Math.max(1, byDay.length - 1);

  const acceptedPath = byDay.map(([, v], i) => `${i === 0 ? 'M' : 'L'}${i * step},${H - (v.accepted / max) * H}`).join(' ');

  return (
    <div className={s.chartWrap}>
      <div className={s.chartLabel}>Évolution sur 14 jours</div>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className={s.chartSvg}>
        <path d={acceptedPath} fill="none" stroke="#15803D" strokeWidth="1.5" />
        {byDay.map(([d, v], i) => (
          <circle key={d} cx={i * step} cy={H - (v.accepted / max) * H} r="1.2" fill="#15803D" />
        ))}
      </svg>
    </div>
  );
}
