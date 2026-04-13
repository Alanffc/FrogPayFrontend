import { useEffect, useState } from 'react';
import { X, CreditCard, Calendar } from 'lucide-react';

const API_URL = 'http://localhost:3000/api'; 

export default function CardListModal({ isOpen, onClose }) {
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchCards();
    }
  }, [isOpen]);

  const fetchCards = async () => {
    setIsLoading(true);
    setError('');
    
    // 🔐 CORRECCIÓN: Extraemos el token del usuario
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No has iniciado sesión. Por favor, inicia sesión para ver tus tarjetas.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/payments/cards`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // 🔐 CORRECCIÓN: Enviamos el token de autorización
          'Authorization': `Bearer ${token}` 
        }
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al obtener las tarjetas registradas.');
      }

      setCards(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#020607]/80 p-4 backdrop-blur-md transition-opacity">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#04181C] p-6 shadow-2xl">
        
        <div className="mb-6 flex items-center justify-between">
          <h2 className="flex items-center gap-3 text-2xl font-bold text-white">
            <CreditCard className="text-[#e6ff2a]" size={28} />
            Tarjetas Registradas
          </h2>
          <button onClick={onClose} className="rounded-full p-2 text-gray-400 transition hover:bg-white/10 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="custom-scrollbar flex-1 overflow-y-auto pr-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#e6ff2a]/30 border-t-[#e6ff2a]"></div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-center text-red-400">
              {error}
            </div>
          ) : cards.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              No hay tarjetas registradas en esta empresa aún.
            </div>
          ) : (
            <div className="space-y-4">
              {cards.map((card) => (
                <div key={card.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-[#020607] p-5 transition hover:border-[#e6ff2a]/50">
                  <div className="flex items-center gap-5">
                    <div className="flex h-12 w-16 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                       <span className="text-xs font-black uppercase tracking-wider text-white">
                         {card.red}
                       </span>
                    </div>
                    <div>
                      <p className="text-lg font-semibold tracking-widest text-white">
                        •••• {card.ultimos_cuatro}
                      </p>
                      <p className="text-xs text-gray-400">
                        {card.tipo === 'credit' ? 'Tarjeta de Crédito' : 'Tarjeta de Débito'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="flex items-center gap-2 text-xs font-medium text-gray-500">
                      <Calendar size={14} />
                      {new Date(card.creado_en).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}