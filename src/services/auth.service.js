import { apiRequest } from "./api";

// REGISTER
export const registerTenant = (payload) => {
  return apiRequest("/tenants/register", "POST", payload).then((data) => {
    if (data?.api_key) {
      localStorage.setItem('api_key', data.api_key);
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
    localStorage.setItem('api_key', data.api_key);
  }

  return data;
};

// LOGOUT
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem('api_key');
};