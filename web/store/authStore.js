import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '@/lib/api';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      // Register
      register: async (email, password, firstName, lastName) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/register', {
            email,
            password,
            first_name: firstName,
            last_name: lastName
          });

          set({
            user: response.data.user,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            isAuthenticated: true
          });

          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
          return response.data;
        } catch (error) {
          const message = error.response?.data?.message || 'Registration failed';
          set({ error: message });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Login
      login: async (email, password) => {
        set({ loading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });

          set({
            user: response.data.user,
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken,
            isAuthenticated: true
          });

          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
          return response.data;
        } catch (error) {
          const message = error.response?.data?.message || 'Login failed';
          set({ error: message });
          throw error;
        } finally {
          set({ loading: false });
        }
      },

      // Refresh token
      refreshAccessToken: async () => {
        try {
          const refreshToken = get().refreshToken;
          if (!refreshToken) return false;

          const response = await api.post('/auth/refresh', { refreshToken });

          set({
            accessToken: response.data.accessToken,
            refreshToken: response.data.refreshToken
          });

          api.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
          return true;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      // Get current user
      fetchUser: async () => {
        set({ loading: true });
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.user });
          return response.data.user;
        } catch (error) {
          console.error('Failed to fetch user:', error);
        } finally {
          set({ loading: false });
        }
      },

      // Logout
      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false
          });
          delete api.defaults.headers.common['Authorization'];
        }
      },

      // Set authentication from storage
      hydrate: () => {
        const stored = useAuthStore.getState();
        if (stored.accessToken) {
          api.defaults.headers.common['Authorization'] = `Bearer ${stored.accessToken}`;
          set({ isAuthenticated: true });
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => typeof window !== 'undefined' ? localStorage : null),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;
