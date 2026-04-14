import { apiRequest } from "./api";

export const getKpis = (timeRange) => {
  const token = localStorage.getItem("token");

  return apiRequest(`/finances/kpis?rango=${timeRange}`, "GET", null, token);
};