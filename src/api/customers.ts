import type { PaginatedResponse, Customer, CustomerDetail } from "../types/customer";
import { apiClient } from "./client";

export interface GetCustomersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function getCustomers(params: GetCustomersParams = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.search) query.set("search", params.search);
  query.set("sortBy", params.sortBy ?? "createdAt");
  query.set("sortOrder", params.sortOrder ?? "desc");

  return apiClient<PaginatedResponse<Customer>>(
    `/api/admin/users?${query.toString()}`,
  );
}

export function getCustomerById(id: string) {
  return apiClient<CustomerDetail>(`/api/admin/users/${id}`);
}

export interface VerifyPayload {
  approve: boolean;
  rejectionReason?: string;
}

export function verifyCustomer(id: string, payload: VerifyPayload) {
  return apiClient<CustomerDetail>(`/api/admin/users/${id}/verify`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function blockCustomer(id: string, isBlocked: boolean) {
  return apiClient<unknown>(`/api/admin/users/${id}/block`, {
    method: "PATCH",
    body: JSON.stringify({ isBlocked }),
  });
}

export function restoreCustomer(id: string) {
  return apiClient<unknown>(`/api/admin/users/${id}/restore`, {
    method: "POST",
  });
}

export function deleteCustomer(id: string) {
  return apiClient<unknown>(`/api/admin/users/${id}`, {
    method: "DELETE",
  });
}