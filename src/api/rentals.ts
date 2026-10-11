import type { PaginatedResponse, Rental, RentalDetail, RentalStatus } from "../types/rental";
import { apiClient } from "./client";

export interface GetRentalsParams {
  page?: number;
  pageSize?: number;
  status?: RentalStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function getRentals(params: GetRentalsParams = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);
  query.set("sortBy", params.sortBy ?? "startDate");
  query.set("sortOrder", params.sortOrder ?? "desc");

  return apiClient<PaginatedResponse<Rental>>(
    `/api/admin/rentals?${query.toString()}`,
  );
}

export function getRentalById(id: number) {
  return apiClient<RentalDetail>(`/api/admin/rentals/${id}`);
}

export function endRental(id: number) {
  return apiClient<RentalDetail>(`/api/admin/rentals/${id}/end`);
}

export function compKm(id: number, km: number) {
  return apiClient<unknown>(`/api/admin/rentals/${id}/comp-km`, {
    method: "POST",
    body: JSON.stringify({ km }),
  });
}