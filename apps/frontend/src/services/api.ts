import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true, // Requerido para envío/recepción de cookies HttpOnly
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para capturar expiración de sesión (OWASP #2)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Redirige al login si la sesión caducó o el token no es válido
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);