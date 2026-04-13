import { Sparkles } from 'lucide-react';
import MagneticButton from './MagneticButton.jsx';

const cardTypes = [
  { value: 'debit', label: 'Tarjeta de débito' },
  { value: 'credit', label: 'Tarjeta de crédito' },
];

const formatCardNumber = (value) =>
  value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(.{4})/g, '$1 ')
    .trim();

const formatExpiry = (value) =>
  value
    .replace(/\D/g, '')
    .slice(0, 4)
    .replace(/(.{2})/, '$1/')
    .trim();

export default function CardForm({
  cardType,
  setCardType,
  cardholder,
  setCardholder,
  cardNumber,
  setCardNumber,
  expiry,
  setExpiry,
  cvc,
  setCvc,
  error,
  isLoading, // Recibimos la prop de carga
  onSubmit,
}) {
  return (
    <section className="glass-iphone rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-xl">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Formulario de tarjeta</h2>
          <p className="text-sm text-gray-400">Configura los datos y registra la tarjeta de manera segura.</p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-[#0c4651]/80 px-3 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e6ff2a]">
          <Sparkles size={16} /> Experiencia limpia
        </span>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div>
          <label className="text-sm font-medium text-gray-300">Tipo de tarjeta</label>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {cardTypes.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setCardType(option.value)}
                disabled={isLoading} // Opcional: Evitar cambiar el tipo mientras carga
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  cardType === option.value
                    ? 'border-[#e6ff2a] bg-[#e6ff2a]/10 text-white'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className="block text-sm font-semibold">{option.label}</span>
                <span className="text-xs text-gray-400">Acepta todos los principales emisores</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            Nombre en la tarjeta
            <input
              type="text"
              value={cardholder}
              onChange={(e) => setCardholder(e.target.value)}
              disabled={isLoading}
              placeholder="Nombre del titular"
              className="rounded-2xl border border-white/10 bg-[#020607] px-4 py-3 text-white outline-none focus:border-[#e6ff2a] disabled:opacity-50"
            />
          </label>

          <label className="flex flex-col gap-2 text-sm text-gray-300">
            Número de tarjeta
            <input
              type="text"
              inputMode="numeric"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              disabled={isLoading}
              placeholder="1234 5678 9012 3456"
              className="rounded-2xl border border-white/10 bg-[#020607] px-4 py-3 text-white outline-none focus:border-[#e6ff2a] disabled:opacity-50"
            />
          </label>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            Vencimiento
            <input
              type="text"
              inputMode="numeric"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              disabled={isLoading}
              placeholder="MM/AA"
              className="rounded-2xl border border-white/10 bg-[#020607] px-4 py-3 text-white outline-none focus:border-[#e6ff2a] disabled:opacity-50"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-gray-300">
            CVC
            <input
              type="text"
              inputMode="numeric"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
              disabled={isLoading}
              placeholder="123"
              className="rounded-2xl border border-white/10 bg-[#020607] px-4 py-3 text-white outline-none focus:border-[#e6ff2a] disabled:opacity-50"
            />
          </label>
          <div className="flex flex-col gap-2 text-sm text-gray-300">
            Banco / Emisor
            <input
              type="text"
              placeholder="Banco emisor"
              disabled={isLoading}
              className="rounded-2xl border border-white/10 bg-[#020607] px-4 py-3 text-white outline-none focus:border-[#e6ff2a] disabled:opacity-50"
            />
          </div>
        </div>

        {error && <p className="text-sm font-semibold text-red-400">{error}</p>}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="rounded-2xl border border-white/10 bg-[#020607]/60 p-4 text-sm text-gray-300">
            <p className="font-semibold text-white">Privacidad y seguridad</p>
            <p className="mt-2 text-gray-400">Los datos ingresados se almacenan de forma segura.</p>
          </div>
          <MagneticButton 
            className={`w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#e6ff2a] text-[#04181C] font-bold ${isLoading ? 'opacity-70 cursor-wait' : ''}`} 
            type="submit"
            disabled={isLoading} // Deshabilitamos el botón internamente
          >
            {isLoading ? 'Registrando...' : 'Registrar tarjeta'}
          </MagneticButton>
        </div>
      </form>
    </section>
  );
}