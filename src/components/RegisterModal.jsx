import { useEffect, useState } from 'react';
import MagneticButton from './MagneticButton.jsx';
import LiquidGradient from '../assets/LiquidGradientV2.png';
<<<<<<< HEAD
import { X, Eye, EyeOff, ArrowRight, AlertTriangle, Check, XCircle, Copy } from 'lucide-react';

=======
import { X, Eye, EyeOff, ArrowRight, AlertTriangle, Check, XCircle } from 'lucide-react';
import { registerTenant } from '../services/auth.service';
>>>>>>> 990b9f9e7cc467b261a0bf29bce964043edce61a
// --- Componente Interno para el Tooltip Glass ---
const CustomGlassTooltip = ({ message }) => {
  if (!message) return null;
  return (
    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/80 px-4 py-3 text-sm text-white shadow-2xl backdrop-blur-md whitespace-nowrap">
      <AlertTriangle size={18} className="text-[#e6ff2a]" />
      <p>{message}</p>
      <div className="absolute -top-[8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-b-[8px] border-l-transparent border-r-transparent border-b-black/80"></div>
    </div>
  );
};

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin, onAuthSuccess }) {
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  const [errors, setErrors] = useState({ companyName: '', email: '', password: '', form: '' });

  // Estados para manejar la petición a la API
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState(null); 
  const [copied, setCopied] = useState(false);

  // Lógica de validación de contraseña
  const pwdRules = {
    length: password.length >= 12,
    upper: /[A-Z]/.test(password),
    number: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };
  const isPasswordValid = pwdRules.length && pwdRules.upper && pwdRules.number && pwdRules.special;
  
  const getPasswordStrengthScore = () => {
    if (!password) return 0;
    let score = 0;
    if (pwdRules.length) score += 1;
    if (pwdRules.upper) score += 1;
    if (pwdRules.number) score += 1;
    if (pwdRules.special) score += 1;
    return score;
  };

  const score = getPasswordStrengthScore();
  let strengthColor = 'bg-transparent w-0';
  if (score > 0 && score <= 2) strengthColor = 'bg-red-500 w-1/3';
  if (score === 3) strengthColor = 'bg-yellow-500 w-2/3';
  if (score === 4) strengthColor = 'bg-[#e6ff2a] w-full shadow-[0_0_10px_rgba(230,255,42,0.5)]';

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

<<<<<<< HEAD
  // --- AQUÍ OCURRE EL CONSUMO DE LA API ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    let newErrors = { companyName: '', email: '', password: '', form: '' };
    let hasError = false;

    if (!companyName.trim()) { newErrors.companyName = 'Ingresa el nombre de tu empresa.'; hasError = true; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) { newErrors.email = 'Ingresa tu correo corporativo.'; hasError = true; } 
    else if (!emailRegex.test(email)) { newErrors.email = 'Dominio válido requerido.'; hasError = true; }
    if (!password.trim()) { newErrors.password = 'Crea una contraseña.'; hasError = true; } 
    else if (!isPasswordValid) { newErrors.password = 'Cumple todos los requisitos.'; hasError = true; }
=======
 const handleSubmit = async (event) => {
  event.preventDefault();

  let newErrors = { companyName: '', email: '', password: '' };
  let hasError = false;

  if (!companyName.trim()) {
    newErrors.companyName = 'Ingresa el nombre de tu empresa.';
    hasError = true;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.trim()) {
    newErrors.email = 'Ingresa tu correo.';
    hasError = true;
  } else if (!emailRegex.test(email)) {
    newErrors.email = 'Correo inválido.';
    hasError = true;
  }
>>>>>>> 990b9f9e7cc467b261a0bf29bce964043edce61a

  if (!password.trim() || !isPasswordValid) {
    newErrors.password = 'Contraseña inválida.';
    hasError = true;
  }

<<<<<<< HEAD
    if (!hasError && acceptTerms) {
      setLoading(true); // Iniciamos el estado de carga
      
      try {
        // Consumimos la API del Backend
        const response = await fetch('http://localhost:3000/api/tenants/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre_empresa: companyName,
            correo_empresa: email,
            password_admin: password
          })
        });

        const data = await response.json();

        // Si el backend devuelve un error (ej. correo duplicado)
        if (!response.ok) {
          throw new Error(data.error || 'Ocurrió un error al registrar la empresa.');
        }

        // ¡Éxito! Guardamos la API Key para que la pantalla cambie automáticamente
        setApiKey(data.api_key);

      } catch (error) {
        setErrors(prev => ({ ...prev, form: error.message }));
      } finally {
        setLoading(false); // Apagamos el estado de carga
      }
    }
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleFinish = () => {
    if (onAuthSuccess) onAuthSuccess();
    onClose();
  };

