import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnalytics, buyCredits } from '../../utils/api';
import { useAuth } from '../context/AuthContext';
import PageShell from '../components/PageShell';
import PaymentModal from '../components/PaymentModal';
import WhatsAppFAB from '../../components/WhatsAppFAB';
import { Diamond, Package, CheckCircle, CircleDollarSign, TrendingUp, Inbox, PlaySquare, AlertTriangle, Plus, ArrowRight } from 'lucide-react';
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
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleBuyCredits = () => {
    setPaymentModalOpen(true);
  };

  useEffect(() => { load(period); }, [period]);

  const load = async (p) => {
    setLoading(true);
    try { const r = await getAnalytics(p); setData(r.data); }
    catch { setData(null); }
    finally { setLoading(false); }
  };

  return (
    <>
    <PageShell
      title="Dashboard"
      subtitle="Vue d'ensemble de l'activité"
      actions={
        <div style={{display:'flex', gap:'5px'}}>
          <button className={s.createBtn} onClick={() => navigate('/ewish-admin/ewish')}>
            Créer mon site <ArrowRight size={18} />
          </button>
          <div className={s.periods}>
            {['7d','30d','90d'].map(p => (
              <button key={p} className={`${s.periodBtn} ${period === p ? s.active : ''}`} onClick={() => setPeriod(p)}>
                {p === '7d' ? '7 jours' : p === '30d' ? '30 jours' : '90 jours'}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {paymentModalOpen && (
        <PaymentModal 
          onClose={() => setPaymentModalOpen(false)} 
          onSuccess={() => { load(period); }} 
        />
      )}
      {loading && <div className={s.loadingWrap}><div className={s.spinner} /></div>}
      {!loading && data && <>
        {user?.role === 'merchant' ? (
          <>
            {/* {(user?.credits ?? 99) <= 2 && (
              <div className={s.lowCreditsWarn}>
                <AlertTriangle size={18} style={{flexShrink:0}} />
                <div>
                  <strong>Crédits faibles !</strong> Il vous reste seulement <strong>{user.credits}</strong> crédit{user.credits !== 1 ? 's' : ''}.
                  Rechargez maintenant pour continuer à créer.
                </div>
                <button onClick={handleBuyCredits} className={s.buyBtn} style={{flexShrink:0}}>Recharger</button>
              </div>
            )} */}

            {/* ── Main CTA ── */}
            <div className={s.mainCta} onClick={() => navigate('/ewish-admin/ewish')}>
              <div className={s.ctaText}>
                <h3>Prêt à créer votre prochaine merveille ?</h3>
                <p>Choisissez un template et commencez la personnalisation en quelques clics.</p>
              </div>
              <button className={s.ctaBtn}>
                <Plus size={20} /> Commencer à créer
              </button>
            </div>

            {/* ── Merchant Stats ── */}
            <div className={s.statsRow}>
              <StatCard label="Crédits" value={user?.credits || 0} icon={<Diamond size={24} />} meta={<button onClick={handleBuyCredits} className={s.buyBtn}>Acheter</button>} colorClass={s.gold} isText />
              <StatCard label="Total Publications" value={data.publications?.total || 0} icon={<PlaySquare size={24} />} meta="Publications créées" />
              <StatCard label="Publiées" value={data.publications?.published || 0} icon={<CheckCircle size={24} />} meta="En ligne" colorClass={s.green} />
            </div>

            <div className={s.midRow}>
              {/* Transactions History */}
              <div className={s.card} style={{ flex: 2 }}>
                <div className={s.cardHead}>
                  <span className={s.cardTitle}>Historique d'achat de crédits</span>
                </div>
                <div className={s.tableWrap}>
                  {data.transactions?.length ? (
                    <table className={s.table}>
                      <thead>
                        <tr><th>Date</th><th>Montant</th><th>Crédits</th><th>Statut</th></tr>
                      </thead>
                      <tbody>
                        {data.transactions.map(tx => (
                          <tr key={tx._id}>
                            <td data-label="Date" className={s.muted}>{fmtDate(tx.createdAt)}</td>
                            <td data-label="Montant" className={s.bold}>{fmtPrice(tx.amount)}</td>
                            <td data-label="Crédits" style={{color: 'var(--gold)'}}>+{tx.credits}</td>
                            <td data-label="Statut">{BADGE[tx.status?.toLowerCase()] || tx.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className={s.emptyWrap}><span className={s.emptyIcon}><Inbox size={32} /></span>Aucun achat</div>
                  )}
                </div>
              </div>

              {/* Templates Usage */}
              <div className={s.card} style={{ flex: 1 }}>
                <div className={s.cardHead}>
                  <span className={s.cardTitle}>Templates utilisés</span>
                </div>
                <div className={s.tableWrap}>
                  {data.publicationsByTemplate?.length ? (
                    <table className={s.table}>
                      <thead>
                        <tr><th>Template</th><th>Quantité</th></tr>
                      </thead>
                      <tbody>
                        {data.publicationsByTemplate.map(pt => (
                          <tr key={pt._id}>
                            <td data-label="Template" className={s.bold}>{pt._id}</td>
                            <td data-label="Quantité">{pt.count}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className={s.emptyWrap}>Aucune donnée</div>
                  )}
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* ── Super Admin Stats ── */}
            <div className={s.statsRow}>
              <StatCard label="Commandes totales" value={data.orders?.total || 0}     icon={<Package size={24} />} meta={`${data.orders?.pending || 0} en attente`} />
              <StatCard label="Livrées"            value={data.orders?.delivered || 0} icon={<CheckCircle size={24} />} meta={`${data.orders?.confirmed || 0} confirmées`} colorClass={s.green} />
              <StatCard label="Revenus"            value={fmtPrice(data.revenue?.total || 0)} icon={<CircleDollarSign size={24} />} meta="Confirmées + livrées" colorClass={s.gold} isText />
              <StatCard label="Conversion"         value={`${data.funnel?.conversionRate || 0}%`} icon={<TrendingUp size={24} />} meta={`${data.funnel?.pageViews || 0} visites → ${data.funnel?.purchases || 0} achats`} isText />
            </div>

            {/* ── Mid row ── */}
            <div className={s.midRow}>
              {/* Funnel */}
              <div className={s.card}>
                <div className={s.cardHead}><span className={s.cardTitle}>Entonnoir Facebook</span></div>
                <div className={s.funnel}>
                  {[
                    { label: 'Visites',      val: data.funnel?.pageViews || 0,         color: '#4e9eff' },
                    { label: 'Vus template', val: data.funnel?.viewContents || 0,      color: '#c8963e' },
                    { label: 'Checkout',     val: data.funnel?.initiateCheckouts || 0, color: '#f0a030' },
                    { label: 'Achats',       val: data.funnel?.purchases || 0,         color: '#3ecf8e' },
                  ].map(({ label, val, color }) => {
                    const max = data.funnel?.pageViews || 1;
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
                  <span className={s.revenueTotal}>{fmtPrice(data.revenue?.total)}</span>
                </div>
                <RevenueChart data={data.revenue?.byDay || []} />
              </div>
            </div>
          </>
        )}
      </>}
    </PageShell>
    <WhatsAppFAB />
    </>
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