import { useState, useEffect } from 'react';
import { 
  ShieldCheck, Zap, Globe, ChevronRight, 
  Terminal, Lock, Server, CheckCircle2, 
  CreditCard, Wallet, Banknote, QrCode, 
  Percent, Gem, Users, ArrowRight 
} from 'lucide-react';
import SpotlightTab from '../components/SpotlightTab.jsx';
import MagneticButton from '../components/MagneticButton.jsx';
import BackgroundImage from '../assets/background.png';

// --- COMPONENTE: Typewriter para Código ---
const TypewriterTerminal = ({ code, delay = 50 }) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < code.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + code[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, code]);

  const highlightSyntax = (text) => {
    return text.split('\n').map((line, i) => (
      <div key={i} className="whitespace-pre flex gap-4">
        <span className="text-gray-600 select-none text-right w-6">{i + 1}</span>
        <span>
          {line.split(/(const|require|await|'[^']*'|charges\.create|qr_simple|BOB|amount|currency|method|webhook_url|:|,|\{|\}|\(|\))/g).map((token, j) => {
            if (/const|require|await/.test(token)) return <span key={j} className="text-[#e6ff2a] font-bold">{token}</span>;
            if (/^'[^']*'$/.test(token)) return <span key={j} className="text-[#b7f758]">{token}</span>;
            if (/charges\.create|qr_simple|BOB|amount|currency|method|webhook_url/.test(token)) return <span key={j} className="text-white font-medium">{token}</span>;
            if (/:|,|\{|\}|\(|\)/.test(token)) return <span key={j} className="text-gray-500">{token}</span>;
            return <span key={j} className="text-gray-300">{token}</span>;
          })}
        </span>
      </div>
    ));
  };

  return (
    <div className="font-mono text-sm leading-relaxed p-6 h-full overflow-hidden relative">
      <div className="absolute top-0 left-0 text-xs text-gray-700 p-2 uppercase tracking-widest select-none">frogpay-sdk.js</div>
      <div className="pt-6">
        {highlightSyntax(currentText)}
        {currentIndex < code.length && <span className="inline-block w-2 h-4 bg-[#e6ff2a] animate-pulse relative top-0.5 ml-1"></span>}
      </div>
    </div>
  );
};
// ------------------------------------------------

