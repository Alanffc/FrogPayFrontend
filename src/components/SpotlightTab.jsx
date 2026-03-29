import { useState, useRef } from 'react';

export default function SpotlightTab({ children, isActive, onClick }) {
  const divRef = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <button
      ref={divRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`relative w-full text-left p-6 rounded-3xl transition-all duration-500 overflow-hidden ${
        isActive 
        ? 'bg-[#0c4651]/80 border-transparent shadow-[0_0_30px_rgba(12,70,81,0.5)] scale-[1.02]' 
        : 'bg-white/5 border-transparent hover:bg-white/10'
      }`}
    >
      <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300"
        style={{ opacity, background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(230,255,42,0.1), transparent 40%)` }}
      />
      <div className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 transition duration-300"
        style={{
          opacity,
          background: `radial-gradient(400px circle at ${position.x}px ${position.y}px, rgba(230,255,42,0.4), transparent 40%)`,
          maskImage: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
          WebkitMaskImage: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
          padding: '1px'
        }}
      />
      <div className="relative z-10">{children}</div>
    </button>
  );
}