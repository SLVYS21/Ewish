import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalytics } from '../../utils/api';
import PageShell from '../components/PageShell';
import s from './AdminDashboard.module.css';

const BADGE = {
  pending:     <span className={`${s.badge} ${s.badgePending}`}>En attente</span>,
  confirmed:   <span className={`${s.badge} ${s.badgeConfirmed}`}>Confirmée</span>,
  in_progress: <span className={`${s.badge} ${s.badgeProgress}`}>En cours</span>,
  delivered:   <span className={`${s.badge} ${s.badgeDelivered}`}>Livrée</span>,
  cancelled:   <span className={`${s.badge} ${s.badgeCancelled}`}>Annulée</span>,
};

function fmtPrice(p) { return new Intl.NumberFormat('fr-FR').format(p || 0) + ' FCFA'; }
function fmtDate(d)  { return d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—'; }

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [period, setPeriod] = useState('7d');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { load(period); }, [period]);

  const load = async (p) => {
    setLoading(true);
    try { const r = await getAnalytics(p); setData(r.data); }
    catch { setData(null); }
    finally { setLoading(false); }
  };

  return (
    <PageShell
      title="Dashboard"
      subtitle="Vue d'ensemble de l'activité"
      actions={
        <div className={s.periods}>
          {['7d','30d','90d'].map(p => (
            <button key={p} className={`${s.periodBtn} ${period === p ? s.active : ''}`} onClick={() => setPeriod(p)}>
              {p === '7d' ? '7 jours' : p === '30d' ? '30 jours' : '90 jours'}
            </button>
          ))}
        </div>
      }
    >
      {loading && <div className={s.loadingWrap}><div className={s.spinner} /></div>}
      {!loading && data && <>
        {/* ── Stats row ── */}
        <div className={s.statsRow}>
          <StatCard label="Commandes totales" value={data.orders.total}     icon="📦" meta={`${data.orders.pending} en attente`} />
          <StatCard label="En attente"         value={data.orders.pending}   icon="⏳" meta="À traiter"     colorClass={s.red}   />
          <StatCard label="Livrées"            value={data.orders.delivered} icon="✅" meta={`${data.orders.confirmed} confirmées`} colorClass={s.green} />
          <StatCard label="Revenus"            value={fmtPrice(data.revenue.total)} icon="💰" meta="Confirmées + livrées" colorClass={s.gold} isText />
          <StatCard label="Conversion"         value={`${data.funnel.conversionRate}%`} icon="📈" meta={`${data.funnel.pageViews} visites → ${data.funnel.purchases} achats`} isText />
        </div>

        {/* ── Mid row ── */}
        <div className={s.midRow}>
          {/* Funnel */}
          <div className={s.card}>
            <div className={s.cardHead}><span className={s.cardTitle}>Entonnoir Facebook</span></div>
            <div className={s.funnel}>
              {[
                { label: 'Visites',      val: data.funnel.pageViews,         color: '#4e9eff' },
                { label: 'Vus template', val: data.funnel.viewContents,      color: '#c8963e' },
                { label: 'Checkout',     val: data.funnel.initiateCheckouts, color: '#f0a030' },
                { label: 'Achats',       val: data.funnel.purchases,         color: '#3ecf8e' },
              ].map(({ label, val, color }) => {
                const max = data.funnel.pageViews || 1;
                const pct = Math.round((val / max) * 100);
                return (
                  <div key={label} className={s.funnelRow}>
                    <div className={s.funnelLabel}>{label}</div>
                    <div className={s.funnelTrack}>
                      <div className={s.funnelBar} style={{ width: `${pct}%`, borderLeftColor: color, background: `${color}18` }}>
                        <span className={s.funnelVal} style={{ color }}>{val.toLocaleString('fr-FR')}</span>
                      </div>
                    </div>
                    <div className={s.funnelPct}>{pct}%</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Revenue chart */}
          <div className={s.card}>
            <div className={s.cardHead}>
              <span className={s.cardTitle}>Revenus par jour</span>
              <span className={s.revenueTotal}>{fmtPrice(data.revenue.total)}</span>
            </div>
            <RevenueChart data={data.revenue.byDay || []} />
          </div>
        </div>

        {/* ── Recent orders ── */}
        <div className={s.sectionHead}>
          <span className={s.sectionTitle}>Dernières commandes</span>
          <button className={s.seeAll} onClick={() => navigate('/ewish-admin/orders')}>Voir tout →</button>
        </div>
        <div className={s.tableWrap}>
          {data.recentOrders?.length ? (
            <table className={s.table}>
              <thead>
                <tr><th>Client</th><th>Template</th><th>Montant</th><th>Statut</th><th>Date</th></tr>
              </thead>
              <tbody>
                {data.recentOrders.slice(0,8).map(o => (
                  <tr key={o._id} onClick={() => navigate('/ewish-admin/orders')}>
                    <td className={s.bold}>{o.client.firstName} {o.client.lastName || ''}</td>
                    <td>{o.templateLabel || o.templateName}</td>
                    <td className={s.bold}>{fmtPrice(o.finalPrice)}</td>
                    <td>{BADGE[o.status] || o.status}</td>
                    <td className={s.muted}>{fmtDate(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className={s.emptyWrap}><span className={s.emptyIcon}>📭</span>Aucune commande</div>
          )}
        </div>
      </>}
    </PageShell>
  );
}

function StatCard({ label, value, icon, meta, colorClass, isText }) {
  return (
    <div className={s.statCard}>
      <div className={s.statLabel}>{label}</div>
      <div className={`${s.statValue} ${colorClass || ''} ${isText ? s.statText : ''}`}>{value}</div>
      <div className={s.statMeta}>{meta}</div>
      <div className={s.statIcon}>{icon}</div>
    </div>
  );
}

function RevenueChart({ data }) {
  if (!data.length) return <div className={s.noData}>Pas encore de données</div>;
  const max = Math.max(...data.map(d => d.revenue), 1);
  return (
    <div className={s.chart}>
      {data.map((d, i) => {
        const h = Math.max(3, Math.round((d.revenue / max) * 72));
        return (
          <div key={i} className={s.chartBar} style={{ height: h }} title={`${d._id}\n${new Intl.NumberFormat('fr-FR').format(d.revenue)} FCFA`} />
        );
      })}
    </div>
  );
}