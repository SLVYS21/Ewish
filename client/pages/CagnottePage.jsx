import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, Share2, Heart, Check, Users, Target, Calendar, AlertCircle } from 'lucide-react';
import { getContributions, getContributionStats } from '../utils/api';
import { useAuth } from '../admin/context/AuthContext';
import styles from './CagnottePage.module.css';

function Stat({ label, value, suffix, icon }) {
  const icons = {
    Users:    <Users size={16}/>,
    Wallet:   <Wallet size={16}/>,
    Target:   <Target size={16}/>,
    Calendar: <Calendar size={16}/>,
  };
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.7)', color: 'var(--mk-rose)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
        {icons[icon]}
      </span>
      <div>
        <div style={{ fontSize: 11, color: 'var(--mk-ink-3)', fontWeight: 700, letterSpacing: '.03em' }}>{label}</div>
        <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--mk-ink)' }}>
          {value} {suffix && <span style={{ fontSize: 10.5, color: 'var(--mk-ink-2)', fontWeight: 600 }}>{suffix}</span>}
        </div>
      </div>
    </div>
  );
}

function Avatar({ name, color, size = 42 }) {
  const COLORS = ['#FFB3C1', '#D7C5F2', '#C9EEDF', '#FFE7AD', '#FFD7C2', '#B3D9FF'];
  const bg = color || COLORS[(name || '?').charCodeAt(0) % COLORS.length];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size, height: size, borderRadius: '50%', background: bg, color: 'var(--mk-ink)', fontWeight: 800, fontSize: size * 0.4, flexShrink: 0 }}>
      {(name || '?')[0].toUpperCase()}
    </span>
  );
}

function timeAgo(date) {
  if (!date) return '';
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "aujourd'hui";
  if (days === 1) return 'il y a 1j';
  return `il y a ${days}j`;
}

