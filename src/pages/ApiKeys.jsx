import { useEffect, useState } from 'react';
import { Terminal, Eye, EyeOff, Copy, Check, ShieldAlert, Menu, LogOut, AlertTriangle } from 'lucide-react';
import { clearStoredApiKey, getStoredApiKey, maskApiKey } from '../services/tenantKey.js';

export default function ApiKeys({ onToggleSidebar }) {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const syncKey = () => setApiKey(getStoredApiKey());

    window.addEventListener('storage', syncKey);
    window.addEventListener('frogpay:api-key-changed', syncKey);

    return () => {
      window.removeEventListener('storage', syncKey);
      window.removeEventListener('frogpay:api-key-changed', syncKey);
    };
  }, []);

  const handleCopy = async () => {
    if (!apiKey) {
      return;
    }

    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_error) {
      // El navegador puede bloquear clipboard.
    }
  };

  const handleClear = () => {
    clearStoredApiKey();
    setApiKey('');
    setRevealed(false);
    setCopied(false);
  };

  const maskedKey = maskApiKey(apiKey) || 'No hay API key guardada';

  return (
    <div className="w-full min-h-screen relative">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(12,70,81,0.15),transparent_70%)]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-[radial-gradient(circle,rgba(230,255,42,0.07),transparent_72%)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10 lg:py-16">
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
            La clave activa se obtiene al registrar o iniciar sesión en el tenant. Aquí solo se muestra la credencial real guardada en este navegador.
          </p>
        </header>

        <div className="glass-iphone rounded-[2rem] border border-white/10 bg-white/[0.02] p-8 space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-1">
                Clave del tenant
                <span className="ml-2 text-xs font-black bg-[#e6ff2a]/10 text-[#e6ff2a] border border-[#e6ff2a]/20 px-2 py-0.5 rounded-md align-middle">
                  LIVE
                </span>
              </h2>
              <p className="text-sm text-gray-500">Usa esta credencial para autenticar requests con FrogPay.</p>
            </div>
            <span className={`shrink-0 flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full border ${apiKey ? 'text-green-400 bg-green-400/10 border-green-400/20' : 'text-yellow-300 bg-yellow-300/10 border-yellow-300/20'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${apiKey ? 'bg-green-400 animate-pulse' : 'bg-yellow-300'}`} />
              {apiKey ? 'Activa' : 'Pendiente'}
            </span>
          </div>

          <div className="flex items-center gap-2 rounded-2xl border border-white/5 bg-[#020607] p-2 pl-5">
            <code className="flex-1 font-mono text-sm text-[#e6ff2a] truncate">
              {revealed ? apiKey || 'No hay API key disponible' : maskedKey}
            </code>
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
              <button
                onClick={() => setRevealed((value) => !value)}
                className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                title={revealed ? 'Ocultar' : 'Revelar'}
                disabled={!apiKey}
              >
                {revealed ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
              <button
                onClick={handleCopy}
                className="p-2 text-gray-400 hover:text-[#e6ff2a] transition-colors rounded-lg hover:bg-white/5 disabled:opacity-40 disabled:hover:text-gray-400"
                title="Copiar"
                disabled={!apiKey}
              >
                {copied ? <Check size={17} className="text-green-400" /> : <Copy size={17} />}
              </button>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <ShieldAlert size={16} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-xs text-red-300 leading-relaxed">
              No hardcodes credenciales en el frontend. Si cierras sesión, la key se elimina de este navegador.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Gestión local</p>
              <p className="text-xs text-gray-500 mt-0.5">Puedes limpiar la credencial del navegador sin afectar el tenant en FrogPay.</p>
            </div>
            <button
              onClick={handleClear}
              disabled={!apiKey}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 bg-white/5 text-gray-200 hover:bg-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <LogOut size={15} />
              Limpiar credencial
            </button>
          </div>
        </div>

        <div className="mt-6 glass-iphone rounded-[2rem] border border-white/10 bg-white/[0.02] p-8">
          <h3 className="text-lg font-bold text-white mb-5">Cómo usar la API Key</h3>
          <div className="space-y-4">
            <p className="text-sm text-gray-400">Incluye la clave en el header <code className="text-[#e6ff2a] bg-[#e6ff2a]/10 px-1.5 py-0.5 rounded text-xs font-mono">x-api-key</code> de cada request.</p>
            <div className="rounded-xl bg-[#020607] border border-white/5 p-4 font-mono text-xs text-gray-300 overflow-x-auto">
              <span className="text-purple-400">POST</span>{' '}
              <span className="text-gray-400">https://tu-backend-frogpay.com/api/payments</span>
              {'\n'}
              <span className="text-blue-400">x-api-key</span>
              <span className="text-gray-500">: </span>
              <span className="text-[#e6ff2a]">{apiKey ? maskApiKey(apiKey) : '<tu_api_key>'}</span>
              {'\n'}
              <span className="text-blue-400">Content-Type</span>
              <span className="text-gray-500">: </span>
              <span className="text-green-400">application/json</span>
            </div>
            {!apiKey && (
              <div className="flex items-start gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3 text-xs text-yellow-200">
                <AlertTriangle size={14} className="mt-0.5 shrink-0" />
                Inicia sesión o registra un tenant para que el backend te entregue una API key válida.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
