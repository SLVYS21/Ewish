import { useState, useEffect } from 'react';
import { Users, BookOpen, Globe, Coins, TrendingUp, Award, DollarSign, History } from 'lucide-react';
import { getSuperAdminStats, getSuperAdminTransactions } from '../../utils/api';
import PageShell from '../components/PageShell';
import s from './SuperAdminStats.module.css';

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className={`${s.card} ${accent ? s.accent : ''}`}>
      <div className={s.cardIcon}>{icon}</div>
      <div className={s.cardValue}>{value ?? '—'}</div>
      <div className={s.cardLabel}>{label}</div>
      {sub && <div className={s.cardSub}>{sub}</div>}
    </div>
  );
}

export default function SuperAdminStats() {
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getSuperAdminStats(),
      getSuperAdminTransactions({ limit: 10 })
    ])
      .then(([statsRes, txRes]) => {
        setStats(statsRes.data);
        setTransactions(txRes.data.transactions);
      })
      .catch((err) => console.error("Error loading stats:", err))
      .finally(() => setLoading(false));
  }, []);

  const fmtPrice = (p) => new Intl.NumberFormat('fr-FR').format(p || 0) + ' FCFA';

  return (
    <PageShell title="Statistiques plateforme">
      {loading ? (
        <div className={s.loading}>Chargement…</div>
      ) : !stats ? (
        <div className={s.error}>Impossible de charger les stats</div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className={s.grid}>
            <StatCard
              icon={<Users size={22} />}
              label="Marchands actifs"
              value={stats.totalUsers}
              sub={`+${stats.newUsers30d} ce mois`}
              accent
            />
            <StatCard
              icon={<BookOpen size={22} />}
              label="Publications totales"
              value={stats.totalPubs}
              sub={`${stats.publishedPubs} publiées`}
            />
            <StatCard
              icon={<Globe size={22} />}
              label="Publications publiées"
              value={stats.publishedPubs}
              sub={`${stats.totalPubs > 0 ? Math.round(stats.publishedPubs / stats.totalPubs * 100) : 0}% du total`}
            />
            <StatCard
              icon={<Coins size={22} />}
              label="Crédits en circulation"
              value={stats.totalCredits}
            />
            <StatCard
              icon={<DollarSign size={22} />}
              label="Revenus totaux"
              value={fmtPrice(stats.totalRevenue)}
              accent
            />
          </div>

          {/* Top templates */}
          {stats.topTemplates?.length > 0 && (
            <div className={s.section}>
              <div className={s.sectionTitle}>
                <Award size={16} /> Top templates
              </div>
              <div className={s.templateList}>
                {stats.topTemplates.map((t, i) => (
                  <div key={t._id} className={s.templateRow}>
                    <span className={s.rank}>#{i + 1}</span>
                    <span className={s.tplName}>{t._id}</span>
                    <span className={s.tplCount}>{t.count} pub{t.count > 1 ? 's' : ''}</span>
                    <div className={s.bar}>
                      <div
                        className={s.barFill}
                        style={{ width: `${Math.round(t.count / stats.topTemplates[0].count * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Nouveaux inscrits */}
          <div className={s.section}>
            <div className={s.sectionTitle}>
              <TrendingUp size={16} /> Croissance
            </div>
            <div className={s.growthRow}>
              <div className={s.growthItem}>
                <div className={s.growthVal}>{stats.newUsers30d}</div>
                <div className={s.growthLabel}>Nouveaux inscrits (30j)</div>
              </div>
              <div className={s.growthItem}>
                <div className={s.growthVal}>
                  {stats.totalUsers > 0 ? Math.round(stats.newUsers30d / stats.totalUsers * 100) : 0}%
                </div>
                <div className={s.growthLabel}>Croissance mensuelle</div>
              </div>
            </div>
          </div>

          {/* Transactions History */}
          <div className={s.section}>
            <div className={s.sectionTitle}>
              <History size={16} /> Dernières transactions
            </div>
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
                        <td>
                          <div className={s.adminName}>{tx.adminId?.name || '—'}</div>
                          <div className={s.adminEmail}>{tx.adminId?.email || '—'}</div>
                        </td>
                        <td className={s.bold}>{fmtPrice(tx.amount)}</td>
                        <td>{tx.credits}</td>
                        <td>
                          <span className={`${s.badge} ${tx.status === 'SUCCESS' ? s.success : s.failed}`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className={s.date}>
                          {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
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
