import type { PaginatedResponse } from "../types/car";
import type {
  SupportTicket,
  SupportStatus,
  SupportMessage,
  SupportContext,
} from "../types/support";
import { apiClient } from "./client";

export interface GetSupportsParams {
  page?: number;
  pageSize?: number;
  status?: SupportStatus;
}

export function getSupports(params: GetSupportsParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.status) query.set("status", params.status);

  return apiClient<PaginatedResponse<SupportTicket>>(
    `/api/admin/supports?${query.toString()}`,
  );
}

export function getSupportMessages(id: number) {
  return apiClient<{ data: SupportMessage[] }>(
    `/api/admin/supports/${id}/messages?pageSize=100`,
  ).then((res) => res.data);
}

export function sendSupportMessage(id: number, message: string) {
  return apiClient<SupportMessage>(`/api/admin/supports/${id}/messages`, {
    method: "POST",
    body: JSON.stringify({ message }),
  });
}

export function updateSupportStatus(id: number, status: SupportStatus) {
  return apiClient<SupportTicket>(`/api/admin/supports/${id}/status`, {
    method: "PUT",
    body: JSON.stringify({ status }),
  });
}

export function getSupportContext(id: number) {
  return apiClient<SupportContext>(`/api/admin/supports/${id}/context`);
}

export function muteSupport(id: number, isMuted: boolean) {
  return apiClient<unknown>(`/api/admin/supports/${id}/mute`, {
    method: "PUT",
    body: JSON.stringify({ isMuted }),
  });
}

export interface AdminUser {
  id: string;
  username: string;
  fullName: string;
  isSuperAdmin: boolean;
}

export function getAdmins() {
  return apiClient<{ data: AdminUser[] }>("/api/admin/auth").then((res) => res.data);
}

export function assignSupport(id: number, operatorId: string) {
  return apiClient<unknown>(`/api/admin/supports/${id}/assign`, {
    method: "PUT",
    body: JSON.stringify({ operatorId }),
  });
}

export function getSupportTicket(id: number) {
  return apiClient<SupportTicket>(`/api/admin/supports/${id}`);
}