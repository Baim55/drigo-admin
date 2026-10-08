import type { TripFeeSetting, ExcessKmChargeSetting } from "../types/settings";
import { apiClient } from "./client";

export function getTripFee() {
  return apiClient<TripFeeSetting>("/api/admin/trip-fee");
}

export function updateTripFee(data: Partial<TripFeeSetting>) {
  return apiClient<TripFeeSetting>("/api/admin/trip-fee", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function getExcessKmCharge() {
  return apiClient<ExcessKmChargeSetting>("/api/admin/excess-km-charge");
}

export function updateExcessKmCharge(data: Partial<ExcessKmChargeSetting>) {
  return apiClient<ExcessKmChargeSetting>("/api/admin/excess-km-charge", {
    method: "PUT",
    body: JSON.stringify(data),
  });
}