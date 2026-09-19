import type { PaginatedResponse, Car } from "../types/car";
import { apiClient } from "./client";

export interface GetCarsParams {
  page?: number;
  pageSize?: number;
  search?: string;
  isActive?: boolean;
}

export function getCars(params: GetCarsParams = {}) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.search) query.set("search", String(params.search));
  if (params.isActive !== undefined)
    query.set("isActive", String(params.isActive));

  return apiClient<PaginatedResponse<Car>>(
    `/api/admin/cars?${query.toString()}`,
  );
}
