import { apiClient } from "./client";

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  isSuperAdmin: boolean;
}

export function getAdmins() {
  return apiClient<{ data: AdminUser[] }>("/api/admin/auth").then(
    (res) => res.data,
  );
}

export function createAdmin(data: {
  username: string;
  email: string;
  fullName: string;
  password?: string;
}) {
  return apiClient<unknown>("/api/admin/auth/add-user", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
