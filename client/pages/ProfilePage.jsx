import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Gem, CheckCircle2, Clock, AlertCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../admin/context/AuthContext';
import { getPublications } from '../utils/api';
import KycModal from '../components/KycModal';
import styles from './ProfilePage.module.css';

const AVATAR_PALETTES = [
  { bg: '#FFB3C1', color: '#9C1632' },
  { bg: '#D7C5F2', color: '#5C3A9D' },
  { bg: '#C9EEDF', color: '#1F6E55' },
  { bg: '#FFE7AD', color: '#8A5800' },
  { bg: '#FFD7C2', color: '#A03C13' },
];

const KYC_CFG = {
  none:     { label: 'Non vérifié',  color: '#9B7EBF', iconBg: '#F5F0FF' },
  pending:  { label: 'En attente',   color: '#D97706', iconBg: '#FFFBEB' },
  approved: { label: 'Validé',       color: '#1F6E55', iconBg: '#D4F1E5' },
  rejected: { label: 'Rejeté',       color: '#B91C1C', iconBg: '#FFE0E0' },
};

function avatarPalette(name = '') {
  return AVATAR_PALETTES[(name.charCodeAt(0) + name.length) % AVATAR_PALETTES.length];
}

function memberYear(createdAt) {
  return createdAt ? new Date(createdAt).getFullYear() : new Date().getFullYear();
}

function roleLabel(role) {
  if (role === 'super_admin') return 'Super Admin';
  if (role === 'admin') return 'Admin';
  return 'Particulier';
}

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [pubCount, setPubCount]   = useState(null);
  const [showKyc,  setShowKyc]    = useState(false);

  useEffect(() => {
    getPublications({ mine: true, limit: 500 })
      .then(r => setPubCount(Array.isArray(r.data) ? r.data.filter(p => !p.isPremade).length : 0))
      .catch(() => setPubCount(0));
  }, []);

  const name    = user?.name || 'Utilisateur';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const avatar  = avatarPalette(name);
  const kyc     = KYC_CFG[user?.kycStatus || 'none'];

  const MENU = [
    {
      iconEl: <Wallet />,
      iconBg: '#FFF0F3',
      iconColor: '#E11D48',
      title: 'Mes crédits',
      sub: `${user?.credits ?? 0} crédit${(user?.credits ?? 0) !== 1 ? 's' : ''} · recharger`,
      onClick: () => navigate('/ewish-admin/credits'),
    },
    {
      iconEl: <Target />,
      iconBg: '#EDE8F8',
      iconColor: '#6E4FBA',
      title: 'Mes cagnottes',
      sub: 'Gérer mes collectes',
      onClick: () => navigate('/ewish-admin/cagnotte'),
    },
    {
      iconEl: <MailHeart />,
      iconBg: '#D4F1E5',
      iconColor: '#1F6E55',
      title: 'Boîte à vœux',
      sub: 'Voir les vœux reçus',
      onClick: () => navigate('/ewish-admin/wishes'),
    },
    {
      iconEl: <ShieldCheck size={20} />,
      iconBg: kyc.iconBg,
      iconColor: kyc.color,
      title: 'Vérification (KYC)',
      sub: kyc.label,
      subColor: kyc.color,
      rightEl: user?.kycStatus === 'approved'
        ? <CheckCircle2 size={18} color="#1F6E55" style={{ marginRight: 4, flexShrink: 0 }} />
        : null,
      onClick: () => setShowKyc(true),
    },
    {
      iconEl: <BriefcaseIcon />,
      iconBg: '#FFFBEB',
      iconColor: '#D97706',
      title: 'Profil de marque',
      sub: 'Bouton vers ton site / WhatsApp',
      badge: 'PRO',
      onClick: () => navigate('/ewish-admin/settings'),
    },
    {
      iconEl: <GearIcon />,
      iconBg: '#F5F0FF',
      iconColor: '#7C5CBF',
      title: 'Réglages',
      sub: 'Notifs, langue, sécurité',
      onClick: () => navigate('/ewish-admin/settings'),
    },
  ];

  return (
    <div className={styles.root}>

      {/* ── Hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.avatar} style={{ background: avatar.bg, color: avatar.color }}>
          {initials}
        </div>
        <h1 className={styles.heroName}>{name}</h1>
        <p className={styles.heroRole}>
          {roleLabel(user?.role)} · membre depuis {memberYear(user?.createdAt)}
        </p>

        <div className={styles.statsStrip}>
          <div className={styles.stat}>
            <span className={styles.statVal}>{pubCount ?? ''}</span>
            <span className={styles.statLbl}>créations</span>
          </div>
          <div className={styles.statSep} />
          <div className={styles.stat}>
            <span className={styles.statVal} style={{ color: 'var(--mk-rose, #E11D48)', display: 'flex', alignItems: 'center', gap: 3 }}>
              <Gem size={15} />
              {user?.credits ?? 0}
            </span>
            <span className={styles.statLbl}>crédits</span>
          </div>
          <div className={styles.statSep} />
          <div className={styles.stat}>
            <span className={styles.statVal}></span>
            <span className={styles.statLbl}>vœux reçus</span>
          </div>
        </div>
      </div>

      {/* ── Menu ── */}
      <div className={styles.menuList}>
        {MENU.map((item, i) => (
          <button key={i} className={styles.menuItem} onClick={item.onClick}>
            <div
              className={styles.menuIcon}
              style={{ background: item.iconBg, color: item.iconColor }}
            >
              {item.iconEl}
            </div>

            <div className={styles.menuBody}>
              <span className={styles.menuTitle}>{item.title}</span>
              <span className={styles.menuSub} style={item.subColor ? { color: item.subColor } : {}}>
                {item.sub}
              </span>
            </div>

            <div className={styles.menuRight}>
              {item.badge && <span className={styles.proBadge}>{item.badge}</span>}
              {item.rightEl}
              <ChevronRight size={16} className={styles.chevron} />
            </div>
          </button>
        ))}
      </div>

      {showKyc && <KycModal onClose={() => setShowKyc(false)} />}
    </div>
  );
}

/* ── Inline mini-icons (avoid icon lib weight for custom shapes) ── */
function Wallet() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
    </svg>
  );
}
function Target() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
    </svg>
  );
}
function MailHeart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 13V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      <path d="M18 22a4 4 0 1 0 0-8 4 4 0 0 0 0 8"/>
      <path d="m15.5 17.5 1 1 2-2"/>
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="7" rx="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}
function GearIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
