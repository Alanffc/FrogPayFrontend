import React from 'react';

export default function ApiKeys() {
  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="mb-2 text-3xl font-bold text-gray-800">Claves de API</h1>
        <p className="mb-8 text-gray-600">
          Utiliza estas claves para autenticar las peticiones de tus servidores hacia FrogPay. 
          No compartas tus claves secretas en lugares públicos.
        </p>

        {/* Tarjeta de la API Key */}
        <div className="p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">Clave de Producción (Live Key)</h2>
              <p className="text-sm text-gray-500">Úsala para procesar pagos reales.</p>
            </div>
            <span className="px-3 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-full">
              Activa
            </span>
          </div>

          <div className="flex items-center p-3 mb-4 bg-gray-50 border border-gray-200 rounded-lg">
            {/* Se muestra ofuscada por seguridad */}
            <code className="flex-1 text-sm text-gray-700 font-mono">
              fp_live_••••••••••••••••••••••••••••••
            </code>
            <button 
              className="px-4 py-2 text-sm font-medium text-blue-600 transition-colors bg-blue-100 rounded hover:bg-blue-200"
              onClick={() => alert('Para ver la llave completa, debes generar una nueva por seguridad.')}
            >
              Copiar
            </button>
          </div>

          <p className="text-xs text-red-500">
            * Por seguridad, tu clave secreta solo se muestra completa una vez al momento de registrarte. 
            Si la perdiste, debes generar una nueva.
          </p>

          <div className="mt-6 border-t border-gray-100 pt-4">
            <button className="px-4 py-2 text-sm font-medium text-white transition-colors bg-gray-800 rounded-lg hover:bg-black">
              Generar nueva API Key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}