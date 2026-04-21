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


export const getDashboard = async (params = {}) => {
  const query = new URLSearchParams(params).toString();

  const res = await fetch(`http://localhost:3000/api/financesdashboards/kpis?${query}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!res.ok) throw new Error('Error cargando dashboard');

  return res.json();
};
export const exportDashboardExcel = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  window.open(`http://localhost:3000/api/financesdashboards/kpis/export/excel?${query}`);
};

export const exportDashboardPDF = (params = {}) => {
  const query = new URLSearchParams(params).toString();
  window.open(`http://localhost:3000/api/financesdashboards/kpis/export/pdf?${query}`);
};