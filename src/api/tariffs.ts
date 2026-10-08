import type { TariffPackage } from "../types/tariff";
import { apiClient } from "./client";

export function getTariffPackages() {
  return apiClient<TariffPackage[]>("/api/admin/tariff-package");
}

export interface CreateTariffPayload {
  unitCount: number;
  timeUnit: string;
  price: number;
}

export function createTariffPackage(data: CreateTariffPayload) {
  return apiClient<TariffPackage>("/api/admin/tariff-package", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateTariffPackage(
  id: number,
  data: Partial<CreateTariffPayload>,
) {
  return apiClient<TariffPackage>(`/api/admin/tariff-packages/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteTariffPackage(id: number) {
  return apiClient<{ success: boolean }>(`/api/admin/tariff-packages/${id}`, {
    method: "DELETE",
  });
}
