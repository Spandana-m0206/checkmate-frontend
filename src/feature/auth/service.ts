import { apiFetch, type ApiResponse } from "../../services/api";
import type {
  SendOtpResponse,
  VerifyOtpData,
  RegisterData,
} from "./type";

export function sendOtp(email: string) {
  return apiFetch<SendOtpResponse>("/api/v1/auth/send-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function verifyOtp(email: string, otp: string) {
  return apiFetch<ApiResponse<VerifyOtpData>>("/api/v1/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
}

export function register(formData: FormData) {
  return apiFetch<ApiResponse<RegisterData>>("/api/v1/auth/register", {
    method: "POST",
    body: formData,
  });
}

export function logout() {
  return apiFetch<ApiResponse<null>>("/api/v1/auth/logout", {
    method: "POST",
  });
}
