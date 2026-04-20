import { useEffect, useMemo, useState } from 'react';
import { Building2, Wallet, CreditCard, Save, Loader2, AlertTriangle, CheckCircle2, Menu } from 'lucide-react';
import Toast from '../components/Toast.jsx';
import { getProviderAccounts, saveProviderAccount } from '../services/providerAccounts.service.js';

const defaultPayPal = {
  displayName: '',
  merchantEmail: '',
  merchantAccountId: '',
  settlementCurrency: 'USD',
  webhookSecret: '',
  callbackUrl: '',
};

const defaultCard = {
  accountHolderName: '',
  settlementAccountAlias: '',
  supportEmail: '',
  statementDescriptor: '',
  acceptedBrands: ['visa', 'mastercard'],
  chargebackEmail: '',
  settlementDelayDays: 2,
};

const inputClass = 'mt-2 block w-full rounded-xl border border-white/12 bg-black/35 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e6ff2a]/70 focus:ring-2 focus:ring-[#e6ff2a]/20 transition';
const labelClass = 'text-sm font-semibold text-gray-200';
const helperClass = 'text-[11px] text-gray-500 mt-1';

function Field({ label, hint, children }) {
  return (
    <label className={labelClass}>
      {label}
      {children}
      {hint ? <p className={helperClass}>{hint}</p> : null}
    </label>
  );
}

