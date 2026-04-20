/* src/App.jsx */
import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

import Navbar from "./layout/Navbar.jsx";
import Footer from "./layout/Footer.jsx";
import Sidebar from "./layout/Sidebar.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PaymentDemo from "./pages/PaymentDemo.jsx";
import LoginModal from './components/LoginModal.jsx';
import RegisterModal from './components/RegisterModal.jsx';
import { logout } from './services/auth.service.js';
import { upgradePlan, downgradePlan, getTenantMe } from './services/tenant.service.js';

import ApiKeys from "./pages/ApiKeys.jsx";
import PayoutAccounts from "./pages/PayoutAccounts.jsx";
import Finance from "./pages/Finance.jsx";
import Plans from "./pages/Plans.jsx";
import Configuracion from "./pages/Configuracion.jsx";

// --- COMPONENTE DE PROTECCIÓN DE RUTAS ---
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const hasValidToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (!payload?.exp) return false;
      return Date.now() < payload.exp * 1000;
    } catch (_error) {
      return false;
    }
  };

  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(hasValidToken());

  // Estado del plan: se lee del token JWT al cargar, y se actualiza tras el upgrade
  const getPlanFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return 'FREEMIUM';
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (payload?.plan || 'FREEMIUM').toUpperCase();
    } catch (_) {
      return 'FREEMIUM';
    }
  };

  const [currentPlan, setCurrentPlan] = useState(getPlanFromToken());

  const navigate = useNavigate();

  useEffect(() => {
    const syncAuthState = () => setIsAuthenticated(hasValidToken());
    const onStorage = () => syncAuthState();

    window.addEventListener('storage', onStorage);
    window.addEventListener('frogpay:auth-changed', syncAuthState);

    // Sincronizar el plan real desde el Backend al cargar
    if (isAuthenticated) {
      getTenantMe()
        .then(res => {
          if (res?.plan) setCurrentPlan(res.plan.toUpperCase());
        })
        .catch(err => console.error("Error validando plan:", err));
    }

    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('frogpay:auth-changed', syncAuthState);
    };
  }, []);

  const handleAuthSuccess = (authData) => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    setIsAuthenticated(true);
    // Si el login retorna datos con el plan, actualizamos el estado inmediatamente
    if (authData?.empresa?.plan) {
      setCurrentPlan(authData.empresa.plan.toUpperCase());
    } else {
      setCurrentPlan(getPlanFromToken());
    }
    navigate('/dashboard');
    window.scrollTo(0, 0);
  };

  // Función de upgrade: llama al endpoint y actualiza el plan en el estado global
  const handleUpgrade = async () => {
    try {
      const result = await upgradePlan();
      if (result?.empresa?.plan) {
        setCurrentPlan(result.empresa.plan.toUpperCase());
      }
      return result;
    } catch (error) {
      // Si el error dice que ya es Premium, sincronizamos el estado local
      if (error.message?.includes('ya cuenta con el plan PREMIUM')) {
        setCurrentPlan('PREMIUM');
      }
      throw error;
    }
  };

  // Función de downgrade: vuelve a FREEMIUM
  const handleDowngrade = async () => {
    try {
      const result = await downgradePlan();
      if (result?.empresa?.plan) {
        setCurrentPlan(result.empresa.plan.toUpperCase());
      }
      return result;
    } catch (error) {
      // Si el error dice que ya es Freemium, sincronizamos el estado local
      if (error.message?.includes('ya se encuentra en el plan FREEMIUM')) {
        setCurrentPlan('FREEMIUM');
      }
      throw error;
    }
  };

  // --- LAYOUT DE LA LANDING PAGE (Home) ---
  const LandingLayout = () => (
    <div className="min-h-screen relative overflow-x-hidden bg-black text-white">
      {/* Fondo Ambiental */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#b7f758] opacity-[0.08] blur-[120px]"></div>
        <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#0c4651] opacity-20 blur-[150px]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.04),transparent_45%),radial-gradient(circle_at_80%_70%,rgba(230,255,42,0.06),transparent_40%)] opacity-[0.2] mix-blend-overlay"></div>
      </div>

      <div className="relative z-10">
        <Navbar
          onLoginClick={() => setIsLoginOpen(true)}
          onRegisterClick={() => setIsRegisterOpen(true)}
        />
        <main>
          <Home onLoginClick={() => setIsRegisterOpen(true)} />
        </main>
        <Footer />
      </div>

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onSwitchToRegister={() => { setIsLoginOpen(false); setIsRegisterOpen(true); }}
      />

      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        onSwitchToLogin={() => { setIsRegisterOpen(false); setIsLoginOpen(true); }}
      />
    </div>
  );

  // --- LAYOUT DEL DASHBOARD B2B ---
  const DashboardLayout = ({ Page }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
      logout();
      setSidebarOpen(false);
      setIsAuthenticated(false);
      setCurrentPlan('FREEMIUM');
      navigate('/');
      window.scrollTo(0, 0);
    };

    return (
      <div className="min-h-screen bg-[#040A0B] text-white overflow-x-hidden relative">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onLogout={handleLogout}
          currentPlan={currentPlan}
        />

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="min-h-screen flex-1 w-full lg:pl-72 transition-all duration-300">
          <Page
            onToggleSidebar={() => setSidebarOpen(true)}
            currentPlan={currentPlan}
            onUpgrade={handleUpgrade}
            onDowngrade={handleDowngrade}
          />
        </main>
      </div>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<LandingLayout />} />
      <Route path="/checkout" element={<PaymentDemo />} />

      {/* --- RUTAS DEL DASHBOARD --- */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <DashboardLayout Page={Dashboard} />
          </ProtectedRoute>
        }
      />

      {/* RUTA AÑADIDA: Finanzas */}
      <Route
        path="/dashboard/finanzas"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <DashboardLayout Page={Finance} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/cuentas-cobro"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <DashboardLayout Page={PayoutAccounts} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/configuracion"
        element={<Navigate to="/dashboard/cuentas-cobro" replace />}
      />

      <Route
        path="/dashboard/transacciones"
        element={<Navigate to="/dashboard/cuentas-cobro" replace />}
      />

      <Route
        path="/dashboard/api-keys"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <DashboardLayout Page={ApiKeys} />
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/configuracion"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <DashboardLayout Page={Configuracion} />
          </ProtectedRoute>
        }
      />

      {/* RUTA: Planes */}
      <Route
        path="/dashboard/planes"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <DashboardLayout Page={Plans} />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;