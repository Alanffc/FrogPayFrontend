import { useState, useEffect } from 'react';
import { 
  X, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  AlertCircle 
} from 'lucide-react';
import { getStoredApiKey } from '../services/tenantKey.js';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const API_KEY = getStoredApiKey();
const AMOUNT = 499.00; // Precio del plan PREMIUM en BOB
const CURRENCY_DISPLAY = 'BOB';

export default function PayPalSubscriptionModal({ isOpen, onClose, onSuccess, currency = 'USD' }) {
  // paso: 'idle' | 'created' | 'approved' | 'done'
  const [step, setStep] = useState('idle');
  const [isLoading, setIsLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [approvalUrl, setApprovalUrl] = useState(null);
  const [result, setResult] = useState(null);
  const [resultMsg, setResultMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      handleReset();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const handleReset = () => {
    setStep('idle');
    setOrderId(null);
    setApprovalUrl(null);
    setResult(null);
    setResultMsg('');
    setIsLoading(false);
  };

  const handleCreateOrder = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/paypal/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({ amount: 72.00, currency: 'USD', description: 'Suscripción Plan PREMIUM — FrogPay' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      setOrderId(data.orderId);
      setApprovalUrl(data.approvalUrl);
      setStep('created');
    } catch (err) {
      setResult('RECHAZADO');
      setResultMsg(err.message);
      setStep('done');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCapture = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/paypal/capture-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
      
      setResult('APROBADO');
      setResultMsg(`Pago completado exitosamente.`);
      setStep('done');
      
      // Notificar éxito después de un breve delay para que vean el check verde
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
      
    } catch (err) {
      setResult('RECHAZADO');
      setResultMsg(err.message);
      setStep('done');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalClick = () => {
    // Simulamos que el usuario aprobó en la pestaña externa
    setStep('approved');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#040A0B] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <div className="p-6 pb-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#003087] flex items-center justify-center text-lg font-black text-white">
              P
            </div>
            <div>
              <p className="font-bold text-white">Pago con PayPal</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Simulación de suscripción</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-6">
            <span className="text-gray-400 text-sm">Plan PREMIUM</span>
            <span className="text-white font-black text-2xl">{CURRENCY_DISPLAY} {AMOUNT.toFixed(2)} <span className="text-sm font-normal text-gray-500">/ mes</span></span>
          </div>

          {/* Indicador de pasos */}
          <div className="flex items-center justify-between gap-2 px-2">
            {['Orden', 'Aprobar', 'Capturar'].map((label, i) => {
              const stepOrder = { idle: 0, created: 1, approved: 2, done: 3 };
              const current = stepOrder[step] ?? 0;
              const done = current > i;
              const active = current === i;
              return (
                <div key={i} className="flex flex-col items-center gap-2 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    done ? 'bg-green-500 text-white' : active ? 'bg-[#e6ff2a] text-[#04181C]' : 'bg-white/5 text-gray-600 border border-white/10'
                  }`}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span className={`text-[10px] uppercase tracking-tighter ${done ? 'text-green-400' : active ? 'text-white font-bold' : 'text-gray-600'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Contenido dinámico según el paso */}
          <div className="min-h-[140px] flex flex-col justify-center">
            {step === 'idle' && (
              <div className="space-y-4 animate-fade-in-up">
                <p className="text-sm text-gray-400 text-center leading-relaxed">
                  Para activar tu plan PREMIUM, iniciaremos una orden de pago segura a través de PayPal.
                </p>
                <button
                  onClick={handleCreateOrder}
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-[#0070ba] text-white font-black text-sm hover:bg-[#005ea6] transition-all shadow-[0_8px_20px_rgba(0,112,186,0.3)] flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Iniciar Pago con PayPal'}
                </button>
              </div>
            )}

            {step === 'created' && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-4 space-y-3">
                  <p className="text-xs text-gray-400 text-center">
                    Haz clic abajo para simular la aprobación en PayPal. En un entorno real, esto abriría una ventana de PayPal.
                  </p>
                  <a
                    href={approvalUrl}
                    onClick={handleApprovalClick}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-2xl bg-[#ffc439] text-[#003087] font-black text-sm hover:bg-[#f0b429] transition-all"
                  >
                    Aprobar en PayPal →
                  </a>
                </div>
              </div>
            )}

            {step === 'approved' && (
              <div className="space-y-4 animate-fade-in-up">
                <div className="rounded-2xl border border-green-500/20 bg-green-500/5 p-4 text-center">
                  <p className="text-sm font-bold text-green-400">¡Pago aprobado en PayPal!</p>
                  <p className="text-[10px] text-gray-500 mt-1 uppercase">ID: {orderId?.slice(0, 18)}...</p>
                </div>
                <button
                  onClick={handleCapture}
                  disabled={isLoading}
                  className="w-full h-12 rounded-2xl bg-green-500 text-white font-black text-sm hover:bg-green-400 transition-all shadow-[0_8px_20px_rgba(34,197,94,0.3)] flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 size={18} className="animate-spin" /> : 'Confirmar y Activar Plan'}
                </button>
              </div>
            )}

            {step === 'done' && result && (
              <div className={`flex flex-col items-center text-center space-y-3 animate-bounce-in`}>
                {result === 'APROBADO' 
                  ? <CheckCircle2 size={60} className="text-green-500" />
                  : <XCircle size={60} className="text-red-500" />
                }
                <div>
                  <p className={`text-xl font-black ${result === 'APROBADO' ? 'text-green-400' : 'text-red-400'}`}>
                    {result}
                  </p>
                  <p className="text-sm text-gray-500">{resultMsg}</p>
                </div>
              </div>
            )}
          </div>

          <p className="text-[10px] text-center text-gray-600">
            Esta es una transacción de prueba. No se realizará ningún cargo real.
          </p>
        </div>
      </div>
    </div>
  );
}
