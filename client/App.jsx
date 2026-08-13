import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import InstallPWA from "./components/InstallPWA";
import UpdateToast from "./components/UpdateToast";
import WhatsNewModal from "./components/WhatsNewModal";

import Dashboard from "./pages/Dashboard";
import MyCreations from "./pages/MyCreations";
import Editor from "./pages/Editor";
import QuickCreate from "./pages/QuickCreate";
import QuickCreateWall from "./pages/QuickCreateWall";
import { CardStateProvider } from "./card-editor/hooks/useCardState";
import CardEditorLayout from "./card-editor/components/CardEditorLayout";
import CardPublicView from "./card-editor/preview/CardPublicView";

import { AuthProvider, useAuth } from "./admin/context/AuthContext";
import AdminLayout from "./admin/components/AdminLayout";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminRegister from "./admin/pages/AdminRegister";
import ForgotPassword from "./admin/pages/ForgotPassword";
import ResetPassword from "./admin/pages/ResetPassword";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminPublications from "./admin/pages/AdminPublications";
import AdminTemplates from "./admin/pages/AdminTemplates";
import AdminWishes from "./admin/pages/AdminWishes";
import AdminReleaseNotes from "./admin/pages/AdminReleaseNotes";

import SuperAdminStats        from "./admin/pages/SuperAdminStats";
import SuperAdminUsers        from "./admin/pages/SuperAdminUsers";
import SuperAdminPromos       from "./admin/pages/SuperAdminPromos";
import SuperAdminAssets       from "./admin/pages/SuperAdminAssets";
import SuperAdminProspection  from "./admin/pages/SuperAdminProspection";
import SuperAdminSuggestions  from "./admin/pages/SuperAdminSuggestions";
import SuperAdminSettings     from "./admin/pages/SuperAdminSettings";
import SuperAdminKyc          from "./admin/pages/SuperAdminKyc";
import KycMobilePage          from "./pages/KycMobilePage";

import TemplatesGallery    from "./pages/TemplatesGallery";
import TemplateDetailPage  from "./pages/TemplateDetailPage";
import WallSetup           from "./pages/WallSetup";

import WallClaim           from "./pages/WallClaim";
import CagnottePage        from "./pages/CagnottePage";
import CreditsPage         from "./pages/CreditsPage";
import SharePage           from "./pages/SharePage";
import TermsPage           from "./pages/TermsPage";
import PrivacyPage         from "./pages/PrivacyPage";
import ProfilePage         from "./pages/ProfilePage";
import DesignSystem        from "./pages/DesignSystem";
import CreerBrique         from "./pages/CreerBrique";
import RecipientReveal     from "./pages/RecipientReveal";
import { ToastProvider }   from "./design-system";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user) return <Navigate to="/ewish-admin/login" replace />;
  return children;
}

function RequireSuperAdmin({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user || user.role !== 'super_admin') return <Navigate to="/ewish-admin" replace />;
  return children;
}

function AdminLoginGate() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to="/ewish-admin" replace />;
  return <AdminLogin />;
}

function AdminRegisterGate() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user) return <Navigate to="/ewish-admin" replace />;
  return <AdminRegister />;
}

/* RouteTransition : replay .mk-anim-fade-in au changement d'URL.
   Rerender via un `key` incrementé sur pathname change. */
