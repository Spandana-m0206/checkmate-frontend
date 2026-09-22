import { useEffect } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { getMe } from "../feature/profile/service";

/**
 * Resolves the persisted session once, on app start.
 *
 * The token survives a refresh in localStorage but the user does not, so it is
 * re-fetched here. The call doubles as token validation: access tokens last
 * 24h and the backend has no refresh endpoint, so a stored token is often
 * expired by the time the user returns.
 *
 * Any failure clears the session rather than guessing — without a user there
 * is no `_id` for the game and history screens to work from.
 */
export function useAuthBootstrap() {
  useEffect(() => {
    const { token, setAuth, clearAuth } = useAuthStore.getState();

    if (!token) {
      useAuthStore.setState({ status: "unauthenticated" });
      return;
    }

    getMe()
      .then((res) => setAuth(token, res.data.user))
      .catch(() => clearAuth());
  }, []);
}
