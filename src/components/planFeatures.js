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
  { label: 'Soporte estándar',                     freemium: true },
  { label: 'Transacciones ilimitadas',             freemium: false },
  { label: 'Múltiples métodos de pago simultáneos',freemium: false },
  { label: 'Reportes financieros avanzados',       freemium: false },
  { label: 'Gestión de cuentas de cobro',          freemium: false },
  { label: 'Soporte prioritario 24/7',             freemium: false },
  { label: 'SLA garantizado',                      freemium: false },
];
