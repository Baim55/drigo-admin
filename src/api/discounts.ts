import type { PaginatedResponse } from "../types/car";
import type { Discount, DiscountStatus, DiscountType } from "../types/discount";
import { apiClient } from "./client";

export function getDiscounts() {
  return apiClient<PaginatedResponse<Discount>>("/api/admin/discounts");
}

export function toggleDiscountStatus(id: number, status: DiscountStatus) {
  return apiClient<Discount>(`/api/admin/discounts/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}


export interface DiscountPayload {
  name: string;
  type: DiscountType;
  value: number;
  startDate: string;
  endDate: string;
  usageLimit: number | null;
}

export function createDiscount(data: DiscountPayload) {
  return apiClient<unknown>("/api/admin/discounts", { method: "POST", body: JSON.stringify(data) });
}

export function updateDiscount(id: number, data: Partial<DiscountPayload>) {
  return apiClient<unknown>(`/api/admin/discounts/${id}`, { method: "PUT", body: JSON.stringify(data) });
}

export function deleteDiscount(id: number) {
  return apiClient<{ success: boolean }>(`/api/admin/discounts/${id}`, {
    method: "DELETE",
  });
}