=======
  setErrors(newErrors);

  if (hasError || !acceptTerms) return;

  try {
    const res = await registerTenant({
      nombre_empresa: companyName,
      correo_empresa: email,
      password_admin: password
    });

    console.log("REGISTER OK:", res);

    alert("Empresa registrada correctamente");

    onClose();

  } catch (error) {
    alert(error.message);
  }
};
>>>>>>> 990b9f9e7cc467b261a0bf29bce964043edce61a
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/70 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
        
        <button type="button" onClick={onClose} className="absolute top-6 right-6 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-0 lg:gap-6">
          <div className="relative overflow-hidden rounded-[2rem]">
            <img src={LiquidGradient} alt="Liquid gradient" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative h-full min-h-[420px]" />
          </div>

          <div className="relative z-10 p-6 sm:p-8 lg:p-14 flex flex-col justify-center gap-6">
            
            {/* VISTA 1: Formulario de Registro */}
            {!apiKey ? (
              <>
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#b7f758]">
                    Empieza Gratis
                  </span>
                  <h2 className="mt-5 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                    Registra tu empresa.
                  </h2>
                </div>

                {errors.form && (
                  <div className="p-3 text-sm text-red-200 bg-red-500/20 border border-red-500/50 rounded-xl">
                    {errors.form}
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate className="grid gap-5">
                  <label className="grid gap-1.5 text-sm text-gray-300">
                    Nombre de la Empresa
                    <div className="relative">
                      <input type="text" value={companyName} onChange={(e) => { setCompanyName(e.target.value); setErrors(prev => ({ ...prev, companyName: '' })); }} placeholder="Mi Tienda S.R.L." className={`w-full rounded-2xl border ${errors.companyName ? 'border-red-500 bg-red-500/10 text-red-50' : 'border-white/10 bg-white/5 text-white'} px-4 sm:px-5 py-3 outline-none transition focus:border-[#e6ff2a]/80`} />
                      <CustomGlassTooltip message={errors.companyName} />
                    </div>
                  </label>

                  <label className="grid gap-1.5 text-sm text-gray-300">
                    Correo electrónico corporativo
                    <div className="relative">
                      <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setErrors(prev => ({ ...prev, email: '' })); }} placeholder="pagos@mitienda.com" className={`w-full rounded-2xl border ${errors.email ? 'border-red-500 bg-red-500/10 text-red-50' : 'border-white/10 bg-white/5 text-white'} px-4 sm:px-5 py-3 outline-none transition focus:border-[#e6ff2a]/80`} />
                      <CustomGlassTooltip message={errors.email} />
                    </div>
                  </label>

                  <label className="grid gap-1.5 text-sm text-gray-300">
                    Contraseña
                    <div className="relative">
                      <input type={passwordVisible ? 'text' : 'password'} value={password} onChange={(e) => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: '' })); }} placeholder="Crea una contraseña segura" className={`w-full rounded-2xl border ${errors.password ? 'border-red-500 bg-red-500/10 text-red-50' : 'border-white/10 bg-white/5 text-white'} px-4 sm:px-5 py-3 pr-12 outline-none transition focus:border-[#e6ff2a]/80`} />
                      <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-[#e6ff2a] hover:text-[#b7f758]">
                        {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <CustomGlassTooltip message={errors.password} />
                    </div>
                    
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden mt-1">
                      <div className={`h-full rounded-full transition-all duration-500 ${strengthColor}`}></div>
                    </div>

                    <div className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1.5 text-[11px] text-gray-500">
                      <span className={`flex items-center gap-1.5 transition-colors duration-300 ${pwdRules.length ? 'text-[#b7f758]' : ''}`}>
                        {pwdRules.length ? <Check size={12} /> : <XCircle size={12} className="opacity-50" />} 12+ caracteres
                      </span>
                      <span className={`flex items-center gap-1.5 transition-colors duration-300 ${pwdRules.upper ? 'text-[#b7f758]' : ''}`}>
                        {pwdRules.upper ? <Check size={12} /> : <XCircle size={12} className="opacity-50" />} 1 Mayúscula
                      </span>
                      <span className={`flex items-center gap-1.5 transition-colors duration-300 ${pwdRules.number ? 'text-[#b7f758]' : ''}`}>
                        {pwdRules.number ? <Check size={12} /> : <XCircle size={12} className="opacity-50" />} 1 Número
                      </span>
                      <span className={`flex items-center gap-1.5 transition-colors duration-300 ${pwdRules.special ? 'text-[#b7f758]' : ''}`}>
                        {pwdRules.special ? <Check size={12} /> : <XCircle size={12} className="opacity-50" />} 1 Símbolo (!@#$)
                      </span>
                    </div>
                  </label>

                  <div className="mt-1">
                    <label className="flex items-start gap-3 text-gray-400 cursor-pointer hover:text-gray-200 transition group">
                      <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 shrink-0">
                        <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} className="peer appearance-none w-5 h-5 rounded-[6px] border border-white/20 bg-white/5 checked:bg-[#e6ff2a] checked:border-[#e6ff2a] cursor-pointer transition-all duration-200" />
                        <Check size={14} className="absolute text-[#04181C] opacity-0 peer-checked:opacity-100 pointer-events-none stroke-[3]" />
                      </div>
                      <span className="text-xs leading-relaxed select-none">
                        Acepto los <a href="#" className="text-[#e6ff2a] hover:underline">Términos de Servicio</a> y la <a href="#" className="text-[#e6ff2a] hover:underline">Política de Privacidad</a> de FrogPay.
                      </span>
                    </label>
                  </div>

                  <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mt-2">
                    <div className="text-sm text-gray-400">
                      ¿Ya tienes cuenta?{' '}
                      <button type="button" onClick={onSwitchToLogin} className="text-white font-medium hover:text-[#e6ff2a] transition">
                        Inicia sesión
                      </button>
                    </div>
                    
                    <MagneticButton 
                      disabled={!acceptTerms || loading}
                      className={`group inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-full px-8 sm:px-10 py-3 sm:py-4 text-sm sm:text-[15px] font-bold transition-all duration-300 whitespace-nowrap
                        ${acceptTerms 
                          ? 'bg-[#e6ff2a] text-[#04181C] shadow-[0_10px_30px_rgba(230,255,42,0.2)] hover:shadow-[0_15px_40px_rgba(230,255,42,0.35)] hover:scale-[1.02]' 
                          : 'bg-white/10 text-gray-500 cursor-not-allowed border border-white/5'}
                      `}
                    >
                      {loading ? 'Generando...' : 'Generar mis API Keys'}
                      {!loading && acceptTerms && <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />}
                    </MagneticButton>
                  </div>
                </form>
              </>
            ) : (
              
              /* VISTA 2: Pantalla de Éxito y API Key */
              <div className="animate-fade-in-up flex flex-col h-full justify-center">
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center justify-center w-14 h-14 bg-[#e6ff2a]/20 rounded-full border border-[#e6ff2a]/30">
                    <Check size={28} className="text-[#e6ff2a]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">¡Registro Exitoso!</h2>
                    <p className="text-gray-400 text-sm">Tu cuenta de FrogPay está lista.</p>
                  </div>
                </div>

                <div className="bg-white/5 border border-[#e6ff2a]/30 rounded-2xl p-6 mb-8 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#e6ff2a] to-transparent opacity-50"></div>
                  
                  <h3 className="text-[#e6ff2a] font-bold mb-2 flex items-center gap-2">
                    <AlertTriangle size={18} />
                      Guarda tu API Key ahora
                  </h3>
                  <p className="text-gray-300 text-sm mb-4">
                    Esta es tu llave maestra de producción. Por motivos de seguridad financiera, <strong>esta es la única vez que te la mostraremos</strong>. Cópiala y guárdala.
                  </p>

                  <div className="flex items-center bg-black/50 border border-white/10 rounded-xl p-1">
                    <code className="text-sm font-mono text-white px-4 flex-1 break-all select-all">
                      {apiKey}
                    </code>
                    <button 
                      onClick={handleCopyApiKey}
                      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg transition-colors ml-2"
                    >
                      {copied ? <Check size={18} className="text-[#e6ff2a]" /> : <Copy size={18} />}
                      {copied ? 'Copiado' : 'Copiar'}
                    </button>
                  </div>
                </div>

                <MagneticButton 
                  onClick={handleFinish}
                  className="bg-[#e6ff2a] text-[#04181C] w-full justify-center gap-3 rounded-full px-10 py-4 font-bold shadow-[0_10px_30px_rgba(230,255,42,0.2)] hover:shadow-[0_15px_40px_rgba(230,255,42,0.35)]"
                >
                  Entendido, ir al Dashboard <ArrowRight size={18} />
                </MagneticButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}