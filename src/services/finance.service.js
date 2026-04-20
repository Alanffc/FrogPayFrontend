import { apiRequest } from "./api";

export const getKpis = (timeRange) => {
  const token = localStorage.getItem("token");

  return apiRequest(`/finances/kpis?rango=${timeRange}`, "GET", null, token);
};
export const getChart = (timeRange) => {
  const token = localStorage.getItem("token");
  return apiRequest(`/finances/chart?rango=${timeRange}`, "GET", null, token);
};

export const getPayments = async (params = {}) => {
  const token = localStorage.getItem("token");
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      query.set(key, String(value));
    }
  });

  const endpoint = query.toString() ? `/payments?${query.toString()}` : "/payments";
  return apiRequest(endpoint, "GET", null, token);
};

export const getPaymentDetail = async (paymentId) => {
  const token = localStorage.getItem("token");
  return apiRequest(`/payments/${paymentId}`, "GET", null, token);
};
