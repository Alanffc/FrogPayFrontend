/* src/components/plans/PlanComparisonTable.jsx
 * Tabla comparativa detallada entre FREEMIUM y PREMIUM.
 */
import { Check, X } from 'lucide-react';
import { PLAN_FEATURES } from './planFeatures.js';

/** Fila individual de la tabla */
function FeatureRow({ label, freemium }) {
  return (
    <div className="grid grid-cols-3 items-center gap-4 py-3.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-300 col-span-1">{label}</span>
      <div className="flex justify-center">
        {freemium
          ? <Check size={18} className="text-green-400" />
          : <X size={18} className="text-gray-600" />
        }
      </div>
      <div className="flex justify-center">
        <Check size={18} className="text-yellow-400" />
      </div>
    </div>
  );
}

/** Tabla completa de comparación */
export default function PlanComparisonTable() {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8">
      <h3 className="text-lg font-black text-white mb-6">Comparación detallada</h3>

      {/* Encabezados de columnas */}
      <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-white/10">
        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">
          Característica
        </span>
        <div className="text-center">
          <span className="text-xs font-black uppercase tracking-widest text-gray-400">
            Freemium
          </span>
        </div>
        <div className="text-center">
          <span className="text-xs font-black uppercase tracking-widest text-yellow-500">
            Premium
          </span>
        </div>
      </div>

      {/* Filas */}
      {PLAN_FEATURES.map((feature, i) => (
        <FeatureRow key={i} {...feature} />
      ))}
    </div>
  );
}
