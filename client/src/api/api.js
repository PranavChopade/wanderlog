import axios from 'axios';
import ENV from '../config/ENV.js';

// api instance
const api = axios.create({
  baseURL: ENV.VITE_API_BASE_URL,
  withCredentials: true,
});

// Shared refresh promise so multiple 401s trigger only one refresh call
let refreshPromise = null;

const refreshAccessToken = () => {
  if (!refreshPromise) {
    refreshPromise = api
      .post('/v1/users/refresh-token')
      .catch((error) => {
        throw error;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
};

// Response interceptor — auto-refresh on 401 then retry once
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // Skip auth endpoints (a failed login/refresh must not loop)
    const isAuthRoute = ['/login', '/register', '/refresh-token'].some((p) =>
      original?.url?.includes(p),
    );

    if (error.response?.status === 401 && !original._retry && !isAuthRoute) {
      original._retry = true;
      await refreshAccessToken();
      return api(original);
    }

    return Promise.reject(error);
  },
);

export default api;
