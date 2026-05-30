import { useState, useEffect } from 'react';
import { Check, X, Clock, Eye } from 'lucide-react';
import { getKycList, updateKycStatus } from '../../utils/api';

const FILTERS = [
  { id: 'all',      label: 'Toutes' },
  { id: 'pending',  label: 'En attente' },
  { id: 'approved', label: 'Validées' },
  { id: 'rejected', label: 'Rejetées' },
];

const STATUS_CONFIG = {
  pending:  { label: 'En attente', bg: '#FFF3CD', color: '#856404', icon: Clock },
  approved: { label: 'Validé',     bg: '#D4F1E5', color: '#1F6E55', icon: Check },
  rejected: { label: 'Rejeté',     bg: '#FFE0E0', color: '#b91c1c', icon: X },
  none:     { label: 'Aucun',      bg: '#F2E6EA', color: '#B09AB2', icon: Clock },
};

function InitialsAvatar({ name, size = 42 }) {
  const colors = ['#FFB3C1', '#D7C5F2', '#C9EEDF', '#FFE7AD', '#FFD7C2', '#B3D9FF'];
  const idx = (name || '').charCodeAt(0) % colors.length;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: colors[idx], display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 800, fontSize: size * 0.38, color: '#2B1A2D',
    }}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.none;
  const Icon = cfg.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px',
      borderRadius: 999, background: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: 12,
    }}>
      <Icon size={12}/>{cfg.label}
    </span>
  );
}

function Thumbnail({ url, label }) {
  if (!url) return <span style={{ fontSize: 12, color: '#B09AB2', fontStyle: 'italic' }}>—</span>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{
      display: 'inline-flex', alignItems: 'center', gap: 5, color: '#6E4FBA',
      fontSize: 12.5, fontWeight: 600, textDecoration: 'none',
    }}>
      <img src={url} alt={label} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1.5px solid #EDD5DA' }} />
      <Eye size={12}/>
    </a>
  );
}

