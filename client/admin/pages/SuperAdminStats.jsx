import { useState, useEffect } from 'react';
import { Users, BookOpen, Globe, Coins, TrendingUp, Award, DollarSign, History, ArrowUpRight } from 'lucide-react';
import { getSuperAdminStats, getSuperAdminTransactions } from '../../utils/api';
import PageShell from '../components/PageShell';
import s from './SuperAdminStats.module.css';

const KPI_COLORS = ['#be185d', '#4f46e5', '#047857', '#b45309', '#0891b2'];

function KpiCard({ icon, label, value, sub, color = '#4f46e5' }) {
  return (
    <div className={s.kpiCard} style={{ borderLeftColor: color }}>
      <div className={s.kpiIcon} style={{ color }}>{icon}</div>
      <div className={s.kpiValue}>{value ?? '—'}</div>
      <div className={s.kpiLabel}>{label}</div>
      {sub && <div className={s.kpiSub}>{sub}</div>}
    </div>
  );
}

export default function SuperAdminStats() {
  const [stats, setStats]             = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    Promise.all([getSuperAdminStats(), getSuperAdminTransactions({ limit: 12 })])
      .then(([sr, tr]) => { setStats(sr.data); setTransactions(tr.data.transactions); })
      .catch(err => console.error('Stats error:', err))
      .finally(() => setLoading(false));
  }, []);

  const fmt   = (p) => new Intl.NumberFormat('fr-FR').format(p || 0) + ' FCFA';
  const fmtN  = (n) => new Intl.NumberFormat('fr-FR').format(n || 0);
  const fmtDt = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const publishRate = stats?.totalPubs > 0
    ? Math.round(stats.publishedPubs / stats.totalPubs * 100)
    : 0;
  const growthPct = stats?.totalUsers > 0
    ? Math.round(stats.newUsers30d / stats.totalUsers * 100)
    : 0;

  return (
    <PageShell title="Statistiques plateforme" subtitle="Vue globale de la santé de la plateforme">
      {loading ? (
        <div className={s.loading}>Chargement…</div>
      ) : !stats ? (
        <div className={s.error}>Impossible de charger les données</div>
      ) : (
        <>
          {/* ── KPI grid ── */}
          <div className={s.kpiGrid}>
            <KpiCard
              icon={<Users size={20} />}
              label="Marchands actifs"
              value={fmtN(stats.totalUsers)}
              sub={`+${stats.newUsers30d} ce mois · ${growthPct}% croissance`}
              color="#be185d"
            />
            <KpiCard
              icon={<BookOpen size={20} />}
              label="Publications totales"
              value={fmtN(stats.totalPubs)}
              sub={`${stats.publishedPubs} publiées (${publishRate}%)`}
              color="#4f46e5"
            />
            <KpiCard
              icon={<Globe size={20} />}
              label="Taux de publication"
              value={`${publishRate}%`}
              sub={`${stats.publishedPubs} en ligne sur ${stats.totalPubs}`}
              color="#047857"
            />
            <KpiCard
              icon={<Coins size={20} />}
              label="Crédits en circulation"
              value={fmtN(stats.totalCredits)}
              sub="Chez tous les marchands"
              color="#b45309"
            />
            <KpiCard
              icon={<DollarSign size={20} />}
              label="Revenus totaux"
              value={fmt(stats.totalRevenue)}
              sub="Toutes transactions confondues"
              color="#0891b2"
            />
          </div>

          {/* ── Two-column bottom ── */}
          <div className={s.twoCol}>
            {/* Top templates */}
            {stats.topTemplates?.length > 0 && (
              <div className={s.section}>
                <div className={s.sectionTitle}><Award size={15} /> Top templates</div>
                <div className={s.templateList}>
                  {stats.topTemplates.map((t, i) => {
                    const pct = Math.round(t.count / stats.topTemplates[0].count * 100);
                    const color = KPI_COLORS[i % KPI_COLORS.length];
                    return (
                      <div key={t._id} className={s.templateRow}>
                        <span className={s.rank} style={{ color }}>{i + 1}</span>
                        <div className={s.tplInfo}>
                          <span className={s.tplName}>{t._id}</span>
                          <div className={s.bar}>
                            <div className={s.barFill} style={{ width: `${pct}%`, background: color }} />
                          </div>
                        </div>
                        <span className={s.tplCount} style={{ color }}>{t.count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Growth */}
            <div className={s.section}>
              <div className={s.sectionTitle}><TrendingUp size={15} /> Croissance</div>
              <div className={s.growthGrid}>
                <div className={s.growthItem}>
                  <div className={s.growthVal} style={{ color: '#be185d' }}>{stats.newUsers30d}</div>
                  <div className={s.growthLabel}>Nouveaux inscrits (30j)</div>
                </div>
                <div className={s.growthItem}>
                  <div className={s.growthVal} style={{ color: '#047857' }}>{growthPct}%</div>
                  <div className={s.growthLabel}>Croissance mensuelle</div>
                </div>
                <div className={s.growthItem}>
                  <div className={s.growthVal} style={{ color: '#4f46e5' }}>{publishRate}%</div>
                  <div className={s.growthLabel}>Taux de publication</div>
                </div>
                <div className={s.growthItem}>
                  <div className={s.growthVal} style={{ color: '#b45309' }}>
                    {stats.totalUsers > 0 ? Math.round(stats.totalPubs / stats.totalUsers * 10) / 10 : 0}
                  </div>
                  <div className={s.growthLabel}>Pubs par marchand (moy.)</div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Transactions ── */}
          <div className={s.section}>
            <div className={s.sectionTitle}><History size={15} /> Dernières transactions</div>
            <div className={s.tableWrap}>
              {transactions.length > 0 ? (
                <table className={s.table}>
                  <thead>
                    <tr>
                      <th>Marchand</th>
                      <th>Montant</th>
                      <th>Crédits</th>
                      <th>Statut</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(tx => (
                      <tr key={tx._id}>
                        <td data-label="Marchand">
                          <div className={s.adminName}>{tx.adminId?.name || '—'}</div>
                          <div className={s.adminEmail}>{tx.adminId?.email || '—'}</div>
                        </td>
                        <td data-label="Montant" className={s.bold}>{fmt(tx.amount)}</td>
                        <td data-label="Crédits"><span className={s.creditPill}>+{tx.credits}</span></td>
                        <td data-label="Statut">
                          <span className={`${s.badge} ${tx.status === 'SUCCESS' ? s.success : s.failed}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td data-label="Date" className={s.date}>{fmtDt(tx.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className={s.empty}>Aucune transaction enregistrée</div>
              )}
            </div>
          </div>
        </>
      )}
    </PageShell>
  );
}
