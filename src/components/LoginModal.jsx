import { useEffect, useState } from 'react';
import MagneticButton from './MagneticButton.jsx';
import LiquidGradient from '../assets/LiquidGradientV2.png'; 
import { X, Eye, EyeOff, ArrowRight, AlertTriangle, Check } from 'lucide-react';
import { loginTenant } from '../services/auth.service';

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

export default function LoginModal({ isOpen, onClose, onAuthSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: '', password: '' });

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();

    let newErrors = { email: '', password: '' };
    let hasError = false;

    if (!email.trim()) {
      newErrors.email = 'Correo requerido';
      hasError = true;
    }
    if (!password.trim()) {
      newErrors.password = 'Contraseña requerida';
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    try {
      const res = await loginTenant({ correo: email, password: password });
      console.log('inicio de sesion');

      // 🔐 CORRECCIÓN: Guardamos el token en el almacenamiento local del navegador
      if (res && res.token) {
        localStorage.setItem('token', res.token);
      }

      alert("Login exitoso");
      if (onAuthSuccess) onAuthSuccess();

    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl rounded-[2.5rem] overflow-hidden border border-white/10 bg-black/70 shadow-[0_40px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl animate-fade-in-up" style={{ animationDuration: '0.3s' }}>
        <button type="button" onClick={onClose} className="absolute top-6 right-6 z-20 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20">
          <X size={20} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-0 lg:gap-6">
          <div className="relative overflow-hidden rounded-[2rem]">
            <img src={LiquidGradient} alt="Liquid gradient accent" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/40" />
            <div className="relative h-full min-h-[420px]" />
          </div>

          <div className="relative z-10 p-6 sm:p-8 lg:p-14 flex flex-col justify-between gap-6 lg:gap-8">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-[#b7f758]">
                Inicia sesión
              </span>
              <h2 className="mt-6 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight">
                Accede a tu panel <br/> de control.
              </h2>
            </div>

            <form onSubmit={handleSubmit} noValidate className="grid gap-6">
              <label className="grid gap-2 text-sm text-gray-300">
                Correo electrónico
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => { setEmail(event.target.value); setErrors(prev => ({ ...prev, email: '' })); }}
                    placeholder="hola@frogpay.com"
                    className={`w-full rounded-3xl border ${errors.email ? 'border-red-500 bg-red-500/10 text-red-50' : 'border-white/10 bg-white/5 text-white'} px-4 sm:px-5 py-3 sm:py-3.5 outline-none transition focus:border-[#e6ff2a]/80 focus:ring-2 focus:ring-[#e6ff2a]/15`}
                  />
                  <CustomGlassTooltip message={errors.email} />
                </div>
              </label>

              <label className="grid gap-2 text-sm text-gray-300">
                Contraseña
                <div className="relative">
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => { setPassword(event.target.value); setErrors(prev => ({ ...prev, password: '' })); }}
                    placeholder="••••••••"
                    className={`w-full rounded-3xl border ${errors.password ? 'border-red-500 bg-red-500/10 text-red-50' : 'border-white/10 bg-white/5 text-white'} px-4 sm:px-5 py-3 sm:py-3.5 pr-12 outline-none transition focus:border-[#e6ff2a]/80 focus:ring-2 focus:ring-[#e6ff2a]/15`}
                  />
                  <button type="button" onClick={() => setPasswordVisible((v) => !v)} className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 inline-flex items-center justify-center text-[#e6ff2a] transition hover:text-[#b7f758]">
                    {passwordVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                  <CustomGlassTooltip message={errors.password} />
                </div>
              </label>

              <div className="flex items-center justify-between text-sm mt-[-4px]">
                <label className="flex items-center gap-3 text-gray-400 cursor-pointer hover:text-gray-200 transition group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="peer appearance-none w-5 h-5 rounded-[6px] border border-white/20 bg-white/5 checked:bg-[#e6ff2a] checked:border-[#e6ff2a] cursor-pointer transition-all duration-200" />
                    <Check size={14} className="absolute text-[#04181C] opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity duration-200 stroke-[3]" />
                  </div>
                  <span className="select-none">Recordarme</span>
                </label>
                <button type="button" className="text-[#e6ff2a] hover:text-[#b7f758] hover:underline transition">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mt-4">
                <div className="text-sm text-gray-400">
                  ¿No tienes cuenta?{' '}
                  <button type="button" onClick={onSwitchToRegister} className="text-white font-medium hover:text-[#e6ff2a] transition">
                    Regístrate
                  </button>
                </div>
                <MagneticButton className="group inline-flex w-full sm:w-auto items-center justify-center gap-3 sm:gap-4 rounded-full bg-[#e6ff2a] px-6 sm:px-8 py-3 sm:py-3.5 font-bold text-[#04181C] shadow-[0_10px_30px_rgba(230,255,42,0.2)] hover:shadow-[0_15px_40px_rgba(230,255,42,0.35)] transition-all whitespace-nowrap">
                  Iniciar sesión
                  <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />
                </MagneticButton>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}