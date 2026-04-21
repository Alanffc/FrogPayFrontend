import { apiRequest } from './api.js';

/**
 * Obtiene la información actual del tenant autenticado, incluyendo su plan.
 */
export const getTenantMe = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay sesión activa.');
  return apiRequest('/tenants/me', 'GET', null, token);
};

/**
 * Solicita el upgrade del plan a PREMIUM.
 */
export const upgradePlan = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay sesión activa.');
  return apiRequest('/tenants/upgrade', 'PUT', null, token);
};

/**
 * Solicita el downgrade del plan a FREEMIUM.
 */
export const downgradePlan = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay sesión activa.');
  return apiRequest('/tenants/downgrade', 'PUT', null, token);
};

/**
 * Obtiene el uso de transacciones del tenant (útil para FREEMIUM).
 */
export const getTenantUsage = async () => {
  const token = localStorage.getItem('token');
  if (!token) throw new Error('No hay sesión activa.');
  return apiRequest('/tenants/usage', 'GET', null, token);
};
