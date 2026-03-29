import { CreditCard, ShieldCheck } from 'lucide-react';
import FrogPayIsotype from '../assets/FrogPayIsotypeV2.png';

export default function Footer() {
  return (
    <footer className="w-full mt-20 relative z-10">
      {/* 1. Fondo Glass a ancho completo
        2. rounded-t-[3rem] para el efecto ovalado superior
        3. border-t para un brillo sutil arriba, sin bordes a los lados
      */}
      <div className="glass-iphone relative w-full overflow-hidden rounded-t-[3rem] border-t border-white/10 bg-black/60 pt-16 pb-10 shadow-[0_-20px_120px_rgba(0,0,0,0.35)]">
        
        {/* Degradados de fondo expansivos */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(230,255,42,0.16),transparent_30%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),transparent_40%)]" />

        {/* Contenedor interno para que el contenido no se estire a los bordes de la pantalla */}
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid gap-10 lg:grid-cols-[1.8fr_1fr] items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-3xl flex items-center justify-center bg-[#e6ff2a]/15 text-[#e6ff2a] shadow-[0_0_30px_rgba(230,255,42,0.18)] overflow-hidden shrink-0">
                <img src={FrogPayIsotype} alt="FrogPay" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <p className="text-xl font-bold text-white">FrogPay</p>
                <p className="mt-2 text-sm text-gray-400 max-w-md">
                  Plataforma de pagos cloud-native con diseño moderno, seguridad y velocidad para productos globales.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <a href="#" className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-gray-200 transition hover:bg-white/10">
                Producto
              </a>
              <a href="#" className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-gray-200 transition hover:bg-white/10">
                Desarrolladores
              </a>
              <a href="#" className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-gray-200 transition hover:bg-white/10">
                Precios
              </a>
              <a href="#" className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-sm text-gray-200 transition hover:bg-white/10">
                Soporte
              </a>
            </div>
          </div>

          <div className="mt-10 border-t border-white/10 pt-8 flex flex-col lg:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-400">MVP Architecture Kata © 2026. La Paz, Bolivia.</p>
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                <ShieldCheck size={16} /> Seguridad PCI
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300">
                <CreditCard size={16} /> Pagos ultra rápidos
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}