function RouteTransition({ children }) {
  const location = useLocation();
  const [key, setKey] = useState(0);
  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    setKey(k => k + 1);
  }, [location.pathname]);
  return (
    <div key={key} className="mk-anim-fade-in" style={{ minHeight: '100%' }}>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FFFAF6" }}>
      <div style={{ width: 30, height: 30, borderRadius: "50%", border: "2.5px solid #FFE0E6", borderTopColor: "#E11D48", animation: "spin .75s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
      <BrowserRouter>
        <InstallPWA />
        <UpdateToast />
        <WhatsNewModal />
        <RouteTransition>
        <Routes>
          <Route path="/ewish-admin/login"    element={<AdminLoginGate />} />
          <Route path="/ewish-admin/register" element={<AdminRegisterGate />} />
          <Route path="/ewish-admin/forgot-password"      element={<ForgotPassword />} />
          <Route path="/ewish-admin/reset-password/:token" element={<ResetPassword />} />
          {/* Étape 8 flow murs — réception publique d'un mur offert */}
          <Route path="/ewish-admin/claim/:token"          element={<WallClaim />} />

          {/* Protected Admin  with sidebar layout */}
          <Route path="/ewish-admin" element={<AdminLayout />}>
            <Route index element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="ewish" element={<RequireAuth><MyCreations /></RequireAuth>} />
            <Route path="templates"        element={<TemplatesGallery />} />
            <Route path="template/:name"   element={<TemplateDetailPage />} />
            <Route path="cagnotte/:id" element={<RequireAuth><CagnottePage /></RequireAuth>} />
            <Route path="credits"    element={<RequireAuth><CreditsPage /></RequireAuth>} />
            <Route path="wishes"     element={<RequireAuth><AdminWishes /></RequireAuth>} />
            <Route path="publications" element={<RequireAuth><AdminPublications /></RequireAuth>} />
            <Route path="suggestions"  element={<RequireAuth><SuperAdminSuggestions /></RequireAuth>} />

            {/* Super Admin analytics */}
            <Route path="admin" element={<RequireSuperAdmin><AdminDashboard /></RequireSuperAdmin>} />

            {/* Super Admin only */}
            <Route path="super-templates" element={<RequireSuperAdmin><AdminTemplates /></RequireSuperAdmin>} />
            <Route path="super/stats"        element={<RequireSuperAdmin><SuperAdminStats /></RequireSuperAdmin>} />
            <Route path="super/users"        element={<RequireSuperAdmin><SuperAdminUsers /></RequireSuperAdmin>} />
            <Route path="super/promos"       element={<RequireSuperAdmin><SuperAdminPromos /></RequireSuperAdmin>} />
            <Route path="super/assets"       element={<RequireSuperAdmin><SuperAdminAssets /></RequireSuperAdmin>} />
            <Route path="super/prospection"  element={<RequireSuperAdmin><SuperAdminProspection /></RequireSuperAdmin>} />
            <Route path="super/settings"     element={<RequireSuperAdmin><SuperAdminSettings /></RequireSuperAdmin>} />
            <Route path="super/kyc"          element={<RequireSuperAdmin><SuperAdminKyc /></RequireSuperAdmin>} />
            <Route path="profile"            element={<RequireAuth><ProfilePage /></RequireAuth>} />
            <Route path="releases"           element={<RequireAuth><AdminReleaseNotes /></RequireAuth>} />

            <Route path="share/:id"          element={<RequireAuth><SharePage /></RequireAuth>} />
          </Route>

          {/* Full-screen routes  no sidebar */}
          <Route path="/ewish-admin/ewish/new"       element={<QuickCreate />} />
          <Route path="/ewish-admin/wall/new"        element={<QuickCreateWall />} />
          <Route path="/ewish-admin/ewish/edit/:id"  element={<Editor />} />
          <Route path="/ewish-admin/wall/:id"        element={<WallSetup />} />

          <Route path="/kyc/mobile/:token" element={<KycMobilePage />} />
          <Route path="/terms"   element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/design-system" element={<DesignSystem />} />
          <Route path="/app/creer"     element={<CreerBrique />} />

          {/* Recipient Reveal UI for Walls */}
          <Route path="/m/:slug"       element={<RecipientReveal />} />
          
          <Route path="/card-editor" element={<CardStateProvider><CardEditorLayout /></CardStateProvider>} />

          {/* Public route for published myenvelope cards (shared via /c/:slug) */}
          <Route path="/c/:slug" element={<CardPublicView />} />

          <Route path="/" element={<Navigate to="/ewish-admin" replace />} />
          <Route path="*" element={<Navigate to="/ewish-admin" replace />} />
        </Routes>
        </RouteTransition>
      </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
