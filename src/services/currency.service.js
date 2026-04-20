import { apiRequest } from './api.js';

export const getCurrencyConfig = async () => {
  const token = localStorage.getItem('token');
  return apiRequest('/payments/currency-config', 'GET', null, token);
};

export const saveCurrencyConfig = async (currency) => {
  const token = localStorage.getItem('token');
  return apiRequest('/payments/currency-config', 'PUT', { currency }, token);
};