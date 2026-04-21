import { useState, useEffect } from 'react';
import { Settings, Building2, User, Lock, Mail, Phone, MapPin, Eye, EyeOff, Loader2, Menu, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import Toast from '../components/Toast.jsx';
import { apiRequest } from '../services/api.js';

export default function Configuracion({ onToggleSidebar }) {
  // Empresa
  const [companyName, setCompanyName] = useState('');
  const [companyEmail, setCompanyEmail] = useState('');
  const [companyPhone, setCompanyPhone] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [statementDescriptor, setStatementDescriptor] = useState('');

  // Contraseña
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // States
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingCompany, setIsSavingCompany] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  useEffect(() => {
    const loadConfig = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setIsLoading(false); return; }

      try {
        // Cargar datos del tenant/cliente
        const tenantData = await apiRequest('/tenants/me', 'GET', null, token);
        if (tenantData?.data || tenantData) {
          const data = tenantData?.data || tenantData;
          setCompanyName(data.nombre || data.nombre_empresa || '');
          setCompanyEmail(data.correo || data.email || '');
          setCompanyPhone(data.telefono || '');
          setCompanyAddress(data.direccion || '');
        }

        // Cargar datos de tarjeta si existen
        const providerData = await apiRequest('/payments/provider-accounts', 'GET', null, token);
        const cardAccount = providerData?.data?.find((a) => a.provider === 'card');
        if (cardAccount?.configuracion?.statementDescriptor) {
          setStatementDescriptor(cardAccount.configuracion.statementDescriptor);
        }
      } catch (error) {
        console.error('Error cargando configuración:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadConfig();
  }, []);

  const handleSaveCompany = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      showToast('El nombre de empresa es obligatorio', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) { showToast('Sesión expirada', 'error'); return; }

    setIsSavingCompany(true);
    try {
      // Actualizar datos del tenant
      await apiRequest('/tenants/me', 'PUT', {
        nombre: companyName.trim(),
        correo: companyEmail.trim(),
        telefono: companyPhone.trim(),
        direccion: companyAddress.trim(),
      }, token);

      // Actualizar descriptor en tarjeta si cambió
      if (statementDescriptor.trim()) {
        try {
          const currentCard = await apiRequest('/payments/provider-accounts', 'GET', null, token);
          const cardAccount = currentCard?.data?.find((a) => a.provider === 'card');
          if (cardAccount) {
            await apiRequest('/payments/provider-accounts/card', 'PUT', {
              activo: true,
              configuracion: {
                ...cardAccount.configuracion,
                statementDescriptor: statementDescriptor.trim(),
              },
            }, token);
          }
        } catch (e) {
          console.warn('No se pudo actualizar descriptor de tarjeta:', e);
        }
      }

      showToast('Datos de empresa actualizados correctamente', 'success');
    } catch (error) {
      showToast(error.message || 'Error al guardar los datos', 'error');
    } finally {
      setIsSavingCompany(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (!currentPassword.trim()) {
      showToast('Ingresa tu contraseña actual', 'error');
      return;
    }
    if (!newPassword.trim()) {
      showToast('Ingresa la nueva contraseña', 'error');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('Las contraseñas no coinciden', 'error');
      return;
    }
    if (newPassword.length < 6) {
      showToast('La contraseña debe tener al menos 6 caracteres', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) { showToast('Sesión expirada', 'error'); return; }

    setIsSavingPassword(true);
    try {
      await apiRequest('/tenants/change-password', 'POST', {
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      }, token);

      showToast('Contraseña cambiada correctamente', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      showToast(error.message || 'Error al cambiar contraseña', 'error');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full relative min-h-screen overflow-x-hidden flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-[#e6ff2a]" />
          <p className="text-gray-300">Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full relative min-h-screen overflow-x-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[radial-gradient(circle,rgba(12,70,81,0.15),transparent_70%)] animate-pulse" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[35vw] h-[35vw] rounded-full bg-[radial-gradient(circle,rgba(230,255,42,0.07),transparent_72%)]" />
      </div>

      {/* Mobile nav bar */}
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-28 pb-10 lg:py-16 relative z-10 w-full space-y-6">
        <header className="mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e6ff2a]/20 bg-[#e6ff2a]/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-widest text-[#e6ff2a] mb-4">
            <Settings size={14} /> Configuración
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-4">
            Tu Cuenta
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl leading-relaxed">
            Gestiona los datos de tu empresa, seguridad y configuración operativa de pagos.
          </p>
        </header>

        {/* Datos de Empresa */}
        <article className="glass-iphone rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-7 space-y-6 shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2"><Building2 size={18} className="text-[#e6ff2a]" /> Datos de la Empresa</h2>
              <p className="text-xs text-gray-400 mt-1 max-w-md">Información básica y datos de contacto de tu negocio para recibir pagos.</p>
            </div>
          </div>

          <form onSubmit={handleSaveCompany} className="space-y-5">
            <div className="rounded-2xl border border-white/8 bg-black/25 p-4 sm:p-5">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Información General</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Nombre de Empresa <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Mi Empresa S.R.L."
                    className="w-full rounded-xl border border-white/12 bg-black/35 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e6ff2a]/70 focus:ring-2 focus:ring-[#e6ff2a]/20 transition"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Nombre legal de tu negocio.</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-200 mb-2">
                    Email de Contacto <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    placeholder="contacto@miempresa.com"
                    className="w-full rounded-xl border border-white/12 bg-black/35 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e6ff2a]/70 focus:ring-2 focus:ring-[#e6ff2a]/20 transition"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Para notificaciones de pagos y soporte.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={companyPhone}
                      onChange={(e) => setCompanyPhone(e.target.value)}
                      placeholder="+591 712 345 678"
                      className="w-full rounded-xl border border-white/12 bg-black/35 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e6ff2a]/70 focus:ring-2 focus:ring-[#e6ff2a]/20 transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      Dirección (Opcional)
                    </label>
                    <input
                      type="text"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="Calle Principal 123, La Paz"
                      className="w-full rounded-xl border border-white/12 bg-black/35 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e6ff2a]/70 focus:ring-2 focus:ring-[#e6ff2a]/20 transition"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/8 bg-black/25 p-4 sm:p-5">
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Procesamiento de Tarjetas</p>
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Descriptor en Estado de Cuenta
                </label>
                <input
                  type="text"
                  value={statementDescriptor}
                  onChange={(e) => setStatementDescriptor(e.target.value.slice(0, 22))}
                  placeholder="MIEMPRESA*PAGOS"
                  maxLength={22}
                  className="w-full rounded-xl border border-white/12 bg-black/35 px-3.5 py-2.5 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e6ff2a]/70 focus:ring-2 focus:ring-[#e6ff2a]/20 transition font-mono"
                />
                <p className="text-[11px] text-gray-500 mt-1">Máximo 22 caracteres. Esto aparecerá en el estado de cuenta bancaria del cliente.</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingCompany}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#e6ff2a] text-[#04181C] py-3.5 font-black tracking-wide hover:bg-[#b7f758] disabled:opacity-40 transition-all"
            >
              {isSavingCompany ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSavingCompany ? 'Guardando...' : 'Guardar Datos de Empresa'}
            </button>
          </form>
        </article>

        {/* Cambiar Contraseña */}
        <article className="glass-iphone rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.05] to-white/[0.01] p-7 space-y-6 shadow-[0_30px_60px_rgba(0,0,0,0.35)]">
          <div className="flex items-start justify-between gap-4 pb-5 border-b border-white/10">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2"><Lock size={18} className="text-[#e6ff2a]" /> Seguridad</h2>
              <p className="text-xs text-gray-400 mt-1 max-w-md">Cambia tu contraseña para mantener tu cuenta protegida.</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-5">
            <div className="rounded-2xl border border-white/8 bg-black/25 p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Contraseña Actual <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full rounded-xl border border-white/12 bg-black/35 px-3.5 py-2.5 pr-12 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e6ff2a]/70 focus:ring-2 focus:ring-[#e6ff2a]/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Nueva Contraseña <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full rounded-xl border border-white/12 bg-black/35 px-3.5 py-2.5 pr-12 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e6ff2a]/70 focus:ring-2 focus:ring-[#e6ff2a]/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">Mínimo 6 caracteres.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-200 mb-2">
                  Confirmar Nueva Contraseña <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full rounded-xl border border-white/12 bg-black/35 px-3.5 py-2.5 pr-12 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:border-[#e6ff2a]/70 focus:ring-2 focus:ring-[#e6ff2a]/20 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingPassword}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-[#e6ff2a] text-[#04181C] py-3.5 font-black tracking-wide hover:bg-[#b7f758] disabled:opacity-40 transition-all"
            >
              {isSavingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
              {isSavingPassword ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        </article>

        {/* Informativo de PayPal */}
        <article className="glass-iphone rounded-[2rem] border border-[#e6ff2a]/20 bg-[#e6ff2a]/5 p-6 space-y-3">
          <div className="flex items-start gap-3">
            <Mail size={18} className="text-[#e6ff2a] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-white">Credenciales de PayPal y Tarjetas</p>
              <p className="text-xs text-gray-300 mt-1">
                Las credenciales y datos de cuentas de cobro se configuran en <span className="text-[#e6ff2a] font-semibold">Cuentas de Cobro</span> en el menú lateral. 
                Aquí solo gestiona tu perfil de cliente y seguridad.
              </p>
            </div>
          </div>
        </article>
      </div>

      <Toast
        isVisible={toast.show}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
}
