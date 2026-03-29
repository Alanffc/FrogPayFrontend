import React from 'react';

export default function MagneticButton({ children, className, style, onClick }) {
  return (
    <button
      onClick={onClick}
      style={style}
      className={`
        relative overflow-hidden group
        transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
        hover:-translate-y-1 hover:scale-[1.02]
        active:scale-95 active:translate-y-0
        ${className}
      `}
    >
      {/* Efecto de Brillo Interior (Reflejo) */}
      <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
      
      {/* Overlay de luz sutil */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/[0.08] transition-opacity duration-500" />
      
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
}