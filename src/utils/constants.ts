export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

export const TURN_TIMEOUT_MS = Number(
  import.meta.env.VITE_TURN_TIMEOUT_MS || 30000,
);
