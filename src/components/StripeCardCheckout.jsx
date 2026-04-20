import { useMemo, useState } from 'react';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

const cardElementOptions = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: 'monospace',
      fontSize: '14px',
      '::placeholder': {
        color: '#6b7280',
      },
    },
    invalid: {
      color: '#f87171',
    },
  },
};

function StripeCardCheckoutForm({ backendUrl, apiKey, amount, currency, onResult }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (!stripe || !elements) {
      setErrorMessage('Stripe aún no está listo.');
      return;
    }

    if (!apiKey) {
      setErrorMessage('No hay API Key del tenant. Inicia sesión nuevamente.');
      return;
    }

    const card = elements.getElement(CardElement);
    if (!card) {
      setErrorMessage('No se pudo inicializar el formulario de tarjeta.');
      return;
    }

    setIsProcessing(true);
    try {
      const paymentMethodResult = await stripe.createPaymentMethod({
        type: 'card',
        card,
      });

      if (paymentMethodResult.error) {
        throw new Error(paymentMethodResult.error.message || 'No se pudo crear el método de pago.');
      }

      const idempotencyKey = `stripe_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const response = await fetch(`${backendUrl}/api/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          provider: 'stripe',
          amount,
          currency,
          description: 'Pago con tarjeta real via Stripe',
          paymentMethodId: paymentMethodResult.paymentMethod.id,
          idempotencyKey,
        }),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload.error || `Error ${response.status}`);
      }

      onResult({
        ok: true,
        message: `Pago aprobado · ${payload.id_transaccion_proveedor || payload.payment_id || ''}`,
      });
    } catch (error) {
      const message = error.message || 'No se pudo completar el pago con Stripe';
      setErrorMessage(message);
      onResult({ ok: false, message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-400">
          Datos de tarjeta
        </label>
        <CardElement options={cardElementOptions} />
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <AlertCircle size={16} /> {errorMessage}
        </div>
      )}

      <button
        type="submit"
        disabled={isProcessing || !stripe}
        className="w-full rounded-xl bg-[#e6ff2a] px-5 py-3 font-black text-[#04181C] transition-all hover:bg-[#b7f758] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isProcessing ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 size={16} className="animate-spin" /> Procesando pago...
          </span>
        ) : (
          `Pagar ${Number(amount).toFixed(2)} ${String(currency || 'USD').toUpperCase()} con Stripe`
        )}
      </button>
    </form>
  );
}

export default function StripeCardCheckout({ backendUrl, apiKey, amount = 50, currency = 'USD', publishableKey, onResult }) {
  const stripePromise = useMemo(() => {
    if (!publishableKey) return null;
    return loadStripe(publishableKey);
  }, [publishableKey]);

  if (!publishableKey) {
    return (
      <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-300">
        Configura STRIPE_PUBLISHABLE_KEY en frontend y backend para habilitar pagos reales con tarjeta.
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <StripeCardCheckoutForm
        backendUrl={backendUrl}
        apiKey={apiKey}
        amount={amount}
        currency={currency}
        onResult={onResult}
      />
    </Elements>
  );
}
