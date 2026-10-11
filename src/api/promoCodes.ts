import { apiClient } from "./client";

export interface PromoCode {
  id: number;
  code: string;
  discountType: string;
  value: number;
  maxRedemptions: number | null;
  redemptionCount: number;
  isActive: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export interface PromoPayload {
  code: string;
  discountType: string;
  value: number;
  maxRedemptions: number | null;
  expiresAt: string | null;
}

export function getPromoCodes() {
  return apiClient<{ data: PromoCode[] }>("/api/admin/promo-codes").then((r) => r.data);
}
export function createPromoCode(d: PromoPayload) {
  return apiClient<unknown>("/api/admin/promo-codes", { method: "POST", body: JSON.stringify(d) });
}
export function updatePromoCode(id: number, d: Partial<PromoPayload>) {
  return apiClient<unknown>(`/api/admin/promo-codes/${id}`, { method: "PUT", body: JSON.stringify(d) });
}
export function togglePromoCode(id: number) {
  return apiClient<unknown>(`/api/admin/promo-codes/${id}/toggle`, { method: "PATCH" });
}
export function deletePromoCode(id: number) {
  return apiClient<unknown>(`/api/admin/promo-codes/${id}`, { method: "DELETE" });
}