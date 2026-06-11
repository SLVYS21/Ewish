import { useState } from 'react';
import { NavLink, useNavigate, useLocation, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Menu, X, Home, Sparkles, Folder, Target, Mail,
  Wallet, Settings, Plus, ShieldAlert, BarChart2,
  Users, Ticket, Images, Cog, User, BadgeCheck,
} from 'lucide-react';
import WhatsAppFAB from '../../components/WhatsAppFAB';
import s from './AdminLayout.module.css';

const NAV = [
  { to: '/ewish-admin',           icon: <Home size={17} />,     label: 'Accueil',        end: true },
  { to: '/ewish-admin/templates', icon: <Sparkles size={17} />, label: 'Templates'       },
  { to: '/ewish-admin/ewish',     icon: <Folder size={17} />,   label: 'Mes créations'   },
  { to: '/ewish-admin/cagnotte',  icon: <Target size={17} />,   label: 'Cagnottes',      badge: '2' },
  { to: '/ewish-admin/wishes',    icon: <Mail size={17} />,     label: 'Boîte à vœux'   },
];

const NAV_BOTTOM = [
  { to: '/ewish-admin/credits',  icon: <Wallet size={17} />,   label: 'Crédits'    },
  { to: '/ewish-admin/profile',  icon: <Settings size={17} />, label: 'Réglages'   },
];

const SUPER_NAV = [
  { to: '/ewish-admin/admin',          icon: <BarChart2 size={17} />,   label: 'Tableau de bord' },
  { to: '/ewish-admin/super/stats',    icon: <BarChart2 size={17} />,   label: 'Statistiques'    },
  { to: '/ewish-admin/super/users',    icon: <Users size={17} />,       label: 'Utilisateurs'    },
  { to: '/ewish-admin/super/kyc',      icon: <BadgeCheck size={17} />,  label: 'Vérif. KYC'      },
  { to: '/ewish-admin/super/promos',   icon: <Ticket size={17} />,      label: 'Codes Promo'     },
  { to: '/ewish-admin/super/assets',   icon: <Images size={17} />,      label: "Banque d'images" },
  { to: '/ewish-admin/super-templates',icon: <Sparkles size={17}/>,     label: 'Templates & Prix'},
  { to: '/ewish-admin/super/prospection', icon: <Target size={17}/>,    label: 'Prospection'     },
  { to: '/ewish-admin/super/settings', icon: <Cog size={17} />,         label: 'Configuration'   },
];

const AVATAR_PALETTE = ['#FFB3C1', '#D7C5F2', '#C9EEDF', '#FFE7AD', '#FFD7C2'];
const AVATAR_INK     = ['#9C1632', '#5C3A9D', '#1F6E55', '#8A5800', '#A03C13'];
function avatarStyle(name = 'A') {
  const idx = (name.charCodeAt(0) + name.length) % AVATAR_PALETTE.length;
  return { background: AVATAR_PALETTE[idx], color: AVATAR_INK[idx] };
}

const BOTTOM_TABS = [
  { to: '/ewish-admin',           key: 'home',      Icon: Home,     label: 'Accueil',  end: true },
  { to: '/ewish-admin/templates', key: 'templates', Icon: Sparkles, label: 'Templates' },
  { to: '/ewish-admin/cagnotte',  key: 'cagnotte',  Icon: Target,   label: 'Cagnottes' },
  { to: '/ewish-admin/profile',   key: 'profil',    Icon: User,     label: 'Profil'   },
];

