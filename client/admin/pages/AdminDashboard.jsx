import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalytics } from '../../utils/api';
import { useAuth } from '../context/AuthContext';
import PageShell from '../components/PageShell';
import PaymentModal from '../components/PaymentModal';
import WhatsAppFAB from '../../components/WhatsAppFAB';
import { Plus, ChevronRight } from 'lucide-react';
import s from './AdminDashboard.module.css';

function fmtPrice(p) { return new Intl.NumberFormat('fr-FR').format(p || 0) + ' FCFA'; }
function fmtDate(d)  { return d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : ''; }

function StatCard({ label, value, sub, color = '#e11d48', emoji }) {
  return (
    <div className={s.statCard}>
      <div className={s.statCardTop}>
        <div className={s.statLabel}>{label}</div>
        <div className={s.statEmoji} style={{ background: color + '18', color }}>{emoji}</div>
      </div>
      <div className={s.statValue}>{value}</div>
      {sub && <div className={s.statSub}>{sub}</div>}
    </div>
  );
}

const STATUS_BADGE = {
  success:   <span className={`${s.badge} ${s.badgeGreen}`}>✓ Succès</span>,
  pending:   <span className={`${s.badge} ${s.badgeAmber}`}>En attente</span>,
  failed:    <span className={`${s.badge} ${s.badgeRed}`}>Échouée</span>,
};