const features = [
  {
    id: 0,
    title: "Rendimiento Extremo",
    subtitle: "Latencia < 300ms",
    desc: "Nuestra arquitectura distribuida garantiza tiempos de respuesta ultrarrápidos, esenciales para conversiones altas. SLA de 99.9% garantizado.",
    icon: Zap,
    visual: (
      <div className="w-full h-full flex flex-col items-center justify-center p-8 space-y-5">
        <div className="flex items-center justify-between w-full text-xs font-mono text-gray-500 mb-2 border-b border-white/5 pb-3">
          <span>PING api.frogpay.com</span>
          <span className="text-[#e6ff2a] flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#e6ff2a] animate-pulse"></span> LIVE
          </span>
        </div>
        {[245, 189, 210, 195].map((ping, i) => (
          <div key={i} className="flex items-center w-full gap-4 animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
            <Terminal size={14} className="text-gray-600" />
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden relative">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#0c4651] to-[#e6ff2a] rounded-full transition-all duration-1000" 
                style={{ width: `${(ping / 300) * 100}%` }}
              ></div>
            </div>
            <span className="font-mono text-xs w-10 text-right text-[#e6ff2a]">{ping}ms</span>
          </div>
        ))}
      </div>
    )
  },
  {
    id: 1,
    title: "Seguridad Bancaria",
    subtitle: "Certificación PCI DSS",
    desc: "Infraestructura aislada, tokenización de extremo a extremo y prevención de fraude impulsada por IA en tiempo real.",
    icon: ShieldCheck,
    visual: (
      <div className="w-full h-full flex flex-col items-center justify-center relative">
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <div className="w-64 h-64 border border-[#e6ff2a]/20 rounded-full animate-[spin_20s_linear_infinite]"></div>
          <div className="w-48 h-48 border-t border-b border-[#0c4651] rounded-full absolute animate-[spin_10s_linear_infinite_reverse]"></div>
        </div>
        <Lock size={80} className="text-[#e6ff2a] mb-6 z-10 animate-pulse drop-shadow-[0_0_25px_rgba(230,255,42,0.4)]" />
        <div className="z-10 bg-black/60 backdrop-blur-xl border border-white/10 p-4 rounded-xl flex flex-col gap-2 font-mono text-[10px] text-[#e6ff2a] shadow-2xl">
          <span className="flex items-center gap-2">
            <span className="w-1 h-1 bg-[#e6ff2a] rounded-full"></span> ENCRYPTING PAYLOAD...
          </span>
          <span className="text-gray-400">TOKEN: tk_live_8f9x291...</span>
          <span className="text-white flex items-center gap-2 mt-1">
            <CheckCircle2 size={12} className="text-[#e6ff2a]"/> PCI COMPLIANT
          </span>
        </div>
      </div>
    )
  },
  {
    id: 2,
    title: "Multi-Tenant Global",
    subtitle: "Escala sin fronteras",
    desc: "Arquitectura diseñada para soportar múltiples empresas con aislamiento estricto de datos. Expándete globalmente con un clic.",
    icon: Globe,
    visual: (
      <div className="w-full h-full flex items-center justify-center relative p-6">
        <div className="grid grid-cols-3 gap-5 z-10 w-full">
          {[1, 2, 3, 4, 5, 6].map((node) => (
            <div 
              key={node} 
              className={`p-4 rounded-2xl border transition-all duration-500 hover:scale-110 flex flex-col items-center gap-3 ${
                node === 2 || node === 5 
                ? 'border-[#e6ff2a] bg-[#e6ff2a]/5 shadow-[0_0_20px_rgba(230,255,42,0.2)]' 
                : 'border-white/5 bg-white/5 opacity-40'
              }`}
            >
              <Server size={22} className={node === 2 || node === 5 ? 'text-[#e6ff2a]' : 'text-gray-500'} />
              <span className="text-[9px] font-mono text-gray-400">Región_0{node}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
];

const integrations = {
  global: [
    { name: 'Visa', icon: CreditCard },
    { name: 'Mastercard', icon: CreditCard },
    { name: 'PayPal', icon: Wallet },
    { name: 'Stripe Connect', icon: Server },
    { name: 'Apple Pay', icon: Wallet },
    { name: 'Google Pay', icon: Wallet },
  ],
  local: [
    { name: 'QR Simple', icon: QrCode },
    { name: 'Tigo Money', icon: Wallet },
    { name: 'Billetera Sol', icon: Wallet },
    { name: 'Transferencia BNB', icon: Banknote },
    { name: 'Pago Local LPZ', icon: Banknote },
    { name: 'Pago Local SCZ', icon: Banknote },
  ]
};

const pricingPlans = [
  {
    name: 'Starter',
    subtitle: 'Freemium para MVPs',
    desc: 'Ideal para validar tu producto. Volumen limitado y features esenciales.',
    icon: Users,
    priceBOB: 0,
    priceDesc: 'Gratis para siempre',
    comission: '2.9% + BOB 2.00 por txn',
    limit: 'Hasta 100 transacciones/mes',
    features: ['Integración básica', 'Soporte vía Email', 'Dashboard MVP']
  },
  {
    name: 'Pro',
    subtitle: 'Escala sin Límites',
    desc: 'Para negocios en crecimiento que necesitan control total y automatización.',
    icon: Gem,
    priceBOB: 499,
    priceDesc: 'Fijo mensual + Comisión reducida',
    comission: '1.8% + BOB 1.50 por txn',
    limit: 'Transacciones ilimitadas',
    features: ['Multi-región & Tenants', 'Prevención de fraude con IA', 'Analytics avanzados', 'Webhooks en tiempo real', 'Soporte prioritario 24/7']
  }
];

const codeSnippet = `const frogpay = require('frogpay')('tu_api_key_secreta');

// Crea un cobro universal en segundos
const payment = await frogpay.charges.create({
  amount: 15000, // En centavos de BOB (150.00 BOB)
  currency: 'BOB',
  method: 'qr_simple',
  webhook_url: 'https://tu-app.com/webhooks'
});`;

export default function Home({ onLoginClick }) {
  // --- CORRECCIÓN: Volvemos a colocar el estado principal aquí arriba ---
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <div className="relative w-full overflow-hidden">
      
      {/* Elementos de fondo ambiental global para toda la página */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[20%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[radial-gradient(circle,rgba(12,70,81,0.15),transparent_60%)]"></div>
        <div className="absolute bottom-[20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-[radial-gradient(circle,rgba(230,255,42,0.03),transparent_60%)]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden z-10">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-cover bg-center opacity-40" style={{ backgroundImage: `url(${BackgroundImage})` }} />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#04181c]/80 to-[#04181c]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(230,255,42,0.12),transparent_35%)]" />
        </div>

        <div className="relative px-6 max-w-7xl mx-auto flex flex-col items-center text-center z-10">
          <h1 className="text-6xl md:text-[7rem] font-black tracking-tighter mb-8 leading-[0.9] text-white animate-fade-in-up">
            Orquesta tus pagos con <br />
            <span className="text-gradient-animated drop-shadow-[0_0_40px_rgba(230,255,42,0.2)]">
              precisión extrema.
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
            Una API. Todos los métodos de pago. Arquitectura multi-tenant diseñada para escalar globalmente con latencia inferior a 300ms.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full justify-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
              <MagneticButton 
                className="px-10 py-4 rounded-full bg-[#e6ff2a] text-[#04181C] font-bold text-lg shadow-[0_10px_20px_-5px_rgba(230,255,42,0.3)] hover:shadow-[0_20px_35px_-10px_rgba(230,255,42,0.4)]"
              >
                Obtener API Key 
                <ChevronRight size={22} className="group-hover:translate-x-1 transition-transform" />
              </MagneticButton>
            
            <button className="w-full sm:w-auto px-10 py-4 rounded-full text-lg font-medium flex items-center justify-center gap-3 border border-white/10 bg-white/5 hover:bg-white/10 hover:-translate-y-1 transition-all duration-500 text-white">
              <Terminal size={20} className="text-gray-500" /> Explorar Docs
            </button>
          </div>
        </div>
      </section>

      {/* Showcase Section (Arquitectura) */}
      <section className="px-6 py-24 max-w-7xl mx-auto w-full relative z-10" id="soluciones">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight">
            Arquitectura <span className="text-[#e6ff2a]">Imparable</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Diseñada minuciosamente para cumplir con las restricciones técnicas y regulatorias del mundo financiero real.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 flex flex-col gap-5">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              // --- CORRECCIÓN: Comparamos con el estado principal ---
              const isActive = activeFeature === idx; 
              
              return (
                <SpotlightTab 
                  key={feature.id} 
                  isActive={isActive} 
                  // --- CORRECCIÓN: Actualizamos el estado principal al hacer click ---
                  onClick={() => setActiveFeature(idx)} 
                >
                  <div className="flex items-start gap-5">
                    <div className={`p-4 rounded-2xl transition-all duration-300 ${
                      isActive ? 'bg-[#e6ff2a] text-[#04181C]' : 'bg-white/5 text-[#e6ff2a]'
                    }`}>
                      <Icon size={26} />
                    </div>
                    <div>
                      <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-2 ${isActive ? 'text-[#e6ff2a]' : 'text-gray-500'}`}>
                        {feature.subtitle}
                      </div>
                      <h3 className={`text-2xl font-bold mb-2 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                        {feature.title}
                      </h3>
                      <div className={`grid transition-all duration-500 ${isActive ? 'grid-rows-[1fr] opacity-100 mt-3' : 'grid-rows-[0fr] opacity-0'}`}>
                        <p className="overflow-hidden text-gray-400 text-[15px] leading-relaxed">
                          {feature.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </SpotlightTab>
              );
            })}
          </div>

          <div className="lg:col-span-7 min-h-[500px]">
            <div className="glass-panel w-full h-full rounded-[3rem] border border-white/10 relative overflow-hidden bg-gradient-to-br from-[#0c4651]/20 to-[#04181C]/90 shadow-2xl">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] opacity-30"></div>
              {/* --- CORRECCIÓN: Ahora mostramos el visual dinámico basado en activeFeature --- */}
              <div key={activeFeature} className="absolute inset-0 flex items-center justify-center animate-fade-in-up">
                {features[activeFeature].visual}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integraciones Locales y Globales */}
      <section className="px-6 py-24 max-w-7xl mx-auto w-full relative z-10" id="integraciones">
        <div className="glass-iphone rounded-[3rem] border border-white/10 p-12 relative overflow-hidden bg-gradient-to-r from-white/5 to-[#0c4651]/20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(230,255,42,0.08),transparent_40%)]" />
          
          <div className="relative z-10 grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white tracking-tight leading-tight">
                Conecta <span className="text-[#e6ff2a]">Bolivia</span> <br /> con el Mundo.
              </h2>
              <p className="text-xl text-gray-400 max-w-lg mb-10 leading-relaxed">
                Acepta cualquier método de pago con una integración universal. Tarjetas globales, billeteras digitales y los sistemas locales que tus clientes usan en cada ciudad de Bolivia.
              </p>
              <MagneticButton className="px-8 py-3.5 rounded-full border border-[#e6ff2a] text-[#e6ff2a] font-semibold hover:bg-[#e6ff2a] hover:text-[#04181C] hover:shadow-[0_0_20px_rgba(230,255,42,0.3)]">
                Ver Métodos Soportados
              </MagneticButton>
            </div>

            <div className="space-y-8 relative [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
              <div className="flex overflow-hidden">
                <div className="flex w-max gap-6 animate-marquee hover:[animation-play-state:paused]">
                  {[...integrations.global, ...integrations.global].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-6 py-4 shadow-xl transition-all duration-300 hover:border-[#e6ff2a]/40 hover:bg-white/10 cursor-pointer">
                        <Icon size={20} className="text-[#e6ff2a]" />
                        <span className="text-white font-medium whitespace-nowrap">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex overflow-hidden">
                <div className="flex w-max gap-6 animate-marquee-reverse hover:[animation-play-state:paused]">
                  {[...integrations.local, ...integrations.local].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/5 px-6 py-4 shadow-xl transition-all duration-300 hover:border-[#b7f758]/40 hover:bg-white/10 cursor-pointer">
                        <Icon size={20} className="text-[#b7f758]" />
                        <span className="text-white font-medium whitespace-nowrap">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developers */}
      <section className="px-6 py-24 w-full relative z-10" id="developers">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs uppercase tracking-[0.25em] text-[#e6ff2a] mb-4">
              <Terminal size={14} /> Developer Experience (DX)
            </span>
            <h2 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight">
              Integración en <span className="text-[#e6ff2a]">minutos</span>, <br /> no en meses.
            </h2 >
            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Diseñada minuciosamente por desarrolladores, para desarrolladores. Nuestra SDK es limpia, segura y fácil de implementar, eliminando la complejidad técnica de los pagos.
            </p>
          </div>

          <div className="glass-panel w-full h-[380px] rounded-[2rem] border border-white/10 relative overflow-hidden bg-gradient-to-br from-white/5 to-black/50 shadow-2xl animate-fade-in-up">
              <div className="absolute top-0 left-0 w-full h-8 bg-white/5 flex items-center gap-1.5 px-4 border-b border-white/10 select-none">
                <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                <div className="flex-1 text-center font-mono text-[11px] text-gray-600">frogpay-sdk :: nodejs</div>
              </div>
              <TypewriterTerminal code={codeSnippet} delay={35} />
          </div>
        </div>
      </section>

      {/* Modelo de Precios */}
      <section className="px-6 py-24 max-w-7xl mx-auto w-full relative z-10" id="precios">
        <div className="text-center mb-24">
          <h2 className="text-5xl md:text-7xl font-bold mb-6 text-white tracking-tight leading-tight">
            Empieza gratis. <br /> Escala sin <span className="text-[#e6ff2a]">límites</span>.
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Nuestra estructura Freemium transparente te permite validar tu MVP hoy y crecer a una plataforma multi-tenant nacional mañana. Sin costos ocultos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-stretch">
          {pricingPlans.map((plan, idx) => {
            const Icon = plan.icon;
            const isPro = plan.name === 'Pro';
            return (
              <div key={idx} className={`relative group`}>
                <div className={`absolute inset-0 rounded-[3rem] transition-all duration-700 ${
                  isPro 
                  ? 'border border-[#e6ff2a]/40 bg-gradient-to-br from-[#0c4651]/30 to-black/50 hover:shadow-[0_40px_100px_rgba(230,255,42,0.2)] hover:-translate-y-3' 
                  : 'border border-white/10 bg-white/5 hover:border-[#e6ff2a]/20 hover:bg-white/10 hover:-translate-y-2'
                }`}>
                  <div className={`absolute inset-0 rounded-[3rem] transition-opacity duration-700 opacity-0 group-hover:opacity-100 ${
                    isPro ? 'bg-[radial-gradient(circle_at_center,rgba(230,255,42,0.15),transparent_50%)]' : 'bg-[radial-gradient(circle_at_center,rgba(230,255,42,0.05),transparent_50%)]'
                  }`} />
                </div>
                
                <div className="relative p-12 flex flex-col h-full z-10">
                  <div className="flex items-center gap-5 mb-10">
                    <div className={`p-4 rounded-2xl ${
                      isPro ? 'bg-[#e6ff2a] text-[#04181C]' : 'bg-white/5 text-[#e6ff2a]'
                    }`}>
                      <Icon size={30} />
                    </div>
                    <div>
                      <div className={`text-xs font-bold uppercase tracking-[0.25em] mb-1.5 ${isPro ? 'text-[#e6ff2a]' : 'text-gray-500'}`}>{plan.subtitle}</div>
                      <h3 className="text-4xl font-black text-white tracking-tight">{plan.name}</h3>
                    </div>
                  </div>

                  <p className="text-gray-400 text-base leading-relaxed mb-12 flex-grow">{plan.desc}</p>
                  
                  <div className="mb-14 space-y-3 border-t border-white/5 pt-8">
                    <div className="font-black text-white tracking-tighter transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_20px_rgba(230,255,42,0.2)]">
                      <span className="text-6xl md:text-7xl">BOB {plan.priceBOB.toFixed(0)}</span>
                      <span className="text-xl text-gray-600 font-medium"> /mes</span>
                    </div>
                    <p className={`text-sm ${isPro ? 'text-[#b7f758]' : 'text-gray-400'}`}>{plan.priceDesc}</p>
                  </div>

                  <ul className="space-y-4 mb-14 text-sm text-gray-300">
                    <li className="flex items-center gap-3 font-medium text-white">
                      <Percent size={18} className="text-[#e6ff2a]" /> Comisión: {plan.comission}
                    </li>
                    <li className="flex items-center gap-3 font-medium text-white pb-6 border-b border-white/5">
                      <Zap size={18} className="text-[#e6ff2a]" /> {plan.limit}
                    </li>
                    {plan.features.map((feature, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3">
                        <CheckCircle2 size={16} className="text-gray-600" /> {feature}
                      </li>
                    ))}
                  </ul>

                  <MagneticButton 
                    className={`w-full py-4 rounded-2xl text-center font-bold text-lg transition-all duration-300 ${
                      isPro 
                      ? 'bg-[#e6ff2a] text-[#04181C] shadow-[0_10px_30px_-5px_rgba(230,255,42,0.3)] group-hover:shadow-[0_20px_45px_rgba(230,255,42,0.4)] group-hover:scale-[1.03]' 
                      : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20'
                    }`}
                  >
                    {isPro ? 'Evolucionar a Pro' : 'Empezar Gratis Ahora'}
                  </MagneticButton>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Llamado a la Acción (CTA) Final */}
      <section className="relative px-6 py-32 w-full z-10" id="final-cta">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(230,255,42,0.1),transparent_50%)] animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute bottom-0 left-0 right-0 h-[50%] bg-gradient-to-t from-[#0c4651]/20 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto flex flex-col items-center text-center z-10">
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight mb-10 drop-shadow-[0_0_30px_rgba(230,255,42,0.1)]">
            ¿Listo para evolucionar tus pagos? <br />
            Haz tu primera transacción <span className="text-[#e6ff2a]">hoy mismo</span>.
          </h2>
          <p className="text-xl text-gray-400 max-w-xl mx-auto leading-relaxed mb-16">
            Regístrate en 2 minutos, obtén tus API keys de prueba y comienza a orquestar cobros universales. Gratis, sin tarjeta de crédito.
          </p>
          
          <MagneticButton 
            onClick={onLoginClick}
            className="px-12 py-5 rounded-full bg-[#e6ff2a] text-[#04181C] font-black text-2xl shadow-[0_20px_50px_-10px_rgba(230,255,42,0.4)] hover:shadow-[0_25px_60px_-10px_rgba(230,255,42,0.6)] group transform hover:scale-[1.05] transition-all duration-300"
          >
            <span className="flex items-center gap-3">
              Crear cuenta gratis
              <ArrowRight size={26} className="group-hover:translate-x-2 transition-transform" />
            </span>
          </MagneticButton>
        </div>
      </section>

    </div>
  );
}