import type { PaginatedResponse } from "../types/car";
import type { Accident, AccidentStatus, FaultParty } from "../types/accident";
import { apiClient } from "./client";

export function getAccidents(
  params: { page?: number; pageSize?: number; status?: AccidentStatus } = {},
) {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("pageSize", String(params.pageSize));
  if (params.status) query.set("status", params.status);
  return apiClient<PaginatedResponse<Accident>>(
    `/api/admin/accidents?${query.toString()}`,
  );
}

export interface CreateAccidentPayload {
  rentalId: number;
  faultParty: FaultParty;
  description: string;
  estimatedCost: number;
  location: string;
}

export function createAccident(data: CreateAccidentPayload) {
  return apiClient<unknown>("/api/admin/accidents", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAccident(
  id: number,
  data: Partial<{
    status: AccidentStatus;
    faultParty: FaultParty;
    description: string;
    estimatedCost: number;
    location: string;
  }>,
) {
  return apiClient<unknown>(`/api/admin/accidents/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteAccident(id: number) {
  return apiClient<unknown>(`/api/admin/accidents/${id}`, { method: "DELETE" });
}
