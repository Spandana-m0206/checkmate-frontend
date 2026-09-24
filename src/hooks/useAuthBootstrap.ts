import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { getMe } from "../feature/profile/service";
import {
  refreshAccessToken,
  scheduleProactiveRefresh,
} from "../services/tokenManager";

/**
 * Resolves the session once, on app start.
 *
 * The access token is in-memory only (lost on reload).  On boot we attempt a
 * silent refresh via the HttpOnly refresh-token cookie.  If the cookie is valid
 * the backend returns a new access token; we store it, fetch the user profile,
 * and mark the session as authenticated.  Any failure lands the user on /auth.
 */
export function useAuthBootstrap() {
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const token = await refreshAccessToken();
        if (cancelled) return;

        if (!token) {
          useAuthStore.getState().clearAuth();
          return;
        }

        // Store the token so apiFetch can use it for the getMe call.
        useAuthStore.getState().setToken(token);

        const res = await getMe();
        if (cancelled) return;

        useAuthStore.getState().setAuth(token, res.data.user);
        scheduleProactiveRefresh(token, handleRefreshed);
      } catch {
        if (!cancelled) {
          useAuthStore.getState().clearAuth();
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);
}

function handleRefreshed(newToken: string) {
  useAuthStore.getState().setToken(newToken);
  scheduleProactiveRefresh(newToken, handleRefreshed);
}
