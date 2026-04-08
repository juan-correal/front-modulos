export const API_URL = 'http://localhost:3000/api';

export const fetchAPI = async (endpoint, options = {}) => {
  const finalOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'include' // Envia cookies de sesión automáticamente
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, finalOptions);
    const data = await response.json().catch(() => null);
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    console.error('API Error:', error);
    return { ok: false, status: 500, data: null };
  }
};
