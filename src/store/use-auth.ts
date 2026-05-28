import { create } from 'zustand';

type User = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  image?: string | null;
} | null;

interface AuthState {
  user: User;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  setUser: (user: User) => void;
  openAuthModal: () => void;
  closeAuthModal: () => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isAuthModalOpen: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  openAuthModal: () => set({ isAuthModalOpen: true }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),

  checkSession: async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Session check failed', error);
    }
  },

  logout: async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      set({ user: null, isAuthenticated: false });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  },
}));
