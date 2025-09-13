// src/store/authStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  display_name: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setAccessToken: (accessToken: string) => void;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      login: (user, accessToken) => set({ user, accessToken }),

      logout: () => set({ user: null, accessToken: null }),

      setAccessToken: (accessToken) => set({ accessToken })
    }),
    {
      name: "auth-storage", // localStorage key
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);

export default useAuthStore;
