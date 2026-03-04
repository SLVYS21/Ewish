import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// ── Public editor routes ──
import Dashboard from './pages/Dashboard';
import Editor    from './pages/Editor';
import NewWish   from './pages/NewWish';

// ── Admin ──
import { AuthProvider, useAuth } from './admin/context/AuthContext';
import AdminLayout       from './admin/components/AdminLayout';
import AdminLogin        from './admin/pages/AdminLogin';
import AdminDashboard    from './admin/pages/AdminDashboard';
import AdminOrders       from './admin/pages/AdminOrders';
import AdminPublications from './admin/pages/AdminPublications';
import AdminTemplates    from './admin/pages/AdminTemplates';
import AdminWishes       from './admin/pages/AdminWishes';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (!user)   return <Navigate to="/admin/login" replace />;
  return children;
}

function AdminLoginGate() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  if (user)    return <Navigate to="/admin" replace />;
  return <AdminLogin />;
}

function Spinner() {
  return (
    <div style={{ height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#0e0f11' }}>
      <div style={{ width:30, height:30, borderRadius:'50%', border:'2px solid rgba(255,255,255,.07)', borderTopColor:'#c8963e', animation:'spin .75s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* ── Public editor ── */}
          <Route path="/"         element={<Dashboard />} />
          <Route path="/new"      element={<NewWish />} />
          <Route path="/edit/:id" element={<Editor />} />

          {/* ── Admin login ── */}
          <Route path="/admin/login" element={<AdminLoginGate />} />

          {/* ── Admin protected (nested, shares AdminLayout sidebar) ── */}
          <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
            <Route index               element={<AdminDashboard />} />
            <Route path="orders"       element={<AdminOrders />} />
            <Route path="publications" element={<AdminPublications />} />
            <Route path="templates"    element={<AdminTemplates />} />
            <Route path="wishes"       element={<AdminWishes />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}