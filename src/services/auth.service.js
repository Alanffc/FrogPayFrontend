import { apiRequest } from "./api";

// REGISTER
export const registerTenant = (payload) => {
  return apiRequest("/tenants/register", "POST", payload);
};

// LOGIN
export const loginTenant = async (payload) => {
  const data = await apiRequest("/tenants/login", "POST", payload);

  // Guardar token
  localStorage.setItem("token", data.token);

  return data;
};

// LOGOUT
export const logout = () => {
  localStorage.removeItem("token");
};