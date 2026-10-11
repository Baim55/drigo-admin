import { apiClient } from "./client";

export interface Promotion {
  id: number;
  title: string;
  description: string;
  actionType: string;
  frequency: string;
  imageUrl: string;
  isActive: boolean;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface PromotionPayload {
  title: string;
  description: string;
  actionType: string;
  frequency: string;
  imageUrl: string;
  startDate: string;
  endDate: string;
}

export function getPromotions() {
  return apiClient<{ data: Promotion[] }>("/api/admin/promotions").then((r) => r.data);
}

export function createPromotion(d: PromotionPayload) {
  return apiClient<unknown>("/api/admin/promotions", { method: "POST", body: JSON.stringify(d) });
}

export function updatePromotion(id: number, d: Partial<PromotionPayload>) {
  return apiClient<unknown>(`/api/admin/promotions/${id}`, { method: "PUT", body: JSON.stringify(d) });
}

export function togglePromotionStatus(id: number, isActive: boolean) {
  return apiClient<unknown>(`/api/admin/promotions/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export function deletePromotion(id: number) {
  return apiClient<unknown>(`/api/admin/promotions/${id}`, { method: "DELETE" });
}