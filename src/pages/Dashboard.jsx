/* src/pages/Dashboard.jsx */
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Copy, Check, Link2, Loader2, AlertTriangle, Terminal, Zap, Menu, Key, BookOpen } from 'lucide-react';
import Toast from '../components/Toast.jsx';
import CheckoutForm from '../components/CheckoutForm.jsx';
import { apiRequest } from '../services/api.js';
import { getStoredApiKey, maskApiKey } from '../services/tenantKey.js';
import { useNavigate } from 'react-router-dom';

// Tooltip de Vidrio (Mantenido igual)
const GlassTooltip = ({ message }) => {
  if (!message) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/80 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-md w-max max-w-[90vw] animate-fade-in-up">
      <AlertTriangle size={16} className="text-orange-400 flex-shrink-0" />
      <p className="text-left">{message}</p>
      <div className="absolute -top-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-black/80"></div>
    </div>
  );
};

// NUEVO: Componente para los pasos del tutorial
const StepIndicator = ({ step, title, icon: Icon, description }) => (
  <div className="mb-6">
    <div className="flex items-center gap-3 mb-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#e6ff2a] text-[#04181C] font-black text-sm">
        {step}
      </div>
      <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
        {Icon && <Icon size={20} className="text-[#e6ff2a]" />}
        {title}
      </h2>
    </div>
    {description && <p className="text-sm text-gray-400 pl-11">{description}</p>}
  </div>
);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

export default function Dashboard({ onToggleSidebar, currentPlan }) {
  const isPremium = currentPlan === 'PREMIUM';
  const navigate = useNavigate();

  const fullApiKey = getStoredApiKey();
  const hiddenApiKey = maskApiKey(fullApiKey) || 'Sin API Key disponible';

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
      setToast({ show: true, message: 'Webhook guardado exitosamente', type: 'success' });
    } catch (error) {
      setIsSaving(false);
      setToast({ show: true, message: error.message || 'Error guardando webhook', type: 'error' });
    }
  };

  return (
    <div className="w-full relative min-h-screen overflow-x-hidden">
      
      {/* Fondos ambientales */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(12,70,81,0.15),transparent_70%)] animate-pulse"></div>
      </div>

      {/* BARRA DE NAVEGACIÓN MÓVIL FLOTANTE */}
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
          onClick={onToggleSidebar}
          className="p-2 bg-white/5 rounded-xl border border-white/10 text-white transition-colors hover:bg-white/10 focus:outline-none"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-10 lg:py-16 relative z-10 w-full">
        
        <header className="mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e6ff2a]/20 bg-[#e6ff2a]/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#e6ff2a] mb-4">
            <BookOpen size={14} /> Guía de Inicio Rápido
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4 break-words">
            Tu primera integración
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
            Sigue estos 3 sencillos pasos para autenticar tu cuenta, recibir notificaciones y simular tu primer pago exitoso.
          </p>
        </header>

        {/* Grid Principal */}
        <div className="grid lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* COLUMNA IZQUIERDA: Configuración */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8 w-full min-w-0">
            
            {/* PASO 1 */}
            <div className="glass-iphone rounded-[2rem] border border-white/10 bg-white/[0.02] p-5 sm:p-8 w-full">
              <StepIndicator 
                step="1" 
                title="Copia tu API Key" 
                icon={Key}
                description="Usa esta clave en los headers de tu backend (Authorization: Bearer) para crear órdenes de pago de forma segura."
              />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/5 bg-[#020607] p-3 sm:p-2 sm:pl-6 overflow-hidden w-full ml-0 sm:ml-11 max-w-full sm:max-w-[calc(100%-2.75rem)]">
                <div className="min-w-0 flex-1 w-full">
                  <code className="font-mono text-xs sm:text-sm text-[#e6ff2a] block truncate">
                    {isRevealed ? fullApiKey : hiddenApiKey}
                  </code>
                </div>
                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl self-end sm:self-auto shrink-0 mt-2 sm:mt-0">
                  <button onClick={() => setIsRevealed(!isRevealed)} className="p-2 text-gray-400 hover:text-white transition-colors focus:outline-none" title="Mostrar/Ocultar">
                    {isRevealed ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                  <button onClick={handleCopy} className="p-2 text-gray-400 hover:text-[#e6ff2a] transition-colors focus:outline-none" title="Copiar al portapapeles">
                    {isCopied ? <Check size={18} /> : <Copy size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {/* PASO 2 */}
            <div className="glass-iphone rounded-[2rem] border border-white/10 bg-white/[0.02] p-5 sm:p-8 w-full">
              <StepIndicator 
                step="2" 
                title="Configura tu Webhook" 
                icon={Link2}
                description="FrogPay enviará una petición POST a esta URL cuando un pago se complete. Asegúrate de que sea pública (usa servicios como Ngrok si estás en localhost)."
              />
              
              <div className="flex flex-col sm:flex-row gap-4 w-full ml-0 sm:ml-11 max-w-full sm:max-w-[calc(100%-2.75rem)]">
                <div className="relative flex-1 min-w-0">
                  <input
                    type="url"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://tu-api.com/webhook/frogpay"
                    className={`w-full rounded-2xl border ${isHttpWarning ? 'border-orange-500/50 bg-orange-500/5' : 'border-white/10 bg-black/40'} px-4 sm:px-5 py-3 sm:py-4 text-sm sm:text-base text-white outline-none focus:border-[#e6ff2a]/80 transition-colors truncate`}
                  />
                  <GlassTooltip message={isHttpWarning ? "Las URLs deben usar HTTPS por seguridad." : null} />
                </div>
                <button
                  onClick={handleSaveWebhook}
                  disabled={!webhookUrl.trim() || isHttpWarning || isSaving || isLoadingWebhook}
                  className="bg-[#e6ff2a] text-[#04181C] px-8 py-3.5 sm:py-4 rounded-2xl font-bold hover:bg-[#b7f758] disabled:opacity-30 transition-all flex justify-center items-center shrink-0 w-full sm:w-auto"
                >
                  {isSaving ? <Loader2 className="animate-spin" /> : 'Guardar Endpoint'}
                </button>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA: PASO 3 (Simulador) */}
          <div className="lg:col-span-5 w-full">
            <div className="rounded-[2rem] sm:rounded-[2.5rem] border border-[#e6ff2a]/30 bg-gradient-to-b from-[#0c4651]/30 to-black p-5 sm:p-8 shadow-2xl relative overflow-hidden w-full">
              <div className="absolute top-0 right-4 sm:right-8 bg-[#e6ff2a] text-[#04181C] text-[10px] font-black px-4 py-1.5 rounded-b-lg">ENTORNO SEGURO</div>
              
              <StepIndicator 
                step="3" 
                title="Prueba el flujo" 
                icon={Zap}
                description={savedWebhook ? "Interactúa con el checkout. Enviaremos un evento a tu webhook configurado." : "Guarda un webhook en el paso 2 para probar la notificación completa."}
              />
              
              <div className="mt-6">
                <CheckoutForm amount="50.00" webhookUrl={savedWebhook} backendUrl={BACKEND_URL} apiKey={fullApiKey} />
              </div>
            </div>
          </div>

        </div>
      </div>

      <Toast isVisible={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
    </div>
  );
}