export default function CagnottePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [contribs, setContribs] = useState([]);
  const [stats, setStats] = useState({ total: 0, count: 0, goal: 0, pct: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) { navigate('/ewish-admin'); return; }
    const load = async () => {
      setLoading(true);
      try {
        const [cRes, sRes] = await Promise.all([
          getContributions(id),
          getContributionStats(id),
        ]);
        setContribs(cRes.data || []);
        setStats(sRes.data || { total: 0, count: 0, goal: 0, pct: 0 });
      } catch {}
      setLoading(false);
    };
    load();
  }, [id]);

  const collected = stats.total;
  const goal = stats.goal;
  const pct = stats.pct;
  const avgAmount = stats.count > 0 ? Math.round(collected / stats.count) : 0;

  const kycApproved = user?.kycStatus === 'approved';
  const kycMethod = user?.kycMethod || '';
  const kycPhone = user?.kycPhone || '';

  const methodEmoji = { mtn: '📱', moov: '📲', or: '📞', bank: '🏦' };
  const methodLabel = { mtn: 'MTN MoMo', moov: 'Moov Money', or: 'Orange Money', bank: 'Virement' };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--mk-blush)', borderTopColor: 'var(--mk-rose)', animation: 'spin .75s linear infinite' }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div className={styles.headerHand}>🎁 Cagnotte cadeau</div>
        <h1 className={styles.headerTitle}>Suivi des contributions</h1>
      </div>

      <div className={styles.layout}>
        {/* Progress card */}
        <div className={styles.progressCard}>
          <div className={styles.blob}/>
          <div style={{ position: 'relative' }}>
            <div className={styles.collectedLabel}>COLLECTÉ</div>
            <div className={styles.collectedAmount}>
              <span className={styles.bigNumber}>{collected.toLocaleString('fr-FR')}</span>
              <span className={styles.bigCurrency}>FCFA</span>
            </div>
            {goal > 0 && (
              <div className={styles.goalText}>sur <strong>{goal.toLocaleString('fr-FR')} FCFA</strong> · objectif</div>
            )}

            {goal > 0 && (
              <div className={styles.progressTrack}>
                <div className={styles.progressFill} style={{ width: Math.min(pct, 100) + '%' }}>
                  <span className={styles.progressPct}>{pct}%</span>
                </div>
              </div>
            )}

            <div className={styles.statsRow}>
              <Stat label="Contributions"     value={stats.count} icon="Users"/>
              <Stat label="Moy. par personne" value={avgAmount.toLocaleString('fr-FR')} suffix="FCFA" icon="Wallet"/>
              {goal > 0 && (
                <Stat label="Reste" value={(Math.max(goal - collected, 0)).toLocaleString('fr-FR')} suffix="FCFA" icon="Target"/>
              )}
            </div>

            <div className={styles.actions}>
              {kycApproved ? (
                <button className={styles.btnWithdraw}>
                  <Wallet size={14}/> Retirer ({collected.toLocaleString('fr-FR')} FCFA)
                </button>
              ) : (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
                  borderRadius: 12, background: 'rgba(255,255,255,.6)', fontSize: 13, color: 'var(--mk-ink-2)',
                }}>
                  <AlertCircle size={15} style={{ flexShrink: 0, color: '#E11D48' }}/>
                  KYC requis pour retirer les fonds
                </div>
              )}
              <button className={styles.btnRelance}>
                <Share2 size={14}/> Relancer mes invités
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className={styles.sidebar}>
          <div className={styles.infoCard}>
            <div className={styles.infoLabel}>RÉCEPTION</div>
            {kycMethod ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ width: 44, height: 44, borderRadius: 12, background: '#FFC95A', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                  {methodEmoji[kycMethod] || '💳'}
                </span>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 14 }}>{methodLabel[kycMethod] || kycMethod} · {kycPhone}</div>
                  <div style={{ fontSize: 11.5, color: kycApproved ? 'var(--mk-mint)' : '#E11D48', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                    {kycApproved ? <><Check size={12}/> Vérifié — KYC validé</> : '⏳ KYC en cours de validation'}
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--mk-ink-3)', fontStyle: 'italic' }}>
                Aucune méthode configurée. Complétez la vérification KYC.
              </div>
            )}
            <button className={styles.modifyBtn}>Modifier la méthode →</button>
          </div>

          <div className={styles.feesCard}>
            <div className={styles.infoLabel}>FRAIS</div>
            <div style={{ fontSize: 13, color: 'var(--mk-ink-2)', lineHeight: 1.5 }}>
              myKado prélève <strong style={{ color: 'var(--mk-rose)' }}>5%</strong> sur les contributions reçues.
              {collected > 0 && <> Soit <strong>{Math.round(collected * 0.05).toLocaleString('fr-FR')} FCFA</strong> sur ce total.</>}
            </div>
          </div>
        </div>
      </div>

      {/* Contributions */}
      <section className={styles.contribSection}>
        <div className={styles.contribHeader}>
          <div className={styles.eyebrow}>LES CONTRIBUTIONS</div>
          <h2 className={styles.contribTitle}>Les belles personnes</h2>
          <p className={styles.contribSub}>Ceux qui ont déjà mis la main au cadeau.</p>
        </div>

        {contribs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--mk-ink-3)' }}>
            <div style={{ fontSize: 40, marginBottom: 10 }}>🎁</div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Aucune contribution pour le moment</div>
            <div style={{ fontSize: 13, marginTop: 6 }}>Partagez votre lien pour recevoir les premières contributions !</div>
          </div>
        ) : (
          <div className={styles.contribList}>
            {contribs.map(c => {
              const displayName = c.isAnonymous ? 'Anonyme' : (c.contributorName || 'Contributeur');
              return (
                <div key={c._id || c.transactionId} className={styles.contribRow}>
                  <Avatar name={displayName}/>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{displayName}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--mk-ink-3)' }}>
                      #{c.transactionId?.slice(-8) || '—'}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{ fontFamily: 'var(--mk-display)', fontStyle: 'italic', fontSize: 22, color: 'var(--mk-rose)', lineHeight: 1 }}>+{c.amount.toLocaleString('fr-FR')}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--mk-ink-3)', fontWeight: 600 }}>{timeAgo(c.createdAt)}</div>
                  </div>
                  <button style={{ padding: 8, borderRadius: 10, background: 'var(--mk-mint-soft)', color: '#1F6E55' }} title="Envoyer un merci">
                    <Heart size={14}/>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
