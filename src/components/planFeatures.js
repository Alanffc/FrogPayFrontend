/* src/components/plans/planFeatures.js
 * Fuente única de verdad para las características de cada plan.
 * Importar desde cualquier componente que necesite esta data.
 */
export const PLAN_FEATURES = [
  { label: 'Pagos con tarjeta de crédito/débito', freemium: true },
  { label: 'Pagos QR',                            freemium: true },
  { label: 'Integración PayPal',                  freemium: true },
  { label: 'Webhooks de notificación',             freemium: true },
  { label: 'Panel de finanzas básico',             freemium: true },
  { label: 'API Key de producción',                freemium: true },
  { label: 'Límite de 100 transacciones/mes',      freemium: true },
  { label: 'Límite de USD 50,000/mes',             freemium: true },
  { label: 'Rate limit estándar (20 req/min)',     freemium: true },
  { label: 'Sin límite mensual de transacciones',  freemium: false },
  { label: 'Sin límite mensual de volumen',        freemium: false },
  { label: 'Rate limit premium (80 req/min)',      freemium: false },
  { label: 'Capacidad operativa para alto tráfico',freemium: false },
];
