import { apiRequest } from "./api";
import { setStoredApiKey, clearStoredApiKey } from "./tenantKey";

// REGISTER
export const registerTenant = (payload) => {
  return apiRequest("/tenants/register", "POST", payload).then((data) => {
    if (data?.api_key) {
      setStoredApiKey(data.api_key);
    }
    if (data?.nombre_empresa) {
      localStorage.setItem("tenantName", data.nombre_empresa);
    }
    return data;
  });
};

// LOGIN
export const loginTenant = async (payload) => {
  const data = await apiRequest("/tenants/login", "POST", payload);

  // Guardar token
  localStorage.setItem("token", data.token);
  if (data?.api_key) {
    setStoredApiKey(data.api_key);
  }
  if (data?.empresa?.nombre) {
    localStorage.setItem("tenantName", data.empresa.nombre);
  }

  return data;
};

// LOGOUT
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("tenantName");
  clearStoredApiKey();

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('frogpay:auth-changed'));
  }
};