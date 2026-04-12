import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  CreditCard, Zap, CheckCircle2, XCircle, Loader2,
  Terminal, Lock, AlertCircle, ChevronRight, ArrowLeft,
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
const API_KEY     = import.meta.env.VITE_API_KEY     || 'fp_live_demo_key_for_testing';
const AMOUNT      = 50.00;

// ── Tarjetas de prueba ─────────────────────────────────────────────────────────
const TEST_CARDS = [
  { label: 'Tarjeta válida',  number: '4242 4242 4242 4242', expiry: '12/28', cvv: '123', variant: 'success' },
  { label: 'Sin fondos',      number: '4000 0000 0000 9995', expiry: '06/27', cvv: '456', variant: 'warning' },
  { label: 'Bloqueada',       number: '4000 0000 0000 0002', expiry: '03/26', cvv: '789', variant: 'danger'  },
];

const CARD_VARIANT_STYLES = {
  success: 'border-green-500/40 bg-green-500/5 hover:bg-green-500/10 text-green-400',
  warning: 'border-yellow-500/40 bg-yellow-500/5 hover:bg-yellow-500/10 text-yellow-400',
  danger:  'border-red-500/40 bg-red-500/5 hover:bg-red-500/10 text-red-400',
};

// ── Utilidades ─────────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function formatCardNumber(value) {
  return value.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
}

