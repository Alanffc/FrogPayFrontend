import { apiRequest } from './api.js';

export const getProviderAccounts = async () => {
  const token = localStorage.getItem('token');
  return apiRequest('/payments/provider-accounts', 'GET', null, token);
};

export const saveProviderAccount = async (provider, payload) => {
  const token = localStorage.getItem('token');
  return apiRequest(`/payments/provider-accounts/${provider}`, 'PUT', payload, token);
};
