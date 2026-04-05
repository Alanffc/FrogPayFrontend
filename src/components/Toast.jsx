import { CheckCircle2, AlertCircle, X, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Toast({ isVisible, message, type = 'success', onClose }) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsExiting(false);
      const timer = setTimeout(() => {
        setIsExiting(true);
        setTimeout(() => {
          onClose();
        }, 300);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const toastColors = {
    success: {
      bg: 'from-[#e6ff2a]/5 to-[#0c4651]/10',
      border: 'border-[#e6ff2a]/30',
      icon: 'text-[#e6ff2a]',
      dot: 'bg-[#e6ff2a]'
    },
    error: {
      bg: 'from-red-500/5 to-red-900/10',
      border: 'border-red-500/30',
      icon: 'text-red-400',
      dot: 'bg-red-400'
    },
    warning: {
      bg: 'from-orange-500/5 to-orange-900/10',
      border: 'border-orange-500/30',
      icon: 'text-orange-400',
      dot: 'bg-orange-400'
    },
    info: {
      bg: 'from-blue-500/5 to-blue-900/10',
      border: 'border-blue-500/30',
      icon: 'text-blue-400',
      dot: 'bg-blue-400'
    }
  };

  const config = toastColors[type] || toastColors.success;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle2 size={18} className={config.icon} />;
      case 'error':
        return <AlertCircle size={18} className={config.icon} />;
      case 'warning':
        return <AlertCircle size={18} className={config.icon} />;
      case 'info':
        return <Info size={18} className={config.icon} />;
      default:
        return <CheckCircle2 size={18} className={config.icon} />;
    }
  };

  return (
    <div className={`fixed bottom-4 sm:bottom-8 right-4 sm:right-8 left-4 sm:left-auto z-50 transition-all duration-300 ${isExiting ? 'opacity-0 translate-y-4' : 'animate-fade-in-up'}`}>
      <div className={`glass-iphone flex items-center gap-3 sm:gap-4 rounded-2xl border bg-gradient-to-br ${config.bg} ${config.border} px-4 sm:px-6 py-3 sm:py-4 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-xl`}>
        <div className="relative flex items-center justify-center">
          {getIcon()}
          <div className={`absolute w-2 h-2 rounded-full ${config.dot} animate-pulse`}></div>
        </div>
        <span className="text-sm font-medium text-white flex-1 leading-relaxed">{message}</span>
        <button 
          onClick={() => {
            setIsExiting(true);
            setTimeout(() => onClose(), 300);
          }} 
          className="ml-2 inline-flex items-center justify-center w-6 h-6 rounded-lg text-gray-400 transition hover:text-white hover:bg-white/10 shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}