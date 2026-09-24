import { API_BASE_URL } from "../utils/constants";

/**
 * Manages access-token refresh with single-flight deduplication and proactive
 * scheduling. The refresh token itself lives in an HttpOnly cookie — this
 * module never touches it directly.
 */

// --- Single-flight refresh ---------------------------------------------------

let refreshPromise: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/refresh-token`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) return null;

  const json = await res.json();
  return json.data?.accessToken ?? null;
}

/**
 * Obtain a fresh access token from the backend.
 *
 * Concurrent callers share one in-flight request (single-flight).  Returns the
 * new access token on success, or `null` if the refresh cookie is missing /
 * expired.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = doRefresh().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

// --- Proactive refresh -------------------------------------------------------

let proactiveTimer: ReturnType<typeof setTimeout> | null = null;

/** Minimum remaining lifetime (ms) before we trigger a proactive refresh. */
const REFRESH_AHEAD_MS = 5 * 60 * 1000; // 5 minutes

function decodeExp(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload));
    return typeof json.exp === "number" ? json.exp : null;
  } catch {
    return null;
  }
}

/**
 * Schedule a proactive refresh ~5 min before the given access token expires.
 *
 * When the timer fires it refreshes the token, updates the auth store, and
 * reschedules itself for the new token.
 *
 * @param onRefreshed — callback invoked with the new access token so the
 *   caller can persist it in the auth store and reschedule.  Keeping the store
 *   import out of this module avoids a circular dependency.
 */
export function scheduleProactiveRefresh(
  token: string,
  onRefreshed: (newToken: string) => void,
) {
  clearProactiveRefresh();

  const exp = decodeExp(token);
  if (exp === null) return;

  const expiresAt = exp * 1000;
  const delay = expiresAt - Date.now() - REFRESH_AHEAD_MS;

  if (delay <= 0) {
    // Already within the refresh window — fire immediately.
    fireProactiveRefresh(onRefreshed);
    return;
  }

  proactiveTimer = setTimeout(() => fireProactiveRefresh(onRefreshed), delay);
}

async function fireProactiveRefresh(
  onRefreshed: (newToken: string) => void,
) {
  const newToken = await refreshAccessToken();
  if (newToken) {
    onRefreshed(newToken);
  } else {
    // Refresh failed — the 401 interceptor or next API call will handle it.
    // We intentionally do NOT clearAuth here to avoid a jarring redirect while
    // the user may still have a few minutes of access-token life left.
  }
}

export function clearProactiveRefresh() {
  if (proactiveTimer) {
    clearTimeout(proactiveTimer);
    proactiveTimer = null;
  }
}
