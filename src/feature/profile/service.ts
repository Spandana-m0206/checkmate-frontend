import { apiFetch, type ApiResponse } from "../../services/api";
import type { User } from "../auth/type";

export function getMe() {
  return apiFetch<ApiResponse<{ user: User }>>("/api/v1/users/me");
}

export function updateProfile(data: { name?: string; dateOfBirth?: string }) {
  return apiFetch<ApiResponse<{ user: User }>>("/api/v1/users/me", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function uploadProfileImage(file: File) {
  const formData = new FormData();
  formData.append("profileImage", file);
  return apiFetch<ApiResponse<{ user: User }>>("/api/v1/users/me/profile-image", {
    method: "PUT",
    body: formData,
  });
}
