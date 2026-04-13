import { useState } from 'react';
import { Terminal, Eye, EyeOff, Copy, Check, RefreshCw, ShieldAlert, Menu } from 'lucide-react';

const MOCK_KEY = 'fp_live_9a8b7c6d5e4f3g2h1i0j2k3l4m5n6o7p';
const MASKED_KEY = 'fp_live_••••••••••••••••••••••••••••••••';

export default function ApiKeys({ onToggleSidebar }) {
  const [revealed,   setRevealed]   = useState(false);
  const [copied,     setCopied]     = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(MOCK_KEY);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback silencioso
    }
  };

  const handleGenerate = () => {
    setGenerating(true);
    setTimeout(() => setGenerating(false), 1500);
  };

  return (
    <div className="w-full min-h-screen relative">

      {/* Fondo ambiental */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(12,70,81,0.15),transparent_70%)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10 lg:py-16">

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-4 mb-6 lg:hidden">
            <button
              type="button"
              onClick={onToggleSidebar}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 text-white hover:bg-white/10 transition"
            >
              <Menu size={20} />
            </button>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#e6ff2a]/20 bg-[#e6ff2a]/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#e6ff2a] mb-4">
            <Terminal size={14} /> API & Webhooks
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">
            Claves de API
          </h1>
          <p className="text-gray-400 max-w-xl leading-relaxed">
            Usa estas claves para autenticar las peticiones de tus servidores hacia FrogPay.
            No compartas tus claves secretas en lugares públicos.
          </p>
        </header>

        {/* Card principal */}
        <div className="glass-iphone rounded-[2rem] border border-white/10 bg-white/[0.02] p-8 space-y-6">

          {/* Encabezado de la card */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Clave de Producción
                <span className="ml-2 text-xs font-black bg-[#e6ff2a]/10 text-[#e6ff2a] border border-[#e6ff2a]/20 px-2 py-0.5 rounded-md align-middle">
                  LIVE
                </span>
              </h2>
              <p className="text-sm text-gray-500">Úsala para procesar pagos reales desde tu servidor.</p>
            </div>
            <span className="shrink-0 flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-green-400 bg-green-400/10 border border-green-400/20 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Activa
            </span>
          </div>

          {/* Campo de la key */}
          <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-[#020607] p-2 pl-5">
            <code className="flex-1 font-mono text-sm text-[#e6ff2a] truncate">
              {revealed ? MOCK_KEY : MASKED_KEY}
            </code>
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setRevealed(!revealed)}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                title={revealed ? 'Ocultar' : 'Revelar'}
              >
                {revealed ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
              <button
                onClick={handleCopy}
                className="p-2 text-gray-400 hover:text-[#e6ff2a] transition-colors rounded-lg hover:bg-white/5"
                title="Copiar"
              >
                {copied ? <Check size={17} className="text-green-400" /> : <Copy size={17} />}
              </button>
            </div>
          </div>

          {/* Aviso de seguridad */}
          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-relaxed">
              Por seguridad, tu clave secreta solo se muestra completa una vez al momento de registrarte.
              Si la perdiste, genera una nueva — la anterior quedará inválida de inmediato.
            </p>
          </div>

          {/* Separador */}
          <div className="border-t border-white/5" />

          {/* Botón generar */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Rotar API Key</p>
              <p className="text-xs text-gray-500 mt-0.5">Genera una nueva clave e invalida la actual.</p>
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300
                ${generating
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed border border-white/10'
                  : 'bg-[#e6ff2a] text-[#04181C] hover:bg-[#b7f758] shadow-[0_6px_16px_rgba(230,255,42,0.15)] hover:-translate-y-0.5 active:scale-95'
                }`}
            >
              <RefreshCw size={15} className={generating ? 'animate-spin' : ''} />
              {generating ? 'Generando...' : 'Generar nueva key'}
            </button>
          </div>
        </div>

        {/* Info de uso */}
        <div className="mt-6 glass-iphone rounded-[2rem] border border-white/10 bg-white/[0.02] p-8">
          <h3 className="text-lg font-bold text-white mb-5">Cómo usar la API Key</h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Incluye la clave en el header <code className="text-[#e6ff2a] bg-[#e6ff2a]/10 px-1.5 py-0.5 rounded text-xs font-mono">x-api-key</code> de cada request:</p>
            <div className="rounded-xl bg-[#020607] border border-white/5 p-4 font-mono text-xs text-gray-300 overflow-x-auto">
              <span className="text-purple-400">POST</span>{' '}
              <span className="text-gray-400">https://api.frogpay.com/api/payments</span>
              {'\n'}
              <span className="text-blue-400">x-api-key</span>
              <span className="text-gray-500">: </span>
              <span className="text-[#e6ff2a]">fp_live_••••••••••••••••</span>
              {'\n'}
              <span className="text-blue-400">Content-Type</span>
              <span className="text-gray-500">: </span>
              <span className="text-green-400">application/json</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
