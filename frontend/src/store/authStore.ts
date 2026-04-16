import { create } from 'zustand';

interface User {
  uid: string;
  name: string;
  type: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
  checkAuth: async () => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Includes cookie in cross-origin
      });
      if (res.ok) {
        const data = await res.json();
        set({
          user: { uid: data.user_uid, name: data.name, type: data.user_type },
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (e) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  }
}));
