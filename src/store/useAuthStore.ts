import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../feature/auth/type";

/** "loading" until a persisted token has been validated against the backend. */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  token: string | null;
  user: User | null;
  status: AuthStatus;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      status: "loading",

      setAuth: (token, user) => set({ token, user, status: "authenticated" }),

      clearAuth: () =>
        set({ token: null, user: null, status: "unauthenticated" }),
    }),
    {
      name: "checkmate-auth",
      // Only the token is persisted. The user is re-fetched on every boot so
      // it can never go stale, and `status` must always start as "loading".
      partialize: (state) => ({ token: state.token }),
    },
  ),
);
