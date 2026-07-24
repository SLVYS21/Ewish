import { useState } from 'react';
import { NavLink, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Home, Layers, Wallet, Plus, Sparkles,
  ShieldAlert, BarChart2, Users, Ticket, Images, Cog,
  User, BadgeCheck, ShieldCheck, LayoutTemplate, Package,
} from 'lucide-react';
import versions from '../../changelog/versions.json';
import WhatsAppFAB from '../../components/WhatsAppFAB';
import NotificationBell from '../../components/NotificationBell';
import Kado from '../../components/Kado';
import CreateModal from '../../components/CreateModal';

const SUPER_NAV = [
  { to: '/ewish-admin/admin',             label: 'Tableau de bord',  Icon: BarChart2  },
  { to: '/ewish-admin/super/stats',       label: 'Statistiques',     Icon: BarChart2  },
  { to: '/ewish-admin/super/users',       label: 'Utilisateurs',     Icon: Users      },
  { to: '/ewish-admin/super/kyc',         label: 'Vérif. KYC',       Icon: BadgeCheck },
  { to: '/ewish-admin/super/promos',      label: 'Codes Promo',      Icon: Ticket     },
  { to: '/ewish-admin/super/assets',      label: "Banque d'images",  Icon: Images     },
  { to: '/ewish-admin/super-templates',   label: 'Templates & Prix', Icon: Sparkles   },
  { to: '/ewish-admin/super/prospection', label: 'Prospection',      Icon: ShieldAlert},
  { to: '/ewish-admin/super/settings',    label: 'Configuration',    Icon: Cog        },
];

