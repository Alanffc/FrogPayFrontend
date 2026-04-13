export default function CardSummary({ cardType, cardholder, cardNumber }) {
  return (
    <aside className="space-y-6">
      <div className="glass-iphone rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-xl">
        <h2 className="mb-4 text-lg font-bold text-white">Resumen de la tarjeta</h2>
        <div className="space-y-4 text-sm text-gray-300">
          <div className="rounded-2xl border border-white/10 bg-[#020607] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Tipo</p>
            <p className="mt-2 font-semibold text-white">
              {cardType === 'debit' ? 'Tarjeta de débito' : 'Tarjeta de crédito'}
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#020607] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Titular</p>
            <p className="mt-2 font-semibold text-white">{cardholder || 'Nombre de ejemplo'}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-[#020607] p-4">
            <p className="text-xs uppercase tracking-[0.25em] text-gray-500">Número</p>
            <p className="mt-2 font-semibold text-white">{cardNumber || '•••• •••• •••• ••••'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}