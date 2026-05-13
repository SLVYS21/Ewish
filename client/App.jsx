import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import InstallPWA from "./components/InstallPWA";

// ── Public editor routes ──
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import NewWish from "./pages/NewWish";

// ── Admin ──
import { AuthProvider, useAuth } from "./admin/context/AuthContext";
import AdminLayout from "./admin/components/AdminLayout";
import AdminLogin from "./admin/pages/AdminLogin";
import AdminRegister from "./admin/pages/AdminRegister";
import AdminDashboard from "./admin/pages/AdminDashboard";
import AdminOrders from "./admin/pages/AdminOrders";
import AdminPublications from "./admin/pages/AdminPublications";
import AdminTemplates from "./admin/pages/AdminTemplates";
import AdminWishes from "./admin/pages/AdminWishes";

// ── Super Admin ──
import SuperAdminStats        from "./admin/pages/SuperAdminStats";
import SuperAdminUsers        from "./admin/pages/SuperAdminUsers";
import SuperAdminPromos       from "./admin/pages/SuperAdminPromos";
import SuperAdminAssets       from "./admin/pages/SuperAdminAssets";
import SuperAdminProspection  from "./admin/pages/SuperAdminProspection";
import SuperAdminSuggestions  from "./admin/pages/SuperAdminSuggestions";
import SuperAdminSettings     from "./admin/pages/SuperAdminSettings";

function RequireAuth({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  if (!user) {
    return <Navigate to="/ewish-admin/login" replace />;
  }

  return children;
}

function RequireSuperAdmin({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  if (!user || user.role !== 'super_admin') {
    return <Navigate to="/ewish-admin" replace />;
  }

  return children;
}


function AdminLoginGate() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  if (user) {
    return <Navigate to="/ewish-admin" replace />;
  }

  return <AdminLogin />;
}

function AdminRegisterGate() {
  const { user, loading } = useAuth();

  if (loading) return <Spinner />;

  if (user) {
    return <Navigate to="/ewish-admin" replace />;
  }

  return <AdminRegister />;
}

function Spinner() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f4f5f7",
      }}
    >
      <div
        style={{
          width: 30,
          height: 30,
          borderRadius: "50%",
          border: "2px solid rgba(0,0,0,.08)",
          borderTopColor: "#c8963e",
          animation: "spin .75s linear infinite",
        }}
      />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function App() {
  return (
    // <AuthProvider>
    //   <BrowserRouter>
    //     <Routes>
    //       <Route path="/"         element={<Dashboard />} />
    //       <Route path="/new"      element={<NewWish />} />
    //       <Route path="/edit/:id" element={<Editor />} />

    //       <Route path="/admin/login" element={<AdminLoginGate />} />

    //       <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
    //         <Route index               element={<AdminDashboard />} />
    //         <Route path="orders"       element={<AdminOrders />} />
    //         <Route path="publications" element={<AdminPublications />} />
    //         <Route path="templates"    element={<AdminTemplates />} />
    //         <Route path="wishes"       element={<AdminWishes />} />
    //       </Route>

    //       <Route path="*" element={<Navigate to="/" replace />} />
    //     </Routes>
    //   </BrowserRouter>
    // </AuthProvider>
    <AuthProvider>
      <BrowserRouter>
        <InstallPWA />
        <Routes>
          {/* Login / Register */}
          <Route path="/ewish-admin/login" element={<AdminLoginGate />} />
          <Route path="/ewish-admin/register" element={<AdminRegisterGate />} />

          {/* Protected Admin */}
          <Route
            path="/ewish-admin"
            element={
              <RequireAuth>
                <AdminLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="publications" element={<AdminPublications />} />
            <Route path="wishes" element={<AdminWishes />} />

            {/* Super Admin only routes */}
            <Route path="templates"    element={<RequireSuperAdmin><AdminTemplates /></RequireSuperAdmin>} />
            <Route path="super/stats"        element={<RequireSuperAdmin><SuperAdminStats /></RequireSuperAdmin>} />
            <Route path="super/users"        element={<RequireSuperAdmin><SuperAdminUsers /></RequireSuperAdmin>} />
            <Route path="super/promos"       element={<RequireSuperAdmin><SuperAdminPromos /></RequireSuperAdmin>} />
            <Route path="super/assets"       element={<RequireSuperAdmin><SuperAdminAssets /></RequireSuperAdmin>} />
            <Route path="super/prospection"  element={<RequireSuperAdmin><SuperAdminProspection /></RequireSuperAdmin>} />
            <Route path="super/settings"     element={<RequireSuperAdmin><SuperAdminSettings /></RequireSuperAdmin>} />
            <Route path="suggestions"        element={<RequireAuth><SuperAdminSuggestions /></RequireAuth>} />
          </Route>




          <Route path="/ewish-admin/ewish" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/ewish-admin/ewish/new" element={<RequireAuth><NewWish /></RequireAuth>} />
          <Route path="/ewish-admin/ewish/edit/:id" element={<RequireAuth><Editor /></RequireAuth>} />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/ewish-admin" replace />} /> 

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/ewish-admin" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
