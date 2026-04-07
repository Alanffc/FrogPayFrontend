import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Toast from './Toast';

const CARD_OPTIONS = {
  iconStyle: 'solid',
  style: {
    base: {
      iconColor: '#e6ff2a',
      color: '#ffffff',
      fontWeight: 500,
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      fontSize: '15px',
      fontSmoothing: 'antialiased',
      ':-webkit-autofill': { color: '#fce883' },
      '::placeholder': { color: '#9ca3af' },
    },
    invalid: {
      iconColor: '#ef4444',
      color: '#ef4444',
    },
  },
};

// Formulario conectado con backend de Chris (HU-2.04)
export default function CheckoutForm({ amount = "50.00", webhookUrl, backendUrl = "http://localhost:3000", apiKey }) {
  const stripe = useStripe();
  const elements = useElements();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [paymentResult, setPaymentResult] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);
    setErrorMessage(null);

    const cardElement = elements.getElement(CardElement);
    const { error, token } = await stripe.createToken(cardElement);

    if (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
      return;
    }

    // Enviar token real al endpoint de Chris (HU-2.04)
    try {
      const idempotencyKey = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await fetch(`${backendUrl}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(apiKey && { 'x-api-key': apiKey }),
        },
        body: JSON.stringify({
          token: token.id,
          monto: parseFloat(amount),
          moneda: 'USD',
          clave_idempotencia: idempotencyKey,
          descripcion: 'Demo de pago desde FrogPay Dashboard',
          metadata: {
            source: 'frontend_demo',
            browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
          },
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(result.error || `Error: ${response.status}`);
        setIsProcessing(false);
        return;
      }

      setPaymentResult(result);
      console.log('Pago procesado exitosamente:', result);
      
      setTimeout(() => {
        const successMsg = result.estado === 'COMPLETED'
          ? `¡Pago exitoso! ID: ${result.payment_id.substring(0, 8)}...`
          : `Pago ${result.estado}: ${result.mensaje}`;
          
        setToast({ show: true, message: successMsg, type: 'success' });
        setIsSuccess(true);
        cardElement.clear();
        
        setTimeout(() => {
          setIsSuccess(false);
          setIsProcessing(false);
        }, 2500);
      }, 1000);
    } catch (fetchError) {
      setErrorMessage(`Error de red: ${fetchError.message}. Asegúrate que el backend está corriendo en ${backendUrl}`);
      setIsProcessing(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-6">
        <div className={`transition-all duration-300 ${isSuccess ? 'scale-95 opacity-50' : 'scale-100 opacity-100'}`}>
          <label className="text-sm font-medium text-gray-300 mb-3 flex items-center gap-2">
            <Lock size={14} className="text-[#e6ff2a] shrink-0" />
            Datos de la Tarjeta de Prueba
          </label>
          
          <div className={`p-3 sm:p-4 rounded-2xl border transition-all duration-300 bg-[#020607] ${
            errorMessage 
              ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
              : 'border-white/10 focus-within:border-[#e6ff2a]/50 focus-within:shadow-[0_0_20px_rgba(230,255,42,0.1)]'
          }`}>
            <CardElement options={CARD_OPTIONS} />
          </div>

          {errorMessage && (
            <div className="mt-3 flex items-center gap-2 text-sm text-red-400 animate-fade-in-up">
              <AlertTriangle size={16} /> {errorMessage}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!stripe || isProcessing || isSuccess}
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
              <Loader2 className="animate-spin" size={20} /> Procesando simulación...
            </>
          ) : (
            `Pagar $${amount}`
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