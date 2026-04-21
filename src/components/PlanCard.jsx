/* src/components/plans/PlanCard.jsx
 * Card individual para un plan (FREEMIUM o PREMIUM).
 * Recibe toda la config del plan y los handlers de acción.
 */
import { Check, Crown, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { PLAN_FEATURES } from './planFeatures.js';

/** Badge "PLAN ACTUAL" que aparece en la esquina superior de la card activa */
function ActiveBadge({ isPremium }) {
  if (isPremium) {
    return (
      <div className="absolute -top-3 left-6 bg-gradient-to-r from-yellow-400 to-amber-400 text-black text-[10px] font-black px-3 py-1 rounded-full">
        PLAN ACTUAL
      </div>
    );
  }
  return (
    <div className="absolute -top-3 left-6 bg-[#e6ff2a] text-[#04181C] text-[10px] font-black px-3 py-1 rounded-full">
      PLAN ACTUAL
    </div>
  );
}

/** Card del plan FREEMIUM */
export function FreemiumCard({ isActive, isLoading, onDowngrade, usage }) {
  const freemiumFeatures = PLAN_FEATURES.filter(f => f.freemium);

  return (
    <div className={`relative rounded-3xl border p-8 transition-all duration-300 ${isActive
      ? 'border-[#e6ff2a]/40 bg-[#e6ff2a]/5 shadow-[0_0_40px_rgba(230,255,42,0.06)]'
      : 'border-white/10 bg-white/[0.02]'
      }`}>
      {isActive && <ActiveBadge isPremium={false} />}

      {/* Header del plan */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
            <Zap size={20} className="text-gray-300" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">FREEMIUM</h2>
            <p className="text-xs text-gray-500">Para empezar</p>
          </div>
        </div>
        <div className="flex items-end gap-1 mt-4">
          <span className="text-4xl font-black text-white">BOB 0</span>
          <span className="text-gray-500 mb-1">/mes</span>
        </div>
      </div>

      {/* Uso de transacciones (Solo visible si es el plan activo y hay data) */}
      {isActive && usage?.data && (
        <div className="mb-8 p-4 rounded-2xl bg-black/20 border border-white/5">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Límite de transacciones</span>
            <span className="text-xs font-black text-white">
              USD {usage.data.currentVolumeUSD?.toLocaleString()} / {usage.data.limitUSD?.toLocaleString()}
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${usage.data.percentageUsed > 90 ? 'bg-red-500' : 'bg-[#e6ff2a]'}`}
              style={{ width: `${Math.min(usage.data.percentageUsed, 100)}%` }}
            />
          </div>
          <p className="mt-2 text-[10px] text-gray-400">
            {usage.data.percentageUsed}% consumido este mes
          </p>
        </div>
      )}


      {/* Lista de features incluidos */}
      <ul className="space-y-3 mb-8">
        {freemiumFeatures.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
            <Check size={16} className="text-green-400 flex-shrink-0" />
            {f.label}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isActive ? (
        <div className="w-full flex items-center justify-center gap-2 rounded-2xl border border-[#e6ff2a]/30 bg-[#e6ff2a]/5 px-6 py-3.5 text-sm font-bold text-[#e6ff2a]">
          <Check size={16} /> Plan activo
        </div>
      ) : (
        <button
          type="button"
          id="btn-downgrade-freemium"
          onClick={onDowngrade}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-6 py-3.5 text-sm font-bold text-gray-300 transition hover:bg-white/10 hover:text-white disabled:opacity-40"
        >
          {isLoading
            ? <Loader2 size={16} className="animate-spin" />
            : <ArrowRight size={16} />
          }
          {isLoading ? 'Procesando...' : 'Cambiar a FREEMIUM'}
        </button>
      )}
    </div>
  );
}


/** Card del plan PREMIUM */
export function PremiumCard({ isActive, isLoading, onUpgrade }) {
  return (
    <div className={`relative rounded-3xl border p-8 transition-all duration-300 ${isActive
      ? 'border-yellow-500/40 bg-gradient-to-b from-yellow-500/10 to-amber-500/5 shadow-[0_0_60px_rgba(234,179,8,0.1)]'
      : 'border-yellow-500/20 bg-gradient-to-b from-yellow-500/5 to-transparent'
      }`}>
      {isActive && <ActiveBadge isPremium />}

      {/* Shimmer decorativo */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-yellow-400/10 to-transparent rounded-3xl pointer-events-none" />

      {/* Header del plan */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-2xl bg-yellow-500/20 flex items-center justify-center">
            <Crown size={20} className="text-yellow-400" />
          </div>
          <div>
            <h2 className="text-xl font-black text-yellow-300">PREMIUM</h2>
            <p className="text-xs text-yellow-600">Acceso completo</p>
          </div>
        </div>
        <div className="flex items-end gap-1 mt-4">
          <span className="text-4xl font-black text-white">BOB 499</span>
          <span className="text-gray-500 mb-1">/mes</span>
        </div>
      </div>

      {/* Lista de todos los features */}
      <ul className="space-y-3 mb-8">
        {PLAN_FEATURES.map((f, i) => (
          <li key={i} className="flex items-center gap-3 text-sm text-gray-300">
            <Check
              size={16}
              className={`flex-shrink-0 ${f.freemium ? 'text-green-400' : 'text-yellow-400'}`}
            />
            <span className={!f.freemium ? 'text-yellow-200 font-medium' : ''}>
              {f.label}
            </span>
            {!f.freemium && (
              <span className="ml-auto text-[9px] font-black text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                PREMIUM
              </span>
            )}
          </li>
        ))}
      </ul>

      {/* CTA */}
      {isActive ? (
        <div className="w-full flex items-center justify-center gap-2 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 px-6 py-3.5 text-sm font-bold text-yellow-400">
          <Crown size={16} /> Plan activo
        </div>
      ) : (
        <button
          type="button"
          id="btn-upgrade-premium"
          onClick={onUpgrade}
          disabled={isLoading}
          className="w-full group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-[#e6ff2a] to-[#b7f758] px-6 py-3.5 text-sm font-black text-[#04181C] shadow-[0_4px_20px_rgba(230,255,42,0.3)] transition hover:shadow-[0_4px_30px_rgba(230,255,42,0.5)] hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 disabled:scale-100"
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:translate-x-full transition-transform duration-700" />
          {isLoading
            ? <><Loader2 size={16} className="animate-spin" /> Procesando...</>
            : <><Zap size={16} /> Activar PREMIUM</>
          }
        </button>
      )}
    </div>
  );
}