export default function SuperAdminKyc() {
  const [filter, setFilter] = useState('all');
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  // Reject modal state
  const [rejectTarget, setRejectTarget] = useState(null); // user object
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  const load = async (status) => {
    setLoading(true);
    try {
      const params = status !== 'all' ? { status } : {};
      const res = await getKycList(params);
      setUsers(res.data.users || []);
      setTotal(res.data.total || 0);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(filter); }, [filter]);

  const handleApprove = async (user) => {
    setActionLoading(user._id + '_approve');
    try {
      await updateKycStatus(user._id, { kycStatus: 'approved' });
      setUsers(prev => prev.map(u => u._id === user._id ? { ...u, kycStatus: 'approved' } : u));
    } catch {}
    setActionLoading('');
  };

  const handleReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(rejectTarget._id + '_reject');
    try {
      await updateKycStatus(rejectTarget._id, { kycStatus: 'rejected', kycRejectionReason: rejectReason });
      setUsers(prev => prev.map(u => u._id === rejectTarget._id ? { ...u, kycStatus: 'rejected', kycRejectionReason: rejectReason } : u));
      setRejectTarget(null);
      setRejectReason('');
    } catch {}
    setActionLoading('');
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 28 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 15, background: 'var(--mk-blush)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22,
        }}>🛡️</div>
        <div>
          <h1 style={{ fontFamily: 'var(--mk-display)', fontStyle: 'italic', fontSize: 28, lineHeight: 1.1, color: 'var(--mk-ink)', margin: 0 }}>
            Vérifications KYC
          </h1>
          <div style={{ fontSize: 13, color: 'var(--mk-ink-3)', marginTop: 3 }}>
            Validez ou rejetez les demandes de vérification d'identité
          </div>
        </div>
        <div style={{
          marginLeft: 'auto', padding: '6px 14px', borderRadius: 999,
          background: 'var(--mk-blush)', color: 'var(--mk-rose)', fontWeight: 800, fontSize: 14,
        }}>
          {total} soumission{total !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f.id}
            style={{
              padding: '8px 16px', borderRadius: 999, fontWeight: 700, fontSize: 13.5, cursor: 'pointer',
              border: `1.5px solid ${filter === f.id ? 'var(--mk-rose)' : 'var(--mk-line-2)'}`,
              background: filter === f.id ? 'var(--mk-rose)' : '#fff',
              color: filter === f.id ? '#fff' : 'var(--mk-ink-2)',
              transition: 'all .15s',
            }}
            onClick={() => setFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--mk-ink-3)' }}>Chargement…</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
          <div style={{ fontWeight: 700, color: 'var(--mk-ink-2)' }}>Aucune soumission</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {users.map(user => (
            <div
              key={user._id}
              style={{
                background: '#fff', borderRadius: 18, padding: '18px 20px',
                border: '1.5px solid var(--mk-line)',
                boxShadow: '0 2px 8px rgba(43,26,45,.04)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                <InitialsAvatar name={user.name} />

                {/* Name + email */}
                <div style={{ flex: 1, minWidth: 140 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5, color: 'var(--mk-ink)' }}>{user.kycName || user.name}</div>
                  <div style={{ fontSize: 12.5, color: 'var(--mk-ink-3)' }}>{user.email}</div>
                </div>

                {/* Method + phone */}
                <div style={{ minWidth: 120 }}>
                  <div style={{ fontSize: 12.5, color: 'var(--mk-ink-2)', fontWeight: 600 }}>{user.kycMethod || '—'}</div>
                  <div style={{ fontSize: 12, color: 'var(--mk-ink-3)' }}>+229 {user.kycPhone || '—'}</div>
                </div>

                {/* Thumbnails */}
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--mk-ink-3)', fontWeight: 700, marginBottom: 3 }}>DOC</div>
                    <Thumbnail url={user.kycDocumentUrl} label="Document" />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 10, color: 'var(--mk-ink-3)', fontWeight: 700, marginBottom: 3 }}>SELFIE</div>
                    <Thumbnail url={user.kycSelfieUrl} label="Selfie" />
                  </div>
                </div>

                {/* Status + date */}
                <div style={{ minWidth: 110, textAlign: 'center' }}>
                  <StatusBadge status={user.kycStatus} />
                  <div style={{ fontSize: 10.5, color: 'var(--mk-ink-3)', marginTop: 4 }}>
                    {formatDate(user.kycSubmittedAt)}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                  {user.kycStatus === 'pending' && (
                    <>
                      <button
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '8px 14px', borderRadius: 999, fontWeight: 700, fontSize: 12.5,
                          background: '#D4F1E5', color: '#1F6E55', border: 'none', cursor: 'pointer',
                          opacity: actionLoading === user._id + '_approve' ? .6 : 1,
                        }}
                        disabled={!!actionLoading}
                        onClick={() => handleApprove(user)}
                      >
                        <Check size={13}/> Valider
                      </button>
                      <button
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '8px 14px', borderRadius: 999, fontWeight: 700, fontSize: 12.5,
                          background: '#FFE0E0', color: '#b91c1c', border: 'none', cursor: 'pointer',
                          opacity: actionLoading === user._id + '_reject' ? .6 : 1,
                        }}
                        disabled={!!actionLoading}
                        onClick={() => { setRejectTarget(user); setRejectReason(''); }}
                      >
                        <X size={13}/> Rejeter
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Rejection reason display */}
              {user.kycStatus === 'rejected' && user.kycRejectionReason && (
                <div style={{
                  marginTop: 12, padding: '10px 14px', borderRadius: 10,
                  background: '#FFF5F5', border: '1px solid #FFE0E0', fontSize: 12.5, color: '#b91c1c',
                }}>
                  <strong>Motif du rejet :</strong> {user.kycRejectionReason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject modal overlay */}
      {rejectTarget && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(43,26,45,.45)',
            backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={() => setRejectTarget(null)}
        >
          <div
            style={{
              background: '#fff', borderRadius: 24, padding: 28, maxWidth: 440, width: '100%',
              boxShadow: '0 8px 40px rgba(43,26,45,.18)', border: '1px solid #F2E6EA',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontWeight: 800, fontSize: 18, color: '#2B1A2D', marginBottom: 6 }}>Rejeter la vérification</div>
            <p style={{ fontSize: 13.5, color: '#6B4E6D', marginBottom: 16, lineHeight: 1.5 }}>
              Indiquez un motif (optionnel) qui sera transmis à <strong>{rejectTarget.kycName || rejectTarget.name}</strong>.
            </p>
            <textarea
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="ex: Document illisible, mauvaise luminosité…"
              rows={3}
              style={{
                width: '100%', padding: '12px 14px', borderRadius: 12, resize: 'vertical',
                border: '1.5px solid #EDD5DA', fontSize: 14, color: '#2B1A2D', outline: 'none',
                fontFamily: 'inherit', marginBottom: 16,
              }}
            />
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                style={{
                  flex: 1, padding: '11px', borderRadius: 999,
                  border: '1.5px solid #EDD5DA', background: '#fff', color: '#6B4E6D',
                  fontWeight: 600, fontSize: 14, cursor: 'pointer',
                }}
                onClick={() => setRejectTarget(null)}
              >
                Annuler
              </button>
              <button
                style={{
                  flex: 1, padding: '11px', borderRadius: 999, border: 'none',
                  background: 'linear-gradient(135deg, #FF6F8B, #E11D48)', color: '#fff',
                  fontWeight: 700, fontSize: 14, cursor: 'pointer',
                  opacity: actionLoading ? .6 : 1,
                }}
                disabled={!!actionLoading}
                onClick={handleReject}
              >
                {actionLoading ? 'Envoi…' : 'Confirmer le rejet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
