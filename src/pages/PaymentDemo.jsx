import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ShieldCheck, CheckCircle2, Zap, Lock, Server, AlertCircle } from 'lucide-react';
import CheckoutForm from '../components/CheckoutForm';

// 🛠️ 1. Preparación del Entorno (Llave pública de prueba oficial de Stripe)
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

// Configuración del backend de Chris (HU-2.04)
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3000';
const API_KEY = process.env.REACT_APP_API_KEY || 'fp_live_demo_key_for_testing';

// Componente de beneficios
const BenefitItem = ({ icon: Icon, title, description }) => (
  <div className="flex gap-4 group">
    <div className="flex-shrink-0">
      <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[#e6ff2a]/10 group-hover:bg-[#e6ff2a]/20 transition-colors duration-300">
        <Icon className="h-6 w-6 text-[#e6ff2a]" />
      </div>
    </div>
    <div className="flex-1">
      <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{description}</p>
    </div>
  </div>
);

export default function PaymentDemo() {
  const [backendStatus, setBackendStatus] = useState(null);

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/payments`, {
          method: 'OPTIONS',
        }).catch(() => ({ ok: false }));
        setBackendStatus({ ok: response.ok, url: BACKEND_URL });
      } catch (error) {
        setBackendStatus({ ok: false, url: BACKEND_URL });
      }
    };

    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#040A0B] relative overflow-hidden">
      
      {/* Fondos Ambientales */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(230,255,42,0.1),transparent_60%)] animate-blob"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(12,70,81,0.2),transparent_60%)]"></div>
      </div>

      {/* Contenido Principal */}
      <div className="relative z-10">
        
        {/* Sección Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center mb-12 lg:mb-20">
            
            <div className="space-y-6 lg:space-y-8 animate-fade-in-up order-2 lg:order-1">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#e6ff2a]/20 bg-[#e6ff2a]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#e6ff2a] mb-6">
                  <Zap size={14} className="animate-pulse" /> Suscripción Segura
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black text-white tracking-tight leading-tight mb-4 lg:mb-6">
                  Sube de nivel <br /> con el plan <span className="text-[#e6ff2a]">Pro</span>.
                </h1>
                <p className="text-gray-400 text-base lg:text-lg leading-relaxed">
                  Estás a un paso de escalar tus pagos sin límites. Utilizamos las tecnologías más avanzadas para garantizar seguridad y velocidad.
                </p>
              </div>

              {/* Resumen de la Suscripción */}
              <div className="glass-iphone rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 lg:p-8 space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <span className="text-gray-300 font-medium text-sm lg:text-base">Plan FrogPay Pro (Mensual)</span>
                  <span className="text-white font-bold text-lg">$50.00</span>
                </div>
                <div className="flex items-center justify-between pb-4">
                  <span className="text-gray-300 font-medium text-sm lg:text-base">Procesamiento</span>
                  <span className="text-white font-bold">Incluido</span>
                </div>
                <div className="flex items-center justify-between text-lg lg:text-xl font-black text-[#e6ff2a] pt-4 border-t border-[#e6ff2a]/20">
                  <span>Total a pagar</span>
                  <span>$50.00</span>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm text-gray-500">
                <ShieldCheck size={18} lg:size={20} className="text-green-500 flex-shrink-0" />
                <span className="text-sm lg:text-base">Encriptación de 256-bits. Certificación PCI-DSS Nivel 1.</span>
              </div>
            </div>

            <div className="animate-fade-in-up order-1 lg:order-2" style={{ animationDelay: '0.2s' }}>
              <div className="glass-iphone rounded-[2rem] lg:rounded-[2.5rem] border border-[#e6ff2a]/30 bg-gradient-to-b from-[#0c4651]/40 to-[#04181C]/90 p-6 lg:p-8 shadow-[0_0_40px_rgba(230,255,42,0.05)] relative overflow-hidden group hover:shadow-[0_0_50px_rgba(230,255,42,0.1)] transition-shadow duration-300">
                
                <div className="absolute top-4 lg:top-6 right-4 lg:right-6 bg-[#e6ff2a] text-[#04181C] text-[10px] font-black uppercase tracking-widest px-3 lg:px-4 py-1 lg:py-1.5 rounded-lg shadow-lg animate-fade-in-up">
                  Sandbox
                </div>

                <div className="mb-6 lg:mb-8 mt-4 lg:mt-6">
                  <h3 className="text-xl lg:text-2xl font-bold text-white flex items-center gap-2 mb-3">
                    <Lock size={18} lg:size={20} className="text-[#e6ff2a]" />
                    Datos de Pago
                  </h3>
                  <p className="text-sm text-gray-400">Utiliza una tarjeta de prueba de Stripe para simular el pago.</p>
                </div>

                {/* Alerta de estado del backend */}
                {backendStatus && !backendStatus.ok && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-2">
                    <AlertCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <div className="text-xs text-red-300">
                      <strong>Backend no disponible</strong><br />
                      Asegúrate que el servidor en {BACKEND_URL} está corriendo.
                    </div>
                  </div>
                )}

                {/* El Provider de Stripe envuelve nuestro formulario */}
                <Elements stripe={stripePromise}>
                  <CheckoutForm 
                    amount="50.00" 
                    backendUrl={BACKEND_URL}
                    apiKey={API_KEY}
                  />
                </Elements>
              </div>
            </div>
          </div>

          <div className="glass-iphone rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 lg:p-8 mb-12 lg:mb-20 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Server size={24} className="text-[#e6ff2a]" />
              Tarjetas de Prueba
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-white mb-2">Tarjeta Exitosa</h4>
                <code className="block bg-[#020607] rounded-lg p-3 font-mono text-sm text-[#e6ff2a] border border-white/10">
                  4242 4242 4242 4242
                </code>
                <p className="text-xs text-gray-400 mt-2">Cualquier fecha futura, cualquier CVC</p>
              </div>
              <div>
                <h4 className="font-bold text-white mb-2">Tarjeta Rechazada</h4>
                <code className="block bg-[#020607] rounded-lg p-3 font-mono text-sm text-red-400 border border-white/10">
                  4000 0000 0000 0002
                </code>
                <p className="text-xs text-gray-400 mt-2">Para probar manejo de errores</p>
              </div>
            </div>
          </div>

          <div className="mb-12 lg:mb-20 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
            <div className="mb-8 lg:mb-12">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-4">
                ¿Por qué FrogPay Pro?
              </h2>
              <p className="text-gray-400 text-base lg:text-lg max-w-2xl">
                Obtén acceso a características premium diseñadas para negocios que necesitan escalar rápidamente.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
              <BenefitItem
                icon={Zap}
                title="Velocidad Ultra"
                description="Procesamiento de pagos en menos de 300ms con nuestra infraestructura distribuida globalmente."
              />
              <BenefitItem
                icon={ShieldCheck}
                title="Seguridad Bancaria"
                description="Certificación PCI-DSS nivel 1, encriptación de extremo a extremo y prevención de fraude con IA."
              />
              <BenefitItem
                icon={CheckCircle2}
                title="Múltiples Métodos"
                description="Acepta tarjetas, billeteras digitales, transferencias y métodos locales en una sola plataforma."
              />
              <BenefitItem
                icon={Server}
                title="API Potente"
                description="Webhooks en tiempo real, reportes avanzados y control total sobre tus transacciones."
              />
            </div>
          </div>

          <div className="glass-iphone rounded-[2rem] border border-white/10 bg-white/[0.02] p-6 lg:p-8 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <h2 className="text-2xl font-bold text-white mb-8">Preguntas Frecuentes</h2>
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-white mb-2">¿Es seguro usar tarjetas de prueba?</h4>
                <p className="text-gray-400 text-sm">Completamente. Stripe proporciona tarjetas de prueba que nunca generan cargos reales. Están diseñadas exclusivamente para desarrollo.</p>
              </div>
              <div className="border-t border-white/10 pt-6">
                <h4 className="font-bold text-white mb-2">¿Qué sucede después de completar el pago?</h4>
                <p className="text-gray-400 text-sm">El sistema simula la transacción y emite un evento webhook que puedes verificar en tu terminal si tienes un servidor configurado.</p>
              </div>
              <div className="border-t border-white/10 pt-6">
                <h4 className="font-bold text-white mb-2">¿Puedo cambiar de plan después?</h4>
                <p className="text-gray-400 text-sm">Claro que sí. Todos nuestros planes son flexibles y pueden actualizarse o degradarse en cualquier momento sin penalizaciones.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}