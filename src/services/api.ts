import { API_BASE_URL } from "../utils/constants";
import { useAuthStore } from "../store/useAuthStore";
import {
  refreshAccessToken,
  scheduleProactiveRefresh,
} from "./tokenManager";

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  return doFetch<T>(path, options, false);
}

// ---- helpers shared by proactive refresh callback ---------------------------

function handleRefreshedToken(newToken: string) {
  const store = useAuthStore.getState();
  store.setToken(newToken);
  scheduleProactiveRefresh(newToken, handleRefreshedToken);
}

// ---- internal fetch with single-retry on 401 --------------------------------

async function doFetch<T>(
  path: string,
  options: RequestInit,
  isRetry: boolean,
): Promise<T> {
  const token = useAuthStore.getState().token;
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Don't set Content-Type for FormData — browser sets it with boundary
  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // --- 401 refresh-and-retry (once) -----------------------------------------
  if (response.status === 401 && !isRetry && token) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      handleRefreshedToken(newToken);
      return doFetch<T>(path, options, true);
    }
    useAuthStore.getState().clearAuth();
    throw new ApiError(401, "Session expired");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, data.message || "Something went wrong");
  }

  return data as T;
}
