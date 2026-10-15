import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'trainer' | 'member';
  phone?: string;
  avatar?: string;
  memberId?: string;
  trainerId?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          localStorage.setItem('fm_token', data.token);
          localStorage.setItem('fm_user', JSON.stringify(data.user));
          set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
        } catch (err) {
          set({ isLoading: false });
          throw err;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } catch (_) { }
        localStorage.removeItem('fm_token');
        localStorage.removeItem('fm_user');
        set({ user: null, token: null, isAuthenticated: false });
        window.location.href = '/login';
      },

      checkAuth: async () => {
        const token = localStorage.getItem('fm_token');
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }
        try {
          const { data } = await api.get('/auth/me');
          set({ user: data.user, isAuthenticated: true });
        } catch {
          localStorage.removeItem('fm_token');
          localStorage.removeItem('fm_user');
          set({ user: null, isAuthenticated: false, token: null });
        }
      },

      setUser: (user: User) => set({ user }),
    }),
    {
      name: 'fm_auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
    }
  )
);
