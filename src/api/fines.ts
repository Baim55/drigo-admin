import type { PaginatedResponse } from "../types/car";
import type { Fine, FineStatus } from "../types/fine";
import { apiClient } from "./client";

export interface GetFinesParams {
  page?: number;
  pageSize?: number;
  status?: FineStatus;
  search?: string;
}

export function getFines(params: GetFinesParams = {}) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.status) query.set("status", params.status);
  if (params.search) query.set("search", params.search);

  return apiClient<PaginatedResponse<Fine>>(
    `/api/admin/manual-fines?${query.toString()}`,
  );
}

export async function getFineById(id: number): Promise<Fine> {
  // Backend has no GET /manual-fines/:id, so we look the fine up in the list.
  // Fines are sorted newest first, so we search a big page.
  const res = await getFines({ page: 1, pageSize: 6000 });
  const fine = res.data.find((f) => f.id === id);
  if (!fine) {
    throw new Error(`Fine #${id} not found`);
  }
  return fine;
}

export function billFineToCustomer(id: number) {
  return apiClient<Fine>(`/api/admin/manual-fines/${id}/bill-customer`, {
    method: "POST",
  });
}

export function billFineToCompany(id: number) {
  return apiClient<Fine>(`/api/admin/manual-fines/${id}/bill-company`, {
    method: "POST",
  });
}

export function dismissFine(id: number) {
  return apiClient<Fine>(`/api/admin/manual-fines/${id}/dismiss`, {
    method: "POST",
  });
}
