import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, LogOut, CalendarDays } from 'lucide-react';
import { useAuth } from '../admin/context/AuthContext';
import { getPublications } from '../utils/api';
import styles from './ProfilePage.module.css';

const AVATAR_PALETTES = [
  { bg: '#FFB3C1', color: '#9C1632' },
  { bg: '#D7C5F2', color: '#5C3A9D' },
  { bg: '#C9EEDF', color: '#1F6E55' },
  { bg: '#FFE7AD', color: '#8A5800' },
  { bg: '#FFD7C2', color: '#A03C13' },
];

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
  const { user, logout } = useAuth();
  const navigate  = useNavigate();
  const [pubCount, setPubCount]   = useState(null);

  const handleLogout = async () => {
    await logout();
    navigate('/ewish-admin/login');
  };

  useEffect(() => {
    getPublications({ mine: true, limit: 500 })
      .then(r => setPubCount(Array.isArray(r.data) ? r.data.filter(p => !p.isPremade).length : 0))
      .catch(() => setPubCount(0));
  }, []);

  const name    = user?.name || 'Utilisateur';
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const avatar  = avatarPalette(name);

  const MENU = [
    {
      iconEl: <CalendarDays size={20} />,
      iconBg: '#EDE8F8',
      iconColor: '#6E4FBA',
      title: 'Mes dates',
      sub: 'Anniversaires, occasions — rappels 3 jours avant',
      onClick: () => navigate('/ewish-admin/dates'),
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

      {/* ── Logout (mobile-friendly action) ── */}
      <div className={styles.logoutWrap}>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <LogOut size={17} />
          <span>Se déconnecter</span>
        </button>
      </div>

    </div>
  );
}