const AVATAR_PALETTE = ['#FFB3C1','#D7C5F2','#C9EEDF','#FFE7AD','#FFD7C2'];
const AVATAR_INK     = ['#9C1632','#5C3A9D','#1F6E55','#8A5800','#A03C13'];
function avatarColors(name = 'A') {
  const idx = (name.charCodeAt(0) + name.length) % AVATAR_PALETTE.length;
  return { background: AVATAR_PALETTE[idx], color: AVATAR_INK[idx] };
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [createOpen, setCreateOpen] = useState(false);
  const [mobileCreate, setMobileCreate] = useState(false);

  const isSuperAdmin = user?.role === 'super_admin';
  const displayName = user?.name || user?.email || 'Utilisateur';
  const initials = (displayName[0] || 'U').toUpperCase();

  // Route active states
  const p = location.pathname;
  const isHome = p === '/ewish-admin';
  const isCreations = (p.startsWith('/ewish-admin/ewish') && !p.includes('/new') && !p.includes('/edit')) ||
    p.startsWith('/ewish-admin/wall') || p.startsWith('/ewish-admin/share') || p.startsWith('/ewish-admin/cagnotte');
  const isTemplates = p.startsWith('/ewish-admin/templates');
  const isProfile = p.startsWith('/ewish-admin/profile');
  const isReleases = p.startsWith('/ewish-admin/releases');

  /* Badge "nouveau" sur l'onglet Nouveautés : ON si l'utilisateur n'a pas
     encore vu la version courante. Clé alignée avec WhatsNewModal. */
  const currentVersion = versions[0]?.version;
  const seenVersion = (() => {
    try { return localStorage.getItem('mk_whats_new_seen'); } catch { return null; }
  })();
  const hasNewRelease = currentVersion && seenVersion !== null && seenVersion !== currentVersion;

  const handleLogout = async () => {
    await logout();
    navigate('/ewish-admin/login');
  };

  const goCreate = (mode) => {
    setCreateOpen(false);
    setMobileCreate(false);
    navigate(`/ewish-admin/templates?mode=${mode}`);
  };

  return (
    <div className="mk-app">

      {/* ── Mobile top bar ── */}
      <header className="mk-mobile-topbar">
        <div className="sb-logo" style={{ cursor: 'pointer', fontSize: 21, padding: 0, gap: 6 }} onClick={() => navigate('/ewish-admin')}>
          <Kado mode="logo" size={30} cycle={['jump', 'wink', 'confetti', 'love', 'drop']} cycleInterval={4200} />
          <span>myKado</span>
        </div>
        <div style={{ flex: 1 }} />
        <NotificationBell authOk={!!user} />
        <button className="mtopbar-credits" onClick={() => navigate('/ewish-admin/credits')}>
          <Wallet size={13} />
          <strong>{user?.credits ?? 0}</strong>
        </button>
      </header>

      {/* ── Sidebar (desktop) ── */}
      <aside className="sidebar">
        <div className="sb-logo" style={{ cursor: 'pointer', gap: 8 }} onClick={() => navigate('/ewish-admin')}>
          <Kado mode="logo" size={36} cycle={['jump', 'wink', 'confetti', 'love', 'drop']} cycleInterval={4200} />
          <span className="word">myKado</span>
        </div>
        <div className="sb-tag">Des vœux qui font des souvenirs</div>

        {/* Créer button — opens unified CreateModal */}
        <button className="sb-create" onClick={() => setCreateOpen(true)}>
          <Plus size={16} /> <span>Créer</span>
        </button>

        {/* Main nav */}
        <nav className="sb-nav">
          <button className={`sb-item${isHome ? ' active' : ''}`} onClick={() => navigate('/ewish-admin')}>
            <Home size={16} />
            <span>Accueil</span>
            <span style={{ flex: 1 }} />
          </button>
          <button className={`sb-item${isCreations ? ' active' : ''}`} onClick={() => navigate('/ewish-admin/ewish')}>
            <Layers size={16} />
            <span>Mes créations</span>
            <span style={{ flex: 1 }} />
          </button>
          <button className={`sb-item${isTemplates ? ' active' : ''}`} onClick={() => navigate('/ewish-admin/templates')}>
            <LayoutTemplate size={16} />
            <span>Templates</span>
            <span style={{ flex: 1 }} />
          </button>
          <button className={`sb-item${isReleases ? ' active' : ''}`} onClick={() => navigate('/ewish-admin/releases')}>
            <Package size={16} />
            <span>Nouveautés</span>
            <span style={{ flex: 1 }} />
            {hasNewRelease && (
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5470', boxShadow: '0 0 0 3px rgba(255,84,112,.22)' }} aria-label="Nouvelle version" />
            )}
          </button>
        </nav>

        {/* Super admin section */}
        {isSuperAdmin && (
          <>
            <div className="sb-sep" />
            <div className="sb-section"><ShieldAlert size={11} style={{ display: 'inline', marginRight: 5 }} />Plateforme</div>
            <nav className="sb-nav">
              {SUPER_NAV.map(({ to, label, Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) => `sb-item${isActive ? ' active' : ''}`}
                >
                  <Icon size={15} />
                  <span>{label}</span>
                </NavLink>
              ))}
            </nav>
          </>
        )}

        <div style={{ flex: 1 }} />

        {/* User footer */}
        <div className="sb-foot">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0 6px 8px' }}>
            <NotificationBell authOk={!!user} />
          </div>
          <button className="sb-user" onClick={() => navigate('/ewish-admin/profile')}>
            <span className="sb-avatar" style={avatarColors(displayName)}>{initials}</span>
            <span style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
              <span className="sb-user-name">{displayName}</span>
              <span className="sb-user-sub">
                {user?.kyc === 'verified'
                  ? <><ShieldCheck size={11} style={{ display: 'inline', verticalAlign: -1, marginRight: 3, color: 'var(--mk-mint)' }} />Vérifié</>
                  : 'Compte gratuit'}
              </span>
            </span>
          </button>
          <button
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '8px 10px', borderRadius: 'var(--mk-r-xs)', fontSize: 12, fontWeight: 600, color: 'var(--mk-ink-3)', width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
            className="sb-user"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Se déconnecter</span>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="mk-main">
        <Outlet />
      </main>

      {/* ── Mobile bottom nav ── */}
      <nav className="mnav">
        <button className={`mnav-item${isHome ? ' on' : ''}`} onClick={() => navigate('/ewish-admin')}>
          <Home size={21} />
          <span>Accueil</span>
        </button>
        <button className={`mnav-item${isCreations ? ' on' : ''}`} onClick={() => navigate('/ewish-admin/ewish')}>
          <Layers size={21} />
          <span>Créations</span>
        </button>
        <div className="mnav-fab-slot">
          <button className="mnav-fab" onClick={() => setMobileCreate(true)} aria-label="Créer">
            <Plus size={26} />
          </button>
        </div>
        <button className={`mnav-item${isTemplates ? ' on' : ''}`} onClick={() => navigate('/ewish-admin/templates')}>
          <LayoutTemplate size={21} />
          <span>Templates</span>
        </button>
        <button className={`mnav-item${isProfile ? ' on' : ''}`} onClick={() => navigate('/ewish-admin/profile')}>
          <User size={21} />
          <span>Compte</span>
        </button>
      </nav>

      {/* ── Unified create modal (desktop + mobile) ── */}
      <CreateModal
        open={createOpen || mobileCreate}
        onClose={() => { setCreateOpen(false); setMobileCreate(false); }}
        onSelect={goCreate}
      />

      <WhatsAppFAB />
    </div>
  );
}
