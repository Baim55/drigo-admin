import type { PaginatedResponse, Car, CarDetail, CarTrackingItem } from "../types/car";
import { apiClient } from "./client";

export interface GetCarsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export function getCars(params: GetCarsParams = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.search) query.set("search", String(params.search));
  if (params.isActive !== undefined)
    query.set("isActive", String(params.isActive));
  query.set("sortBy", params.sortBy ?? "id");
  query.set("sortOrder", params.sortOrder ?? "asc");
  return apiClient<PaginatedResponse<Car>>(
    `/api/admin/cars?${query.toString()}`,
  );
}

export function getCarById(id: number) {
  return apiClient<CarDetail>(`/api/admin/cars/${id}`);
}

export function updateCar(id: number, data: Partial<CarDetail>) {
  return apiClient<CarDetail>(`/api/admin/cars/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteCar(id: number) {
  return apiClient<{ success: boolean }>(`/api/admin/cars/${id}`, {
    method: "DELETE",
  });
}

export function toggleCarActive(id: number) {
  return apiClient<Car>(`/api/admin/cars/${id}/toggle-active`);
}

export function getCarsTracking() {
  return apiClient<CarTrackingItem[]>("/api/admin/cars/tracking");
}