export default function PayoutAccounts({ onToggleSidebar }) {
  const [loading, setLoading] = useState(true);
  const [savingPayPal, setSavingPayPal] = useState(false);
  const [savingCard, setSavingCard] = useState(false);

  const [paypal, setPayPal] = useState(defaultPayPal);
  const [card, setCard] = useState(defaultCard);
  const [paypalApiKey, setPayPalApiKey] = useState('');
  const [paypalSecretKey, setPayPalSecretKey] = useState('');
  const [cardApiKey, setCardApiKey] = useState('');
  const [cardSecretKey, setCardSecretKey] = useState('');
  const [paypalActive, setPayPalActive] = useState(true);
  const [cardActive, setCardActive] = useState(true);

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [error, setError] = useState('');

  const acceptedBrandSet = useMemo(() => new Set(card.acceptedBrands || []), [card.acceptedBrands]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await getProviderAccounts();
        const rows = Array.isArray(response?.data) ? response.data : [];

        const paypalRow = rows.find((row) => row.provider === 'paypal_mock');
        const cardRow = rows.find((row) => row.provider === 'card_simulated');

        if (paypalRow?.configuracion) {
          setPayPal({ ...defaultPayPal, ...paypalRow.configuracion });
          setPayPalActive(paypalRow.activo !== false);
        }

        if (cardRow?.configuracion) {
          setCard({ ...defaultCard, ...cardRow.configuracion });
          setCardActive(cardRow.activo !== false);
        }
      } catch (fetchError) {
        setError(fetchError.message || 'No se pudo cargar la configuración de cuentas de cobro');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const toggleBrand = (brand) => {
    const current = new Set(card.acceptedBrands || []);
    if (current.has(brand)) {
      current.delete(brand);
    } else {
      current.add(brand);
    }

    setCard((prev) => ({
      ...prev,
      acceptedBrands: Array.from(current),
    }));
  };

  const validatePayPal = () => {
    if (!paypal.displayName.trim()) return 'Ingresa un nombre comercial para PayPal Mock';
    if (!paypal.merchantEmail.trim()) return 'Ingresa el correo del comercio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypal.merchantEmail)) return 'Correo de comercio inválido';
    if (!paypal.merchantAccountId.trim()) return 'Ingresa el Merchant Account ID';
    return '';
  };

  const validateCard = () => {
    if (!card.accountHolderName.trim()) return 'Ingresa el titular de la cuenta de liquidación';
    if (!card.settlementAccountAlias.trim()) return 'Ingresa el alias de la cuenta de liquidación';
    if (!card.supportEmail.trim()) return 'Ingresa el correo de soporte';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(card.supportEmail)) return 'Correo de soporte inválido';
    if (!card.statementDescriptor.trim()) return 'Ingresa el descriptor de estado de cuenta';
    if (!Array.isArray(card.acceptedBrands) || card.acceptedBrands.length === 0) return 'Selecciona al menos una marca de tarjeta';
    return '';
  };

  const handleSavePayPal = async () => {
    const message = validatePayPal();
    if (message) {
      setToast({ show: true, message, type: 'error' });
      return;
    }

    setSavingPayPal(true);
    try {
      await saveProviderAccount('paypal_mock', {
        api_key: paypalApiKey || null,
        secret_key: paypalSecretKey || null,
        activo: paypalActive,
        configuracion: {
          ...paypal,
        },
      });
      setToast({ show: true, message: 'Cuenta de PayPal Mock actualizada', type: 'success' });
    } catch (saveError) {
      setToast({ show: true, message: saveError.message || 'No se pudo guardar PayPal Mock', type: 'error' });
    } finally {
      setSavingPayPal(false);
    }
  };

  const handleSaveCard = async () => {
    const message = validateCard();
    if (message) {
      setToast({ show: true, message, type: 'error' });
      return;
    }

    setSavingCard(true);
    try {
      await saveProviderAccount('card_simulated', {
        api_key: cardApiKey || null,
        secret_key: cardSecretKey || null,
        activo: cardActive,
        configuracion: {
          ...card,
          settlementDelayDays: Number(card.settlementDelayDays || 2),
        },
      });
      setToast({ show: true, message: 'Cuenta de tarjetas simuladas actualizada', type: 'success' });
    } catch (saveError) {
      setToast({ show: true, message: saveError.message || 'No se pudo guardar card_simulated', type: 'error' });
    } finally {
      setSavingCard(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-300">
        <Loader2 className="animate-spin mr-2" /> Cargando cuentas de cobro...
      </div>
    );
  }

  return (
    // 1. Añadimos overflow-x-hidden para evitar scroll lateral accidental
    <div className="w-full min-h-screen relative overflow-x-hidden">
      
      {/* Fondos ambientales */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(12,70,81,0.15),transparent_70%)]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-[radial-gradient(circle,rgba(230,255,42,0.07),transparent_72%)]" />
      </div>

      {/* --- BARRA DE NAVEGACIÓN MÓVIL FLOTANTE --- */}
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

      {/* Contenedor principal ajustado con pt-28 para el menú en móviles */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 pt-28 pb-10 lg:py-16 space-y-6 sm:space-y-8 w-full">
        
        <header className="mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e6ff2a]/20 bg-[#e6ff2a]/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#e6ff2a] mb-4">
            <Building2 size={14} /> Cuentas de cobro
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3 break-words">Configuración de recepción</h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-3xl leading-relaxed">
            Define a qué cuentas del tenant se acreditan los pagos. En este alcance usamos <strong>PayPal Mock</strong> y <strong>Card Simulada</strong>, con campos equivalentes a un onboarding real.
          </p>
        </header>

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300 text-sm">
            <AlertTriangle size={16} className="shrink-0" /> <span className="break-words">{error}</span>
          </div>
        )}

        <section className="grid gap-6 sm:gap-8 lg:grid-cols-2 items-start w-full">
          {/* Tarjeta PayPal */}
          <article className="glass-iphone rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-5 sm:p-8 space-y-6 shadow-[0_30px_60px_rgba(0,0,0,0.35)] w-full">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-white/10">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2"><Wallet size={18} className="text-[#e6ff2a]" /> PayPal Mock</h2>
                <p className="text-xs text-gray-400 mt-1 max-w-md">Simula la cuenta comercial donde recibirías fondos de billetera digital.</p>
              </div>
              <label className="text-xs text-gray-200 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 self-start sm:self-auto shrink-0">
                <input type="checkbox" checked={paypalActive} onChange={(e) => setPayPalActive(e.target.checked)} className="accent-[#e6ff2a]" /> Activo
              </label>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-white/8 bg-black/25 p-4 sm:p-5">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Identidad comercial</p>
                <div className="grid gap-4">
                  <Field label="Nombre comercial" hint="Este nombre se mostrará en tu panel operativo.">
                    <input className={inputClass} value={paypal.displayName} onChange={(e) => setPayPal((prev) => ({ ...prev, displayName: e.target.value }))} placeholder="Frog Market Bolivia" />
                  </Field>
                  <Field label="Correo de comercio" hint="Contacto principal para liquidaciones y avisos.">
                    <input type="email" className={inputClass} value={paypal.merchantEmail} onChange={(e) => setPayPal((prev) => ({ ...prev, merchantEmail: e.target.value }))} placeholder="payments@miempresa.com" />
                  </Field>
                  <Field label="Merchant Account ID (mock)">
                    <input className={inputClass} value={paypal.merchantAccountId} onChange={(e) => setPayPal((prev) => ({ ...prev, merchantAccountId: e.target.value }))} placeholder="MERCHANT-BO-001" />
                  </Field>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/25 p-4 sm:p-5">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Parámetros técnicos</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Moneda de liquidación">
                    <select className={inputClass} value={paypal.settlementCurrency} onChange={(e) => setPayPal((prev) => ({ ...prev, settlementCurrency: e.target.value }))}>
                      <option value="USD">USD</option>
                      <option value="BOB">BOB</option>
                    </select>
                  </Field>
                  <Field label="Webhook secret (simulado)">
                    <input className={inputClass} value={paypal.webhookSecret} onChange={(e) => setPayPal((prev) => ({ ...prev, webhookSecret: e.target.value }))} placeholder="whsec_xxx" />
                  </Field>
                </div>
                <div className="mt-4">
                  <Field label="Callback URL (opcional)">
                    <input type="url" className={inputClass} value={paypal.callbackUrl} onChange={(e) => setPayPal((prev) => ({ ...prev, callbackUrl: e.target.value }))} placeholder="https://mi-erp.com/paypal/callback" />
                  </Field>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Field label="Client ID sandbox (mock)">
                    <input className={inputClass} value={paypalApiKey} onChange={(e) => setPayPalApiKey(e.target.value)} placeholder="sb-client-id" />
                  </Field>
                  <Field label="Client secret sandbox (mock)">
                    <input className={inputClass} value={paypalSecretKey} onChange={(e) => setPayPalSecretKey(e.target.value)} placeholder="sb-client-secret" />
                  </Field>
                </div>
              </div>
            </div>

            <button onClick={handleSavePayPal} disabled={savingPayPal} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#e6ff2a] text-[#04181C] py-3.5 font-black tracking-wide hover:bg-[#b7f758] disabled:opacity-40 transition-all">
              {savingPayPal ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Guardar PayPal Mock
            </button>
          </article>

          {/* Tarjeta Card Simulada */}
          <article className="glass-iphone rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-5 sm:p-8 space-y-6 shadow-[0_30px_60px_rgba(0,0,0,0.35)] w-full">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-white/10">
              <div>
                <h2 className="text-xl font-black text-white flex items-center gap-2"><CreditCard size={18} className="text-[#e6ff2a]" /> Card Simulada</h2>
                <p className="text-xs text-gray-400 mt-1 max-w-md">Configura cómo el tenant recibiría cobros de tarjetas en un escenario de integración real.</p>
              </div>
              <label className="text-xs text-gray-200 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 self-start sm:self-auto shrink-0">
                <input type="checkbox" checked={cardActive} onChange={(e) => setCardActive(e.target.checked)} className="accent-[#e6ff2a]" /> Activo
              </label>
            </div>

            <div className="space-y-5">
              <div className="rounded-2xl border border-white/8 bg-black/25 p-4 sm:p-5">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Datos de liquidación</p>
                <div className="grid gap-4">
                  <Field label="Titular de la cuenta de liquidación">
                    <input className={inputClass} value={card.accountHolderName} onChange={(e) => setCard((prev) => ({ ...prev, accountHolderName: e.target.value }))} placeholder="Mi Empresa S.R.L." />
                  </Field>
                  <Field label="Alias cuenta liquidación">
                    <input className={inputClass} value={card.settlementAccountAlias} onChange={(e) => setCard((prev) => ({ ...prev, settlementAccountAlias: e.target.value }))} placeholder="BANCO-BOB-OPERACIONES" />
                  </Field>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Email soporte pagos">
                      <input type="email" className={inputClass} value={card.supportEmail} onChange={(e) => setCard((prev) => ({ ...prev, supportEmail: e.target.value }))} placeholder="soporte-pagos@miempresa.com" />
                    </Field>
                    <Field label="Email chargebacks (opcional)">
                      <input type="email" className={inputClass} value={card.chargebackEmail} onChange={(e) => setCard((prev) => ({ ...prev, chargebackEmail: e.target.value }))} placeholder="risk@miempresa.com" />
                    </Field>
                  </div>
                  <Field label="Descriptor en estado de cuenta" hint="Máximo 22 caracteres visibles para el cliente final.">
                    <input className={inputClass} value={card.statementDescriptor} onChange={(e) => setCard((prev) => ({ ...prev, statementDescriptor: e.target.value }))} placeholder="FROG*MIEMPRESA" maxLength={22} />
                  </Field>
                </div>
              </div>

              <div className="rounded-2xl border border-white/8 bg-black/25 p-4 sm:p-5">
                <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Procesador simulado</p>
                <div>
                  <p className="text-sm font-semibold text-gray-200 mb-2">Marcas aceptadas</p>
                  <div className="flex flex-wrap gap-3">
                    <label className={`text-xs inline-flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${acceptedBrandSet.has('visa') ? 'border-[#e6ff2a]/40 bg-[#e6ff2a]/10 text-[#e6ff2a]' : 'border-white/10 bg-white/5 text-gray-300'}`}>
                      <input type="checkbox" checked={acceptedBrandSet.has('visa')} onChange={() => toggleBrand('visa')} className="accent-[#e6ff2a]" /> Visa
                    </label>
                    <label className={`text-xs inline-flex items-center gap-2 rounded-lg border px-3 py-2 cursor-pointer transition-colors ${acceptedBrandSet.has('mastercard') ? 'border-[#e6ff2a]/40 bg-[#e6ff2a]/10 text-[#e6ff2a]' : 'border-white/10 bg-white/5 text-gray-300'}`}>
                      <input type="checkbox" checked={acceptedBrandSet.has('mastercard')} onChange={() => toggleBrand('mastercard')} className="accent-[#e6ff2a]" /> Mastercard
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                  <Field label="Delay liquidación (días)">
                    <input type="number" min="0" max="30" className={inputClass} value={card.settlementDelayDays} onChange={(e) => setCard((prev) => ({ ...prev, settlementDelayDays: e.target.value }))} />
                  </Field>
                  <div className="grid grid-cols-1 gap-4">
                    <Field label="Processor public key (mock)">
                      <input className={inputClass} value={cardApiKey} onChange={(e) => setCardApiKey(e.target.value)} placeholder="card-pub-xxx" />
                    </Field>
                    <Field label="Processor secret key (mock)">
                      <input className={inputClass} value={cardSecretKey} onChange={(e) => setCardSecretKey(e.target.value)} placeholder="card-sec-xxx" />
                    </Field>
                  </div>
                </div>
              </div>
            </div>

            <button onClick={handleSaveCard} disabled={savingCard} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#e6ff2a] text-[#04181C] py-3.5 font-black tracking-wide hover:bg-[#b7f758] disabled:opacity-40 transition-all">
              {savingCard ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Guardar Card Simulada
            </button>
          </article>
        </section>
      </div>

      <Toast isVisible={toast.show} message={toast.message} type={toast.type} onClose={() => setToast((prev) => ({ ...prev, show: false }))} />
    </div>
  );
}