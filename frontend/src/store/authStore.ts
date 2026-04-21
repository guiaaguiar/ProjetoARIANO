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
  setCachedMatches: (matches: any[]) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
  cachedMatches: any[];
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  cachedMatches: [],
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  setCachedMatches: (matches) => set({ cachedMatches: matches }),
  logout: () => set({ user: null, isAuthenticated: false, isLoading: false, cachedMatches: [] }),
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