export default function AdminLayout({ pendingCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSuperAdmin = user?.role === 'super_admin';

  const handleLogout = async () => {
    await logout();
    navigate('/ewish-admin/login');
  };

  const renderNav = (items) => items.map(({ to, icon, label, end, badge }) => (
    <NavLink
      key={to + label} to={to} end={end}
      onClick={() => setMobileOpen(false)}
      className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''}`}
    >
      <span className={s.navActivePip} />
      <span className={s.navIcon}>{icon}</span>
      <span className={s.navLabel}>{label}</span>
      {badge && <span className={s.navBadge}>{badge}</span>}
    </NavLink>
  ));

  const displayName = user?.name || user?.email || 'Utilisateur';

  return (
    <div className={s.shell}>
      {/* Mobile Header */}
      <div className={s.mobileHeader}>
        <div className={s.logo}>
          <KadoBow />
          <div className={s.logoTexts}>
            <span className={s.logoName}>myKado</span>
          </div>
        </div>
        <button className={s.menuBtn} onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <div className={`${s.sidebarOverlay} ${mobileOpen ? s.open : ''}`} onClick={() => setMobileOpen(false)} />

      {/* Sidebar */}
      <aside className={`${s.sidebar} ${mobileOpen ? s.open : ''}`}>
        {/* Brand */}
        <div className={s.sidebarHead} onClick={() => { navigate('/ewish-admin'); setMobileOpen(false); }}>
          <div className={s.logo}>
            <KadoBow />
            <div className={s.logoTexts}>
              <span className={s.logoName}>myKado</span>
              <span className={s.adminBadge}>{isSuperAdmin ? 'super admin' : 'v2 · soft'}</span>
            </div>
          </div>
        </div>

        {/* Create CTA */}
        <Link to="/ewish-admin/ewish/new" className={s.createCta} onClick={() => setMobileOpen(false)}>
          <Plus size={17} />
          <span className={s.createCtaLabel}>Nouvelle création</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 13.5 9.5 21 11 13.5 12.5 12 20 10.5 12.5 3 11 10.5 9.5Z"/></svg>
        </Link>

        {/* Main nav */}
        <nav className={s.nav}>
          {renderNav(NAV)}

          {isSuperAdmin && (
            <>
              <div className={s.navSeparator}>
                <ShieldAlert size={11} /> Plateforme
              </div>
              {renderNav(SUPER_NAV)}
            </>
          )}
        </nav>

        <div style={{ flex: 1 }} />

        {/* Credits box */}
        <div className={s.creditsBox} onClick={() => { navigate('/ewish-admin/credits'); setMobileOpen(false); }}>
          <div className={s.creditsBoxTop}>
            <span className={s.creditsGem}>💎</span>
            <span className={s.creditsLabel}>Crédits</span>
          </div>
          <div className={s.creditsRow}>
            <span className={s.creditsCount}>{user?.credits ?? 0}</span>
            <span className={s.creditsRecharge}>Recharger →</span>
          </div>
        </div>

        {/* Bottom nav */}
        <nav className={s.navBottom}>
          {renderNav(NAV_BOTTOM)}
        </nav>

        {/* User footer */}
        <div className={s.sidebarFoot}>
          <div className={s.adminUser}>
            <div className={s.avatar} style={avatarStyle(displayName)}>
              {displayName[0].toUpperCase()}
            </div>
            <div className={s.userInfo}>
              <div className={s.userName}>{displayName}</div>
              <div className={s.userRole}>{isSuperAdmin ? 'Super Admin' : 'Particulier'}</div>
            </div>
            <button className={s.logoutBtn} onClick={handleLogout} title="Déconnexion">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={s.main}>
        <Outlet />
      </div>

      <WhatsAppFAB />

      {/* ── Mobile bottom nav ── */}
      <nav className={s.bottomNav}>
        {BOTTOM_TABS.slice(0, 2).map(({ to, key, Icon, label, end }) => {
          const isActive = end ? location.pathname === to : location.pathname.startsWith(to);
          return (
            <button key={key} className={`${s.bottomTab} ${isActive ? s.bottomTabActive : ''}`} onClick={() => navigate(to)}>
              <Icon size={22}/>
              <span className={s.bottomTabLabel}>{label}</span>
              {isActive && <span className={s.bottomTabDot}/>}
            </button>
          );
        })}
        <button className={s.bottomFab} onClick={() => navigate('/ewish-admin/ewish/new')}>
          <Plus size={24}/>
        </button>
        {BOTTOM_TABS.slice(2).map(({ to, key, Icon, label }) => {
          const isActive = location.pathname.startsWith(to);
          return (
            <button key={key} className={`${s.bottomTab} ${isActive ? s.bottomTabActive : ''}`} onClick={() => navigate(to)}>
              <Icon size={22}/>
              <span className={s.bottomTabLabel}>{label}</span>
              {isActive && <span className={s.bottomTabDot}/>}
            </button>
          );
        })}
      </nav>
    </div>
  );
}

function KadoBow({ size = 34 }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size}>
      <defs>
        <linearGradient id="mkgrad-layout" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FF6F8B"/>
          <stop offset="100%" stopColor="#E11D48"/>
        </linearGradient>
      </defs>
      <rect x="6" y="18" width="28" height="18" rx="3" fill="#FFE0E6"/>
      <rect x="18" y="18" width="4" height="18" fill="url(#mkgrad-layout)"/>
      <path d="M20 18 C 14 10, 6 14, 10 20 C 14 18, 17 18, 20 18 Z" fill="url(#mkgrad-layout)"/>
      <path d="M20 18 C 26 10, 34 14, 30 20 C 26 18, 23 18, 20 18 Z" fill="url(#mkgrad-layout)"/>
      <circle cx="20" cy="18" r="2.5" fill="#9B7EE2"/>
    </svg>
  );
}
