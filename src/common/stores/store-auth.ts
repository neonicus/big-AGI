import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
}

interface AuthStore {
  // state
  user: AuthUser | null;
  idToken: string | null;

  // actions
  setUser: (user: AuthUser | null, idToken: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      idToken: null,

      setUser: (user, idToken) => set({ user, idToken }),
      logout: () => set({ user: null, idToken: null }),
    }),
    {
      name: 'app-auth',
    },
  ),
);

export function getAuthToken(): string | null {
  return useAuthStore.getState().idToken;
}

export function getAuthUserId(): string | null {
  return useAuthStore.getState().user?.id || null;
}
