const API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000/api";
const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT_MS || 12000);

export const apiRequest = async (endpoint, method = "GET", body = null, token = null) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...(body && { body: JSON.stringify(body) })
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(data.error || "Error en la petición");
    }

    return data;

  } catch (error) {
    if (error?.name === 'AbortError') {
      throw new Error('El servidor tardó demasiado en responder. Intenta nuevamente.');
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};