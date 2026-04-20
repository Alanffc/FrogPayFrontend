/* src/pages/Plans.jsx
 * Página de selección de plan. Orquesta los componentes de plan
 * sin contener lógica de presentación interna.
 */
import { useState } from 'react';
import { Sparkles, Menu } from 'lucide-react';

import Toast from '../components/Toast.jsx';
import { FreemiumCard, PremiumCard } from '../components/PlanCard.jsx';
import PlanComparisonTable from '../components/PlanComparisonTable.jsx';

export default function Plans({ onToggleSidebar, currentPlan, onUpgrade, onDowngrade }) {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const isPremium = currentPlan === 'PREMIUM';

  const showToast = (message, type = 'success') =>
    setToast({ show: true, message, type });

  const handleUpgrade = async () => {
    if (!onUpgrade || isLoading) return;
    setIsLoading(true);
    try {
      await onUpgrade();
      showToast('¡Plan actualizado a PREMIUM exitosamente! 🎉');
    } catch (err) {
      showToast(err.message || 'No se pudo completar el upgrade.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDowngrade = async () => {
    if (!onDowngrade || isLoading) return;
    setIsLoading(true);
    try {
      await onDowngrade();
      showToast('Plan cambiado a FREEMIUM.');
    } catch (err) {
      showToast(err.message || 'No se pudo completar el cambio.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full relative min-h-screen">

      {/* Fondo ambiental */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-5%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-[radial-gradient(circle,rgba(234,179,8,0.08),transparent_70%)]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[25vw] h-[25vw] rounded-full bg-[radial-gradient(circle,rgba(12,70,81,0.12),transparent_70%)]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-28 pb-10 lg:py-16 relative z-10">

        {/* Barra de navegación móvil flotante (estándar) */}
        <div className="fixed top-4 left-4 right-4 z-[100] flex items-center justify-between lg:hidden bg-black/70 border border-white/10 p-4 rounded-2xl backdrop-blur-2xl shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-black shadow-[0_0_15px_rgba(230,255,42,0.15)] border border-white/10">
              <span className="text-[#e6ff2a] font-bold">F</span>
            </div>
            <span className="text-lg font-bold tracking-tight text-white">
              Frog<span className="text-[#e6ff2a]">Pay</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onToggleSidebar}
            className="p-2 bg-white/5 rounded-xl border border-white/10 text-white transition-colors hover:bg-white/10 focus:outline-none"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Encabezado */}
        <header className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full border border-yellow-500/20 bg-yellow-500/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-yellow-400 mb-5">
            <Sparkles size={13} /> Planes &amp; Precios
          </div>

          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Elige tu{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e6ff2a] to-[#b7f758]">
              plan
            </span>
          </h1>

          <p className="text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
            Escala tus pagos con las herramientas adecuadas para tu negocio.
          </p>

          {/* Badge plan actual */}
          <div className="mt-5 inline-flex items-center gap-2">
            <span className="text-sm text-gray-500">Tu plan actual:</span>
            <span className={`text-sm font-black px-3 py-1 rounded-full ${isPremium
              ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              : 'bg-white/10 text-gray-300 border border-white/10'
              }`}>
              {currentPlan || 'FREEMIUM'}
            </span>
          </div>
        </header>

        {/* Cards de planes */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <FreemiumCard
            isActive={!isPremium}
            isLoading={isLoading}
            onDowngrade={handleDowngrade}
          />
          <PremiumCard
            isActive={isPremium}
            isLoading={isLoading}
            onUpgrade={handleUpgrade}
          />
        </div>

        {/* Tabla comparativa */}
        <PlanComparisonTable />

      </div>

      <Toast
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(t => ({ ...t, show: false }))}
      />
    </div>
  );
}
