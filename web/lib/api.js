import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json'
  },
  // Don't throw on 4xx/5xx — let callers decide
  validateStatus: (status) => status < 600
});

// Request interceptor — attach JWT silently
api.interceptors.request.use(
  (config) => {
    try {
      const raw = typeof window !== 'undefined'
        ? localStorage.getItem('auth-storage')
        : null;
      if (raw) {
        const authData = JSON.parse(raw);
        if (authData?.state?.accessToken) {
          config.headers.Authorization = `Bearer ${authData.state.accessToken}`;
        }
      }
    } catch {
      // Corrupt localStorage — ignore
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 refresh, reject real errors
api.interceptors.response.use(
  async (response) => {
    // Auto-refresh on 401
    if (response.status === 401 && !response.config._retry) {
      response.config._retry = true;
      try {
        const raw = typeof window !== 'undefined'
          ? localStorage.getItem('auth-storage')
          : null;
        const refreshToken = raw
          ? JSON.parse(raw)?.state?.refreshToken
          : null;

        if (refreshToken) {
          const res = await api.post('/auth/refresh', { refreshToken });
          if (res.status === 200) {
            const { accessToken } = res.data;
            const authStorage = JSON.parse(localStorage.getItem('auth-storage') || '{}');
            authStorage.state.accessToken = accessToken;
            localStorage.setItem('auth-storage', JSON.stringify(authStorage));
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            response.config.headers['Authorization'] = `Bearer ${accessToken}`;
            return api(response.config);
          }
        }
      } catch {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth-storage');
          window.location.href = '/login';
        }
      }
    }

    // Reject 5xx as real errors so callers can catch them
    if (response.status >= 500) {
      return Promise.reject(
        new Error(`Server error ${response.status}: ${response.config.url}`)
      );
    }

    return response;
  },
  // Network errors (API completely offline) — reject quietly
  (error) => {
    if (!error.response) {
      // API is not running — return a fake empty response instead of throwing
      return Promise.resolve({ data: null, status: 0, offline: true });
    }
    return Promise.reject(error);
  }
);

export default api;
