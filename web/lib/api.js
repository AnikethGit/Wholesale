import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-storage') : null;
    if (token) {
      try {
        const authData = JSON.parse(token);
        if (authData.state?.accessToken) {
          config.headers.Authorization = `Bearer ${authData.state.accessToken}`;
        }
      } catch (e) {
        console.error('Error parsing auth token:', e);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = typeof window !== 'undefined' 
          ? JSON.parse(localStorage.getItem('auth-storage') || '{}').state?.refreshToken 
          : null;

        if (refreshToken) {
          const response = await api.post('/auth/refresh', { refreshToken });
          const { accessToken } = response.data;

          // Update token in storage
          const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
          authStorage.state.accessToken = accessToken;
          localStorage.setItem('auth-storage', JSON.stringify(authStorage));

          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
