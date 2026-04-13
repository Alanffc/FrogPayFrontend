import { useState } from 'react';
import { CreditCard, List } from 'lucide-react';
import CardForm from '../components/CardForm.jsx';
import CardSummary from '../components/CardSummary.jsx';
import Toast from '../components/Toast.jsx';
import CardListModal from '../components/CardListModal.jsx';

const API_URL = 'http://localhost:3000/api'; 

export default function CardRegistration() {
  const [cardType, setCardType] = useState('debit');
  const [cardholder, setCardholder] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!cardholder.trim() || cardNumber.replace(/\s/g, '').length < 13 || expiry.length !== 5 || cvc.length < 3) {
      setError('Completa todos los campos con información válida.');
      return;
    }

    // 🔐 CORRECCIÓN: Extraemos el token del usuario logueado
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No has iniciado sesión. Por favor, inicia sesión para registrar la tarjeta.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/payments/cards`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ cardType, cardholder, cardNumber, expiry, cvc })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocurrió un error al registrar la tarjeta.');
      }

      setToast({ show: true, message: data.message || 'Tarjeta registrada correctamente.', type: 'success' });
      setCardholder('');
      setCardNumber('');
      setExpiry('');
      setCvc('');
      
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#e6ff2a]/20 bg-[#e6ff2a]/5 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#e6ff2a]">
            <CreditCard size={14} /> Registro de tarjeta
          </div>
          <h1 className="text-4xl font-black tracking-tight text-white">Añade una tarjeta de débito o crédito</h1>
          <p className="max-w-3xl leading-relaxed text-gray-400">
            Registra la tarjeta de tu cliente de forma segura dentro del panel de FrogPay.
          </p>
        </div>

        <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="flex flex-col gap-6">
            <CardForm
              cardType={cardType}
              setCardType={setCardType}
              cardholder={cardholder}
              setCardholder={setCardholder}
              cardNumber={cardNumber}
              setCardNumber={setCardNumber}
              expiry={expiry}
              setExpiry={setExpiry}
              cvc={cvc}
              setCvc={setCvc}
              error={error}
              isLoading={isLoading}
              onSubmit={handleSubmit}
            />

            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex w-full items-center justify-center gap-2 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
            >
              <List size={20} className="text-[#e6ff2a]" />
              Ver tarjetas registradas de esta empresa
            </button>
          </div>

          <CardSummary cardType={cardType} cardholder={cardholder} cardNumber={cardNumber} />
        </div>
      </div>

      <Toast isVisible={toast.show} message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      <CardListModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}