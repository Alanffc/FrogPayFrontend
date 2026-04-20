import { useState, useEffect } from 'react';
import { Settings, CheckCircle, XCircle, Eye, EyeOff, Loader2, Menu, ShieldCheck, AlertTriangle } from 'lucide-react';
import Toast from '../components/Toast.jsx';
import { apiRequest } from '../services/api.js';

export default function Configuracion({ onToggleSidebar }) {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [storedClientIdPreview, setStoredClientIdPreview] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    const loadConfig = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setIsLoading(false); return; }

      try {
        const data = await apiRequest('/payments/provider-accounts', 'GET', null, token);
        const paypalAccount = data?.data?.find((a) => a.provider === 'paypal');
        const configured = Boolean(paypalAccount?.activo && paypalAccount?.api_key_masked);
        setIsConfigured(configured);
        if (configured && paypalAccount?.api_key_masked) {
          setStoredClientIdPreview(paypalAccount.api_key_masked);
        }
      } catch {
        showToast('No se pudo cargar la configuración de PayPal', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!clientId.trim() || !clientSecret.trim()) {
      showToast('Ambos campos son obligatorios', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) { showToast('Sesión expirada', 'error'); return; }

    setIsSaving(true);
    setVerifyResult(null);
    try {
      await apiRequest('/payments/provider-accounts/paypal', 'PUT', {
        api_key: clientId.trim(),
        secret_key: clientSecret.trim(),
        activo: true,
      }, token);

      setIsConfigured(true);
      const preview = `${clientId.trim().slice(0, 3)}***${clientId.trim().slice(-3)}`;
      setStoredClientIdPreview(preview);
      setClientId('');
      setClientSecret('');
      showToast('Credenciales guardadas. Usa "Verificar conexión" para confirmar que funcionan.');
    } catch (error) {
      showToast(error.message || 'Error al guardar las credenciales', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDisable = async () => {
    const token = localStorage.getItem('token');
    if (!token) { showToast('Sesión expirada', 'error'); return; }

    setIsDisabling(true);
    setVerifyResult(null);
    try {
      await apiRequest('/payments/provider-accounts/paypal', 'PUT', {
        activo: false,
      }, token);

      setIsConfigured(false);
      setStoredClientIdPreview('');
      showToast('PayPal deshabilitado correctamente');
    } catch (error) {
      showToast(error.message || 'Error al deshabilitar PayPal', 'error');
    } finally {
      setIsDisabling(false);
    }
  };

  const handleVerify = async () => {
    const token = localStorage.getItem('token');
    if (!token) { showToast('Sesión expirada', 'error'); return; }

    setIsVerifying(true);
    setVerifyResult(null);
    try {
      const data = await apiRequest('/payments/paypal/verify-credentials', 'GET', null, token);
      setVerifyResult(data);
      if (data.success) {
        showToast(`Conexión con PayPal exitosa — ${data.client_id_preview}`, 'success');
      } else {
        showToast(data.error || 'Las credenciales no funcionan con PayPal', 'error');
      }
    } catch (error) {
      setVerifyResult({ success: false, error: error.message });
      showToast(error.message || 'Error verificando credenciales', 'error');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="w-full relative min-h-screen overflow-x-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(12,70,81,0.15),transparent_70%)] animate-pulse" />
      </div>

      {/* Mobile nav bar */}
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-10 lg:py-16 relative z-10 w-full">
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e6ff2a]/20 bg-[#e6ff2a]/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#e6ff2a] mb-4">
            <Settings size={14} /> Configuración
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Proveedores de Pago
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
            Configura tus credenciales de PayPal para recibir pagos directamente en tu cuenta.
          </p>
        </header>

        {/* PayPal Card */}
        <div className="glass-iphone rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 sm:p-8 w-full">
          {/* Header row */}
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#003087]/20 border border-[#003087]/40 flex items-center justify-center">
                <span className="text-[#009cde] font-black text-sm">PP</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">PayPal</h2>
                <p className="text-xs text-gray-500">Sandbox / Producción</p>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              {isLoading ? (
                <div className="flex items-center gap-2 text-gray-400 text-sm">
                  <Loader2 size={16} className="animate-spin" /> Cargando...
                </div>
              ) : isConfigured ? (
                <div className="flex items-center gap-2 rounded-full bg-green-500/10 border border-green-500/30 px-3 py-1.5 text-sm font-semibold text-green-400">
                  <CheckCircle size={14} /> Configurado
                </div>
              ) : (
                <div className="flex items-center gap-2 rounded-full bg-gray-500/10 border border-gray-500/30 px-3 py-1.5 text-sm font-semibold text-gray-400">
                  <XCircle size={14} /> No configurado
                </div>
              )}

              {isConfigured && (
                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="flex items-center gap-2 rounded-full bg-[#e6ff2a]/10 border border-[#e6ff2a]/30 px-3 py-1.5 text-sm font-semibold text-[#e6ff2a] hover:bg-[#e6ff2a]/20 transition-all disabled:opacity-50"
                >
                  {isVerifying ? <Loader2 size={14} className="animate-spin" /> : <ShieldCheck size={14} />}
                  {isVerifying ? 'Verificando...' : 'Verificar conexión'}
                </button>
              )}
            </div>
          </div>

          {/* Stored client ID preview */}
          {isConfigured && storedClientIdPreview && (
            <div className="mb-4 rounded-2xl border border-white/5 bg-black/30 px-4 py-3 flex items-center gap-3">
              <span className="text-xs text-gray-500">Client ID guardado:</span>
              <code className="text-xs font-mono text-gray-300">{storedClientIdPreview}</code>
            </div>
          )}

          {/* Verify result banner */}
          {verifyResult && (
            <div className={`mb-4 rounded-2xl border px-4 py-3 flex items-start gap-3 ${
              verifyResult.success
                ? 'border-green-500/30 bg-green-500/5 text-green-400'
                : 'border-red-500/30 bg-red-500/5 text-red-400'
            }`}>
              {verifyResult.success
                ? <CheckCircle size={16} className="shrink-0 mt-0.5" />
                : <AlertTriangle size={16} className="shrink-0 mt-0.5" />}
              <div className="text-sm">
                {verifyResult.success ? (
                  <>
                    <p className="font-semibold">Conexión exitosa</p>
                    <p className="text-xs opacity-80">Client ID: {verifyResult.client_id_preview}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold">{verifyResult.error || 'Las credenciales no funcionan'}</p>
                    {verifyResult.paypal_error && (
                      <p className="text-xs opacity-80 mt-1">
                        Código PayPal: <code>{verifyResult.paypal_error}</code>
                      </p>
                    )}
                    {verifyResult.client_id_preview && (
                      <p className="text-xs opacity-80">
                        Client ID guardado: <code>{verifyResult.client_id_preview}</code>
                      </p>
                    )}
                    <p className="text-xs opacity-80 mt-1">
                      Verifica que ingresaste las credenciales correctas de tu cuenta PayPal Developer (sandbox o producción).
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          <p className="text-sm text-gray-400 mb-6">
            Ingresa tus credenciales de la{' '}
            <span className="text-[#e6ff2a]">PayPal Developer Dashboard</span>.{' '}
            {isConfigured ? 'Ingresa nuevas credenciales para reemplazar las actuales.' : 'Ambos campos son obligatorios.'}
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Client ID <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="AXe3g..."
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#e6ff2a]/60 transition-colors font-mono"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Client Secret <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type={showSecret ? 'text' : 'password'}
                  value={clientSecret}
                  onChange={(e) => setClientSecret(e.target.value)}
                  placeholder="EBC99S..."
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 pr-12 text-sm text-white outline-none focus:border-[#e6ff2a]/60 transition-colors font-mono"
                  autoComplete="new-password"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret(!showSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={isSaving || !clientId.trim() || !clientSecret.trim()}
                className="flex-1 bg-[#e6ff2a] text-[#04181C] px-6 py-3.5 rounded-2xl font-bold hover:bg-[#b7f758] disabled:opacity-30 transition-all flex justify-center items-center gap-2"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : null}
                {isSaving ? 'Guardando...' : isConfigured ? 'Actualizar credenciales' : 'Guardar credenciales'}
              </button>

              {isConfigured && (
                <button
                  type="button"
                  onClick={handleDisable}
                  disabled={isDisabling}
                  className="px-6 py-3.5 rounded-2xl font-bold border border-red-500/30 bg-red-500/5 text-red-300 hover:bg-red-500/10 transition-all flex justify-center items-center gap-2 disabled:opacity-30"
                >
                  {isDisabling ? <Loader2 size={18} className="animate-spin" /> : null}
                  {isDisabling ? 'Deshabilitando...' : 'Deshabilitar PayPal'}
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 rounded-2xl border border-white/5 bg-black/20 p-4">
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="text-gray-300 font-semibold">Seguridad:</span>{' '}
              El Client Secret se almacena de forma segura y nunca se expone en la API.
              Usa <span className="text-[#e6ff2a]">Verificar conexión</span> para confirmar que tus credenciales funcionan antes de procesar pagos reales.
            </p>
          </div>
        </div>
      </div>

      <Toast
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
