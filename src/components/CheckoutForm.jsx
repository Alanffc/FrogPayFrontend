import { useState, useEffect } from 'react';
import { Loader2, Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import Toast from './Toast';
import { getStoredApiKey } from '../services/tenantKey.js';

// Formulario conectado con backend de Chris (HU-2.04)
export default function CheckoutForm({ amount = "50.00", provider = "mock", webhookUrl, backendUrl = "http://localhost:3000", apiKey }) {
  const resolvedBackendUrl = backendUrl || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
  const resolvedApiKey = apiKey || getStoredApiKey();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [currencies, setCurrencies] = useState([]);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [exchangeRate, setExchangeRate] = useState(null);

  // Cargar monedas al montar el componente
  useEffect(() => {
    const loadCurrencies = async () => {
      try {
        const response = await fetch(`${resolvedBackendUrl}/api/currencies`);
        if (response.ok) {
          const data = await response.json();
          setCurrencies(data.data || []);
        }
      } catch (error) {
        console.error('Error cargando monedas:', error);
      }
    };
    loadCurrencies();
  }, [resolvedBackendUrl]);

  // Calcular tipo de cambio cuando cambie amount o currency
  useEffect(() => {
    const calculateExchangeRate = async () => {
      if (selectedCurrency === 'USD') {
        setExchangeRate(null); // No mostrar si es USD
        return;
      }
      try {
        const response = await fetch(`${resolvedBackendUrl}/api/payments/exchange-rate?amount=${amount}&fromCurrency=${selectedCurrency}&toCurrency=USD`);
        if (response.ok) {
          const data = await response.json();
          setExchangeRate(data.data);
        } else {
          setExchangeRate(null);
        }
      } catch (error) {
        console.error('Error calculando tasa:', error);
        setExchangeRate(null);
      }
    };
    calculateExchangeRate();
  }, [amount, selectedCurrency, resolvedBackendUrl]);

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
        provider,
        amount: parseFloat(amount),
        currency: selectedCurrency,
        idempotencyKey,
        description: `Demo de pago con ${provider} desde FrogPay Dashboard`,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Error: ${response.status}`);
    }

    const txId = result.payment_id ?? result.transactionId ?? '';
    const successMsg = `Pago exitoso (${provider.toUpperCase()}) ID: ${txId.toString().slice(0, 8)}...`;

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
            Checkout {provider === 'mock' ? 'Simulado' : 'PayPal'}
          </label>

          {/* Selector de moneda */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Moneda</label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full px-3 py-2 bg-[#020607] border border-white/10 rounded-lg text-gray-300 focus:outline-none focus:border-[#e6ff2a]"
            >
              {currencies.map((currency) => (
                <option key={currency.codigo} value={currency.codigo}>
                  {currency.nombre} ({currency.codigo})
                </option>
              ))}
            </select>
          </div>

          {/* Visualización de tipo de cambio */}
          {exchangeRate && (
            <div className="mb-4 p-3 bg-[#020607] border border-white/10 rounded-lg">
              <p className="text-sm text-gray-300">
                <strong>Tasa de cambio:</strong> 1 {selectedCurrency} = {exchangeRate.exchangeRate.toFixed(4)} USD
              </p>
              <p className="text-sm text-gray-300">
                <strong>Monto original:</strong> {amount} {selectedCurrency}
              </p>
              <p className="text-sm text-gray-300">
                <strong>Monto convertido:</strong> {exchangeRate.convertedAmount} USD
              </p>
              <p className="text-xs text-gray-500">
                Base: USD | Actualizado: {new Date(exchangeRate.timestamp).toLocaleString()}
              </p>
            </div>
          )}

          <div className="rounded-2xl border border-white/10 bg-[#020607] px-4 py-5 text-sm text-gray-300">
            {provider === 'mock' ? (
              <>
                <p className="font-semibold text-white mb-1">Pago simulado (Mock)</p>
                <p>Simula un cobro real sin credenciales externas. Ideal para pruebas.</p>
              </>
            ) : (
              <>
                <p className="font-semibold text-white mb-1">Paga con PayPal</p>
                <p>Completa tu pago de forma segura con tu cuenta PayPal.</p>
              </>
            )}
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
              <Loader2 className="animate-spin" size={20} /> Procesando...
            </>
          ) : (
            `Pagar ${amount} ${selectedCurrency} con ${provider === 'mock' ? 'Simulador' : 'PayPal'}`
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