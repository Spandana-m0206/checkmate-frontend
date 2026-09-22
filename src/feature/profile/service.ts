import { apiFetch, type ApiResponse } from "../../services/api";
import type { User } from "../auth/type";

export function getMe() {
  return apiFetch<ApiResponse<{ user: User }>>("/api/v1/users/me");
}
