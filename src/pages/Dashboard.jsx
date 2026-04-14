/* src/pages/Dashboard.jsx */
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, Check, Link2, Loader2, AlertTriangle, Terminal, Zap, Menu } from 'lucide-react';
import Toast from '../components/Toast.jsx';
import CheckoutForm from '../components/CheckoutForm.jsx';
import { apiRequest } from '../services/api.js';

// Tooltip de Vidrio
const GlassTooltip = ({ message }) => {
  if (!message) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/80 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-md whitespace-nowrap animate-fade-in-up">
      <AlertTriangle size={16} className="text-orange-400 flex-shrink-0" />
      <p>{message}</p>
      <div className="absolute -top-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-black/80"></div>
    </div>
  );
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const API_KEY = localStorage.getItem('api_key') || import.meta.env.VITE_API_KEY || '';

export default function Dashboard({ onToggleSidebar }) {
  const fullApiKey = API_KEY;
  const hiddenApiKey = fullApiKey
    ? `${fullApiKey.slice(0, 8)}••••••••••••••••••••${fullApiKey.slice(-4)}`
    : 'Sin API Key disponible';

  const [isRevealed, setIsRevealed] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [savedWebhook, setSavedWebhook] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingWebhook, setIsLoadingWebhook] = useState(true);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [isHttpWarning, setIsHttpWarning] = useState(false);

  useEffect(() => {
    let timer;
    if (isRevealed) timer = setTimeout(() => setIsRevealed(false), 15000);
    return () => clearTimeout(timer);
  }, [isRevealed]);

  useEffect(() => {
    setIsHttpWarning(webhookUrl.startsWith('http://'));
  }, [webhookUrl]);

  useEffect(() => {
    const loadWebhook = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoadingWebhook(false);
        return;
      }

      try {
        const data = await apiRequest('/webhooks', 'GET', null, token);
        const currentUrl = data?.data?.url || '';
        setWebhookUrl(currentUrl);
        setSavedWebhook(currentUrl);
      } catch (_error) {
        setToast({ show: true, message: 'No se pudo cargar el webhook actual', type: 'error' });
      } finally {
        setIsLoadingWebhook(false);
      }
    };

    loadWebhook();
  }, []);

  const handleCopy = async () => {
    if (!fullApiKey) {
      setToast({ show: true, message: 'No hay API Key para copiar', type: 'error' });
      return;
    }

    try {
      await navigator.clipboard.writeText(fullApiKey);
      setIsCopied(true);
      setToast({ show: true, message: 'API Key copiada', type: 'success' });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      setToast({ show: true, message: 'Error al copiar', type: 'error' });
    }
  };

  const handleSaveWebhook = async () => {
    if (!webhookUrl.trim() || isHttpWarning) return;
    const token = localStorage.getItem('token');
    if (!token) {
      setToast({ show: true, message: 'Sesión expirada', type: 'error' });
      return;
    }

    setIsSaving(true);
    try {
      const data = await apiRequest('/webhooks', 'PUT', { url: webhookUrl, evento: 'payment.completed', activo: true }, token);
      setIsSaving(false);
      setSavedWebhook(data?.data?.url || webhookUrl);
      setToast({ show: true, message: 'Webhook guardado', type: 'success' });
    } catch (error) {
      setIsSaving(false);
      setToast({ show: true, message: error.message || 'Error guardando webhook', type: 'error' });
    }
  };

  return (
    // Quitamos el pl-72 y el sidebar interno. Este div ahora es solo el contenido.
    <div className="w-full relative min-h-screen">
      
      {/* Fondos ambientales */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(12,70,81,0.15),transparent_70%)] animate-pulse"></div>
      </div>

      {/* Contenedor con ancho máximo controlado para que no se pegue a los bordes */}
      <div className="max-w-6xl mx-auto px-6 py-10 lg:py-16 relative z-10">
        
        <header className="mb-12">
          <div className="flex items-center justify-between gap-4 mb-6 lg:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-3 text-white transition hover:bg-white/10"
              onClick={onToggleSidebar}
              aria-label="Abrir menú"
            >
              <Menu size={20} />
            </button>
            <span className="text-base font-semibold text-gray-200">Menú</span>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e6ff2a]/20 bg-[#e6ff2a]/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#e6ff2a] mb-4">
            <Terminal size={14} /> Desarrolladores
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            API & Webhooks
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl leading-relaxed">
            Configura tus credenciales y prueba el flujo de pago en tiempo real.
          </p>
        </header>

        {/* Grid Principal */}
        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* FASE 1: Configuración */}
          <div className="lg:col-span-7 space-y-8">
            <div className="glass-iphone rounded-[2rem] border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                Claves de Producción 
                <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-1 rounded-md border border-green-500/30">LIVE</span>
              </h2>
              
              <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#020607] p-2 pl-6">
                <code className="font-mono text-sm text-[#e6ff2a] truncate">
                  {isRevealed ? fullApiKey : hiddenApiKey}
                </code>
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl">
                  <button onClick={() => setIsRevealed(!isRevealed)} className="p-2 text-gray-400 hover:text-white">
                    {isRevealed ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-[#e6ff2a]">
                    {isCopied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="glass-iphone rounded-[2rem] border border-white/10 bg-white/[0.02] p-8">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-3">
                <Link2 size={20} className="text-[#e6ff2a]" /> Webhook Endpoint
              </h2>
              <div className="flex flex-col sm:flex-row gap-4 mt-6">
                <div className="relative flex-1">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://tu-api.com/webhook"
                    className={`w-full rounded-2xl border ${isHttpWarning ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/10 bg-black/40'} px-5 py-4 text-white outline-none focus:border-[#e6ff2a]/80`}
                  />
                  <GlassTooltip message={isHttpWarning ? "Las URLs deben usar HTTPS." : null} />
                </div>
                <button
                  onClick={handleSaveWebhook}
                  disabled={!webhookUrl.trim() || isHttpWarning || isSaving || isLoadingWebhook}
                  className="bg-[#e6ff2a] text-[#04181C] px-8 py-4 rounded-2xl font-bold hover:bg-[#b7f758] disabled:opacity-30 transition-all"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : 'Guardar'}
                </button>
              </div>
            </div>
          </div>

          {/* FASE 2: Simulador */}
          <div className="lg:col-span-5">
            <div className="rounded-[2.5rem] border border-[#e6ff2a]/30 bg-gradient-to-b from-[#0c4651]/30 to-black p-8 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-8 bg-[#e6ff2a] text-[#04181C] text-[10px] font-black px-4 py-1.5 rounded-b-lg">MODO PRUEBA</div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-3 mb-6 mt-4">
                <Zap size={24} className="text-[#e6ff2a]" /> Simulador
              </h2>
              <CheckoutForm amount="50.00" webhookUrl={savedWebhook} backendUrl={BACKEND_URL} apiKey={API_KEY} />
            </div>
          </div>
        </div>
      </div>

      <Toast isVisible={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}