export default function AdminDashboard() {
  const [data, setData]       = useState(null);
  const [period, setPeriod]   = useState('7d');
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { load(period); }, [period]);

  const load = async (p) => {
    setLoading(true);
    try { const r = await getAnalytics(p); setData(r.data); }
    catch { setData(null); }
    finally { setLoading(false); }
  };

  const isMerchant   = user?.role === 'merchant';
  const isSuperAdmin = user?.role === 'super_admin';

  const periodActions = !isMerchant && (
    <div className={s.periodGroup}>
      {['7d', '30d', '90d'].map(p => (
        <button
          key={p}
          className={`${s.periodBtn} ${period === p ? s.periodActive : ''}`}
          onClick={() => setPeriod(p)}
        >
          {p === '7d' ? '7j' : p === '30d' ? '30j' : '90j'}
        </button>
      ))}
    </div>
  );

  return (
    <>
      <PageShell
        title="Tableau de bord"
        subtitle={isMerchant
          ? "Vue d'ensemble de votre activité"
          : `Vue d'ensemble · ${period === '7d' ? '7 derniers jours' : period === '30d' ? '30 derniers jours' : '90 derniers jours'}`
        }
        actions={
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {periodActions}
            <button className={s.createBtn} onClick={() => navigate('/ewish-admin/ewish/new')}>
              <Plus size={14} /> Créer un site
            </button>
          </div>
        }
      >
        {paymentModalOpen && (
          <PaymentModal onClose={() => setPaymentModalOpen(false)} onSuccess={() => load(period)} />
        )}

        {loading && (
          <div className={s.loadingWrap}><div className={s.spinner} /></div>
        )}

        {!loading && data && isMerchant && (
          <>
            {/* ── Hero CTA ── */}
            <div className={s.heroCta}>
              <div className={s.heroCtaLeft}>
                <div className={s.heroCtaTag}>💡 PROCHAINE ÉTAPE RECOMMANDÉE</div>
                <h3 className={s.heroCtaTitle}>
                  {(data.publications?.total || 0) - (data.publications?.published || 0) > 0
                    ? `Vous avez ${(data.publications?.total || 0) - (data.publications?.published || 0)} brouillon${(data.publications?.total || 0) - (data.publications?.published || 0) > 1 ? 's' : ''} en attente`
                    : 'Créez votre prochaine merveille'
                  }
                </h3>
                <p className={s.heroCtaSub}>
                  {(data.publications?.total || 0) - (data.publications?.published || 0) > 0
                    ? 'Publiez-les pour qu\'ils soient visibles. Cela ne prend que quelques secondes.'
                    : 'Choisissez un template et personnalisez en quelques minutes.'
                  }
                </p>
              </div>
              <button className={s.heroCtaBtn} onClick={() => navigate('/ewish-admin/ewish')}>
                Voir mes sites <ChevronRight size={14} />
              </button>
            </div>

            {/* ── Stats row ── */}
            <div className={s.statsRow}>
              <StatCard
                label="Crédits" emoji="💎"
                value={user?.credits ?? 0}
                sub={<span><a className={s.linkBrand} onClick={() => setPaymentModalOpen(true)}>Recharger →</a></span>}
                color="#f59e0b"
              />
              <StatCard
                label="Sites totaux" emoji="📁"
                value={data.publications?.total || 0}
                sub={`${data.publications?.published || 0} en ligne · ${(data.publications?.total || 0) - (data.publications?.published || 0)} brouillons`}
                color="#7c3aed"
              />
              <StatCard
                label="Vues ce mois" emoji="👁"
                value={new Intl.NumberFormat('fr-FR').format(data.revenue?.total ? 999 : 0)}
                sub="Visites sur vos sites"
                color="#15803d"
              />
              <StatCard
                label="Transactions" emoji="💳"
                value={data.transactions?.length || 0}
                sub="Achats de crédits"
                color="#e11d48"
              />
            </div>

            {/* ── Transactions ── */}
            <div className={s.card}>
              <div className={s.cardHead}>
                <span className={s.cardTitle}>Historique des achats de crédits</span>
              </div>
              {data.transactions?.length ? (
                <div className={s.tableWrap}>
                  <table className={s.table}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Montant</th>
                        <th>Crédits</th>
                        <th>Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.transactions.map(tx => (
                        <tr key={tx._id}>
                          <td data-label="Date" className={s.muted}>{fmtDate(tx.createdAt)}</td>
                          <td data-label="Montant" className={s.bold}>{fmtPrice(tx.amount)}</td>
                          <td data-label="Crédits">
                            <span className={s.creditPill}>+{tx.credits}</span>
                          </td>
                          <td data-label="Statut">
                            {STATUS_BADGE[tx.status?.toLowerCase()] || tx.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className={s.emptyWrap}>Aucun achat pour le moment</div>
              )}
            </div>
          </>
        )}

        {!loading && data && !isMerchant && (
          <>
            {/* ── Super admin stats ── */}
            <div className={s.statsRow}>
              <StatCard label="Commandes totales" emoji="📦" value={data.orders?.total || 0}     sub={`${data.orders?.pending || 0} en attente`} color="#7c3aed" />
              <StatCard label="Livrées"            emoji="✅" value={data.orders?.delivered || 0} sub={`${data.orders?.confirmed || 0} confirmées`} color="#15803d" />
              <StatCard label="Revenus"            emoji="💰" value={fmtPrice(data.revenue?.total || 0)} sub="Confirmées + livrées" color="#f59e0b" />
              <StatCard label="Conversion"         emoji="📈" value={`${data.funnel?.conversionRate || 0}%`} sub={`${data.funnel?.pageViews || 0} visites → ${data.funnel?.purchases || 0} achats`} color="#e11d48" />
            </div>

            <div className={s.midRow}>
              {/* Funnel */}
              <div className={s.card}>
                <div className={s.cardHead}><span className={s.cardTitle}>Entonnoir d'acquisition</span></div>
                <div className={s.funnel}>
                  {[
                    { label: 'Visites',        val: data.funnel?.pageViews || 0,         color: '#7c3aed' },
                    { label: 'Vus template',   val: data.funnel?.viewContents || 0,      color: '#0ea5e9' },
                    { label: 'Checkout',       val: data.funnel?.initiateCheckouts || 0, color: '#f59e0b' },
                    { label: 'Achats',         val: data.funnel?.purchases || 0,         color: '#15803d' },
                  ].map(({ label, val, color }) => {
                    const max = data.funnel?.pageViews || 1;
                    const pct = Math.round((val / max) * 100);
                    return (
                      <div key={label} className={s.funnelRow}>
                        <div className={s.funnelLabel}>{label}</div>
                        <div className={s.funnelTrack}>
                          <div className={s.funnelBar}
                            style={{ width: `${Math.max(pct, 5)}%`, background: color + '22', borderLeftColor: color }}>
                            <span className={s.funnelVal} style={{ color }}>{val.toLocaleString('fr-FR')}</span>
                          </div>
                        </div>
                        <div className={s.funnelPct}>{pct}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Revenue by day */}
              <div className={s.card}>
                <div className={s.cardHead}>
                  <span className={s.cardTitle}>Revenus par jour</span>
                  <span className={s.revenueTotal}>{fmtPrice(data.revenue?.total)}</span>
                </div>
                {data.revenue?.byDay?.length ? (
                  <div className={s.chart}>
                    {data.revenue.byDay.map((d, i) => {
                      const max = Math.max(...data.revenue.byDay.map(x => x.revenue), 1);
                      const h = Math.max(4, Math.round((d.revenue / max) * 80));
                      return (
                        <div key={i} className={s.chartBar} style={{ height: h }}
                          title={`${d._id}\n${new Intl.NumberFormat('fr-FR').format(d.revenue)} FCFA`} />
                      );
                    })}
                  </div>
                ) : (
                  <div className={s.noData}>Pas encore de données</div>
                )}
              </div>
            </div>
          </>
        )}
      </PageShell>
      <WhatsAppFAB />
    </>
  );
}
