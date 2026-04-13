import { useState } from 'react';
import { Loader2, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Toast from './Toast';

// Formulario conectado con backend de Chris (HU-2.04)
export default function CheckoutForm({ amount = "50.00", webhookUrl, backendUrl = "http://localhost:3000", apiKey }) {
  const resolvedBackendUrl = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const resolvedApiKey = apiKey || import.meta.env.VITE_API_KEY || localStorage.getItem('api_key') || '';
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const executePayment = async () => {
    const idempotencyKey = `payment_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

    if (!resolvedApiKey) {
      throw new Error('No hay API Key configurada para procesar pagos.');
    }

    const response = await fetch(`${resolvedBackendUrl}/api/payments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': resolvedApiKey,
      },
      body: JSON.stringify({
        provider: 'paypal',
        monto: parseFloat(amount),
        moneda: 'USD',
        clave_idempotencia: idempotencyKey,
        descripcion: 'Demo de pago con PayPal desde FrogPay Dashboard',
        metadata: {
          source: 'frontend_demo',
          browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          method: 'paypal',
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Error: ${response.status}`);
    }

    const successMsg = result.estado === 'COMPLETED'
      ? `Pago exitoso (PAYPAL) ID: ${result.payment_id.substring(0, 8)}...`
      : `Pago ${result.estado}: ${result.mensaje}`;

    setToast({ show: true, message: successMsg, type: 'success' });
    setIsSuccess(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      await executePayment();

      setTimeout(() => {
        setIsSuccess(false);
        setIsProcessing(false);
      }, 2500);
    } catch (fetchError) {
      setErrorMessage(fetchError.message || `Error procesando el pago. Verifica conexión con ${resolvedBackendUrl}`);
      setIsProcessing(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <div className={`transition-all duration-300 ${isSuccess ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
          <label className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Lock size={14} className="text-[#e6ff2a] shrink-0" />
            Checkout PayPal
          </label>
          <div className="rounded-2xl border border-white/10 bg-[#020607] px-4 py-5 text-sm text-gray-300">
            <p className="font-semibold text-white mb-1">Paga con PayPal</p>
            <p>Completa tu pago de forma segura con tu cuenta PayPal.</p>
          </div>

          {errorMessage && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-400 animate-fade-in-up">
              <AlertTriangle size={16} /> {errorMessage}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={isProcessing || isSuccess}
          className={`relative w-full h-12 sm:h-[56px] inline-flex items-center justify-center gap-2 sm:gap-3 rounded-xl font-bold sm:font-black text-base sm:text-lg transition-all duration-300 overflow-hidden
            ${isSuccess 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default' 
              : isProcessing 
              ? 'bg-[#e6ff2a]/80 text-[#04181C] cursor-not-allowed scale-[0.98]' 
              : 'bg-[#e6ff2a] text-[#04181C] hover:bg-[#b7f758] shadow-[0_10px_25px_rgba(230,255,42,0.2)] hover:-translate-y-1 active:scale-95'
            }`}
        >
          {isSuccess ? (
            <>
              <CheckCircle2 className="animate-pulse" size={20} /> 
              Pago completado
            </>
          ) : isProcessing ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Procesando PayPal...
            </>
          ) : (
            `Pagar $${amount} con PayPal`
          )}
        </button>
      </form>

      <Toast 
        isVisible={toast.show} 
        message={toast.message} 
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })} 
      />
    </>
  );
}