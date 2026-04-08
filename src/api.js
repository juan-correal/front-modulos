export const API_URL = 'http://localhost:3000/api';

export const fetchAPI = async (endpoint, options = {}) => {
  const finalOptions = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    credentials: 'include'
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, finalOptions);
    const body = await response.json().catch(() => null);
    return {
      ok: response.ok,
      status: response.status,
      data: body?.data ?? body,   // ← extrae el array directamente
      message: body?.message
    };
  } catch (error) {
    console.error('API Error:', error);
    return { ok: false, status: 500, data: null, message: error.message };
  }
};