function nowTs() {
  return new Date().toLocaleTimeString('es-MX', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    + '.' + String(Date.now() % 1000).padStart(3, '0');
}

// ── Componente LogEntry ────────────────────────────────────────────────────────
function LogEntry({ entry, index }) {
  const typeStyles = {
    info:    'text-blue-400',
    success: 'text-green-400',
    error:   'text-red-400',
    webhook: 'text-purple-400',
  };
  const icons = {
    info:    <ChevronRight size={13} className="shrink-0 mt-0.5" />,
    success: <CheckCircle2 size={13} className="shrink-0 mt-0.5" />,
    error:   <XCircle size={13} className="shrink-0 mt-0.5" />,
    webhook: <Zap size={13} className="shrink-0 mt-0.5" />,
  };

  return (
    <div
      className="animate-fade-in-up font-mono text-xs"
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className={`flex items-start gap-2 ${typeStyles[entry.type]}`}>
        {icons[entry.type]}
        <span className="text-gray-500 shrink-0">[{entry.timestamp}]</span>
        <span className="font-semibold">{entry.step}</span>
        {entry.statusCode && (
          <span className={`ml-auto shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold ${entry.statusCode < 300 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
            {entry.statusCode}
          </span>
        )}
      </div>
      {entry.body && (
        <pre className="mt-1 ml-10 text-gray-400 bg-white/[0.03] rounded p-2 overflow-x-auto text-[10px] leading-relaxed whitespace-pre-wrap">
          {JSON.stringify(entry.body, null, 2)}
        </pre>
      )}
    </div>
  );
}

// ── Tab: Tarjeta Simulada ──────────────────────────────────────────────────────
function CardTab({ backendOk }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry,     setExpiry]     = useState('');
  const [cvv,        setCvv]        = useState('');
  const [isRunning,  setIsRunning]  = useState(false);
  const [logs,       setLogs]       = useState([]);
  const [result,     setResult]     = useState(null); // null | 'APROBADO' | 'RECHAZADO'
  const [resultMsg,  setResultMsg]  = useState('');
  const logEndRef = useRef(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const addLog = (step, type, statusCode = null, body = null) => {
    setLogs((prev) => [...prev, { timestamp: nowTs(), step, type, statusCode, body }]);
  };

  const fillCard = (card) => {
    setCardNumber(card.number);
    setExpiry(card.expiry);
    setCvv(card.cvv);
    setLogs([]);
    setResult(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isRunning) return;

    setIsRunning(true);
    setLogs([]);
    setResult(null);

    const rawNumber = cardNumber.replace(/\s/g, '');

    // Paso 1 — Validación local
    await sleep(300);
    if (rawNumber.length < 16 || !expiry || cvv.length < 3) {
      addLog('Validación de datos', 'error', 400, { error: 'Datos de tarjeta incompletos' });
      setResult('RECHAZADO');
      setResultMsg('Datos de tarjeta inválidos');
      setIsRunning(false);
      return;
    }
    addLog('Validación de datos', 'success', 200, { valid: true, last4: rawNumber.slice(-4), expiry });

    // Paso 2 — Tokenización simulada
    await sleep(700);
    const fakeToken = 'tok_' + Math.random().toString(36).slice(2, 14);
    addLog('Tokenización de tarjeta', 'success', 200, { token: fakeToken, masked: `****-****-****-${rawNumber.slice(-4)}` });

    // Paso 3 — Request al backend
    await sleep(500);
    addLog('Enviando request de pago...', 'info');

    let backendStatus, backendBody;
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({
          provider: 'mock',
          amount: AMOUNT,
          currency: 'USD',
          description: 'Demo tarjeta simulada — FrogPay',
          cardNumber: rawNumber,
        }),
      });
      backendStatus = res.status;
      backendBody   = await res.json();
    } catch {
      addLog('Error de conexión con el backend', 'error', null, { error: `No se pudo conectar a ${BACKEND_URL}` });
      setResult('RECHAZADO');
      setResultMsg(`No se pudo conectar al backend en ${BACKEND_URL}`);
      setIsRunning(false);
      return;
    }

    // Paso 4 — Respuesta del backend
    await sleep(200);
    const isApproved = backendStatus < 300;
    addLog('Respuesta del backend', isApproved ? 'success' : 'error', backendStatus, backendBody);

    // Paso 5 — Webhook simulado
    await sleep(400);
    const webhookPayload = {
      event: isApproved ? 'payment.completed' : 'payment.failed',
      timestamp: new Date().toISOString(),
      payload: {
        payment_id: backendBody.payment_id ?? backendBody.transactionId ?? null,
        amount: AMOUNT,
        currency: 'USD',
        status: backendBody.estado ?? (isApproved ? 'COMPLETED' : 'FAILED'),
        provider: 'mock',
        card_last4: rawNumber.slice(-4),
        ...(backendBody.raw && { detail: backendBody.raw }),
      },
    };
    addLog('Webhook enviado al tenant', 'webhook', 200, webhookPayload);

    // Resultado final
    if (isApproved) {
      setResult('APROBADO');
      setResultMsg(`Transacción #${(backendBody.payment_id ?? '').toString().slice(0, 8)}... procesada correctamente`);
    } else {
      setResult('RECHAZADO');
      setResultMsg(backendBody.error ?? 'Pago rechazado por el proveedor');
    }

    setIsRunning(false);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-6">

      {/* Formulario */}
      <div className="space-y-5">
        {/* Botones de tarjeta rápida */}
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3 font-semibold">Tarjetas de prueba</p>
          <div className="flex flex-col gap-2">
            {TEST_CARDS.map((card) => (
              <button
                key={card.number}
                type="button"
                onClick={() => fillCard(card)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200 ${CARD_VARIANT_STYLES[card.variant]}`}
              >
                <span>{card.label}</span>
                <span className="font-mono text-xs opacity-70">{card.number}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5 font-medium">Número de tarjeta</label>
            <div className="relative">
              <CreditCard size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="text"
                inputMode="numeric"
                placeholder="4242 4242 4242 4242"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-white placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-[#e6ff2a]/50 focus:bg-white/[0.06] transition-all"
                maxLength={19}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">Vencimiento</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="MM/AA"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-[#e6ff2a]/50 focus:bg-white/[0.06] transition-all"
                maxLength={5}
                required
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">CVV</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="123"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm font-mono focus:outline-none focus:border-[#e6ff2a]/50 focus:bg-white/[0.06] transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isRunning || !backendOk}
            className={`w-full h-12 rounded-xl font-black text-base transition-all duration-300 flex items-center justify-center gap-2
              ${isRunning
                ? 'bg-[#e6ff2a]/70 text-[#04181C] cursor-not-allowed'
                : !backendOk
                ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
                : 'bg-[#e6ff2a] text-[#04181C] hover:bg-[#b7f758] shadow-[0_8px_20px_rgba(230,255,42,0.2)] hover:-translate-y-0.5 active:scale-95'
              }`}
          >
            {isRunning ? (
              <><Loader2 size={18} className="animate-spin" /> Procesando...</>
            ) : (
              <><Lock size={16} /> Pagar ${AMOUNT.toFixed(2)}</>
            )}
          </button>

          {!backendOk && (
            <p className="text-xs text-red-400 flex items-center gap-1.5">
              <AlertCircle size={13} /> Backend no disponible en {BACKEND_URL}
            </p>
          )}
        </form>
      </div>

      {/* Log en tiempo real + Resultado */}
      <div className="space-y-4">
        {/* Resultado */}
        {result && (
          <div className={`rounded-2xl border p-5 flex items-center gap-4 ${
            result === 'APROBADO'
              ? 'bg-green-500/10 border-green-500/30'
              : 'bg-red-500/10 border-red-500/30'
          }`}>
            {result === 'APROBADO'
              ? <CheckCircle2 size={32} className="text-green-400 shrink-0" />
              : <XCircle     size={32} className="text-red-400 shrink-0" />
            }
            <div>
              <p className={`text-2xl font-black ${result === 'APROBADO' ? 'text-green-400' : 'text-red-400'}`}>
                {result}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">{resultMsg}</p>
            </div>
          </div>
        )}

        {/* Log panel */}
        <div className="rounded-2xl border border-white/10 bg-[#020607] overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
            <Terminal size={14} className="text-[#e6ff2a]" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Log en tiempo real</span>
            {isRunning && <Loader2 size={12} className="animate-spin text-[#e6ff2a] ml-auto" />}
          </div>
          <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-xs text-gray-600 font-mono">Esperando acción de pago...</p>
            ) : (
              logs.map((entry, i) => <LogEntry key={i} entry={entry} index={i} />)
            )}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tab: PayPal (flujo real 3 pasos) ──────────────────────────────────────────
function PayPalTab({ backendOk, initialOrderId }) {
  // paso: 'idle' | 'created' | 'approved' | 'done'
  const [step,         setStep]         = useState(initialOrderId ? 'approved' : 'idle');
  const [isLoading,    setIsLoading]    = useState(false);
  const [orderId,      setOrderId]      = useState(initialOrderId ?? null);
  const [approvalUrl,  setApprovalUrl]  = useState(null);
  const [result,       setResult]       = useState(null);
  const [resultMsg,    setResultMsg]    = useState('');

  const handleCreateOrder = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/payments/paypal/create-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': API_KEY },
        body: JSON.stringify({ amount: AMOUNT, currency: 'USD', description: 'Demo FrogPay — PayPal' }),
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
      setResultMsg(`ID: ${orderId.slice(0, 14)}...`);
      setStep('done');
    } catch (err) {
      setResult('RECHAZADO');
      setResultMsg(err.message);
      setStep('done');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovalClick = () => {
    // El usuario abrió PayPal — marcamos como aprobado después de un delay
    // que les da tiempo de completar el pago antes de volver
    setStep('approved');
  };

  const handleReset = () => {
    setStep('idle');
    setOrderId(null);
    setApprovalUrl(null);
    setResult(null);
    setResultMsg('');
  };

  return (
    <div className="max-w-md mx-auto space-y-5">

      {/* Card principal */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#003087] flex items-center justify-center text-lg font-black text-white">P</div>
          <div>
            <p className="font-bold text-white">Pago con PayPal</p>
            <p className="text-xs text-gray-500">Sandbox — API REST v2 — Flujo OAuth2</p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          <span className="text-gray-400 text-sm">Total a pagar</span>
          <span className="text-white font-black text-xl">${AMOUNT.toFixed(2)} USD</span>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center gap-2 text-xs">
          {['Crear orden', 'Aprobar', 'Capturar'].map((label, i) => {
            const stepOrder = { idle: 0, created: 1, approved: 2, done: 3 };
            const current = stepOrder[step] ?? 0;
            const done   = current > i;
            const active = current === i;
            return (
              <div key={i} className="flex items-center gap-2">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  done ? 'bg-green-500 text-white' : active ? 'bg-[#e6ff2a] text-[#04181C]' : 'bg-white/10 text-gray-500'
                }`}>
                  {done ? '✓' : i + 1}
                </div>
                <span className={done ? 'text-green-400' : active ? 'text-white font-semibold' : 'text-gray-600'}>
                  {label}
                </span>
                {i < 2 && <div className="flex-1 h-px bg-white/10 min-w-[16px]" />}
              </div>
            );
          })}
        </div>

        {/* Paso 1: Crear orden */}
        {step === 'idle' && (
          <button
            onClick={handleCreateOrder}
            disabled={isLoading || !backendOk}
            className={`w-full h-12 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2
              ${isLoading ? 'bg-[#0070ba]/70 text-white cursor-not-allowed'
              : !backendOk ? 'bg-white/5 text-gray-600 cursor-not-allowed border border-white/10'
              : 'bg-[#0070ba] text-white hover:bg-[#005ea6] shadow-[0_6px_16px_rgba(0,112,186,0.3)] hover:-translate-y-0.5 active:scale-95'}`}
          >
            {isLoading ? <><Loader2 size={16} className="animate-spin" /> Creando orden...</> : 'Paso 1 — Crear Orden PayPal'}
          </button>
        )}

        {/* Paso 2: Aprobar en PayPal */}
        {step === 'created' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/5 p-4 space-y-3">
              <p className="text-sm font-semibold text-yellow-400">Orden creada · ID: {orderId?.slice(0, 14)}...</p>
              <p className="text-xs text-gray-400">
                Abre el enlace de PayPal, inicia sesión con tu cuenta <strong className="text-white">sandbox buyer</strong> y completa el pago. La página volverá automáticamente.
              </p>
              <a
                href={approvalUrl}
                onClick={handleApprovalClick}
                target="_self"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full h-10 rounded-lg bg-[#ffc439] text-[#003087] font-black text-sm hover:bg-[#f0b429] transition-colors"
              >
                Paso 2 — Ir a PayPal para aprobar →
              </a>
            </div>
            <p className="text-xs text-gray-600 text-center">
              Después de aprobar en PayPal, serás redirigido de vuelta aquí automáticamente.
            </p>
          </div>
        )}

        {/* Paso 3: Capturar (llegó de vuelta desde PayPal) */}
        {step === 'approved' && (
          <div className="space-y-3">
            <div className="rounded-xl border border-green-500/30 bg-green-500/5 p-4">
              <p className="text-sm font-semibold text-green-400 flex items-center gap-2">
                <CheckCircle2 size={16} /> Pago aprobado en PayPal
              </p>
              <p className="text-xs text-gray-400 mt-1">
                ID de orden: <span className="font-mono text-gray-300">{orderId?.slice(0, 18)}...</span>
              </p>
            </div>
            <button
              onClick={handleCapture}
              disabled={isLoading}
              className={`w-full h-11 rounded-xl font-black text-sm transition-all duration-300 flex items-center justify-center gap-2
                ${isLoading
                  ? 'bg-green-500/50 text-white cursor-not-allowed'
                  : 'bg-green-500 text-white hover:bg-green-400 active:scale-95 shadow-[0_6px_16px_rgba(34,197,94,0.3)]'}`}
            >
              {isLoading ? <><Loader2 size={16} className="animate-spin" /> Capturando pago...</> : 'Paso 3 — Confirmar Captura'}
            </button>
          </div>
        )}

        {!backendOk && step === 'idle' && (
          <p className="text-xs text-red-400 flex items-center gap-1.5">
            <AlertCircle size={13} /> Backend no disponible en {BACKEND_URL}
          </p>
        )}
      </div>

      {/* Resultado */}
      {step === 'done' && result && (
        <div className={`rounded-2xl border p-5 space-y-3 ${
          result === 'APROBADO' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="flex items-center gap-4">
            {result === 'APROBADO'
              ? <CheckCircle2 size={32} className="text-green-400 shrink-0" />
              : <XCircle size={32} className="text-red-400 shrink-0" />}
            <div>
              <p className={`text-2xl font-black ${result === 'APROBADO' ? 'text-green-400' : 'text-red-400'}`}>{result}</p>
              <p className="text-sm text-gray-400 mt-0.5">{resultMsg}</p>
            </div>
          </div>
          <button onClick={handleReset} className="text-xs text-gray-500 hover:text-white transition-colors">
            ← Reiniciar
          </button>
        </div>
      )}

      <p className="text-xs text-gray-600 text-center">
        Necesitas credenciales PayPal sandbox activas en el backend.
      </p>
    </div>
  );
}

// ── Página Principal ───────────────────────────────────────────────────────────
export default function PaymentDemo() {
  const [activeTab,           setActiveTab]           = useState('card');
  const [backendStatus,       setBackendStatus]       = useState(null);
  const [initialPaypalOrder,  setInitialPaypalOrder]  = useState(null);

  // Detectar retorno de PayPal: ?token=ORDER_ID&PayerID=...
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token   = params.get('token');
    const payerId = params.get('PayerID');
    if (token && payerId) {
      setActiveTab('paypal');
      setInitialPaypalOrder(token);
      window.history.replaceState({}, '', '/checkout'); // limpia la URL
    }
  }, []);

  useEffect(() => {
    const check = async () => {
      try {
        // Un GET a /api/payments retorna 404 o 400 pero confirma que el servidor responde
        const res = await fetch(`${BACKEND_URL}/api/payments/health-check`, {
          method: 'GET',
          signal: AbortSignal.timeout(3000),
        }).catch(() => null);
        setBackendStatus({ ok: res !== null });
      } catch {
        setBackendStatus({ ok: false });
      }
    };
    check();
    const id = setInterval(check, 6000);
    return () => clearInterval(id);
  }, []);

  const backendOk = backendStatus?.ok !== false;

  return (
    <div className="min-h-screen bg-[#040A0B] text-white">

      {/* Fondos ambientales */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[35vw] h-[35vw] rounded-full bg-[radial-gradient(circle,rgba(230,255,42,0.08),transparent_60%)]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(12,70,81,0.18),transparent_60%)]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16">

        {/* Volver al dashboard */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={15} /> Volver al Dashboard
        </Link>

        {/* Header */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e6ff2a]/20 bg-[#e6ff2a]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#e6ff2a] mb-5">
            <Zap size={12} className="animate-pulse" /> Demo end-to-end
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-3">
            Simulador de Pagos <span className="text-[#e6ff2a]">FrogPay</span>
          </h1>
          <p className="text-gray-400 text-sm max-w-xl mx-auto">
            Prueba el flujo completo: validación, tokenización, request al backend y webhook simulado.
            Monto fijo de <strong className="text-white">${AMOUNT.toFixed(2)} USD</strong>.
          </p>

          {/* Estado del backend */}
          <div className={`inline-flex items-center gap-2 mt-4 px-3 py-1.5 rounded-full text-xs font-medium border ${
            backendStatus === null
              ? 'border-white/10 text-gray-500'
              : backendOk
              ? 'border-green-500/30 bg-green-500/10 text-green-400'
              : 'border-red-500/30 bg-red-500/10 text-red-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${backendStatus === null ? 'bg-gray-500' : backendOk ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {backendStatus === null ? 'Verificando backend...' : backendOk ? `Backend activo · ${BACKEND_URL}` : `Backend sin conexión · ${BACKEND_URL}`}
          </div>
        </div>

        {/* Tabs */}
        <div className="glass-iphone rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 sm:p-8">
          <div className="flex gap-1 mb-8 bg-white/[0.04] rounded-xl p-1">
            <button
              onClick={() => setActiveTab('card')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === 'card'
                  ? 'bg-[#e6ff2a] text-[#04181C] shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <CreditCard size={15} /> Tarjeta Simulada
            </button>
            <button
              onClick={() => setActiveTab('paypal')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 ${
                activeTab === 'paypal'
                  ? 'bg-[#e6ff2a] text-[#04181C] shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <span className="font-black text-base leading-none">P</span> PayPal
            </button>
          </div>

          {activeTab === 'card'
            ? <CardTab backendOk={backendOk} />
            : <PayPalTab backendOk={backendOk} initialOrderId={initialPaypalOrder} />
          }
        </div>

        {/* Info tarjetas de prueba */}
        {activeTab === 'card' && (
          <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.02] p-5">
            <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mb-3">Referencia de tarjetas de prueba</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="text-gray-600 border-b border-white/5">
                    <th className="text-left py-2 pr-4">Número</th>
                    <th className="text-left py-2 pr-4">Escenario</th>
                    <th className="text-left py-2">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.03]">
                  <tr>
                    <td className="py-2 pr-4 text-gray-300">4242 4242 4242 4242</td>
                    <td className="py-2 pr-4 text-gray-400">Tarjeta válida</td>
                    <td className="py-2 text-green-400 font-bold">APROBADO</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-gray-300">4000 0000 0000 9995</td>
                    <td className="py-2 pr-4 text-gray-400">Sin fondos</td>
                    <td className="py-2 text-red-400 font-bold">RECHAZADO</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 text-gray-300">4000 0000 0000 0002</td>
                    <td className="py-2 pr-4 text-gray-400">Tarjeta bloqueada</td>
                    <td className="py-2 text-red-400 font-bold">RECHAZADO</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
