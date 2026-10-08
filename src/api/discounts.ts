import type { PaginatedResponse } from "../types/car";
import type { Discount, DiscountStatus } from "../types/discount";
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

export function deleteDiscount(id: number) {
  return apiClient<{ success: boolean }>(`/api/admin/discounts/${id}`, {
    method: "DELETE",
  });
}