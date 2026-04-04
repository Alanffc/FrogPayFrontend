import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import MagneticButton from '../components/MagneticButton.jsx';
import FrogPayIsotype from '../assets/FrogPayIsotypeV2.png';

// Agregamos onRegisterClick a las props
export default function Navbar({ onLoginClick, onRegisterClick }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full z-50 px-6 top-6">
      <div className="mx-auto max-w-7xl glass-iphone rounded-3xl px-6 py-3 flex items-center justify-between">
        
        {/* Logo Sección Izquierda */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-transparent shadow-[0_0_18px_rgba(0,0,0,0.25)] overflow-hidden transition-transform group-hover:scale-105">
            <img src={FrogPayIsotype} alt="FrogPay" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            <span className="text-white">Frog</span>
            <span className="text-[#e6ff2a]">Pay</span>
          </span>
        </div>
        
        {/* Links Centrales */}
        <div className="hidden md:flex items-center gap-10 text-[15px] font-medium text-gray-300">
          <a href="#" className="hover:text-white transition-colors">Producto</a>
          <a href="#" className="hover:text-white transition-colors">Desarrolladores</a>
          <a href="#" className="hover:text-white transition-colors">Precios</a>
        </div>
        
        {/* Acciones Derecha */}
        <div className="flex items-center gap-3">
          {/* Botón Hamburguesa Móvil */}
          <button
            type="button"
            className="md:hidden inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 text-white transition hover:bg-white/10"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label="Abrir menú móvil"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Botón Nuevo: Regístrate (Bordeado) */}
          <MagneticButton 
            onClick={onRegisterClick}
            className="hidden sm:inline-flex px-5 py-2.5 rounded-2xl text-[15px] font-bold border border-[#e6ff2a] text-[#e6ff2a] hover:bg-[#e6ff2a]/10 transition-colors"
          >
            Regístrate
          </MagneticButton>

          {/* Botón Original: Login (Sólido) */}
          <MagneticButton 
            onClick={onLoginClick}
            className="px-6 py-2.5 rounded-2xl text-[15px] font-bold bg-[#e6ff2a] text-[#04181C] shadow-[0_4px_15px_rgba(230,255,42,0.2)]"
          >
            Login
          </MagneticButton>
        </div>
      </div>

      {/* Menú Móvil */}
      {menuOpen && (
        <div className="md:hidden absolute inset-x-6 top-full mt-3 rounded-3xl border border-white/10 bg-black/95 p-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col gap-4 text-lg font-medium text-white">
            <a href="#" className="rounded-2xl px-4 py-3 transition hover:bg-white/10">Producto</a>
            <a href="#" className="rounded-2xl px-4 py-3 transition hover:bg-white/10">Desarrolladores</a>
            <a href="#" className="rounded-2xl px-4 py-3 transition hover:bg-white/10">Precios</a>
            <hr className="border-white/10 my-2" />
            <a href="#" onClick={onRegisterClick} className="rounded-2xl px-4 py-3 text-[#e6ff2a] transition hover:bg-white/10">Crear cuenta gratis</a>
          </div>
        </div>
      )}
    </nav>
  );
}