import { create } from 'zustand';
import { authService } from '../services/authService';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  
  checkAuth: async () => {
    try {
      set({ isLoading: true });
      const response = await authService.getMe();
      if (response.success && response.data) {
        set({ user: response.data, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (credentials) => {
    const response = await authService.login(credentials);
    if (response.success && response.data?.user) {
      set({ user: response.data.user, isAuthenticated: true });
    }
    return response;
  },

  register: async (data) => {
    const response = await authService.register(data);
    if (response.success && response.data?.user) {
      set({ user: response.data.user, isAuthenticated: true });
    }
    return response;
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  }
}));

// Listen for unauthorized events to automatically logout
if (typeof window !== 'undefined') {
  window.addEventListener('auth:logout', () => {
    useAuthStore.getState().logout();
  });
}
