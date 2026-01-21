// Configuración de la API
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper para manejar respuestas
async function handleResponse(response) {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Error desconocido' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  return response.json();
}

// Artículos API
export const articlesAPI = {
  // Obtener todos los artículos con paginación
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const response = await fetch(`${API_URL}/articles?${queryString}`);
    return handleResponse(response);
  },

  // Obtener artículos destacados
  getFeatured: async (limit = 3) => {
    const response = await fetch(`${API_URL}/articles/featured?limit=${limit}`);
    return handleResponse(response);
  },

  // Obtener breaking news
  getBreaking: async () => {
    const response = await fetch(`${API_URL}/articles/breaking`);
    return handleResponse(response);
  },

  // Obtener artículos trending
  getTrending: async (limit = 5) => {
    const response = await fetch(`${API_URL}/articles/trending?limit=${limit}`);
    return handleResponse(response);
  },

  // Obtener artículo por ID
  getById: async (id) => {
    const response = await fetch(`${API_URL}/articles/${id}`);
    return handleResponse(response);
  },

  // Obtener artículo por slug
  getBySlug: async (slug) => {
    const response = await fetch(`${API_URL}/articles/slug/${slug}`);
    return handleResponse(response);
  },

  // Crear artículo (requiere autenticación)
  create: async (articleData, token) => {
    const response = await fetch(`${API_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(articleData)
    });
    return handleResponse(response);
  },

  // Actualizar artículo
  update: async (id, articleData, token) => {
    const response = await fetch(`${API_URL}/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(articleData)
    });
    return handleResponse(response);
  },

  // Eliminar artículo
  delete: async (id, token) => {
    const response = await fetch(`${API_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    return handleResponse(response);
  }
};

// Autenticación API
export const authAPI = {
  // Registrar usuario
  register: async (userData) => {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    return handleResponse(response);
  },

  // Iniciar sesión
  login: async (credentials) => {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return handleResponse(response);
  },

  // Obtener usuario actual
  getMe: async (token) => {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return handleResponse(response);
  }
};

// Newsletter API
export const newsletterAPI = {
  // Suscribirse
  subscribe: async (email) => {
    const response = await fetch(`${API_URL}/newsletter/subscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  },

  // Cancelar suscripción
  unsubscribe: async (email) => {
    const response = await fetch(`${API_URL}/newsletter/unsubscribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    return handleResponse(response);
  }
};

