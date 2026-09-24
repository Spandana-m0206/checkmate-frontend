import { create } from "zustand";
import type { User } from "../feature/auth/type";

// Clean up old localStorage auth data from the previous single-JWT implementation.
// The token now lives in-memory only; the refresh token is an HttpOnly cookie.
localStorage.removeItem("checkmate-auth");

/** "loading" until the refresh-token bootstrap resolves. */
export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  token: string | null;
  user: User | null;
  status: AuthStatus;
  /** Set after login or bootstrap — marks session as fully authenticated. */
  setAuth: (token: string, user: User) => void;
  /** Silent access-token update (e.g. after a refresh). Keeps user & status. */
  setToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  token: null,
  user: null,
  status: "loading",

  setAuth: (token, user) => set({ token, user, status: "authenticated" }),

  setToken: (token) => set({ token }),

  clearAuth: () =>
    set({ token: null, user: null, status: "unauthenticated" }),
}));
