import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import s from './AdminLayout.module.css';

const NAV = [
  { to: '/ewish-admin',              icon: '📊', label: 'Dashboard',       end: true },
  { to: '/ewish-admin/orders',       icon: '📦', label: 'Commandes'                  },
  { to: '/ewish-admin/publications', icon: '🎬', label: 'Publications'               },
  { to: '/ewish-admin/templates',    icon: '🎨', label: 'Templates & Prix'           },
  { to: '/ewish-admin/wishes',       icon: '💌', label: 'Vœux collectifs'            },
];

export default function AdminLayout({ pendingCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/ewish-admin/login');
  };

  return (
    <div className={s.shell}>
      {/* ── Sidebar ── */}
      <aside className={s.sidebar}>
        <div className={s.sidebarHead}>
          <div className={s.logo}>eWish<span>Well</span></div>
          <div className={s.adminBadge}>Admin</div>
        </div>

        <nav className={s.nav}>
          {NAV.map(({ to, icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''}`}
            >
              <span className={s.navIcon}>{icon}</span>
              <span className={s.navLabel}>{label}</span>
              {label === 'Commandes' && pendingCount > 0 && (
                <span className={s.navBadge}>{pendingCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className={s.sidebarFoot}>
          <div className={s.adminUser}>
            <div className={s.avatar}>
              {(user?.name || user?.email || 'A')[0].toUpperCase()}
            </div>
            <div className={s.userInfo}>
              <div className={s.userName}>{user?.name || user?.email}</div>
              <div className={s.userRole}>Administrateur</div>
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

      {/* ── Main ── */}
      <div className={s.main}>
        <Outlet />
      </div>
    </div>
  );
}