/* src/App.jsx */
import { useState } from 'react';
import Navbar from "./layout/Navbar.jsx";
import Footer from "./layout/Footer.jsx";
import Home from "./pages/Home.jsx";
import LoginModal from './components/LoginModal.jsx';

function App() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      
      {/* --- Capa de Fondos Animados (Detrás de todo) --- */}
      {/* Esta capa es la que hace que el fondo sea oscuro y tenga blobs de color */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        
        {/* Blob Lima Superior Izquierdo */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full bg-frog-lime opacity-10 animate-blob blur-[120px]"></div>
        
        {/* Blob Verde Azulado Medio Derecho */}
        <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-frog-teal opacity-20 animate-blob blur-[150px] animation-delay-2000"></div>
        
        {/* Capa de Ruido (Opcional, pero da textura) */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay"></div>
      </div>

      {/* --- Contenido Supremo (Encima del fondo) --- */}
      <div className="relative z-10">
        <Navbar onLoginClick={() => setIsLoginOpen(true)} />
        <main>
          <Home />
        </main>
        <Footer />
      </div>
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </div>
  );
}

export default App;