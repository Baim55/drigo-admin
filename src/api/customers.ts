import type { PaginatedResponse, Customer } from "../types/customer";
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
  return apiClient<Customer>(`/api/admin/users/${id}`);
}
