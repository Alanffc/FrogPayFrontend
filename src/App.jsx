/* src/App.jsx */
import { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';

import Navbar from "./layout/Navbar.jsx";
import Footer from "./layout/Footer.jsx";
import Sidebar from "./layout/Sidebar.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import PaymentDemo from "./pages/PaymentDemo.jsx";
import LoginModal from './components/LoginModal.jsx';
import RegisterModal from './components/RegisterModal.jsx';

// 1. IMPORTAMOS TU NUEVA PANTALLA AQUÍ
import ApiKeys from "./pages/ApiKeys.jsx";

// --- COMPONENTE DE PROTECCIÓN DE RUTAS ---
const ProtectedRoute = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  
  // Cambia a 'true' para entrar directo al Dashboard durante tus pruebas
  const [isAuthenticated, setIsAuthenticated] = useState(true); 
  
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    setIsLoginOpen(false);
    setIsRegisterOpen(false);
    setIsAuthenticated(true);
    navigate('/dashboard'); 
    window.scrollTo(0, 0);
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
  // 2. MODIFICAMOS EL LAYOUT PARA RECIBIR LA "Page" COMO PROP
  const DashboardLayout = ({ Page }) => {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
      <div className="min-h-screen bg-[#040A0B] text-white overflow-x-hidden relative">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <main className="min-h-screen flex-1 w-full lg:pl-72 transition-all duration-300">
          {/* Renderizamos la página que nos envíen por props y le pasamos la función del sidebar */}
          <Page onToggleSidebar={() => setSidebarOpen(true)} />
        </main>
      </div>
    );
  };

  return (
    <Routes>
      <Route path="/" element={<LandingLayout />} />
      <Route path="/checkout" element={<PaymentDemo />} />

      {/* 3. ACTUALIZAMOS LAS RUTAS DEL DASHBOARD */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            {/* Le decimos que cargue Dashboard */}
            <DashboardLayout Page={Dashboard} /> 
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/dashboard/api-keys" 
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            {/* Le decimos que cargue tu nueva pantalla ApiKeys */}
            <DashboardLayout Page={ApiKeys} /> 
          </ProtectedRoute>
        } 
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;