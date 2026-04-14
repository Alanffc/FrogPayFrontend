import { Home, CreditCard, Users, Terminal, Settings, X, TrendingUp ,FlaskConical} from 'lucide-react';
import { NavLink,Link } from 'react-router-dom';
import FrogPayIsotype from '../assets/FrogPayIsotypeV2.png';

const navItems = [
  { id: 'inicio', label: 'Inicio', icon: Home, path: '/dashboard' },
  { id: 'finanzas', label: 'Finanzas', icon: TrendingUp, path: '/dashboard/finanzas' },
  { id: 'transacciones', label: 'Transacciones', icon: CreditCard, path: '/dashboard/transacciones' },
  { id: 'clientes', label: 'Clientes', icon: Users },
  { id: 'api', label: 'API & Webhooks', icon: Terminal, path: '/dashboard/api-keys' },
  { id: 'configuracion', label: 'Configuración', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  return (
    <aside
      className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-white/5 bg-black/60 backdrop-blur-xl transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:flex`}
    >
      {/* Logo + Botón Cerrar (móvil) */}
      <div className="flex items-center justify-between gap-3 border-b border-white/5 px-6 py-8 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl shadow-[0_0_15px_rgba(230,255,42,0.15)] overflow-hidden">
            <img src={FrogPayIsotype} alt="FrogPay" className="h-full w-full object-contain" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            Frog<span className="text-[#e6ff2a]">Pay</span>
          </span>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2 text-white transition hover:bg-white/10 lg:hidden"
          onClick={onClose}
        >
          <X size={20} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-6">
        <div className="mb-4 px-2 text-xs font-bold uppercase tracking-widest text-gray-500">
          Panel de Control
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const itemContent = (
            <>
              <Icon size={20} className="text-gray-500 group-hover:text-gray-300" />
              {item.label}
            </>
          );

          if (item.path) {
            return (
              <NavLink
                key={item.id}
                to={item.path}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'bg-[#e6ff2a]/10 text-[#e6ff2a] shadow-[inset_4px_0_0_0_#e6ff2a]'
                      : 'text-gray-400 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {itemContent}
              </NavLink>
            );
          }

          return (
            <a
              key={item.id}
              href="#"
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium text-gray-400 transition-all duration-300 hover:bg-white/5 hover:text-white"
            >
              {itemContent}
            </a>
          );
        })}

        {/* Separador + Demo E2E */}
        <div className="my-3 border-t border-white/5" />
        <div className="mb-2 px-2 text-xs font-bold uppercase tracking-widest text-gray-500">
          Demo
        </div>
        <Link
          to="/checkout"
          className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-300 text-[#e6ff2a]/80 hover:bg-[#e6ff2a]/10 hover:text-[#e6ff2a]"
        >
          <FlaskConical size={20} className="text-[#e6ff2a]/60 group-hover:text-[#e6ff2a]" />
          Demo End-to-End
        </Link>
      </nav>

      {/* User Area */}
      <div className="border-t border-white/5 p-6">
        <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3 border border-white/5 transition-colors hover:bg-white/10 cursor-pointer">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-[#0c4651] to-[#e6ff2a] p-[2px]">
            <div className="h-full w-full rounded-full bg-black flex items-center justify-center text-xs font-bold text-white">
              MT
            </div>
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">Mi Tienda S.R.L.</p>
            <p className="text-[10px] text-gray-500 font-mono truncate">ID: tenant_9x8f...</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
