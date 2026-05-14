import { useState } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LayoutDashboard, Plus, PlaySquare, Palette, Mail, ExternalLink, Users, BarChart2, Images, ShieldAlert, Ticket, Target, Lightbulb, Settings } from 'lucide-react';
import WhatsAppFAB from '../../components/WhatsAppFAB';
import s from './AdminLayout.module.css';

const NAV = [
  { to: '/ewish-admin',            icon: <LayoutDashboard size={18} />, label: 'Dashboard'             },
  { to: '/ewish-admin/ewish',      icon: <PlaySquare size={18} />,      label: 'Publications'          },
  { to: '/ewish-admin/wishes',     icon: <Mail size={18} />,            label: 'Mes Vœux'              },
  { to: '/ewish-admin/suggestions',icon: <Lightbulb size={18} />,       label: 'Suggestions'           },
  { to: '/ewish-admin/ewish',  icon: <Plus size={18} />,            label: "Ouvrir l'éditeur", highlight: true },
];

const SUPER_NAV = [
  { to: '/ewish-admin/super/stats',        icon: <BarChart2 size={18} />, label: 'Statistiques'            },
  { to: '/ewish-admin/super/users',        icon: <Users size={18} />,     label: 'Utilisateurs'            },
  { to: '/ewish-admin/super/promos',       icon: <Ticket size={18} />,    label: 'Codes Promo'             },
  { to: '/ewish-admin/super/assets',       icon: <Images size={18} />,    label: "Banque d'images"         },
  { to: '/ewish-admin/super/prospection',  icon: <Target size={18} />,    label: 'Prospection'             },
  { to: '/ewish-admin/super/settings',     icon: <Settings size={18} />,  label: 'Configuration'           },
  { to: '/ewish-admin/templates',          icon: <Palette size={18} />,   label: 'Templates & Prix'        },
];

export default function AdminLayout({ pendingCount = 0 }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const isSuperAdmin = user?.role === 'super_admin';
  const isMerchant   = user?.role === 'merchant';

  const handleLogout = async () => {
    await logout();
    navigate('/ewish-admin/login');
  };

  const renderNav = (items) => items.map(({ to, icon, label, end, highlight }) => (
    <NavLink
      key={to} to={to} end={end}
      onClick={() => setMobileOpen(false)}
      className={({ isActive }) => `${s.navItem} ${isActive ? s.active : ''} ${highlight ? s.navHighlight : ''}`}
    >
      <span className={s.navIcon}>{icon}</span>
      <span className={s.navLabel}>{label}</span>
      {label === 'Commandes' && pendingCount > 0 && (
        <span className={s.navBadge}>{pendingCount}</span>
      )}
    </NavLink>
  ));

  return (
    <div className={s.shell}>
      {/* ── Mobile Header ── */}
      {/*{!isMerchant &&*/(
        <div className={s.mobileHeader}>
          <div className={s.logo}>my<span>Kado</span></div>
          <button className={s.menuBtn} onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      )}

      {/* ── Sidebar ── */}
      {/*{!isMerchant &&*/ (
        <>
          <div className={`${s.sidebarOverlay} ${mobileOpen ? s.open : ''}`} onClick={() => setMobileOpen(false)} />
          <aside className={`${s.sidebar} ${mobileOpen ? s.open : ''}`}>
            <div className={s.sidebarHead}>
              <div className={s.logo}>my<span>Kado</span></div>
              <div className={s.adminBadge}>{isSuperAdmin ? 'Super Admin' : 'Admin'}</div>
            </div>

            <nav className={s.nav}>
              {renderNav(NAV)}

              {/* Super admin section */}
              {isSuperAdmin && (
                <>
                  <div className={s.navSeparator}>
                    <ShieldAlert size={12} /> Plateforme
                  </div>
                  {renderNav(SUPER_NAV)}
                </>
              )}
            </nav>

            <div className={s.sidebarFoot}>
              <div className={s.adminUser}>
                <div className={s.avatar}>
                  {(user?.name || user?.email || 'A')[0].toUpperCase()}
                </div>
                <div className={s.userInfo}>
                  <div className={s.userName}>{user?.name || user?.email}</div>
                  <div className={s.userRole}>{isSuperAdmin ? 'Super Administrateur' : 'Administrateur'}</div>
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
        </>
      )}

      {/* ── Main ── */}
      <div className={`${s.main} ${isMerchant ? s.mainFull : ''}`}>
        <Outlet />
      </div>

      {<WhatsAppFAB />}
    </div>
  );
}