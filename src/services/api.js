const API_URL = "http://localhost:3000/api";

export const apiRequest = async (endpoint, method = "GET", body = null, token = null) => {
  try {
    const res = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...(body && { body: JSON.stringify(body) })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || "Error en la petición");
    }

    return data;

  } catch (error) {
    throw error;
  }
};