import type { AdminUser, LoginRequest, VerifyRequest } from "../types/auth";
import { apiClient } from "./client";

export function login(data: LoginRequest) {
  return apiClient<{ message: string }>("/api/admin/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function verifyOtp(data: VerifyRequest) {
  return apiClient<{ message: string }>("/api/admin/auth/verify", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getMe(){
    return apiClient<AdminUser>("/api/admin/auth/me")
}

export function logout() {
  return apiClient<{ success: boolean }>("/api/admin/auth/logout", {
    method: "POST",
  });
}

export function getMyPermissions() {
  return apiClient<string[]>("/api/admin/permissions/my-permissions");
}
